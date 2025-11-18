from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from datetime import datetime, date
from app.schemas.user import User as UserSchema
from app.schemas.category import Category as CategorySchema


class TransactionBase(BaseModel):
    """
    Base schema for Transaction:
    Defines common attributes for transactions.

    Attributes:
        amount (float): The amount of the transaction.
        frequency (str): The frequency of the transaction.
        start_date (date): The start date of the transaction.
        end_date (Optional[date]): The end date of the transaction, if applicable.
        description (Optional[str]): A description of the transaction, if provided.
    """
    amount: float
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None

    @field_validator('amount')
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        """Validate that amount is greater than 0."""
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

    @field_validator('frequency')
    @classmethod
    def frequency_must_be_valid(cls, v: str) -> str:
        """Validate that frequency is one of the allowed values."""
        allowed_frequencies = ['one-time', 'daily', 'weekly', 'monthly', 'yearly']
        if v not in allowed_frequencies:
            raise ValueError(f'Frequency must be one of: {", ".join(allowed_frequencies)}')
        return v

    @model_validator(mode='after')
    def validate_date_range(self):
        """Validate that end_date is after or equal to start_date."""
        if self.end_date and self.end_date < self.start_date:
            raise ValueError('end_date must be greater than or equal to start_date')
        return self

class TransactionCreate(TransactionBase):
    """
    Schema for creating a new Transaction:
    Inherits from TransactionBase and adds user and category IDs.

    Attributes:
        user_id (int): The ID of the user creating the transaction.
        category_id (int): The ID of the category for the transaction.
    """
    user_id: int
    category_id: int

class TransactionUpdate(TransactionBase):
    """
    Schema for updating an existing Transaction:
    Inherits from TransactionBase without adding any new attributes.
    """
    pass

class Transaction(TransactionBase):
    """
    Schema for reading a Transaction:
    Inherits from TransactionBase and adds additional read-only attributes.

    Attributes:
        id (int): The unique identifier of the transaction.
        user (Optional[UserSchema]): The user associated with the transaction.
        category (Optional[CategorySchema]): The category associated with the transaction.
        created_at (datetime): The timestamp when the transaction was created.
    """
    id: int
    user: Optional[UserSchema] = None
    category: Optional[CategorySchema] = None
    created_at: datetime

    class Config:
        from_attributes = True
