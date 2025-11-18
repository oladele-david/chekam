"""
Tax Bracket model for storing progressive tax rates by year.
"""
from sqlalchemy import Column, BigInteger, Numeric, Integer, TIMESTAMP, Text, CheckConstraint
from sqlalchemy.sql import func

from app.db.base_class import Base


class TaxBracket(Base):
    """
    Tax Bracket model for Nigerian PAYE tax system.

    Stores tax bracket information that can change year to year.
    Each bracket defines an income range and the tax rate applied to that range.

    Attributes:
        id: Primary key
        year: Tax year (e.g., 2026)
        bracket_order: Order of bracket (1-6 for 2026)
        min_income: Minimum income for this bracket (inclusive)
        max_income: Maximum income for this bracket (inclusive, NULL for top bracket)
        rate: Tax rate as decimal (e.g., 0.15 for 15%)
        description: Description of bracket (e.g., "₦0 - ₦800,000 at 0%")
        created_at: Record creation timestamp
    """
    __tablename__ = "tax_brackets"

    id = Column(BigInteger, primary_key=True, index=True)
    year = Column(Integer, nullable=False, index=True)
    bracket_order = Column(Integer, nullable=False)
    min_income = Column(Numeric(15, 2), nullable=False)
    max_income = Column(Numeric(15, 2), nullable=True)  # NULL for top bracket
    rate = Column(Numeric(5, 4), nullable=False)  # e.g., 0.1500 for 15%
    description = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint('rate >= 0 AND rate <= 1', name='check_rate_range'),
        CheckConstraint('min_income >= 0', name='check_min_income_positive'),
    )
