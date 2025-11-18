from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from datetime import datetime
from app.schemas.user import User as UserSchema
from app.schemas.category import Category as CategorySchema


class BudgetBase(BaseModel):
    """
    Base schema for budget.

    Attributes:
        title (string): the title
        amount (float): The total amount allocated for the budget.
        current_amount (Optional[float]): The current amount remaining in the budget.
        start_date (datetime): The start date of the budget period.
        end_date (datetime): The end date of the budget period.
    """

    title: Optional[str] = None
    amount: float
    current_amount: Optional[float] = None
    start_date: datetime
    end_date: datetime
    icon: Optional[str] = None

    @field_validator('amount')
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        """Validate that amount is greater than 0."""
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

    @field_validator('current_amount')
    @classmethod
    def current_amount_must_be_non_negative(cls, v: Optional[float]) -> Optional[float]:
        """Validate that current_amount is non-negative."""
        if v is not None and v < 0:
            raise ValueError('Current amount cannot be negative')
        return v

    @model_validator(mode='after')
    def validate_date_range(self):
        """Validate that end_date is after or equal to start_date."""
        if self.end_date < self.start_date:
            raise ValueError('end_date must be greater than or equal to start_date')
        return self


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
        from_attributes = True
