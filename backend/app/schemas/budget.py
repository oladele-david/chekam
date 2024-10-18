from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import User as UserSchema
from app.schemas.category import Category as CategorySchema


class BudgetBase(BaseModel):
    """
    Base schema for budget.

    Attributes:
        amount (float): The total amount allocated for the budget.
        current_amount (Optional[float]): The current amount remaining in the budget.
        start_date (datetime): The start date of the budget period.
        end_date (datetime): The end date of the budget period.
    """

    amount: float
    current_amount: Optional[float] = None
    start_date: datetime
    end_date: datetime
    icon: Optional[str] = None


class BudgetCreate(BudgetBase):
    """
    Schema for creating a new budget.

    Attributes:
        user_id (int): The ID of the user associated with the budget.
        category_id (int): The ID of the category associated with the budget.
    """

    user_id: int
    category_id: int


class BudgetUpdate(BudgetBase):
    """
    Schema for updating an existing budget.
    """
    pass


class Budget(BudgetBase):
    """
    Schema for a budget with additional fields.

    Attributes:
        id (int): The unique identifier of the budget.
        user (Optional[UserSchema]): The user associated with the budget.
        category (Optional[CategorySchema]): The category associated with the budget.
        created_at (datetime): The timestamp when the budget was created.
    """
    id: int
    user: Optional[UserSchema] = None  # Add a field for the related user
    category: Optional[CategorySchema] = None
    created_at: datetime

    class Config:
        orm_mode = True
