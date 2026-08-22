from app.routers.auth import router as auth_router
from app.routers.drops import router as drops_router
from app.routers.guest import router as guest_router
from app.routers.health import router as health_router
from app.routers.share import router as share_router
from app.routers.stats import router as admin_stats_router
from app.routers.users import router as users_router

__all__ = [
    "admin_stats_router",
    "auth_router",
    "drops_router",
    "guest_router",
    "health_router",
    "share_router",
    "users_router",
]
