"""
User service containing business logic for user operations.
"""
from typing import Optional

from sqlalchemy.orm import Session

from app.core.exceptions import (
    EmailAlreadyExistsException,
    UserNotFoundException,
    InvalidCredentialsException,
    InactiveUserException,
    NotAuthorizedException
)
from app.core.security import hash_password, verify_password
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.base_service import BaseService


class UserService(BaseService):
    """
    User service for handling user-related business logic.

    This service handles:
    - User registration with email uniqueness check
    - User authentication
    - User profile management
    - User authorization checks
    """

    def __init__(self):
        """Initialize UserService with user CRUD operations."""
        super().__init__(crud_user)

    def get_user_by_id(self, db: Session, user_id: int) -> User:
        """
        Get user by ID.

        Args:
            db: Database session
            user_id: User ID to retrieve

        Returns:
            User instance

        Raises:
            UserNotFoundException: If user not found
        """
        user = self.crud.get_user(db, user_id=user_id)
        if not user:
            raise UserNotFoundException(user_id)
        return user

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """
        Get user by email.

        Args:
            db: Database session
            email: User email

        Returns:
            User instance if found, None otherwise
        """
        return self.crud.get_user_by_email(db, email=email)

    def create_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Create a new user with email uniqueness check.

        Args:
            db: Database session
            user_in: User creation data

        Returns:
            Created user instance

        Raises:
            EmailAlreadyExistsException: If email already registered
        """
        # Check if email already exists
        existing_user = self.get_user_by_email(db, email=user_in.email)
        if existing_user:
            raise EmailAlreadyExistsException(user_in.email)

        self.log_operation("create_user", f"email={user_in.email}")

        # Create user with hashed password
        user = self.crud.create_user(db=db, user=user_in)

        return user

    def update_user(
        self,
        db: Session,
        user_id: int,
        user_update: UserUpdate,
        current_user: User
    ) -> User:
        """
        Update user profile.

        Args:
            db: Database session
            user_id: ID of user to update
            user_update: User update data
            current_user: Currently authenticated user

        Returns:
            Updated user instance

        Raises:
            UserNotFoundException: If user not found
            NotAuthorizedException: If user tries to update another user's profile
            EmailAlreadyExistsException: If new email already exists
        """
        # Get existing user
        user = self.get_user_by_id(db, user_id)

        # Authorization check: users can only update their own profile
        if user.id != current_user.id:
            raise NotAuthorizedException("Not authorized to update this user")

        # If email is being changed, check uniqueness
        if user_update.email and user_update.email != user.email:
            existing_user = self.get_user_by_email(db, email=user_update.email)
            if existing_user:
                raise EmailAlreadyExistsException(user_update.email)

        self.log_operation("update_user", f"user_id={user_id}", current_user.id)

        # Update user
        updated_user = self.crud.update_user(db=db, user_id=user_id, user=user_update)

        return updated_user

    def delete_user(self, db: Session, user_id: int, current_user: User) -> User:
        """
        Delete user account.

        Args:
            db: Database session
            user_id: ID of user to delete
            current_user: Currently authenticated user

        Returns:
            Deleted user instance

        Raises:
            UserNotFoundException: If user not found
            NotAuthorizedException: If user tries to delete another user's account
        """
        # Get existing user
        user = self.get_user_by_id(db, user_id)

        # Authorization check: users can only delete their own account
        if user.id != current_user.id:
            raise NotAuthorizedException("Not authorized to delete this user")

        self.log_operation("delete_user", f"user_id={user_id}", current_user.id)

        # Delete user
        deleted_user = self.crud.delete_user(db=db, user_id=user_id)

        return deleted_user

    def authenticate_user(self, db: Session, email: str, password: str) -> User:
        """
        Authenticate user with email and password.

        Args:
            db: Database session
            email: User email
            password: User password (plain text)

        Returns:
            Authenticated user instance

        Raises:
            InvalidCredentialsException: If credentials are incorrect
            InactiveUserException: If user account is inactive
        """
        user = self.get_user_by_email(db, email=email)

        # Check if user exists and password is correct
        if not user or not verify_password(password, user.password_hash):
            raise InvalidCredentialsException()

        # Check if user is active
        if not user.is_active:
            raise InactiveUserException()

        self.log_operation("authenticate_user", f"email={email}")

        return user

    def check_user_active(self, user: User):
        """
        Check if user is active.

        Args:
            user: User to check

        Raises:
            InactiveUserException: If user is inactive
        """
        if not user.is_active:
            raise InactiveUserException()

    def check_user_authorization(self, resource_user_id: int, current_user: User):
        """
        Check if current user is authorized to access resource.

        Args:
            resource_user_id: User ID that owns the resource
            current_user: Currently authenticated user

        Raises:
            NotAuthorizedException: If user not authorized
        """
        if resource_user_id != current_user.id:
            raise NotAuthorizedException()


# Create singleton instance
user_service = UserService()
