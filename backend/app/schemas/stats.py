from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_users: int

    total_drops: int
    active_drops: int
    expired_drops: int
    consumed_drops: int
    revoked_drops: int

    guest_drops: int
    authenticated_drops: int