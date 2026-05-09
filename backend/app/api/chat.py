from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.dto import ChatRequestDTO, ChatResponseDTO
from app.services.agent_runtime import invoke_agent

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponseDTO)
async def chat(req: ChatRequestDTO, db: Session = Depends(get_db)) -> ChatResponseDTO:
    try:
        result = await invoke_agent(db=db, session_id=req.session_id, message=req.message, locale=req.locale)
        return ChatResponseDTO(
            session_id=req.session_id,
            answer=result["answer"],
            tool=result.get("tool"),
            payload=result.get("payload"),
            debug=result.get("debug"),
            created_at=datetime.now(tz=timezone.utc),
        )
    except Exception as error:
        return ChatResponseDTO(
            session_id=req.session_id,
            answer="Tạm thời không thể xử lý do backend chưa kết nối được tới database hoặc dịch vụ AI.",
            tool="system_error",
            payload={"detail": str(error)},
            debug=None,
            created_at=datetime.now(tz=timezone.utc),
        )
