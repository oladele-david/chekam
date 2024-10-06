from typing import List
from sqlalchemy.orm import Session, joinedload
from app.models.category import Category
from app.schemas.category import CategoryBase, CategoryCreate, CategoryUpdate, Category


def get_categories(
        db: Session, skip: int = 0, limit: int = 10) -> List:
    """
    Get all categories
    :param db:
    :param skip:
    :param limit:
    :return:
    """

    all_categories = db.query(Category).offset(skip).limit(limit).all()
    return all_categories


def get_category(db: Session, category_id: int):
    """Get a category based on Id"""
    single_category = db.query(Category).filter(Category.id == category_id).options(
        joinedload(Category.user),
        joinedload(Category.predefined_category)
    ).first()

    return single_category


def create_category(db: Session, category: CategoryCreate):
    """
    Create a new category in the database

    :param db:
    :param category:
    :return:
    """
    db_category = Category(
        name=category.name,
        type=category.type,
        description=category.description,
        user_id=category.user_id,
        predefined_category_id=category.predefined_category_id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: CategoryUpdate):
    """
    Update a category based on the category Id

    :param db:
    :param category_id:
    :param category:
    :return:
    """

    db_category = db.query(category).filter(Category.id == category_id).first()
    db_category.name = category.name
    db_category.type = category.type
    db_category.predefined_category_id = category.predefined_category_id


def delete_category(db: Session, category_id: int):
    """
    Delete category based on Id

    :param db:
    :param category_id:
    :return:
    """
    db_category = db.query(category).filter(Category.id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category
