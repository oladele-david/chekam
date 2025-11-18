from fastapi import APIRouter
from app.api.v1.endpoints import (
    users,
    auth,
    predefined_categories,
    categories,
    transactions,
    budgets,
    tax,
    analytics,
    dashboard
)

# Create an instance of APIRouter
api_router = APIRouter()

# Include the authentication router
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include the users router
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Include the predefined categories router
api_router.include_router(predefined_categories.router, prefix="/predefined_categories", tags=["predefined categories"])

# Include the categories router
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])

# Include the transactions router
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])

# Include the budgets router
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])

# Include the tax router
api_router.include_router(tax.router, prefix="/tax", tags=["tax"])

# Include the analytics router
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# Include the dashboard router
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])