#!/bin/bash

# Quick Start Script - Starts Backend and Frontend

echo "🚀 SF Ecosystem - Quick Start"
echo "================================"
echo ""
echo "This script will start both backend and frontend."
echo "Make sure MySQL is running: brew services start mysql"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "Backend dir: $BACKEND_DIR"
echo "Frontend dir: $FRONTEND_DIR"
echo ""

# Check MySQL is running
echo "🔍 Checking MySQL connection..."
if ! mysql -h 127.0.0.1 -u root -e "SELECT 1" &> /dev/null; then
    echo "⚠️  MySQL is not running. Attempting to start..."
    brew services start mysql
    sleep 2
fi

# Start backend in background
echo "🔧 Starting Backend (MySQL)..."
cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -q -r requirements.txt

# Start Flask server in background
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
    echo "❌ Backend failed to start. Check backend.log:"
    tail -20 backend.log
    exit 1
fi

# Start frontend
echo ""
echo "🎨 Starting Frontend..."
cd "$FRONTEND_DIR"
npm install -q 2>/dev/null
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
