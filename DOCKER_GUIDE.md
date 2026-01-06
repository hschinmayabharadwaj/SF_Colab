# Docker Setup Guide

This application can be run using Docker and Docker Compose.

## Prerequisites

- Docker (https://www.docker.com/products/docker-desktop)
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

### 1. Clone and Setup

```bash
cd /Users/chinmayabharadwajhs/sf_new/sf-ecosystem-monorepo
```

### 2. Create `.env` file (Optional)

Create a `.env` file in the root directory to customize settings:

```env
DB_USER=appuser
DB_PASSWORD=AppUser@123
DB_NAME=sf_combined
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=1
VITE_API_URL=http://localhost:5001/api
VITE_GEMINI_API_KEY=your-gemini-key-here
```

### 3. Start the Application

```bash
docker-compose up --build
```

This will:
- Build the Flask backend image
- Build the React frontend image
- Start MySQL database
- Start the backend on http://localhost:5001
- Start the frontend on http://localhost:3000

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **MySQL:** localhost:3306

## Available Commands

### Start services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (clean database)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f
```

### View specific service logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Rebuild images
```bash
docker-compose up --build
```

### Rebuild specific service
```bash
docker-compose up --build backend
```

## Troubleshooting

### Backend can't connect to MySQL
- Make sure MySQL container is healthy: `docker-compose ps`
- Check MySQL logs: `docker-compose logs mysql`
- The backend will retry connection automatically

### Port already in use
Change ports in `docker-compose.yml`:
- Frontend: change `3000:3000` to `3001:3000` (etc.)
- Backend: change `5001:5001` to `5002:5001` (etc.)
- MySQL: change `3306:3306` to `3307:3306` (etc.)

### Frontend can't reach backend
Make sure `VITE_API_URL` in `.env` matches your setup:
- Docker: `http://backend:5001/api` (for container-to-container)
- Local: `http://localhost:5001/api` (for host access)

### Clear everything and start fresh
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Production Deployment

For production, use:
```bash
docker-compose -f docker-compose.yml up -d
```

Update environment variables in `.env` with production values.

## Notes

- Database data persists in `mysql_data` volume
- Backend code is mounted for hot-reload in development
- Frontend is built once and served statically
- All services are on the same network (`sf_network`)
