"""
Notification Service.

Handles budget alerts, spending notifications, and user alerts.
"""
from typing import Dict, List
from datetime import datetime
from enum import Enum

from sqlalchemy.orm import Session

from app.core.exceptions import NotAuthorizedException
from app.models.user import User
from app.services.base_service import BaseService
from app.services.analytics_service import analytics_service
from app.crud import budget as crud_budget
from app.crud import transaction as crud_transaction


class NotificationType(str, Enum):
    """Notification type enumeration."""
    BUDGET_WARNING = "budget_warning"  # 70-85% utilized
    BUDGET_CRITICAL = "budget_critical"  # 85-100% utilized
    BUDGET_EXCEEDED = "budget_exceeded"  # >100% utilized
    LARGE_EXPENSE = "large_expense"  # Unusually large transaction
    SAVINGS_MILESTONE = "savings_milestone"  # Savings goal reached
    LOW_SAVINGS = "low_savings"  # Savings rate < 10%
    MONTHLY_SUMMARY = "monthly_summary"  # End of month summary


class NotificationPriority(str, Enum):
    """Notification priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationService(BaseService):
    """
    Notification service for alerts and notifications.

    Provides:
    - Budget alerts (warning, critical, exceeded)
    - Large expense notifications
    - Savings milestones
    - Monthly summaries
    """

    def __init__(self):
        """Initialize NotificationService."""
        super().__init__(crud_budget)

    def get_budget_alerts(
        self,
        db: Session,
        user_id: int,
        current_user: User
    ) -> List[Dict]:
        """
        Get all budget alerts for a user.

        Checks all active budgets and generates alerts for:
        - Budgets at 70-85% (warning)
        - Budgets at 85-100% (critical)
        - Budgets over 100% (exceeded)

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user

        Returns:
            List of budget alerts

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access these alerts")

        self.log_operation("get_budget_alerts", "", user_id)

        # Get budget utilization
        budget_util = analytics_service.get_budget_utilization(
            db, user_id, current_user
        )

        alerts = []

        for budget in budget_util:
            status = budget["status"]
            utilization = budget["utilization_percentage"]

            if status == "exceeded":
                alerts.append({
                    "id": f"budget_{budget['budget_id']}_exceeded",
                    "type": NotificationType.BUDGET_EXCEEDED,
                    "priority": NotificationPriority.URGENT,
                    "title": f"{budget['category']} Budget Exceeded",
                    "message": (
                        f"You've spent ₦{budget['spent_amount']:,.2f} of your "
                        f"₦{budget['budget_amount']:,.2f} budget ({utilization:.1f}%). "
                        f"You're ₦{abs(budget['remaining']):,.2f} over budget."
                    ),
                    "budget_id": budget["budget_id"],
                    "category": budget["category"],
                    "utilization": utilization,
                    "created_at": datetime.now().isoformat()
                })
            elif status == "critical":
                alerts.append({
                    "id": f"budget_{budget['budget_id']}_critical",
                    "type": NotificationType.BUDGET_CRITICAL,
                    "priority": NotificationPriority.HIGH,
                    "title": f"{budget['category']} Budget Critical",
                    "message": (
                        f"You've used {utilization:.1f}% of your {budget['category']} budget. "
                        f"Only ₦{budget['remaining']:,.2f} remaining with "
                        f"{budget['days_remaining']} days left."
                    ),
                    "budget_id": budget["budget_id"],
                    "category": budget["category"],
                    "utilization": utilization,
                    "created_at": datetime.now().isoformat()
                })
            elif status == "warning":
                alerts.append({
                    "id": f"budget_{budget['budget_id']}_warning",
                    "type": NotificationType.BUDGET_WARNING,
                    "priority": NotificationPriority.MEDIUM,
                    "title": f"{budget['category']} Budget Warning",
                    "message": (
                        f"You've used {utilization:.1f}% of your {budget['category']} budget. "
                        f"₦{budget['remaining']:,.2f} remaining."
                    ),
                    "budget_id": budget["budget_id"],
                    "category": budget["category"],
                    "utilization": utilization,
                    "created_at": datetime.now().isoformat()
                })

        return alerts

    def get_spending_alerts(
        self,
        db: Session,
        user_id: int,
        current_user: User
    ) -> List[Dict]:
        """
        Get spending-related alerts for a user.

        Includes:
        - Large expense notifications
        - Low savings rate alerts
        - Unusual spending patterns

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user

        Returns:
            List of spending alerts

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access these alerts")

        self.log_operation("get_spending_alerts", "", user_id)

        alerts = []

        # Get income vs expenses for current month
        income_expenses = analytics_service.get_income_vs_expenses(
            db, user_id, current_user
        )

        # Check for low savings rate
        savings_rate = income_expenses["savings_rate"]
        if savings_rate < 10 and income_expenses["total_income"] > 0:
            alerts.append({
                "id": "low_savings_rate",
                "type": NotificationType.LOW_SAVINGS,
                "priority": NotificationPriority.MEDIUM,
                "title": "Low Savings Rate",
                "message": (
                    f"Your savings rate is {savings_rate:.1f}%. "
                    f"Try to save at least 10-20% of your income."
                ),
                "savings_rate": savings_rate,
                "created_at": datetime.now().isoformat()
            })

        # Check for negative savings (spending more than earning)
        if income_expenses["net_savings"] < 0:
            alerts.append({
                "id": "negative_savings",
                "type": NotificationType.LOW_SAVINGS,
                "priority": NotificationPriority.URGENT,
                "title": "Spending More Than Earning",
                "message": (
                    f"You've spent ₦{abs(income_expenses['net_savings']):,.2f} "
                    f"more than you earned this month. Review your expenses."
                ),
                "deficit": abs(income_expenses["net_savings"]),
                "created_at": datetime.now().isoformat()
            })

        # Get recent large transactions (top 10% by amount)
        recent_txns = crud_transaction.get_transactions_by_user(
            db, user_id=user_id, skip=0, limit=100
        )

        if recent_txns:
            # Calculate threshold for "large" expenses (90th percentile)
            expense_amounts = [abs(float(txn.amount)) for txn in recent_txns if txn.amount < 0]
            if expense_amounts:
                expense_amounts.sort()
                percentile_90_index = int(len(expense_amounts) * 0.9)
                large_threshold = expense_amounts[percentile_90_index] if percentile_90_index < len(expense_amounts) else 0

                # Find recent large expenses (last 7 days)
                from datetime import timedelta
                seven_days_ago = datetime.now() - timedelta(days=7)

                for txn in recent_txns:
                    if (txn.amount < 0 and
                        abs(float(txn.amount)) >= large_threshold and
                        txn.start_date >= seven_days_ago):
                        alerts.append({
                            "id": f"large_expense_{txn.id}",
                            "type": NotificationType.LARGE_EXPENSE,
                            "priority": NotificationPriority.MEDIUM,
                            "title": "Large Expense Detected",
                            "message": (
                                f"Large expense of ₦{abs(float(txn.amount)):,.2f} "
                                f"in {txn.category.name if txn.category else 'Uncategorized'}: "
                                f"{txn.description or 'No description'}"
                            ),
                            "transaction_id": txn.id,
                            "amount": abs(float(txn.amount)),
                            "category": txn.category.name if txn.category else "Uncategorized",
                            "date": txn.start_date.isoformat(),
                            "created_at": datetime.now().isoformat()
                        })

        return alerts

    def get_all_notifications(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        include_low_priority: bool = True
    ) -> Dict:
        """
        Get all notifications for a user.

        Combines budget alerts and spending alerts into a single response.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user
            include_low_priority: Include low priority notifications

        Returns:
            Dictionary with all notifications grouped by type

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access these notifications")

        # Get all alerts
        budget_alerts = self.get_budget_alerts(db, user_id, current_user)
        spending_alerts = self.get_spending_alerts(db, user_id, current_user)

        # Combine and filter
        all_notifications = budget_alerts + spending_alerts

        if not include_low_priority:
            all_notifications = [
                n for n in all_notifications
                if n["priority"] != NotificationPriority.LOW
            ]

        # Sort by priority
        priority_order = {
            NotificationPriority.URGENT: 0,
            NotificationPriority.HIGH: 1,
            NotificationPriority.MEDIUM: 2,
            NotificationPriority.LOW: 3
        }
        all_notifications.sort(key=lambda x: priority_order.get(x["priority"], 999))

        # Group by priority
        grouped = {
            "urgent": [n for n in all_notifications if n["priority"] == NotificationPriority.URGENT],
            "high": [n for n in all_notifications if n["priority"] == NotificationPriority.HIGH],
            "medium": [n for n in all_notifications if n["priority"] == NotificationPriority.MEDIUM],
            "low": [n for n in all_notifications if n["priority"] == NotificationPriority.LOW]
        }

        return {
            "user_id": user_id,
            "total_count": len(all_notifications),
            "unread_count": len(all_notifications),  # In a real system, track read status
            "notifications": all_notifications,
            "grouped_by_priority": grouped,
            "generated_at": datetime.now().isoformat()
        }

    def get_notification_summary(
        self,
        db: Session,
        user_id: int,
        current_user: User
    ) -> Dict:
        """
        Get a summary of notifications by type and priority.

        Args:
            db: Database session
            user_id: User ID
            current_user: Current user

        Returns:
            Summary of notification counts

        Raises:
            NotAuthorizedException: If accessing another user's data
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this summary")

        notifications = self.get_all_notifications(db, user_id, current_user)

        summary = {
            "total_notifications": notifications["total_count"],
            "by_priority": {
                "urgent": len(notifications["grouped_by_priority"]["urgent"]),
                "high": len(notifications["grouped_by_priority"]["high"]),
                "medium": len(notifications["grouped_by_priority"]["medium"]),
                "low": len(notifications["grouped_by_priority"]["low"])
            },
            "by_type": {}
        }

        # Count by type
        for notification in notifications["notifications"]:
            notif_type = notification["type"]
            if notif_type not in summary["by_type"]:
                summary["by_type"][notif_type] = 0
            summary["by_type"][notif_type] += 1

        return summary


# Create singleton instance
notification_service = NotificationService()
