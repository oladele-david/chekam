from fastapi import APIRouter
from app.api.v1.endpoints import users, auth  # import other endpoint modules as needed

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include other routers as needed
# api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
# api_router.include_router(income.router, prefix="/income", tags=["income"])
# api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
