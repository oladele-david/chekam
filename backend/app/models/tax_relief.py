"""
Tax Relief model for storing user tax relief claims.
"""
from sqlalchemy import Column, BigInteger, Numeric, Integer, TIMESTAMP, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class TaxRelief(Base):
    """
    Tax Relief model for Nigerian PAYE tax system.

    Stores tax relief claims that reduce taxable income.
    Common reliefs include rent, pension, NHF, NHIS, etc.

    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        relief_type: Type of relief (rent, pension, nhf, nhis, life_insurance, etc.)
        amount: Relief amount claimed
        year: Tax year for this relief
        description: Additional details about the relief
        verified: Whether relief has been verified
        created_at: Record creation timestamp
        updated_at: Last update timestamp
        user: Relationship to User model
    """
    __tablename__ = "tax_reliefs"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)

    relief_type = Column(
        Text,
        CheckConstraint(
            "relief_type IN ('rent', 'pension', 'nhf', 'nhis', 'life_insurance', 'gratuity', 'other')",
            name='check_relief_type'
        ),
        nullable=False
    )
    amount = Column(Numeric(15, 2), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    description = Column(Text, nullable=True)
    verified = Column(Text, default='false', nullable=False)  # 'true' or 'false' as text

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    user = relationship("User", back_populates="tax_reliefs")

    __table_args__ = (
        CheckConstraint('amount >= 0', name='check_relief_amount_positive'),
    )
