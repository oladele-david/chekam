"""
Base service class.

Provides common functionality for all services.
"""
import logging
from typing import Generic, TypeVar, Type

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase

# Setup logger
logger = logging.getLogger(__name__)

# Type variable for CRUD type
CRUDType = TypeVar("CRUDType", bound=CRUDBase)


class BaseService(Generic[CRUDType]):
    """
    Base service class providing common functionality.

    All service classes should inherit from this class to get
    standard logging and CRUD access patterns.

    Type Parameters:
        CRUDType: The CRUD class type for this service

    Example:
        class UserService(BaseService[CRUDUser]):
            def __init__(self):
                super().__init__(crud_user)
    """

    def __init__(self, crud: CRUDType):
        """
        Initialize service with CRUD instance.

        Args:
            crud: CRUD instance for database operations
        """
        self.crud = crud
        self.logger = logging.getLogger(self.__class__.__name__)

    def log_operation(self, operation: str, details: str = "", user_id: int = None):
        """
        Log a service operation.

        Args:
            operation: Operation name (e.g., "create_transaction")
            details: Additional details about the operation
            user_id: ID of user performing the operation
        """
        log_message = f"{operation}"
        if user_id:
            log_message += f" [user_id={user_id}]"
        if details:
            log_message += f" - {details}"

        self.logger.info(log_message)

    def log_error(self, operation: str, error: Exception, user_id: int = None):
        """
        Log a service error.

        Args:
            operation: Operation that failed
            error: Exception that occurred
            user_id: ID of user who encountered the error
        """
        log_message = f"Error in {operation}"
        if user_id:
            log_message += f" [user_id={user_id}]"
        log_message += f": {str(error)}"

        self.logger.error(log_message, exc_info=True)
