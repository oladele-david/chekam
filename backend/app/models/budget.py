from sqlalchemy import Column, BigInteger, Numeric, Date, TIMESTAMP, ForeignKey, text, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'))
    category_id = Column(BigInteger, ForeignKey('categories.id', ondelete='CASCADE'))

    title = Column(Text, nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    current_amount = Column(Numeric(10, 2), server_default=text('0'), nullable=False)
    icon = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")

# Ensure User and Category models are updated for bidirectional access