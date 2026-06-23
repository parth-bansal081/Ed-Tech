import os
import sys

# Ensure the parent directory is in the path to import pipeline functions correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Import the master extraction pipeline function
from master_extractor import unified_extract_text as extract_text_from_document

from glossary_extractor import extract_stem_glossary
from translation_auditor import audit_translation_logic
from services.openai_service import translate_text

# Define the Pydantic Request Schema
class DocumentTranslationRequest(BaseModel):
    file_path: str
    target_language: str

# Initialize the router instance
router = APIRouter(prefix="/translation", tags=["Translation Core"])

# Unified Orchestration Route
@router.post("/upload")
async def process_document_pipeline(payload: DocumentTranslationRequest):
    try:
        # Run Stage 1: Document Text Extraction
        extraction_result = extract_text_from_document(payload.file_path)
        
        # If the payload status indicates failure, raise an HTTPException
        if extraction_result.get("status") in ["error", "failed"]:
            raise HTTPException(status_code=400, detail=extraction_result.get("text", "Document extraction failed"))
            
        extracted_text = extraction_result.get("text", "")
        engine_used = extraction_result.get("engine_used", "unknown")
        
        # Run Stage 2: Glossary Keyword Extraction
        glossary = extract_stem_glossary(extracted_text, payload.target_language)
        
        # Run Stage 3: Real GPT-4 Translation
        translated_text = translate_text(extracted_text, payload.target_language)
        
        # Run Stage 4: Logic Check / Audit on actual translated text
        logic_check = audit_translation_logic(extracted_text, translated_text)
        
        # Unified Response Compilation
        return {
            "status": "success",
            "engine_used": engine_used,
            "extracted_text": extracted_text,
            "translated_text": translated_text,
            "glossary": glossary,
            "logic_check": logic_check
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions to be handled by FastAPI naturally
        raise
    except Exception as e:
        # Defensively catch any unhandled exceptions during the pipeline runtime
        raise HTTPException(status_code=500, detail=f"Internal Pipeline Error: {str(e)}")
