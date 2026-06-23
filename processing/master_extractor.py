import time
import os
import sys
import io
import base64
import pdfplumber
from PIL import Image
from services.openai_service import openai_client

def encode_image_to_base64(pil_img: Image.Image) -> str:
    """
    Converts a visual PIL matrix into an encoded base64 string payload 
    (equivalent to the data payload of a Base64 Data URI string) 
    for transmission directly to the neural vision layer.
    """
    buffer = io.BytesIO()
    # Save as PNG to retain high-quality visual matrices for the neural net
    pil_img.save(buffer, format="PNG")
    # Extract binary and convert to standard utf-8 base64 string
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def gpt4_vision_transcription(base64_image: str) -> str:
    """
    Tier 3 extraction: Interfaces directly with the OpenAI API using gpt-4o vision.
    Executes a system-level instruction set for perfect structural Markdown 
    and LaTeX formulation.
    Used only when pdfplumber (Tier 1) AND pytesseract (Tier 2) both fail to produce
    sufficient text — e.g. handwriting, multi-column textbook layouts, embedded equations.
    """
    system_prompt = (
        "You are an expert technical transcriber. "
        "You must read the visual layout (including handwriting, multi-column constraints, and textbook charts) "
        "and output the transcription cleanly in structural Markdown. "
        "You must maintain perfect LaTeX code structures for all mathematical formulations. "
        "Return strictly the transcribed text without conversational filler."
    )
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Transcribe the contents of this image accurately according to your system instructions."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=4096,
            temperature=0.0
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during GPT-4o Vision generation: {e}")
        return ""

def pytesseract_ocr(pil_img: Image.Image) -> tuple[str, float]:
    """
    Tier 2 extraction: Runs pytesseract OCR on a PIL image.
    Returns (extracted_text, confidence_score 0.0-100.0).
    Confidence is averaged from Tesseract's per-word confidence values.
    Falls through to GPT-4o (Tier 3) if confidence < TESSERACT_CONFIDENCE_THRESHOLD.
    """
    try:
        import pytesseract
        # Get detailed data including confidence per word
        data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
        confidences = [int(c) for c in data['conf'] if str(c) != '-1']
        text = pytesseract.image_to_string(pil_img).strip()
        avg_confidence = (sum(confidences) / len(confidences)) if confidences else 0.0
        return text, avg_confidence
    except ImportError:
        print("[Tier 2] pytesseract not installed — skipping OCR tier, falling back to GPT-4o.")
        return "", 0.0
    except Exception as e:
        print(f"[Tier 2] pytesseract OCR failed: {e}")
        return "", 0.0

# Minimum tesseract confidence score (0-100) below which we escalate to GPT-4o
TESSERACT_CONFIDENCE_THRESHOLD = 60.0

