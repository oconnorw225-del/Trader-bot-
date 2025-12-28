#!/bin/bash
# Consolidation script for 'the-basics' repository structure
# Copies best parts from source repositories to unified structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}Starting consolidation of source repositories...${NC}"

# Consolidate API components
echo -e "${YELLOW}Consolidating API components...${NC}"
cp -r source/ndax-quantum-engine/api/* api/ 2>/dev/null || echo -e "${YELLOW}No API files found in ndax-quantum-engine${NC}"

# Consolidate frontend components
echo -e "${YELLOW}Consolidating frontend components...${NC}"
cp -r source/quantum-engine-dashb/src/* frontend/ 2>/dev/null || echo -e "${YELLOW}No frontend files found in quantum-engine-dashb${NC}"
cp -r source/repository-web-app/src/* frontend/ 2>/dev/null || echo -e "${YELLOW}No frontend files found in repository-web-app${NC}"

# Consolidate backend components
echo -e "${YELLOW}Consolidating backend components...${NC}"
cp -r source/shadowforge-ai-trader/strategy/* backend/ 2>/dev/null || echo -e "${YELLOW}No strategy files found in shadowforge-ai-trader${NC}"

# Consolidate documentation
echo -e "${YELLOW}Consolidating documentation...${NC}"
cp -r source/ndax-quantum-engine/docs/* docs/ 2>/dev/null || echo -e "${YELLOW}No docs found in ndax-quantum-engine${NC}"

# Consolidate workflows
echo -e "${YELLOW}Consolidating workflows...${NC}"
cp -r source/quantum-engine-dashb/.github/workflows/* workflows/ 2>/dev/null || echo -e "${YELLOW}No workflows found in quantum-engine-dashb${NC}"
cp -r source/repository-web-app/.github/workflows/* workflows/ 2>/dev/null || echo -e "${YELLOW}No workflows found in repository-web-app${NC}"

# Consolidate tests
echo -e "${YELLOW}Consolidating tests...${NC}"
cp -r source/shadowforge-ai-trader/tests/* tests/ 2>/dev/null || echo -e "${YELLOW}No tests found in shadowforge-ai-trader${NC}"

echo -e "${GREEN}Consolidation complete!${NC}"
