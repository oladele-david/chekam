from pydantic import BaseModel

class CategoryBase(BaseModel):
    """
    Base schema for category
    """
    name: str
    type: str
    description: str | None = None
    predefined_category_id: int | None = None

class CategoryCreate(CategoryBase):
    user_id: int


class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: str | None = None
    updated_at: str | None = None

    class Config:
        orm_mode = True
