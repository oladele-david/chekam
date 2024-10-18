from sqlalchemy.orm import Session, joinedload
from app.models.budget import Budget as BudgetModel
from app.schemas.budget import Budget, BudgetCreate, BudgetUpdate, BudgetBase



def get_budgets(db: Session, skip: int=0, limit: int=10) :
    """
    Retrieve a list of budgets from the database. This function uses joinedload to optimize
    the query by loading related user and category data in a single query, reducing the number
    of database hits.

    :param db: Database session to perform the query
    :param skip: Number of records to skip for pagination
    :param limit: Maximum number of records to return for pagination
    :return: List of budgets
    """
    all_budgets = db.query(BudgetModel).options(
        joinedload(BudgetModel.user),
        joinedload(BudgetModel.category)
    ).offset(skip).limit(limit).all()
    return all_budgets


def get_budget(db: Session, budget_id: int):
    """
    Retrieve a budget by its ID. This function uses joinedload to optimize the query by loading
    related user and category data in a single query, reducing the number of database hits.

    :param db: Database session to perform the query
    :param budget_id: ID of the budget to retrieve
    :return: Budget object or None if not found
    """
    single_budget = db.query(BudgetModel).filter(BudgetModel.id == budget_id).options(
        joinedload(BudgetModel.user),
        joinedload(BudgetModel.category)
    ).first()
    return single_budget


def get_budget_by_user(db: Session, user_id: int):
    """
    Retrieve all budgets for a specific user. This function uses joinedload to optimize the query
    by loading related user and category data in a single query, reducing the number of database hits.

    :param db: Database session to perform the query
    :param user_id: ID of the user whose budgets are to be retrieved
    :return: List of budgets for the user
    """
    all_user_budgets = db.query(Budget).options(
        joinedload(BudgetModel.user),
        joinedload(BudgetModel.category)
    ).filter(BudgetModel.user_id == user_id).all()
    return all_user_budgets

def create_budget(db: Session, budget: BudgetCreate):
    """
    Create a new budget in the database.

    :param db: Database session
    :param budget: BudgetCreate Pydantic schema object
    :return: The newly created budget object
    """
    db_budget = BudgetModel(
        amount=budget.amount,
        current_amount=budget.current_amount or 0,  # Default to 0 if None
        start_date=budget.start_date,
        end_date=budget.end_date,
        icon=budget.icon,
        user_id=budget.user_id,
        category_id=budget.category_id
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def update_budget(db: Session, budget_id: int, budget: BudgetUpdate):
    """
    Update an existing budget in the database. This function first retrieves the budget by ID,
    then updates its fields, commits the transaction, and refreshes the instance to reflect the latest state.

    :param db: Database session to perform the operation
    :param budget_id: ID of the budget to update
    :param budget: BudgetUpdate schema object containing updated budget details
    :return: The updated budget object or None if not found
    """
    db_budget = db.query(BudgetModel).filter(BudgetModel.id == budget_id).first()
    if not db_budget:
        return None

    # Update the budget fields
    db_budget.amount = budget.amount
    db_budget.current_amount = budget.current_amount
    db_budget.start_date = budget.start_date
    db_budget.end_date = budget.end_date
    db_budget.icon = budget.icon

    db.commit()
    db.refresh(db_budget)
    return db_budget

def update_current_amount(db: Session, budget_id: int, current_amount: float):
    """
    Update the current amount of an existing budget. This function first retrieves the budget by ID,
    then updates its current amount, commits the transaction, and refreshes the instance to reflect the latest state.

    :param db: Database session to perform the operation
    :param budget_id: ID of the budget to update
    :param current_amount: New current amount
    :return: The updated budget object or None if not found
    """
    db_budget = db.query(Budget).filter(BudgetModel.id == budget_id).first()
    if not db_budget:
        return None

    db_budget.current_amount = current_amount

    db.commit()
    db.refresh(db_budget)
    return db_budget

def delete_budget(db: Session, budget_id: int):
    """
    Delete a budget from the database. This function first retrieves the budget by ID,
    then deletes it, commits the transaction, and returns the deleted budget object.

    :param db: Database session to perform the operation
    :param budget_id: ID of the budget to delete
    :return: The deleted budget object or None if not found
    """
    db_budget = db.query(BudgetModel).filter(BudgetModel.id == budget_id).first()
    if not db_budget:
        return None
    db.delete(db_budget)
    db.commit()
    return db_budget
