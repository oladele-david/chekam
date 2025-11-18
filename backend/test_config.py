#!/usr/bin/env python3
"""Quick test to verify the configuration loads correctly."""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.core.config import settings

    print("✓ Configuration loaded successfully!")
    print(f"\nCORS Settings:")
    print(f"  CORS_ORIGINS: {settings.CORS_ORIGINS}")
    print(f"  CORS_ALLOW_METHODS: {settings.CORS_ALLOW_METHODS}")
    print(f"  CORS_ALLOW_HEADERS: {settings.CORS_ALLOW_HEADERS}")
    print(f"\nDatabase:")
    print(f"  DATABASE_URL: {settings.DATABASE_URL[:50]}...")
    print(f"\nApplication:")
    print(f"  PROJECT_NAME: {settings.PROJECT_NAME}")
    print(f"  ENVIRONMENT: {settings.ENVIRONMENT}")

except Exception as e:
    print(f"✗ Error loading configuration: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

