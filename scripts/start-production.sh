#!/bin/bash
set -e

echo "=========================================="
echo "Starting Chimera Trading System"
echo "Production Mode"
echo "=========================================="

# Load environment variables
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
fi

# Validate required environment variables
REQUIRED_VARS=(
  "NDAX_API_KEY"
  "NDAX_API_SECRET"
  "NDAX_USER_ID"
  "NDAX_ACCOUNT_ID"
  "DATABASE_URL"
  "SESSION_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var is not set"
    exit 1
  fi
done

echo "✅ Environment variables validated"

# Create necessary directories
mkdir -p logs reports backups data

# Start PostgreSQL (if local)
if [ "$RAILWAY_ENVIRONMENT" != "production" ]; then
  echo "Starting local PostgreSQL..."
  docker-compose up -d postgres redis
fi

# Start Python backend
echo "Starting Python backend on port $PYTHON_BACKEND_PORT..."
python unified_system_with_exchanges.py &
PYTHON_PID=$!

# Wait for Python backend to be ready
echo "Waiting for Python backend..."
for i in {1..30}; do
  if curl -s http://localhost:$PYTHON_BACKEND_PORT/api/health > /dev/null; then
    echo "✅ Python backend is ready"
    break
  fi
  sleep 2
done

# Start Node.js server
echo "Starting Node.js server on port $PORT..."
node unified-server.js &
NODE_PID=$!

# Wait for Node.js server to be ready
echo "Waiting for Node.js server..."
for i in {1..30}; do
  if curl -s http://localhost:$PORT/api/health > /dev/null; then
    echo "✅ Node.js server is ready"
    break
  fi
  sleep 2
done

# Start Chimera Bot (if enabled)
if [ "$CHIMERA_RUNTIME_ENABLED" = "true" ]; then
  echo "Starting Chimera Bot..."
  cd chimera-bot
  python main.py &
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
echo "Trading Mode: $TRADING_MODE"
echo "Safety Lock: $SAFETY_LOCK"
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
