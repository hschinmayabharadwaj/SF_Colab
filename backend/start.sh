
#!/bin/bash

# SF Combined Application Startup Script

echo "Starting SF Combined Application..."
echo "==================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update with your MySQL credentials."
fi

# Check if MySQL is running
echo "Checking MySQL connection..."
if command -v mysql &> /dev/null; then
    # Load DB credentials from .env
    export $(grep -v '^#' .env | xargs)
    
    # Try to connect to MySQL
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -P $DB_PORT -e "SELECT 1" &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ MySQL is running"
        
        # Check if database exists, create if not
        mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -P $DB_PORT -e "USE $DB_NAME;" &> /dev/null
        if [ $? -ne 0 ]; then
            echo "Creating database: $DB_NAME"
            mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -P $DB_PORT -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
            echo "✅ Database created"
        else
            echo "✅ Database '$DB_NAME' exists"
        fi
    else
        echo "⚠️  Could not connect to MySQL. Please ensure:"
        echo "   1. MySQL is installed and running"
        echo "   2. Credentials in .env are correct"
        echo ""
        echo "To install MySQL on macOS:"
        echo "   brew install mysql"
        echo "   brew services start mysql"
        echo ""
        echo "To create a database manually:"
        echo "   mysql -u root -p -e 'CREATE DATABASE sf_combined;'"
        echo ""
        read -p "Press Enter to continue anyway or Ctrl+C to exit..."
    fi
else
    echo "⚠️  mysql command not found. MySQL might not be installed."
    echo ""
    echo "To install MySQL on macOS:"
    echo "   brew install mysql"
    echo "   brew services start mysql"
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
echo "Database: MySQL"
python app.py
