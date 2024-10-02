from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    email: str
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    password: str | None = None


class User(UserBase):
    id: int

    class Config:
        orm_mode = True
