from pydantic import BaseModel
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
        orm_mode = True
