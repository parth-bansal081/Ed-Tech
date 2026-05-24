import time
import json
import ollama

def audit_translation_logic(original_text: str, translated_text: str) -> dict:
    """
    Core orchestration function to prototype the QA Logic Check gate.
    
    This function interfaces with the local Ollama instance to evaluate 
    if a translation has broken STEM-specific structures (like LaTeX equations)
    or altered scientific causal statements.
    
    Why this is critical for Accessibility:
    --------------------------------------
    When educational materials are translated for students with cognitive disabilities,
    the structural integrity of the content is paramount. A broken LaTeX equation or 
    a corrupted causal scientific statement (e.g., swapping "causes" with "is caused by")
    creates significant cognitive load and can introduce fundamental misunderstandings 
    that are much harder for these students to identify and recover from compared to 
    neurotypical students. By introducing an automated LLM logic check as a verification step 
    before the material reaches the student, we create a robust safeguard against 
    technical errors, ensuring that the cognitive accessibility formatting and the 
    core academic truths remain perfectly intact.
    """
    start_time = time.perf_counter()
    
    system_prompt = (
        "You are an Expert STEM Code and Logic Auditor. "
        "Your task is to meticulously compare an original educational text against its translation. "
        "You must strictly verify two things:\n"
        "1. Mathematical LaTeX formatting remains structurally untouched and perfectly valid.\n"
        "2. Scientific causal statements have not been corrupted by incorrect word choices "
        "(e.g., reversing cause and effect, or losing critical nuance).\n"
        "Return your evaluation in a clean, predictable JSON format containing exactly two keys:\n"
        '- "logic_check_passed": true if the translation is perfect, false if there are any errors.\n'
        '- "warnings": a list of explicit textual warnings describing exactly which line or equation was broken, '
        "or an empty list if perfect."
    )
    
    user_prompt = (
        f"Original Text:\n{original_text}\n\n"
        f"Translated Text:\n{translated_text}\n\n"
        "Evaluate the translation according to your system instructions and output the JSON."
    )
    
    try:
        # Wrap token-generation step inside precision time.perf_counter() tracking metrics
        response = ollama.generate(
            model='qwen2.5vl:3b',
            system=system_prompt,
            prompt=user_prompt,
            format='json'  # Enforce JSON output format
        )
        
        # Parse the JSON response
        result_json = json.loads(response.get('response', '{}'))
        
        # Ensure the response has the expected keys, provide safe defaults if parsing fails slightly
        evaluation = {
            "logic_check_passed": result_json.get("logic_check_passed", False),
            "warnings": result_json.get("warnings", ["Failed to parse specific warnings from model."]) 
                        if "warnings" not in result_json else result_json.get("warnings", [])
        }
        
    except json.JSONDecodeError as e:
        evaluation = {
            "logic_check_passed": False,
            "warnings": [f"Model failed to return valid JSON. Error: {e}"]
        }
    except Exception as e:
        evaluation = {
            "logic_check_passed": False,
            "warnings": [f"Error during Ollama generation: {e}"]
        }
        
    end_time = time.perf_counter()
    evaluation["execution_time_seconds"] = float(end_time - start_time)
    
    return evaluation

if __name__ == "__main__":
    # Sample execution block to prototype the auditor
    
    # Example 1: Perfect translation
    sample_original = "The force of gravity is given by $F = G \\frac{m_1 m_2}{r^2}$. Increased mass causes increased force."
    sample_translated = "La fuerza de gravedad está dada por $F = G \\frac{m_1 m_2}{r^2}$. El aumento de masa causa un aumento de fuerza."
    
    print("--- Running Audit on Perfect Translation ---")
    result = audit_translation_logic(sample_original, sample_translated)
    print(json.dumps(result, indent=2))
    
    # Example 2: Broken translation (corrupted LaTeX and causal flip)
    broken_original = "The process of photosynthesis uses light energy to convert carbon dioxide and water into glucose. $6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$"
    broken_translated = "El proceso de fotosíntesis usa energía luminosa para convertir glucosa en dióxido de carbono y agua. $6CO2 + 6H2O = C6H12O6 + 6O2$"
    
    print("\n--- Running Audit on Broken Translation ---")
    broken_result = audit_translation_logic(broken_original, broken_translated)
    print(json.dumps(broken_result, indent=2))
