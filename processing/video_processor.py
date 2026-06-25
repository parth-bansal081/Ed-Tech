import os
import time
import json
import yt_dlp
import assemblyai as aai

def download_youtube_audio(youtube_url: str) -> str:
    """
    Downloads the highest quality audio stream from a YouTube video
    and encodes it into a clean MP3 file for downstream transcription processing.
    """
    print(f"--- Initiating Audio Extraction Pipeline for: {youtube_url} ---")
    start_time = time.perf_counter()
    
    # Ensure our isolated downloads directory exists to prevent filesystem collision
    download_dir = os.path.join(os.path.dirname(__file__), "downloads")
    os.makedirs(download_dir, exist_ok=True)
    
    # yt-dlp Configuration Map
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(download_dir, '%(id)s.%(ext)s'),
        'skip_download': False,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True
    }
    
    audio_filepath = ""
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("[Network] Extracting stream metadata and initializing download...")
            info_dict = ydl.extract_info(youtube_url, download=True)
            video_id = info_dict.get('id', 'unknown_id')
            # yt-dlp's FFmpeg postprocessor will dynamically change the extension to .mp3
            audio_filepath = os.path.join(download_dir, f"{video_id}.mp3")
            
    except yt_dlp.utils.DownloadError as e:
        print(f"[CRITICAL FAILURE] yt-dlp network download error: {e}")
        return ""
    except Exception as e:
        print(f"[CRITICAL FAILURE] Unexpected error during audio extraction: {e}")
        return ""
        
    end_time = time.perf_counter()
    print(f"[Latency Metric] Audio Extraction completed in {end_time - start_time:.4f} seconds.")
    print(f"Local Media Asset Generated: {audio_filepath}")
    
    return audio_filepath

