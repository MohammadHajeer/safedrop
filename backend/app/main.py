from fastapi import FastAPI

from app.routers import auth_router, users_router, drops_router, share_router
from app.dependencies.auth import AdminUser

app = FastAPI(
    title="SafeDrop API",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(drops_router)
app.include_router(share_router)


@app.get("/")
def root():
    return {"message": "SafeDrop API is running"}


@app.get("/admin-test")
def admin_test(admin: AdminUser):
    return {"message": "You are an admin"}
