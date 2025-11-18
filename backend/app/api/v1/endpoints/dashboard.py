"""
Dashboard API endpoints for unified financial overview.
"""
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.exceptions import CheKamException
from app.db.session import get_db
from app.models.user import User
from app.services.dashboard_service import dashboard_service

router = APIRouter()


@router.get("/summary/{user_id}")
def get_dashboard_summary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Get comprehensive dashboard summary for a user.

    This is the main dashboard endpoint that provides a complete
    financial overview in a single request, combining:

    - **Quick Stats**: Key metrics at a glance
      - Total budgets and their status (healthy/critical/exceeded)
      - Current month income, expenses, and savings
      - Savings rate percentage
      - Financial health score and grade

    - **Income vs Expenses**: Current month breakdown
      - Total income and expenses
      - Net savings
      - Savings rate

    - **Budget Summary**: Budget utilization overview
      - Top 5 budgets by utilization
      - Count of healthy, critical, and exceeded budgets

    - **Financial Health**: Comprehensive health score
      - Overall score (0-100) and grade (A-F)
      - Breakdown by component (savings, budget adherence, etc.)
      - Personalized recommendations

    - **Recent Transactions**: Last 5 transactions
      - Transaction details with category
      - Income vs expense classification

    - **Tax Estimate**: Annual tax projection
      - Based on current month income
      - Includes monthly and annual estimates

    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Complete dashboard data

    Raises:
        403: If user tries to access another user's dashboard

    Example Response:
        ```json
        {
            "user_id": 1,
            "generated_at": "2026-01-15T10:30:00",
            "quick_stats": {
                "total_budgets": 5,
                "budgets_exceeded": 1,
                "budgets_critical": 1,
                "budgets_healthy": 3,
                "current_month_income": 500000,
                "current_month_expenses": 350000,
                "current_month_savings": 150000,
                "savings_rate": 30.0,
                "health_score": 75,
                "health_grade": "B"
            },
            "income_expenses": {
                "total_income": 500000,
                "total_expenses": 350000,
                "net_savings": 150000,
                "savings_rate": 30.0
            },
            "budget_summary": {
                "total": 5,
                "exceeded": 1,
                "critical": 1,
                "healthy": 3,
                "top_budgets": [...]
            },
            "financial_health": {
                "total_score": 75,
                "grade": "B",
                "breakdown": {...},
                "recommendations": [...]
            },
            "recent_transactions": [...],
            "tax_estimate": {
                "current_monthly_income": 500000,
                "estimated_annual_income": 6000000,
                "estimated_annual_tax": 450000,
                "estimated_monthly_tax": 37500,
                "estimated_take_home_monthly": 462500
            },
            "recommendations": [...]
        }
        ```
    """
    try:
        return dashboard_service.get_dashboard_summary(
            db=db,
            user_id=user_id,
            current_user=current_user
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dashboard summary: {str(e)}"
        )


@router.get("/overview/{user_id}")
def get_financial_overview(
    user_id: int,
    period: str = Query("month", description="Period: week, month, quarter, year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Get financial overview for a specific period.

    Provides period-specific financial analysis including:
    - Income vs expenses for the period
    - Spending breakdown by category
    - Monthly trends (last 6 months)

    This endpoint is useful for detailed period analysis and
    generating custom reports.

    Args:
        user_id: User ID
        period: Period (week, month, quarter, year)
        db: Database session
        current_user: Current authenticated user

    Returns:
        Financial overview data for the period

    Raises:
        403: If user tries to access another user's data
        400: If invalid period specified

    Example:
        GET /api/v1/dashboard/overview/1?period=month

    Example Response:
        ```json
        {
            "period": "month",
            "date_range": {
                "start": "2026-01-01",
                "end": "2026-01-31"
            },
            "income_expenses": {
                "total_income": 500000,
                "total_expenses": 350000,
                "net_savings": 150000,
                "savings_rate": 30.0
            },
            "spending_by_category": [
                {
                    "category": "Food & Dining",
                    "amount": 100000,
                    "percentage": 28.5,
                    "transaction_count": 20
                }
            ],
            "monthly_trends": [
                {
                    "month": "2026-01",
                    "income": 500000,
                    "expenses": 350000,
                    "savings": 150000,
                    "savings_rate": 30.0
                }
            ]
        }
        ```
    """
    try:
        valid_periods = ["week", "month", "quarter", "year"]
        if period not in valid_periods:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid period. Must be one of: {', '.join(valid_periods)}"
            )

        return dashboard_service.get_financial_overview(
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
            detail=f"Failed to retrieve financial overview: {str(e)}"
        )