def download_youtube_video_and_audio(youtube_url: str) -> tuple[str, str]:
    """
    Downloads both the video stream (lightweight 360p format to save bandwidth) and extracts the audio track.
    Returns a tuple: (video_filepath, audio_filepath).
    """
    print(f"--- Initiating Video & Audio Ingestion for: {youtube_url} ---")
    download_dir = os.path.join(os.path.dirname(__file__), "downloads")
    os.makedirs(download_dir, exist_ok=True)
    
    ydl_opts = {
        'format': 'best[height<=360]/best',
        'outtmpl': os.path.join(download_dir, '%(id)s.%(ext)s'),
        'quiet': True,
        'no_warnings': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(youtube_url, download=True)
            video_id = info_dict.get('id', 'unknown_id')
            ext = info_dict.get('ext', 'mp4')
            video_filepath = os.path.join(download_dir, f"{video_id}.{ext}")
            
            # Extract audio from video track via ffmpeg
            audio_filepath = os.path.join(download_dir, f"{video_id}.mp3")
            import subprocess
            cmd = ["ffmpeg", "-y", "-i", video_filepath, "-vn", "-acodec", "libmp3lame", "-q:a", "2", audio_filepath]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            return video_filepath, audio_filepath
    except Exception as e:
        print(f"Error during video/audio download: {e}")
        return "", ""

def extract_video_frames(video_filepath: str, num_frames: int = 6) -> list[dict]:
    """
    Extracts num_frames keyframes spread evenly across the video duration using FFmpeg seeks.
    Returns a list of dicts: [{"timestamp": float, "base64": str}]
    """
    import subprocess
    import tempfile
    import base64
    
    duration = 0.0
    try:
        cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", video_filepath]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        duration = float(res.stdout.strip())
    except Exception as e:
        print(f"Error getting video duration: {e}")
        duration = 300.0  # Fallback to 5 mins
        
    timestamps = [i * (duration / (num_frames + 1)) for i in range(1, num_frames + 1)]
    
    keyframes = []
    for i, ts in enumerate(timestamps):
        out_file = os.path.join(tempfile.gettempdir(), f"frame_{i}.jpg")
        cmd = ["ffmpeg", "-y", "-ss", f"{ts:.2f}", "-i", video_filepath, "-frames:v", "1", "-q:v", "4", out_file]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(out_file):
            try:
                with open(out_file, "rb") as f:
                    b64 = base64.b64encode(f.read()).decode("utf-8")
                keyframes.append({
                    "timestamp": ts,
                    "base64": b64
                })
            finally:
                os.remove(out_file)
    return keyframes

def generate_video_chapters(audio_filepath: str) -> list:
    """
    Leverages AssemblyAI's advanced neural network transcription engines to map 
    semantic chapter segments across the audio file, outputting structured logic arrays.
    """
    print(f"\n--- Initiating Semantic Chapter Segmentation ---")
    start_time = time.perf_counter()
    
    # Configure API Keys safely
    aai.settings.api_key = "55a9385a4c6e4dcd84266c4e49865118"
    
    chapter_payload = []
    
    try:
        # We enforce auto_chapters=True inside TranscriptionConfig to instruct the AI 
        # to apply semantic grouping logic and extract highly structured chapter timelines.
        config = aai.TranscriptionConfig(auto_chapters=True)
        transcriber = aai.Transcriber()
        
        print(f"[Network] Transmitting media asset ({audio_filepath}) to neural processing node...")
        transcript = transcriber.transcribe(audio_filepath, config)
        
        if transcript.error:
            print(f"[CRITICAL FAILURE] AssemblyAI processing error: {transcript.error}")
            return []
            
        if not transcript.chapters:
            print("[WARNING] Neural node returned zero semantic chapters. The video may be too short or lacks structural transitions.")
            return []
            
        print("[Processing] Compiling structured timeline arrays...")
        for chapter in transcript.chapters:
            chapter_data = {
                "start_time_ms": chapter.start,
                "end_time_ms": chapter.end,
                "headline": chapter.headline,
                "summary": chapter.summary
            }
            chapter_payload.append(chapter_data)
            
    except Exception as e:
        print(f"[CRITICAL FAILURE] Unhandled network or transcriber exception: {e}")
        return []
        
    end_time = time.perf_counter()
    print(f"[Latency Metric] Semantic Chapter Segmentation completed in {end_time - start_time:.4f} seconds.")
    
    return chapter_payload

def synthesize_chapters_into_notes(chapters_data: list) -> str:
    """
    Synthesizes the structured chapter arrays from AssemblyAI into visually stunning, 
    highly scannable academic Markdown notes using Gemini.
    """
    print(f"\n--- Initiating Academic Neural Synthesis ---")
    start_time = time.perf_counter()
    
    if not chapters_data:
        return "[Error] No chapter data available to synthesize."
        
    system_prompt = (
        "You are an elite, warm, and incredibly encouraging student tutor on the AeroLearn platform. "
        "Your objective is to take raw, timestamped audio chapters and synthesize them into clean, "
        "visually stunning, and highly scannable academic lecture notes.\n\n"
        "Tone and Language Guidelines:\n"
        "- Use clear, friendly, and easy-to-understand language. Act like a brilliant friend helping a peer study.\n"
        "- Break down complex concepts simply, without using cold, robotic jargon or unnecessarily tough words.\n"
        "- Be encouraging, supportive, and accessible in your explanations.\n\n"
        "Strict Formatting Requirements:\n"
        "- Use bold Markdown headers for each chapter transition.\n"
        "- Use clean, nested bullet points to break down complex topics.\n"
        "- Use Markdown blockquote callouts (> ) to highlight critical definitions or key takeaways.\n"
        "- Maintain perfect and valid LaTeX formatting for any mathematical, physical, or scientific concepts."
    )
    
    # Compile the raw chapters into a readable prompt payload
    compiled_chapters = ""
    for idx, chapter in enumerate(chapters_data):
        start_sec = chapter['start_time_ms'] // 1000
        end_sec = chapter['end_time_ms'] // 1000
        compiled_chapters += (
            f"Chapter {idx+1}: {chapter['headline']} ({start_sec}s - {end_sec}s)\n"
            f"Summary: {chapter['summary']}\n\n"
        )
        
    user_prompt = (
        "Please convert the following raw chapter timestamps into beautifully structured academic notes "
        f"following your strict formatting requirements:\n\n{compiled_chapters}"
    )
    
    try:
        from services.openai_service import openai_client
        print("[Neural Synthesis] Igniting Gemini engine to author lecture notes...")
        response = openai_client.chat.completions.create(
            model='gemini-2.5-flash',
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.4
        )
        
        final_notes = response.choices[0].message.content
        
    except Exception as e:
        print(f"[CRITICAL FAILURE] Unhandled error during Gemini generation: {e}")
        final_notes = f"[Error] Neural synthesis failed: {e}"
        
    end_time = time.perf_counter()
    print(f"[Latency Metric] Neural Synthesis completed in {end_time - start_time:.4f} seconds.")
    
    return final_notes.strip()

if __name__ == "__main__":
    # Test execution simulation
    sample_youtube_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    print("==================================================")
    print("   PROTOTYPE RUN: YOUTUBE MEDIA PIPELINE")
    print("==================================================")
    
    pipeline_start = time.perf_counter()
    
    # Stage 1: Audio Extraction
    extracted_asset_path = download_youtube_audio(sample_youtube_url)
    
    if extracted_asset_path and os.path.exists(extracted_asset_path):
        print(f"Asset successfully locked onto filesystem: {extracted_asset_path}")
        
        # Stage 2: Neural Chapter Segmentation
        # Note: AssemblyAI call will fail without a real API key, so we test defensively
        chapters = generate_video_chapters(extracted_asset_path)
        
        # Fallback simulation for seamless execution even without auth limits
        if not chapters:
            print("\n[MOCK DATA INJECTION] Simulating Chapter Data to test Ollama pipeline (Auth Missing)...")
            chapters = [
                {
                    "start_time_ms": 0, "end_time_ms": 30000, 
                    "headline": "Introduction to the Pauli Exclusion Principle", 
                    "summary": "The lecturer explains the fundamental quantum mechanical principle stating that two identical fermions cannot occupy the same quantum state simultaneously."
                },
                {
                    "start_time_ms": 30000, "end_time_ms": 90000, 
                    "headline": "Fermions and Bosons Overview", 
                    "summary": "A breakdown of the difference between half-integer spin particles (fermions) and integer spin particles (bosons), explaining how this impacts matter distribution."
                }
            ]
            
        # Stage 3: Markdown Notes Synthesis
        final_notes = synthesize_chapters_into_notes(chapters)
        
        print("\n=== FINAL ACADEMIC MARKDOWN NOTES ===")
        print(final_notes)
        print("=======================================")
        print("\n=== RAW CHAPTER TIMESTAMPS ===")
        print(json.dumps(chapters, indent=2))
        print("==============================\n")
        
    else:
        print("\n[ABORTED] Pipeline collapsed during Stage 1 extraction phase.")
        
    pipeline_end = time.perf_counter()
    print(f"*** TOTAL PIPELINE LATENCY: {pipeline_end - pipeline_start:.4f} SECONDS ***")
