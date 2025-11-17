from sqlalchemy import Column, Text, TIMESTAMP, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Category(Base):
    """
    Category model
    this model is used to store user defined categories
    """
    __tablename__ = "categories"
    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'), index=True)
    name = Column(Text, nullable=False)
    type = Column(Text, nullable=False)
    icon = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    predefined_category_id = Column(BigInteger, ForeignKey('predefined_categories.id', ondelete='SET NULL'), index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    user = relationship("User", back_populates="categories")
    predefined_category = relationship("PredefinedCategory", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")
