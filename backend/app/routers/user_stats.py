from datetime import datetime, timezone

from app.core.storage_limits import USER_MAX_ACTIVE_STORAGE
from app.db.database import DbSession
from app.dependencies.auth import CurrentUser
from app.schemas.stats import StorageUsageResponse
from app.services.storage_usage import get_active_user_storage
from fastapi import APIRouter

router = APIRouter(
    prefix="/stats/me",
    tags=["User Stats"],
)


@router.get(
    "/storage",
    response_model=StorageUsageResponse,
)
def get_my_storage_usage(
    current_user: CurrentUser,
    db: DbSession,
):
    used_bytes = get_active_user_storage(
        db,
        current_user.id,
        datetime.now(timezone.utc),
    )
    limit_bytes = USER_MAX_ACTIVE_STORAGE

    return StorageUsageResponse(
        used_bytes=used_bytes,
        limit_bytes=limit_bytes,
        remaining_bytes=max(limit_bytes - used_bytes, 0),
        percentage=min(max((used_bytes / limit_bytes) * 100, 0), 100),
    )
