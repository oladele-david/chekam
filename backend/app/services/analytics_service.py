"""
Financial Analytics Service.

Provides insights into user's financial health, spending patterns,
savings rate, and recommendations.
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict

from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.core.exceptions import NotAuthorizedException
from app.crud import transaction as crud_transaction
from app.crud import budget as crud_budget
from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.services.base_service import BaseService


class FinancialAnalyticsService(BaseService):
    """
    Financial analytics service for generating insights and recommendations.

    Provides:
    - Spending analysis by category and time period
    - Savings rate calculation
    - Financial health score
    - Budget utilization tracking
    - Spending trends
    - Recommendations for financial improvement
    """

    def __init__(self):
        """Initialize FinancialAnalyticsService."""
        super().__init__(crud_transaction)

    def calculate_date_range(self, period: str = "month") -> tuple[datetime, datetime]:
        """
        Calculate start and end dates for a period.

        Args:
            period: Period type (today, week, month, quarter, year)

        Returns:
            Tuple of (start_date, end_date)
        """
        today = datetime.now()

        if period == "today":
            start = today.replace(hour=0, minute=0, second=0, microsecond=0)
            end = today
        elif period == "week":
            start = today - timedelta(days=today.weekday())
            start = start.replace(hour=0, minute=0, second=0, microsecond=0)
            end = today
        elif period == "month":
            start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end = today
        elif period == "quarter":
            quarter = (today.month - 1) // 3
            start = today.replace(month=quarter * 3 + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
            end = today
        elif period == "year":
            start = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            end = today
        else:
            # Default to current month
            start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end = today

        return start, end

    def get_income_vs_expenses(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        Calculate income vs expenses for a period.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            start_date: Period start (defaults to current month)
            end_date: Period end (defaults to now)

        Returns:
            Dictionary with income, expenses, and net savings

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this data")

        # Set default date range to current month
        if not start_date or not end_date:
            start_date, end_date = self.calculate_date_range("month")

        # Get all transactions in period
        transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.start_date >= start_date.date(),
            Transaction.start_date <= end_date.date()
        ).all()

        total_income = 0.0
        total_expenses = 0.0
        income_by_category = defaultdict(float)
        expenses_by_category = defaultdict(float)

        for txn in transactions:
            amount = float(txn.amount)

            # Categorize as income or expense based on transaction description or amount sign
            # For now, assume positive amounts are income, can be enhanced with category types
            if amount > 0:
                total_income += amount
                if txn.category:
                    income_by_category[txn.category.name] += amount
            else:
                total_expenses += abs(amount)
                if txn.category:
                    expenses_by_category[txn.category.name] += abs(amount)

        net_savings = total_income - total_expenses
        savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

        return {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_savings": round(net_savings, 2),
            "savings_rate": round(savings_rate, 2),
            "income_by_category": dict(income_by_category),
            "expenses_by_category": dict(expenses_by_category)
        }

    def get_spending_by_category(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        period: str = "month"
    ) -> List[Dict]:
        """
        Get spending breakdown by category.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            period: Time period (week, month, quarter, year)

        Returns:
            List of categories with spending amounts

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this data")

        start_date, end_date = self.calculate_date_range(period)

        # Query spending by category
        results = db.query(
            Transaction.category_id,
            func.sum(Transaction.amount).label('total')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.start_date >= start_date.date(),
            Transaction.start_date <= end_date.date(),
            Transaction.amount < 0  # Only expenses
        ).group_by(Transaction.category_id).all()

        spending_data = []
        total_spending = 0

        for category_id, total in results:
            amount = abs(float(total))
            total_spending += amount

            # Get category name
            category = db.query(Transaction).filter(
                Transaction.category_id == category_id
            ).first()

            spending_data.append({
                "category_id": category_id,
                "category_name": category.category.name if category and category.category else "Uncategorized",
                "amount": round(amount, 2)
            })

        # Calculate percentages
        for item in spending_data:
            item["percentage"] = round((item["amount"] / total_spending * 100) if total_spending > 0 else 0, 2)

        # Sort by amount descending
        spending_data.sort(key=lambda x: x["amount"], reverse=True)

        return spending_data

    def get_budget_utilization(
        self,
        db: Session,
        user_id: int,
        current_user: User
    ) -> List[Dict]:
        """
        Get budget utilization for all user budgets.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user

        Returns:
            List of budgets with utilization percentages

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this data")

        budgets = crud_budget.get_budget_by_user(db, user_id=user_id)

        utilization_data = []

        for budget in budgets:
            limit = float(budget.amount)
            current = float(budget.current_amount)
            utilization = (current / limit * 100) if limit > 0 else 0
            remaining = limit - current

            status = "healthy"
            if utilization >= 100:
                status = "exceeded"
            elif utilization >= 90:
                status = "critical"
            elif utilization >= 75:
                status = "warning"

            utilization_data.append({
                "budget_id": budget.id,
                "title": budget.title,
                "category_id": budget.category_id,
                "limit": round(limit, 2),
                "current": round(current, 2),
                "remaining": round(remaining, 2),
                "utilization_percentage": round(utilization, 2),
                "status": status,
                "period": {
                    "start": budget.start_date.isoformat(),
                    "end": budget.end_date.isoformat()
                }
            })

        # Sort by utilization descending
        utilization_data.sort(key=lambda x: x["utilization_percentage"], reverse=True)

        return utilization_data

    def calculate_financial_health_score(
        self,
        db: Session,
        user_id: int,
        current_user: User
    ) -> Dict:
        """
        Calculate financial health score (0-100).

        Factors:
        - Savings rate (40%)
        - Budget adherence (30%)
        - Spending consistency (20%)
        - Emergency fund coverage (10%)

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user

        Returns:
            Dictionary with health score and breakdown

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this data")

        # Get income vs expenses
        income_data = self.get_income_vs_expenses(db, user_id, current_user)
        savings_rate = income_data["savings_rate"]

        # Calculate savings rate score (0-40 points)
        if savings_rate >= 20:
            savings_score = 40
        elif savings_rate >= 10:
            savings_score = 30
        elif savings_rate >= 5:
            savings_score = 20
        elif savings_rate > 0:
            savings_score = 10
        else:
            savings_score = 0

        # Get budget utilization
        budget_util = self.get_budget_utilization(db, user_id, current_user)

        # Calculate budget adherence score (0-30 points)
        if budget_util:
            exceeded_count = sum(1 for b in budget_util if b["status"] == "exceeded")
            critical_count = sum(1 for b in budget_util if b["status"] == "critical")
            total_budgets = len(budget_util)

            if exceeded_count == 0:
                if critical_count == 0:
                    budget_score = 30
                else:
                    budget_score = 25 - (critical_count * 5)
            else:
                budget_score = max(0, 20 - (exceeded_count * 5))
        else:
            budget_score = 15  # Neutral score if no budgets

        # Spending consistency score (simplified, 0-20 points)
        # This would ideally analyze month-to-month spending variance
        spending_score = 15  # Default reasonable score

        # Emergency fund coverage score (0-10 points)
        # Simplified: based on net savings
        emergency_score = min(10, max(0, int(savings_rate / 2)))

        total_score = savings_score + budget_score + spending_score + emergency_score

        # Generate grade
        if total_score >= 90:
            grade = "A"
        elif total_score >= 80:
            grade = "B"
        elif total_score >= 70:
            grade = "C"
        elif total_score >= 60:
            grade = "D"
        else:
            grade = "F"

        return {
            "total_score": total_score,
            "grade": grade,
            "breakdown": {
                "savings_rate": {
                    "score": savings_score,
                    "max": 40,
                    "value": round(savings_rate, 2)
                },
                "budget_adherence": {
                    "score": budget_score,
                    "max": 30
                },
                "spending_consistency": {
                    "score": spending_score,
                    "max": 20
                },
                "emergency_fund": {
                    "score": emergency_score,
                    "max": 10
                }
            },
            "recommendations": self._generate_recommendations(
                savings_rate,
                budget_util,
                total_score
            )
        }

    def _generate_recommendations(
        self,
        savings_rate: float,
        budget_util: List[Dict],
        health_score: int
    ) -> List[str]:
        """
        Generate personalized financial recommendations.

        Args:
            savings_rate: Current savings rate
            budget_util: Budget utilization data
            health_score: Overall health score

        Returns:
            List of recommendation strings
        """
        recommendations = []

        # Savings recommendations
        if savings_rate < 10:
            recommendations.append("Try to save at least 10% of your income each month")
        elif savings_rate < 20:
            recommendations.append("Great progress! Aim for 20% savings rate for optimal financial health")

        # Budget recommendations
        exceeded_budgets = [b for b in budget_util if b["status"] == "exceeded"]
        critical_budgets = [b for b in budget_util if b["status"] in ["critical", "warning"]]

        if exceeded_budgets:
            recommendations.append(
                f"You've exceeded {len(exceeded_budgets)} budget(s). Review your spending in these categories"
            )

        if critical_budgets:
            recommendations.append(
                f"{len(critical_budgets)} budget(s) are approaching their limit. Consider reducing discretionary spending"
            )

        # Overall score recommendations
        if health_score < 70:
            recommendations.append("Consider creating a detailed monthly budget to track expenses better")
            recommendations.append("Look for areas to reduce unnecessary spending")

        if not budget_util:
            recommendations.append("Create budgets for your major spending categories to better control expenses")

        return recommendations

    def get_monthly_trends(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        months: int = 6
    ) -> List[Dict]:
        """
        Get monthly income and expense trends.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            months: Number of months to retrieve

        Returns:
            List of monthly data points

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this data")

        # Calculate start date
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)

        # Query transactions grouped by month
        results = db.query(
            extract('year', Transaction.start_date).label('year'),
            extract('month', Transaction.start_date).label('month'),
            func.sum(
                func.case(
                    (Transaction.amount > 0, Transaction.amount),
                    else_=0
                )
            ).label('income'),
            func.sum(
                func.case(
                    (Transaction.amount < 0, func.abs(Transaction.amount)),
                    else_=0
                )
            ).label('expenses')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.start_date >= start_date.date()
        ).group_by('year', 'month').order_by('year', 'month').all()

        trends = []
        for year, month, income, expenses in results:
            month_income = float(income) if income else 0
            month_expenses = float(expenses) if expenses else 0
            net = month_income - month_expenses

            trends.append({
                "year": int(year),
                "month": int(month),
                "month_name": datetime(int(year), int(month), 1).strftime("%B"),
                "income": round(month_income, 2),
                "expenses": round(month_expenses, 2),
                "net": round(net, 2),
                "savings_rate": round((net / month_income * 100) if month_income > 0 else 0, 2)
            })

        return trends


# Create singleton instance
analytics_service = FinancialAnalyticsService()
