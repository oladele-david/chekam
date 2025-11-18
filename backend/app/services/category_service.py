"""
Category service containing business logic for category operations.
"""
from typing import List

from sqlalchemy.orm import Session

from app.core.exceptions import (
    CategoryNotFoundException,
    NotAuthorizedException
)
from app.crud import category as crud_category
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.base_service import BaseService


class CategoryService(BaseService):
    """
    Category service for handling category-related business logic.

    This service handles:
    - Category creation
    - Category retrieval with authorization
    - Category updates with ownership checks
    - Category deletion
    """

    def __init__(self):
        """Initialize CategoryService with category CRUD operations."""
        super().__init__(crud_category)

    def get_category_by_id(
        self,
        db: Session,
        category_id: int,
        current_user: User
    ) -> Category:
        """
        Get category by ID with authorization check.

        Args:
            db: Database session
            category_id: Category ID
            current_user: Currently authenticated user

        Returns:
            Category instance

        Raises:
            CategoryNotFoundException: If category not found
            NotAuthorizedException: If user doesn't own category
        """
        category = self.crud.get_category(db, category_id=category_id)
        if not category:
            raise CategoryNotFoundException(category_id)

        # Authorization check
        if category.user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access this category")

        return category

    def get_user_categories(
        self,
        db: Session,
        user_id: int,
        current_user: User
    ) -> List[Category]:
        """
        Get all categories for a user.

        Args:
            db: Database session
            user_id: User ID
            current_user: Currently authenticated user

        Returns:
            List of categories

        Raises:
            NotAuthorizedException: If user tries to access another user's categories
        """
        # Authorization check
        if user_id != current_user.id:
            raise NotAuthorizedException("Not authorized to access these categories")

        categories = self.crud.get_category_by_user(db, user_id=user_id)

        return categories

    def create_category(
        self,
        db: Session,
        category_in: CategoryCreate,
        current_user: User
    ) -> Category:
        """
        Create a new category.

        Args:
            db: Database session
            category_in: Category creation data
            current_user: Currently authenticated user

        Returns:
            Created category instance
        """
        # Ensure category belongs to current user
        category_in.user_id = current_user.id

        self.log_operation(
            "create_category",
            f"name={category_in.name}, type={category_in.type}",
            current_user.id
        )

        category = self.crud.create_category(db, category=category_in)

        return category

    def update_category(
        self,
        db: Session,
        category_id: int,
        category_update: CategoryUpdate,
        current_user: User
    ) -> Category:
        """
        Update a category with authorization check.

        Args:
            db: Database session
            category_id: Category ID to update
            category_update: Category update data
            current_user: Currently authenticated user

        Returns:
            Updated category instance

        Raises:
            CategoryNotFoundException: If category not found
            NotAuthorizedException: If user doesn't own category
        """
        # Get and authorize category
        category = self.get_category_by_id(db, category_id, current_user)

        self.log_operation(
            "update_category",
            f"category_id={category_id}",
            current_user.id
        )

        updated_category = self.crud.update_category(
            db,
            category_id=category_id,
            category=category_update
        )

        return updated_category

    def delete_category(
        self,
        db: Session,
        category_id: int,
        current_user: User
    ) -> Category:
        """
        Delete a category with authorization check.

        Args:
            db: Database session
            category_id: Category ID to delete
            current_user: Currently authenticated user

        Returns:
            Deleted category instance

        Raises:
            CategoryNotFoundException: If category not found
            NotAuthorizedException: If user doesn't own category
        """
        # Get and authorize category
        category = self.get_category_by_id(db, category_id, current_user)

        self.log_operation(
            "delete_category",
            f"category_id={category_id}",
            current_user.id
        )

        deleted_category = self.crud.delete_category(db, category_id=category_id)

        return deleted_category


# Create singleton instance
category_service = CategoryService()
