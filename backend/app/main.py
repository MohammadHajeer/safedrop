from app.core.config import settings
from app.routers import (
    admin_stats_router,
    auth_router,
    drops_router,
    guest_router,
    health_router,
    share_router,
    user_stats_router,
    users_router,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send


class ServicePrefixMiddleware:
    """Remove Vercel's public service prefix before FastAPI route matching."""

    def __init__(self, app: ASGIApp, prefix: str) -> None:
        self.app = app
        self.prefix = prefix
        self.prefix_bytes = prefix.encode()

    async def __call__(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        if scope["type"] in {"http", "websocket"}:
            path = scope.get("path", "")

            if path == self.prefix or path.startswith(f"{self.prefix}/"):
                scope = {
                    **scope,
                    "path": path[len(self.prefix) :] or "/",
                    "root_path": f"{scope.get('root_path', '')}{self.prefix}",
                }

                raw_path = scope.get("raw_path")

                if isinstance(raw_path, bytes) and raw_path.startswith(
                    self.prefix_bytes
                ):
                    scope["raw_path"] = raw_path[len(self.prefix_bytes) :] or b"/"

        await self.app(scope, receive, send)


app = FastAPI(
    title="SafeDrop API",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ServicePrefixMiddleware, prefix="/svc/api")


@app.get("/", tags=["General"])
def root():
    return {
        "name": "SafeDrop API",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(admin_stats_router)
app.include_router(users_router)
app.include_router(user_stats_router)
app.include_router(drops_router)
app.include_router(share_router)
app.include_router(guest_router)
