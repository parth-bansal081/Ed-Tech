import os
import services.env_loader # Load environment variables
import time
from celery import Celery

"""
ARCHITECTURAL OVERVIEW: The Distributed Task Queue as an Architectural Buffer
==============================================================================

In a production Ed-Tech platform, heavy AI inference operations (VLM transcription,
audio segmentation, avatar video rendering, cognitive text adaptation) routinely block
server threads for anywhere between 10 to 120 seconds per request.

THE PROBLEM — Thread-Pool Exhaustion:
If these operations executed directly inside our FastAPI request/response cycle,
even a modest 10 concurrent student uploads would fully saturate the ASGI thread pool.
The main web server would freeze — preventing other students from logging in, loading
content, or performing any interaction at all. Every new incoming HTTP request would 
receive a "503 Service Unavailable" error, effectively taking down the entire platform.

THE SOLUTION — Celery Task Queue as a Buffer Layer:
By introducing Celery backed by a Redis message broker, we insert a high-throughput
decoupling layer between the web server and the heavy inference layer:

  1. RECEIVE:   FastAPI receives the student's document upload request.
  2. DELEGATE:  The web server immediately enqueues the task into Redis and returns 
                a lightweight "202 Accepted" JSON response with a task_id to the client.
                This takes under 5 milliseconds — the server thread is immediately freed.
  3. PROCESS:   Background Celery worker processes independently pull tasks from the 
                Redis queue and execute the heavy Ollama or AssemblyAI operations safely 
                out-of-band, completely isolated from the web server's request cycle.
  4. RESOLVE:   Once the worker finishes, it writes the result back into the Redis 
                result_backend store, which the frontend can query via a separate 
                lightweight status-check endpoint.

This architecture ensures the user-facing web application remains lightning-fast and 
continuously available regardless of how heavily the backend inference layer is loaded.
"""

# Initialize the Celery application, named to match our processing microservice domain.
app = Celery("processing_workers")

# Configure the application to route all task traffic through the local Redis broker.
# Both the message broker (job dispatch) and result backend (return value storage) 
# point to the same local Redis instance on database index 0.
# Read Redis URL from environment — defaults to localhost for local dev, overridden to redis://redis:6379/0 in Docker.
_redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

app.conf.update(
    broker_url=_redis_url,
    result_backend=_redis_url,

    # Enforce strict JSON serialization throughout the entire task lifecycle.
    # This ensures that task payloads and results are always human-readable,
    # debuggable, and safe to transmit across service boundaries.
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],

    # Lock the timezone to UTC to prevent time-zone drift bugs when computing
    # task scheduling windows or result expiry times across different environments.
    timezone='UTC'
)

# Auto-discover tasks from the 'tasks' module.
# This instructs Celery to automatically import and register every function
# decorated with @app.task from our dedicated tasks.py file, without requiring
# explicit manual imports here. This keeps the worker configuration clean and 
# allows the tasks module to grow independently.
app.autodiscover_tasks(["tasks"])
