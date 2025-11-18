"""
Tax service for Nigerian PAYE tax calculations.

Implements the 2026 Nigerian Tax Act with progressive tax brackets
and relief calculations.
"""
import json
from typing import Dict, List, Optional
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ValidationException
from app.crud import tax as crud_tax
from app.models.user import User
from app.models.tax_bracket import TaxBracket
from app.models.tax_calculation import TaxCalculation
from app.models.tax_relief import TaxRelief
from app.schemas.tax import (
    TaxCalculationRequest,
    TaxCalculationResponse,
    BracketTaxBreakdown,
    TaxCalculationCreate,
    TaxReliefCreate,
    AnnualTaxEstimate,
    TaxHistory
)
from app.services.base_service import BaseService


class TaxService(BaseService):
    """
    Tax service for Nigerian PAYE tax calculations.

    Handles:
    - Progressive tax bracket calculations
    - Relief calculations (rent, pension, NHF, NHIS, etc.)
    - Tax history management
    - Annual tax estimates
    """

    # Relief calculation constants
    RENT_RELIEF_PERCENTAGE = 0.20  # 20% of gross income
    MAX_RENT_RELIEF = 500000  # ₦500,000
    PENSION_RELIEF_PERCENTAGE = 0.08  # 8% of basic salary
    NHF_RELIEF_PERCENTAGE = 0.025  # 2.5% of basic salary

    def __init__(self):
        """Initialize TaxService."""
        super().__init__(crud_tax.tax_calculation)

    def calculate_rent_relief(self, gross_income: float) -> float:
        """
        Calculate automatic rent relief.

        Rent relief is the lower of:
        - 20% of gross income
        - ₦500,000

        Args:
            gross_income: Gross annual income

        Returns:
            Rent relief amount
        """
        calculated_relief = gross_income * self.RENT_RELIEF_PERCENTAGE
        return min(calculated_relief, self.MAX_RENT_RELIEF)

    def calculate_total_reliefs(
        self,
        gross_income: float,
        custom_reliefs: Optional[Dict[str, float]] = None
    ) -> Dict[str, float]:
        """
        Calculate total tax reliefs.

        Args:
            gross_income: Gross annual income
            custom_reliefs: Optional dict of custom relief amounts

        Returns:
            Dictionary with breakdown of all reliefs
        """
        reliefs = {}

        # Automatic rent relief (always calculated)
        reliefs['rent'] = self.calculate_rent_relief(gross_income)

        # Add custom reliefs if provided
        if custom_reliefs:
            for relief_type, amount in custom_reliefs.items():
                if relief_type != 'rent':  # Don't override automatic rent relief
                    reliefs[relief_type] = amount

        return reliefs

    def get_tax_brackets(self, db: Session, year: int) -> List[TaxBracket]:
        """
        Get tax brackets for a specific year.

        Args:
            db: Database session
            year: Tax year

        Returns:
            List of tax brackets

        Raises:
            NotFoundException: If no brackets found for year
        """
        brackets = crud_tax.tax_bracket.get_brackets_by_year(db, year=year)
        if not brackets:
            raise NotFoundException(f"No tax brackets found for year {year}")

        return brackets

    def calculate_progressive_tax(
        self,
        taxable_income: float,
        brackets: List[TaxBracket]
    ) -> tuple[float, List[BracketTaxBreakdown]]:
        """
        Calculate tax using progressive tax brackets.

        Args:
            taxable_income: Income after reliefs
            brackets: List of tax brackets

        Returns:
            Tuple of (total_tax, breakdown_by_bracket)
        """
        total_tax = 0.0
        breakdown = []
        remaining_income = taxable_income

        for bracket in brackets:
            if remaining_income <= 0:
                break

            min_income = float(bracket.min_income)
            max_income = float(bracket.max_income) if bracket.max_income else float('inf')
            rate = float(bracket.rate)

            # Calculate taxable amount in this bracket
            bracket_start = min_income
            bracket_end = max_income

            if taxable_income > bracket_start:
                # Income falls into this bracket
                if taxable_income > bracket_end:
                    # Income exceeds this bracket
                    taxable_in_bracket = bracket_end - bracket_start
                else:
                    # Income ends in this bracket
                    taxable_in_bracket = taxable_income - bracket_start

                tax_in_bracket = taxable_in_bracket * rate
                total_tax += tax_in_bracket

                breakdown.append(BracketTaxBreakdown(
                    bracket_order=bracket.bracket_order,
                    min_income=min_income,
                    max_income=max_income if bracket.max_income else None,
                    rate=rate,
                    taxable_in_bracket=taxable_in_bracket,
                    tax_in_bracket=tax_in_bracket
                ))

                remaining_income -= taxable_in_bracket

        return total_tax, breakdown

    def calculate_tax(
        self,
        db: Session,
        request: TaxCalculationRequest,
        current_user: User,
        save_to_history: bool = True
    ) -> TaxCalculationResponse:
        """
        Calculate PAYE tax for given income and reliefs.

        Args:
            db: Database session
            request: Tax calculation request
            current_user: Current user
            save_to_history: Whether to save calculation to history

        Returns:
            Tax calculation response

        Raises:
            NotFoundException: If tax brackets not found for year
        """
        self.log_operation(
            "calculate_tax",
            f"year={request.year}, gross_income={request.gross_income}",
            current_user.id
        )

        # Get tax brackets for the year
        brackets = self.get_tax_brackets(db, request.year)

        # Calculate reliefs
        reliefs_breakdown = self.calculate_total_reliefs(
            request.gross_income,
            request.reliefs
        )
        total_reliefs = sum(reliefs_breakdown.values())

        # Calculate taxable income
        taxable_income = max(request.gross_income - total_reliefs, 0)

        # Calculate tax using progressive brackets
        gross_tax, breakdown = self.calculate_progressive_tax(taxable_income, brackets)
        net_tax = gross_tax  # Can add deductions here if needed

        # Calculate effective tax rate
        effective_rate = (net_tax / request.gross_income * 100) if request.gross_income > 0 else 0

        # Create response
        response = TaxCalculationResponse(
            gross_income=request.gross_income,
            total_reliefs=total_reliefs,
            taxable_income=taxable_income,
            gross_tax=gross_tax,
            net_tax=net_tax,
            effective_rate=round(effective_rate, 2),
            breakdown_by_bracket=breakdown,
            year=request.year
        )

        # Save to history if requested
        if save_to_history:
            calculation_create = TaxCalculationCreate(
                user_id=current_user.id,
                calculation_year=request.year,
                gross_income=request.gross_income,
                total_reliefs=total_reliefs,
                taxable_income=taxable_income,
                gross_tax=gross_tax,
                net_tax=net_tax,
                tax_bracket_breakdown=json.dumps([b.model_dump() for b in breakdown]),
                notes=f"Reliefs: {json.dumps(reliefs_breakdown)}"
            )
            crud_tax.tax_calculation.create(db, obj_in=calculation_create)

        return response

    def get_user_tax_history(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        skip: int = 0,
        limit: int = 10
    ) -> TaxHistory:
        """
        Get tax calculation history for a user.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            skip: Number to skip
            limit: Maximum number to return

        Returns:
            Tax history

        Raises:
            NotAuthorizedException: If user tries to access another user's history
        """
        # Authorization check
        if user_id != current_user.id:
            from app.core.exceptions import NotAuthorizedException
            raise NotAuthorizedException("Not authorized to access this tax history")

        calculations = crud_tax.tax_calculation.get_user_history(
            db,
            user_id=user_id,
            skip=skip,
            limit=limit
        )

        total = crud_tax.tax_calculation.count_by_user(db, user_id=user_id)

        return TaxHistory(
            calculations=calculations,
            total_calculations=total
        )

    def estimate_annual_tax(
        self,
        db: Session,
        monthly_income: float,
        year: int,
        current_user: User
    ) -> AnnualTaxEstimate:
        """
        Estimate annual tax based on monthly income.

        Args:
            db: Database session
            monthly_income: Monthly gross income
            year: Tax year
            current_user: Current user

        Returns:
            Annual tax estimate
        """
        annual_income = monthly_income * 12

        # Calculate tax for annual income
        request = TaxCalculationRequest(
            gross_income=annual_income,
            year=year
        )

        tax_calc = self.calculate_tax(db, request, current_user, save_to_history=False)

        monthly_tax = tax_calc.net_tax / 12
        take_home = monthly_income - monthly_tax

        return AnnualTaxEstimate(
            current_monthly_income=monthly_income,
            estimated_annual_income=annual_income,
            estimated_annual_tax=tax_calc.net_tax,
            estimated_monthly_tax=round(monthly_tax, 2),
            estimated_take_home_monthly=round(take_home, 2),
            year=year
        )

    def add_tax_relief(
        self,
        db: Session,
        user_id: int,
        relief_type: str,
        amount: float,
        year: int,
        description: Optional[str],
        current_user: User
    ) -> TaxRelief:
        """
        Add a tax relief claim for a user.

        Args:
            db: Database session
            user_id: User ID
            relief_type: Type of relief
            amount: Relief amount
            year: Tax year
            description: Optional description
            current_user: Current user

        Returns:
            Created tax relief

        Raises:
            NotAuthorizedException: If user tries to add relief for another user
        """
        # Authorization check
        if user_id != current_user.id:
            from app.core.exceptions import NotAuthorizedException
            raise NotAuthorizedException("Not authorized to add relief for this user")

        relief_create = TaxReliefCreate(
            user_id=user_id,
            relief_type=relief_type,
            amount=amount,
            year=year,
            description=description
        )

        relief = crud_tax.tax_relief.create(db, obj_in=relief_create)

        self.log_operation(
            "add_tax_relief",
            f"type={relief_type}, amount={amount}, year={year}",
            current_user.id
        )

        return relief

    def get_user_reliefs(
        self,
        db: Session,
        user_id: int,
        year: int,
        current_user: User
    ) -> List[TaxRelief]:
        """
        Get all tax reliefs for a user in a year.

        Args:
            db: Database session
            user_id: User ID
            year: Tax year
            current_user: Current user

        Returns:
            List of tax reliefs

        Raises:
            NotAuthorizedException: If user tries to access another user's reliefs
        """
        # Authorization check
        if user_id != current_user.id:
            from app.core.exceptions import NotAuthorizedException
            raise NotAuthorizedException("Not authorized to access these reliefs")

        return crud_tax.tax_relief.get_by_user_and_year(db, user_id=user_id, year=year)


# Create singleton instance
tax_service = TaxService()
