#!/bin/bash

# SF Combined Application Startup Script

echo "Starting SF Combined Application..."
echo "==================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update with your PostgreSQL credentials."
fi

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    # Load DB credentials from .env
    export $(grep -v '^#' .env | xargs)
    
    # Try to connect to PostgreSQL
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -lqt &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL is running"
        
        # Check if database exists, create if not
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -lqt | cut -d \| -f 1 | grep -qw $DB_NAME
        if [ $? -ne 0 ]; then
            echo "Creating database: $DB_NAME"
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -c "CREATE DATABASE $DB_NAME;"
            echo "✅ Database created"
        else
            echo "✅ Database '$DB_NAME' exists"
        fi
    else
        echo "⚠️  Could not connect to PostgreSQL. Please ensure:"
        echo "   1. PostgreSQL is installed and running"
        echo "   2. Credentials in .env are correct"
        echo ""
        echo "To install PostgreSQL on macOS:"
        echo "   brew install postgresql@15"
        echo "   brew services start postgresql@15"
        echo ""
        echo "To create a database manually:"
        echo "   psql postgres -c 'CREATE DATABASE sf_combined;'"
        echo ""
        read -p "Press Enter to continue anyway or Ctrl+C to exit..."
    fi
else
    echo "⚠️  psql command not found. PostgreSQL might not be installed."
    echo ""
    echo "To install PostgreSQL on macOS:"
    echo "   brew install postgresql@15"
    echo "   brew services start postgresql@15"
    echo ""
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the application
echo ""
echo "Starting Flask server on port 5001..."
echo "Database: PostgreSQL"
python app.py
