from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories import course_status_repository
from app.schemas.course_schema import CourseStatusItem

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/status", response_model=list[CourseStatusItem])
def get_course_statuses(db: Session = Depends(get_db)) -> list[CourseStatusItem]:
    statuses = course_status_repository.list_statuses(db)
    db.commit()
    return [
        CourseStatusItem(
            courseCode=status.course_code,
            isSuspended=status.is_suspended,
            message=status.message,
        )
        for status in statuses
    ]
