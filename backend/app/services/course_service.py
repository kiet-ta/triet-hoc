from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories import course_status_repository

DEFAULT_SUSPENDED_MESSAGE = (
    "Khoá này đang tạm ngưng truy cập để bảo trì. Vui lòng quay lại sau nhé!"
)


def ensure_course_active(db: Session, course_code: str) -> None:
    """Chặn truy cập (kể cả khách vãng lai) nếu khoá đang bị tạm ngưng."""
    status_row = course_status_repository.get_status(db, course_code)
    if status_row.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=status_row.message or DEFAULT_SUSPENDED_MESSAGE,
        )
