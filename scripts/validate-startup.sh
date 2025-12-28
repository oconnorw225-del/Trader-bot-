#!/bin/bash

# NDAX Quantum Engine - Startup Validation Script
# Validates system is ready for autonomous operation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
PYTHON_API_URL="${PYTHON_API_URL:-http://localhost:5000}"
MAX_RETRIES=10
RETRY_DELAY=3

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   NDAX Quantum Engine - Startup Validation            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track validation results
VALIDATION_PASSED=true

# Function to print status
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" == "success" ]; then
        echo -e "${GREEN}✅ ${message}${NC}"
    elif [ "$status" == "error" ]; then
        echo -e "${RED}❌ ${message}${NC}"
        VALIDATION_PASSED=false
    elif [ "$status" == "warning" ]; then
        echo -e "${YELLOW}⚠️  ${message}${NC}"
    else
        echo -e "${BLUE}ℹ️  ${message}${NC}"
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local service_name=$2
    local retries=0
    
    print_status "info" "Waiting for ${service_name} to start..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s -f "${url}" > /dev/null 2>&1; then
            print_status "success" "${service_name} is running"
            return 0
        fi
        retries=$((retries + 1))
        echo -ne "\r${YELLOW}⏳ Attempt ${retries}/${MAX_RETRIES}...${NC}"
        sleep $RETRY_DELAY
    done
    
    echo ""
    print_status "error" "${service_name} failed to start after ${MAX_RETRIES} attempts"
    return 1
}

# 1. Check Node.js installation
echo -e "\n${BLUE}═══ System Requirements ═══${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "success" "Node.js installed: ${NODE_VERSION}"
    
    # Check version is >= 18
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_status "success" "Node.js version meets requirement (>=18)"
    else
        print_status "error" "Node.js version too old. Required: 18+, Found: ${NODE_VERSION}"
    fi
else
    print_status "error" "Node.js not installed"
fi

# 2. Check Python installation
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "success" "Python installed: ${PYTHON_VERSION}"
else
    print_status "warning" "Python not installed (optional for enhanced features)"
fi

# 3. Check npm packages
echo -e "\n${BLUE}═══ Dependencies ═══${NC}"
if [ -d "node_modules" ]; then
    print_status "success" "Node.js dependencies installed"
else
    print_status "error" "Node.js dependencies not installed. Run: npm install"
fi

# 4. Check environment configuration
echo -e "\n${BLUE}═══ Configuration ═══${NC}"
if [ -f ".env" ]; then
    print_status "success" ".env file exists"
    
    # Check critical environment variables
    source .env 2>/dev/null || true
    
    if [ -n "$NDAX_API_KEY" ]; then
        print_status "success" "NDAX API key configured"
    else
        print_status "warning" "NDAX API key not configured (required for live trading)"
    fi
    
    if [ -n "$ENCRYPTION_KEY" ]; then
        print_status "success" "Encryption key configured"
    else
        print_status "error" "Encryption key not configured (required for security)"
    fi
    
    if [ -n "$JWT_SECRET" ]; then
        print_status "success" "JWT secret configured"
    else
        print_status "error" "JWT secret not configured (required for authentication)"
    fi
else
    print_status "error" ".env file not found. Copy from .env.example"
fi

# 5. Check if frontend is built
echo -e "\n${BLUE}═══ Build Status ═══${NC}"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    print_status "success" "Frontend build exists"
else
    print_status "warning" "Frontend not built. Run: npm run build"
fi

# 6. Check backend services
echo -e "\n${BLUE}═══ Backend Services ═══${NC}"

# Check if Node.js backend is running
if wait_for_service "${API_URL}/api/health" "Node.js Backend"; then
    # Test health endpoint
    HEALTH_RESPONSE=$(curl -s "${API_URL}/api/health")
    if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
        print_status "success" "Node.js backend health check passed"
    else
        print_status "error" "Node.js backend health check failed"
    fi
else
    print_status "error" "Node.js backend not accessible at ${API_URL}"
fi

# Check if Python backend is running (optional)
if curl -s -f "${PYTHON_API_URL}/api/health" > /dev/null 2>&1; then
    print_status "success" "Python backend is running (optional)"
else
    print_status "warning" "Python backend not running (optional for advanced features)"
fi

# 7. Test API endpoints
echo -e "\n${BLUE}═══ API Endpoints ═══${NC}"

# Test trading endpoint
TRADING_RESPONSE=$(curl -s -X POST "${API_URL}/api/quantum/execute" \
    -H "Content-Type: application/json" \
    -d '{"strategy":"superposition","data":{"price":45000,"volume":1000}}' 2>/dev/null || echo "error")

if echo "$TRADING_RESPONSE" | grep -q "recommendation"; then
    print_status "success" "Quantum trading endpoint working"
