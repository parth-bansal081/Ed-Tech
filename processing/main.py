from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import io
import zipfile
from datetime import date, datetime, timedelta
import uuid
import json
import tempfile
import subprocess
import numpy as np
import scipy.io.wavfile as wavfile
try:
    import noisereduce as nr
except Exception as e:
    print(f"[Warning] Failed to import noisereduce: {e}. Noise reduction will be bypassed, but RMS noise gate and Whisper will still function.")
    nr = None
import redis

# Import services & components
from services.openai_service import break_into_topics, translate_text, re_explain_topic
from services.elevenlabs_service import stream_text_to_speech
from services.supabase_service import fetch_document, update_document_status, supabase_request
from routes.translation import router as translation_router
from routes.quiz import router as quiz_router
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
app.include_router(quiz_router)

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
    speed: float = 1.0

class SpeakRequest(BaseModel):
    text: str
    voice_id: str = None
    speed: float = 1.0

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

# 📁 API Endpoint: Re-explain topic simpler using simpler analogy
class ReExplainRequest(BaseModel):
    title: str
    explanation: str

@app.post("/topics/re-explain")
async def topics_re_explain_api(payload: ReExplainRequest):
    try:
        new_explanation = re_explain_topic(payload.title, payload.explanation)
        return {"explanation": new_explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper function to resolve user ID from token
def get_user_id_from_token(authorization: str) -> str:
    if not authorization:
        return None
    token = authorization
    if token.startswith("Bearer "):
        token = token[7:]
    try:
        import requests as req_lib
        from services.supabase_service import SUPABASE_URL, SUPABASE_KEY
        auth_resp = req_lib.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
        )
        if auth_resp.status_code == 200:
            return auth_resp.json().get("id")
    except Exception as e:
        print(f"[Auth Error] Failed to resolve user from token: {e}")
    return None

