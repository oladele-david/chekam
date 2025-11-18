"""
CRUD operations for tax-related models.
"""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.tax_bracket import TaxBracket
from app.models.tax_calculation import TaxCalculation
from app.models.tax_relief import TaxRelief
from app.schemas.tax import (
    TaxBracketCreate,
    TaxCalculationCreate,
    TaxReliefCreate,
    TaxReliefUpdate
)


class CRUDTaxBracket(CRUDBase[TaxBracket, TaxBracketCreate, TaxBracketCreate]):
    """CRUD operations for TaxBracket model."""

    def get_brackets_by_year(self, db: Session, *, year: int) -> List[TaxBracket]:
        """
        Get all tax brackets for a specific year, ordered by bracket_order.

        Args:
            db: Database session
            year: Tax year

        Returns:
            List of tax brackets for the year
        """
        return (
            db.query(TaxBracket)
            .filter(TaxBracket.year == year)
            .order_by(TaxBracket.bracket_order)
            .all()
        )

    def get_years_available(self, db: Session) -> List[int]:
        """
        Get list of years for which tax brackets are available.

        Args:
            db: Database session

        Returns:
            List of years
        """
        years = db.query(TaxBracket.year).distinct().order_by(TaxBracket.year.desc()).all()
        return [year[0] for year in years]


class CRUDTaxCalculation(CRUDBase[TaxCalculation, TaxCalculationCreate, TaxCalculationCreate]):
    """CRUD operations for TaxCalculation model."""

    def get_by_user_and_year(
        self,
        db: Session,
        *,
        user_id: int,
        year: int
    ) -> List[TaxCalculation]:
        """
        Get all tax calculations for a user in a specific year.

        Args:
            db: Database session
            user_id: User ID
            year: Calculation year

        Returns:
            List of tax calculations
        """
        return (
            db.query(TaxCalculation)
            .filter(
                TaxCalculation.user_id == user_id,
                TaxCalculation.calculation_year == year
            )
            .order_by(TaxCalculation.created_at.desc())
            .all()
        )

    def get_latest_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        year: Optional[int] = None
    ) -> Optional[TaxCalculation]:
        """
        Get the most recent tax calculation for a user.

        Args:
            db: Database session
            user_id: User ID
            year: Optional year filter

        Returns:
            Most recent tax calculation or None
        """
        query = db.query(TaxCalculation).filter(TaxCalculation.user_id == user_id)

        if year:
            query = query.filter(TaxCalculation.calculation_year == year)

        return query.order_by(TaxCalculation.created_at.desc()).first()

    def get_user_history(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 10
    ) -> List[TaxCalculation]:
        """
        Get tax calculation history for a user.

        Args:
            db: Database session
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of tax calculations
        """
        return (
            db.query(TaxCalculation)
            .filter(TaxCalculation.user_id == user_id)
            .order_by(TaxCalculation.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )


class CRUDTaxRelief(CRUDBase[TaxRelief, TaxReliefCreate, TaxReliefUpdate]):
    """CRUD operations for TaxRelief model."""

    def get_by_user_and_year(
        self,
        db: Session,
        *,
        user_id: int,
        year: int
    ) -> List[TaxRelief]:
        """
        Get all tax reliefs for a user in a specific year.

        Args:
            db: Database session
            user_id: User ID
            year: Tax year

        Returns:
            List of tax reliefs
        """
        return (
            db.query(TaxRelief)
            .filter(
                TaxRelief.user_id == user_id,
                TaxRelief.year == year
            )
            .all()
        )

    def get_by_type(
        self,
        db: Session,
        *,
        user_id: int,
        year: int,
        relief_type: str
    ) -> Optional[TaxRelief]:
        """
        Get a specific relief type for a user in a year.

        Args:
            db: Database session
            user_id: User ID
            year: Tax year
            relief_type: Type of relief

        Returns:
            Tax relief or None
        """
        return (
            db.query(TaxRelief)
            .filter(
                TaxRelief.user_id == user_id,
                TaxRelief.year == year,
                TaxRelief.relief_type == relief_type
            )
            .first()
        )

    def get_verified_reliefs(
        self,
        db: Session,
        *,
        user_id: int,
        year: int
    ) -> List[TaxRelief]:
        """
        Get all verified tax reliefs for a user in a year.

        Args:
            db: Database session
            user_id: User ID
            year: Tax year

        Returns:
            List of verified tax reliefs
        """
        return (
            db.query(TaxRelief)
            .filter(
                TaxRelief.user_id == user_id,
                TaxRelief.year == year,
                TaxRelief.verified == 'true'
            )
            .all()
        )


# Create singleton instances
tax_bracket = CRUDTaxBracket(TaxBracket)
tax_calculation = CRUDTaxCalculation(TaxCalculation)
tax_relief = CRUDTaxRelief(TaxRelief)
