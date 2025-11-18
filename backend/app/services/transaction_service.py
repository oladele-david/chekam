"""
Transaction service containing business logic for transaction operations.
"""
from typing import List

from sqlalchemy.orm import Session

from app.core.exceptions import (
    TransactionNotFoundException,
    NotAuthorizedException,
    InvalidAmountException,
    InvalidDateRangeException
)
from app.crud import transaction as crud_transaction
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.base_service import BaseService


class TransactionService(BaseService):
    """
    Transaction service for handling transaction-related business logic.

    This service handles:
    - Transaction creation with validation
    - Transaction retrieval with authorization
    - Transaction updates with ownership checks
    - Transaction deletion
    - Date range validation
    - Amount validation
    """

    def __init__(self):
        """Initialize TransactionService with transaction CRUD operations."""
        super().__init__(crud_transaction)

    def validate_transaction_dates(self, start_date, end_date=None):
        """
        Validate transaction date range.

        Args:
            start_date: Transaction start date
            end_date: Transaction end date (optional)

        Raises:
            InvalidDateRangeException: If end_date < start_date
        """
        if end_date and end_date < start_date:
            raise InvalidDateRangeException()

    def validate_transaction_amount(self, amount: float):
        """
        Validate transaction amount.

        Args:
            amount: Transaction amount

        Raises:
            InvalidAmountException: If amount <= 0
        """
        if amount <= 0:
            raise InvalidAmountException()

    def get_transaction_by_id(
        self,
        db: Session,
        transaction_id: int,
        current_user: User
    ) -> Transaction:
        """
        Get transaction by ID with authorization check.

        Args:
            db: Database session
            transaction_id: Transaction ID
            current_user: Currently authenticated user

        Returns:
            Transaction instance

        Raises:
            TransactionNotFoundException: If transaction not found
            NotAuthorizedException: If user doesn't own transaction
        """
        transaction = self.crud.get_transaction(db, transaction_id=transaction_id)
        if not transaction:
            raise TransactionNotFoundException(transaction_id)

        # Authorization check
        if transaction.user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this transaction")

        return transaction

    def get_user_transactions(
        self,
        db: Session,
        user_id: int,
        current_user: User,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """
        Get all transactions for a user.

        Args:
            db: Database session
            user_id: User ID
            current_user: Currently authenticated user
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of transactions

        Raises:
            NotAuthorizedException: If user tries to access another user's transactions
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access these transactions")

        transactions = self.crud.get_transactions_by_user(
            db,
            user_id=user_id,
            skip=skip,
            limit=limit
        )

        return transactions

    def create_transaction(
        self,
        db: Session,
        transaction_in: TransactionCreate,
        current_user: User
    ) -> Transaction:
        """
        Create a new transaction with validation.

        Args:
            db: Database session
            transaction_in: Transaction creation data
            current_user: Currently authenticated user

        Returns:
            Created transaction instance

        Raises:
            InvalidAmountException: If amount <= 0
            InvalidDateRangeException: If end_date < start_date
        """
        # Validate amount
        self.validate_transaction_amount(transaction_in.amount)

        # Validate dates
        self.validate_transaction_dates(
            transaction_in.start_date,
            transaction_in.end_date
        )

        # Ensure transaction belongs to current user
        transaction_in.user_id = current_user.id

        self.log_operation(
            "create_transaction",
            f"amount={transaction_in.amount}, category_id={transaction_in.category_id}",
            current_user.id
        )

        transaction = self.crud.create_transaction(db, transaction=transaction_in)

        return transaction

    def update_transaction(
        self,
        db: Session,
        transaction_id: int,
        transaction_update: TransactionUpdate,
        current_user: User
    ) -> Transaction:
        """
        Update a transaction with authorization and validation.

        Args:
            db: Database session
            transaction_id: Transaction ID to update
            transaction_update: Transaction update data
            current_user: Currently authenticated user

        Returns:
            Updated transaction instance

        Raises:
            TransactionNotFoundException: If transaction not found
            NotAuthorizedException: If user doesn't own transaction
            InvalidAmountException: If amount <= 0
            InvalidDateRangeException: If end_date < start_date
        """
        # Get and authorize transaction
        transaction = self.get_transaction_by_id(db, transaction_id, current_user)

        # Validate amount if being updated
        if transaction_update.amount is not None:
            self.validate_transaction_amount(transaction_update.amount)

        # Validate dates if being updated
        start_date = transaction_update.start_date or transaction.start_date
        end_date = transaction_update.end_date if hasattr(transaction_update, 'end_date') else transaction.end_date
        self.validate_transaction_dates(start_date, end_date)

        self.log_operation(
            "update_transaction",
            f"transaction_id={transaction_id}",
            current_user.id
        )

        updated_transaction = self.crud.update_transaction(
            db,
            transaction_id=transaction_id,
            transaction=transaction_update
        )

        return updated_transaction

    def delete_transaction(
        self,
        db: Session,
        transaction_id: int,
        current_user: User
    ) -> Transaction:
        """
        Delete a transaction with authorization check.

        Args:
            db: Database session
            transaction_id: Transaction ID to delete
            current_user: Currently authenticated user

        Returns:
            Deleted transaction instance

        Raises:
            TransactionNotFoundException: If transaction not found
            NotAuthorizedException: If user doesn't own transaction
        """
        # Get and authorize transaction
        transaction = self.get_transaction_by_id(db, transaction_id, current_user)

        self.log_operation(
            "delete_transaction",
            f"transaction_id={transaction_id}",
            current_user.id
        )

        deleted_transaction = self.crud.delete_transaction(db, transaction_id=transaction_id)

        return deleted_transaction


# Create singleton instance
transaction_service = TransactionService()
