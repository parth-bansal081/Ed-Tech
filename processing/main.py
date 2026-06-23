from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import uuid
import json
import tempfile
import subprocess
import numpy as np
import scipy.io.wavfile as wavfile
import noisereduce as nr
import redis

# Import services & components
from services.openai_service import break_into_topics, translate_text
from services.elevenlabs_service import stream_text_to_speech
from services.supabase_service import fetch_document, update_document_status, supabase_request
from routes.translation import router as translation_router
from tasks import async_document_ingestion_pipeline

# 🔊 Initialize the local speech-to-text Whisper Engine globally at startup
from faster_whisper import WhisperModel
print("[Local Engine] Initializing OpenAI Whisper audio decoder on local hardware...")
whisper_engine = WhisperModel("base", device="cpu", compute_type="int8")

# Configure Redis for narration sessions
redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.from_url(redis_url)
    redis_client.ping()
    print("[Redis] Successfully connected to message broker/session store.")
except Exception as e:
    print(f"[Redis Warning] Local Redis connection failed: {e}. Narration sessions will use in-memory dictionary.")
    redis_client = None

# Ephemeral state fallback if Redis is down
in_memory_sessions = {}

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

# Include the translation router from routes/translation.py
app.include_router(translation_router)

# Request schemas
class YouTubeIngestRequest(BaseModel):
    document_id: str
    youtube_url: str
    target_lang: str = "English"

class TopicsBreakdownRequest(BaseModel):
    text: str

class NarrateRequest(BaseModel):
    text: str
    voice_id: str = None

class SpeakRequest(BaseModel):
    text: str
    voice_id: str = None

class NarrationStartRequest(BaseModel):
    document_id: str
    total_topics: int

class HivePublishRequest(BaseModel):
    document_id: str
    visible_to_disabilities: list = []
    visible_to_languages: list = []

class HiveReportRequest(BaseModel):
    reason: str

@app.get("/")
def read_root():
    return {
        "status": "online",
        "engine": "AeroLearn AI Core API Service",
        "message": "Welcome to AeroLearn Core AI service."
    }

@app.get("/api/health")
def health_check():
    return {"status": "online", "engine": "AeroLearn Core"}

