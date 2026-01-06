#!/bin/bash

# PlanetScale + Vercel Deployment Script
# This script helps you quickly deploy to Vercel with PlanetScale

echo "🚀 SF Ecosystem - Vercel + PlanetScale Deployment"
echo "=================================================="
echo ""

# Check if we have the required tools
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

echo "📋 Deployment Checklist:"
echo ""
echo "Before proceeding, ensure you have:"
echo "  ✓ PlanetScale account (https://planetscale.com)"
echo "  ✓ Database created in PlanetScale"
echo "  ✓ Database credentials saved"
echo "  ✓ Vercel account (https://vercel.com)"
echo "  ✓ GitHub repo connected to Vercel"
echo ""

read -p "Ready to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "📝 Enter your PlanetScale Database Credentials:"
echo ""

read -p "DB_HOST (e.g., aws.connect.psdb.cloud): " DB_HOST
read -p "DB_USER (e.g., username_abc123): " DB_USER
read -sp "DB_PASSWORD (hidden input): " DB_PASSWORD
echo ""
read -p "DB_NAME (default: sf_ecosystem): " DB_NAME
DB_NAME=${DB_NAME:-sf_ecosystem}
read -p "DB_PORT (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

echo ""
echo "🔐 Generate a random SECRET_KEY:"
SECRET_KEY=$(openssl rand -hex 32)
echo "Generated: $SECRET_KEY"
echo ""

echo "🌐 Enter your Vercel domain (or leave empty for auto):"
read -p "Domain (e.g., sf-ecosystem-abc123.vercel.app): " VERCEL_DOMAIN
if [ -z "$VERCEL_DOMAIN" ]; then
    VERCEL_DOMAIN="your-vercel-domain.vercel.app"
    echo "⚠️  Using placeholder: $VERCEL_DOMAIN"
    echo "   Update this after deployment in Vercel dashboard"
fi

VITE_API_URL="https://$VERCEL_DOMAIN/api"

echo ""
echo "📤 Setting Vercel Environment Variables..."
echo ""

# Login to Vercel if not already logged in
vercel link --yes 2>/dev/null || vercel auth login

# Set environment variables
vercel env add DB_HOST "$DB_HOST" production
vercel env add DB_PORT "$DB_PORT" production
vercel env add DB_USER "$DB_USER" production
vercel env add DB_PASSWORD "$DB_PASSWORD" production
vercel env add DB_NAME "$DB_NAME" production
vercel env add SECRET_KEY "$SECRET_KEY" production
vercel env add VITE_API_URL "$VITE_API_URL" production

echo ""
echo "✅ Environment variables set!"
echo ""

echo "📤 Pushing to GitHub and deploying..."
git add .
git commit -m "Deploy to Vercel with PlanetScale" || true
git push origin main

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard: https://vercel.com"
echo "2. Watch your deployment complete"
echo "3. Test your app at: https://$VERCEL_DOMAIN"
echo "4. Test API at: https://$VERCEL_DOMAIN/api/health"
echo ""
echo "📚 For more info, see PLANETSCALE_VERCEL_GUIDE.md"
