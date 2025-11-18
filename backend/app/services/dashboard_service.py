"""
Dashboard Service.

Provides unified dashboard data combining budgets, transactions,
analytics, and tax information.
"""
from typing import Dict
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.exceptions import NotAuthorizedException
from app.models.user import User
from app.services.base_service import BaseService
from app.services.analytics_service import analytics_service
from app.services.tax_service import tax_service
from app.crud import budget as crud_budget
from app.crud import transaction as crud_transaction


class DashboardService(BaseService):
    """
    Dashboard service for providing unified dashboard metrics.

    Combines data from multiple services to provide a comprehensive
    overview of user's financial situation.
    """

    def __init__(self):
        """Initialize DashboardService."""
        super().__init__(crud_transaction)

    def get_dashboard_summary(
        self,
        db: Session,
        user_id: int,
        current_user: User
    ) -> Dict:
        """
        Get comprehensive dashboard summary.

        Includes:
        - Current month income vs expenses
        - Budget utilization summary
        - Financial health score
        - Recent transactions
        - Estimated tax liability
        - Quick stats

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user

        Returns:
            Dictionary with complete dashboard data

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this dashboard")

        self.log_operation("get_dashboard_summary", "", user_id)

        # Get current month income vs expenses
        income_expenses = analytics_service.get_income_vs_expenses(
            db, user_id, current_user
        )

        # Get budget utilization
        budget_util = analytics_service.get_budget_utilization(
            db, user_id, current_user
        )

        # Calculate budget summary stats
        total_budgets = len(budget_util)
        exceeded_budgets = sum(1 for b in budget_util if b["status"] == "exceeded")
        critical_budgets = sum(1 for b in budget_util if b["status"] == "critical")
        healthy_budgets = sum(1 for b in budget_util if b["status"] == "healthy")

        # Get financial health score
        health_score = analytics_service.calculate_financial_health_score(
            db, user_id, current_user
        )

        # Get recent transactions (last 5)
        recent_transactions = crud_transaction.get_transactions_by_user(
            db, user_id=user_id, skip=0, limit=5
        )

        # Format recent transactions
        recent_txns_formatted = []
        for txn in recent_transactions:
            recent_txns_formatted.append({
                "id": txn.id,
                "amount": float(txn.amount),
                "description": txn.description or "",
                "category": txn.category.name if txn.category else "Uncategorized",
                "date": txn.start_date.isoformat(),
                "type": "income" if txn.amount > 0 else "expense"
            })

        # Estimate annual tax (if there's income data)
        tax_estimate = None
        if income_expenses["total_income"] > 0:
            try:
                monthly_avg = income_expenses["total_income"] / 1  # Current month data
                tax_estimate = tax_service.estimate_annual_tax(
                    db=db,
                    monthly_income=monthly_avg,
                    year=datetime.now().year,
                    current_user=current_user
                )
            except Exception as e:
                self.log_error("estimate_tax_for_dashboard", e, user_id)
                # Continue without tax estimate if it fails

        # Calculate quick stats
        quick_stats = {
            "total_budgets": total_budgets,
            "budgets_exceeded": exceeded_budgets,
            "budgets_critical": critical_budgets,
            "budgets_healthy": healthy_budgets,
            "current_month_income": income_expenses["total_income"],
            "current_month_expenses": income_expenses["total_expenses"],
            "current_month_savings": income_expenses["net_savings"],
            "savings_rate": income_expenses["savings_rate"],
            "health_score": health_score["total_score"],
            "health_grade": health_score["grade"]
        }

        return {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "quick_stats": quick_stats,
            "income_expenses": income_expenses,
            "budget_summary": {
                "total": total_budgets,
                "exceeded": exceeded_budgets,
                "critical": critical_budgets,
                "healthy": healthy_budgets,
                "top_budgets": budget_util[:5]  # Top 5 by utilization
            },
            "financial_health": health_score,
            "recent_transactions": recent_txns_formatted,
            "tax_estimate": tax_estimate.model_dump() if tax_estimate else None,
            "recommendations": health_score["recommendations"]
        }

    def get_financial_overview(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        period: str = "month"
    ) -> Dict:
        """
        Get financial overview for a specific period.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            period: Period (week, month, quarter, year)

        Returns:
            Financial overview data

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this data")

        # Get income vs expenses
        start_date, end_date = analytics_service.calculate_date_range(period)
        income_expenses = analytics_service.get_income_vs_expenses(
            db, user_id, current_user, start_date, end_date
        )

        # Get spending by category
        spending_by_category = analytics_service.get_spending_by_category(
            db, user_id, current_user, period
        )

        # Get monthly trends
        trends = analytics_service.get_monthly_trends(
            db, user_id, current_user, months=6
        )

        return {
            "period": period,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "income_expenses": income_expenses,
            "spending_by_category": spending_by_category,
            "monthly_trends": trends
        }


# Create singleton instance
dashboard_service = DashboardService()
