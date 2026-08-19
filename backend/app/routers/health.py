from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text

from app.db.database import DbSession

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
def health_check():
    return {
        "status": "ok",
        "service": "safedrop-api",
    }


@router.get("/db")
def database_health(db: DbSession):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )

    return {
        "status": "ok",
        "database": "connected",
    }
