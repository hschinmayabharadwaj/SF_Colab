# SF Ecosystem - Full Stack Virtual Product Store

A complete full-stack application combining a Flask-based backend API with a React frontend dashboard for managing a virtual product store with wallet system.

## 🏗️ Project Structure

```
sf-ecosystem-monorepo/
├── backend/              # Flask API (PostgreSQL)
│   ├── app.py
│   ├── models/
│   ├── requirements.txt
│   └── README.md
│
└── frontend/             # React Dashboard (Vite + TypeScript)
    ├── src/
    ├── package.json
    └── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- **PostgreSQL 12+**
- **npm or yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/sf-ecosystem-monorepo.git
cd sf-ecosystem-monorepo
```

### 2. Setup Backend

```bash
cd backend

# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
psql postgres -c 'CREATE DATABASE sf_combined;'

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run backend
chmod +x start.sh
./start.sh
```

Backend will run on: **http://localhost:5001**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure API endpoint
cp .env.example .env
# Edit .env to set VITE_API_URL=http://localhost:5001

# Run frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 📦 Backend (Flask + PostgreSQL)

### Features

- **User Management**: Create users with automatic wallet creation
- **Multi-Currency Wallet**: SF Coins, Premium Gems, Event Tokens
- **Virtual Products**: Cosmetics, boosters, consumables, subscriptions
- **Purchase System**: Buy products with wallet currencies
- **Inventory Management**: Track, equip, and use items
- **Transaction History**: Complete audit trail of all wallet operations

### Tech Stack

- Flask 3.0
- SQLAlchemy 2.0
- PostgreSQL 12+
- Flask-CORS

### API Endpoints

- **Users**: `/users`, `/users/<id>`
- **Wallet**: `/wallet/balance/<id>`, `/wallet/history/<id>`, `/wallet/earn`, `/wallet/spend`
- **Products**: `/products`, `/products/<id>`, `/products/<id>/purchase`
- **Inventory**: `/inventory/<id>`, `/inventory/<id>/equip`, `/inventory/<id>/use`

See [backend/README.md](backend/README.md) for full API documentation.

## 🎨 Frontend (React + Vite + TypeScript)

### Features

- **Dashboard Overview**: Real-time stats and metrics
- **User Management**: View and manage users
- **Wallet Interface**: Display balances and transactions
- **Product Catalog**: Browse and purchase virtual products
- **Inventory View**: Manage owned items
- **Responsive Design**: Works on desktop and mobile

### Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS (or your UI framework)

See [frontend/README.md](frontend/README.md) for frontend documentation.

## 🔧 Development

### Running Both Services Concurrently

#### Terminal 1 - Backend
```bash
cd backend
./start.sh
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sf_combined
SECRET_KEY=your-secret-key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📚 Documentation

- **[Backend Documentation](backend/README.md)** - Complete API reference
- **[Frontend Documentation](frontend/README.md)** - Component guide
- **[PostgreSQL Migration Guide](backend/POSTGRESQL_MIGRATION.md)** - Database setup
- **[Migration Summary](backend/MIGRATION_SUMMARY.md)** - Project history

## 🚢 Production Deployment

### Backend Deployment

**Recommended Stack:**
- Nginx (reverse proxy)
- Gunicorn (WSGI server)
- PostgreSQL (managed database)
- Docker (containerization)

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
cd backend
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel, Netlify, or your hosting
```

### Environment Variables (Production)

Make sure to set secure values for:
- `SECRET_KEY` (use strong random string)
- `DB_PASSWORD` (strong database password)
- Enable SSL/TLS for PostgreSQL
- Configure CORS for specific frontend domain

## 🐳 Docker Support (Optional)

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/sf_combined
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=sf_combined
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- **Backend**: Flask REST API with PostgreSQL
- **Frontend**: React SPA with TypeScript
- **Database**: PostgreSQL 15+

## 🆘 Support

### Common Issues

**Backend won't start:**
- Check PostgreSQL is running: `brew services list`
- Verify database exists: `psql -l | grep sf_combined`
- Check `.env` credentials

**Frontend can't connect to backend:**
- Verify backend is running on port 5001
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

**Database errors:**
- Run migrations: Tables auto-create on first run
- Check PostgreSQL logs
- Verify user permissions

## 📊 Project Status

- ✅ Backend API - Complete
- ✅ PostgreSQL Database - Complete
- ✅ User & Wallet System - Complete
- ✅ Virtual Products - Complete
- ✅ Purchase System - Complete
- ✅ Inventory Management - Complete
- 🚧 Frontend Dashboard - In Progress
- 📋 Authentication/JWT - Planned
- 📋 Payment Gateway - Planned
- 📋 Admin Panel - Planned

## 🎯 Roadmap

- [ ] Add JWT authentication
- [ ] Implement role-based access control
- [ ] Add real-time notifications (WebSocket)
- [ ] Create admin dashboard
- [ ] Add analytics and reporting
- [ ] Implement caching layer (Redis)
- [ ] Add comprehensive test coverage
- [ ] Set up CI/CD pipeline
- [ ] Add API rate limiting
- [ ] Implement payment gateway integration

## 👥 Team

- Backend Development: Flask + PostgreSQL
- Frontend Development: React + TypeScript
- Database Design: PostgreSQL Schema

---

**Made with ❤️ for the SF Ecosystem**
