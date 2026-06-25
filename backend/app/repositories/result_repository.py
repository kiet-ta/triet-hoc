from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.philosophy import Philosophy
from app.models.survey_result import SurveyResult
from app.models.survey_result_score import SurveyResultScore
from app.models.survey_session import SurveySession


RESULT_LOAD = (
    joinedload(SurveyResult.session),
    joinedload(SurveyResult.dominant_philosophy),
    joinedload(SurveyResult.secondary_philosophy),
    joinedload(SurveyResult.scores).joinedload(SurveyResultScore.philosophy),
)


def get_by_share_slug(db: Session, share_slug: str) -> SurveyResult | None:
    stmt = (
        select(SurveyResult)
        .join(SurveySession)
        .where(SurveySession.share_slug == share_slug)
        .options(*RESULT_LOAD)
    )
    return db.scalars(stmt).unique().one_or_none()


def share_slug_exists(db: Session, share_slug: str) -> bool:
    return db.scalar(select(SurveySession.id).where(SurveySession.share_slug == share_slug)) is not None


def list_by_anonymous_client_id(db: Session, anonymous_client_id: str) -> list[SurveyResult]:
    stmt = (
        select(SurveyResult)
        .join(SurveySession)
        .where(SurveySession.anonymous_client_id == anonymous_client_id)
        .options(*RESULT_LOAD)
        .order_by(desc(SurveyResult.created_at))
    )
    return list(db.scalars(stmt).unique().all())


def count_unsynced_by_anonymous_client_id(db: Session, anonymous_client_id: str) -> int:
    stmt = (
        select(func.count(SurveySession.id))
        .where(SurveySession.anonymous_client_id == anonymous_client_id)
        .where(SurveySession.user_id.is_(None))
    )
    return int(db.scalar(stmt) or 0)


def list_results(db: Session, limit: int = 100) -> list[SurveyResult]:
    stmt = (
        select(SurveyResult)
        .options(*RESULT_LOAD)
        .order_by(desc(SurveyResult.created_at))
        .limit(limit)
    )
    return list(db.scalars(stmt).unique().all())


def total_result_count(db: Session) -> int:
    return int(db.scalar(select(func.count(SurveyResult.id))) or 0)


def dominant_counts(db: Session) -> list[tuple[str, str, int]]:
    stmt = (
        select(Philosophy.key, Philosophy.name_vi, func.count(SurveyResult.id))
        .join(SurveyResult, SurveyResult.dominant_philosophy_id == Philosophy.id)
        .group_by(Philosophy.key, Philosophy.name_vi)
        .order_by(desc(func.count(SurveyResult.id)))
    )
    return [(row[0], row[1], int(row[2])) for row in db.execute(stmt).all()]


def average_scores(db: Session) -> list[tuple[str, str, float]]:
    stmt = (
        select(
            Philosophy.key,
            Philosophy.name_vi,
            func.coalesce(func.avg(SurveyResultScore.percentage), 0),
        )
        .join(SurveyResultScore, SurveyResultScore.philosophy_id == Philosophy.id, isouter=True)
        .group_by(Philosophy.key, Philosophy.name_vi)
        .order_by(Philosophy.name_vi)
    )
    return [(row[0], row[1], float(row[2] or 0)) for row in db.execute(stmt).all()]


def completion_count_by_day(db: Session) -> list[tuple[str, int]]:
    stmt = (
        select(func.date(SurveyResult.created_at), func.count(SurveyResult.id))
        .group_by(func.date(SurveyResult.created_at))
        .order_by(func.date(SurveyResult.created_at))
    )
    return [(str(row[0]), int(row[1])) for row in db.execute(stmt).all()]