def unified_extract_text(file_path: str) -> dict:
    """
    Master orchestration function implementing the THREE-TIER extraction pipeline
    as specified in the AeroLearn spec (Section 5.2, Step 2):

    Tier 1 — pdfplumber (native vector text extraction, cheapest, near-instant):
        Attempt programmatic text-layer extraction. If the returned text is
        non-trivial (length > 50 chars), treat as successful and return immediately.

    Tier 2 — pytesseract OCR (moderate cost, handles most scanned page images):
        Used when pdfplumber returns insufficient text (scanned/image PDFs).
        Tesseract per-word confidence is averaged. If confidence >= 60%, result
        is considered reliable and returned. If confidence < 60% (handwriting,
        complex math layouts, multi-column academic charts), escalate to Tier 3.

    Tier 3 — GPT-4o Vision (most expensive, highest accuracy for edge cases):
        Final fallback for handwriting, complex layouts, embedded diagrams and
        equations that both pdfplumber and tesseract fail to handle reliably.
        Never used before Tier 1 and Tier 2 have been attempted (cost guard).
    """
    start_time = time.perf_counter()
    
    if not os.path.exists(file_path):
        return {
            "status": "error",
            "engine_used": "none",
            "text": f"File '{file_path}' does not exist.",
            "execution_time_seconds": float(time.perf_counter() - start_time)
        }
        
    extracted_text = ""
    engine_used = "native"
    requires_vision_fallback = False
    
    # ── TIER 1: Native Programmatic Vector Extraction ──────────────────────────
    try:
        with pdfplumber.open(file_path) as pdf:
            text_chunks = []
            page_images = []  # hold rendered PIL images for Tier 2/3 if needed
            
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(page_text.strip())
                # Pre-render page image at 200 DPI for Tier 2/3 (lazy: only used if needed)
                page_images.append(page)
                
            extracted_text = "\n".join(text_chunks)
            
            # ── TIER 2: pytesseract OCR (scanned image PDFs) ───────────────────
            if len(extracted_text.strip()) < 50:
                print("⚡ [Tier 1] Low native textual footprint — escalating to pytesseract OCR (Tier 2)...")
                engine_used = "tesseract"
                ocr_chunks = []
                needs_vision = False
                
                for page in page_images:
                    pil_matrix = page.to_image(resolution=200).original
                    ocr_text, confidence = pytesseract_ocr(pil_matrix)
                    
                    print(f"[Tier 2] pytesseract confidence: {confidence:.1f}%")
                    
                    if confidence >= TESSERACT_CONFIDENCE_THRESHOLD and ocr_text:
                        ocr_chunks.append(ocr_text.strip())
                    else:
                        # ── TIER 3: GPT-4o Vision (per low-confidence page) ────
                        print(f"⚡ [Tier 2] Confidence {confidence:.1f}% < {TESSERACT_CONFIDENCE_THRESHOLD}% threshold "
                              f"— escalating page to GPT-4o Vision (Tier 3)...")
                        engine_used = "gpt_4o"
                        needs_vision = True
                        b64_string = encode_image_to_base64(pil_matrix)
                        transcription = gpt4_vision_transcription(b64_string)
                        if transcription:
                            ocr_chunks.append(transcription.strip())
                            
                extracted_text = "\n\n---\n\n".join(ocr_chunks)
                
    except Exception as pdf_exception:
        # A structural exception occurred (e.g., mislabeled JPEG image named as .pdf)
        print(f"[Tier 1] pdfplumber structural exception: {pdf_exception} — routing to vision fallback.")
        requires_vision_fallback = True

    # ── TIER 3 (direct image): Structural Exception VLM Routing ────────────────
    # Reached when pdfplumber itself throws (i.e., file is NOT a valid PDF at all).
    if requires_vision_fallback:
        print("⚡ [Tier 3] Non-PDF input detected — initializing GPT-4o Vision directly on image...")
        engine_used = "gpt_4o"
        
        try:
            # Cleanly open the raw visual byte array using Pillow
            with Image.open(file_path) as img:
                # Normalize color space before encoding
                if img.mode != "RGB":
                    img = img.convert("RGB")
                    
                b64_string = encode_image_to_base64(img)
                extracted_text = gpt4_vision_transcription(b64_string)
                
        except Exception as img_exception:
            # File is structurally corrupt and completely unreadable by all three layers
            return {
                "status": "error",
                "engine_used": "none",
                "text": f"Format detection failure. File is neither vector PDF, image-PDF, nor raster Image. Error: {img_exception}",
                "execution_time_seconds": float(time.perf_counter() - start_time)
            }
            
    # ── PHASE 4: Final Payload Assembly ────────────────────────────────────────
    end_time = time.perf_counter()
    return {
        "status": "success",
        "engine_used": engine_used,
        "text": extracted_text.strip(),
        "execution_time_seconds": float(end_time - start_time)
    }

if __name__ == "__main__":
    sample_file = "test_document.pdf"
    if len(sys.argv) > 1:
        sample_file = sys.argv[1]
        
    print(f"--- Booting Unified Master Extractor (3-Tier) for: {sample_file} ---")
    
    result = unified_extract_text(sample_file)
    
    print("\n" + "="*65)
    print("                 MASTER EXTRACTION PAYLOAD")
    print("="*65)
    print(f"Status           : {result['status'].upper()}")
    print(f"Engine Used      : {result['engine_used'].upper()}")
    print(f"Execution Time   : {result['execution_time_seconds']:.6f} seconds")
    print(f"Text Length      : {len(result['text'])} characters")
    print("="*65)
    
    if result["status"] == "success" and result["text"]:
        print("\n[Markdown Transcription Preview]")
        print("-" * 65)
        print(result["text"][:1500])
        if len(result["text"]) > 1500:
            print("\n... [output truncated]")
        print("-" * 65)
    elif result["status"] == "error":
        print(f"\n[CRITICAL ERROR]: {result['text']}")
