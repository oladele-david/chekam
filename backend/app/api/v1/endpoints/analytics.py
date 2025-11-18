"""
Analytics API endpoints for financial insights and analysis.
"""
from typing import Dict, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.exceptions import CheKamException
from app.db.session import get_db
from app.models.user import User
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/income-expenses/{user_id}")
def get_income_vs_expenses(
    user_id: int,
    start_date: str = Query(None, description="Start date (ISO format YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date (ISO format YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Get income vs expenses analysis for a date range.

    Returns:
    - Total income
    - Total expenses
    - Net savings
    - Savings rate percentage
    - Monthly average income and expenses

    Args:
        user_id: User ID
        start_date: Optional start date (defaults to current month start)
        end_date: Optional end date (defaults to today)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Income vs expenses breakdown

    Raises:
        403: If user tries to access another user's data
        400: If date format is invalid

    Example:
        GET /api/v1/analytics/income-expenses/1?start_date=2026-01-01&end_date=2026-01-31
    """
    try:
        # Parse dates if provided
        start_dt = None
        end_dt = None

        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Use ISO format (YYYY-MM-DD)"
                )

        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Use ISO format (YYYY-MM-DD)"
                )

        return analytics_service.get_income_vs_expenses(
            db=db,
            user_id=user_id,
            current_user=current_user,
            start_date=start_dt,
            end_date=end_dt
        )
    except HTTPException:
        raise
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve income vs expenses: {str(e)}"
        )


@router.get("/spending-by-category/{user_id}")
def get_spending_by_category(
    user_id: int,
    period: str = Query("month", description="Period: week, month, quarter, year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Dict]:
    """
    Get spending breakdown by category for a period.

    Returns spending amount and percentage for each category,
    ordered by amount descending.

    Args:
        user_id: User ID
        period: Period (week, month, quarter, year)
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of category spending with percentages

    Raises:
        403: If user tries to access another user's data
        400: If invalid period specified

    Example Response:
        ```json
        [
            {
                "category": "Food & Dining",
                "amount": 50000,
                "percentage": 35.5,
                "transaction_count": 15
            },
            {
                "category": "Transportation",
                "amount": 30000,
                "percentage": 21.3,
                "transaction_count": 8
            }
        ]
        ```
    """
    try:
        valid_periods = ["week", "month", "quarter", "year"]
        if period not in valid_periods:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid period. Must be one of: {', '.join(valid_periods)}"
            )

        return analytics_service.get_spending_by_category(
            db=db,
            user_id=user_id,
            current_user=current_user,
            period=period
        )
    except HTTPException:
        raise
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve spending by category: {str(e)}"
        )


@router.get("/budget-utilization/{user_id}")
def get_budget_utilization(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Dict]:
    """
    Get budget utilization analysis for all active budgets.

    Shows how much of each budget has been spent with status indicators:
    - healthy: < 70% utilized
    - warning: 70-85% utilized
    - critical: 85-100% utilized
    - exceeded: > 100% utilized

    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of budgets with utilization status

    Raises:
        403: If user tries to access another user's data

    Example Response:
        ```json
        [
            {
                "budget_id": 1,
                "category": "Food & Dining",
                "budget_amount": 100000,
                "spent_amount": 85000,
                "remaining": 15000,
                "utilization_percentage": 85.0,
                "status": "critical",
                "days_remaining": 5
            }
        ]
        ```
    """
    try:
        return analytics_service.get_budget_utilization(
            db=db,
            user_id=user_id,
            current_user=current_user
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve budget utilization: {str(e)}"
        )


@router.get("/financial-health/{user_id}")
def get_financial_health_score(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Calculate comprehensive financial health score (0-100).

    The score is calculated based on:
    - Savings Rate (40%): Percentage of income saved
    - Budget Adherence (30%): How well user sticks to budgets
    - Spending Consistency (20%): Stability of spending patterns
    - Emergency Fund (10%): Months of expenses covered by savings

    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Financial health score with breakdown and recommendations

    Raises:
        403: If user tries to access another user's data

    Example Response:
        ```json
        {
            "total_score": 75,
            "grade": "B",
            "breakdown": {
                "savings_rate_score": 32,
                "budget_adherence_score": 24,
                "spending_consistency_score": 15,
                "emergency_fund_score": 4
            },
            "metrics": {
                "savings_rate": 25.5,
                "budget_adherence": 80.0,
                "spending_consistency": 75.0,
                "emergency_fund_months": 2.5
            },
            "recommendations": [
                "Your savings rate is good. Try to maintain it above 20%.",
                "Consider increasing your emergency fund to 3-6 months of expenses."
            ]
        }
        ```
    """
    try:
        return analytics_service.calculate_financial_health_score(
            db=db,
            user_id=user_id,
            current_user=current_user
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate financial health score: {str(e)}"
        )


@router.get("/monthly-trends/{user_id}")
def get_monthly_trends(
    user_id: int,
    months: int = Query(6, ge=1, le=24, description="Number of months (1-24)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Dict]:
    """
    Get monthly income and expense trends.

    Shows income, expenses, and savings for each month,
    useful for trend analysis and visualization.

    Args:
        user_id: User ID
        months: Number of months to include (1-24, default 6)
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of monthly financial data

    Raises:
        403: If user tries to access another user's data
        400: If months parameter is invalid

    Example Response:
        ```json
        [
            {
                "month": "2026-01",
                "income": 500000,
                "expenses": 350000,
                "savings": 150000,
                "savings_rate": 30.0
            },
            {
                "month": "2025-12",
                "income": 500000,
                "expenses": 400000,
                "savings": 100000,
                "savings_rate": 20.0
            }
        ]
        ```
    """
    try:
        return analytics_service.get_monthly_trends(
            db=db,
            user_id=user_id,
            current_user=current_user,
            months=months
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve monthly trends: {str(e)}"
        )


@router.get("/spending-trends/{user_id}")
def get_spending_trends(
    user_id: int,
    category_id: int = Query(None, description="Optional category ID to filter"),
    months: int = Query(6, ge=1, le=24, description="Number of months (1-24)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Dict]:
    """
    Get spending trends over time, optionally filtered by category.

    Args:
        user_id: User ID
        category_id: Optional category ID to filter
        months: Number of months to include (1-24, default 6)
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of monthly spending data

    Raises:
        403: If user tries to access another user's data

    Example Response:
        ```json
        [
            {
                "month": "2026-01",
                "category": "Food & Dining",
                "amount": 50000,
                "transaction_count": 15
            }
        ]
        ```
    """
    try:
        return analytics_service.get_spending_trends(
            db=db,
            user_id=user_id,
            current_user=current_user,
            category_id=category_id,
            months=months
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve spending trends: {str(e)}"
        )
