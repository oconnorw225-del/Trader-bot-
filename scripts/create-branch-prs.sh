#!/bin/bash

# Branch Consolidation - PR Creation Script
# This script creates individual pull requests for each feature branch
# Requires: gh CLI with authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Repository details
REPO="oconnorw225-del/ndax-quantum-engine"
BASE_BRANCH="main"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BRANCH_LIST_FILE="$REPO_ROOT/.github/branch-cleanup/branches.txt"

# Load branches from configuration file
if [ -f "$BRANCH_LIST_FILE" ]; then
    # Read branches, skip comments and empty lines, exclude backup branches
    mapfile -t BRANCHES < <(grep -v '^#' "$BRANCH_LIST_FILE" | grep -v '^backup/' | grep -v '^$' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
else
    echo -e "${RED}ERROR: Branch list file not found: $BRANCH_LIST_FILE${NC}"
    exit 1
fi

# Labels to apply to each PR
LABELS="enhancement,cleanup,high-priority"

# Function to check if gh is authenticated
check_auth() {
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}ERROR: Not authenticated with GitHub CLI${NC}"
        echo "Please run: gh auth login"
        exit 1
    fi
}

# Function to generate PR description from branch
generate_pr_description() {
    local branch=$1
    local commit_message=$(git log -1 --format="%s" "origin/$branch" 2>/dev/null || echo "No commits found")
    local files_changed=$(git diff --name-only "$BASE_BRANCH...origin/$branch" 2>/dev/null | wc -l || echo "0")
    local conflict_status="No conflicts"
    
    # Check for conflicts
    merge_result=$(git merge-tree $(git merge-base "origin/$BASE_BRANCH" "origin/$branch" 2>/dev/null || echo "origin/$BASE_BRANCH") "origin/$BASE_BRANCH" "origin/$branch" 2>/dev/null || echo "")
    if echo "$merge_result" | grep -q "<<<<<<< "; then
        conflict_status="⚠️ **Has conflicts** - will need resolution"
    fi
    
    # Generate description based on branch name
    local purpose=$(echo "$branch" | sed 's/copilot\///' | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    
    cat <<EOF
## Purpose
${purpose}

## Changes
This PR merges the \`${branch}\` branch into \`main\`.

**Latest commit:** ${commit_message}

### Files Changed
- **Total files changed:** ${files_changed}

### Tests
Tests will be run automatically by CI/CD pipeline.

### Conflicts
${conflict_status}

## Checklist
- [ ] Code follows project standards
- [ ] Tests pass (if applicable)
- [ ] No merge conflicts (or conflicts have been resolved)
- [ ] Branch can be safely deleted after merge

## Related
Part of branch consolidation effort tracked in #151

---
*This PR was created as part of the automated branch consolidation process.*
EOF
}

# Function to create PR for a single branch
create_pr_for_branch() {
    local branch=$1
    
    echo -e "${YELLOW}Processing branch: $branch${NC}"
    
    # Check if branch exists
    if ! git rev-parse --verify "origin/$branch" > /dev/null 2>&1; then
        echo -e "${RED}  ✗ Branch does not exist${NC}"
        return 1
    fi
    
    # Check if PR already exists
    existing_pr=$(gh pr list --base "$BASE_BRANCH" --head "$branch" --json number --jq '.[0].number' 2>/dev/null || echo "")
    
    if [[ -n "$existing_pr" ]]; then
        echo -e "${GREEN}  ✓ PR already exists: #${existing_pr}${NC}"
        return 0
    fi
    
    # Generate PR title
    local commit_msg=$(git log -1 --format="%s" "origin/$branch" 2>/dev/null || echo "Merge branch")
    local pr_title="[$branch] -> main: $commit_msg"
    
    # Generate PR description
    local pr_body=$(generate_pr_description "$branch")
    
    # Create the PR
    echo "  Creating PR..."
    if pr_number=$(gh pr create \
        --title "$pr_title" \
        --body "$pr_body" \
        --base "$BASE_BRANCH" \
        --head "$branch" \
        --label "$LABELS" \
        --repo "$REPO" 2>&1); then
        
        echo -e "${GREEN}  ✓ Created PR: $pr_number${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Failed to create PR: $pr_number${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo "========================================"
    echo "Branch Consolidation - PR Creation"
    echo "Repository: $REPO"
    echo "Base branch: $BASE_BRANCH"
    echo "Total branches to process: ${#BRANCHES[@]}"
    echo "========================================"
    echo ""
    
    # Check authentication
    check_auth
    
    # Fetch latest refs
    echo "Fetching latest refs..."
    git fetch origin
    echo ""
    
    # Track statistics
    local success=0
    local failed=0
    
    # Process each branch
    for branch in "${BRANCHES[@]}"; do
        if create_pr_for_branch "$branch"; then
            ((success++))
        else
            ((failed++))
        fi
        echo ""
    done
    
    # Summary
    echo "========================================"
    echo "Summary:"
    echo "  Successful: $success (includes both new and existing PRs)"
    echo "  Failed: $failed"
    echo "========================================"
    
    # Update report file
    echo "Updating report..."
    if grep -q "PRs Created:" .github/branch-cleanup/report.md; then
        sed -i.bak "s/PRs Created:.*/PRs Created: (run script to get count)/" .github/branch-cleanup/report.md && rm -f .github/branch-cleanup/report.md.bak
    fi
    if grep -q "Last Updated:" .github/branch-cleanup/report.md; then
        sed -i.bak "s/Last Updated:.*/Last Updated: $(date +%Y-%m-%d)/" .github/branch-cleanup/report.md && rm -f .github/branch-cleanup/report.md.bak
    fi
    
    echo -e "${GREEN}Done!${NC}"
}

# Run main function
main