# 📁 API Endpoint: File Upload Ingestion Trigger
@app.post("/documents/upload")
async def upload_document_api(
    document_id: str = Form(...),
    target_lang: str = Form("English"),
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    try:
        upload_dir = "./temp_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        temp_file_path = os.path.join(upload_dir, f"{uuid.uuid4()}_{file.filename}")
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"[API] File received. Kicking off Celery Ingestion pipeline for ID: {document_id}")
        
        # Enqueue background task
        async_document_ingestion_pipeline.delay(
            document_id=document_id,
            file_path=temp_file_path,
            target_lang=target_lang,
            user_token=authorization
        )
        
        return {
            "status": "accepted",
            "message": "Ingestion task queued in Celery.",
            "document_id": document_id
        }
    except Exception as e:
        print(f"[API Error] Failed to queue document upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 📁 API Endpoint: YouTube link Ingestion Trigger
@app.post("/documents/youtube")
async def youtube_ingest_api(payload: YouTubeIngestRequest, authorization: str = Header(None)):
    try:
        print(f"[API] YouTube link received. Kicking off Celery Ingestion pipeline for ID: {payload.document_id}")
        
        # Enqueue background task
        async_document_ingestion_pipeline.delay(
            document_id=payload.document_id,
            youtube_url=payload.youtube_url,
            target_lang=payload.target_lang,
            user_token=authorization
        )
        
        return {
            "status": "accepted",
            "message": "Ingestion task queued in Celery.",
            "document_id": payload.document_id
        }
    except Exception as e:
        print(f"[API Error] Failed to queue YouTube ingest: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 📁 API Endpoint: Ingestion Status Poller
@app.get("/documents/{document_id}/status")
async def get_document_status_api(document_id: str, authorization: str = Header(None)):
    doc = fetch_document(document_id, user_token=authorization)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"document_id": document_id, "status": doc.get("status")}

# 📁 API Endpoint: Generate Topic Explanations Breakdown
@app.post("/topics/breakdown")
async def topics_breakdown_api(payload: TopicsBreakdownRequest):
    topics = break_into_topics(payload.text)
    return {"topics": topics}

# 📁 API Endpoint: Generate ElevenLabs Audio for One Topic
@app.post("/topics/narrate")
async def topics_narrate_api(payload: NarrateRequest):
    try:
        return stream_text_to_speech(payload.text, payload.voice_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📁 API Endpoint: General-purpose TTS Speech Stream
@app.post("/audio/speak")
async def audio_speak_api(payload: SpeakRequest):
    try:
        return stream_text_to_speech(payload.text, payload.voice_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔊 continuous mic websocket voice-command parser Helper
async def process_audio_chunk(audio_bytes: bytearray) -> str:
    if not audio_bytes or len(audio_bytes) < 1000:
        return ""
        
    # Write to temporary file
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_input:
        temp_input.write(audio_bytes)
        input_path = temp_input.name
        
    output_path = input_path.replace(".webm", ".wav")
    reduced_path = input_path.replace(".webm", "_reduced.wav")
    
    try:
        # Convert webm to 16kHz mono wav using ffmpeg
        cmd = ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path]
        result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
        
        decode_target = input_path # default fallback
        
        if result.returncode == 0 and os.path.exists(output_path):
            try:
                rate, data = wavfile.read(output_path)
                
                # Normalize float32
                if data.dtype == np.int16:
                    data = data.astype(np.float32) / 32768.0
                elif data.dtype == np.int32:
                    data = data.astype(np.float32) / 2147483648.0
                
                # Spectral gating noise reduction
                reduced_data = nr.reduce_noise(y=data, sr=rate, prop_decrease=0.8)
                
                # Write back wav
                reduced_data_int16 = (reduced_data * 32767.0).astype(np.int16)
                wavfile.write(reduced_path, rate, reduced_data_int16)
                
                if os.path.exists(reduced_path):
                    decode_target = reduced_path
                else:
                    decode_target = output_path
            except Exception as noise_err:
                print(f"[WS Audio] Noise reduction bypassed: {noise_err}")
                decode_target = output_path
                
        # Run local faster-whisper transcription
        segments, info = whisper_engine.transcribe(decode_target, beam_size=3)
        words = [s.text for s in segments]
        return " ".join(words).strip()
        
    except Exception as e:
        print(f"[WS Audio Error] Whisper direct decode triggered: {e}")
        try:
            segments, info = whisper_engine.transcribe(input_path, beam_size=3)
            return " ".join([s.text for s in segments]).strip()
        except:
            return ""
    finally:
        for path in [input_path, output_path, reduced_path]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except:
                    pass

# 🔊 WS endpoint: Continuous mic stream listener
@app.websocket("/audio/ws/voice-command")
async def websocket_voice_command(websocket: WebSocket):
    await websocket.accept()
    print("[WS] Voice Command connection established.")
    audio_buffer = bytearray()
    
    try:
        while True:
            data = await websocket.receive()
            if "bytes" in data:
                audio_buffer.extend(data["bytes"])
                
                # Run transcription when we have ~60KB of audio
                if len(audio_buffer) >= 60000:
                    transcript = await process_audio_chunk(audio_buffer)
                    audio_buffer.clear()
                    if transcript:
                        # Simple Grammar Matching Check
                        command = "unknown"
                        t_lower = transcript.lower()
                        if "next" in t_lower:
                            command = "next"
                        elif "back" in t_lower or "previous" in t_lower:
                            command = "back"
                        elif "stop" in t_lower or "pause" in t_lower:
                            command = "stop"
                        elif "play" in t_lower or "resume" in t_lower or "start" in t_lower:
                            command = "play"
                        elif "repeat" in t_lower or "again" in t_lower:
                            command = "repeat"
                            
                        await websocket.send_json({
                            "status": "transcribed",
                            "transcript": transcript,
                            "command": command
                        })
            elif "text" in data:
                msg = json.loads(data["text"])
                if msg.get("command") == "clear":
                    audio_buffer.clear()
                    await websocket.send_json({"status": "cleared"})
                elif msg.get("command") == "process":
                    transcript = await process_audio_chunk(audio_buffer)
                    audio_buffer.clear()
                    await websocket.send_json({"status": "transcribed", "transcript": transcript})
                    
    except WebSocketDisconnect:
        print("[WS] Voice Command connection closed.")
    except Exception as e:
        print(f"[WS Error] continuous voice loop failed: {e}")


# 🔊 API Endpoints: Narration Session State Manager (Redis/In-memory)
@app.post("/audio/narration/start")
async def narration_start_api(payload: NarrationStartRequest):
    session_id = str(uuid.uuid4())
    state = {
        "playing": True,
        "topic_index": 0,
        "total_topics": payload.total_topics,
        "document_id": payload.document_id
    }
    
    if redis_client:
        redis_client.setex(f"narration_session:{session_id}", 14400, json.dumps(state))
    else:
        in_memory_sessions[session_id] = state
        
    return {"session_id": session_id, "state": state}

@app.post("/audio/narration/toggle/{session_id}")
async def narration_toggle_api(session_id: str):
    state = None
    if redis_client:
        raw = redis_client.get(f"narration_session:{session_id}")
        if raw:
            state = json.loads(raw)
    else:
        state = in_memory_sessions.get(session_id)
        
    if not state:
        raise HTTPException(status_code=404, detail="Narration session not found.")
        
    state["playing"] = not state["playing"]
    
    if redis_client:
        redis_client.setex(f"narration_session:{session_id}", 14400, json.dumps(state))
    else:
        in_memory_sessions[session_id] = state
        
    return state

@app.post("/audio/narration/advance/{session_id}")
async def narration_advance_api(session_id: str):
    state = None
    if redis_client:
        raw = redis_client.get(f"narration_session:{session_id}")
        if raw:
            state = json.loads(raw)
    else:
        state = in_memory_sessions.get(session_id)
        
    if not state:
        raise HTTPException(status_code=404, detail="Narration session not found.")
        
    if state["topic_index"] < state["total_topics"] - 1:
        state["topic_index"] += 1
        
    if redis_client:
        redis_client.setex(f"narration_session:{session_id}", 14400, json.dumps(state))
    else:
        in_memory_sessions[session_id] = state
        
    return state

@app.get("/audio/narration/state/{session_id}")
async def narration_state_api(session_id: str):
    state = None
    if redis_client:
        raw = redis_client.get(f"narration_session:{session_id}")
        if raw:
            state = json.loads(raw)
    else:
        state = in_memory_sessions.get(session_id)
        
    if not state:
        raise HTTPException(status_code=404, detail="Narration session not found.")
        
    return state


# 📁 API Endpoint: Fetch Full Document (text, status, audit warnings, topics)
@app.get("/documents/{document_id}")
async def get_document_api(document_id: str, authorization: str = Header(None)):
    doc = fetch_document(document_id, user_token=authorization)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    # Also fetch associated topics
    topics_data = supabase_request(
        "GET",
        f"topics?document_id=eq.{document_id}&order=order_index.asc",
        user_token=authorization
    )
    return {
        "document": doc,
        "topics": topics_data if isinstance(topics_data, list) else []
    }


# 🐝 API Endpoint: Publish document to Knowledge Hive
@app.post("/hive/publish")
async def hive_publish_api(payload: HivePublishRequest, authorization: str = Header(None)):
    """
    Shares a ready document to the Knowledge Hive. Inserts a row into
    knowledge_hive_notes with the caller's uid as uploader_id.
    RLS on the table enforces that only authenticated users can insert,
    and the visibility arrays control who can later read the note.
    """
    from services.supabase_service import supabase_request
    import requests as req_lib
    from services.supabase_service import SUPABASE_URL, SUPABASE_KEY, get_headers

    # Resolve the uploader uid from the authorization token
    try:
        auth_resp = req_lib.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {authorization}"}
        )
        user_data = auth_resp.json()
        uploader_id = user_data.get("id")
        if not uploader_id:
            raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth resolution failed: {e}")

    note_payload = {
        "document_id": payload.document_id,
        "uploader_id": uploader_id,
        "visible_to_disabilities": payload.visible_to_disabilities,
        "visible_to_languages": payload.visible_to_languages,
        "upvotes": 0
    }
    result = supabase_request("POST", "knowledge_hive_notes", body=note_payload, user_token=authorization)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to publish note to Knowledge Hive.")
    return {"status": "published", "note": result}


# 🐝 API Endpoint: Browse Knowledge Hive feed (RLS auto-filters by user profile)
@app.get("/hive/feed")
async def hive_feed_api(authorization: str = Header(None)):
    """
    Returns the RLS-filtered list of Knowledge Hive notes visible to the requesting user.
    Supabase RLS policy enforces that only rows whose visible_to_disabilities or
    visible_to_languages overlap with the user's profile arrays are returned — no
    application-level filtering is needed or trusted here.
    Sorted by upvotes descending, then created_at descending.
    """
    result = supabase_request(
        "GET",
        "knowledge_hive_notes?order=upvotes.desc,created_at.desc",
        user_token=authorization
    )
    return {"feed": result if isinstance(result, list) else []}


# 🐝 API Endpoint: Report / flag a Knowledge Hive note (minimal moderation)
@app.post("/hive/report/{note_id}")
async def hive_report_api(note_id: str, payload: HiveReportRequest, authorization: str = Header(None)):
    """
    Inserts a report row into the reports table. RLS on the reports table
    ensures a user can only insert a report attributed to their own uid.
    Active moderation tooling is deferred (out of scope per spec section 8),
    but the mechanism is in place so no content gap exists later.
    """
    import requests as req_lib
    from services.supabase_service import SUPABASE_URL, SUPABASE_KEY

    try:
        auth_resp = req_lib.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {authorization}"}
        )
        reporter_id = auth_resp.json().get("id")
        if not reporter_id:
            raise HTTPException(status_code=401, detail="Invalid authorization token.")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth resolution failed: {e}")

    report_payload = {
        "note_id": note_id,
        "reporter_id": reporter_id,
        "reason": payload.reason
    }
    result = supabase_request("POST", "reports", body=report_payload, user_token=authorization)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to submit report.")
    return {"status": "reported", "note_id": note_id}