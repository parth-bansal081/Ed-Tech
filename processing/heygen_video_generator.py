import os
import time
import requests

"""
ARCHITECTURAL OVERVIEW: Why Long-Polling is Required for Video Rendering APIs

AI avatar video generation is a multi-stage, computationally expensive cloud 
process. HeyGen must render the avatar face, synchronize lip movements to the 
voice track, composite background layers, and encode the final MP4 stream —
all on GPU clusters. This entire process routinely takes between 1 to 5 minutes 
per video, depending on script length and avatar complexity.

If we attempted to handle this via a single synchronous HTTP request, the 
connection would be forcibly terminated by standard server gateway timeout 
thresholds (typically between 30 to 60 seconds), resulting in a "502 Bad 
Gateway" or "504 Gateway Timeout" error — even if the cloud GPU was 
successfully processing the job in the background.

The correct architectural pattern is the "Fire and Poll" model:
  1. FIRE: POST the video generation job to HeyGen and immediately receive a 
     lightweight tracking ID ('prediction_id') from the API.
  2. POLL: Enter a lightweight 'while' loop that periodically GETs the job 
     status every N seconds. Since each polling request completes instantly,
     no gateway timeout is ever triggered. 
  3. RESOLVE: When the status field transitions to "completed", the final 
     streaming media URL is extracted and returned for downstream consumption.

This pattern also enables the status to be streamed back to the client in 
real-time via WebSockets or SSE (Server-Sent Events), providing live 
progress feedback to the student without blocking any server thread.
"""

# --- CONFIGURATION ---
HEYGEN_API_KEY = os.environ.get("HEYGEN_API_KEY", "YOUR_HEYGEN_API_KEY")
HEYGEN_CREATE_ENDPOINT = "https://api.heygen.com/v3/video-agents"
HEYGEN_STATUS_ENDPOINT = "https://api.heygen.com/v1/video_status.get"

