from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import User as UserSchema
from app.schemas.predefined_category import PredefinedCategory as PredefinedCategorySchema


class CategoryBase(BaseModel):
    """
    Base schema for category
    """
    name: str
    type: str
    description: Optional[str] = None
    predefined_category_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    user_id: int


class CategoryUpdate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    user: Optional[UserSchema] = None  # Add a field for the related user
    predefined_category: Optional[PredefinedCategorySchema] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Add a field for the related predefined_category

    class Config:
        orm_mode = True