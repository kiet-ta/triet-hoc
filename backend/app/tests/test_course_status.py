from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.config import settings
from app.main import app
from app.seed.seed_data import seed_database


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        seed_database(db, ensure_admin=True)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _admin_token(client: TestClient) -> str:
    response = client.post(
        "/api/admin/auth/login",
        json={"email": settings.admin_email, "password": settings.admin_password},
    )
    assert response.status_code == 200, response.text
    return response.json()["accessToken"]


def test_public_status_defaults_to_open(client: TestClient) -> None:
    response = client.get("/api/courses/status")
    assert response.status_code == 200
    statuses = {item["courseCode"]: item for item in response.json()}
    assert statuses["MLN111"]["isSuspended"] is False
    assert statuses["MLN122"]["isSuspended"] is False


def test_admin_can_suspend_and_resume_blocks_guests(client: TestClient) -> None:
    token = _admin_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Khi mở: khách vãng lai lấy được câu hỏi.
    assert client.get("/api/questions?course_code=MLN111").status_code == 200

    # Admin tạm ngưng MLN111 với thông báo tuỳ chỉnh.
    suspend = client.put(
        "/api/admin/courses/MLN111",
        json={"isSuspended": True, "message": "Đang bảo trì nhé"},
        headers=headers,
    )
    assert suspend.status_code == 200
    assert suspend.json()["isSuspended"] is True

    # Khách vãng lai bị chặn ở cả câu hỏi lẫn nộp bài, với đúng thông báo.
    blocked = client.get("/api/questions?course_code=MLN111")
    assert blocked.status_code == 403
    assert blocked.json()["detail"] == "Đang bảo trì nhé"

    submit = client.post(
        "/api/survey/submit",
        json={"courseCode": "MLN111", "anonymousClientId": "guest-1", "answers": []},
    )
    assert submit.status_code == 403

    # Khoá khác không bị ảnh hưởng.
    assert client.get("/api/questions?course_code=MLN122").status_code == 200

    # Admin mở lại -> khách vãng lai truy cập bình thường.
    resume = client.put(
        "/api/admin/courses/MLN111",
        json={"isSuspended": False, "message": None},
        headers=headers,
    )
    assert resume.status_code == 200
    assert client.get("/api/questions?course_code=MLN111").status_code == 200


def test_admin_endpoint_requires_auth(client: TestClient) -> None:
    response = client.put(
        "/api/admin/courses/MLN111", json={"isSuspended": True, "message": None}
    )
    assert response.status_code == 401
