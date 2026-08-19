from fastapi import FastAPI

from app.routers import auth_router

app = FastAPI(
    title="SafeDrop API",
    version="1.0.0",
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "SafeDrop API is running"}
