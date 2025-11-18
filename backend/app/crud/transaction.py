from sqlalchemy.orm import Session, joinedload
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate

def get_transactions(db: Session, skip: int = 0, limit: int = 10):
    """
    Retrieve all transactions with optional pagination.

    :param db: Database session.
    :param skip: Number of records to skip for pagination.
    :param limit: Maximum number of records to return.
    :return: List of transactions.
    """
    all_transactions = db.query(Transaction).options(
        joinedload(Transaction.user),
        joinedload(Transaction.category)
    ).offset(skip).limit(limit).all()
    return all_transactions

def get_transaction(db: Session, transaction_id: int):
    """
    Retrieve a single transaction by its ID.

    :param db: Database session.
    :param transaction_id: ID of the transaction to retrieve.
    :return: Transaction object or None if not found.
    """
    single_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).options(
        joinedload(Transaction.user),
        joinedload(Transaction.category)
    ).first()
    return single_transaction

def get_transactions_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Retrieve all transactions for a specific user with pagination.

    :param db: Database session.
    :param user_id: ID of the user whose transactions to retrieve.
    :param skip: Number of records to skip for pagination.
    :param limit: Maximum number of records to return.
    :return: List of transactions for the user.
    """
    all_user_transactions = db.query(Transaction).options(
        joinedload(Transaction.user),
        joinedload(Transaction.category)
    ).filter(Transaction.user_id == user_id).offset(skip).limit(limit).all()
    return all_user_transactions

def create_transaction(db: Session, transaction: TransactionCreate):
    """
    Create a new transaction in the database.

    :param db: Database session.
    :param transaction: TransactionCreate schema with transaction details.
    :return: The newly created transaction object.
    """
    db_transaction = Transaction(
        amount=transaction.amount,
        frequency=transaction.frequency,
        start_date=transaction.start_date,
        end_date=transaction.end_date,
        description=transaction.description,
        user_id=transaction.user_id,
        category_id=transaction.category_id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction(db: Session, transaction_id: int, transaction: TransactionUpdate):
    """
    Update an existing transaction by its ID.

    :param db: Database session.
    :param transaction_id: ID of the transaction to update.
    :param transaction: TransactionUpdate schema with updated transaction details.
    :return: The updated transaction object.
    """
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    db_transaction.amount = transaction.amount
    db_transaction.frequency = transaction.frequency
    db_transaction.start_date = transaction.start_date
    db_transaction.end_date = transaction.end_date
    db_transaction.description = transaction.description
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: int):
    """
    Delete a transaction by its ID.

    :param db: Database session.
    :param transaction_id: ID of the transaction to delete.
    :return: The deleted transaction object or None if not found.
    """
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return db_transaction
    return None
