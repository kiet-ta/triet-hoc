from fastapi import FastAPI

from app.api.routes import (
    admin_auth,
    admin_philosophies,
    admin_questions,
    admin_stats,
    health,
    history,
    philosophies,
    questions,
    results,
    survey,
    auth,
    users,
)
from app.core.config import settings
from app.core.cors import configure_cors

app = FastAPI(title=settings.app_name, version="0.1.0")
configure_cors(app)

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(philosophies.router, prefix="/api")
app.include_router(survey.router, prefix="/api")
app.include_router(results.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(admin_auth.router, prefix="/api")
app.include_router(admin_questions.router, prefix="/api")
app.include_router(admin_philosophies.router, prefix="/api")
app.include_router(admin_stats.router, prefix="/api")
