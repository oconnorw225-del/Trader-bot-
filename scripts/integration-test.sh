#!/bin/bash
# Integration Test for NDAX Quantum Engine
# Tests frontend-backend communication and server architecture

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${BLUE}[TEST $TESTS_RUN] $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${BLUE}[TEST $TESTS_RUN] $name${NC}"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED (Status: $status)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED (Expected: $expected_status, Got: $status)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test JSON response contains field
test_json_field() {
    local name=$1
    local url=$2
    local field=$3
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${BLUE}[TEST $TESTS_RUN] $name${NC}"
    
    local response=$(curl -s "$url")
    
    if echo "$response" | grep -q "\"$field\""; then
        echo -e "${GREEN}✓ PASSED (Field '$field' found)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED (Field '$field' not found)${NC}"
        echo "Response: $response"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   NDAX Quantum Engine - Integration Tests        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
BACKEND_PORT=3001
BACKEND_URL="http://localhost:$BACKEND_PORT"

echo -e "${YELLOW}Starting test server on port $BACKEND_PORT...${NC}"

# Start the backend server
PORT=$BACKEND_PORT node unified-server.js > /tmp/test-server.log 2>&1 &
SERVER_PID=$!

echo -e "${BLUE}Server PID: $SERVER_PID${NC}"

# Wait for server to start
sleep 5

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Phase 1: Basic Server Health Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "Health endpoint returns 200" "$BACKEND_URL/api/health" 200
test_json_field "Health response contains status" "$BACKEND_URL/api/health" "status"
test_json_field "Health response contains version" "$BACKEND_URL/api/health" "version"
test_json_field "Health response contains uptime" "$BACKEND_URL/api/health" "uptime"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Phase 2: API Endpoint Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

test_endpoint "Status endpoint returns 200" "$BACKEND_URL/api/status" 200
test_json_field "Status response contains services" "$BACKEND_URL/api/status" "services"
test_endpoint "Stats endpoint returns 200" "$BACKEND_URL/api/stats" 200
test_json_field "Stats response contains totalTrades" "$BACKEND_URL/api/stats" "totalTrades"
test_endpoint "Exchanges endpoint returns 200" "$BACKEND_URL/api/exchanges" 200
test_endpoint "Features endpoint returns 200" "$BACKEND_URL/api/features" 200
test_endpoint "Metrics endpoint returns 200" "$BACKEND_URL/metrics" 200

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Phase 3: Static File Serving${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test that dist is built
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✓ dist/index.html exists${NC}"
    test_endpoint "Root path serves index.html" "$BACKEND_URL/" 200
    test_endpoint "Non-existent route serves index.html (SPA)" "$BACKEND_URL/dashboard" 200
else
    echo -e "${YELLOW}⚠ dist/index.html not found - skipping static file tests${NC}"
    echo -e "${YELLOW}  Run 'npm run build' to test static file serving${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Phase 4: File Structure Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

run_test "API service exists" "test -f src/services/api.js"
run_test "WebSocket service exists" "test -f src/services/websocket.js"
run_test "Vite config exists" "test -f vite.config.js"
run_test "Start dev script exists" "test -f scripts/start-dev.sh"
run_test "Start dev script is executable" "test -x scripts/start-dev.sh"
run_test ".env.example exists" "test -f .env.example"
run_test "package.json has dev script" "grep -q '\"dev\":' package.json"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Test Results Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Tests Run:    $TESTS_RUN"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   INTEGRATION TEST FAILED                         ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════╝${NC}"
    exit 1
else
    echo -e "${YELLOW}Tests Failed: 0${NC}"
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ALL INTEGRATION TESTS PASSED                    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
fi
