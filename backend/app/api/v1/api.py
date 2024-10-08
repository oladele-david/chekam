from fastapi import APIRouter
from app.api.v1.endpoints import users, auth, predefined_categories, categories, transactions
api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(predefined_categories.router, prefix="/predefined_categories", tags=["predefined categories"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])

# Include other routers as needed
# api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
# api_router.include_router(income.router, prefix="/income", tags=["income"])
# api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
