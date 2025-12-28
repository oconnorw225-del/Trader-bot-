#!/bin/bash

echo "Running health checks..."

# Check Node.js server
if curl -sf http://localhost:${PORT:-3000}/api/health > /dev/null; then
  echo "✅ Node.js server is healthy"
else
  echo "❌ Node.js server is not responding"
  exit 1
fi

# Check Python backend
if curl -sf http://localhost:${PYTHON_BACKEND_PORT:-8000}/api/health > /dev/null; then
  echo "✅ Python backend is healthy"
else
  echo "❌ Python backend is not responding"
  exit 1
fi

# Check database connection
if [ -n "$DATABASE_URL" ]; then
  echo "✅ Database URL is configured"
else
  echo "⚠️  Database URL not configured"
fi

# Check NDAX credentials
if [ -n "$NDAX_API_KEY" ] && [ -n "$NDAX_API_SECRET" ]; then
  echo "✅ NDAX credentials are configured"
else
  echo "⚠️  NDAX credentials not configured"
fi

echo ""
echo "Health check complete!"
