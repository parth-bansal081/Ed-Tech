import os
import requests

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[Warning] Supabase environment variables are missing. DB status updates will be mocked.")

def get_headers(user_token: str = None):
    auth_token = user_token or SUPABASE_KEY
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def supabase_request(method: str, path: str, body: dict = None, user_token: str = None):
    """
    Generic Supabase REST API helper used by the hive and document endpoints.
    method: GET | POST | PATCH | DELETE
    path:   PostgREST table path, e.g. 'knowledge_hive_notes?order=upvotes.desc'
    Returns the parsed JSON response body, or None on failure.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    try:
        resp = requests.request(
            method.upper(),
            url,
            json=body,
            headers=get_headers(user_token),
            timeout=15
        )
        if resp.status_code in (200, 201, 204):
            try:
                return resp.json()
            except Exception:
                return []
        print(f"[Supabase Error] {method} {path} → {resp.status_code}: {resp.text}")
        return None
    except Exception as e:
        print(f"[Supabase Exception] {method} {path}: {e}")
        return None

def update_document_status(document_id: str, status: str, extra_fields: dict = None, user_token: str = None):
    """
    Updates the status column of a document in Supabase.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
        
    url = f"{SUPABASE_URL}/rest/v1/documents?id=eq.{document_id}"
    payload = {"status": status}
    if extra_fields:
        payload.update(extra_fields)
        
    try:
        response = requests.patch(url, json=payload, headers=get_headers(user_token))
        if response.status_code not in (200, 201, 204):
            print(f"[Supabase Error] Failed to update document {document_id}: {response.text}")
    except Exception as e:
        print(f"[Supabase Exception] Failed to update document {document_id}: {e}")

def create_topic(document_id: str, order_index: int, title: str, explanation: str, image_query: str, image_url: str = None, audio_path: str = None, user_token: str = None):
    """
    Creates a new topic in Supabase linked to a document.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
        
    url = f"{SUPABASE_URL}/rest/v1/topics"
    payload = {
        "document_id": document_id,
        "order_index": order_index,
        "title": title,
        "explanation": explanation,
        "image_query": image_query,
        "image_url": image_url,
        "audio_path": audio_path
    }
    
    try:
        response = requests.post(url, json=payload, headers=get_headers(user_token))
        if response.status_code in (200, 201):
            return response.json()
        print(f"[Supabase Error] Failed to create topic: {response.text}")
    except Exception as e:
        print(f"[Supabase Exception] Failed to create topic: {e}")
    return None

def fetch_document(document_id: str, user_token: str = None):
    """
    Fetches document details from Supabase.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
        
    url = f"{SUPABASE_URL}/rest/v1/documents?id=eq.{document_id}"
    try:
        response = requests.get(url, headers=get_headers(user_token))
        if response.status_code == 200:
            rows = response.json()
            return rows[0] if rows else None
    except Exception as e:
        print(f"[Supabase Exception] Failed to fetch document {document_id}: {e}")
    return None
