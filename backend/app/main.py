from app.routers import (
    admin_stats_router,
    auth_router,
    drops_router,
    guest_router,
    health_router,
    share_router,
    users_router,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SafeDrop API",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(admin_stats_router)
app.include_router(users_router)
app.include_router(drops_router)
app.include_router(share_router)
app.include_router(guest_router)
