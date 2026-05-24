import time
import json
import ollama

def extract_stem_glossary(text_content: str, target_language: str) -> list:
    """
    Core orchestration function for programmatic keyword extraction.
    
    This pipeline interfaces with a local Ollama model to dynamically identify, 
    translate, and define the most complex STEM terminology from a given text payload.
    
    Why Structured JSON Lexicons Matter for Next.js Frontends:
    ----------------------------------------------------------
    By compiling domain-specific words into highly structured key-value arrays 
    (e.g., [{"term_en": "photosynthesis", "term_target": "fotosíntesis", "definition": "..."}]), 
    we decouple the raw text payload from its semantic metadata. 
    
    When the text is delivered to the Next.js frontend, a custom React hook or component 
    (like a Markdown parser) can iterate over this array. It maps these exact terms to 
    invisible anchor wrappers within the rendered paragraph. This enables contextual definitions 
    to seamlessly trigger on mouse-hover states (via tooltips or popovers) dynamically, 
    without having to hardcode dictionaries or bloat the initial DOM tree. This heavily 
    optimizes cognitive accessibility by offering definitions 'on-demand' precisely when 
    the student needs them.
    """
    start_time = time.perf_counter()
    
    system_prompt = (
        "You are a World-Class STEM Lexicographer and Textbook Indexer. "
        "Your task is to analyze the provided educational text and identify the top 3-5 "
        "highly complex, domain-specific academic or engineering terms.\n"
        f"For each term, you must translate it into the target language: {target_language}. "
        "Then, generate a clear, one-sentence plain-language definition for the term.\n\n"
        "STRICT OUTPUT CONSTRAINTS:\n"
        "You must respond STRICTLY with a valid raw JSON list of dictionaries. "
        "Do not include any conversational padding, introductory text, or markdown code blocks (like ```json). "
        'Each dictionary in the list must contain exactly these three keys: '
        '"term_en", "term_target", and "definition".'
    )
    
    user_prompt = f"Target Language: {target_language}\n\nText to analyze:\n{text_content}"
    
    glossary_list = []
    
    try:
        response = ollama.generate(
            model='qwen2.5vl:3b',
            system=system_prompt,
            prompt=user_prompt,
            format='json'
        )
        
        # Safely parse the strict JSON response
        raw_response = response.get('response', '[]').strip()
        
        # Sometimes models wrap in markdown despite instructions, so we clean it just in case
        if raw_response.startswith('```json'):
            raw_response = raw_response[7:]
        if raw_response.endswith('```'):
            raw_response = raw_response[:-3]
            
        glossary_list = json.loads(raw_response.strip())
        
        # Ensure it's a list
        if not isinstance(glossary_list, list):
            if isinstance(glossary_list, dict):
                # Try finding a list within the dict keys
                for val in glossary_list.values():
                    if isinstance(val, list):
                        glossary_list = val
                        break
                else:
                    glossary_list = [glossary_list]
            else:
                glossary_list = []
                
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON response: {e}")
        print(f"Raw Model Output:\n{response.get('response', '')}")
    except Exception as e:
        print(f"Error during Ollama generation: {e}")
        
    end_time = time.perf_counter()
    
    print(f"[Execution Latency] Glossary extraction completed in {end_time - start_time:.4f} seconds.")
    
    return glossary_list

if __name__ == "__main__":
    # Sample execution block to prototype the extractor
    
    sample_text = (
        "During cellular respiration, the mitochondrion operates as the powerhouse of the cell, "
        "utilizing oxidative phosphorylation to generate adenosine triphosphate (ATP). "
        "This biochemical process creates a proton gradient across the inner mitochondrial membrane."
    )
    
    target_lang = "Spanish"
    
    print(f"--- Booting Glossary Extractor (Target: {target_lang}) ---")
    print(f"Analyzing Text: {sample_text[:50]}...\n")
    
    result = extract_stem_glossary(sample_text, target_lang)
    
    print("\n=== EXTRACTED JSON GLOSSARY ===")
    print(json.dumps(result, indent=2, ensure_ascii=False))
