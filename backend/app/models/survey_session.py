from datetime import datetime

from sqlalchemy import DateTime, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import IdMixin
from app.models.mixins import utc_now


class SurveySession(IdMixin, Base):
    __tablename__ = "survey_sessions"

    anonymous_client_id: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    course_code: Mapped[str] = mapped_column(String(32), index=True, server_default="MLN111", nullable=False)
    share_slug: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="survey_sessions")
    answers = relationship("SurveyAnswer", back_populates="session", cascade="all, delete-orphan")
    result = relationship("SurveyResult", back_populates="session", uselist=False)
