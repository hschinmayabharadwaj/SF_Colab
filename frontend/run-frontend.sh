#!/bin/bash

# Frontend Setup and Run Script

echo "Setting up SF Ecosystem Dashboard Frontend..."
echo "=============================================="

cd "$(dirname "$0")"

# Check if node and npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "  macOS: brew install node"
    echo "  Or download from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Remove corrupted node_modules if they exist
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning up old node_modules..."
    rm -rf node_modules package-lock.json
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to install dependencies!"
    echo ""
    echo "Try these steps:"
    echo "  1. Clear npm cache: npm cache clean --force"
    echo "  2. Try again: npm install"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 Starting development server..."
echo "   Frontend will be available at: http://localhost:5173"
echo "   Backend should be running at: http://localhost:5001"
echo ""

npm run dev
