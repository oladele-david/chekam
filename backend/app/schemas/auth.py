from pydantic import BaseModel, EmailStr
from app.schemas.user import User


class RegisterResponse(BaseModel):
    """
    RegisterResponse schema:
    Defines the response returned after a successful user registration.

    Attributes:
        access_token (str): The access token provided upon registration.
        token_type (str): The type of the token, typically 'Bearer'.
        user (User): The user information associated with the registration.
    """
    access_token: str
    token_type: str
    user: User


class LoginRequest(BaseModel):
    """
    LoginRequest schema:
    Defines the request body for user login.

    Attributes:
        username (EmailStr): The email address of the user.
        password (str): The password of the user.
    """
    username: EmailStr
    password: str
