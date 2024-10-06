from sqlalchemy import Column, Text, TIMESTAMP, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    """
    User model
    """
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True, index=True)
    first_name = Column(Text)
    last_name = Column(Text)
    email = Column(Text, unique=True, nullable=False)
    phone_number = Column(Text)
    password_hash = Column(Text, nullable=False)
    is_active = Column(Text, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    categories = relationship("Category", back_populates="user")