else
    print_status "error" "Quantum trading endpoint failed"
fi

# Test autostart endpoint
AUTOSTART_RESPONSE=$(curl -s "${API_URL}/api/autostart/status" 2>/dev/null || echo "error")

if echo "$AUTOSTART_RESPONSE" | grep -q "running\|stopped"; then
    print_status "success" "Autostart endpoint working"
else
    print_status "error" "Autostart endpoint failed"
fi

# 8. Check platform connectivity
echo -e "\n${BLUE}═══ Platform Integration ═══${NC}"

# Check feature toggles
FEATURES_RESPONSE=$(curl -s "${API_URL}/api/features" 2>/dev/null || echo "error")

if echo "$FEATURES_RESPONSE" | grep -q "quantumEngine"; then
    print_status "success" "Feature toggles configured"
    
    # Count enabled features
    ENABLED_COUNT=$(echo "$FEATURES_RESPONSE" | grep -o "true" | wc -l)
    print_status "info" "Enabled features: ${ENABLED_COUNT}/12"
else
    print_status "error" "Feature toggles not accessible"
fi

# 9. Check autonomous system
echo -e "\n${BLUE}═══ Autonomous System ═══${NC}"

if [ "$AUTOSTART_ENABLED" == "true" ]; then
    print_status "success" "Autonomous mode enabled in configuration"
    
    # Check if AutoStartManager is initialized
    if echo "$AUTOSTART_RESPONSE" | grep -q "initialized"; then
        print_status "success" "AutoStartManager initialized"
    else
        print_status "warning" "AutoStartManager status unknown"
    fi
else
    print_status "warning" "Autonomous mode not enabled (set AUTOSTART_ENABLED=true in .env)"
fi

# 10. Check database
echo -e "\n${BLUE}═══ Database ═══${NC}"

if [ -d "data" ]; then
    print_status "success" "Data directory exists"
else
    print_status "warning" "Data directory not found (will be created on first run)"
fi

# 11. Security validation
echo -e "\n${BLUE}═══ Security ═══${NC}"

# Check if running in production mode
if [ "$NODE_ENV" == "production" ]; then
    print_status "success" "Running in production mode"
    
    # Check if demo mode is disabled
    if [ "$DEMO_MODE" != "true" ]; then
        print_status "success" "Demo mode disabled (live trading enabled)"
    else
        print_status "warning" "Demo mode enabled (live trading disabled)"
    fi
else
    print_status "warning" "Not running in production mode (NODE_ENV=${NODE_ENV:-development})"
fi

# 12. Performance check
echo -e "\n${BLUE}═══ Performance ═══${NC}"

# Check available memory
if command -v free &> /dev/null; then
    AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$AVAILABLE_MEM" -gt 1000 ]; then
        print_status "success" "Sufficient memory available: ${AVAILABLE_MEM}MB"
    else
        print_status "warning" "Low memory available: ${AVAILABLE_MEM}MB (recommended: 2GB+)"
    fi
fi

# Check disk space
if command -v df &> /dev/null; then
    AVAILABLE_DISK=$(df -h . | awk 'NR==2{print $4}')
    print_status "info" "Available disk space: ${AVAILABLE_DISK}"
fi

# 13. Test WebSocket (if applicable)
echo -e "\n${BLUE}═══ Real-time Features ═══${NC}"

if echo "$FEATURES_RESPONSE" | grep -q "websocket.*true"; then
    print_status "success" "WebSocket support enabled"
else
    print_status "info" "WebSocket support not enabled (optional for real-time updates)"
fi

# 14. Final validation
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Validation Summary                                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✅ All critical validations passed!${NC}"
    echo -e "${GREEN}   System is ready for autonomous operation.${NC}"
    echo ""
    echo -e "${BLUE}Access your NDAX Quantum Engine at:${NC}"
    echo -e "   • Dashboard: ${API_URL}"
    echo -e "   • Mobile App: ${API_URL}/mobile"
    echo -e "   • API Health: ${API_URL}/api/health"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "   1. Configure platform API keys in .env (if not done)"
    echo -e "   2. Enable autonomous mode: ${API_URL}/api/autostart/start"
    echo -e "   3. Monitor dashboard for earnings and activity"
    echo -e "   4. Check logs: tail -f logs/autostart.log"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some validations failed!${NC}"
    echo -e "${YELLOW}   Please fix the errors above before running in production.${NC}"
    echo ""
    echo -e "${BLUE}Common fixes:${NC}"
    echo -e "   • Run: npm install"
    echo -e "   • Run: npm run build"
    echo -e "   • Configure .env file"
    echo -e "   • Generate encryption key: openssl rand -base64 32"
    echo -e "   • Check Node.js version: node --version (should be 18+)"
    echo ""
    exit 1
fi
