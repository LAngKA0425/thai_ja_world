#!/bin/bash
# Thai-Ja World Development Startup Script

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Thai-Ja World - Local Development Startup              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ .env created. Please review and update as needed."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
echo ""

# Build and start containers
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.dev.yml up --build -d
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
attempt=0
max_attempts=60

while [ $attempt -lt $max_attempts ]; do
    postgres_ready=$(docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U taeja 2>/dev/null || echo "not ready")
    redis_ready=$(docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping 2>/dev/null || echo "not ready")
    backend_ready=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null || echo "not ready")

    if [[ "$postgres_ready" == *"accepting" ]] && [[ "$redis_ready" == "PONG" ]] && [[ "$backend_ready" == *"ok"* ]]; then
        echo "✓ All services are ready!"
        break
    fi

    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo ""
    echo "⚠️  Timeout waiting for services. Check logs with: docker-compose -f docker-compose.dev.yml logs"
    exit 1
fi

echo ""
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ✓ Services Running - Ready for Development              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Services:"
echo "   • Frontend:      http://localhost:3000"
echo "   • Backend API:   http://localhost:8000"
echo "   • Socket Server: ws://localhost:3001"
echo "   • PostgreSQL:    localhost:5432"
echo "   • Redis:         localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "   • View logs:           docker-compose -f docker-compose.dev.yml logs -f"
echo "   • View service logs:   docker-compose -f docker-compose.dev.yml logs -f [service-name]"
echo "   • Stop services:       docker-compose -f docker-compose.dev.yml down"
echo "   • Rebuild services:    docker-compose -f docker-compose.dev.yml up --build"
echo ""
