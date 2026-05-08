#!/bin/bash

# AgentFlow Startup Script
# This script helps you start the complete AgentFlow system

set -e

echo "🚀 Starting AgentFlow - Your Digital Team of AI Agents"
echo "======================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p generated_projects
mkdir -p logs

# Start the services
echo "🐳 Starting Docker services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check PostgreSQL
if docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is healthy"
else
    echo "❌ PostgreSQL is not healthy"
fi

# Check Redis
if docker compose exec -T redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis is not healthy"
fi

# Check RabbitMQ
if docker compose exec -T rabbitmq rabbitmq-diagnostics ping > /dev/null 2>&1; then
    echo "✅ RabbitMQ is healthy"
else
    echo "❌ RabbitMQ is not healthy"
fi

# Check AI Engine
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ AI Engine is healthy"
else
    echo "❌ AI Engine is not healthy"
fi

# Check API Gateway
if curl -f http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ API Gateway is healthy"
else
    echo "❌ API Gateway is not healthy"
fi

echo ""
echo "🎉 AgentFlow is starting up!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   API Gateway:  http://localhost:5001"
echo "   AI Engine:    http://localhost:8000"
echo "   RabbitMQ:     http://localhost:15672 (guest/guest)"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker compose logs -f"
echo "   Stop all:     docker compose down"
echo "   Restart:      docker compose restart"
echo ""
echo "💡 First time setup may take a few minutes for all services to be ready."