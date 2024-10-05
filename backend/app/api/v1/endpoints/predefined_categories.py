from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.db.session import get_db
from app.core.security import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[schemas.PredefinedCategory])
def read_predefined_categories(
        skip: int = 0,
        limit: int = 10,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Return all predefined categories created
    :param current_user:
    :param skip:
    :param limit:
    :param db:
    :return:
    """
    predefined_categories = crud.get_predefined_categories(db, skip=skip, limit=limit)
    return predefined_categories


@router.get("/{predefined_category_id}", response_model=schemas.PredefinedCategory)
def read_predefined_category(
        predefined_category_id: int,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Return a predefined category by id
    :param current_user:
    :param predefined_category_id:
    :param db:
    :return:
    """
    predefined_category = crud.get_predefined_category(db, predefined_category_id=predefined_category_id)
    if not predefined_category:
        raise HTTPException(status_code=404, detail="Predefined category not found")
    return predefined_category


@router.post("/create", response_model=schemas.PredefinedCategory, status_code=status.HTTP_201_CREATED)
def create_predefined_category(
        predefined_category: schemas.PredefinedCategoryCreate,
        db: Session = Depends(get_db),
        current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Create a new predefined category into the database
    :param current_user:
    :param predefined_category:
    :param db:
    :return predefined_category:
    """
    new_predefined_category = crud.create_predefined_category(db=db, predefined_category=predefined_category)
    return new_predefined_category
