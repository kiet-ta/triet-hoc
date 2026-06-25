from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.repositories.result_repository import list_by_anonymous_client_id, count_unsynced_by_anonymous_client_id
from app.schemas.result_schema import HistoryResponse
from app.services.result_service import history_item

router = APIRouter(prefix="/history", tags=["history"])

class UnsyncedCountResponse(BaseModel):
    count: int

@router.get("/{anonymous_client_id}/unsynced", response_model=UnsyncedCountResponse)
def get_unsynced_count(anonymous_client_id: str, db: Session = Depends(get_db)) -> UnsyncedCountResponse:
    count = count_unsynced_by_anonymous_client_id(db, anonymous_client_id)
    return UnsyncedCountResponse(count=count)

@router.get("/{anonymous_client_id}", response_model=HistoryResponse)
def get_history(anonymous_client_id: str, db: Session = Depends(get_db)) -> HistoryResponse:
    return HistoryResponse(
        anonymousClientId=anonymous_client_id,
        results=[
            history_item(result)
            for result in list_by_anonymous_client_id(db, anonymous_client_id)
        ],
    )
