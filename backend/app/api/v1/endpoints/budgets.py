from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.security import get_current_active_user
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Budget])
def read_budgets(
        skip: int = 0,
        limit: int = 10,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retrieve all budgets for the current user.

    Parameters:
    - skip (int): Number of records to skip for pagination.
    - limit (int): Maximum number of records to return.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - List[schemas.Budget]: List of budget objects.
    """
    # Only return budgets for the current user
    budgets = crud.get_budget_by_user(db, user_id=current_user.id)
    return budgets

@router.get("/{budget_id}", response_model=schemas.Budget)
def read_budget(
        budget_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Read a budget by id

    Parameters:
    - budget_id (int): ID of the budget to retrieve.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Budget: Budget object.

    Raises:
    - HTTPException: If budget is not found.
    """
    budget = crud.get_budget(db, budget_id=budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    # Authorization check: users can only access their own budgets
    if budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this budget"
        )

    return budget

@router.get("/user/{user_id}", response_model=List[schemas.Budget])
def read_user_budgets(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retrieve all budgets for a user.

    Parameters:
    - user_id (int): ID of the user whose budgets are to be retrieved.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - List[schemas.Budget]: List of budget objects.
    """
    # Authorization check: users can only access their own budgets
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these budgets"
        )

    budgets = crud.get_budget_by_user(db, user_id=user_id)
    return budgets

@router.post("/create", response_model=schemas.Budget)
def create_budget(
        budget: schemas.BudgetCreate,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Create a new budget.

    Parameters:
    - budget (schemas.BudgetCreate): Budget data to create.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Budget: Created budget object.
    """
    return crud.create_budget(db, budget=budget)

@router.put("/update/{budget_id}", response_model=schemas.Budget)
def update_budget(
        budget_id: int,
        budget: schemas.BudgetUpdate,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Update a budget by id

    Parameters:
    - budget_id (int): ID of the budget to update.
    - budget (schemas.BudgetUpdate): Data to update.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Budget: Updated budget object.

    Raises:
    - HTTPException: If budget is not found.
    """
    # First check if budget exists and user owns it
    existing_budget = crud.get_budget(db, budget_id=budget_id)
    if not existing_budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    # Authorization check: users can only update their own budgets
    if existing_budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this budget"
        )

    return crud.update_budget(db, budget_id=budget_id, budget=budget)

@router.put("/update/{budget_id}/current-amount", response_model=schemas.Budget)
def update_current_amount(
        budget_id: int,
        current_amount: float,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Update the current amount of a budget by id

    Parameters:
    - budget_id (int): ID of the budget to update.
    - current_amount (float): New current amount.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Budget: Updated budget object.

    Raises:
    - HTTPException: If budget is not found.
    """
    # First check if budget exists and user owns it
    existing_budget = crud.get_budget(db, budget_id=budget_id)
    if not existing_budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    # Authorization check: users can only update their own budgets
    if existing_budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this budget"
        )

    return crud.update_current_amount(db, budget_id=budget_id, current_amount=current_amount)

@router.delete("/delete/{budget_id}", response_model=schemas.Budget)
def delete_budget(
        budget_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Delete a budget by id

    Parameters:
    - budget_id (int): ID of the budget to delete.
    - db (Session): Database session dependency.
    - current_user (schemas.User): Current active user dependency.

    Returns:
    - schemas.Budget: Deleted budget object.

    Raises:
    - HTTPException: If budget is not found.
    """
    # First check if budget exists and user owns it
    existing_budget = crud.get_budget(db, budget_id=budget_id)
    if not existing_budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    # Authorization check: users can only delete their own budgets
    if existing_budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this budget"
        )

    return crud.delete_budget(db, budget_id=budget_id)