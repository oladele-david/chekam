from pydantic import BaseModel,EmailStr


class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    is_active: bool | None = None

class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    password: str | None = None


class User(UserBase):
    id: int

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserRegisterSchema(UserCreate):
    pass

    class Config:
        orm_mode = True
