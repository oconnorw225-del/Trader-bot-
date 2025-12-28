#!/bin/bash
# Railway Deployment Verification Script
# Run this locally to verify deployment configuration before pushing to Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 NDAX Quantum Engine - Deployment Verification"
echo "================================================="
echo ""

# Check Node.js version
echo -n "Checking Node.js version... "
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" == v18* ]] || [[ "$NODE_VERSION" == v20* ]]; then
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${YELLOW}⚠${NC} $NODE_VERSION (Railway recommends Node 18+)"
fi

# Check if package.json exists
echo -n "Checking package.json... "
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} Missing package.json"
    exit 1
fi

# Check railway.json configuration
echo -n "Checking railway.json... "
if [ -f "railway.json" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Verify start command using jq for reliable JSON parsing
    if command -v jq &> /dev/null; then
        START_CMD=$(jq -r '.deploy.startCommand' railway.json)
        echo "  Start command: $START_CMD"
        
        # Verify build command
        BUILD_CMD=$(jq -r '.build.buildCommand' railway.json)
        echo "  Build command: $BUILD_CMD"
    else
        echo "  (Install jq for detailed JSON parsing)"
    fi
else
    echo -e "${RED}✗${NC} Missing railway.json"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if npm ci > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${RED}✗${NC} Failed to install dependencies"
    exit 1
fi

# Run build
echo ""
echo "🔨 Building application..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    exit 1
fi

# Check if dist directory was created
echo -n "Checking dist directory... "
if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC}"
    FILES_COUNT=$(find dist -type f | wc -l)
    echo "  Files in dist: $FILES_COUNT"
else
    echo -e "${RED}✗${NC} dist directory not created"
    exit 1
fi

# Check if backend server file exists
echo -n "Checking backend server... "
if [ -f "backend/nodejs/server.js" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} backend/nodejs/server.js not found"
    exit 1
fi

# Test server startup on random available port
echo ""
echo "🚀 Testing server startup..."
# Find an available port
TEST_PORT=3001
while lsof -Pi :$TEST_PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    TEST_PORT=$((TEST_PORT + 1))
done
echo "Using test port: $TEST_PORT"

PORT=$TEST_PORT timeout 5 node backend/nodejs/server.js > /tmp/server-test.log 2>&1 &
SERVER_PID=$!
sleep 3

# Test health endpoint
echo -n "Testing health endpoint... "
if curl -s http://localhost:$TEST_PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    curl -s http://localhost:$TEST_PORT/api/health | grep -o '"status":"[^"]*"' || echo ""
else
    echo -e "${RED}✗${NC} Health endpoint not responding"
    kill $SERVER_PID 2>/dev/null || true
    cat /tmp/server-test.log
    exit 1
fi

# Cleanup
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

# Check for hardcoded PORT in config files
echo ""
echo "🔍 Checking for hardcoded PORT..."
if grep -qE 'PORT\s*=\s*"[0-9]+"' railway.toml 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC} railway.toml contains hardcoded PORT (should be removed)"
else
    echo -e "${GREEN}✓${NC} No hardcoded PORT in railway.toml"
fi

# Verify server uses process.env.PORT
echo -n "Checking if server uses dynamic PORT... "
if grep -q 'process.env.PORT' backend/nodejs/server.js; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} Server may not use process.env.PORT"
fi

# Check .gitignore
echo -n "Checking .gitignore for dist/... "
if grep -q '^dist/' .gitignore; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} dist/ should be in .gitignore"
fi

echo ""
echo "================================================="
echo -e "${GREEN}✅ Deployment verification complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Push to GitHub"
echo "2. Railway will auto-deploy"
echo "3. Monitor deployment in Railway dashboard"
echo "4. Verify health endpoint after deployment"
echo ""
