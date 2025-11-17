import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import SessionLocal, engine, Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Configurable via environment
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Include API Routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/")
async def root():
    logger.info("Root endpoint was called")
    return {"message": "Welcome to Chekam!"}

# Dependency
@app.on_event("startup")
def on_startup():
    logger.info("Application startup")
    db = SessionLocal()
    try:
        # Initialize database here (if needed)
        pass
    finally:
        db.close()

@app.on_event("shutdown")
def on_shutdown():
    logger.info("Application shutdown")
