from fastapi import FastAPI

from app.routers import (
    auth_router,
    users_router,
    drops_router,
    share_router,
    health_router,
    guest_router,
)
from app.dependencies.auth import AdminUser

app = FastAPI(
    title="SafeDrop API",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
)


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
app.include_router(users_router)
app.include_router(drops_router)
app.include_router(share_router)
app.include_router(guest_router)
