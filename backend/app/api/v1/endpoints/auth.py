from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app import crud, schemas
from app.core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.session import get_db

router = APIRouter()

# Authenticate user
def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticate a user by email and password.

    :param db: Database session.
    :param email: User's email address.
    :param password: User's password.
    :return: User object if authentication is successful, None otherwise.
    """
    user = crud.get_user_by_email(db, email=email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint for user authentication.

    :param form_data: OAuth2 password request form data.
    :param db: Database session.
    :return: Access token and token type.
    :raises HTTPException: If authentication fails.
    """
    db_user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/authenticate", response_model=schemas.RegisterResponse, status_code=status.HTTP_200_OK)
def authenticate(
        form_data: schemas.LoginRequest,
        db: Session = Depends(get_db)
):
    """
    Authenticate endpoint for user login.

    :param form_data: Login request data.
    :param db: Database session.
    :return: Access token, token type, and user information.
    :raises HTTPException: If authentication fails.
    """
    email = form_data.username
    password = form_data.password

    db_user = authenticate_user(db, email=email, password=password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": db_user}

@router.post("/register", response_model=schemas.RegisterResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.


    :param user: User creation data.
    :param db: Database session.
    :return: Access token, token type, and user information.
    :raises HTTPException: If email is already registered.
    """
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = crud.create_user(db=db, user=user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}