import os
import traceback
import time
from celery import states
from celery.exceptions import Ignore

from celery_app import app
from master_extractor import unified_extract_text as extract_text_from_document
from reading_simplifier import simplify_text_cognitive
from translation_auditor import audit_translation_logic
from services.openai_service import translate_text, break_into_topics
from services.supabase_service import update_document_status, create_topic
from video_processor import download_youtube_audio

# Lazy initialized Whisper model for worker transcription
whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        print("[Celery Worker] Loading Whisper model on CPU/int8...")
        from faster_whisper import WhisperModel
        whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    return whisper_model

@app.task(
    bind=True,
    name="tasks.async_document_ingestion_pipeline",
    max_retries=1,
    default_retry_delay=10
)
def async_document_ingestion_pipeline(self, document_id: str, file_path: str = None, youtube_url: str = None, target_lang: str = "English", user_token: str = None) -> dict:
    """
    Master Ingestion Pipeline running asynchronously in Celery:
    1. Ingestion: Programmatic or GPT-4o Vision extraction, or YouTube audio download & Whisper transcribe.
    2. Translation: Uses GPT-4 to translate raw text while keeping LaTeX intact.
    3. Audit: Runs GPT-4 translation logical audits to flag math or causal anomalies.
    4. Explanations: Breaks translated text into modular sub-topics and inserts into DB.
    """
    print(f"[Celery Ingestion] Starting pipeline for Document ID: {document_id}")
    
    try:
        # Step 1: Extraction
        update_document_status(document_id, "extracting", user_token=user_token)
        raw_text = ""
        
        if file_path:
            print(f"[Celery Ingestion] Parsing file: {file_path}")
            extract_res = extract_text_from_document(file_path)
            if extract_res.get("status") == "error":
                raise Exception(extract_res.get("text", "File extraction failed."))
            raw_text = extract_res.get("text", "")
        elif youtube_url:
            print(f"[Celery Ingestion] Processing YouTube URL: {youtube_url}")
            audio_path = download_youtube_audio(youtube_url)
            if not audio_path or not os.path.exists(audio_path):
                raise Exception("Failed to download YouTube audio stream.")
            
            # Transcribe with Whisper
            model = get_whisper_model()
            segments, info = model.transcribe(audio_path, beam_size=3)
            words = []
            for segment in segments:
                words.append(segment.text)
            raw_text = " ".join(words).strip()
            
            # Housekeeping
            if os.path.exists(audio_path):
                os.remove(audio_path)
        else:
            raise Exception("Neither file_path nor youtube_url was provided.")
            
        if not raw_text:
            raise Exception("Extracted text content is empty.")
            
        update_document_status(document_id, "extracting", {"raw_text": raw_text}, user_token=user_token)
        
        # Step 2: Translation
        update_document_status(document_id, "translating", user_token=user_token)
        translated_text = raw_text
        # We do translation if target language is different from English (assuming default source is English/auto)
        if target_lang.lower() not in ("english", "en"):
            print(f"[Celery Ingestion] Translating content to {target_lang}...")
            translated_text = translate_text(raw_text, target_lang)
            
        update_document_status(document_id, "translating", {"translated_text": translated_text}, user_token=user_token)
        
        # Step 3: Logic/Translation Audit
        update_document_status(document_id, "auditing", user_token=user_token)
        audit_res = audit_translation_logic(raw_text, translated_text)
        
        warnings_payload = audit_res.get("warnings", [])
        
        update_document_status(document_id, "auditing", {"audit_warnings": {"warnings": warnings_payload}}, user_token=user_token)
        
        # Step 4: AI Explanations & Topics breakdown
        print("[Celery Ingestion] Generating sub-topic explanations...")
        topics = break_into_topics(translated_text)
        
        for idx, topic in enumerate(topics):
            title = topic.get("title", f"Section {idx+1}")
            explanation = topic.get("explanation", "")
            query = topic.get("image_query", "study")
            # Create a simple placeholder image seed url based on the image_query
            image_url = f"https://picsum.photos/seed/{query.replace(' ', '_')}/400/300"
            
            create_topic(
                document_id=document_id,
                order_index=idx,
                title=title,
                explanation=explanation,
                image_query=query,
                image_url=image_url,
                user_token=user_token
            )
            
        # Step 5: Complete
        update_document_status(document_id, "ready", user_token=user_token)
        print(f"[Celery Ingestion] Document {document_id} is marked READY.")
        return {"status": "success", "document_id": document_id}
        
    except Exception as exc:
        error_trace = traceback.format_exc()
        print(f"[Celery Ingestion CRASH] Document {document_id} failed:\n{error_trace}")
        update_document_status(document_id, "failed", user_token=user_token)
        self.update_state(
            state=states.FAILURE,
            meta={
                "status": "error",
                "document_id": document_id,
                "error": str(exc),
                "trace": error_trace
            }
        )
        raise Ignore()

@app.task(
    bind=True,
    name="tasks.async_cognitive_simplification_task",
    max_retries=2,
    default_retry_delay=5
)
def async_cognitive_simplification_task(self, markdown_text: str, tier: str) -> dict:
    """
    Cognitive simplification running in background Celery task.
    """
    print(f"[Celery Worker] async_cognitive_simplification_task: Tier '{tier}'")
    try:
        result = simplify_text_cognitive(markdown_text, tier)
        return result
    except Exception as exc:
        error_trace = traceback.format_exc()
        self.update_state(
            state=states.FAILURE,
            meta={"status": "error", "error": str(exc), "trace": error_trace}
        )
        raise Ignore()
