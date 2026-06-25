import os
import services.env_loader # Load environment variables
import requests
from fastapi.responses import StreamingResponse

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

if not ELEVENLABS_API_KEY:
    raise RuntimeError(
        "[CRITICAL] ELEVENLABS_API_KEY environment variable is missing. "
        "AeroLearn requires ElevenLabs TTS integration as a mandatory constraint. "
        "Please specify your key before running the server."
    )

DEFAULT_VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2"  # Alice / Clear, Engaging Educator (available on free tier)
ALLOWED_VOICE_IDS = {"Xb7hH8MSUJpSbSDYk0k2", "EXAVITQu4vr4xnSDxMaL", "pqHfZKP75CvOlQylNhV4"}


def stream_text_to_speech(text: str, voice_id: str = None) -> StreamingResponse:
    """
    Calls ElevenLabs TTS streaming API and returns a StreamingResponse to the client.
    Using eleven_multilingual_v2 for multi-language compatibility.
    """
    v_id = voice_id if (voice_id in ALLOWED_VOICE_IDS) else DEFAULT_VOICE_ID
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{v_id}/stream"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "accept": "audio/mpeg"
    }
    
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    response = requests.post(url, json=payload, headers=headers, stream=True, timeout=60)
    
    if response.status_code != 200:
        # Read the error content to print it before raising the exception
        err_text = response.text
        print(f"[ElevenLabs Error] Status: {response.status_code}, Body: {err_text}")
        raise Exception(f"ElevenLabs API Error ({response.status_code}): {err_text}")
        
    def iter_audio():
        for chunk in response.iter_content(chunk_size=4096):
            if chunk:
                yield chunk
                
    return StreamingResponse(iter_audio(), media_type="audio/mpeg")