# 📁 API Endpoint: Generate ElevenLabs Audio for One Topic
@app.post("/topics/narrate")
async def topics_narrate_api(payload: NarrateRequest, authorization: str = Header(None)):
    try:
        voice_id = payload.voice_id
        if not voice_id and authorization:
            user_id = get_user_id_from_token(authorization)
            if user_id:
                prof = supabase_request("GET", f"profiles?id=eq.{user_id}", user_token=authorization)
                if prof and isinstance(prof, list) and len(prof) > 0:
                    voice_id = prof[0].get("preferred_voice_id")
        return stream_text_to_speech(payload.text, voice_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📁 API Endpoint: General-purpose TTS Speech Stream
@app.post("/audio/speak")
async def audio_speak_api(payload: SpeakRequest, authorization: str = Header(None)):
    try:
        voice_id = payload.voice_id
        if not voice_id and authorization:
            user_id = get_user_id_from_token(authorization)
            if user_id:
                prof = supabase_request("GET", f"profiles?id=eq.{user_id}", user_token=authorization)
                if prof and isinstance(prof, list) and len(prof) > 0:
                    voice_id = prof[0].get("preferred_voice_id")
        return stream_text_to_speech(payload.text, voice_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔊 continuous mic websocket voice-command parser Helper
async def process_audio_chunk(audio_bytes: bytearray, noise_floor: float = 0.05) -> str:
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
                
                # RMS threshold noise gate
                rms = np.sqrt(np.mean(data**2)) if len(data) > 0 else 0.0
                print(f"[WS Audio] Chunk RMS: {rms:.5f} vs Calibrated Noise Floor: {noise_floor:.5f}")
                
                if rms < noise_floor * 1.1:  # 10% safety margin above calibrated ambient noise
                    print("[WS Audio] Chunk signal below noise floor. Skipping transcription.")
                    return ""
                
                # Spectral gating noise reduction
                if nr is not None:
                    reduced_data = nr.reduce_noise(y=data, sr=rate, prop_decrease=0.8)
                else:
                    reduced_data = data
                
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
    # Read noise floor from query params
    noise_floor_str = websocket.query_params.get("noise_floor", "0.05")
    try:
        noise_floor = float(noise_floor_str)
    except ValueError:
        noise_floor = 0.05
    print(f"[WS] Voice Command connection established. Ambient noise floor threshold: {noise_floor}")
    audio_buffer = bytearray()
    
    try:
        while True:
            data = await websocket.receive()
            if "bytes" in data:
                audio_buffer.extend(data["bytes"])
                
                # Run transcription when we have ~40KB of audio
                if len(audio_buffer) >= 40000:
                    transcript = await process_audio_chunk(audio_buffer, noise_floor)
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
                    transcript = await process_audio_chunk(audio_buffer, noise_floor)
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


# 🔊 API Endpoint: Download all topic explanations as a ZIP playlist of MP3 files
import io
import zipfile
from fastapi.responses import Response

@app.get("/documents/{document_id}/audio-playlist")
async def download_audio_playlist_api(document_id: str, authorization: str = Header(None)):
    topics_data = supabase_request(
        "GET",
        f"topics?document_id=eq.{document_id}&order=order_index.asc",
        user_token=authorization
    )
    if not topics_data or not isinstance(topics_data, list):
        raise HTTPException(status_code=404, detail="No topics found for this document.")
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for idx, topic in enumerate(topics_data):
            title = topic.get("title", f"Topic_{idx+1}")
            explanation = topic.get("explanation", "")
            
            try:
                from services.elevenlabs_service import DEFAULT_VOICE_ID, ELEVENLABS_API_KEY
                import requests
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{DEFAULT_VOICE_ID}"
                headers = {
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json",
                    "accept": "audio/mpeg"
                }
                payload = {
                    "text": f"Topic {idx+1}: {title}. {explanation}",
                    "model_id": "eleven_multilingual_v2"
                }
                res = requests.post(url, json=payload, headers=headers, timeout=60)
                if res.status_code == 200:
                    audio_bytes = res.content
                    safe_title = "".join([c if c.isalnum() else "_" for c in title])
                    filename = f"{idx+1}_{safe_title}.mp3"
                    zip_file.writestr(filename, audio_bytes)
                else:
                    print(f"[Playlist Zip] Failed to narrate topic {idx+1}: {res.text}")
            except Exception as e:
                print(f"[Playlist Zip Error] Failed to generate audio for topic {idx+1}: {e}")
    
    zip_buffer.seek(0)
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=document_{document_id}_playlist.zip"
        }
    )


# 📄 API Endpoint: Download document as a formatted PDF with inline rendered LaTeX equations
from services.pdf_generator import generate_pdf_bytes

@app.get("/documents/{document_id}/pdf")
async def download_document_pdf_api(document_id: str, authorization: str = Header(None)):
    doc = fetch_document(document_id, user_token=authorization)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    title = doc.get("title", "AeroLearn_Document")
    text = doc.get("translated_text") or doc.get("raw_text") or ""
    
    try:
        pdf_bytes = generate_pdf_bytes(title, text)
        safe_title = "".join([c if c.isalnum() else "_" for c in title])
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_title}.pdf"
            }
        )
    except Exception as e:
        import traceback
        print(f"[PDF Generation Error] {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {e}")


# ==============================================================================
# PROFILE SYSTEM ROUTING GATEWAY (Phase 2 Backend API Routes)
# ==============================================================================

# Simple user-agent parser
def parse_user_agent(user_agent: str) -> str:
    if not user_agent:
        return "Unknown Device"
    ua = user_agent.lower()
    os_name = "Unknown OS"
    if "windows" in ua:
        os_name = "Windows"
    elif "macintosh" in ua or "mac os" in ua:
        os_name = "macOS"
    elif "iphone" in ua or "ipad" in ua:
        os_name = "iOS"
    elif "android" in ua:
        os_name = "Android"
    elif "linux" in ua:
        os_name = "Linux"
        
    browser = "Unknown Browser"
    if "edg" in ua or "edge" in ua:
        browser = "Edge"
    elif "chrome" in ua or "crios" in ua:
        browser = "Chrome"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"
    elif "firefox" in ua or "fxios" in ua:
        browser = "Firefox"
        
    return f"{browser} on {os_name}"

