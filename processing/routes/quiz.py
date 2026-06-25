from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.openai_service import generate_quiz

router = APIRouter(prefix="/quiz", tags=["quiz"])

class QuizRequest(BaseModel):
    title: str
    explanation: str

@router.post("/generate")
async def generate_quiz_endpoint(payload: QuizRequest):
    try:
        questions = generate_quiz(payload.title, payload.explanation)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
