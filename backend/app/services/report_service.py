"""
Report Service.

Generates comprehensive financial reports in various formats.
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import NotAuthorizedException
from app.models.user import User
from app.services.base_service import BaseService
from app.services.analytics_service import analytics_service
from app.services.tax_service import tax_service
from app.crud import transaction as crud_transaction
from app.crud import budget as crud_budget
from app.crud import category as crud_category


class ReportService(BaseService):
    """
    Report service for generating financial reports.

    Provides various report types:
    - Monthly financial summary
    - Category-wise spending report
    - Budget performance report
    - Tax summary report
    - Annual financial report
    """

    def __init__(self):
        """Initialize ReportService."""
        super().__init__(crud_transaction)

    def generate_monthly_report(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        year: int,
        month: int
    ) -> Dict:
        """
        Generate comprehensive monthly financial report.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            year: Year
            month: Month (1-12)

        Returns:
            Monthly report with income, expenses, budgets, and insights

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this report")

        self.log_operation("generate_monthly_report", f"year={year}, month={month}", user_id)

        # Calculate date range
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1) - timedelta(days=1)

        # Get income vs expenses
        income_expenses = analytics_service.get_income_vs_expenses(
            db, user_id, current_user, start_date, end_date
        )

        # Get spending by category
        spending_by_category = analytics_service.get_spending_by_category(
            db, user_id, current_user, period="month"
        )

        # Get budget utilization
        budget_util = analytics_service.get_budget_utilization(
            db, user_id, current_user
        )

        # Get all transactions for the month
        transactions = crud_transaction.get_transactions_by_date_range(
            db, user_id=user_id, start_date=start_date, end_date=end_date
        )

        # Format transactions
        transaction_list = []
        for txn in transactions:
            transaction_list.append({
                "id": txn.id,
                "date": txn.start_date.isoformat(),
                "description": txn.description or "",
                "category": txn.category.name if txn.category else "Uncategorized",
                "amount": float(txn.amount),
                "type": "income" if txn.amount > 0 else "expense"
            })

        # Calculate insights
        insights = self._generate_monthly_insights(
            income_expenses,
            spending_by_category,
            budget_util
        )

        return {
            "report_type": "monthly",
            "period": {
                "year": year,
                "month": month,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_income": income_expenses["total_income"],
                "total_expenses": income_expenses["total_expenses"],
                "net_savings": income_expenses["net_savings"],
                "savings_rate": income_expenses["savings_rate"],
                "transaction_count": len(transaction_list)
            },
            "spending_by_category": spending_by_category,
            "budget_performance": budget_util,
            "transactions": transaction_list,
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        }

    def generate_category_report(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        category_id: int,
        months: int = 6
    ) -> Dict:
        """
        Generate spending report for a specific category over time.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            category_id: Category ID
            months: Number of months to analyze

        Returns:
            Category spending report with trends

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this report")

        self.log_operation(
            "generate_category_report",
            f"category_id={category_id}, months={months}",
            user_id
        )

        # Get category details
        category = crud_category.get(db, id=category_id)
        if not category or category.user_id != user_id:
            from app.core.exceptions import NotFoundException
            raise NotFoundException(f"Category with id {category_id} not found")

        # Get spending trends for this category
        trends = analytics_service.get_spending_trends(
            db, user_id, current_user, category_id=category_id, months=months
        )

        # Calculate statistics
        amounts = [t["amount"] for t in trends if t["amount"] > 0]
        total_spent = sum(amounts)
        avg_monthly = total_spent / len(amounts) if amounts else 0
        max_month = max(trends, key=lambda x: x["amount"]) if trends else None
        min_month = min(trends, key=lambda x: x["amount"]) if trends else None

        # Get recent transactions in this category
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)  # Last 30 days
        recent_txns = crud_transaction.get_transactions_by_category(
            db, user_id=user_id, category_id=category_id, skip=0, limit=10
        )

        recent_txns_formatted = []
        for txn in recent_txns:
            recent_txns_formatted.append({
                "id": txn.id,
                "date": txn.start_date.isoformat(),
                "description": txn.description or "",
                "amount": abs(float(txn.amount))
            })

        return {
            "report_type": "category",
            "category": {
                "id": category.id,
                "name": category.name,
                "description": category.description or ""
            },
            "period": {
                "months_analyzed": months
            },
            "statistics": {
                "total_spent": total_spent,
                "average_monthly": round(avg_monthly, 2),
                "highest_month": {
                    "month": max_month["month"],
                    "amount": max_month["amount"]
                } if max_month else None,
                "lowest_month": {
                    "month": min_month["month"],
                    "amount": min_month["amount"]
                } if min_month else None,
                "transaction_count": sum(t["transaction_count"] for t in trends)
            },
            "monthly_trends": trends,
            "recent_transactions": recent_txns_formatted,
            "generated_at": datetime.now().isoformat()
        }

    def generate_budget_performance_report(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        budget_id: Optional[int] = None
    ) -> Dict:
        """
        Generate budget performance report.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            budget_id: Optional specific budget ID (if None, reports on all budgets)

        Returns:
            Budget performance report

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this report")

        self.log_operation("generate_budget_performance_report", f"budget_id={budget_id}", user_id)

        if budget_id:
            # Single budget report
            budget = crud_budget.get(db, id=budget_id)
            if not budget or budget.user_id != user_id:
                from app.core.exceptions import NotFoundException
                raise NotFoundException(f"Budget with id {budget_id} not found")

            budgets = [budget]
        else:
            # All budgets report
            budgets = crud_budget.get_budgets_by_user(db, user_id=user_id)

        budget_details = []
        total_budgeted = 0
        total_spent = 0
        budgets_on_track = 0
        budgets_exceeded = 0

        for budget in budgets:
            # Get spending for this budget
            spent = crud_transaction.get_total_by_category_and_date_range(
                db,
                user_id=user_id,
                category_id=budget.category_id,
                start_date=budget.start_date,
                end_date=budget.end_date
            )
            spent_amount = abs(float(spent)) if spent else 0
            budget_amount = float(budget.amount)

            # Calculate metrics
            remaining = budget_amount - spent_amount
            utilization = (spent_amount / budget_amount * 100) if budget_amount > 0 else 0

            # Determine status
            if utilization > 100:
                status = "exceeded"
                budgets_exceeded += 1
            elif utilization >= 85:
                status = "critical"
            elif utilization >= 70:
                status = "warning"
            else:
                status = "healthy"
                budgets_on_track += 1

            # Calculate daily burn rate
            total_days = (budget.end_date - budget.start_date).days + 1
            days_elapsed = (datetime.now().date() - budget.start_date).days + 1
            days_remaining = (budget.end_date - datetime.now().date()).days

            daily_budget = budget_amount / total_days if total_days > 0 else 0
            daily_actual = spent_amount / days_elapsed if days_elapsed > 0 else 0

            budget_details.append({
                "budget_id": budget.id,
                "category": budget.category.name if budget.category else "Unknown",
                "budget_amount": budget_amount,
                "spent_amount": spent_amount,
                "remaining": remaining,
                "utilization_percentage": round(utilization, 2),
                "status": status,
                "period": {
                    "start_date": budget.start_date.isoformat(),
                    "end_date": budget.end_date.isoformat(),
                    "total_days": total_days,
                    "days_elapsed": days_elapsed,
                    "days_remaining": max(days_remaining, 0)
                },
                "burn_rate": {
                    "daily_budget": round(daily_budget, 2),
                    "daily_actual": round(daily_actual, 2),
                    "variance": round(daily_actual - daily_budget, 2)
                }
            })

            total_budgeted += budget_amount
            total_spent += spent_amount

        overall_utilization = (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0

        return {
            "report_type": "budget_performance",
            "summary": {
                "total_budgets": len(budgets),
                "total_budgeted": total_budgeted,
                "total_spent": total_spent,
                "total_remaining": total_budgeted - total_spent,
                "overall_utilization": round(overall_utilization, 2),
                "budgets_on_track": budgets_on_track,
                "budgets_exceeded": budgets_exceeded
            },
            "budgets": budget_details,
            "generated_at": datetime.now().isoformat()
        }

    def generate_annual_report(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        year: int
    ) -> Dict:
        """
        Generate comprehensive annual financial report.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            year: Year

        Returns:
            Annual financial report

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this report")

        self.log_operation("generate_annual_report", f"year={year}", user_id)

        # Get annual trends (12 months)
        monthly_trends = analytics_service.get_monthly_trends(
            db, user_id, current_user, months=12
        )

        # Calculate annual totals
        total_income = sum(m["income"] for m in monthly_trends)
        total_expenses = sum(m["expenses"] for m in monthly_trends)
        total_savings = sum(m["savings"] for m in monthly_trends)
        avg_savings_rate = sum(m["savings_rate"] for m in monthly_trends) / 12 if monthly_trends else 0

        # Get category breakdown for the year
        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31)

        categories = crud_category.get_categories_by_user(db, user_id=user_id)
        category_totals = []

        for category in categories:
            total = crud_transaction.get_total_by_category_and_date_range(
                db,
                user_id=user_id,
                category_id=category.id,
                start_date=start_date,
                end_date=end_date
            )
            if total and total < 0:  # Only expenses
                category_totals.append({
                    "category": category.name,
                    "total": abs(float(total)),
                    "percentage": abs(float(total)) / total_expenses * 100 if total_expenses > 0 else 0
                })

        # Sort by amount descending
        category_totals.sort(key=lambda x: x["total"], reverse=True)

        # Get tax calculation for the year
        tax_estimate = None
        if total_income > 0:
            try:
                avg_monthly_income = total_income / 12
                tax_estimate = tax_service.estimate_annual_tax(
                    db=db,
                    monthly_income=avg_monthly_income,
                    year=year,
                    current_user=current_user
                )
            except Exception as e:
                self.log_error("estimate_tax_for_annual_report", e, user_id)

        # Identify best and worst months
        best_month = max(monthly_trends, key=lambda x: x["savings"]) if monthly_trends else None
        worst_month = min(monthly_trends, key=lambda x: x["savings"]) if monthly_trends else None

        # Generate insights
        insights = self._generate_annual_insights(
            monthly_trends,
            total_income,
            total_expenses,
            total_savings,
            category_totals
        )

        return {
            "report_type": "annual",
            "year": year,
            "summary": {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "total_savings": total_savings,
                "average_monthly_income": round(total_income / 12, 2),
                "average_monthly_expenses": round(total_expenses / 12, 2),
                "average_monthly_savings": round(total_savings / 12, 2),
                "average_savings_rate": round(avg_savings_rate, 2),
                "best_month": {
                    "month": best_month["month"],
                    "savings": best_month["savings"]
                } if best_month else None,
                "worst_month": {
                    "month": worst_month["month"],
                    "savings": worst_month["savings"]
                } if worst_month else None
            },
            "monthly_trends": monthly_trends,
            "category_breakdown": category_totals[:10],  # Top 10 categories
            "tax_estimate": tax_estimate.model_dump() if tax_estimate else None,
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        }

    def _generate_monthly_insights(
        self,
        income_expenses: Dict,
        spending_by_category: List[Dict],
        budget_util: List[Dict]
    ) -> List[str]:
        """Generate insights for monthly report."""
        insights = []

        # Savings rate insight
        savings_rate = income_expenses["savings_rate"]
        if savings_rate < 0:
            insights.append("⚠️ You spent more than you earned this month. Consider reviewing your expenses.")
        elif savings_rate < 10:
            insights.append("💡 Your savings rate is low. Try to save at least 10-20% of your income.")
        elif savings_rate >= 20:
            insights.append("✅ Excellent savings rate! You're saving over 20% of your income.")

        # Budget adherence insight
        exceeded_budgets = [b for b in budget_util if b["status"] == "exceeded"]
        if exceeded_budgets:
            insights.append(f"⚠️ You exceeded {len(exceeded_budgets)} budget(s). Review your spending in these categories.")

        # Top spending category
        if spending_by_category:
            top_category = spending_by_category[0]
            if top_category["percentage"] > 40:
                insights.append(f"💡 {top_category['category']} accounts for {top_category['percentage']:.1f}% of your spending. Consider if this is balanced.")

        return insights

    def _generate_annual_insights(
        self,
        monthly_trends: List[Dict],
        total_income: float,
        total_expenses: float,
        total_savings: float,
        category_totals: List[Dict]
    ) -> List[str]:
        """Generate insights for annual report."""
        insights = []

        # Overall performance
        savings_rate = (total_savings / total_income * 100) if total_income > 0 else 0
        if savings_rate >= 20:
            insights.append(f"🎉 Great year! You saved {savings_rate:.1f}% of your income.")
        elif savings_rate >= 10:
            insights.append(f"👍 Good year. You saved {savings_rate:.1f}% of your income.")
        else:
            insights.append(f"📊 You saved {savings_rate:.1f}% of your income. Aim for at least 10-20%.")

        # Spending consistency
        monthly_expenses = [m["expenses"] for m in monthly_trends]
        if monthly_expenses:
            avg_expense = sum(monthly_expenses) / len(monthly_expenses)
            variance = sum((e - avg_expense) ** 2 for e in monthly_expenses) / len(monthly_expenses)
            std_dev = variance ** 0.5
            cv = (std_dev / avg_expense * 100) if avg_expense > 0 else 0

            if cv < 15:
                insights.append("✅ Your spending was consistent throughout the year.")
            elif cv > 30:
                insights.append("💡 Your spending varied significantly. Consider creating stable budgets.")

        # Top expense category
        if category_totals:
            top_category = category_totals[0]
            percentage = (top_category["total"] / total_expenses * 100) if total_expenses > 0 else 0
            insights.append(f"📈 Your highest expense category was {top_category['category']} at ₦{top_category['total']:,.2f} ({percentage:.1f}%).")

        return insights


# Create singleton instance
report_service = ReportService()
