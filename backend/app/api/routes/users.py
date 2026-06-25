from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.survey_session import SurveySession
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/history")
def get_my_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Lấy danh sách session có kết quả của user hiện tại
    query = (
        select(SurveySession)
        .options(
            joinedload(SurveySession.result)
        )
        .where(SurveySession.user_id == current_user.id)
        .where(SurveySession.result.has())
        .order_by(SurveySession.created_at.desc())
    )
    
    sessions = db.scalars(query).all()
    
    # Format lại kết quả cho frontend dễ dùng
    history = []
    for session in sessions:
        history.append({
            "id": session.id,
            "created_at": session.created_at,
            "share_slug": session.share_slug,
            "result_summary": session.result.result_summary if session.result else None,
        })
        
    return history

from pydantic import BaseModel

class SyncHistoryRequest(BaseModel):
    anonymous_client_id: str

@router.post("/me/sync-history")
def sync_history(
    payload: SyncHistoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy import update
    stmt = (
        update(SurveySession)
        .where(SurveySession.anonymous_client_id == payload.anonymous_client_id)
        .where(SurveySession.user_id.is_(None))
        .values(user_id=current_user.id)
    )
    db.execute(stmt)
    db.commit()
    return {"success": True}