def request_avatar_video(script_text: str, avatar_id: str, voice_id: str) -> str:
    """
    Fires a POST request to the HeyGen production endpoint to initialize a 
    new avatar video rendering job.
    
    Returns:
        The unique tracking asset identifier ('prediction_id') that must be 
        passed to the polling function to monitor render completion status.
    """
    print(f"[HeyGen] Initiating avatar video generation request...")
    print(f"         Avatar ID : {avatar_id}")
    print(f"         Voice ID  : {voice_id}")
    print(f"         Script    : {script_text[:80]}...")
    
    # Authorization headers pulling securely from the environment variable layer
    headers = {
        "x-api-key": HEYGEN_API_KEY,
        "Content-Type": "application/json"
    }
    
    # Payload structured as per HeyGen API documentation requirements
    payload = {
        "prompt": script_text,
        "avatar_id": avatar_id,
        "voice_id": voice_id
    }
    
    try:
        response = requests.post(
            HEYGEN_CREATE_ENDPOINT,
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        response_data = response.json()
        
        # HeyGen can return the tracking ID under multiple key names depending 
        # on the API version. We safely check both.
        prediction_id = (
            response_data.get("data", {}).get("video_id") or
            response_data.get("prediction_id") or
            response_data.get("id")
        )
        
        if not prediction_id:
            raise ValueError(
                f"[HeyGen] API responded with 200 but returned no tracking ID. "
                f"Full response: {response_data}"
            )
            
        print(f"[HeyGen] Job successfully submitted. Tracking ID: {prediction_id}")
        return prediction_id
        
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(f"[HeyGen] HTTP Error during video creation request: {e} | Response: {e.response.text}")
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError(f"[HeyGen] Network connection failure. Verify API endpoint availability: {e}")
    except requests.exceptions.Timeout:
        raise RuntimeError("[HeyGen] Request timed out during initial video creation submission.")
    except Exception as e:
        raise RuntimeError(f"[HeyGen] Unhandled exception during video creation: {e}")

def poll_video_render_status(prediction_id: str, poll_interval_secs: int = 10) -> str:
    """
    Implements a defensive long-polling loop to monitor the cloud render pipeline 
    status until the final streaming media URL becomes available.
    
    Args:
        prediction_id:      The unique tracking asset identifier returned by 'request_avatar_video'.
        poll_interval_secs: How many seconds to wait between each status check. Default: 10s.
    
    Returns:
        The final streaming media URL string ('video_url') of the completed render.
    
    Raises:
        RuntimeError: If the remote job transitions to a 'failed' status.
    """
    print(f"\n[HeyGen] Entering long-polling verification cycle for job: {prediction_id}")
    print(f"         Polling interval: every {poll_interval_secs} seconds")
    
    headers = {
        "x-api-key": HEYGEN_API_KEY
    }
    
    poll_count = 0
    
    # Defensive long-polling loop — runs until the render is confirmed complete or failed
    while True:
        poll_count += 1
        print(f"[HeyGen] Status check #{poll_count} — waiting...")
        time.sleep(poll_interval_secs)
        
        try:
            response = requests.get(
                HEYGEN_STATUS_ENDPOINT,
                headers=headers,
                params={"video_id": prediction_id},
                timeout=30
            )
            response.raise_for_status()
            
            status_data = response.json()
            
            # Navigate to the nested data structure
            data = status_data.get("data", status_data)
            current_status = data.get("status", "").lower()
            
            print(f"[HeyGen] Current Render Status: {current_status.upper()}")
            
            # SUCCESS branch — extract and return the final streaming media URL
            if current_status in ("success", "completed"):
                # Safely check multiple possible URL key names across API versions
                video_url = (
                    data.get("video_url") or
                    data.get("url") or
                    data.get("output_url")
                )
                
                if not video_url:
                    raise RuntimeError(
                        f"[HeyGen] Render completed but no video URL was returned. "
                        f"Full data: {data}"
                    )
                    
                print(f"[HeyGen] Render complete. Asset URL: {video_url}")
                return video_url
                
            # FAILED branch — immediately raise a RuntimeError 
            elif current_status == "failed":
                error_detail = data.get("error", "No error detail provided by the API.")
                raise RuntimeError(
                    f"[HeyGen] Cloud render job FAILED for prediction_id '{prediction_id}'. "
                    f"Reason: {error_detail}"
                )
                
            # PENDING / PROCESSING branch — log and continue polling
            elif current_status in ("pending", "processing", "waiting", "queued"):
                print(f"[HeyGen] Job is still processing on remote GPU cluster. Continuing poll...")
                
            else:
                # Unknown status — log it but do not crash. Continue polling gracefully.
                print(f"[HeyGen] Received unknown status token: '{current_status}'. Continuing poll...")
                
        except RuntimeError:
            # Re-raise our explicit RuntimeError cleanly without wrapping it
            raise
        except requests.exceptions.HTTPError as e:
            print(f"[HeyGen WARNING] HTTP error during status poll #{poll_count}: {e}. Retrying...")
        except requests.exceptions.Timeout:
            print(f"[HeyGen WARNING] Status poll #{poll_count} timed out. Retrying...")
        except Exception as e:
            print(f"[HeyGen WARNING] Unexpected polling error on attempt #{poll_count}: {e}. Retrying...")

if __name__ == "__main__":
    print("==================================================")
    print("   PROTOTYPE RUN: HEYGEN AVATAR VIDEO PIPELINE")
    print("==================================================")
    
    # Prototype configuration using placeholder values
    # Replace these with real HeyGen Avatar and Voice IDs from your HeyGen dashboard
    SAMPLE_SCRIPT = (
        "Welcome to your Inclusive Learning Platform. "
        "In today's lecture, we will explore Newton's Second Law of Motion, "
        "formally expressed as F equals m times a. "
        "By the end of this module, you will be able to apply this principle "
        "to analyze dynamic inertial frames with confidence."
    )
    SAMPLE_AVATAR_ID = "Angela-inTuxedo-20220820"
    SAMPLE_VOICE_ID = "1bd001e7e50f421d891986aad5158bc8"
    
    pipeline_start = time.perf_counter()
    
    try:
        # Stage 1: Fire the video creation request and capture the tracking ID
        prediction_id = request_avatar_video(SAMPLE_SCRIPT, SAMPLE_AVATAR_ID, SAMPLE_VOICE_ID)
        print(f"\n[Pipeline] Tracking ID secured: {prediction_id}")
        
        # Stage 2: Long-poll until the GPU cloud render finalizes
        final_video_url = poll_video_render_status(prediction_id, poll_interval_secs=10)
        
        pipeline_end = time.perf_counter()
        total_latency = pipeline_end - pipeline_start
        
        print("\n==================================================")
        print("         AVATAR VIDEO GENERATION COMPLETE")
        print("==================================================")
        print(f"Final Asset URL     : {final_video_url}")
        print(f"Total Cloud Latency : {total_latency:.2f} seconds")
        print("==================================================")
        
    except RuntimeError as e:
        pipeline_end = time.perf_counter()
        print(f"\n[CRITICAL FAILURE] Pipeline aborted after {pipeline_end - pipeline_start:.2f} seconds.")
        print(f"Error: {e}")
