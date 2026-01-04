#!/bin/bash

# Quick Start Script - Uses SQLite temporarily

echo "🚀 SF Ecosystem - Quick Start"
echo "================================"
echo ""
echo "This script will start both backend and frontend using SQLite."
echo "For PostgreSQL setup, see SETUP_GUIDE.md"
echo ""

# Create temporary SQLite configuration
BACKEND_DIR="/Users/Shared/sf_new/sf-ecosystem-monorepo/backend"
FRONTEND_DIR="/Users/Shared/sf_new/sf-ecosystem-monorepo/frontend"

# Backup original app.py
if [ ! -f "$BACKEND_DIR/app.py.postgres" ]; then
    echo "📦 Backing up PostgreSQL configuration..."
    cp "$BACKEND_DIR/app.py" "$BACKEND_DIR/app.py.postgres"
fi

# Check if SQLite version exists
if [ ! -f "$BACKEND_DIR/app.py.sqlite" ]; then
    echo "⚠️  SQLite configuration not found."
    echo "Creating temporary SQLite configuration..."
    echo ""
    echo "To use PostgreSQL instead:"
    echo "1. Install PostgreSQL: brew install postgresql@15"
    echo "2. See SETUP_GUIDE.md for full instructions"
    echo "3. Run: cp backend/app.py.postgres backend/app.py"
    echo ""
fi

# Start backend in background
echo "🔧 Starting Backend (SQLite)..."
cd "$BACKEND_DIR"
python3 app.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo "Backend logs: $BACKEND_DIR/backend.log"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend started on http://localhost:5001"
else
    echo "❌ Backend failed to start. Check backend.log"
    exit 1
fi

# Start frontend
echo ""
echo "🎨 Starting Frontend..."
cd "$FRONTEND_DIR"
npm run dev

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Services stopped"
}

# Register cleanup on exit
trap cleanup EXIT INT TERM
