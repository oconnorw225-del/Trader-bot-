#!/bin/bash

# Master Consolidation Script
# Orchestrates the entire branch consolidation process
# This is the main entry point for consolidating all branches

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║   Branch Consolidation Master Script      ║${NC}"
echo -e "${MAGENTA}║   ndax-quantum-engine Repository          ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check authentication
check_auth() {
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}✗ ERROR: Not authenticated with GitHub CLI${NC}"
        echo ""
        echo "Please run: gh auth login"
        exit 1
    fi
    echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
}

# Menu function
show_menu() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}Select an action:${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    echo "  1) Analyze all branches (recommended first step)"
    echo "  2) Create fix branches for conflicts"
    echo "  3) Create PRs for all branches"
    echo "  4) Full automation (analyze + create PRs)"
    echo "  5) View analysis report"
    echo "  6) View consolidation status"
    echo "  0) Exit"
    echo ""
    read -p "Enter choice [0-6]: " choice
}

# Function: Analyze branches
analyze_branches() {
    echo ""
    echo -e "${BLUE}Step 1: Analyzing branches...${NC}"
    echo ""
    
    cd "$REPO_ROOT"
    
    if [ -f "$SCRIPT_DIR/analyze-branches.sh" ]; then
        bash "$SCRIPT_DIR/analyze-branches.sh"
        echo ""
        echo -e "${GREEN}✓ Analysis complete${NC}"
        echo -e "  Report saved to: ${YELLOW}.github/branch-cleanup/analysis-report.md${NC}"
    else
        echo -e "${RED}✗ analyze-branches.sh not found${NC}"
        return 1
    fi
}

# Function: Create fix branches
create_fix_branches() {
    echo ""
    echo -e "${BLUE}Step 2: Creating fix branches for conflicts...${NC}"
    echo ""
    
    # Check if analysis report exists
    if [ ! -f "$REPO_ROOT/.github/branch-cleanup/analysis-report.md" ]; then
        echo -e "${YELLOW}⚠ No analysis report found${NC}"
        echo "Please run option 1 (Analyze branches) first"
        return 1
    fi
    
    # Extract branches with conflicts from analysis report
    conflicted_branches=$(grep "⚠️ HAS CONFLICTS" "$REPO_ROOT/.github/branch-cleanup/analysis-report.md" | grep -oE "copilot/[a-zA-Z0-9_-]+" | tr -d ' ' || echo "")
    
    if [ -z "$conflicted_branches" ]; then
        echo -e "${GREEN}✓ No branches with conflicts found${NC}"
        return 0
    fi
    
    echo "Found branches with conflicts:"
    echo "$conflicted_branches" | while read branch; do
        echo "  - $branch"
    done
    echo ""
    
    read -p "Create fix branches for these? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Skipped"
        return 0
    fi
    
    cd "$REPO_ROOT"
    bash "$SCRIPT_DIR/create-fix-branches.sh" $conflicted_branches
}

# Function: Create PRs
create_prs() {
    echo ""
    echo -e "${BLUE}Step 3: Creating pull requests...${NC}"
    echo ""
    
    cd "$REPO_ROOT"
    
    read -p "This will create ~29 PRs. Continue? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Cancelled"
        return 0
    fi
    
    if [ -f "$SCRIPT_DIR/create-branch-prs.sh" ]; then
        bash "$SCRIPT_DIR/create-branch-prs.sh"
    else
        echo -e "${RED}✗ create-branch-prs.sh not found${NC}"
        return 1
    fi
}

# Function: Full automation
full_automation() {
    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
    echo -e "${MAGENTA}Full Automation Mode${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
    echo ""
    echo "This will:"
    echo "  1. Analyze all branches"
    echo "  2. Create fix branches for conflicts (if any)"
    echo "  3. Create PRs for all branches"
    echo ""
    
    read -p "Continue? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Cancelled"
        return 0
    fi
    
    analyze_branches
    
    echo ""
    echo -e "${YELLOW}Press Enter to continue to fix branch creation...${NC}"
    read
    
    create_fix_branches
    
    echo ""
    echo -e "${YELLOW}Press Enter to continue to PR creation...${NC}"
    read
    
    create_prs
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Full automation complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
}

# Function: View analysis report
view_analysis() {
    if [ -f "$REPO_ROOT/.github/branch-cleanup/analysis-report.md" ]; then
        less "$REPO_ROOT/.github/branch-cleanup/analysis-report.md"
    else
        echo -e "${RED}✗ Analysis report not found${NC}"
        echo "Run option 1 (Analyze branches) first"
    fi
}

# Function: View status
view_status() {
    if [ -f "$REPO_ROOT/.github/branch-cleanup/report.md" ]; then
        less "$REPO_ROOT/.github/branch-cleanup/report.md"
    else
        echo -e "${RED}✗ Status report not found${NC}"
    fi
}

# Main loop
main() {
    cd "$REPO_ROOT"
    
    # Check authentication once at start
    check_auth
    
    while true; do
        show_menu
        
        case $choice in
            1)
                analyze_branches
                ;;
            2)
                create_fix_branches
                ;;
            3)
                create_prs
                ;;
            4)
                full_automation
                ;;
            5)
                view_analysis
                ;;
            6)
                view_status
                ;;
            0)
                echo ""
                echo -e "${GREEN}Goodbye!${NC}"
                echo ""
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice${NC}"
                ;;
        esac
        
        echo ""
        echo -e "${YELLOW}Press Enter to return to menu...${NC}"
        read
    done
}

# Run main function
main
