#!/bin/bash
set -e

# Branch Cleanup Execution Script
# Uses git push for branch deletion (works without gh CLI)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Executing Branch Cleanup${NC}"
echo -e "${BLUE}  NDAX Quantum Engine Repository${NC}"
echo -e "${BLUE}============================================${NC}"
echo

DELETED_COUNT=0
FAILED_COUNT=0

# Function to delete remote branch using git push
delete_branch() {
    local branch=$1
    local reason=$2
    
    echo -e "${BLUE}Deleting:${NC} ${branch}"
    echo -e "  ${BLUE}Reason:${NC} ${reason}"
    
    if git push origin --delete "$branch" 2>/dev/null; then
        echo -e "${GREEN}  ✓ Deleted successfully${NC}"
        ((DELETED_COUNT++))
    else
        echo -e "${YELLOW}  ⚠ Already deleted or not found${NC}"
        ((FAILED_COUNT++))
    fi
    echo
}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Phase 1: Autopilot Branches          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

# Get autopilot branches
AUTOPILOT_BRANCHES=$(git ls-remote --heads origin | grep 'refs/heads/autopilot/fix-' | awk '{print $2}' | sed 's|refs/heads/||' || true)

if [ -z "$AUTOPILOT_BRANCHES" ]; then
    echo -e "${YELLOW}No autopilot branches found${NC}"
else
    echo -e "${GREEN}Found autopilot branches to delete${NC}"
    echo
    while IFS= read -r branch; do
        [ -z "$branch" ] && continue
        delete_branch "$branch" "Automated fix attempt - obsolete"
    done <<< "$AUTOPILOT_BRANCHES"
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Phase 2: Duplicate Branches          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

# Duplicate setup branches
delete_branch "copilot/setup-copilot-instructions-again" "Duplicate setup branch"
delete_branch "copilot/setup-copilot-instructions-another-one" "Duplicate setup branch"

# Duplicate variable naming
delete_branch "copilot/improve-variable-and-function-names" "Duplicate naming branch"

# Duplicate todo
delete_branch "copilot/add-todo-list-application" "Duplicate todo branch"

# Duplicate CI/CD
delete_branch "copilot/fix-ci-cd-issues" "Duplicate CI/CD branch"

# Duplicate review
delete_branch "copilot/fix-copilot-review-issue-again" "Duplicate review branch"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Phase 3: Obsolete Branches           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

# BTC functionality
delete_branch "copilot/remove-btc-return-functionality" "Obsolete BTC feature"
delete_branch "copilot/send-btc-back-to-original-account" "Obsolete BTC feature"
delete_branch "copilot/transfer-all-btc-back-account" "Obsolete BTC feature"

# Fork management
delete_branch "copilot/remove-fork-invitation" "Obsolete fork feature"
delete_branch "copilot/remove-forking-allowance" "Obsolete fork feature"
delete_branch "copilot/update-forking-to-false" "Obsolete fork feature"

# Consolidation branches
delete_branch "copilot/consolidate-branches-script" "Superseded"
delete_branch "copilot/featuresafe-bulk-cleanup" "Superseded"
delete_branch "copilot/remove-all-duplicates" "Superseded"

# Resolved issues
delete_branch "copilot/repair-readme-merge-conflict" "Issue resolved"
delete_branch "copilot/resolve-get-it-done-issue" "Issue resolved"
delete_branch "copilot/resolve-pull-request-overview-issues" "Issue resolved"
delete_branch "copilot/fix-repository-functionality" "Issue resolved"
delete_branch "copilot/fix-pull-request-comments" "Issue resolved"
delete_branch "copilot/fix-failjob-async-await-issue" "Issue resolved"

# Status branches
delete_branch "copilot/status-report" "No longer needed"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Cleanup Summary                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

echo -e "${GREEN}Successfully deleted: ${DELETED_COUNT} branches${NC}"
echo -e "${YELLOW}Already deleted/not found: ${FAILED_COUNT} branches${NC}"
echo

# Get remaining branch count
REMAINING=$(git ls-remote --heads origin | wc -l)
echo -e "${BLUE}Remaining branches: ${REMAINING}${NC}"
echo

echo -e "${GREEN}✓ Branch cleanup completed!${NC}"
echo

exit 0
