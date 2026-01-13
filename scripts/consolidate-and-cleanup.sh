#!/bin/bash
set -e

# Enhanced Branch Cleanup and Merge Script
# DELETION FUNCTIONALITY DISABLED - This script has been disabled to prevent accidental data loss
# This script consolidates valuable branches to main and removes obsolete branches

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

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Branch Consolidation & Cleanup Utility${NC}"
echo -e "${BLUE}  NDAX Quantum Engine Repository${NC}"
echo -e "${BLUE}============================================${NC}"
echo

# Parse command line arguments
DRY_RUN=true
MERGE_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --execute)
            DRY_RUN=false
            shift
            ;;
        --merge)
            MERGE_MODE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo
            echo "Options:"
            echo "  --execute    Execute changes (default is dry-run)"
            echo "  --merge      Also merge valuable branches to main"
            echo "  --help       Show this help message"
            echo
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}=== DRY RUN MODE ===${NC}"
    echo -e "${YELLOW}No changes will be made. Use --execute to apply changes.${NC}"
    echo
fi

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}Warning: GitHub CLI (gh) not installed${NC}"
    echo -e "${YELLOW}Install from: https://cli.github.com/${NC}"
    echo
    HAVE_GH=false
else
    HAVE_GH=true
    if ! gh auth status &> /dev/null 2>&1; then
        echo -e "${YELLOW}Warning: Not authenticated with GitHub${NC}"
        echo -e "${YELLOW}Run: gh auth login${NC}"
        echo
        HAVE_GH=false
    else
        echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
        echo
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} $CURRENT_BRANCH"
echo

# Function to delete remote branch
delete_remote_branch() {
    local branch=$1
    local reason=$2
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would delete: ${branch}"
        echo -e "  ${YELLOW}Reason:${NC} ${reason}"
    else
        echo -e "${BLUE}Deleting:${NC} ${branch}"
        echo -e "  ${BLUE}Reason:${NC} ${reason}"
        
        if [ "$HAVE_GH" = true ]; then
            if gh api -X DELETE "repos/:owner/:repo/git/refs/heads/$branch" 2>/dev/null; then
                echo -e "${GREEN}  ✓ Deleted${NC}"
            else
                echo -e "${RED}  ✗ Failed${NC}"
            fi
        else
            echo -e "${YELLOW}  Use: git push origin --delete $branch${NC}"
        fi
    fi
    echo
}

# Function to merge branch to main
merge_to_main() {
    local branch=$1
    local description=$2
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN]${NC} Would merge: ${branch}"
        echo -e "  ${YELLOW}Description:${NC} ${description}"
    else
        echo -e "${BLUE}Merging:${NC} ${branch} → main"
        echo -e "  ${BLUE}Description:${NC} ${description}"
        
        # Check if branch exists
        if ! git ls-remote --heads origin | grep -q "refs/heads/$branch"; then
            echo -e "${RED}  ✗ Branch not found${NC}"
            return 1
        fi
        
        # Create PR if gh is available
        if [ "$HAVE_GH" = true ]; then
            PR_URL=$(gh pr create \
                --base main \
                --head "$branch" \
                --title "Merge: $branch" \
                --body "$description" \
                2>&1) || {
                echo -e "${YELLOW}  PR may already exist or failed to create${NC}"
                return 0
            }
            echo -e "${GREEN}  ✓ PR created: $PR_URL${NC}"
        else
            echo -e "${YELLOW}  Manual: Create PR from $branch to main${NC}"
        fi
    fi
    echo
}

#==============================================================================
# PHASE 1: Delete Autopilot Branches (30+)
#==============================================================================

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PHASE 1: Autopilot Branches Cleanup  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

AUTOPILOT_COUNT=0
while IFS= read -r ref; do
    [ -z "$ref" ] && continue
    branch=$(echo "$ref" | awk '{print $2}' | sed 's|refs/heads/||')
    delete_remote_branch "$branch" "Automated fix attempt - obsolete"
    ((AUTOPILOT_COUNT++))
done < <(git ls-remote --heads origin | grep 'refs/heads/autopilot/fix-' || echo "")

echo -e "${GREEN}Autopilot branches to remove: $AUTOPILOT_COUNT${NC}"
echo

#==============================================================================
# PHASE 2: Delete Duplicate Branches
#==============================================================================

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PHASE 2: Duplicate Branches Cleanup  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

# Duplicate setup instructions (keep most specific one)
delete_remote_branch "copilot/setup-copilot-instructions-again" "Duplicate setup branch"
delete_remote_branch "copilot/setup-copilot-instructions-another-one" "Duplicate setup branch"

# Duplicate variable naming (keep shorter name)
delete_remote_branch "copilot/improve-variable-and-function-names" "Duplicate variable naming branch"

# Duplicate todo (keep more specific name)
delete_remote_branch "copilot/add-todo-list-application" "Duplicate todo branch"

# Duplicate CI/CD fix (keep more specific name)
delete_remote_branch "copilot/fix-ci-cd-issues" "Duplicate CI/CD fix branch"

# Duplicate copilot review (keep base one)
delete_remote_branch "copilot/fix-copilot-review-issue-again" "Duplicate review fix branch"

#==============================================================================
# PHASE 3: Delete Obsolete Feature Branches
#==============================================================================

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PHASE 3: Obsolete Features Cleanup   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

