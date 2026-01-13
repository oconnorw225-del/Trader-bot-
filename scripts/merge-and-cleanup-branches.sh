#!/bin/bash
set -e

# DELETION FUNCTIONALITY DISABLED - This script has been disabled to prevent accidental data loss

# ============================================
# DELETION FUNCTIONALITY DISABLED
# ============================================
echo -e "\033[0;31m============================================\033[0m"
echo -e "\033[0;31mERROR: Deletion functionality has been disabled\033[0m"
echo -e "\033[0;31m============================================\033[0m"
echo ""
echo "This script has been disabled to prevent accidental deletion of branches."
echo "All deletion operations have been removed from the repository."
echo ""
echo "If you need to delete branches:"
echo "  1. Go to GitHub repository in browser"
echo "  2. Navigate to branches page"
echo "  3. Manually delete branches after careful review"
echo ""
echo -e "\033[0;31mScript execution blocked for safety.\033[0m"
echo -e "\033[0;31m============================================\033[0m"
exit 1

# Colors for output (SCRIPT DISABLED BELOW THIS LINE)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_BRANCH="main"
REPO_DIR="/home/runner/work/Trader-bot-/Trader-bot-"

# Top 8 priority branches to merge (in order)
PRIORITY_BRANCHES=(
  "feature/autonomous-job-automation-complete"
  "feature/auto-start-system"
  "fix/lint-and-tests"
  "copilot/configure-copilot-instructions"
  "copilot/fix-ci-cd-workflow-issues"
  "copilot/add-autostart-system-features"
  "copilot/consolidate-mobile-styles"
  "copilot/add-todo-list-feature"
)

# Branches to delete after merging priority branches
BRANCHES_TO_DELETE=(
  "copilot/improve-variable-and-function-names"
  "copilot/improve-variable-function-names"
  "copilot/setup-copilot-instructions"
  "copilot/setup-copilot-instructions-again"
  "copilot/rebase-copilot-instructions-branch"
  "copilot/add-todo-list-application"
  "copilot/add-wallet-for-bots"
  "copilot/finish-original-issue"
  "copilot/fix-copilot-access-issue"
  "copilot/fix-copilot-review-issue"
  "copilot/fix-failjob-async-await-issue"
  "copilot/fix-pull-request-comments"
  "copilot/resolve-get-it-done-issue"
  "copilot/resolve-pull-request-overview-issues"
  "copilot/status-report"
  "copilot/remove-all-duplicates"
  "copilot/remove-fork-invitation"
  "copilot/remove-forking-allowance"
  "copilot/update-forking-to-false"
)

cd "$REPO_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Branch Merge and Cleanup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create backup tag
echo -e "${BLUE}Step 1: Creating backup tag${NC}"
BACKUP_TAG="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
git tag "$BACKUP_TAG"
echo -e "${GREEN}✓ Backup tag created locally: $BACKUP_TAG${NC}"
echo ""

# Fetch all branches
echo -e "${BLUE}Step 2: Fetching all remote branches${NC}"
git fetch --all --prune
echo -e "${GREEN}✓ Fetch complete${NC}"
echo ""

# Ensure we have main branch locally
if ! git rev-parse --verify main >/dev/null 2>&1; then
  echo -e "${YELLOW}Creating local main branch...${NC}"
  git fetch origin main:main
  echo -e "${GREEN}✓ Main branch created locally${NC}"
fi

# Checkout main
echo -e "${BLUE}Step 3: Checking out main branch${NC}"
git checkout main
git pull origin main || echo "Main is up to date"
echo -e "${GREEN}✓ On main branch${NC}"
echo ""

# Function to check if branch exists on remote
branch_exists() {
  git ls-remote --heads origin "$1" | grep -q "$1"
}

# Merge priority branches
echo -e "${BLUE}Step 4: Merging priority branches${NC}"
echo -e "${BLUE}========================================${NC}"
MERGED_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

for branch in "${PRIORITY_BRANCHES[@]}"; do
  echo -e "${YELLOW}Processing: $branch${NC}"
  
  if ! branch_exists "$branch"; then
    echo -e "${BLUE}  ⊘ Branch does not exist - skipping${NC}"
    ((SKIPPED_COUNT++))
    echo ""
    continue
  fi
  
  # Fetch the branch
  git fetch origin "$branch"
  
  # Check if already merged
  if git merge-base --is-ancestor FETCH_HEAD HEAD 2>/dev/null; then
    echo -e "${GREEN}  ✓ Already merged${NC}"
    ((MERGED_COUNT++))
    echo ""
    continue
  fi
  
  # Attempt merge
  echo -e "${BLUE}  → Attempting merge...${NC}"
  if git merge --no-ff --allow-unrelated-histories FETCH_HEAD -m "Merge branch '$branch' into main" --no-edit; then
    echo -e "${GREEN}  ✓ Successfully merged${NC}"
    ((MERGED_COUNT++))
  else
    echo -e "${RED}  ✗ Merge failed (conflicts)${NC}"
    git merge --abort 2>/dev/null || true
    ((FAILED_COUNT++))
  fi
  echo ""
done

echo -e "${BLUE}Merge Results:${NC}"
echo -e "  ${GREEN}Successfully merged: $MERGED_COUNT${NC}"
echo -e "  ${RED}Failed (conflicts): $FAILED_COUNT${NC}"
echo -e "  ${BLUE}Skipped (not found): $SKIPPED_COUNT${NC}"
echo ""

# Push merged changes to main
if [ $MERGED_COUNT -gt 0 ]; then
  echo -e "${BLUE}Step 5: Pushing merged changes to main${NC}"
  if git push origin main; then
    echo -e "${GREEN}✓ Changes pushed to main${NC}"
  else
    echo -e "${RED}✗ Failed to push to main${NC}"
    echo -e "${YELLOW}⚠ You may need to manually push these changes${NC}"
  fi
  echo ""
fi

# Report completion
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Branch Merge Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  - Priority branches merged: $MERGED_COUNT/${#PRIORITY_BRANCHES[@]}"
echo "  - Backup tag: $BACKUP_TAG"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review the merged changes on main branch"
echo "  2. Run tests to ensure everything works"
echo "  3. Delete obsolete branches (requires GitHub API access)"
echo ""
echo -e "${BLUE}To delete obsolete branches, use:${NC}"
echo "  gh api -X DELETE repos/oconnorw225-del/Trader-bot-/git/refs/heads/BRANCH_NAME"
echo ""

# List branches that should be deleted
echo -e "${YELLOW}Branches marked for deletion:${NC}"
for branch in "${BRANCHES_TO_DELETE[@]}"; do
  if branch_exists "$branch"; then
    echo "  - $branch"
  fi
done
echo ""
