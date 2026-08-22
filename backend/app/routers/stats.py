from datetime import datetime, timezone

from app.db.database import DbSession
from app.dependencies.auth import AdminUser
from app.models.drop import Drop
from app.models.user import User
from app.schemas.stats import AdminStatsResponse
from fastapi import APIRouter
from sqlalchemy import and_, case, func, select

router = APIRouter(
    prefix="/admin/stats",
    tags=["Admin Stats"],
)


@router.get(
    "",
    response_model=AdminStatsResponse,
)
def get_admin_stats(
    admin_user: AdminUser,
    db: DbSession,
):
    now = datetime.now(timezone.utc)

    total_users = (
        db.scalar(
            select(func.count())
            .select_from(User)
            .where(
                User.deleted_at.is_(None),
            )
        )
        or 0
    )

    drop_stats = db.execute(
        select(
            func.count().label("total_drops"),
            func.count(
                case(
                    (
                        and_(
                            Drop.revoked_at.is_(None),
                            Drop.expires_at > now,
                            Drop.view_count < Drop.max_views,
                        ),
                        1,
                    )
                )
            ).label("active_drops"),
            func.count(
                case(
                    (
                        and_(
                            Drop.revoked_at.is_(None),
                            Drop.expires_at <= now,
                        ),
                        1,
                    )
                )
            ).label("expired_drops"),
            func.count(
                case(
                    (
                        and_(
                            Drop.revoked_at.is_(None),
                            Drop.expires_at > now,
                            Drop.view_count >= Drop.max_views,
                        ),
                        1,
                    )
                )
            ).label("consumed_drops"),
            func.count(
                case(
                    (
                        Drop.revoked_at.is_not(None),
                        1,
                    )
                )
            ).label("revoked_drops"),
            func.count(
                case(
                    (
                        Drop.owner_id.is_(None),
                        1,
                    )
                )
            ).label("guest_drops"),
            func.count(
                case(
                    (
                        Drop.owner_id.is_not(None),
                        1,
                    )
                )
            ).label("authenticated_drops"),
        ).select_from(Drop)
    ).one()

    return AdminStatsResponse(
        total_users=total_users,
        total_drops=drop_stats.total_drops,
        active_drops=drop_stats.active_drops,
        expired_drops=drop_stats.expired_drops,
        consumed_drops=drop_stats.consumed_drops,
        revoked_drops=drop_stats.revoked_drops,
        guest_drops=drop_stats.guest_drops,
        authenticated_drops=drop_stats.authenticated_drops,
    )
