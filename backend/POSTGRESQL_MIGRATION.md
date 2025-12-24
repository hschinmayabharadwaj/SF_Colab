# PostgreSQL Migration Guide

## Summary

The SF Combined application has been successfully migrated from SQLite to PostgreSQL.

## Changes Made

### 1. Dependencies (`requirements.txt`)
Added:
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `python-dotenv==1.0.0` - Environment variable management

### 2. Application Configuration (`app.py`)
- Replaced SQLite connection with PostgreSQL
- Added environment variable support via `.env` file
- Support for both full `DATABASE_URL` or individual DB components

### 3. Environment Configuration
Created two files:
- `.env.example` - Template with default values
- `.env` - Active configuration (update with your credentials)

### 4. Startup Script (`start.sh`)
Enhanced with:
- PostgreSQL connection checking
- Automatic database creation
- Better error messages and troubleshooting tips

### 5. Documentation (`README.md`)
Added comprehensive sections:
- PostgreSQL installation instructions (macOS, Linux, Windows)
- Database configuration steps
- Troubleshooting guide
- Production deployment tips
- Backup and restore procedures

## Quick Setup

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### Step 2: Create Database

```bash
psql postgres -c 'CREATE DATABASE sf_combined;'
```

Or on Linux:
```bash
sudo -u postgres psql -c 'CREATE DATABASE sf_combined;'
```

### Step 3: Configure Application

Update `.env` file with your PostgreSQL credentials:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sf_combined
```

### Step 4: Run Application

```bash
cd /Users/Shared/sf_new/sf_combined
./start.sh
```

The startup script will:
1. ✅ Check if PostgreSQL is running
2. ✅ Verify database exists (create if needed)
3. ✅ Set up Python virtual environment
4. ✅ Install all dependencies
5. ✅ Start the Flask server

## Database Schema

PostgreSQL will automatically create these tables on first run:
- `users` - User accounts
- `user_wallets` - Wallet balances  
- `wallet_transactions` - Transaction history
- `virtual_products` - Product catalog
- `product_purchases` - Purchase records
- `user_inventory` - User items
- `exchange_rates` - Currency rates

## Benefits of PostgreSQL

✅ **Better Performance**: Handles concurrent connections better than SQLite
✅ **Production Ready**: Industry-standard relational database
✅ **Advanced Features**: Full-text search, JSON support, complex queries
✅ **Scalability**: Can handle millions of records efficiently
✅ **ACID Compliance**: Reliable transactions
✅ **Replication**: Built-in backup and replication support

## Migrating Existing SQLite Data

If you have data in the old `app.db` SQLite file:

### Option 1: Manual Migration (Small datasets)
1. Export data from SQLite using queries
2. Import into PostgreSQL using INSERT statements

### Option 2: Using pgloader (Recommended)
```bash
# Install pgloader
brew install pgloader  # macOS

# Migrate
pgloader sqlite:///path/to/app.db postgresql://user:pass@localhost/sf_combined
```

### Option 3: Python Script
Create a migration script to read from SQLite and write to PostgreSQL.

## Testing PostgreSQL Connection

### From Command Line
```bash
# Test connection
psql -h localhost -U postgres -d sf_combined

# List tables
\dt

# Check data
SELECT * FROM users;

# Exit
\q
```

### From Application
```bash
# Check health endpoint
curl http://localhost:5001/health

# Check database (should return data if connected)
curl http://localhost:5001/users
```

## Common Issues & Solutions

### Issue: "psql: command not found"
**Solution**: Add PostgreSQL to PATH or use full path
```bash
# macOS with Homebrew
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
```

### Issue: "FATAL: password authentication failed"
**Solution**: 
1. Check password in `.env` file
2. Reset PostgreSQL password if needed:
```bash
psql postgres
ALTER USER postgres PASSWORD 'newpassword';
```

### Issue: "could not connect to server"
**Solution**: Start PostgreSQL service
```bash
brew services start postgresql@15  # macOS
sudo systemctl start postgresql  # Linux
```

### Issue: Tables not created
**Solution**: Check logs for errors. The app auto-creates tables on first run.

## Production Considerations

1. **Connection Pooling**: SQLAlchemy handles this automatically
2. **SSL/TLS**: Enable for production: `?sslmode=require` in DATABASE_URL
3. **Backup Strategy**: Set up automated pg_dump backups
4. **Monitoring**: Use PostgreSQL logs and monitoring tools
5. **Performance**: Create indexes on frequently queried columns
6. **Security**: Use strong passwords, limit connections, firewall rules

## Environment Variables Reference

```env
# Full connection string (recommended for production)
DATABASE_URL=postgresql://user:password@host:port/database

# Or individual components (used if DATABASE_URL not set)
DB_USER=postgres          # PostgreSQL username
DB_PASSWORD=postgres      # PostgreSQL password
DB_HOST=localhost         # Database host
DB_PORT=5432             # PostgreSQL port (default: 5432)
DB_NAME=sf_combined      # Database name

# Application settings
SECRET_KEY=your-secret-key
FLASK_ENV=development
FLASK_DEBUG=True
```

## Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database created
3. ✅ Application configured with `.env`
4. ✅ Dependencies installed
5. ✅ Application running on port 5001

Your application is now using PostgreSQL! 🎉

## Support & Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- SQLAlchemy PostgreSQL: https://docs.sqlalchemy.org/en/20/dialects/postgresql.html
- Flask-SQLAlchemy: https://flask-sqlalchemy.palletsprojects.com/
- psycopg2: https://www.psycopg.org/docs/

## Rollback to SQLite (if needed)

If you need to revert to SQLite:

1. Edit `app.py`:
```python
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
```

2. Remove PostgreSQL dependencies from `requirements.txt`

3. Run the application - it will create SQLite database
