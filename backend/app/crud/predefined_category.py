from sqlalchemy.orm import Session
from app.models.predefined_category import PredefinedCategory
from app.schemas.predefined_category import PredefinedCategoryCreate, PredefinedCategoryUpdate


def get_predefined_categories(db: Session, skip: int = 0, limit: int = 10):
    """Get all predefined categories"""
    all_predefined_categories = db.query(PredefinedCategory).offset(skip).limit(limit).all()
    return all_predefined_categories


def get_predefined_category(db: Session, predefined_category_id: int):
    """Get a predefined category by id"""
    return db.query(PredefinedCategory).filter(PredefinedCategory.id == predefined_category_id).first()

def create_predefined_category(db: Session, predefined_category: PredefinedCategoryCreate):
    """Create a new predefined category"""

    db_predefined_category = PredefinedCategory(
        name=predefined_category.name,
        description=predefined_category.description
    )
    db.add(db_predefined_category)
    db.commit()
    db.refresh(db_predefined_category)
    return db_predefined_category

def update_predefined_category(db: Session, predefined_category_id: int, predefined_category: PredefinedCategoryUpdate):
    """Update a predefined category"""
    db_predefined_category = db.query(PredefinedCategory).filter(PredefinedCategory.id == predefined_category_id).first()
    db_predefined_category.name = predefined_category.name
    db_predefined_category.description = predefined_category.description
    db.commit()
    db.refresh(db_predefined_category)
    return db_predefined_category

def delete_predefined_category(db: Session, predefined_category_id: int):
    """Delete a predefined category"""
    db_predefined_category = db.query(PredefinedCategory).filter(PredefinedCategory.id == predefined_category_id).first()
    if db_predefined_category:
        db.delete(db_predefined_category)
        db.commit()
    return db_predefined_category
