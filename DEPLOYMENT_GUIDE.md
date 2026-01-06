# Deployment Guide

This guide covers deploying your SF Ecosystem application in various environments.

## Table of Contents
1. [Local Docker Deployment](#local-docker-deployment)
2. [AWS Deployment](#aws-deployment)
3. [DigitalOcean Deployment](#digitalocean-deployment)
4. [Vercel + External Database](#vercel--external-database)
5. [Google Cloud Platform](#google-cloud-platform)

---

## Local Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose installed
- Port 5001, 3000 available (or change in docker-compose.yml)

### Option A: Avoid Local MySQL Conflicts

If you have local MySQL running, you can:

**Option 1: Stop local MySQL**
```bash
brew services stop mysql
```

**Option 2: Change Docker ports**
Edit `docker-compose.yml`:
```yaml
services:
  mysql:
    ports:
      - "3307:3306"  # Change from 3306 to 3307
```

### Quick Start
```bash
cd /Users/chinmayabharadwajhs/sf_new/sf-ecosystem-monorepo

# Create .env file
cat > .env << EOF
DB_USER=appuser
DB_PASSWORD=AppUser@123
DB_NAME=sf_combined
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=1
VITE_API_URL=http://localhost:5001/api
EOF

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- API: http://localhost:5001/api

---

## AWS Deployment

### Option 1: Using AWS ECS (Recommended)

#### Prerequisites
- AWS Account
- AWS CLI installed and configured
- Docker images pushed to AWS ECR

#### Steps

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name sf-ecosystem --region us-east-1
```

2. **Push Docker Images**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
docker build -f backend/Dockerfile -t sf-ecosystem-backend .
docker tag sf-ecosystem-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/sf-ecosystem:backend
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/sf-ecosystem:backend

# Build and push frontend
docker build -f frontend/Dockerfile -t sf-ecosystem-frontend .
docker tag sf-ecosystem-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/sf-ecosystem:frontend
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/sf-ecosystem:frontend
```

3. **Create RDS MySQL Database**
```bash
aws rds create-db-instance \
  --db-instance-identifier sf-ecosystem-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20 \
  --publicly-accessible
```

4. **Create ECS Cluster and Services**
- Use AWS Console or Terraform
- Configure environment variables with RDS endpoint
- Set up load balancer for frontend and backend

5. **Set Environment Variables in ECS**
- `DB_HOST`: RDS endpoint
- `DB_PORT`: 3306
- `DB_USER`: admin
- `DB_PASSWORD`: your-password
- `VITE_API_URL`: https://your-domain.com/api

---

## DigitalOcean Deployment

### Option 1: Using App Platform (Easiest)

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Select your GitHub repo
   - Authorize DigitalOcean

2. **Create App Specification**
```yaml
name: sf-ecosystem
services:
  - name: backend
    github:
      repo: your-username/SF_Colab
      branch: main
    build_command: "pip install -r backend/requirements.txt"
    run_command: "python backend/app.py"
    environment_slug: python
    envs:
      - key: DB_HOST
        value: ${db.host}
      - key: DB_PORT
        value: "3306"
      - key: DB_USER
        value: ${db.username}
      - key: DB_PASSWORD
        value: ${db.password}
      - key: DB_NAME
        value: sf_combined
    http_port: 5001

  - name: frontend
    github:
      repo: your-username/SF_Colab
      branch: main
    build_command: "cd frontend && npm run build"
    run_command: "serve -s frontend/dist -l 3000"
    environment_slug: node-js
    envs:
      - key: VITE_API_URL
        value: "https://${backend.host}/api"

databases:
  - name: db
    engine: MYSQL
    version: "8"
```

3. **Deploy**
   - Upload spec to DigitalOcean
   - Click "Create App"
   - Wait for deployment

**Cost:** ~$15/month (1GB RAM droplet + MySQL)

---

## Vercel + External Database

Already partially configured! Just need to:

1. **Set Environment Variables in Vercel Dashboard**
   - Project Settings → Environment Variables
   - Add: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, SECRET_KEY
   - **Use MySQL from:** AWS RDS, DigitalOcean, Planetscale, or other provider

2. **Configure Database**
   - Use a managed MySQL service (PlanetScale recommended - free tier available)
   - Update `VITE_API_URL` to your Vercel domain

3. **Deploy**
```bash
git push origin main
# Vercel auto-deploys from GitHub
```

**Cost:** FREE (Vercel + PlanetScale)

---

## Google Cloud Platform

### Using Cloud Run

1. **Create Cloud SQL MySQL Instance**
```bash
gcloud sql instances create sf-ecosystem-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1
```

2. **Push Docker Images to Container Registry**
```bash
# Setup
gcloud auth configure-docker gcr.io

# Build and push backend
docker build -f backend/Dockerfile -t gcr.io/$PROJECT_ID/sf-backend .
docker push gcr.io/$PROJECT_ID/sf-backend

# Build and push frontend
docker build -f frontend/Dockerfile -t gcr.io/$PROJECT_ID/sf-frontend .
docker push gcr.io/$PROJECT_ID/sf-frontend
```

3. **Deploy to Cloud Run**
```bash
# Backend
gcloud run deploy sf-backend \
  --image gcr.io/$PROJECT_ID/sf-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DB_HOST=$DB_INSTANCE_CONNECTION_NAME,DB_USER=root,DB_PASSWORD=password,DB_NAME=sf_combined

# Frontend
gcloud run deploy sf-frontend \
  --image gcr.io/$PROJECT_ID/sf-frontend \
  --platform managed \
  --region us-central1
```

**Cost:** FREE tier includes 2 million requests/month

---

## Recommended Deployment Strategy

### Development
- Use local Docker: `docker-compose up`
- Keep local MySQL running separately

### Staging
- Deploy to DigitalOcean App Platform
- Use staging database
- Full SSL/TLS

### Production
- **Option 1:** AWS ECS + RDS (Most Reliable)
- **Option 2:** DigitalOcean App Platform (Easiest)
- **Option 3:** Vercel (Cheapest) + PlanetScale MySQL

---

## Environment Variables Checklist

Ensure these are set in your deployment:

```
✓ DB_HOST = database hostname
✓ DB_PORT = 3306
✓ DB_USER = database user
✓ DB_PASSWORD = database password
✓ DB_NAME = sf_combined
✓ SECRET_KEY = random strong key
✓ VITE_API_URL = https://your-api-domain.com/api
✓ VITE_GEMINI_API_KEY = your gemini key (if using)
✓ FLASK_ENV = production
✓ FLASK_DEBUG = 0 (for production)
```

---

## Troubleshooting

### 502 Bad Gateway
- Backend not responding
- Check environment variables
- Verify database connection
- Check backend logs

### Frontend can't reach backend
- Wrong `VITE_API_URL`
- CORS issues
- Network connectivity

### Database connection errors
- Wrong credentials
- Database not running
- Firewall blocking access
- Wrong hostname

### Logs
```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# AWS ECS
aws logs tail /ecs/sf-ecosystem-backend --follow

# DigitalOcean
doctl apps logs <app-id> --component backend

# Vercel
vercel logs
```

---

## Next Steps

1. Choose your deployment platform
2. Set up database (if not included)
3. Configure environment variables
4. Deploy and test
5. Set up monitoring/alerts
