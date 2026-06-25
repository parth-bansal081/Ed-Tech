import os
import traceback
import time
from celery import states
from celery.exceptions import Ignore

from celery_app import app
from master_extractor import unified_extract_text as extract_text_from_document
from reading_simplifier import simplify_text_cognitive
from translation_auditor import audit_translation_logic
from services.openai_service import translate_text, break_into_topics, synthesize_visual_notes
from services.supabase_service import update_document_status, create_topic, fetch_document, supabase_request
from video_processor import download_youtube_video_and_audio, extract_video_frames

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
            video_path, audio_path = download_youtube_video_and_audio(youtube_url)
            if not audio_path or not os.path.exists(audio_path):
                raise Exception("Failed to download YouTube audio stream.")
            
            # Transcribe with Whisper
            model = get_whisper_model()
            segments, info = model.transcribe(audio_path, beam_size=3)
            words = []
            for segment in segments:
                words.append(segment.text)
            flat_transcript = " ".join(words).strip()
            
            # Extract video frames
            keyframes = []
            if video_path and os.path.exists(video_path):
                print(f"[Celery Ingestion] Extracting visual frames from: {video_path}")
                keyframes = extract_video_frames(video_path, num_frames=6)
                
            # Synthesize Visual + Audio Notes
            print("[Celery Ingestion] Running combined Audio-Visual synthesis...")
            raw_text = synthesize_visual_notes(flat_transcript, keyframes)
            
            # Housekeeping
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)
            if video_path and os.path.exists(video_path):
                os.remove(video_path)
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
        
        # Step 2.5: Cognitive Simplification (Phase 4 Integration)
        # Fetch user profile to check reading level override and disabilities
        tier_to_apply = None
        try:
            doc = fetch_document(document_id, user_token=user_token)
            if doc and doc.get("owner_id"):
                owner_id = doc["owner_id"]
                prof_data = supabase_request("GET", f"profiles?id=eq.{owner_id}", user_token=user_token)
                if prof_data and isinstance(prof_data, list) and len(prof_data) > 0:
                    profile = prof_data[0]
                    override = profile.get("reading_level_override")
                    disabilities = profile.get("disabilities", [])
                    
                    # Precedence: override > disabilities > none
                    if override and override != 'default':
                        if override == 'simplified':
                            tier_to_apply = 'simplified'
                        elif override == 'detailed':
                            tier_to_apply = None # skip simplification
                    else:
                        # Fallback to disability default
                        if any(d in disabilities for d in ['dyslexia', 'adhd']):
                            tier_to_apply = 'simplified'
        except Exception as e:
            print(f"[Celery Ingestion Error] Failed to resolve simplification tier: {e}")

        if tier_to_apply:
            print(f"[Celery Ingestion] Applying cognitive simplification tier '{tier_to_apply}'...")
            simplified_res = simplify_text_cognitive(translated_text, tier_to_apply)
            translated_text = simplified_res.get("adapted_markdown", translated_text)
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
