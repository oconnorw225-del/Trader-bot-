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
REPO="oconnorw225-del/Trader-bot-"
BASE_BRANCH="main"

# Top 8 priority branches to merge
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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Branch Cleanup and Merge Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if branch exists on remote
branch_exists() {
  local branch=$1
  git ls-remote --heads origin "$branch" | grep -q "$branch"
}

# Function to check if branch is already merged
is_merged() {
  local branch=$1
  git fetch origin "$BASE_BRANCH" > /dev/null 2>&1
  git fetch origin "$branch" > /dev/null 2>&1
  
  # Check if the branch is already merged into main
  git merge-base --is-ancestor "origin/$branch" "origin/$BASE_BRANCH" 2>/dev/null
}

# Function to merge a branch to main
merge_branch() {
  local branch=$1
  
  echo -e "${YELLOW}Processing: $branch${NC}"
  
  if ! branch_exists "$branch"; then
    echo -e "${RED}  ✗ Branch does not exist on remote${NC}"
    return 1
  fi
  
  if is_merged "$branch"; then
    echo -e "${GREEN}  ✓ Already merged into main${NC}"
    return 0
  fi
  
  # Check for merge conflicts
  git fetch origin "$branch" > /dev/null 2>&1
  if ! git merge-tree $(git merge-base origin/$BASE_BRANCH origin/$branch) origin/$BASE_BRANCH origin/$branch | grep -q "<<<<<"; then
    echo -e "${GREEN}  ✓ No conflicts detected${NC}"
    echo -e "${BLUE}  → Would merge $branch to $BASE_BRANCH${NC}"
    echo -e "${YELLOW}  ⚠ Note: Actual merge requires GitHub API access${NC}"
  else
    echo -e "${RED}  ✗ Merge conflicts detected - manual resolution required${NC}"
    return 1
  fi
  
  return 0
}

# Function to delete a branch
delete_branch() {
  local branch=$1
  
  echo -e "${YELLOW}Processing: $branch${NC}"
  
  if ! branch_exists "$branch"; then
    echo -e "${BLUE}  ✓ Branch does not exist (already deleted)${NC}"
    return 0
  fi
  
  if ! is_merged "$branch"; then
    echo -e "${RED}  ✗ Branch not merged - skipping deletion${NC}"
    return 1
  fi
  
  echo -e "${GREEN}  ✓ Branch is merged and can be deleted${NC}"
  echo -e "${BLUE}  → Would delete $branch${NC}"
  echo -e "${YELLOW}  ⚠ Note: Actual deletion requires GitHub API access${NC}"
  
  return 0
}

# Backup current state
echo -e "${BLUE}Step 1: Creating backup tag${NC}"
BACKUP_TAG="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
git tag "$BACKUP_TAG"
if git push origin "$BACKUP_TAG" 2>/dev/null; then
  echo -e "${GREEN}✓ Backup tag created: $BACKUP_TAG${NC}"
else
  echo -e "${YELLOW}⚠ Could not push backup tag (may require GitHub access)${NC}"
fi
echo ""

# Fetch all branches
echo -e "${BLUE}Step 2: Fetching latest branch information${NC}"
git fetch --all --prune
echo -e "${GREEN}✓ Fetch complete${NC}"
echo ""

# Process priority branches
echo -e "${BLUE}Step 3: Analyzing priority branches for merging${NC}"
echo -e "${BLUE}========================================${NC}"
MERGE_SUCCESS=0
MERGE_FAILED=0

for branch in "${PRIORITY_BRANCHES[@]}"; do
  if merge_branch "$branch"; then
    ((MERGE_SUCCESS++))
  else
    ((MERGE_FAILED++))
  fi
  echo ""
done

echo -e "${BLUE}Merge Summary:${NC}"
echo -e "  ${GREEN}✓ Ready to merge: $MERGE_SUCCESS${NC}"
echo -e "  ${RED}✗ Issues found: $MERGE_FAILED${NC}"
echo ""

# Process branches to delete
echo -e "${BLUE}Step 4: Analyzing branches for deletion${NC}"
echo -e "${BLUE}========================================${NC}"
DELETE_SUCCESS=0
DELETE_FAILED=0

for branch in "${BRANCHES_TO_DELETE[@]}"; do
  if delete_branch "$branch"; then
    ((DELETE_SUCCESS++))
  else
    ((DELETE_FAILED++))
  fi
  echo ""
done

echo -e "${BLUE}Deletion Summary:${NC}"
echo -e "  ${GREEN}✓ Ready to delete: $DELETE_SUCCESS${NC}"
echo -e "  ${RED}✗ Cannot delete: $DELETE_FAILED${NC}"
echo ""

# Generate GitHub CLI commands
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 5: Generated GitHub CLI Commands${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}To execute the actual merges and deletions, run:${NC}"
echo ""

# Generate merge commands
echo "# Merge priority branches"
for branch in "${PRIORITY_BRANCHES[@]}"; do
  if branch_exists "$branch" && ! is_merged "$branch"; then
    echo "gh pr create --repo $REPO --base $BASE_BRANCH --head $branch --title \"Merge: $branch\" --body \"Automated merge of priority branch\" && \\"
    echo "  gh pr merge --repo $REPO --merge --delete-branch $branch || true"
  fi
done
echo ""

# Generate delete commands
echo "# Delete obsolete branches"
for branch in "${BRANCHES_TO_DELETE[@]}"; do
  if branch_exists "$branch"; then
    echo "gh api -X DELETE repos/$REPO/git/refs/heads/$branch || true"
  fi
done
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Analysis Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the analysis output above"
echo "2. Copy and run the GitHub CLI commands if you have 'gh' configured"
echo "3. Alternatively, use the GitHub web interface to merge/delete branches"
echo "4. Verify the cleanup was successful with: git fetch --all --prune && git branch -r"
echo ""
echo -e "${BLUE}Backup tag: $BACKUP_TAG${NC}"
echo ""
