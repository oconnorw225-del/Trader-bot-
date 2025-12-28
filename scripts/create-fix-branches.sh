#!/bin/bash

# Conflict Resolution Helper
# For branches with merge conflicts, this script creates fix/* branches
# and attempts to resolve conflicts automatically where possible

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_BRANCH="main"

# Function to create and resolve fix branch
create_fix_branch() {
    local original_branch=$1
    local branch_name="${original_branch#copilot/}"  # Remove copilot/ prefix
    local fix_branch="fix/${branch_name}-merge"
    
    echo -e "${YELLOW}Creating fix branch for: $original_branch${NC}"
    echo "  Fix branch: $fix_branch"
    
    # Checkout the original branch
    git checkout -b "$fix_branch" "origin/$original_branch"
    
    # Try to merge main into it
    echo "  Attempting to merge $BASE_BRANCH..."
    if git merge "origin/$BASE_BRANCH" --no-edit; then
        echo -e "${GREEN}  ✓ Merged successfully (no conflicts)${NC}"
        
        # Push the fix branch
        if git push origin "$fix_branch"; then
            echo -e "${GREEN}  ✓ Pushed fix branch${NC}"
            echo "  URL: https://github.com/oconnorw225-del/ndax-quantum-engine/tree/$fix_branch"
            return 0
        else
            echo -e "${RED}  ✗ Failed to push${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}  ! Conflicts detected${NC}"
        
        # Show conflicted files
        echo "  Conflicted files:"
        git diff --name-only --diff-filter=U | while read file; do
            echo "    - $file"
        done
        
        # Abort the merge
        git merge --abort
        
        echo -e "${YELLOW}  Manual resolution required${NC}"
        echo "  Steps to resolve:"
        echo "    1. git checkout $fix_branch"
        echo "    2. git merge origin/$BASE_BRANCH"
        echo "    3. Resolve conflicts in the listed files"
        echo "    4. git add <resolved-files>"
        echo "    5. git commit"
        echo "    6. git push origin $fix_branch"
        echo ""
        
        return 2
    fi
}

# Main function
main() {
    local branches=("$@")
    
    if [ ${#branches[@]} -eq 0 ]; then
        echo "Usage: $0 <branch1> [branch2] [branch3] ..."
        echo ""
        echo "Example:"
        echo "  $0 copilot/fix-api-key-management copilot/repair-readme-merge-conflict"
        echo ""
        echo "This script will create fix/* branches for branches with conflicts"
        exit 1
    fi
    
    echo "========================================"
    echo "Conflict Resolution Helper"
    echo "Base branch: $BASE_BRANCH"
    echo "Branches to process: ${#branches[@]}"
    echo "========================================"
    echo ""
    
    # Fetch latest
    echo "Fetching latest refs..."
    git fetch origin
    echo ""
    
    local success=0
    local manual=0
    local failed=0
    
    # Save current branch
    local current_branch=$(git branch --show-current)
    
    # Process each branch
    for branch in "${branches[@]}"; do
        if create_fix_branch "$branch"; then
            ((success++))
        elif [ $? -eq 2 ]; then
            ((manual++))
        else
            ((failed++))
        fi
        echo ""
        
        # Return to original branch
        if [ -n "$current_branch" ] && git rev-parse --verify "$current_branch" >/dev/null 2>&1; then
            git checkout "$current_branch"
        fi
    done
    
    echo "========================================"
    echo "Summary:"
    echo "  Auto-resolved: $success"
    echo "  Need manual resolution: $manual"
    echo "  Failed: $failed"
    echo "========================================"
}

# Run with command line arguments
main "$@"
