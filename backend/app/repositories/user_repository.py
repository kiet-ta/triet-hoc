from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def get_by_id(db: Session, user_id: str) -> User | None:
    return db.get(User, user_id)


def create(db: Session, email: str, password_hash: str, name: str | None = None) -> User:
    user = User(email=email, password_hash=password_hash, name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
