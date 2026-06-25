"""FastAPI route modules."""

from . import (
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

__all__ = [
    "admin_auth",
    "admin_philosophies",
    "admin_questions",
    "admin_stats",
    "health",
    "history",
    "philosophies",
    "questions",
    "results",
    "survey",
    "auth",
    "users",
]
