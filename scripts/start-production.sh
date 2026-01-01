#!/bin/bash
set -e

echo "=========================================="
echo "Starting Chimera Trading System"
echo "Production Mode"
echo "=========================================="

# Load environment variables if .env.production exists (but not on Railway)
if [ -f .env.production ] && [ -z "$RAILWAY_ENVIRONMENT" ]; then
  echo "Loading .env.production..."
  export $(cat .env.production | grep -v '^#' | xargs) 2>/dev/null || true
fi

# Set default values for optional environment variables
export PORT=${PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export PYTHON_BACKEND_PORT=${PYTHON_BACKEND_PORT:-8000}
export REQUIRE_AUTH=${REQUIRE_AUTH:-true}

# Validate critical environment variables (only if not in Railway)
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
  REQUIRED_VARS=(
    "NDAX_API_KEY"
    "NDAX_API_SECRET"
    "NDAX_USER_ID"
    "NDAX_ACCOUNT_ID"
  )
  
  for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
      echo "⚠️  Warning: $var is not set - some features may not work"
    fi
  done
else
  echo "✅ Running on Railway - using environment variables from Railway"
fi

# Create necessary directories
mkdir -p logs reports backups data config

echo "✅ Environment configured"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"

# For Railway, just start the Node.js server
# Python backend and other services can be added later as separate Railway services
if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then
  echo "Starting Node.js server on port $PORT..."
  exec node backend/nodejs/server.js
fi

# For local/development with full stack
echo "Starting full stack (Node.js + Python + Chimera)..."

# Start Python backend if Python is available
if command -v python3 &> /dev/null && [ -f "unified_system_with_exchanges.py" ]; then
  echo "Starting Python backend on port $PYTHON_BACKEND_PORT..."
  python3 unified_system_with_exchanges.py &
  PYTHON_PID=$!
  
  # Wait for Python backend to be ready
  echo "Waiting for Python backend..."
  for i in {1..15}; do
    if curl -s http://localhost:$PYTHON_BACKEND_PORT/api/health > /dev/null 2>&1; then
      echo "✅ Python backend is ready"
      break
    fi
    sleep 2
  done
fi

# Start Node.js server
echo "Starting Node.js server on port $PORT..."
node backend/nodejs/server.js &
NODE_PID=$!

# Wait for Node.js server to be ready
echo "Waiting for Node.js server..."
for i in {1..15}; do
  if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1; then
    echo "✅ Node.js server is ready"
    break
  fi
  sleep 2
done

# Start Chimera Bot (if enabled and available)
if [ "$CHIMERA_RUNTIME_ENABLED" = "true" ] && [ -d "chimera-bot" ]; then
  echo "Starting Chimera Bot..."
  cd chimera-bot
  python3 main.py &
  CHIMERA_PID=$!
  cd ..
  echo "✅ Chimera Bot started (PID: $CHIMERA_PID)"
fi

echo ""
echo "=========================================="
echo "✅ All services started successfully!"
echo "=========================================="
echo "Node.js Server: http://localhost:$PORT"
echo "Python Backend: http://localhost:$PYTHON_BACKEND_PORT"
echo "=========================================="

# Keep script running and handle graceful shutdown
cleanup() {
  echo ""
  echo "Shutting down services..."
  kill $PYTHON_PID $NODE_PID $CHIMERA_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait -n

# Cleanup on exit
cleanup
