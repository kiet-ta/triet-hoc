from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.survey_schema import SurveySubmitRequest, SurveySubmitResponse
from app.services.course_service import ensure_course_active
from app.services.survey_service import SurveyValidationError, submit_survey

router = APIRouter(prefix="/survey", tags=["survey"])


from app.core.security import get_current_user_optional
from app.models.user import User

@router.post("/submit", response_model=SurveySubmitResponse)
def submit(
    payload: SurveySubmitRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> SurveySubmitResponse:
    ensure_course_active(db, payload.courseCode)
    try:
        user_id = current_user.id if current_user else None
        return submit_survey(db, payload, user_id=user_id, user_agent=None).response
    except SurveyValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
