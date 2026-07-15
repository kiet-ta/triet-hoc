from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import IdMixin, TimestampMixin


class CourseStatus(IdMixin, TimestampMixin, Base):
    """Trạng thái mở/tạm ngưng truy cập của một khoá (course_code).

    Khi ``is_suspended`` = True thì toàn bộ người dùng, kể cả khách vãng lai,
    sẽ không truy cập được bài quiz của khoá đó.
    """

    __tablename__ = "course_status"

    course_code: Mapped[str] = mapped_column(
        String(32), unique=True, index=True, nullable=False
    )
    is_suspended: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0", nullable=False
    )
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
