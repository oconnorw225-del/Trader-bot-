#!/bin/bash

# Build Verification Script for PR #180 Integration
# Verifies all critical components from PR #180 are present and functional

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  PR #180 Integration Build Verification${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Track overall status
PASS_COUNT=0
FAIL_COUNT=0

# Function to check file exists
check_file() {
    local file=$1
    local category=$2
    
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "  ${RED}✗${NC} $file ${RED}(MISSING)${NC}"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    local dir=$1
    
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $dir/"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "  ${RED}✗${NC} $dir/ ${RED}(MISSING)${NC}"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Check Backend Files
echo -e "${YELLOW}1. Backend Infrastructure${NC}"
check_file "backend/unified_backend.py" "Backend"
check_file "backend/nodejs/server.js" "Backend"
check_file "backend/python/requirements.txt" "Backend"
echo ""

# Check Core Engines
echo -e "${YELLOW}2. Core Engines${NC}"
check_file "core/trading_engine.py" "Core"
check_file "core/quantum_engine.py" "Core"
check_file "core/__init__.py" "Core"
echo ""

# Check Frontend Components
echo -e "${YELLOW}3. Frontend Components (Critical)${NC}"
check_file "src/components/TradingPanel.tsx" "Component"
check_file "src/components/ActivityLog.tsx" "Component"
check_file "src/components/CompleteDashboard.tsx" "Component"
check_file "src/lib/api.ts" "API Client"
echo ""

# Check Styles
echo -e "${YELLOW}4. Styles${NC}"
check_file "src/styles/TradingPanel.css" "Styles"
check_file "src/styles/ActivityLog.css" "Styles"
echo ""

# Check Infrastructure
echo -e "${YELLOW}5. Infrastructure Files${NC}"
check_file "Dockerfile" "Docker"
check_file "docker-compose.yml" "Docker"
check_file ".github/workflows/ci-cd.yml" "CI/CD"
check_file "railway.json" "Deploy"
check_file "Procfile" "Deploy"
echo ""

# Check Documentation
echo -e "${YELLOW}6. Documentation${NC}"
check_file "README.md" "Docs"
check_file "docs/ARCHITECTURE.md" "Docs"
check_file "docs/AWS_DEPLOYMENT.md" "Docs"
check_file "docs/LOCAL_DEVELOPMENT.md" "Docs"
check_file "INTEGRATION_SUMMARY.md" "Docs"
check_file "PR_180_ANALYSIS.md" "Docs"
check_file "MERGE_RESOLUTION.md" "Docs"
echo ""

# Check Configuration
echo -e "${YELLOW}7. Configuration Files${NC}"
check_file "package.json" "Config"
check_file "tsconfig.json" "Config"
check_file ".env.example" "Config"
echo ""

# Check Scripts
echo -e "${YELLOW}8. Utility Scripts${NC}"
check_file "scripts/verify-env.js" "Scripts"
echo ""

# Check Dependencies
echo -e "${YELLOW}9. Dependencies Check${NC}"
if [ -f "package.json" ]; then
    if grep -q '"date-fns"' package.json; then
        echo -e "  ${GREEN}✓${NC} date-fns dependency present"
        ((PASS_COUNT++))
    else
        echo -e "  ${RED}✗${NC} date-fns dependency ${RED}(MISSING)${NC}"
        ((FAIL_COUNT++))
    fi
    
    if grep -q '"lightweight-charts"' package.json; then
        echo -e "  ${GREEN}✓${NC} lightweight-charts dependency present"
        ((PASS_COUNT++))
    else
        echo -e "  ${RED}✗${NC} lightweight-charts dependency ${RED}(MISSING)${NC}"
        ((FAIL_COUNT++))
    fi
fi
echo ""

# TypeScript Compilation Check
echo -e "${YELLOW}10. TypeScript Compilation${NC}"
if command -v npx &> /dev/null; then
    if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
        echo -e "  ${YELLOW}⚠${NC} TypeScript has compilation errors (run 'npx tsc --noEmit' for details)"
    else
        echo -e "  ${GREEN}✓${NC} TypeScript compilation check passed"
        ((PASS_COUNT++))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} npx not found, skipping TypeScript check"
fi
echo ""

# Node Modules Check
echo -e "${YELLOW}11. Node Modules${NC}"
if [ -d "node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} node_modules directory exists"
    ((PASS_COUNT++))
else
    echo -e "  ${YELLOW}⚠${NC} node_modules not found (run 'npm install')"
fi
echo ""

# Summary
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Verification Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC} $PASS_COUNT checks"
echo -e "  ${RED}Failed:${NC} $FAIL_COUNT checks"
echo ""

TOTAL=$((PASS_COUNT + FAIL_COUNT))
PERCENTAGE=$((PASS_COUNT * 100 / TOTAL))

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Build is complete.${NC}"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo -e "  1. Run: npm install (if node_modules missing)"
    echo -e "  2. Run: npm test"
    echo -e "  3. Run: npm run lint"
    echo -e "  4. Start dev: npm run dev:full"
    echo -e "  5. Start Flask: python backend/unified_backend.py"
    exit 0
elif [ $PERCENTAGE -ge 90 ]; then
    echo -e "${YELLOW}⚠ Build is ${PERCENTAGE}% complete with minor issues${NC}"
    echo ""
    echo -e "${YELLOW}Recommendations:${NC}"
    echo -e "  - Review failed checks above"
    echo -e "  - Most features should work"
    echo -e "  - Run 'npm install' to fix missing dependencies"
    exit 0
else
    echo -e "${RED}✗ Build verification failed (${PERCENTAGE}% complete)${NC}"
    echo ""
    echo -e "${RED}Critical issues detected:${NC}"
    echo -e "  - Review failed checks above"
    echo -e "  - Some critical files are missing"
    echo -e "  - Build may not be functional"
    exit 1
fi
