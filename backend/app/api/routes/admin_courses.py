from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_admin
from app.repositories import course_status_repository
from app.repositories.course_status_repository import MANAGED_COURSES
from app.schemas.course_schema import CourseStatusItem, CourseStatusUpdate

router = APIRouter(
    prefix="/admin/courses",
    tags=["admin-courses"],
    dependencies=[Depends(get_current_admin)],
)


def _to_item(status_row) -> CourseStatusItem:
    return CourseStatusItem(
        courseCode=status_row.course_code,
        isSuspended=status_row.is_suspended,
        message=status_row.message,
    )


@router.get("", response_model=list[CourseStatusItem])
def list_course_statuses(db: Session = Depends(get_db)) -> list[CourseStatusItem]:
    statuses = course_status_repository.list_statuses(db)
    db.commit()
    return [_to_item(status_row) for status_row in statuses]


@router.put("/{course_code}", response_model=CourseStatusItem)
def update_course_status(
    course_code: str,
    payload: CourseStatusUpdate,
    db: Session = Depends(get_db),
) -> CourseStatusItem:
    if course_code not in MANAGED_COURSES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khoá học.",
        )
    message = (payload.message or "").strip() or None
    status_row = course_status_repository.set_status(
        db, course_code, payload.isSuspended, message
    )
    db.commit()
    return _to_item(status_row)
