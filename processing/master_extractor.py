import time
import os
import sys
import io
import base64
import pdfplumber
import ollama
from PIL import Image

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

def qwen_vl_vision_transcription(base64_image: str) -> str:
    """
    Interfaces directly with the local Ollama process running qwen2.5-vl:3b.
    Executes a system-level instruction set for perfect structural Markdown 
    and LaTeX formulation.
    """
    system_prompt = (
        "You are an expert technical transcriber. "
        "You must read the visual layout (including handwriting, multi-column constraints, and textbook charts) "
        "and output the transcription cleanly in structural Markdown. "
        "You must maintain perfect LaTeX code structures for all mathematical formulations. "
        "Return strictly the transcribed text without conversational filler."
    )
    
    user_prompt = "Transcribe the contents of this image accurately according to your system instructions."
    
    try:
        response = ollama.generate(
            model='qwen2.5vl:3b',
            system=system_prompt,
            prompt=user_prompt,
            images=[base64_image]
        )
        return response.get('response', '')
    except Exception as e:
        print(f"Error during Ollama Qwen2.5-VL generation: {e}")
        return ""

def unified_extract_text(file_path: str) -> dict:
    """
    Master orchestration function dynamically routing files between programmatic vector parsing 
    and advanced neural Vision-Language-Model transcription based on textual footprint logic.
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
    
    # Phase 1: Try Native Programmatic Vector Extraction
    try:
        with pdfplumber.open(file_path) as pdf:
            text_chunks = []
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(page_text.strip())
            
            extracted_text = "\n".join(text_chunks)
            
            # Phase 2: Analyze Native Textual Footprint Threshold
            # If extraction is structurally successful but lacks digital text (scans/images).
            if len(extracted_text.strip()) < 50:
                print("⚡ Low native textual footprint or invalid PDF layout detected. Initializing local Qwen2.5-VL:3b neural transcription...")
                engine_used = "qwen_vl"
                
                # Export visual pages via pdfplumber's to_image() rendering utilities
                ocr_chunks = []
                for page in pdf.pages:
                    pil_matrix = page.to_image(resolution=300).original
                    b64_string = encode_image_to_base64(pil_matrix)
                    
                    transcription = qwen_vl_vision_transcription(b64_string)
                    if transcription:
                        ocr_chunks.append(transcription.strip())
                        
                extracted_text = "\n\n---\n\n".join(ocr_chunks)
                
    except Exception as pdf_exception:
        # A structural exception occurred (e.g., mislabeled JPEG image named as .pdf)
        requires_vision_fallback = True

    # Phase 3: Structural Exception VLM Routing
    if requires_vision_fallback:
        print("⚡ Low native textual footprint or invalid PDF layout detected. Initializing local Qwen2.5-VL:3b neural transcription...")
        engine_used = "qwen_vl"
        
        try:
            # Cleanly open the raw visual byte array using Pillow
            with Image.open(file_path) as img:
                # Normalize color space before encoding
                if img.mode != "RGB":
                    img = img.convert("RGB")
                    
                b64_string = encode_image_to_base64(img)
                extracted_text = qwen_vl_vision_transcription(b64_string)
                
        except Exception as img_exception:
            # File is structurally corrupt and completely unreadable by both layers
            return {
                "status": "error",
                "engine_used": "none",
                "text": f"Format detection failure. File is neither vector PDF nor raster Image. Error: {img_exception}",
                "execution_time_seconds": float(time.perf_counter() - start_time)
            }
            
    # Phase 4: Final Payload Assembly
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
        
    print(f"--- Booting Unified Master Extractor for: {sample_file} ---")
    
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
        # Display up to 1500 characters of the structured markdown
        print(result["text"][:1500])
        if len(result["text"]) > 1500:
            print("\n... [output truncated]")
        print("-" * 65)
    elif result["status"] == "error":
        print(f"\n[CRITICAL ERROR]: {result['text']}")
