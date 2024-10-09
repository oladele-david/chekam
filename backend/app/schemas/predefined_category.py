from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PredefinedCategoryBase(BaseModel):
    """
    Base schema for predefined category
    """
    name: str
    description: str | None = None

class PredefinedCategoryCreate(PredefinedCategoryBase):
    pass

class PredefinedCategoryUpdate(PredefinedCategoryBase):
    pass

class PredefinedCategory(PredefinedCategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
