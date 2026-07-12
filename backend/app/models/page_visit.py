from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import IdMixin, TimestampMixin


class PageVisit(IdMixin, TimestampMixin, Base):
    __tablename__ = "page_visits"

    anonymous_client_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)

    # Request metadata
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Parsed from User-Agent
    browser: Mapped[str | None] = mapped_column(String(100), nullable=True)
    browser_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    os: Mapped[str | None] = mapped_column(String(100), nullable=True)
    os_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    device_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # From request headers
    accept_language: Mapped[str | None] = mapped_column(String(255), nullable=True)
    referer: Mapped[str | None] = mapped_column(Text, nullable=True)

    # From frontend payload - screen & display
    screen_width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    screen_height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    viewport_width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    viewport_height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pixel_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    color_depth: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # From frontend payload - hardware
    cpu_cores: Mapped[int | None] = mapped_column(Integer, nullable=True)
    device_memory: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_touch_points: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gpu_renderer: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # From frontend payload - network
    connection_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    downlink_speed: Mapped[float | None] = mapped_column(Float, nullable=True)

    # From frontend payload - preferences & capabilities
    cookies_enabled: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    do_not_track: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    dark_mode: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    reduced_motion: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    pdf_viewer: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    plugins_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # From frontend payload - locale & context
    timezone: Mapped[str | None] = mapped_column(String(100), nullable=True)
    language: Mapped[str | None] = mapped_column(String(20), nullable=True)
    languages: Mapped[str | None] = mapped_column(String(255), nullable=True)
    platform: Mapped[str | None] = mapped_column(String(100), nullable=True)
    page_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    canvas_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    webgl_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    battery_level: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_charging: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
