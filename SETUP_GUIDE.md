# 🚀 Quick Setup Guide - MySQL Configuration

## Prerequisites

- **MySQL 5.7+** or **MySQL 8.0+**
- **Python 3.8+**
- **Node.js 18+**
- **npm or yarn**

## Setup Steps

### 1. Install MySQL

**macOS (using Homebrew):**
```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Verify installation
mysql --version
```

**Alternatively, download from:**
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

### 2. Create Database and User

```bash
# Connect to MySQL as root
mysql -u root

# Once connected to MySQL shell:
CREATE DATABASE sf_combined;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'AppUser@123';
GRANT ALL PRIVILEGES ON sf_combined.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Or use your root user directly (simpler for development):
```bash
# Just create the database with root user
mysql -u root -e "CREATE DATABASE sf_combined;"
```

### 3. Configure Backend

Edit `/Users/Shared/sf_new/sf-ecosystem-monorepo/backend/.env`:

```env
# ===============================
# MySQL Database Configuration
# ===============================
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sf_combined

# ===============================
# Flask Security
# ===============================
SECRET_KEY=your-secret-key-change-in-production

# ===============================
# Flask Runtime Configuration
# ===============================
FLASK_DEBUG=True
```

Or if you created a separate user:
```env
DB_USER=appuser
DB_PASSWORD=AppUser@123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sf_combined
```

### 4. Install Backend Dependencies

```bash
cd /Users/Shared/sf_new/sf-ecosystem-monorepo/backend
pip install -r requirements.txt
```

### 5. Start the Applications

**Terminal 1 - Backend:**
```bash
cd /Users/Shared/sf_new/sf-ecosystem-monorepo/backend
python3 app.py
```

Backend runs on: **http://localhost:5001**

**Terminal 2 - Frontend:**
```bash
cd /Users/Shared/sf_new/sf-ecosystem-monorepo/frontend
npm install  # if not already done
npm run dev
```

Frontend runs on: **http://localhost:5173**

## Troubleshooting

### MySQL Connection Error
```bash
# Test MySQL connection
mysql -u root -p

# If password issues, reset MySQL root password:
brew services stop mysql
mysqld_safe --skip-grant-tables &
mysql -u root
# In MySQL shell:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
EXIT;
```

### Port Already in Use (3306)
```bash
# Check what's using port 3306
lsof -i :3306

# Kill the process if needed
kill -9 <PID>

# Or change the port in .env (advanced)
```

### Database Does Not Exist
```bash
# Create database manually
mysql -u root -p
CREATE DATABASE sf_combined;
```

### Backend Connection Failed
- Ensure MySQL is running: `brew services list | grep mysql`
- Check .env credentials match your MySQL setup
- Verify database name in .env matches created database

## Verify Setup

Once both are running:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5001/health
   # Should return: {"status": "ok"}
   ```

2. **Test API:**
   ```bash
   curl http://localhost:5001/
   ```

3. **Open Frontend:**
   Visit `http://localhost:5173` in your browser

## Common MySQL Commands

```bash
# Check MySQL status
brew services list | grep mysql

# Stop MySQL
brew services stop mysql

# Start MySQL
brew services start mysql

# Restart MySQL
brew services restart mysql

# Connect to MySQL
mysql -u root -p

# List all databases
mysql -u root -p -e "SHOW DATABASES;"

# View database tables
mysql -u root -p -e "USE sf_combined; SHOW TABLES;"
```

## Need Help?

Check these files for more details:
- `/backend/README.md` - Full backend documentation
- `/frontend/README.md` - Frontend documentation
- `README.md` - Project overview

