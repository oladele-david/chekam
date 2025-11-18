"""
Custom exception classes for the application.

These exceptions provide better error handling and consistent error responses
across the application. Each exception maps to a specific HTTP status code.
"""
from typing import Any, Dict, Optional


class CheKamException(Exception):
    """Base exception class for all CheKam exceptions."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


# ============================================================================
# 400 Bad Request Errors
# ============================================================================

class BadRequestException(CheKamException):
    """Raised when the request is malformed or invalid."""

    def __init__(self, message: str = "Bad request", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=400, details=details)


class ValidationException(CheKamException):
    """Raised when input validation fails."""

    def __init__(self, message: str = "Validation error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=400, details=details)


class InvalidDateRangeException(ValidationException):
    """Raised when date range is invalid (e.g., end_date < start_date)."""

    def __init__(self, message: str = "Invalid date range: end_date must be >= start_date"):
        super().__init__(message)


class InvalidAmountException(ValidationException):
    """Raised when amount is invalid (e.g., negative or zero)."""

    def __init__(self, message: str = "Invalid amount: must be greater than 0"):
        super().__init__(message)


# ============================================================================
# 401 Unauthorized Errors
# ============================================================================

class UnauthorizedException(CheKamException):
    """Raised when authentication fails or is missing."""

    def __init__(self, message: str = "Authentication required", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=401, details=details)


class InvalidCredentialsException(UnauthorizedException):
    """Raised when login credentials are incorrect."""

    def __init__(self, message: str = "Incorrect email or password"):
        super().__init__(message)


class InvalidTokenException(UnauthorizedException):
    """Raised when JWT token is invalid or expired."""

    def __init__(self, message: str = "Invalid or expired token"):
        super().__init__(message)


# ============================================================================
# 403 Forbidden Errors
# ============================================================================

class ForbiddenException(CheKamException):
    """Raised when user doesn't have permission to perform action."""

    def __init__(self, message: str = "Forbidden", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=403, details=details)


class NotAuthorizedException(ForbiddenException):
    """Raised when user tries to access resource they don't own."""

    def __init__(self, message: str = "Not authorized to access this resource"):
        super().__init__(message)


class InactiveUserException(ForbiddenException):
    """Raised when inactive user tries to perform action."""

    def __init__(self, message: str = "User account is inactive"):
        super().__init__(message)


# ============================================================================
# 404 Not Found Errors
# ============================================================================

class NotFoundException(CheKamException):
    """Raised when requested resource is not found."""

    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=404, details=details)


class UserNotFoundException(NotFoundException):
    """Raised when user is not found."""

    def __init__(self, user_id: Optional[int] = None):
        message = f"User with ID {user_id} not found" if user_id else "User not found"
        super().__init__(message)


class TransactionNotFoundException(NotFoundException):
    """Raised when transaction is not found."""

    def __init__(self, transaction_id: Optional[int] = None):
        message = f"Transaction with ID {transaction_id} not found" if transaction_id else "Transaction not found"
        super().__init__(message)


class BudgetNotFoundException(NotFoundException):
    """Raised when budget is not found."""

    def __init__(self, budget_id: Optional[int] = None):
        message = f"Budget with ID {budget_id} not found" if budget_id else "Budget not found"
        super().__init__(message)


class CategoryNotFoundException(NotFoundException):
    """Raised when category is not found."""

    def __init__(self, category_id: Optional[int] = None):
        message = f"Category with ID {category_id} not found" if category_id else "Category not found"
        super().__init__(message)


# ============================================================================
# 409 Conflict Errors
# ============================================================================

class ConflictException(CheKamException):
    """Raised when there's a conflict with existing data."""

    def __init__(self, message: str = "Resource conflict", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=409, details=details)


class EmailAlreadyExistsException(ConflictException):
    """Raised when trying to register with existing email."""

    def __init__(self, email: Optional[str] = None):
        message = f"Email {email} is already registered" if email else "Email already registered"
        super().__init__(message)


class DuplicateResourceException(ConflictException):
    """Raised when trying to create duplicate resource."""

    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message)


# ============================================================================
# 422 Unprocessable Entity Errors
# ============================================================================

class UnprocessableEntityException(CheKamException):
    """Raised when request is valid but cannot be processed."""

    def __init__(self, message: str = "Cannot process request", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=422, details=details)


class BudgetExceededException(UnprocessableEntityException):
    """Raised when transaction would exceed budget limit."""

    def __init__(self, budget_id: int, limit: float, current: float, new_amount: float):
        message = (
            f"Transaction would exceed budget limit. "
            f"Budget: {limit}, Current: {current}, New: {new_amount}, "
            f"Total would be: {current + new_amount}"
        )
        super().__init__(message, details={
            "budget_id": budget_id,
            "limit": limit,
            "current_amount": current,
            "new_amount": new_amount,
            "would_be_total": current + new_amount
        })


# ============================================================================
# 500 Internal Server Errors
# ============================================================================

class InternalServerException(CheKamException):
    """Raised when an unexpected server error occurs."""

    def __init__(self, message: str = "Internal server error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details)


class DatabaseException(InternalServerException):
    """Raised when a database operation fails."""

    def __init__(self, message: str = "Database operation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, details=details)
