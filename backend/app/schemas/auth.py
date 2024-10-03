from pydantic import BaseModel
from app.schemas.user import User

class RegisterResponse(BaseModel):
    access_token: str
    token_type: str
    user: User
