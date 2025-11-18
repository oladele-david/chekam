"""
Budget service containing business logic for budget operations.
"""
from typing import List

from sqlalchemy.orm import Session

from app.core.exceptions import (
    BudgetNotFoundException,
    NotAuthorizedException,
    InvalidAmountException,
    InvalidDateRangeException,
    BudgetExceededException
)
from app.crud import budget as crud_budget
from app.models.budget import Budget
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.base_service import BaseService


class BudgetService(BaseService):
    """
    Budget service for handling budget-related business logic.

    This service handles:
    - Budget creation with validation
    - Budget retrieval with authorization
    - Budget updates with ownership checks
    - Budget deletion
    - Budget limit tracking
    - Date range validation
    """

    def __init__(self):
        """Initialize BudgetService with budget CRUD operations."""
        super().__init__(crud_budget)

    def validate_budget_dates(self, start_date, end_date):
        """
        Validate budget date range.

        Args:
            start_date: Budget start date
            end_date: Budget end date

        Raises:
            InvalidDateRangeException: If end_date < start_date
        """
        if end_date < start_date:
            raise InvalidDateRangeException()

    def validate_budget_amount(self, amount: float):
        """
        Validate budget amount.

        Args:
            amount: Budget amount

        Raises:
            InvalidAmountException: If amount <= 0
        """
        if amount <= 0:
            raise InvalidAmountException()

    def check_budget_limit(
        self,
        budget: Budget,
        additional_amount: float = 0
    ):
        """
        Check if budget limit would be exceeded.

        Args:
            budget: Budget instance
            additional_amount: Amount to add to current amount

        Raises:
            BudgetExceededException: If budget limit would be exceeded
        """
        new_total = budget.current_amount + additional_amount
        if new_total > budget.amount:
            raise BudgetExceededException(
                budget_id=budget.id,
                limit=float(budget.amount),
                current=float(budget.current_amount),
                new_amount=additional_amount
            )

    def get_budget_by_id(
        self,
        db: Session,
        budget_id: int,
        current_user: User
    ) -> Budget:
        """
        Get budget by ID with authorization check.

        Args:
            db: Database session
            budget_id: Budget ID
            current_user: Currently authenticated user

        Returns:
            Budget instance

        Raises:
            BudgetNotFoundException: If budget not found
            NotAuthorizedException: If user doesn't own budget
        """
        budget = self.crud.get_budget(db, budget_id=budget_id)
        if not budget:
            raise BudgetNotFoundException(budget_id)

        # Authorization check
        if budget.user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this budget")

        return budget

    def get_user_budgets(
        self,
        db: Session,
        user_id: int,
        current_user: User
    ) -> List[Budget]:
        """
        Get all budgets for a user.

        Args:
            db: Database session
            user_id: User ID
            current_user: Currently authenticated user

        Returns:
            List of budgets

        Raises:
            NotAuthorizedException: If user tries to access another user's budgets
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access these budgets")

        budgets = self.crud.get_budget_by_user(db, user_id=user_id)

        return budgets

    def create_budget(
        self,
        db: Session,
        budget_in: BudgetCreate,
        current_user: User
    ) -> Budget:
        """
        Create a new budget with validation.

        Args:
            db: Database session
            budget_in: Budget creation data
            current_user: Currently authenticated user

        Returns:
            Created budget instance

        Raises:
            InvalidAmountException: If amount <= 0
            InvalidDateRangeException: If end_date < start_date
        """
        # Validate amount
        self.validate_budget_amount(budget_in.amount)

        # Validate dates
        self.validate_budget_dates(budget_in.start_date, budget_in.end_date)

        # Ensure budget belongs to current user
        budget_in.user_id = current_user.id

        self.log_operation(
            "create_budget",
            f"amount={budget_in.amount}, category_id={budget_in.category_id}",
            current_user.id
        )

        budget = self.crud.create_budget(db, budget=budget_in)

        return budget

    def update_budget(
        self,
        db: Session,
        budget_id: int,
        budget_update: BudgetUpdate,
        current_user: User
    ) -> Budget:
        """
        Update a budget with authorization and validation.

        Args:
            db: Database session
            budget_id: Budget ID to update
            budget_update: Budget update data
            current_user: Currently authenticated user

        Returns:
            Updated budget instance

        Raises:
            BudgetNotFoundException: If budget not found
            NotAuthorizedException: If user doesn't own budget
            InvalidAmountException: If amount <= 0
            InvalidDateRangeException: If end_date < start_date
        """
        # Get and authorize budget
        budget = self.get_budget_by_id(db, budget_id, current_user)

        # Validate amount if being updated
        if budget_update.amount is not None:
            self.validate_budget_amount(budget_update.amount)

        # Validate dates if being updated
        start_date = budget_update.start_date or budget.start_date
        end_date = budget_update.end_date or budget.end_date
        self.validate_budget_dates(start_date, end_date)

        self.log_operation(
            "update_budget",
            f"budget_id={budget_id}",
            current_user.id
        )

        updated_budget = self.crud.update_budget(
            db,
            budget_id=budget_id,
            budget=budget_update
        )

        return updated_budget

    def update_budget_current_amount(
        self,
        db: Session,
        budget_id: int,
        current_amount: float,
        current_user: User,
        check_limit: bool = True
    ) -> Budget:
        """
        Update budget's current amount.

        Args:
            db: Database session
            budget_id: Budget ID to update
            current_amount: New current amount
            current_user: Currently authenticated user
            check_limit: Whether to check if limit would be exceeded

        Returns:
            Updated budget instance

        Raises:
            BudgetNotFoundException: If budget not found
            NotAuthorizedException: If user doesn't own budget
            BudgetExceededException: If amount exceeds budget limit
        """
        # Get and authorize budget
        budget = self.get_budget_by_id(db, budget_id, current_user)

        # Check if new amount exceeds limit
        if check_limit and current_amount > budget.amount:
            raise BudgetExceededException(
                budget_id=budget.id,
                limit=float(budget.amount),
                current=float(budget.current_amount),
                new_amount=current_amount
            )

        self.log_operation(
            "update_budget_current_amount",
            f"budget_id={budget_id}, new_amount={current_amount}",
            current_user.id
        )

        updated_budget = self.crud.update_current_amount(
            db,
            budget_id=budget_id,
            current_amount=current_amount
        )

        return updated_budget

    def delete_budget(
        self,
        db: Session,
        budget_id: int,
        current_user: User
    ) -> Budget:
        """
        Delete a budget with authorization check.

        Args:
            db: Database session
            budget_id: Budget ID to delete
            current_user: Currently authenticated user

        Returns:
            Deleted budget instance

        Raises:
            BudgetNotFoundException: If budget not found
            NotAuthorizedException: If user doesn't own budget
        """
        # Get and authorize budget
        budget = self.get_budget_by_id(db, budget_id, current_user)

        self.log_operation(
            "delete_budget",
            f"budget_id={budget_id}",
            current_user.id
        )

        deleted_budget = self.crud.delete_budget(db, budget_id=budget_id)

        return deleted_budget


# Create singleton instance
budget_service = BudgetService()
