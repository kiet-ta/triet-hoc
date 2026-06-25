from sqlalchemy.orm import Session

from app.models.mixins import utc_now
from app.models.survey_answer import SurveyAnswer
from app.models.survey_result import SurveyResult
from app.models.survey_result_score import SurveyResultScore
from app.models.survey_session import SurveySession


def create_session(
    db: Session,
    *,
    anonymous_client_id: str | None,
    course_code: str,
    share_slug: str,
    user_agent: str | None = None,
    user_id: str | None = None,
) -> SurveySession:
    session = SurveySession(
        anonymous_client_id=anonymous_client_id,
        user_id=user_id,
        course_code=course_code,
        share_slug=share_slug,
        user_agent=user_agent,
        completed_at=utc_now(),
    )
    db.add(session)
    db.flush()
    return session


def add_answers(
    db: Session, *, session_id: str, question_id_by_code: dict[str, str], answers_by_code: dict[str, int]
) -> None:
    for question_code, answer_value in answers_by_code.items():
        db.add(
            SurveyAnswer(
                session_id=session_id,
                question_id=question_id_by_code[question_code],
                answer_value=answer_value,
            )
        )


def create_result(
    db: Session,
    *,
    session_id: str,
    dominant_philosophy_id: str,
    secondary_philosophy_id: str | None,
    result_summary: str,
    explanation: str,
) -> SurveyResult:
    result = SurveyResult(
        session_id=session_id,
        dominant_philosophy_id=dominant_philosophy_id,
        secondary_philosophy_id=secondary_philosophy_id,
        result_summary=result_summary,
        explanation=explanation,
    )
    db.add(result)
    db.flush()
    return result


def add_scores(
    db: Session,
    *,
    result_id: str,
    score_rows: list[tuple[str, float, float, int]],
) -> None:
    for philosophy_id, raw_score, percentage, rank in score_rows:
        db.add(
            SurveyResultScore(
                result_id=result_id,
                philosophy_id=philosophy_id,
                raw_score=raw_score,
                percentage=percentage,
                rank=rank,
            )
        )
