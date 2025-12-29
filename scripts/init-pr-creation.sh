#!/bin/bash

# Initialize Repository for PR Creation
# This script helps set up the repository for creating pull requests
# especially when dealing with a grafted repository or missing base branch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository details
REPO="oconnorw225-del/Trader-bot-"
DEFAULT_BASE="main"

echo "========================================"
echo "Repository PR Initialization"
echo "========================================"
echo ""

# Function to check if gh CLI is available
check_gh_cli() {
    if command -v gh &> /dev/null; then
        echo -e "${GREEN}✓ GitHub CLI installed${NC}"
        if gh auth status &> /dev/null; then
            echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ GitHub CLI not authenticated${NC}"
            echo "  Run: gh auth login"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ GitHub CLI not installed${NC}"
        echo "  Install: https://cli.github.com/"
        return 1
    fi
}

# Function to check repository state
check_repo_state() {
    echo "Checking repository state..."
    
    local current_branch=$(git branch --show-current)
    echo -e "  Current branch: ${BLUE}$current_branch${NC}"
    
    local remote_branches=$(git branch -r | wc -l)
    echo "  Remote branches: $remote_branches"
    
    # Check for main/master branch
    local has_base=false
    if git rev-parse --verify origin/main > /dev/null 2>&1; then
        has_base=true
        echo -e "  ${GREEN}✓ Has origin/main${NC}"
    elif git rev-parse --verify origin/master > /dev/null 2>&1; then
        has_base=true
        DEFAULT_BASE="master"
        echo -e "  ${GREEN}✓ Has origin/master${NC}"
    else
        echo -e "  ${RED}✗ No main/master branch found${NC}"
        has_base=false
    fi
    
    echo ""
    
    if [ "$has_base" = false ]; then
        return 1
    fi
    return 0
}

# Function to create main branch
create_main_branch() {
    echo -e "${YELLOW}Creating main branch...${NC}"
    echo ""
    echo "Choose how to create the main branch:"
    echo "  1) Use current branch as main (recommended for grafted repos)"
    echo "  2) Create from initial commit (8dd1539)"
    echo "  3) Skip (I'll create it manually)"
    echo ""
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            echo "Creating main from current branch..."
            local current_branch=$(git branch --show-current)
            git push origin HEAD:refs/heads/main
            echo -e "${GREEN}✓ Main branch created from $current_branch${NC}"
            ;;
        2)
            echo "Creating main from initial commit..."
            git checkout -b main 8dd1539f214460f288ab75717725d58f96bd4c09
            git push origin main
            git checkout -
            echo -e "${GREEN}✓ Main branch created from commit 8dd1539${NC}"
            ;;
        3)
            echo "Skipping main branch creation"
            return 1
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            return 1
            ;;
    esac
    
    return 0
}

# Function to generate PR data
generate_pr_data() {
    echo ""
    echo "Generating PR data for current branch..."
    
    if [ -f "scripts/generate-pr-data.sh" ]; then
        bash scripts/generate-pr-data.sh
        return 0
    else
        echo -e "${RED}✗ generate-pr-data.sh not found${NC}"
        return 1
    fi
}

# Function to show next steps
show_next_steps() {
    local current_branch=$(git branch --show-current)
    
    echo ""
    echo "========================================"
    echo "Next Steps"
    echo "========================================"
    echo ""
    echo "Your repository is now ready for PR creation!"
    echo ""
    echo "To create a PR for the current branch ($current_branch):"
    echo ""
    echo -e "${BLUE}Option 1: Using GitHub CLI${NC}"
    echo "  gh pr create \\"
    echo "    --title \"[$current_branch] Your PR title\" \\"
    echo "    --body-file \".github/pr-data/${current_branch//\//-}-pr-data.md\" \\"
    echo "    --base main \\"
    echo "    --head $current_branch"
    echo ""
    echo -e "${BLUE}Option 2: Using GitHub Web Interface${NC}"
    echo "  1. Go to: https://github.com/$REPO/compare"
    echo "  2. Set base: main, compare: $current_branch"
    echo "  3. Click 'Create Pull Request'"
    echo "  4. Use generated PR data from .github/pr-data/"
    echo ""
    echo -e "${BLUE}Option 3: Bulk PR Creation (if multiple branches)${NC}"
    echo "  bash scripts/create-branch-prs.sh"
    echo ""
    echo "========================================"
}

# Main execution
main() {
    # Check prerequisites
    echo "Step 1: Checking prerequisites..."
    local has_gh=false
    if check_gh_cli; then
        has_gh=true
    fi
    echo ""
    
    # Check repository state
    echo "Step 2: Checking repository state..."
    local has_base=false
    if check_repo_state; then
        has_base=true
    else
        # Offer to create main branch
        echo ""
        read -p "Would you like to create a main branch now? (y/n): " create_main
        if [[ "$create_main" =~ ^[Yy]$ ]]; then
            if create_main_branch; then
                has_base=true
            fi
        fi
    fi
    
    # Generate PR data
    if [ "$has_base" = true ]; then
        echo ""
        echo "Step 3: Generating PR data..."
        generate_pr_data
        
        # Show next steps
        show_next_steps
    else
        echo ""
        echo -e "${YELLOW}⚠ Cannot proceed without a base branch${NC}"
        echo "Please create a main or master branch first:"
        echo "  git checkout -b main"
        echo "  git push origin main"
        echo ""
        echo "Then run this script again."
    fi
    
    echo ""
    echo -e "${GREEN}Done!${NC}"
}

# Run main function
main
