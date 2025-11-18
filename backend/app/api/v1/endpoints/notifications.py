"""
Notifications API endpoints for alerts and notifications.
"""
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.exceptions import CheKamException
from app.db.session import get_db
from app.models.user import User
from app.services.notification_service import notification_service

router = APIRouter()


@router.get("/{user_id}")
def get_notifications(
    user_id: int,
    include_low_priority: bool = Query(True, description="Include low priority notifications"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Get all notifications for a user.

    Retrieves all active notifications including:
    - **Budget Alerts**: Warning, critical, and exceeded budget notifications
    - **Spending Alerts**: Large expenses, low savings rate, negative savings
    - **Savings Milestones**: Achievement notifications (future feature)
    - **Monthly Summaries**: End-of-month summaries (future feature)

    Notifications are prioritized as:
    - **Urgent**: Budget exceeded, spending more than earning
    - **High**: Budget critical (85-100% utilized)
    - **Medium**: Budget warning (70-85%), large expenses, low savings
    - **Low**: General information

    Args:
        user_id: User ID
        include_low_priority: Include low priority notifications (default: True)
        db: Database session
        current_user: Current authenticated user

    Returns:
        All notifications grouped by priority

    Raises:
        403: If user tries to access another user's notifications

    Example Response:
        ```json
        {
            "user_id": 1,
            "total_count": 5,
            "unread_count": 5,
            "notifications": [
                {
                    "id": "budget_1_exceeded",
                    "type": "budget_exceeded",
                    "priority": "urgent",
                    "title": "Food & Dining Budget Exceeded",
                    "message": "You've spent ₦105,000 of your ₦100,000 budget (105%). You're ₦5,000 over budget.",
                    "budget_id": 1,
                    "category": "Food & Dining",
                    "utilization": 105.0,
                    "created_at": "2026-01-15T10:30:00"
                },
                {
                    "id": "low_savings_rate",
                    "type": "low_savings",
                    "priority": "medium",
                    "title": "Low Savings Rate",
                    "message": "Your savings rate is 8.5%. Try to save at least 10-20% of your income.",
                    "savings_rate": 8.5,
                    "created_at": "2026-01-15T10:30:00"
                }
            ],
            "grouped_by_priority": {
                "urgent": [...],
                "high": [...],
                "medium": [...],
                "low": [...]
            }
        }
        ```
    """
    try:
        return notification_service.get_all_notifications(
            db=db,
            user_id=user_id,
            current_user=current_user,
            include_low_priority=include_low_priority
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve notifications: {str(e)}"
        )


@router.get("/{user_id}/budget-alerts")
def get_budget_alerts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Dict]:
    """
    Get budget-specific alerts for a user.

    Returns only budget-related notifications:
    - Warning: Budget at 70-85% utilization
    - Critical: Budget at 85-100% utilization
    - Exceeded: Budget over 100% utilization

    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of budget alerts

    Raises:
        403: If user tries to access another user's alerts

    Example Response:
        ```json
        [
            {
                "id": "budget_1_critical",
                "type": "budget_critical",
                "priority": "high",
                "title": "Food & Dining Budget Critical",
                "message": "You've used 92.5% of your Food & Dining budget. Only ₦7,500 remaining with 5 days left.",
                "budget_id": 1,
                "category": "Food & Dining",
                "utilization": 92.5,
                "created_at": "2026-01-15T10:30:00"
            }
        ]
        ```
    """
    try:
        return notification_service.get_budget_alerts(
            db=db,
            user_id=user_id,
            current_user=current_user
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve budget alerts: {str(e)}"
        )


@router.get("/{user_id}/spending-alerts")
def get_spending_alerts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Dict]:
    """
    Get spending-related alerts for a user.

    Returns spending pattern notifications:
    - Large expenses (90th percentile or higher)
    - Low savings rate (< 10%)
    - Negative savings (spending more than earning)

    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of spending alerts

    Raises:
        403: If user tries to access another user's alerts

    Example Response:
        ```json
        [
            {
                "id": "large_expense_123",
                "type": "large_expense",
                "priority": "medium",
                "title": "Large Expense Detected",
                "message": "Large expense of ₦45,000 in Food & Dining: Restaurant dinner",
                "transaction_id": 123,
                "amount": 45000,
                "category": "Food & Dining",
                "date": "2026-01-14",
                "created_at": "2026-01-15T10:30:00"
            },
            {
                "id": "negative_savings",
                "type": "low_savings",
                "priority": "urgent",
                "title": "Spending More Than Earning",
                "message": "You've spent ₦50,000 more than you earned this month. Review your expenses.",
                "deficit": 50000,
                "created_at": "2026-01-15T10:30:00"
            }
        ]
        ```
    """
    try:
        return notification_service.get_spending_alerts(
            db=db,
            user_id=user_id,
            current_user=current_user
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve spending alerts: {str(e)}"
        )


@router.get("/{user_id}/summary")
def get_notification_summary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict:
    """
    Get notification summary counts by type and priority.

    Provides a quick overview of notification counts without
    retrieving full notification details.

    Args:
        user_id: User ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Summary of notification counts

    Raises:
        403: If user tries to access another user's summary

    Example Response:
        ```json
        {
            "total_notifications": 7,
            "by_priority": {
                "urgent": 2,
                "high": 1,
                "medium": 3,
                "low": 1
            },
            "by_type": {
                "budget_exceeded": 1,
                "budget_critical": 1,
                "budget_warning": 1,
                "large_expense": 3,
                "low_savings": 1
            }
        }
        ```
    """
    try:
        return notification_service.get_notification_summary(
            db=db,
            user_id=user_id,
            current_user=current_user
        )
    except CheKamException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve notification summary: {str(e)}"
        )
