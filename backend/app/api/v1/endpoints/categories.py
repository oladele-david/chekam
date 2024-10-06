from unicodedata import category

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from sqlalchemy.sql.functions import current_user

from app import crud, schemas
from app.db.session import get_db
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Category])
def read_categories(
        skip: int = 0,
        limit: int = 10,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retrieve all categories.

    Parameters:
    - skip (int): Number of records to skip for pagination.
    - limit (int): Maximum number of records to return.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - List[schemas.Category]: List of category objects.
    """

    categories = crud.get_category(db, skip=skip, limit=limit)
    return categories

@router.get("/{category_id}", response_model=schemas.Category)
def read_category(
        category_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Read a category by id

    Parameters:
    - category_id (int): ID of the category to retrieve.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Category: Category object.

    Raises:
    - HTTPException: If category is not found.
    """
    category = crud.get_category(db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/create", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
        category: schemas.CategoryCreate,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Create a new category

    Parameters:
    - category (schemas.CategoryCreate): Data of the category to create.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Category: Created category object.

    Raises:
    - HTTPException: If an error occurs while creating the category
    """
    try:
        new_category = crud.create_category(db=db, category=category)
        return new_category
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/update/{category_id}", response_model=schemas.Category)
def update_category(
        category_id: int,
        category: schemas.CategoryUpdate,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Update a category by id

    Parameters:
    - category_id (int): ID of the category to update.
    - category (schemas.CategoryUpdate): Data to update the category.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Category: Updated category object.

    Raises:
    - HTTPException: If category is not found or an error occurs while updating the category
    """
    try:
        db_category = crud.get_category(db=db, category_id=category_id)
        if not db_category:
            raise HTTPException(status_code=404, detail="Category not found")

        updated_category = crud.update_category(db=db, category_id=category_id, category=category)
        return updated_category
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/delete/{category_id}", response_model=schemas.Category)
def delete_category(
        category_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Delete a category by id

    Parameters:
    - category_id (int): ID of the category to delete.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Category: Deleted category object.

    Raises:
    - HTTPException: If category is not found or an error occurs while deleting the category
    """
    try:
        db_category = crud.get_category(db=db, category_id=category_id)
        if not db_category:
            raise HTTPException(status_code=404, detail="Category not found")

        deleted_category = crud.delete_category(db=db, category_id=category_id)
        return deleted_category
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
