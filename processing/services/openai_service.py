import os
import services.env_loader # Load environment variables
import json
import requests

# Use GEMINI_API_KEY, fallback to GOOGLE_API_KEY if needed
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "[CRITICAL] GEMINI_API_KEY environment variable is missing. "
        "AeroLearn requires Gemini integration as a mandatory constraint. "
        "Please specify your key before running the server."
    )

class ResponseShim:
    def __init__(self, text: str):
        self.choices = [ChoiceShim(text)]

class ChoiceShim:
    def __init__(self, text: str):
        self.message = MessageShim(text)

class MessageShim:
    def __init__(self, text: str):
        self.content = text

class CompletionsShim:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def create(self, model: str, messages: list, response_format: dict = None, temperature: float = 0.5, max_tokens: int = 4096) -> ResponseShim:
        # Translate OpenAI messages format to Gemini REST API format
        system_instruction = ""
        contents = []

        for msg in messages:
            role = msg.get("role")
            content = msg.get("content")
            
            if role == "system":
                system_instruction = content
            else:
                parts = []
                if isinstance(content, list):
                    for part in content:
                        part_type = part.get("type")
                        if part_type == "text":
                            parts.append({"text": part.get("text")})
                        elif part_type == "image_url":
                            image_url_dict = part.get("image_url")
                            url = image_url_dict.get("url") if image_url_dict else ""
                            if url.startswith("data:"):
                                try:
                                    header, base64_data = url.split(";base64,")
                                    mime_type = header.split("data:")[1]
                                    parts.append({
                                        "inlineData": {
                                            "mimeType": mime_type,
                                            "data": base64_data
                                        }
                                    })
                                except Exception as e:
                                    print(f"[GeminiShim] Failed to parse base64 image: {e}")
                else:
                    parts.append({"text": content})

                gemini_role = "user" if role == "user" else "model"
                contents.append({
                    "role": gemini_role,
                    "parts": parts
                })

        # Map standard model requests to gemini-2.5-flash
        gemini_model = "gemini-2.5-flash"
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        
        payload = {
            "contents": contents
        }
        
        generation_config = {
            "temperature": temperature,
            "maxOutputTokens": max_tokens
        }
        
        if response_format and response_format.get("type") == "json_object":
            generation_config["responseMimeType"] = "application/json"
            
        payload["generationConfig"] = generation_config
        
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }
            
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=90)
            if res.status_code == 200:
                res_data = res.json()
                candidates = res_data.get("candidates", [])
                if candidates:
                    content_parts = candidates[0].get("content", {}).get("parts", [])
                    if content_parts:
                        text_output = content_parts[0].get("text", "")
                        return ResponseShim(text_output)
                raise Exception(f"No candidates or content found in response: {res.text}")
            else:
                raise Exception(f"HTTP {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[GeminiShim Error] Request failed: {e}")
            raise e

class ChatShim:
    def __init__(self, api_key: str):
        self.completions = CompletionsShim(api_key)

class GeminiClientShim:
    def __init__(self, api_key: str):
        self.chat = ChatShim(api_key)

# Global client replacement
openai_client = GeminiClientShim(GEMINI_API_KEY)

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
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during Gemini translation: {e}")
        return text + f"\n[Translation Failed: {e}]"

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
            model="gemini-2.5-flash",
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

def synthesize_visual_notes(transcript: str, keyframes: list) -> str:
    """
    Combines lecture audio transcript with key visual frames to author beautifully structured scannable notes.
    """
    system_prompt = (
        "You are an expert academic tutor. You are given a transcript of a lecture video, "
        "along with keyframes extracted from the video at different timestamps.\n"
        "Your task is to merge the transcript content and the visual information "
        "(such as diagrams, slides, text on whiteboards, and math equations shown in the frames) "
        "to generate a set of scannable, structured academic notes.\n"
        "Tone guidelines: friendly, clear, and encouraging.\n"
        "Formatting rules:\n"
        "- Maintain perfect LaTeX math equations.\n"
        "- Use headers, bullet points, and blockquotes for key concepts."
    )
    
    content_list = [
        {"type": "text", "text": f"Here is the lecture transcript:\n{transcript}\n\nHere are the visual keyframes for context:"}
    ]
    
    for idx, kf in enumerate(keyframes):
        content_list.append({
            "type": "text", 
            "text": f"Frame {idx+1} (approx. {kf.get('timestamp', 0):.1f}s):"
        })
        content_list.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{kf.get('base64')}"
            }
        })
        
    try:
        response = openai_client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content_list}
            ],
            temperature=0.4
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during visual notes synthesis: {e}")
        return transcript

def re_explain_topic(title: str, explanation: str) -> str:
    """
    Re-prompts the AI model to explain the topic using a different approach and a simpler analogy.
    """
    system_prompt = (
        "You are an expert educator. The learner did not understand the explanation provided for "
        f"the topic '{title}'. Your task is to re-explain the concept using a different, simpler approach "
        "and a clear, intuitive analogy.\n"
        "CRITICAL RULES:\n"
        "1. Do not use complex jargon. Keep sentence structures simple and vocabulary clear.\n"
        "2. Do not omit or mutate any LaTeX math equations if they are essential to the topic. Keep them intact.\n"
        "3. Output ONLY the new, simplified explanation without any conversational meta-introduction."
    )
    try:
        response = openai_client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Title: {title}\nPrevious Explanation: {explanation}"}
            ],
            temperature=0.6
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during re-explanation: {e}")
        return explanation + f"\n\n[Re-explanation failed: {e}]"

def generate_quiz(topic_title: str, explanation: str) -> list:
    """
    Generates 1-2 multiple-choice comprehension questions based on the topic explanation.
    """
    system_prompt = (
        "You are an expert academic evaluator. Create exactly 1 or 2 multiple-choice questions "
        f"to test comprehension of the topic '{topic_title}' based on the explanation provided.\n"
        "STRICT OUTPUT CONSTRAINTS:\n"
        "Return a valid JSON object with a single root key 'questions' containing a list of question objects. "
        "Each question object must contain exactly these keys:\n"
        "- 'question': the question text\n"
        "- 'options': a list of 3 or 4 choices\n"
        "- 'correct_option': the exact string from the options list representing the correct answer\n"
        "- 'explanation_if_wrong': a brief tip explaining the concept for students who select the wrong answer\n\n"
        "Ensure all LaTeX formulas are preserved and correctly formatted with $ or $$."
    )
    try:
        response = openai_client.chat.completions.create(
            model="gemini-2.5-flash",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Topic: {topic_title}\nExplanation: {explanation}"}
            ],
            temperature=0.5
        )
        raw = response.choices[0].message.content.strip()
        parsed = json.loads(raw)
        return parsed.get("questions", [])
    except Exception as e:
        print(f"Error generating quiz questions: {e}")
        return [{
            "question": f"What is the core concept of {topic_title}?",
            "options": [topic_title, "Option B", "Option C"],
            "correct_option": topic_title,
            "explanation_if_wrong": "Review the summary to understand this concept."
        }]



