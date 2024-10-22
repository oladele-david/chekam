from sqlalchemy import Column, Text, TIMESTAMP, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class User(Base):
    """
        User model:
        This model is used to store user information.

        Attributes:
            id (BigInteger): Primary key for the user.
            first_name (Text): The first name of the user.
            last_name (Text): The last name of the user.
            email (Text): The email address of the user. Must be unique and not nullable.
            phone_number (Text, optional): The phone number of the user.
            password_hash (Text): The hashed password of the user. Cannot be null.
            is_active (Text): Indicates whether the user is active. Defaults to True.
            created_at (TIMESTAMP): The timestamp when the user was created.
            categories (relationship): Relationship to the Category model.
            transactions (relationship): Relationship to the Transaction model.
    """
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True, index=True)
    first_name = Column(Text)
    last_name = Column(Text)
    email = Column(Text, unique=True, nullable=False)
    phone_number = Column(Text)
    password_hash = Column(Text, nullable=False)
    is_active = Column(Text, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    categories = relationship("Category", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
