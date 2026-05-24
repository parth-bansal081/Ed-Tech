from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

# Import your real localized video processing pipeline modules
from video_processor import download_youtube_audio, synthesize_chapters_into_notes
from master_extractor import unified_extract_text
from reading_simplifier import simplify_text_cognitive

# 🔊 Initialize the local speech-to-text Whisper Engine globally at startup
from faster_whisper import WhisperModel
print("[Local Engine] Initializing OpenAI Whisper audio decoder on local hardware...")
# Using the 'base' model parameters for a sweet-spot balance of extraction speed and language precision
whisper_engine = WhisperModel("base", device="cpu", compute_type="int8")

app = FastAPI(title="AeroLearn Core Engine API")

# Broaden CORS to safely allow React development servers running on ports 3000-3006
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
        "http://localhost:3003", "http://localhost:3004", "http://localhost:3005",
        "http://localhost:3006", "http://127.0.0.1:3000", "http://127.0.0.1:3001",
        "http://127.0.0.1:3002", "http://127.0.0.1:3003", "http://127.0.0.1:3004",
        "http://127.0.0.1:3005", "http://127.0.0.1:3006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema binding for incoming YouTube links
class YouTubeRequest(BaseModel):
    video_url: str

@app.get("/")
def read_root():
    return {
        "status": "online",
        "engine": "AeroLearn Local AI Core API Service",
        "message": "Welcome to AeroLearn! Active Local AI Endpoints: /api/health, /api/process-video"
    }

@app.get("/api/health")
def health_check():
    return {"status": "online", "engine": "AeroLearn Local AI Core"}

# 🎬 BRIDGE 1: 100% Local Video Ingestion Endpoint
@app.post("/api/process-video")
async def process_youtube_lecture(payload: YouTubeRequest):
    try:
        url = payload.video_url
        if not url:
            raise HTTPException(status_code=400, detail="Missing target URL parameter.")
        
        print(f"\n[Local Engine] Initiating fully offline ingestion sequence for link: {url}")
        
        # 1. Download YouTube Audio via local yt-dlp layer
        audio_filepath = download_youtube_audio(url)
        if not audio_filepath or not os.path.exists(audio_filepath):
            raise Exception("Local media file system failed to download or expose audio stream track.")
            
        # 2. Extract Spoken Speech Locally via Whisper Engine
        print(f"[Local Engine] Audio track buffered locally at: {audio_filepath}")
        print("[Local Engine] Running Whisper neural decoding layers (Audio -> Text Transcription)...")
        
        segments, info = whisper_engine.transcribe(audio_filepath, beam_size=5)
        
        # Aggregate the iterator stream of tokens into one clean text string
        compiled_speech_segments = []
        for segment in segments:
            compiled_speech_segments.append(segment.text)
            
        full_transcript = " ".join(compiled_speech_segments).strip()
        
        if not full_transcript:
            raise Exception("Local Whisper transcription matrix pass completed but returned a zero-byte context payload.")
            
        print(f"[Local Engine] Transcription locked! Successfully scraped {len(full_transcript)} characters of spoken text data.")
        
        # 3. Model Variable Mapping: Construct the payload structural layout for your synthesis prompt
        # We replace the static fallback fake text string with the dynamic full_transcript variable!
        local_chapters_payload = [
            {
                "start_time_ms": 0,
                "end_time_ms": int(info.duration * 1000),
                "headline": "Comprehensive Lecture Content Audio Stream",
                "summary": full_transcript  # <--- REAL lecture words go directly to the model here!
            }
        ]
            
        # 4. Synthesize notes using local Ollama model (Qwen2.5-VL)
        print("[Local Engine] Injecting real transcript stream context directly into Ollama execution pipelines...")
        adapted_notes = synthesize_chapters_into_notes(local_chapters_payload)
        
        # Extract an aesthetic identifier string from the URL for clean titles
        video_id = url.split('v=')[-1].split('&')[0] if 'v=' in url else "Asset-Core"
        dynamic_title = f"Local Lecture Synthesis ({video_id})"
        
        # Housekeeping: Purge heavy downloaded temporary .mp3 audio assets from your hard drive
        if os.path.exists(audio_filepath):
            os.remove(audio_filepath)
            print("[Local Engine] Temporary local audio file cleared out safely from hardware disk.")
        
        return {
            "status": "success",
            "message": "Media pipeline completed parsing 100% locally via Whisper + Qwen.",
            "data": {
                "title": dynamic_title,
                "adapted_markdown": adapted_notes  # <--- Real friendly compiled Markdown returned here!
            }
        }
    except Exception as e:
        print(f"[Engine Error] Exception in local process-video execution tree: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 📁 BRIDGE 2: Document Processing Lab Endpoint
@app.post("/api/process-document")
async def process_academic_document(
    file: UploadFile = File(...), 
    userId: str = Form(...)
):
    try:
        upload_dir = "./temp_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"[Engine] Shipping file path to master_extractor.py for processing: {file_path}")
        
        # 1. Run master text extraction (native pdfplumber parser with Qwen2.5-VL OCR fallback)
        extraction_res = unified_extract_text(file_path)
        if extraction_res["status"] != "success":
            raise Exception(extraction_res.get("text", "Document text extraction failed."))
            
        raw_text = extraction_res["text"]
        print(f"[Engine] Extracted {len(raw_text)} characters from document. Running cognitive simplification...")
        
        # 2. Synthesize using the local Ollama Qwen2.5-VL cognitive simplifier (defaulting to simplified tier)
        simplification_res = simplify_text_cognitive(raw_text, "simplified")
        adapted_notes = simplification_res.get("adapted_markdown", "")
        
        # Housekeeping: Purge heavy uploaded temporary file assets safely
        if os.path.exists(file_path):
            os.remove(file_path)
            print("[Engine] Temporary uploaded document cleared out safely from hardware disk.")
            
        return {
            "status": "success",
            "filename": file.filename,
            "data": {
                "adapted_markdown": adapted_notes
            }
        }
    except Exception as e:
        print(f"[Engine Error] Exception in local process-document execution tree: {e}")
        # Clean up temp file on error too
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))