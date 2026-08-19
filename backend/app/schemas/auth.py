from pydantic import BaseModel, EmailStr
from app.schemas.user import UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut