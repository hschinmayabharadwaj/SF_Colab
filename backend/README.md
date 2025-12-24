# SF Combined - Virtual Product Store with Wallet System

A unified Flask application that combines a virtual product store with a comprehensive wallet and transaction system, powered by **PostgreSQL**.

## Features

### User Management
- Create and manage user accounts
- Automatic wallet creation for each user
- User profile management

### Wallet System
- **SF Coins**: Primary in-game currency for purchases
- **Premium Gems**: Premium currency for special items
- **Event Tokens**: Special event-based currency
- Daily earning limits and tracking
- Comprehensive transaction history
- Balance tracking (earned, spent, daily limits)

### Virtual Products
- Multiple product types:
  - **Cosmetics**: Skins, visual enhancements
  - **Boosters**: Temporary power-ups and XP multipliers
  - **Consumables**: Single-use items
  - **Subscriptions**: Time-based memberships
  - **Feature Unlocks**: Permanent game features
- Product availability controls (time windows, stock limits)
- User level requirements
- Multiple currency support

### Purchase System
- Secure product purchases using wallet currencies
- Automatic inventory management
- Purchase history tracking
- Stock management
- Purchase limits per user

### Inventory Management
- Track owned items
- Equip/unequip cosmetics
- Use consumables with quantity tracking
- Expiration handling for time-based items
- Active/inactive item states

## API Endpoints

### Health & Info
- `GET /` - API information
- `GET /health` - Health check

### Users
- `POST /users` - Create new user
- `GET /users/<user_id>` - Get user details
- `GET /users` - List all users

### Wallet
- `GET /wallet/balance/<user_id>` - Get wallet balance
- `GET /wallet/history/<user_id>` - Get transaction history
- `POST /wallet/earn` - Earn coins
- `POST /wallet/spend` - Spend coins

### Products
- `GET /products` - List active products
- `GET /products/<product_id>` - Get product details
- `POST /products` - Create product (admin)
- `POST /products/<product_id>/purchase` - Purchase product

### Purchases
- `GET /purchases/<user_id>` - Get purchase history

### Inventory
- `GET /inventory/<user_id>` - Get user inventory
- `POST /inventory/<inventory_id>/equip` - Equip item
- `POST /inventory/<inventory_id>/unequip` - Unequip item
- `POST /inventory/<inventory_id>/use` - Use consumable

## Installation & Setup

### Prerequisites
## Prerequisites

- **Python 3.8+**
- **PostgreSQL 12+** (recommended: PostgreSQL 15)
- **pip** (Python package manager)

## PostgreSQL Setup

### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
psql postgres -c 'CREATE DATABASE sf_combined;'
```

### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql -c 'CREATE DATABASE sf_combined;'
```

### Windows

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. During installation, note your postgres user password
3. Open pgAdmin or psql and create database:
   ```sql
   CREATE DATABASE sf_combined;
   ```

## Installation & Setup

### 1. Navigate to the project directory

```bash
cd /Users/Shared/sf_new/sf_combined
```

### 2. Configure Database

Copy the example environment file and update with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Option 1: Full DATABASE_URL (recommended)
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/sf_combined

# Option 2: Individual components
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sf_combined

SECRET_KEY=your-secret-key-here-change-in-production
```

### 3. Run the Application

#### Quick Start (Recommended)

The startup script will automatically:
- Check PostgreSQL connection
- Create database if it doesn't exist
- Set up virtual environment
- Install dependencies
- Start the server

```bash
chmod +x start.sh
./start.sh
```

#### Manual Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

The server will start on `http://0.0.0.0:5001`

## Database

The application uses **PostgreSQL** with the following tables:
- `users` - User accounts
- `user_wallets` - User wallet balances
- `wallet_transactions` - Transaction history
- `virtual_products` - Product catalog
- `product_purchases` - Purchase records
- `user_inventory` - User-owned items
- `exchange_rates` - Currency exchange rates (future use)

## Default Test Data

The application creates:
- Test user: `testuser` (email: test@example.com)
  - Initial balance: 12,450 SF Coins, 350 Premium Gems, 25 Event Tokens
- Sample products:
  - Premium Sword Skin (150 gems)
  - XP Booster (500 coins, 24h duration)
  - Health Potion (50 coins, consumable)
  - Premium Membership (500 gems, 30 days)

## Configuration

Key settings in `app.py`:
- `SQLALCHEMY_DATABASE_URI`: Database location
- `SECRET_KEY`: Change in production
- `PORT`: Default 5001
- `CORS`: Currently allows all origins (configure for production)

## Example API Usage

### Create a user:
```bash
curl -X POST http://localhost:5001/users \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "email": "newuser@example.com"}'
```

### Check wallet balance:
```bash
curl http://localhost:5001/wallet/balance/1
```

### Purchase a product:
```bash
curl -X POST http://localhost:5001/products/1/purchase \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'
```

### View inventory:
```bash
curl http://localhost:5001/inventory/1
```

## Project Structure

```
sf_combined/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── start.sh                   # Startup script with DB checks
├── .env                       # Environment configuration (create from .env.example)
├── .env.example              # Example environment config
├── README.md                  # This file
├── MIGRATION_SUMMARY.md      # Migration details
├── .gitignore                # Git ignore rules
└── models/                    # Database models (PostgreSQL)
    ├── __init__.py
    ├── user.py
    ├── user_wallet.py
    ├── wallet_transaction.py
    ├── virtual_product.py
    ├── product_purchase.py
    ├── user_inventory.py
    └── exchange_rate.py
```

## Configuration

Key settings (via `.env` file):
- `DATABASE_URL` or `DB_*` - PostgreSQL connection
- `SECRET_KEY` - Flask secret key (change in production!)
- `FLASK_ENV` - Environment (development/production)
- `FLASK_DEBUG` - Debug mode

## Troubleshooting

### PostgreSQL Connection Issues

**Problem**: `could not connect to server`

**Solution**:
```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Restart PostgreSQL
brew services restart postgresql@15  # macOS
sudo systemctl restart postgresql  # Linux
```

**Problem**: `database "sf_combined" does not exist`

**Solution**:
```bash
# Create the database
psql postgres -c 'CREATE DATABASE sf_combined;'
```

**Problem**: `authentication failed for user`

**Solution**: Update credentials in `.env` file to match your PostgreSQL setup.

### Virtual Environment Issues

**Problem**: `command not found: python3`

**Solution**: Install Python 3.8+ or use `python` instead of `python3`

### Port Already in Use

**Problem**: `Address already in use`

**Solution**: 
```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in app.py (last line)
app.run(debug=True, port=5002, host='0.0.0.0')
```

## Production Deployment

### Security Checklist
- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `FLASK_DEBUG=False`
- [ ] Use environment variables for all sensitive data
- [ ] Enable PostgreSQL SSL/TLS
- [ ] Configure CORS to allow specific origins only
- [ ] Use strong PostgreSQL passwords
- [ ] Enable PostgreSQL connection limits
- [ ] Set up database backups
- [ ] Use a production WSGI server (gunicorn, uwsgi)

### Recommended Production Stack
- **Web Server**: Nginx
- **WSGI Server**: Gunicorn
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis
- **Monitoring**: PostgreSQL logs, Flask logs

### Example Production Run
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## Database Management

### Backup
```bash
pg_dump -U postgres sf_combined > backup.sql
```

### Restore
```bash
psql -U postgres sf_combined < backup.sql
```

### Migrations

For production, consider using Flask-Migrate:

```bash
pip install Flask-Migrate
```

## Development

```bash
# Activate virtual environment
source venv/bin/activate

# Install dev dependencies
pip install pytest black flake8

# Run tests (when implemented)
pytest

# Format code
black app.py models/

# Lint code
flake8 app.py models/
```

## Migration from SQLite

If you're migrating from the SQLite version:

1. Export SQLite data (if any)
2. Update `.env` with PostgreSQL credentials
3. Run the application - tables will be created automatically
4. Import SQLite data using a migration script if needed

## License

This project combines functionality from two separate applications into a unified system.
