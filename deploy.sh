#!/bin/bash

# RangaOne Frontend Deployment Script

echo "🚀 Starting RangaOne Frontend Deployment..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build new image
echo "🔨 Building new Docker image..."
docker-compose build --no-cache

# Start the application
echo "▶️ Starting the application..."
docker-compose up -d

# Show status
echo "📊 Container status:"
docker-compose ps

echo "✅ Deployment complete! Application is running on port 3000"
echo "🌐 Access your application at: http://your-server-ip:3000"