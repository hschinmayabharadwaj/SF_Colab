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

# Load environment variables
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

# Import Flask app
from app import app

# Vercel expects a WSGI application
handler = app
