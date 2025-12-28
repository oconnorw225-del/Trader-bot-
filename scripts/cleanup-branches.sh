#!/bin/bash
# Branch Cleanup Script for NDAX Quantum Engine
# This script helps clean up the 24 copilot branches and prepare for merging top 8 branches to main

set -e

echo "========================================="
echo "NDAX Quantum Engine - Branch Cleanup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from repository root${NC}"
    exit 1
fi

# Function to print section headers
print_section() {
    echo ""
    echo -e "${GREEN}=== $1 ===${NC}"
    echo ""
}

# Function to check if GitHub CLI is available
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${YELLOW}Warning: GitHub CLI (gh) not found. Install from https://cli.github.com/${NC}"
        echo "Alternatively, you can delete branches via GitHub web interface"
        return 1
    fi
    return 0
}

print_section "Step 1: Analyzing Current Branches"

# List all branches
echo "Current branches:"
git branch -r | grep -v HEAD | sed 's/origin\///' | sort

echo ""
echo -e "${YELLOW}Total branches found: $(git branch -r | grep -v HEAD | wc -l)${NC}"

print_section "Step 2: Top 8 Branches to Merge"

TOP_8_BRANCHES=(
    "feature/autonomous-job-automation-complete"
    "feature/auto-start-system"
    "fix/lint-and-tests"
    "copilot/configure-copilot-instructions"
    "copilot/fix-ci-cd-workflow-issues"
    "copilot/add-autostart-system-features"
    "copilot/consolidate-mobile-styles"
    "copilot/add-todo-list-feature"
)

echo "The following branches should be merged to main (in order):"
for i in "${!TOP_8_BRANCHES[@]}"; do
    echo "$((i+1)). ${TOP_8_BRANCHES[$i]}"
done

print_section "Step 3: Branches to Delete After Merging"

BRANCHES_TO_DELETE=(
    "copilot/add-todo-list-application"
    "copilot/add-wallet-for-bots"
    "copilot/finish-original-issue"
    "copilot/fix-copilot-access-issue"
    "copilot/fix-copilot-review-issue"
    "copilot/fix-failjob-async-await-issue"
    "copilot/fix-pull-request-comments"
    "copilot/improve-variable-and-function-names"
    "copilot/improve-variable-function-names"
    "copilot/rebase-copilot-instructions-branch"
    "copilot/remove-all-duplicates"
    "copilot/remove-fork-invitation"
    "copilot/remove-forking-allowance"
    "copilot/resolve-get-it-done-issue"
    "copilot/resolve-pull-request-overview-issues"
    "copilot/setup-copilot-instructions"
    "copilot/setup-copilot-instructions-again"
    "copilot/status-report"
    "copilot/update-forking-to-false"
)

echo "The following $(echo "${#BRANCHES_TO_DELETE[@]}") branches will be deleted:"
for branch in "${BRANCHES_TO_DELETE[@]}"; do
    echo "  - $branch"
done

print_section "Step 4: Cleanup Options"

echo "Choose how to proceed:"
echo "  1. Generate GitHub CLI commands (requires 'gh' to be installed)"
echo "  2. Generate manual instructions for GitHub web interface"
echo "  3. Generate branch comparison URLs"
echo "  4. Exit (review only)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        if check_gh_cli; then
            print_section "GitHub CLI Commands"
            
            echo "# First, ensure you're on main branch"
            echo "git checkout main"
            echo "git pull origin main"
            echo ""
            
            echo "# Merge top 8 branches (review PRs first!)"
            for branch in "${TOP_8_BRANCHES[@]}"; do
                echo "# Check if PR exists for $branch"
                echo "gh pr list --head $branch"
                echo "# If PR exists and approved, merge it:"
                echo "gh pr merge $branch --merge --delete-branch"
                echo ""
            done
            
            echo "# After successful merges, delete remaining branches"
            for branch in "${BRANCHES_TO_DELETE[@]}"; do
                echo "gh api -X DELETE repos/:owner/:repo/git/refs/heads/$branch"
            done
        fi
        ;;
    2)
        print_section "Manual Cleanup Instructions"
        
        echo "1. Go to: https://github.com/oconnorw225-del/ndax-quantum-engine/branches"
        echo ""
        echo "2. For each of the top 8 branches, create/review PRs:"
        for branch in "${TOP_8_BRANCHES[@]}"; do
            echo "   - $branch"
        done
        echo ""
        echo "3. After PRs are merged, delete these $(echo "${#BRANCHES_TO_DELETE[@]}") branches:"
        for branch in "${BRANCHES_TO_DELETE[@]}"; do
            echo "   - $branch"
        done
        echo ""
        echo "4. Use the 'Delete branch' button next to each branch in the GitHub UI"
        ;;
    3)
        print_section "Branch Comparison URLs"
        
        echo "Review what each top branch contains before merging:"
        for branch in "${TOP_8_BRANCHES[@]}"; do
            echo ""
            echo "Branch: $branch"
            echo "Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...$branch"
        done
        ;;
    4)
        echo "Exiting. No changes made."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

print_section "Cleanup Summary"

echo "Summary of cleanup plan:"
echo "  - Total branches: 29"
echo "  - Branches to merge: ${#TOP_8_BRANCHES[@]}"
echo "  - Branches to delete: ${#BRANCHES_TO_DELETE[@]}"
echo "  - Remaining: main + current working branch"
echo ""
echo -e "${GREEN}Review complete!${NC}"
