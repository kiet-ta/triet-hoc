import re

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.page_visit import PageVisit

router = APIRouter(prefix="/tracking", tags=["tracking"])


def _parse_user_agent(ua_string: str | None) -> dict:
    """Simple user-agent parser without external dependencies."""
    if not ua_string:
        return {}

    result = {"browser": None, "browser_version": None, "os": None, "os_version": None, "device_type": "desktop"}
    ua = ua_string.lower()

    # Detect device type
    if any(kw in ua for kw in ["mobile", "android", "iphone", "ipod"]):
        result["device_type"] = "mobile"
    elif any(kw in ua for kw in ["ipad", "tablet"]):
        result["device_type"] = "tablet"

    # Detect OS
    if "windows nt 10" in ua:
        result["os"], result["os_version"] = "Windows", "10/11"
    elif "windows nt" in ua:
        result["os"] = "Windows"
    elif "mac os x" in ua:
        result["os"] = "macOS"
        m = re.search(r'mac os x ([\d_]+)', ua)
        if m:
            result["os_version"] = m.group(1).replace('_', '.')
    elif "android" in ua:
        result["os"] = "Android"
        m = re.search(r'android ([\d.]+)', ua)
        if m:
            result["os_version"] = m.group(1)
    elif "iphone os" in ua or "ipad" in ua:
        result["os"] = "iOS"
        m = re.search(r'os ([\d_]+)', ua)
        if m:
            result["os_version"] = m.group(1).replace('_', '.')
    elif "linux" in ua:
        result["os"] = "Linux"
    elif "cros" in ua:
        result["os"] = "ChromeOS"

    # Detect Browser (order matters)
    if "opr/" in ua or "opera" in ua:
        result["browser"] = "Opera"
        m = re.search(r'opr/([\d.]+)', ua)
        if m:
            result["browser_version"] = m.group(1)
    elif "edg/" in ua:
        result["browser"] = "Edge"
        m = re.search(r'edg/([\d.]+)', ua)
        if m:
            result["browser_version"] = m.group(1)
    elif "firefox/" in ua:
        result["browser"] = "Firefox"
        m = re.search(r'firefox/([\d.]+)', ua)
        if m:
            result["browser_version"] = m.group(1)
    elif "chrome/" in ua and "chromium" not in ua:
        result["browser"] = "Chrome"
        m = re.search(r'chrome/([\d.]+)', ua)
        if m:
            result["browser_version"] = m.group(1)
    elif "safari/" in ua:
        result["browser"] = "Safari"
        m = re.search(r'version/([\d.]+)', ua)
        if m:
            result["browser_version"] = m.group(1)

    return result


class VisitRequest(BaseModel):
    anonymousClientId: str
    # Screen & display
    screenWidth: int | None = None
    screenHeight: int | None = None
    viewportWidth: int | None = None
    viewportHeight: int | None = None
    pixelRatio: float | None = None
    colorDepth: int | None = None
    # Hardware
    cpuCores: int | None = None
    deviceMemory: float | None = None
    maxTouchPoints: int | None = None
    gpuRenderer: str | None = None
    # Network
    connectionType: str | None = None
    downlinkSpeed: float | None = None
    # Preferences
    cookiesEnabled: bool | None = None
    doNotTrack: bool | None = None
    darkMode: bool | None = None
    reducedMotion: bool | None = None
    pdfViewer: bool | None = None
    pluginsCount: int | None = None
    # Locale & context
    timezone: str | None = None
    language: str | None = None
    languages: str | None = None
    platform: str | None = None
    pageUrl: str | None = None
    canvasHash: str | None = None
    webglHash: str | None = None
    batteryLevel: float | None = None
    batteryCharging: bool | None = None


@router.post("/visit")
def record_visit(body: VisitRequest, request: Request, db: Session = Depends(get_db)):
    ua_string = request.headers.get("user-agent")
    parsed_ua = _parse_user_agent(ua_string)

    ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or request.headers.get("x-real-ip")
        or (request.client.host if request.client else None)
    )

    visit = PageVisit(
        anonymous_client_id=body.anonymousClientId,
        ip_address=ip,
        user_agent=ua_string,
        browser=parsed_ua.get("browser"),
        browser_version=parsed_ua.get("browser_version"),
        os=parsed_ua.get("os"),
        os_version=parsed_ua.get("os_version"),
        device_type=parsed_ua.get("device_type"),
        accept_language=request.headers.get("accept-language"),
        referer=request.headers.get("referer"),
        screen_width=body.screenWidth,
        screen_height=body.screenHeight,
        viewport_width=body.viewportWidth,
        viewport_height=body.viewportHeight,
        pixel_ratio=body.pixelRatio,
        color_depth=body.colorDepth,
        cpu_cores=body.cpuCores,
        device_memory=body.deviceMemory,
        max_touch_points=body.maxTouchPoints,
        gpu_renderer=body.gpuRenderer,
        connection_type=body.connectionType,
        downlink_speed=body.downlinkSpeed,
        cookies_enabled=body.cookiesEnabled,
        do_not_track=body.doNotTrack,
        dark_mode=body.darkMode,
        reduced_motion=body.reducedMotion,
        pdf_viewer=body.pdfViewer,
        plugins_count=body.pluginsCount,
        timezone=body.timezone,
        language=body.language,
        languages=body.languages,
        platform=body.platform,
        page_url=body.pageUrl,
        canvas_hash=body.canvasHash,
        webgl_hash=body.webglHash,
        battery_level=body.batteryLevel,
        battery_charging=body.batteryCharging,
    )
    db.add(visit)
    db.commit()
    return {"status": "ok"}
