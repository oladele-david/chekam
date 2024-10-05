from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.db.session import get_db
from app.core.security import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retrieve a list of users.

    Parameters:
    - skip (int): Number of records to skip for pagination.
    - limit (int): Maximum number of records to return.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - List[schemas.User]: List of user objects.
    """

    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
        Retrieve a user by ID.

        Parameters:
        - user_id (int): ID of the user to retrieve.
        - db (Session): Database session dependency.
        - current_user (schemas.User): Current active user dependency.

        Returns:
        - schemas.User: User object.

        Raises:
        - HTTPException: If user is not found.
        """

    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("/create", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Create a new user.

    Parameters:
    - user (schemas.UserCreate): User creation schema.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.User: Created user object.

    Raises:
    - HTTPException: If email is already registered.
    """

    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@router.put("/update/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Update an existing user.

    Parameters:
    - user_id (int): ID of the user to update.
    - user_update (schemas.UserUpdate): User update schema.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.User: Updated user object.

    Raises:
    - HTTPException: If user is not found.
    """

    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.update_user(db=db, user_id=user_id, user=user_update)


@router.delete("/delete/{user_id}", response_model=schemas.User)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
        Delete a user by ID.

        Parameters:
        - user_id (int): ID of the user to delete.
        - db (Session): Database session dependency.
        - current_user (schemas.User): Current active user dependency.

        Returns:
        - schemas.User: Deleted user object.

        Raises:
        - HTTPException: If user is not found.
        """

    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    crud.delete_user(db=db, user_id=user_id)
    return db_user