# BTC transfer functionality (not needed)
delete_remote_branch "copilot/remove-btc-return-functionality" "Obsolete BTC feature"
delete_remote_branch "copilot/send-btc-back-to-original-account" "Obsolete BTC feature"
delete_remote_branch "copilot/transfer-all-btc-back-account" "Obsolete BTC feature"

# Fork management (not needed)
delete_remote_branch "copilot/remove-fork-invitation" "Obsolete fork feature"
delete_remote_branch "copilot/remove-forking-allowance" "Obsolete fork feature"
delete_remote_branch "copilot/update-forking-to-false" "Obsolete fork feature"

# Old consolidation/cleanup branches (superseded by this script)
delete_remote_branch "copilot/consolidate-branches-script" "Superseded by current cleanup"
delete_remote_branch "copilot/featuresafe-bulk-cleanup" "Superseded by current cleanup"
delete_remote_branch "copilot/remove-all-duplicates" "Superseded by current cleanup"

# Specific issue fixes (already resolved)
delete_remote_branch "copilot/repair-readme-merge-conflict" "Issue already resolved"
delete_remote_branch "copilot/resolve-get-it-done-issue" "Issue already resolved"
delete_remote_branch "copilot/resolve-pull-request-overview-issues" "Issue already resolved"
delete_remote_branch "copilot/fix-repository-functionality" "Issue already resolved"
delete_remote_branch "copilot/fix-pull-request-comments" "Issue already resolved"
delete_remote_branch "copilot/fix-failjob-async-await-issue" "Issue already resolved"

# Status/reporting branches (no longer needed)
delete_remote_branch "copilot/status-report" "Status branch - no longer needed"

#==============================================================================
# PHASE 4: Merge Valuable Feature Branches (if --merge specified)
#==============================================================================

if [ "$MERGE_MODE" = true ]; then
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  PHASE 4: Merge Valuable Branches     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo
    
    # High priority merges
    merge_to_main "feature/autonomous-job-automation-complete" "Complete autonomous job automation system"
    merge_to_main "feature/auto-start-system" "Auto-start system for daemon-style operation"
    merge_to_main "fix/lint-and-tests" "Linting and testing improvements"
    
    # Feature additions
    merge_to_main "copilot/add-autostart-system-features" "Enhanced auto-start features"
    merge_to_main "copilot/add-todo-list-feature" "Task management system"
    merge_to_main "copilot/add-trade-history-functionality" "Trade history tracking"
    merge_to_main "copilot/add-wallet-for-bots" "Bot wallet integration"
    merge_to_main "copilot/add-paper-mode-configuration" "Paper trading mode"
    merge_to_main "copilot/add-risk-configurations" "Risk management configuration"
    merge_to_main "copilot/add-ndax-api-credentials" "NDAX API credential management"
    
    # Configuration improvements
    merge_to_main "copilot/configure-copilot-instructions" "Copilot instructions configuration"
    merge_to_main "copilot/configure-dashboard-display" "Dashboard display configuration"
    merge_to_main "copilot/consolidate-mobile-styles" "Mobile UI improvements"
    
    # Platform integrations
    merge_to_main "copilot/redo-dispatch-platforms" "Platform dispatch refactor"
    merge_to_main "copilot/implement-code-drops-integration" "Code drops integration"
    merge_to_main "copilot/implement-full-stack-dashboard" "Full-stack dashboard"
    
    # Deployment
    merge_to_main "copilot/deploy-ndax-quantum-engine" "NDAX Quantum Engine deployment"
    merge_to_main "copilot/activate-all-features-railway" "Railway deployment activation"
    merge_to_main "copilot/setup-react-dashboard-railway" "Railway dashboard setup"
    
    # Security & maintenance
    merge_to_main "copilot/fix-api-key-management" "API key management improvements"
    merge_to_main "copilot/revoke-vlones-access" "Security: revoke unnecessary access"
    
    # Workflow improvements
    merge_to_main "copilot/fix-ci-cd-workflow-issues" "CI/CD workflow fixes"
    merge_to_main "copilot/fix-workflow-in-main-yml" "Main workflow configuration"
    merge_to_main "copilot/add-branch-audit-workflow" "Branch audit automation"
    
    # Code quality
    merge_to_main "copilot/improve-variable-function-names" "Code quality: variable naming"
    
    # Other improvements
    merge_to_main "copilot/update-service-configuration" "Service configuration updates"
    merge_to_main "copilot/update-ndax-wallet-analysis" "NDAX wallet analysis"
    merge_to_main "implement-dashboard-controller" "Dashboard controller implementation"
fi

#==============================================================================
# SUMMARY
#==============================================================================

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Cleanup Summary               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}✓ Dry run completed - no changes made${NC}"
    echo -e "${YELLOW}✓ Run with --execute to apply changes${NC}"
    echo -e "${YELLOW}✓ Add --merge to also merge valuable branches${NC}"
else
    echo -e "${GREEN}✓ Branch cleanup executed${NC}"
    if [ "$MERGE_MODE" = true ]; then
        echo -e "${GREEN}✓ Valuable branches merged to main${NC}"
    fi
fi

echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run: git fetch --prune (clean local references)"
echo "2. Review remaining branches: git branch -r"
echo "3. Update documentation with new branch status"
echo "4. Tag new version if significant changes merged"
echo

exit 0
