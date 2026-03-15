#!/bin/bash

# SISE UNICH - Optimized Production Deployment Script
# This script automates the deployment process for both Backend (Laravel) and Frontend (React)

# Exit on any error
set -e

echo "🚀 Iniciando despliegue de SISE UNICH..."

# 1. Backend Optimization
echo "📦 Optimizando Backend (Laravel)..."
cd backend

# Install dependencies (Production mode)
composer install --no-dev --optimize-autoloader

# Run database migrations
php artisan migrate --force

# Clear and optimize caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan icons:cache

# Set permissions for storage and bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "✅ Backend optimizado."

# 2. Frontend Optimization
echo "🌐 Optimizando Frontend (React + Vite)..."
cd ../frontend

# Install dependencies
npm install

# Build the production bundle with Rollup code splitting
npm run build

# Copy build to public folder of backend or serve via Nginx directly
# Recommended: Nginx serves frontend, /api proxies to Laravel

echo "✅ Frontend compilado en folder 'dist/'."

# 3. Queue Management
echo "⏳ Reiniciando Colas (Queues)..."
cd ../backend
php artisan queue:restart

echo "✨ Despliegue completado satisfactoriamente."
