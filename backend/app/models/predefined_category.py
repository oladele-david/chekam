from sqlalchemy import Column, Text, TIMESTAMP, BigInteger
from sqlalchemy.sql import func
from app.db.base_class import Base


class PredefinedCategory(Base):
    """
    Predefined Category model
    """
    __tablename__ = "predefined_categories"
    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(Text, unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), nullable=True)
