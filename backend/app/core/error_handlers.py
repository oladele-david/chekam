"""
Exception handlers for the application.

These handlers convert custom exceptions to proper HTTP responses
with consistent error formatting.
"""
import logging
from typing import Union

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import CheKamException

# Setup logger
logger = logging.getLogger(__name__)


def create_error_response(
    status_code: int,
    message: str,
    details: dict = None,
    error_type: str = None
) -> JSONResponse:
    """
    Create a standardized error response.

    Args:
        status_code: HTTP status code
        message: Error message
        details: Additional error details
        error_type: Type of error (e.g., "ValidationError")

    Returns:
        JSONResponse with standardized error format
    """
    content = {
        "error": {
            "message": message,
            "type": error_type or "Error",
            "status_code": status_code
        }
    }

    if details:
        content["error"]["details"] = details

    return JSONResponse(
        status_code=status_code,
        content=content
    )


async def chekam_exception_handler(request: Request, exc: CheKamException) -> JSONResponse:
    """
    Handle custom CheKam exceptions.

    Args:
        request: FastAPI request object
        exc: CheKamException instance

    Returns:
        JSONResponse with error details
    """
    logger.error(
        f"{exc.__class__.__name__}: {exc.message}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "details": exc.details
        }
    )

    return create_error_response(
        status_code=exc.status_code,
        message=exc.message,
        details=exc.details if exc.details else None,
        error_type=exc.__class__.__name__
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors.

    Args:
        request: FastAPI request object
        exc: RequestValidationError instance

    Returns:
        JSONResponse with validation error details
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    logger.warning(
        f"Validation error on {request.url.path}",
        extra={"errors": errors}
    )

    return create_error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Validation error",
        details={"errors": errors},
        error_type="ValidationError"
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """
    Handle SQLAlchemy database errors.

    Args:
        request: FastAPI request object
        exc: SQLAlchemyError instance

    Returns:
        JSONResponse with database error details
    """
    logger.error(
        f"Database error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method
        },
        exc_info=True
    )

    return create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Database operation failed",
        error_type="DatabaseError"
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions.

    Args:
        request: FastAPI request object
        exc: Exception instance

    Returns:
        JSONResponse with generic error message
    """
    logger.error(
        f"Unexpected error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method
        },
        exc_info=True
    )

    return create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="An unexpected error occurred",
        error_type="InternalServerError"
    )
