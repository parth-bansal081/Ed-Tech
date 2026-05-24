import traceback
from celery import states
from celery.exceptions import Ignore

# Import the Celery app instance to register tasks against the correct worker
from celery_app import app

# Import our standalone pipeline functions.
# Note: master_extractor.py exports 'unified_extract_text' as its core function.
# We alias it here to 'extract_text_from_document' to maintain a clean, consistent
# API surface across this tasks layer without modifying the source module.
try:
    from master_extractor import extract_text_from_document
except ImportError:
    from master_extractor import unified_extract_text as extract_text_from_document

from reading_simplifier import simplify_text_cognitive


@app.task(
    bind=True,
    name="tasks.async_document_extraction_task",
    max_retries=2,
    default_retry_delay=5
)
def async_document_extraction_task(self, file_path: str) -> dict:
    """
    Background Celery task wrapper for the document text extraction pipeline.

    Executes the full master extraction engine (native PDF vector parsing with 
    automatic Vision-Language-Model fallback) in an isolated background worker 
    process, completely decoupled from the web server request cycle.

    Args:
        file_path: Absolute or relative path to the document file to process.

    Returns:
        The full extraction result dictionary from master_extractor, containing:
        - "status"                  : "success" or "error"
        - "engine_used"             : "native" or "qwen_vl"
        - "text"                    : The extracted text content
        - "execution_time_seconds"  : Precision inference latency metric
    """
    print(f"[Celery Worker] async_document_extraction_task received: {file_path}")

    try:
        result = extract_text_from_document(file_path)
        print(f"[Celery Worker] Extraction complete. Engine: {result.get('engine_used')} | "
              f"Characters: {len(result.get('text', ''))}")
        return result

    except Exception as exc:
        # Log the full diagnostic traceback to the worker console so we can diagnose 
        # exactly where in the extraction pipeline the failure occurred without 
        # crashing or recycling the worker process itself.
        error_trace = traceback.format_exc()
        print(f"[Celery Worker FAILURE] async_document_extraction_task crashed.\n{error_trace}")

        # Mark this specific task instance as FAILED in the Redis result backend, 
        # storing the error string so the frontend can retrieve it via the task_id 
        # status polling endpoint and display a meaningful error to the student.
        self.update_state(
            state=states.FAILURE,
            meta={
                "status": "error",
                "file_path": file_path,
                "error": str(exc),
                "trace": error_trace
            }
        )

        # Raise Ignore to tell Celery NOT to overwrite our manually set FAILURE state
        # with its default exception handling, preserving our structured error payload.
        raise Ignore()


@app.task(
    bind=True,
    name="tasks.async_cognitive_simplification_task",
    max_retries=2,
    default_retry_delay=5
)
def async_cognitive_simplification_task(self, markdown_text: str, tier: str) -> dict:
    """
    Background Celery task wrapper for the Cognitive Accommodations Layer.

    Executes the local Ollama-powered text simplification engine in an isolated 
    background worker process. This prevents long Ollama inference times (30-60s)
    from blocking the FastAPI web server's thread pool during concurrent student 
    accessibility requests.

    Args:
        markdown_text: The dense technical Markdown text to adapt.
        tier:          The accessibility adaptation tier to apply:
                       - "summary"       : Bulleted high-contrast concept breakdown
                       - "simplified"    : 5th-grade reading level rewrite
                       - "step_by_step"  : Linear sequential numbered procedure

    Returns:
        The full simplification result dictionary from reading_simplifier, containing:
        - "tier_processed"         : The tier that was applied
        - "adapted_markdown"       : The accessibility-adapted Markdown output string
        - "execution_time_seconds" : Precision inference latency metric
    """
    print(f"[Celery Worker] async_cognitive_simplification_task received. Tier: '{tier}' | "
          f"Input length: {len(markdown_text)} chars")

    try:
        result = simplify_text_cognitive(markdown_text, tier)
        print(f"[Celery Worker] Simplification complete. Tier: {result.get('tier_processed')} | "
              f"Output length: {len(result.get('adapted_markdown', ''))} chars")
        return result

    except Exception as exc:
        # Capture and log the full traceback for the worker console diagnostic output.
        # This is critical for identifying whether the failure originated from the 
        # Ollama connection layer, JSON parsing, or the model inference step itself.
        error_trace = traceback.format_exc()
        print(f"[Celery Worker FAILURE] async_cognitive_simplification_task crashed.\n{error_trace}")

        # Persist the structured error payload into the Redis result backend so the 
        # frontend's task status polling endpoint can surface a meaningful diagnostic 
        # message to the student rather than a generic timeout or 500 error.
        self.update_state(
            state=states.FAILURE,
            meta={
                "status": "error",
                "tier": tier,
                "error": str(exc),
                "trace": error_trace
            }
        )

        # Raise Ignore to preserve our manually structured FAILURE state in Redis
        # without Celery overwriting it with its own default exception representation.
        raise Ignore()
