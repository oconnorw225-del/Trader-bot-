#!/bin/bash

# Backend Deployment Script for Hybrid Deployment (Method 2)
# Deploys Node.js and Python backends on a server

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Chimera Backend Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check for .env file
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo "Please create .env file from .env.example and configure it"
    exit 1
fi

echo -e "${GREEN}✓ Found .env configuration${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found${NC}"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo -e "${GREEN}✓ Python $(python3 --version) detected${NC}"

# Install Node.js dependencies
echo -e "\n${YELLOW}Installing Node.js dependencies...${NC}"
npm install

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
if [ -f "$PROJECT_DIR/requirements.txt" ]; then
    pip3 install -r "$PROJECT_DIR/requirements.txt"
else
    echo -e "${YELLOW}⚠ requirements.txt not found${NC}"
    echo "Installing required packages manually..."
    pip3 install flask flask-cors python-dotenv requests
fi

# Create requirements.txt if it doesn't exist
if [ ! -f "$PROJECT_DIR/requirements.txt" ]; then
    echo -e "${YELLOW}Creating requirements.txt...${NC}"
    cat > "$PROJECT_DIR/requirements.txt" << EOF
flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
requests==2.31.0
EOF
    echo -e "${GREEN}✓ Created requirements.txt${NC}"
fi

# Test backend connections
echo -e "\n${YELLOW}Testing backend services...${NC}"

# Start Node.js backend in background
echo "Starting Node.js backend..."
node unified-server.js &
NODE_PID=$!
sleep 3

# Check if Node.js backend is running
if ps -p $NODE_PID > /dev/null; then
    echo -e "${GREEN}✓ Node.js backend started (PID: $NODE_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start Node.js backend${NC}"
    exit 1
fi

# Start Python backend in background
echo "Starting Python backend..."
python3 unified_system_with_exchanges.py &
PYTHON_PID=$!
sleep 3

# Check if Python backend is running
if ps -p $PYTHON_PID > /dev/null; then
    echo -e "${GREEN}✓ Python backend started (PID: $PYTHON_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start Python backend${NC}"
    kill $NODE_PID
    exit 1
fi

# Health checks
echo -e "\n${YELLOW}Performing health checks...${NC}"

# Check Node.js health
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✓ Node.js backend healthy${NC}"
else
    echo -e "${RED}✗ Node.js backend health check failed${NC}"
fi

# Check Python health
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo -e "${GREEN}✓ Python backend healthy${NC}"
else
    echo -e "${RED}✗ Python backend health check failed${NC}"
fi

# Display information
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Backend Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Services are running:"
echo -e "  Node.js Backend: ${BLUE}http://localhost:3000${NC} (PID: $NODE_PID)"
echo -e "  Python Backend:  ${BLUE}http://localhost:8000${NC} (PID: $PYTHON_PID)"
echo -e "  WebSocket:       ${BLUE}ws://localhost:8080${NC}"
echo -e "  Metrics:         ${BLUE}http://localhost:9090/metrics${NC}"
echo ""
echo "To stop services:"
echo -e "  ${BLUE}kill $NODE_PID $PYTHON_PID${NC}"
echo ""
echo "To run in production (with systemd):"
echo -e "  ${BLUE}sudo ./deploy.sh${NC} and select option 3"
echo ""

# Ask if user wants to keep services running
read -p "Keep services running in foreground? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Services running. Press Ctrl+C to stop.${NC}"
    
    # Wait for both processes
    wait $NODE_PID $PYTHON_PID
else
    echo -e "${YELLOW}Stopping services...${NC}"
    kill $NODE_PID $PYTHON_PID
    echo -e "${GREEN}✓ Services stopped${NC}"
fi