# Request models for Profile
class ProfileUpdate(BaseModel):
    display_name: str = None
    bio: str = None
    avatar_url: str = None
    reading_level_override: str = None
    preferred_voice_id: str = None
    narration_speed: float = None
    low_stimulus_mode: bool = None
    text_size_scale: float = None
    knowledge_hive_visibility: str = None
    onboarding_completed_at: str = None
    goals: list = None
    preferred_languages: list = None
    disabilities: list = None

class PrivacyUpdate(BaseModel):
    show_display_name_in_hive: bool = None
    show_stats_publicly: bool = None
    allow_peer_note_requests: bool = None

@app.get("/profile/me")
async def get_profile_me_api(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
    
    # Fetch profile
    profile = supabase_request("GET", f"profiles?id=eq.{user_id}", user_token=authorization)
    if not profile or not isinstance(profile, list) or len(profile) == 0:
        raise HTTPException(status_code=404, detail="Profile not found.")
    
    # Fetch stats
    stats = supabase_request("GET", f"profile_stats?user_id=eq.{user_id}", user_token=authorization)
    stats_row = stats[0] if stats and isinstance(stats, list) and len(stats) > 0 else {}
    
    return {
        "profile": profile[0],
        "stats": stats_row
    }

@app.patch("/profile/me")
async def update_profile_me_api(payload: ProfileUpdate, authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
    
    # Filter fields to only update what was provided (not null)
    update_data = {}
    for key, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            update_data[key] = value
            
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update.")
        
    update_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
    
    res = supabase_request("PATCH", f"profiles?id=eq.{user_id}", body=update_data, user_token=authorization)
    if res is None:
        raise HTTPException(status_code=500, detail="Failed to update profile.")
        
    return {"status": "success", "profile": res}

@app.get("/profile/me/stats")
async def get_profile_me_stats_api(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    stats = supabase_request("GET", f"profile_stats?user_id=eq.{user_id}", user_token=authorization)
    if not stats or not isinstance(stats, list) or len(stats) == 0:
        raise HTTPException(status_code=404, detail="Stats not found.")
        
    return stats[0]

@app.post("/profile/me/stats/increment-topics")
async def increment_topics_completed_api(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    # Get current stats
    stats_data = supabase_request("GET", f"profile_stats?user_id=eq.{user_id}", user_token=authorization)
    if not stats_data or not isinstance(stats_data, list) or len(stats_data) == 0:
        default_stats = {
            "user_id": user_id,
            "documents_processed": 0,
            "topics_completed": 1,
            "notes_shared": 0,
            "notes_helped_count": 0,
            "languages_used": [],
            "current_streak_days": 1,
            "longest_streak_days": 1,
            "last_active_date": str(date.today())
        }
        res = supabase_request("POST", "profile_stats", body=default_stats, user_token=authorization)
        return res if res else default_stats

    stats = stats_data[0]
    new_topics_completed = (stats.get("topics_completed") or 0) + 1
    
    # Calculate streak
    current_streak = stats.get("current_streak_days") or 0
    longest_streak = stats.get("longest_streak_days") or 0
    last_active_str = stats.get("last_active_date")
    
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    if last_active_str:
        try:
            last_active = datetime.strptime(last_active_str, "%Y-%m-%d").date()
        except ValueError:
            last_active = today
    else:
        last_active = yesterday
        
    if last_active == today:
        pass
    elif last_active == yesterday:
        current_streak += 1
        if current_streak > longest_streak:
            longest_streak = current_streak
    else:
        current_streak = 1
        
    update_data = {
        "topics_completed": new_topics_completed,
        "current_streak_days": current_streak,
        "longest_streak_days": longest_streak,
        "last_active_date": str(today)
    }
    
    res = supabase_request("PATCH", f"profile_stats?user_id=eq.{user_id}", body=update_data, user_token=authorization)
    return res if res else update_data

@app.get("/profile/me/contributions")
async def get_profile_me_contributions_api(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    result = supabase_request(
        "GET",
        f"knowledge_hive_notes?uploader_id=eq.{user_id}&select=*,document:documents(title)&order=created_at.desc",
        user_token=authorization
    )
    return result if isinstance(result, list) else []

@app.patch("/profile/me/privacy")
async def update_profile_me_privacy_api(payload: PrivacyUpdate, authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    update_data = {}
    for key, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            update_data[key] = value
            
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update.")
        
    res = supabase_request("PATCH", f"profile_privacy_settings?user_id=eq.{user_id}", body=update_data, user_token=authorization)
    if res is None:
        raise HTTPException(status_code=500, detail="Failed to update privacy settings.")
        
    return {"status": "success", "privacy_settings": res}

@app.get("/profile/me/devices")
async def get_profile_me_devices_api(user_agent: str = Header(None), authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    device_label = parse_user_agent(user_agent)
    devices = supabase_request("GET", f"linked_devices?user_id=eq.{user_id}", user_token=authorization)
    devices_list = devices if isinstance(devices, list) else []
    
    found_current = False
    current_device_id = None
    
    for dev in devices_list:
        if dev.get("device_label") == device_label:
            found_current = True
            current_device_id = dev.get("id")
            break
            
    if found_current:
        for dev in devices_list:
            is_curr = (dev.get("id") == current_device_id)
            if dev.get("is_current") != is_curr or is_curr:
                supabase_request(
                    "PATCH",
                    f"linked_devices?id=eq.{dev.get('id')}",
                    body={"is_current": is_curr, "last_active": datetime.utcnow().isoformat() + "Z"},
                    user_token=authorization
                )
    else:
        new_device = {
            "user_id": user_id,
            "device_label": device_label,
            "is_current": True,
            "last_active": datetime.utcnow().isoformat() + "Z"
        }
        supabase_request("POST", "linked_devices", body=new_device, user_token=authorization)
        for dev in devices_list:
            supabase_request("PATCH", f"linked_devices?id=eq.{dev.get('id')}", body={"is_current": False}, user_token=authorization)
            
    refetched = supabase_request("GET", f"linked_devices?user_id=eq.{user_id}&order=last_active.desc", user_token=authorization)
    return refetched if isinstance(refetched, list) else []

@app.delete("/profile/me/devices/{device_id}")
async def delete_profile_device_api(device_id: str, authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    supabase_request("DELETE", f"linked_devices?id=eq.{device_id}&user_id=eq.{user_id}", user_token=authorization)
    return {"status": "success", "message": "Device logged out successfully."}

@app.post("/profile/me/devices/logout-others")
async def logout_other_devices_api(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    supabase_request("DELETE", f"linked_devices?user_id=eq.{user_id}&is_current=eq.false", user_token=authorization)
    return {"status": "success", "message": "All other devices logged out successfully."}

@app.get("/profile/me/export")
async def export_profile_data_api(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    profile_data = supabase_request("GET", f"profiles?id=eq.{user_id}", user_token=authorization)
    stats_data = supabase_request("GET", f"profile_stats?user_id=eq.{user_id}", user_token=authorization)
    documents = supabase_request("GET", f"documents?owner_id=eq.{user_id}", user_token=authorization)
    doc_list = documents if isinstance(documents, list) else []
    notes = supabase_request("GET", f"knowledge_hive_notes?uploader_id=eq.{user_id}", user_token=authorization)
    note_list = notes if isinstance(notes, list) else []
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        profile_json = {
            "profile": profile_data[0] if profile_data else {},
            "stats": stats_data[0] if stats_data else {},
            "export_timestamp": datetime.utcnow().isoformat() + "Z"
        }
        zip_file.writestr("profile.json", json.dumps(profile_json, indent=2, ensure_ascii=False))
        
        for idx, doc in enumerate(doc_list):
            title = doc.get("title", f"document_{idx+1}")
            safe_title = "".join([c if c.isalnum() else "_" for c in title])
            doc_content = f"# {title}\n\n"
            doc_content += f"Source Type: {doc.get('source_type')}\n"
            doc_content += f"Language: {doc.get('target_lang')} (Original: {doc.get('original_lang')})\n"
            doc_content += f"Status: {doc.get('status')}\n\n"
            doc_content += "## Raw Extracted Text\n\n"
            doc_content += (doc.get("raw_text") or "") + "\n\n"
            doc_content += "## Adapted/Translated Text\n\n"
            doc_content += (doc.get("translated_text") or "") + "\n"
            zip_file.writestr(f"documents/{idx+1}_{safe_title}.md", doc_content)
            
        for idx, note in enumerate(note_list):
            note_content = {
                "note_id": note.get("id"),
                "document_id": note.get("document_id"),
                "upvotes": note.get("upvotes", 0),
                "created_at": note.get("created_at"),
                "visible_to_disabilities": note.get("visible_to_disabilities", []),
                "visible_to_languages": note.get("visible_to_languages", [])
            }
            zip_file.writestr(f"hive_notes/note_{note.get('id')}.json", json.dumps(note_content, indent=2))
            
    zip_buffer.seek(0)
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=aerolearn_user_data_export.zip"
        }
    )

@app.delete("/profile/me")
async def delete_profile_me_api(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token.")
        
    supabase_request("PATCH", f"knowledge_hive_notes?uploader_id=eq.{user_id}", body={"uploader_id": None}, user_token=authorization)
    supabase_request("DELETE", f"profiles?id=eq.{user_id}", user_token=authorization)
    return {"status": "success", "message": "Profile and data deleted successfully. Note contributions re-attributed to Deleted User."}

@app.get("/profile/{user_id}/public")
async def get_public_profile_api(user_id: str, authorization: str = Header(None)):
    privacy_res = supabase_request("GET", f"profile_privacy_settings?user_id=eq.{user_id}", user_token=authorization)
    privacy = privacy_res[0] if privacy_res and isinstance(privacy_res, list) and len(privacy_res) > 0 else None
    
    show_name = privacy.get("show_display_name_in_hive", True) if privacy else True
    show_stats = privacy.get("show_stats_publicly", False) if privacy else False
    
    profile_res = supabase_request("GET", f"profiles?id=eq.{user_id}", user_token=authorization)
    profile = profile_res[0] if profile_res and isinstance(profile_res, list) and len(profile_res) > 0 else None
    
    if not profile:
        raise HTTPException(status_code=404, detail="Public profile not found.")
        
    display_name = profile.get("display_name") if show_name else "Anonymous Learner"
    if not display_name:
        display_name = "Anonymous Learner"
        
    response_payload = {
        "display_name": display_name,
        "bio": profile.get("bio"),
        "avatar_url": profile.get("avatar_url")
    }
    
    if show_stats:
        stats_res = supabase_request("GET", f"profile_stats?user_id=eq.{user_id}", user_token=authorization)
        stats = stats_res[0] if stats_res and isinstance(stats_res, list) and len(stats_res) > 0 else {}
        response_payload["stats"] = {
            "documents_processed": stats.get("documents_processed", 0),
            "topics_completed": stats.get("topics_completed", 0),
            "notes_shared": stats.get("notes_shared", 0),
            "notes_helped_count": stats.get("notes_helped_count", 0),
            "current_streak_days": stats.get("current_streak_days", 0),
            "longest_streak_days": stats.get("longest_streak_days", 0)
        }
    else:
        response_payload["stats"] = None
        
    return response_payload