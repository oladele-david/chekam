"""
Reports API endpoints for financial report generation.
"""
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.exceptions import CheKamException
from app.db.session import get_db
from app.models.user import User
from app.services.report_service import report_service

router = APIRouter()


@router.get("/monthly/{user_id}")
def get_monthly_report(
    user_id: int,
    year: int = Query(..., ge=2020, le=2100, description="Year"),
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Generate comprehensive monthly financial report.

    Provides a complete analysis of financial activity for a specific month including:
    - Income and expense summary
    - Spending breakdown by category
    - Budget performance
    - All transactions for the month
    - Automated insights and recommendations

    Args:
        user_id: User ID
        year: Year (2020-2100)
        month: Month (1-12)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Comprehensive monthly financial report

    Raises:
        403: If user tries to access another user's report
        400: If invalid year/month specified

    Example:
        GET /api/v1/reports/monthly/1?year=2026&month=1

    Example Response:
        ```json
        {
            "report_type": "monthly",
            "period": {
                "year": 2026,
                "month": 1,
                "start_date": "2026-01-01",
                "end_date": "2026-01-31"
            },
            "summary": {
                "total_income": 500000,
                "total_expenses": 350000,
                "net_savings": 150000,
                "savings_rate": 30.0,
                "transaction_count": 45
            },
            "spending_by_category": [...],
            "budget_performance": [...],
            "transactions": [...],
            "insights": [
                "Excellent savings rate! You're saving over 20% of your income.",
                "Food & Dining accounts for 35% of your spending. Consider if this is balanced."
            ]
        }
        ```
    """
    try:
        return report_service.generate_monthly_report(
            db=db,
            user_id=user_id,
            current_user=current_user,
            year=year,
            month=month
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate monthly report: {str(e)}"
        )


@router.get("/category/{user_id}/{category_id}")
def get_category_report(
    user_id: int,
    category_id: int,
    months: int = Query(6, ge=1, le=24, description="Number of months to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Generate detailed spending report for a specific category.

    Analyzes spending patterns for a category over time, including:
    - Total spent and monthly average
    - Highest and lowest spending months
    - Month-by-month trends
    - Recent transactions in the category

    Useful for understanding spending habits in specific areas like
    food, transportation, entertainment, etc.

    Args:
        user_id: User ID
        category_id: Category ID to analyze
        months: Number of months to analyze (1-24, default 6)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Category spending report with trends

    Raises:
        403: If user tries to access another user's report
        404: If category not found

    Example:
        GET /api/v1/reports/category/1/5?months=12

    Example Response:
        ```json
        {
            "report_type": "category",
            "category": {
                "id": 5,
                "name": "Food & Dining",
                "description": "Groceries, restaurants, etc."
            },
            "period": {
                "months_analyzed": 12
            },
            "statistics": {
                "total_spent": 600000,
                "average_monthly": 50000,
                "highest_month": {
                    "month": "2025-12",
                    "amount": 75000
                },
                "lowest_month": {
                    "month": "2025-06",
                    "amount": 35000
                },
                "transaction_count": 180
            },
            "monthly_trends": [...],
            "recent_transactions": [...]
        }
        ```
    """
    try:
        return report_service.generate_category_report(
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
            detail=f"Failed to generate category report: {str(e)}"
        )


@router.get("/budget-performance/{user_id}")
def get_budget_performance_report(
    user_id: int,
    budget_id: Optional[int] = Query(None, description="Optional specific budget ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Generate budget performance report.

    Analyzes how well budgets are being followed, including:
    - Overall budget utilization across all budgets
    - Individual budget performance with status indicators
    - Daily burn rate analysis
    - Budget vs actual spending comparison
    - Days remaining and trend projections

    Can analyze all budgets or a specific budget.

    Args:
        user_id: User ID
        budget_id: Optional specific budget ID (if None, reports all budgets)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Budget performance report

    Raises:
        403: If user tries to access another user's report
        404: If specific budget not found

    Example:
        GET /api/v1/reports/budget-performance/1
        GET /api/v1/reports/budget-performance/1?budget_id=5

    Example Response:
        ```json
        {
            "report_type": "budget_performance",
            "summary": {
                "total_budgets": 5,
                "total_budgeted": 500000,
                "total_spent": 425000,
                "total_remaining": 75000,
                "overall_utilization": 85.0,
                "budgets_on_track": 3,
                "budgets_exceeded": 2
            },
            "budgets": [
                {
                    "budget_id": 1,
                    "category": "Food & Dining",
                    "budget_amount": 100000,
                    "spent_amount": 95000,
                    "remaining": 5000,
                    "utilization_percentage": 95.0,
                    "status": "critical",
                    "period": {
                        "start_date": "2026-01-01",
                        "end_date": "2026-01-31",
                        "total_days": 31,
                        "days_elapsed": 25,
                        "days_remaining": 6
                    },
                    "burn_rate": {
                        "daily_budget": 3225.81,
                        "daily_actual": 3800.00,
                        "variance": 574.19
                    }
                }
            ]
        }
        ```
    """
    try:
        return report_service.generate_budget_performance_report(
            db=db,
            user_id=user_id,
            current_user=current_user,
            budget_id=budget_id
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate budget performance report: {str(e)}"
        )


@router.get("/annual/{user_id}")
def get_annual_report(
    user_id: int,
    year: int = Query(..., ge=2020, le=2100, description="Year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Generate comprehensive annual financial report.

    Provides a complete year-in-review including:
    - Annual income, expenses, and savings totals
    - Month-by-month trends throughout the year
    - Category breakdown showing where money was spent
    - Best and worst performing months
    - Annual tax estimate
    - Year-end insights and analysis

    Perfect for year-end review, tax planning, and setting next year's goals.

    Args:
        user_id: User ID
        year: Year (2020-2100)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Comprehensive annual financial report

    Raises:
        403: If user tries to access another user's report
        400: If invalid year specified

    Example:
        GET /api/v1/reports/annual/1?year=2025

    Example Response:
        ```json
        {
            "report_type": "annual",
            "year": 2025,
            "summary": {
                "total_income": 6000000,
                "total_expenses": 4200000,
                "total_savings": 1800000,
                "average_monthly_income": 500000,
                "average_monthly_expenses": 350000,
                "average_monthly_savings": 150000,
                "average_savings_rate": 30.0,
                "best_month": {
                    "month": "2025-12",
                    "savings": 250000
                },
                "worst_month": {
                    "month": "2025-06",
                    "savings": 50000
                }
            },
            "monthly_trends": [...],
            "category_breakdown": [
                {
                    "category": "Food & Dining",
                    "total": 1200000,
                    "percentage": 28.5
                }
            ],
            "tax_estimate": {
                "estimated_annual_tax": 450000,
                "estimated_monthly_tax": 37500
            },
            "insights": [
                "Great year! You saved 30% of your income.",
                "Your spending was consistent throughout the year.",
                "Your highest expense category was Food & Dining at ₦1,200,000 (28.5%)."
            ]
        }
        ```
    """
    try:
        return report_service.generate_annual_report(
            db=db,
            user_id=user_id,
            current_user=current_user,
            year=year
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate annual report: {str(e)}"
        )
