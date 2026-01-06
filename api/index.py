"""
Vercel serverless entry point for SF Ecosystem Backend.
Routes requests to the Flask app.
"""

import sys
import os
from pathlib import Path

# Add backend to path so we can import Flask app
backend_path = str(Path(__file__).parent.parent / "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Load environment variables - support both .env file and system env vars
from dotenv import load_dotenv
env_file = Path(__file__).parent.parent / "backend" / ".env"
if env_file.exists():
    load_dotenv(env_file)

# Set environment variables from system if not already set (for Vercel)
os.environ.setdefault('DB_HOST', os.environ.get('DB_HOST', 'localhost'))
os.environ.setdefault('DB_PORT', os.environ.get('DB_PORT', '3306'))
os.environ.setdefault('DB_USER', os.environ.get('DB_USER', 'root'))
os.environ.setdefault('DB_PASSWORD', os.environ.get('DB_PASSWORD', ''))
os.environ.setdefault('DB_NAME', os.environ.get('DB_NAME', 'sf_combined'))
os.environ.setdefault('SECRET_KEY', os.environ.get('SECRET_KEY', 'production-secret-key'))

# Import Flask app
from app import app

# Vercel expects a WSGI application
handler = app

