from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.course_status import CourseStatus

# Các khoá được quản lý trạng thái mở/tạm ngưng.
MANAGED_COURSES = ("MLN111", "MLN122")


def get_status(db: Session, course_code: str) -> CourseStatus:
    """Lấy trạng thái của khoá, tự tạo bản ghi mặc định (mở) nếu chưa có."""
    status = db.scalar(
        select(CourseStatus).where(CourseStatus.course_code == course_code)
    )
    if status is None:
        status = CourseStatus(course_code=course_code, is_suspended=False)
        db.add(status)
        db.flush()
    return status


def list_statuses(db: Session) -> list[CourseStatus]:
    """Danh sách trạng thái cho toàn bộ khoá được quản lý (tạo mặc định nếu thiếu)."""
    existing = {
        status.course_code: status
        for status in db.scalars(select(CourseStatus)).all()
    }
    result: list[CourseStatus] = []
    created = False
    for course_code in MANAGED_COURSES:
        status = existing.get(course_code)
        if status is None:
            status = CourseStatus(course_code=course_code, is_suspended=False)
            db.add(status)
            created = True
        result.append(status)
    if created:
        db.flush()
    return result


def set_status(
    db: Session, course_code: str, is_suspended: bool, message: str | None
) -> CourseStatus:
    status = get_status(db, course_code)
    status.is_suspended = is_suspended
    status.message = message
    db.flush()
    return status
