from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.admin_user import AdminUser
from app.models.philosophy import Philosophy
from app.models.question import Question
from app.models.question_weight import QuestionWeight
from app.repositories import course_status_repository
from app.seed.philosophies_seed import PHILOSOPHIES
from app.seed.questions_seed import QUESTIONS
from app.seed.mln122_seed import MLN122_PHILOSOPHIES, MLN122_QUESTIONS

# Combine seed data
ALL_PHILOSOPHIES = PHILOSOPHIES + MLN122_PHILOSOPHIES
ALL_QUESTIONS = QUESTIONS + MLN122_QUESTIONS


def seed_database(db: Session, ensure_admin: bool = True) -> None:
    for item in ALL_PHILOSOPHIES:
        philosophy = db.scalar(select(Philosophy).where(Philosophy.key == item["key"]))
        if philosophy is None:
            philosophy = Philosophy(**item)
            db.add(philosophy)
        else:
            for key, value in item.items():
                setattr(philosophy, key, value)

    db.flush()
    philosophies = {item.key: item for item in db.scalars(select(Philosophy)).all()}

    for item in ALL_QUESTIONS:
        data = {key: value for key, value in item.items() if key != "weights"}
        question = db.scalar(select(Question).where(Question.code == item["code"]))
        if question is None:
            question = Question(**data)
            db.add(question)
        else:
            for key, value in data.items():
                setattr(question, key, value)
        db.flush()

        db.execute(delete(QuestionWeight).where(QuestionWeight.question_id == question.id))
        for philosophy_key, weight in item["weights"].items():
            db.add(
                QuestionWeight(
                    question_id=question.id,
                    philosophy_id=philosophies[philosophy_key].id,
                    weight=weight,
                )
            )

    # Đảm bảo có bản ghi trạng thái (mở/tạm ngưng) cho các khoá được quản lý.
    course_status_repository.list_statuses(db)

    if ensure_admin:
        admin = db.scalar(select(AdminUser).where(AdminUser.email == settings.admin_email))
        password_hash = hash_password(settings.admin_password)
        if admin is None:
            db.add(AdminUser(email=settings.admin_email, password_hash=password_hash))
        else:
            admin.password_hash = password_hash

    db.commit()


def main() -> None:
    with SessionLocal() as db:
        seed_database(db)
    print("Seeded philosophies, questions, weights, and default admin.")


if __name__ == "__main__":
    main()
