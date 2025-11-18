"""
Tax Calculation model for storing user tax calculation history.
"""
from sqlalchemy import Column, BigInteger, Numeric, Integer, TIMESTAMP, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class TaxCalculation(Base):
    """
    Tax Calculation model for storing user PAYE tax calculations.

    Records each tax calculation performed for a user, allowing
    tax history tracking and year-over-year comparisons.

    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        calculation_year: Year for which tax was calculated
        gross_income: Total gross income before reliefs
        total_reliefs: Sum of all reliefs applied
        taxable_income: Income after reliefs (gross_income - total_reliefs)
        gross_tax: Tax calculated before any deductions
        net_tax: Final tax after all calculations
        tax_bracket_breakdown: JSON breakdown by bracket (optional)
        notes: Additional notes or context
        created_at: When calculation was performed
        user: Relationship to User model
    """
    __tablename__ = "tax_calculations"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    calculation_year = Column(Integer, nullable=False, index=True)

    # Income amounts
    gross_income = Column(Numeric(15, 2), nullable=False)
    total_reliefs = Column(Numeric(15, 2), nullable=False, default=0)
    taxable_income = Column(Numeric(15, 2), nullable=False)

    # Tax amounts
    gross_tax = Column(Numeric(15, 2), nullable=False)
    net_tax = Column(Numeric(15, 2), nullable=False)

    # Additional details
    tax_bracket_breakdown = Column(Text, nullable=True)  # JSON string
    notes = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="tax_calculations")
