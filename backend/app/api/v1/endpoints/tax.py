"""
Tax API endpoints for Nigerian PAYE tax system.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.exceptions import CheKamException
from app.db.session import get_db
from app.models.user import User
from app.schemas.tax import (
    TaxCalculationRequest,
    TaxCalculationResponse,
    TaxHistory,
    AnnualTaxEstimate,
    TaxRelief,
    TaxReliefCreate,
    TaxBracket
)
from app.services.tax_service import tax_service
from app.crud.tax import tax_bracket as crud_tax_bracket

router = APIRouter()


@router.post("/calculate", response_model=TaxCalculationResponse)
def calculate_tax(
    request: TaxCalculationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Calculate PAYE tax for given income and year.

    This endpoint calculates Nigerian PAYE tax using progressive tax brackets
    and automatic relief calculations.

    **Automatic Reliefs Applied:**
    - Rent Relief: Lower of 20% of gross income or ₦500,000

    **Additional Reliefs** (optional in request):
    - Pension: Up to 8% of basic salary
    - NHF: 2.5% of basic salary
    - NHIS: As applicable
    - Life Insurance
    - Other verified reliefs

    **Tax Brackets (2026):**
    - ₦0 - ₦800,000: 0%
    - ₦800,001 - ₦3,200,000: 15%
    - ₦3,200,001 - ₦6,400,000: 18%
    - ₦6,400,001 - ₦12,800,000: 21%
    - ₦12,800,001 - ₦50,000,000: 23%
    - ₦50,000,001+: 25%

    Args:
        request: Tax calculation request with gross income and year
        db: Database session
        current_user: Current authenticated user

    Returns:
        Detailed tax calculation with breakdown by bracket

    Example:
        ```json
        {
            "gross_income": 5000000,
            "year": 2026,
            "reliefs": {
                "pension": 400000,
                "nhf": 125000
            }
        }
        ```
    """
    try:
        return tax_service.calculate_tax(
            db=db,
            request=request,
            current_user=current_user,
            save_to_history=True
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tax calculation failed: {str(e)}"
        )


@router.get("/history/{user_id}", response_model=TaxHistory)
def get_tax_history(
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get tax calculation history for a user.

    Retrieves all past tax calculations performed for the user,
    ordered by most recent first.

    Args:
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return (max 100)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Tax calculation history

    Raises:
        403: If user tries to access another user's history
    """
    try:
        return tax_service.get_user_tax_history(
            db=db,
            user_id=user_id,
            current_user=current_user,
            skip=skip,
            limit=limit
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve tax history: {str(e)}"
        )


@router.get("/estimate", response_model=AnnualTaxEstimate)
def estimate_annual_tax(
    monthly_income: float,
    year: int = 2026,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Estimate annual tax based on monthly income.

    Calculates projected annual tax liability based on current monthly income.
    Useful for tax planning and budgeting.

    Args:
        monthly_income: Current monthly gross income
        year: Tax year (defaults to 2026)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Annual tax estimate with monthly breakdown

    Example:
        GET /api/v1/tax/estimate?monthly_income=500000&year=2026
    """
    try:
        if monthly_income <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monthly income must be greater than 0"
            )

        return tax_service.estimate_annual_tax(
            db=db,
            monthly_income=monthly_income,
            year=year,
            current_user=current_user
        )
    except HTTPException:
        raise
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to estimate tax: {str(e)}"
        )


@router.post("/reliefs", response_model=TaxRelief, status_code=status.HTTP_201_CREATED)
def add_tax_relief(
    relief: TaxReliefCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add a tax relief claim.

    Allows users to claim tax reliefs beyond automatic rent relief.

    **Relief Types:**
    - pension: Pension contributions (up to 8% of basic salary)
    - nhf: National Housing Fund (2.5% of basic salary)
    - nhis: National Health Insurance Scheme
    - life_insurance: Life insurance premiums
    - gratuity: Gratuity payments
    - other: Other verified reliefs

    Args:
        relief: Tax relief details
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created tax relief

    Raises:
        403: If user tries to add relief for another user
    """
    try:
        return tax_service.add_tax_relief(
            db=db,
            user_id=relief.user_id,
            relief_type=relief.relief_type,
            amount=relief.amount,
            year=relief.year,
            description=relief.description,
            current_user=current_user
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add tax relief: {str(e)}"
        )


@router.get("/reliefs/{user_id}/{year}", response_model=List[TaxRelief])
def get_user_reliefs(
    user_id: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all tax reliefs for a user in a specific year.

    Args:
        user_id: User ID
        year: Tax year
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of tax reliefs

    Raises:
        403: If user tries to access another user's reliefs
    """
    try:
        return tax_service.get_user_reliefs(
            db=db,
            user_id=user_id,
            year=year,
            current_user=current_user
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve tax reliefs: {str(e)}"
        )


@router.get("/brackets/{year}", response_model=List[TaxBracket])
def get_tax_brackets(
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get tax brackets for a specific year.

    Returns the progressive tax bracket structure for the specified year.

    Args:
        year: Tax year
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of tax brackets ordered by bracket_order

    Example Response (2026):
        ```json
        [
            {
                "year": 2026,
                "bracket_order": 1,
                "min_income": 0,
                "max_income": 800000,
                "rate": 0.0,
                "description": "₦0 - ₦800,000 at 0%"
            },
            ...
        ]
        ```
    """
    try:
        brackets = crud_tax_bracket.get_brackets_by_year(db, year=year)
        if not brackets:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No tax brackets found for year {year}"
            )
        return brackets
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve tax brackets: {str(e)}"
        )


@router.get("/years", response_model=List[int])
def get_available_years(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get list of years for which tax brackets are available.

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of years in descending order
    """
    try:
        return crud_tax_bracket.get_years_available(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve available years: {str(e)}"
        )
