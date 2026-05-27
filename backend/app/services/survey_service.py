import secrets
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.question import Question
from app.repositories import philosophy_repository, question_repository, result_repository, survey_repository
from app.schemas.survey_schema import SurveySubmitRequest, SurveySubmitResponse, TopThreeItem
from app.services.result_service import make_result_copy
from app.services.scoring_service import calculate_scores


class SurveyValidationError(ValueError):
    pass


@dataclass(frozen=True)
class SurveySubmissionOutcome:
    response: SurveySubmitResponse


def _answers_by_code(payload: SurveySubmitRequest) -> dict[str, int]:
    answers: dict[str, int] = {}
    for answer in payload.answers:
        if answer.questionCode in answers:
            raise SurveyValidationError(f"Câu hỏi {answer.questionCode} bị trả lời trùng.")
        answers[answer.questionCode] = answer.answerValue
    return answers


def _question_weights_by_code(questions: list[Question]) -> dict[str, dict[str, int]]:
    return {
        question.code: {
            weight.philosophy.key: weight.weight
            for weight in question.weights
            if weight.weight > 0 and weight.philosophy is not None
        }
        for question in questions
    }


def _new_share_slug(db: Session) -> str:
    for _ in range(12):
        slug = secrets.token_urlsafe(6).replace("_", "").replace("-", "")[:10]
        if not result_repository.share_slug_exists(db, slug):
            return slug
    raise RuntimeError("Không thể tạo mã chia sẻ duy nhất.")


def submit_survey(
    db: Session, payload: SurveySubmitRequest, user_agent: str | None = None
) -> SurveySubmissionOutcome:
    answers_by_code = _answers_by_code(payload)
    num_answers = len(answers_by_code)
    
    if num_answers == 0:
        raise SurveyValidationError("Bạn chưa trả lời câu hỏi nào.")

    # Get all active questions and slice to match the requested length
    # This matches the frontend logic which takes the first N questions
    all_questions = question_repository.list_active_questions(db)
    questions = all_questions[:num_answers]

    expected_codes = {question.code for question in questions}
    submitted_codes = set(answers_by_code)

    missing = expected_codes - submitted_codes
    unknown = submitted_codes - expected_codes
    if missing:
        raise SurveyValidationError(f"Bạn còn thiếu {len(missing)} câu trả lời.")
    if unknown:
        raise SurveyValidationError(f"Có mã câu hỏi không hợp lệ: {', '.join(sorted(unknown))}.")

    philosophies = philosophy_repository.list_philosophies(db)
    philosophy_by_key = {philosophy.key: philosophy for philosophy in philosophies}
    scores = calculate_scores(
        answers_by_code=answers_by_code,
        question_weights_by_code=_question_weights_by_code(questions),
        philosophy_keys=[philosophy.key for philosophy in philosophies],
    )

    top_three = scores[:3]
    dominant = philosophy_by_key[top_three[0].key]
    secondary = philosophy_by_key[top_three[1].key] if len(top_three) > 1 else None
    result_summary, explanation = make_result_copy(
        dominant, [philosophy_by_key[item.key].name_vi for item in top_three]
    )

    session = survey_repository.create_session(
        db,
        anonymous_client_id=payload.anonymousClientId,
        share_slug=_new_share_slug(db),
        user_agent=user_agent,
    )
    survey_repository.add_answers(
        db,
        session_id=session.id,
        question_id_by_code={question.code: question.id for question in questions},
        answers_by_code=answers_by_code,
    )
    result = survey_repository.create_result(
        db,
        session_id=session.id,
        dominant_philosophy_id=dominant.id,
        secondary_philosophy_id=secondary.id if secondary else None,
        result_summary=result_summary,
        explanation=explanation,
    )
    survey_repository.add_scores(
        db,
        result_id=result.id,
        score_rows=[
            (
                philosophy_by_key[score.key].id,
                score.raw_score,
                score.percentage,
                score.rank,
            )
            for score in scores
        ],
    )
    db.commit()

    return SurveySubmissionOutcome(
        response=SurveySubmitResponse(
            resultId=result.id,
            shareSlug=session.share_slug,
            topThree=[
                TopThreeItem(
                    rank=item.rank,
                    key=item.key,
                    nameVi=philosophy_by_key[item.key].name_vi,
                    percentage=item.percentage,
                )
                for item in top_three
            ],
            shareUrl=f"/results/{session.share_slug}",
        )
    )
