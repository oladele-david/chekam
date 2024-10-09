from sqlalchemy import Column, BigInteger, Numeric, Text, Date, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Transaction(Base):
    """
    Transaction model:
    This model is used to store user-defined transactions.

    Attributes:
        id (BigInteger): Primary key for the transaction.
        user_id (BigInteger): Foreign key referencing the user who created the transaction.
        category_id (BigInteger): Foreign key referencing the category of the transaction.
        amount (Numeric): The amount of the transaction.
        frequency (Text): The frequency of the transaction. Can be one of 'one-time', 'daily', 'weekly', 'monthly', 'yearly'.
        start_date (Date): The start date of the transaction.
        end_date (Date, optional): The end date of the transaction.
        description (Text, optional): A description of the transaction.
        created_at (TIMESTAMP): The timestamp when the transaction was created.
        user (relationship): Relationship to the User model.
        category (relationship): Relationship to the Category model.
    """

    __tablename__ = "transactions"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'))
    category_id = Column(BigInteger, ForeignKey('categories.id', ondelete='SET NULL'))

    amount = Column(Numeric(10, 2), nullable=False)
    frequency = Column(Text, CheckConstraint("frequency in ('one-time', 'daily', 'weekly', 'monthly', 'yearly')"),
                       default='one-time')
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

