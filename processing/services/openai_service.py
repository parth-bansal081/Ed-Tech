import os
from openai import OpenAI

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError(
        "[CRITICAL] OPENAI_API_KEY environment variable is missing. "
        "AeroLearn requires GPT-4 integration as a mandatory constraint. "
        "Please specify your key before running the server."
    )

# Initialize the OpenAI client globally
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def translate_text(text: str, target_lang: str, source_lang: str = "auto") -> str:
    """
    Translates input academic text to the target language, enforcing that LaTeX formulas 
    and scientific causality remain strictly unaltered.
    """
    system_prompt = (
        "You are an expert academic translator. Translate the input text from "
        f"{source_lang} to {target_lang}. "
        "CRITICAL RULES:\n"
        "1. Under no circumstances should you change, remove, translate, or mutate any LaTeX equations or formulas. "
        "All inline math (e.g. $F = ma$) and block math (e.g. $$...$$) must remain exactly identical to the original.\n"
        "2. Do not reverse or alter scientific causal relationships or facts (e.g., 'cause and effect' must remain correct).\n"
        "3. Output ONLY the translated text without any conversational prefix or suffix."
    )
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during OpenAI translation: {e}")
        return text + f"\n[Translation Failed: {e}]"

import json

def break_into_topics(text: str) -> list:
    """
    Breaks dense text into structured sub-topics for sequential explanation, matching the schema keys.
    """
    system_prompt = (
        "You are an expert educator. Break the provided academic text into logical topics/chapters. "
        "For each topic, provide: \n"
        "1. A clean, friendly title.\n"
        "2. A detailed, supportive explanation tailored to help students learn simply.\n"
        "3. A concise search query suitable for finding a supporting image on Unsplash/Pexels.\n\n"
        "STRICT OUTPUT CONSTRAINTS:\n"
        "Return a valid JSON object with a single root key 'topics' containing a list of objects. "
        "Each object must have exactly these keys: 'title', 'explanation', and 'image_query'.\n"
        "Ensure all LaTeX formulas inside explanations are formatted with $ or $$ and preserved unmutated."
    )
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.5
        )
        raw = response.choices[0].message.content.strip()
        parsed = json.loads(raw)
        return parsed.get("topics", [])
    except Exception as e:
        print(f"Error breaking text into topics: {e}")
        return [{
            "title": "Introduction",
            "explanation": text,
            "image_query": "education study"
        }]
