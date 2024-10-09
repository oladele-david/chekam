from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.db.session import get_db
from app.core.security import get_current_active_user


router = APIRouter()

@router.get("/", response_model=List[schemas.Transaction])
def read_transactions(
        skip: int = 0,
        limit: int = 10,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retrieve all transactions.
    :param skip:
    :param limit:
    :param db:
    :param current_user:
    :return:
    """
    try:
        transactions = crud.get_transactions(db, skip=skip, limit=limit)
        return transactions
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))


@router.get("/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(
        transaction_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retrieve a single transaction by its ID.
    :param transaction_id:
    :param db:
    :param current_user:
    :return:
    """

    try:
        transaction = crud.get_transaction(db, transaction_id=transaction_id)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))


@router.get("/user/{user_id}", response_model=List[schemas.Transaction])
def get_user_transactions(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Retrieve all transactions for a specific user.
    :param user_id:
    :param db:
    :param current_user:
    :return:
    """
    try:
        transactions = crud.get_transactions_by_user(db, user_id=user_id)
        if not transactions:
            raise HTTPException(status_code=404, detail="Transactions not found")
        return transactions
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))


@router.post("/create", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(
        transaction: schemas.TransactionCreate,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Create a new transaction.
    :param transaction:
    :param db:
    :param current_user:
    :return:
    """
    try:
        db_transaction = crud.create_transaction(db, transaction)
        return db_transaction
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))


@router.put("/update/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(
        transaction_id: int,
        transaction: schemas.TransactionUpdate,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Update a transaction by its ID.
    :param transaction_id:
    :param transaction:
    :param db:
    :param current_user:
    :return:
    """
    try:
        db_transaction = crud.update_transaction(db, transaction_id=transaction_id, transaction=transaction)
        return db_transaction
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))

@router.delete("/delete/{transaction_id}", response_model=schemas.Transaction)
def delete_transaction(
        transaction_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Delete a transaction by its ID.
    :param transaction_id:
    :param db:
    :param current_user:
    :return:
    """
    try:
        db_transaction = crud.delete_transaction(db, transaction_id=transaction_id)
        return db_transaction
    except Exception as e:
        return HTTPException(status_code=400, detail=str(e))