import time
import json
from services.openai_service import openai_client

def simplify_text_cognitive(markdown_text: str, tier: str) -> dict:
    """
    Core orchestration function to dynamically alter the complexity of educational text.

    Why this is critical for Cognitive Accessibility:
    -----------------------------------------------
    Students with neurodivergent profiles (e.g., ADHD, Dyslexia, Autism Spectrum Disorder)
    or those with learning disabilities often experience severe cognitive overload when 
    confronted with dense, unstructured academic blocks of text. The 'wall of text' effect 
    rapidly depletes executive functioning resources, leading to cognitive anxiety, 
    task avoidance, and poor reading flow.

    By allowing students to toggle content complexity on-the-fly — switching between a 
    high-level "summary", a gentler "simplified" reading, or a granular "step_by_step" 
    procedural breakdown — we hand them the agency to dynamically dial in the exact 
    scaffolding structure their brain requires in that specific moment.

    A highly anxious student can toggle to "summary" to anchor themselves to core 
    concepts first, then switch to "step_by_step" to process complex logic without 
    losing their place. This granular control fundamentally lowers cognitive anxiety, 
    reduces working memory strain, and vastly improves overall reading flow and 
    long-term academic retention.

    Args:
        markdown_text: The dense, technical academic Markdown text to be adapted.
        tier:          The accessibility adaptation level to apply:
                       - "summary"       : Bulleted high-contrast breakdown of core formulas and concepts.
                       - "simplified"    : 5th-grade reading level rewrite, keeping technical definitions.
                       - "step_by_step"  : Linear, sequential numbered procedure for tracking difficulties.

    Returns:
        A clean dictionary with keys:
        - "tier_processed"         : The tier that was applied.
        - "adapted_markdown"       : The accessibility-adapted Markdown string.
        - "execution_time_seconds" : Precision latency metric for the inference step.
    """
    print(f"--- Initiating Cognitive Accommodations Layer (Tier: '{tier}') ---")
    start_time = time.perf_counter()

    # Map each valid tier to a precise, actionable LLM instruction directive.
    # This structured mapping prevents ambiguity and ensures the model receives 
    # an unambiguous behavioral contract per tier.
    tier_instructions = {
        "summary": (
            "Create a high-contrast, structured, bulleted breakdown focusing ONLY on core formulas, "
            "critical definitions, and the main concepts. Use bold headers for each concept group."
        ),
        "simplified": (
            "Rewrite the text in a clear reading layout at approximately a 5th-grade reading level. "
            "Eliminate dense academic vocabulary and convoluted sentence structures, but keep all "
            "technical STEM definitions and proper nouns completely intact."
        ),
        "step_by_step": (
            "Restructure the entire explanation into a linear, sequential numbered procedure layout. "
            "Break down all logic so a student with tracking difficulties can process it one "
            "granular, clearly labeled step at a time. Each step must be self-contained."
        )
    }

    # Enforce a safe fallback if an invalid tier string is somehow passed downstream
    active_instruction = tier_instructions.get(tier, tier_instructions["simplified"])

    system_prompt = (
        "You are an Expert Neurodivergent Educator and Cognitive Accessibility Specialist. "
        "Your sole objective is to adapt highly technical academic Markdown text into a specific "
        "accessibility format precisely tailored for students with cognitive and learning difficulties.\n\n"
        f"ADAPTATION DIRECTIVE: {active_instruction}\n\n"
        "CRITICAL RULES — YOU MUST FOLLOW THESE WITHOUT EXCEPTION:\n"
        "1. Preserve ALL mathematical formulations and scientific equations inside their original valid "
        "LaTeX markup. Use $ for inline formulas and $$ for standalone block equations. "
        "Under no circumstances should any LaTeX math formatting be removed, rewritten, or mutated.\n"
        "2. Respond STRICTLY with a valid raw JSON dictionary. Do NOT include any conversational "
        "padding, introductory sentences, or markdown code fences (such as ```json ... ```).\n"
        "3. The JSON dictionary MUST contain exactly two keys:\n"
        '   - "tier_processed": a string confirming the tier you processed (e.g., "summary").\n'
        '   - "adapted_markdown": a string containing the complete accessibility-adapted Markdown output.'
    )

    user_prompt = (
        f"Requested Accessibility Tier: {tier}\n\n"
        f"Raw Academic Markdown Text to Adapt:\n\n{markdown_text}"
    )

    try:
        print("[Neural Processing] Routing payload to OpenAI GPT-4 inference engine...")
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )

        # Extract the raw string response from the payload
        raw_response = response.choices[0].message.content.strip()

        # Defensively strip any rogue markdown fences the model may have injected
        if raw_response.startswith('```json'):
            raw_response = raw_response[7:]
        if raw_response.startswith('```'):
            raw_response = raw_response[3:]
        if raw_response.endswith('```'):
            raw_response = raw_response[:-3]

        result_dict = json.loads(raw_response.strip())

        # Enforce exact schema compliance — provide safe defaults if keys are missing
        final_payload = {
            "tier_processed": result_dict.get("tier_processed", tier),
            "adapted_markdown": result_dict.get(
                "adapted_markdown",
                "[Error] Model returned a valid JSON structure but omitted the adapted_markdown key."
            )
        }

    except json.JSONDecodeError as e:
        print(f"[CRITICAL FAILURE] JSON structural collapse during decoding: {e}")
        final_payload = {
            "tier_processed": tier,
            "adapted_markdown": "[Error] Neural model failed to return a valid structured JSON payload."
        }
    except Exception as e:
        print(f"[CRITICAL FAILURE] Unhandled error during GPT-4 generation: {e}")
        final_payload = {
            "tier_processed": tier,
            "adapted_markdown": f"[Error] Neural synthesis failed with exception: {e}"
        }

    end_time = time.perf_counter()
    latency = float(end_time - start_time)
    final_payload["execution_time_seconds"] = latency

    print(f"[Latency Metric] Cognitive Adaptation completed in {latency:.4f} seconds.")
    return final_payload


if __name__ == "__main__":
    # Prototype test execution against all three accessibility tiers
    sample_academic_text = (
        "In classical mechanics, Newton's second law of motion dictates that the vector sum of the forces "
        "exerted on an object is equal to the mass of that object multiplied by its acceleration vector, "
        r"formally expressed as $\sum F = ma$. Furthermore, if the mass of the system remains constant, "
        r"the differential form of the momentum $p = mv$ can be evaluated as $F = \frac{dp}{dt} = m \frac{dv}{dt}$. "
        "This principle serves as the fundamental cornerstone for analyzing dynamic inertial frames."
    )

    print("==================================================")
    print("   PROTOTYPE RUN: COGNITIVE ACCOMMODATIONS LAYER")
    print("==================================================\n")
    print("--- RAW INPUT TEXT ---")
    print(sample_academic_text)
    print("----------------------\n")

    for tier in ["summary", "simplified", "step_by_step"]:
        result = simplify_text_cognitive(sample_academic_text, tier)
        print(f"\n=== [TIER: {tier.upper()}] OUTPUT ===")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print()
