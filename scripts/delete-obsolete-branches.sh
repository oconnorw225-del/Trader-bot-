#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Delete Obsolete Branches Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Category 1: Duplicate branches
DUPLICATES=(
  "copilot/improve-variable-and-function-names"
  "copilot/improve-variable-function-names"
  "copilot/add-todo-list-application"
)

# Category 2: Setup branches (already applied)
SETUP_BRANCHES=(
  "copilot/setup-copilot-instructions"
  "copilot/setup-copilot-instructions-again"
  "copilot/setup-copilot-instructions-another-one"
  "copilot/rebase-copilot-instructions-branch"
)

# Category 3: Completed work
COMPLETED=(
  "copilot/add-wallet-for-bots"
  "copilot/finish-original-issue"
  "copilot/fix-copilot-access-issue"
  "copilot/fix-copilot-review-issue"
  "copilot/fix-copilot-review-issue-again"
  "copilot/fix-failjob-async-await-issue"
  "copilot/fix-pull-request-comments"
  "copilot/resolve-get-it-done-issue"
  "copilot/resolve-pull-request-overview-issues"
  "copilot/status-report"
)

# Category 4: Configuration (no longer needed)
CONFIG=(
  "copilot/remove-all-duplicates"
  "copilot/remove-fork-invitation"
  "copilot/remove-forking-allowance"
  "copilot/update-forking-to-false"
  "copilot/revoke-vlones-access"
)

# Category 5: Autopilot fix branches (generated from errors)
AUTOPILOT_FIXES=(
  "autopilot/fix-copilot_fix-ci-cd-workflow-issues-20251222093123"
  "autopilot/fix-copilot_fix-copilot-access-issue-20251222093114"
  "autopilot/fix-copilot_fix-copilot-access-issue-20251222093126"
  "autopilot/fix-copilot_fix-ndax-quantum-engine-issues-20251222093122"
  "autopilot/fix-copilot_fix-ndax-quantum-engine-issues-20251222093131"
  "autopilot/fix-copilot_fix-pull-request-comments-20251222093124"
  "autopilot/fix-copilot_fix-pull-request-comments-20251222093134"
  "autopilot/fix-copilot_fix-workflow-in-main-yml-20251222093126"
  "autopilot/fix-copilot_fix-workflow-in-main-yml-20251222093135"
  "autopilot/fix-copilot_implement-code-drops-integration-20251222093127"
  "autopilot/fix-copilot_implement-code-drops-integration-20251222093136"
  "autopilot/fix-copilot_improve-variable-function-names-20251222093132"
  "autopilot/fix-copilot_improve-variable-function-names-20251222093139"
  "autopilot/fix-copilot_push-newest-branches-to-main-20251222093142"
  "autopilot/fix-copilot_push-newest-branches-to-main-20251222093147"
  "autopilot/fix-copilot_remove-all-duplicates-20251222093147"
  "autopilot/fix-copilot_remove-all-duplicates-20251222093150"
  "autopilot/fix-copilot_remove-fork-invitation-20251222093149"
  "autopilot/fix-copilot_remove-fork-invitation-20251222093152"
  "autopilot/fix-copilot_repair-readme-merge-conflict-20251222093154"
  "autopilot/fix-copilot_repair-readme-merge-conflict-20251222093156"
  "autopilot/fix-copilot_resolve-get-it-done-issue-20251222093158"
  "autopilot/fix-copilot_revoke-vlones-access-20251222093201"
  "autopilot/fix-copilot_setup-copilot-instructions-again-20251222093204"
  "autopilot/fix-copilot_setup-react-dashboard-railway-20251222093206"
  "autopilot/fix-copilot_update-service-configuration-20251222093211"
  "autopilot/fix-feature_auto-start-system-20251222093215"
  "autopilot/fix-fix_lint-and-tests-20251222093218"
)

# Additional branches to consider for deletion
ADDITIONAL=(
  "copilot/clean-up-branches-and-push"
  "copilot/numerous-pigeon"
  "copilot/run-command-in-terminal"
  "copilot/remove-btc-return-functionality"
  "copilot/send-btc-back-to-original-account"
  "copilot/transfer-all-btc-back-account"
)

# Function to check if branch exists
branch_exists() {
  git ls-remote --heads origin "$1" 2>/dev/null | grep -q "$1"
}

# Function to generate delete commands
generate_delete_commands() {
  local category=$1
  shift
  local branches=("$@")
  
  echo -e "${BLUE}## $category${NC}"
  echo ""
  
  local count=0
  local existing=0
  
  for branch in "${branches[@]}"; do
    ((count++))
    if branch_exists "$branch"; then
      ((existing++))
      echo "gh api -X DELETE repos/oconnorw225-del/Trader-bot-/git/refs/heads/$branch"
    fi
  done
  
  echo -e "${YELLOW}# $category: $existing/$count branches exist${NC}"
  echo ""
}

# Fetch latest
echo -e "${YELLOW}Fetching latest branch information...${NC}"
git fetch --all --prune >/dev/null 2>&1
echo -e "${GREEN}✓ Fetch complete${NC}"
echo ""

# Count existing branches
TOTAL_REMOTE=$(git ls-remote --heads origin | wc -l)
echo -e "${BLUE}Total remote branches: $TOTAL_REMOTE${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Generated Deletion Commands${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo "#!/bin/bash"
echo "# Branch deletion commands"
echo "# Generated on: $(date)"
echo "# Run this script with: bash delete-commands.sh"
echo ""

generate_delete_commands "Duplicate Branches" "${DUPLICATES[@]}"
generate_delete_commands "Setup Branches (Already Applied)" "${SETUP_BRANCHES[@]}"
generate_delete_commands "Completed Work Branches" "${COMPLETED[@]}"
generate_delete_commands "Configuration Branches" "${CONFIG[@]}"
generate_delete_commands "Autopilot Fix Branches" "${AUTOPILOT_FIXES[@]}"
generate_delete_commands "Additional Cleanup" "${ADDITIONAL[@]}"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Command Generation Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Summary
TOTAL_TO_DELETE=$((${#DUPLICATES[@]} + ${#SETUP_BRANCHES[@]} + ${#COMPLETED[@]} + ${#CONFIG[@]} + ${#AUTOPILOT_FIXES[@]} + ${#ADDITIONAL[@]}))

echo -e "${YELLOW}Summary:${NC}"
echo "  Total branches identified for deletion: $TOTAL_TO_DELETE"
echo "  Current remote branches: $TOTAL_REMOTE"
echo ""
echo -e "${YELLOW}To execute the deletions:${NC}"
echo "  1. Save the output to a file: ./scripts/delete-obsolete-branches.sh > delete-commands.sh"
echo "  2. Review the commands: cat delete-commands.sh"
echo "  3. Execute: bash delete-commands.sh"
echo ""
echo -e "${YELLOW}Or copy the commands above and run them individually${NC}"
echo ""
