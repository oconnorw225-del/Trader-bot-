#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PYTHON_BACKEND_PORT=8000
NODE_BACKEND_PORT=3000
VITE_DEV_PORT=5173
WS_PORT=8080

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   NDAX Quantum Engine - Development Startup      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}⏳ Waiting for $name to be ready...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}❌ $name failed to start within timeout${NC}"
    return 1
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    
    # Kill all background jobs
    jobs -p | xargs -r kill 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file. Please configure it before proceeding.${NC}"
        echo -e "${BLUE}ℹ️  Edit .env file and run this script again.${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.example not found. Cannot create .env file.${NC}"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
fi

# Check if Python dependencies are installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    if [ -f backend/python/requirements.txt ]; then
        pip3 install -r backend/python/requirements.txt
    elif [ -f requirements.txt ]; then
        pip3 install -r requirements.txt
    fi
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"
echo ""

# 1. Start Python Backend (Flask)
echo -e "${BLUE}[1/3] Starting Python Backend (port $PYTHON_BACKEND_PORT)...${NC}"
if check_port $PYTHON_BACKEND_PORT; then
    echo -e "${YELLOW}⚠️  Port $PYTHON_BACKEND_PORT is already in use. Skipping Python backend.${NC}"
else
    if [ -f backend/python/app.py ]; then
        cd backend/python
        FLASK_PORT=$PYTHON_BACKEND_PORT python3 app.py > ../../logs/python-backend.log 2>&1 &
        PYTHON_PID=$!
        cd ../..
        echo -e "${GREEN}✅ Python backend started (PID: $PYTHON_PID)${NC}"
        
        # Wait for Python backend to be ready
        if ! wait_for_service "Python Backend" "http://localhost:$PYTHON_BACKEND_PORT/api/health"; then
            echo -e "${RED}❌ Python backend failed to start. Check logs/python-backend.log${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  backend/python/app.py not found. Skipping Python backend.${NC}"
    fi
fi

sleep 2

# 2. Start Node.js Backend (Express with WebSocket)
echo -e "${BLUE}[2/3] Starting Node.js Backend (port $NODE_BACKEND_PORT, WebSocket port $WS_PORT)...${NC}"
if check_port $NODE_BACKEND_PORT; then
    echo -e "${YELLOW}⚠️  Port $NODE_BACKEND_PORT is already in use. Skipping Node.js backend.${NC}"
else
    PORT=$NODE_BACKEND_PORT node unified-server.js > logs/nodejs-backend.log 2>&1 &
    NODE_PID=$!
    echo -e "${GREEN}✅ Node.js backend started (PID: $NODE_PID)${NC}"
    
    # Wait for Node.js backend to be ready
    if ! wait_for_service "Node.js Backend" "http://localhost:$NODE_BACKEND_PORT/api/health"; then
        echo -e "${RED}❌ Node.js backend failed to start. Check logs/nodejs-backend.log${NC}"
        exit 1
    fi
fi

sleep 2

# 3. Start Vite Dev Server
echo -e "${BLUE}[3/3] Starting Vite Dev Server (port $VITE_DEV_PORT)...${NC}"
if check_port $VITE_DEV_PORT; then
    echo -e "${YELLOW}⚠️  Port $VITE_DEV_PORT is already in use. Skipping Vite dev server.${NC}"
else
    npm run dev > logs/vite.log 2>&1 &
    VITE_PID=$!
    echo -e "${GREEN}✅ Vite dev server started (PID: $VITE_PID)${NC}"
    
    # Wait for Vite to be ready
    if ! wait_for_service "Vite Dev Server" "http://localhost:$VITE_DEV_PORT"; then
        echo -e "${RED}❌ Vite dev server failed to start. Check logs/vite.log${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          All Services Started Successfully        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "${GREEN}  ✓ Python Backend:    http://localhost:$PYTHON_BACKEND_PORT${NC}"
echo -e "${GREEN}  ✓ Node.js Backend:   http://localhost:$NODE_BACKEND_PORT${NC}"
echo -e "${GREEN}  ✓ WebSocket Server:  ws://localhost:$WS_PORT${NC}"
echo -e "${GREEN}  ✓ Frontend (Vite):   http://localhost:$VITE_DEV_PORT${NC}"
echo ""
echo -e "${BLUE}📁 Log Files:${NC}"
echo -e "  • Python:   logs/python-backend.log"
echo -e "  • Node.js:  logs/nodejs-backend.log"
echo -e "  • Vite:     logs/vite.log"
echo ""
echo -e "${BLUE}💡 Quick Links:${NC}"
echo -e "  • Dashboard:      http://localhost:$VITE_DEV_PORT"
echo -e "  • API Health:     http://localhost:$NODE_BACKEND_PORT/api/health"
echo -e "  • Python Health:  http://localhost:$PYTHON_BACKEND_PORT/api/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running and wait for all background processes
wait
