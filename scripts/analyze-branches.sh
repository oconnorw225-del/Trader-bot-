#!/bin/bash

# Branch Analysis Script
# Analyzes all branches to identify conflicts, duplicates, and stale branches
# This script should be run BEFORE creating PRs to understand what needs special handling

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REPO="oconnorw225-del/ndax-quantum-engine"
BASE_BRANCH="main"
REPORT_FILE=".github/branch-cleanup/analysis-report.md"

# Configuration
STALENESS_THRESHOLD_DAYS=30  # Branches older than this are considered stale

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

echo "========================================"
echo "Branch Analysis for Consolidation"
echo "Repository: $REPO"
echo "Base branch: $BASE_BRANCH"
echo "Total branches: ${#BRANCHES[@]}"
echo "========================================"
echo ""

# Fetch latest
echo "Fetching latest refs..."
git fetch origin
git fetch origin "$BASE_BRANCH"
echo ""

# Initialize report
cat > "$REPORT_FILE" <<EOF
# Branch Analysis Report

**Generated:** $(date +"%Y-%m-%d %H:%M:%S")
**Base Branch:** $BASE_BRANCH
**Total Branches Analyzed:** ${#BRANCHES[@]}

## Summary

This report analyzes each branch for:
- Merge conflicts with main
- Commit count and recency
- File changes
- Potential duplicates
- Staleness indicators

EOF

# Track statistics
total_conflicts=0
total_stale=0
total_active=0

echo -e "${BLUE}Analyzing branches...${NC}"
echo ""

# Analyze each branch
for branch in "${BRANCHES[@]}"; do
    echo -e "${YELLOW}Analyzing: $branch${NC}"
    
    # Check if branch exists
    if ! git rev-parse --verify "origin/$branch" > /dev/null 2>&1; then
        echo -e "${RED}  ✗ Branch does not exist${NC}"
        echo "### ❌ $branch" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "**Status:** Branch does not exist in remote" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        continue
    fi
    
    # Get branch info
    last_commit_date=$(git log -1 --format="%ci" "origin/$branch" 2>/dev/null || echo "unknown")
    last_commit_msg=$(git log -1 --format="%s" "origin/$branch" 2>/dev/null || echo "unknown")
    commit_count=$(git rev-list --count "origin/$BASE_BRANCH..origin/$branch" 2>/dev/null || echo "0")
    author=$(git log -1 --format="%an" "origin/$branch" 2>/dev/null || echo "unknown")
    
    # Check for conflicts (run merge-tree once and reuse result)
    has_conflicts=false
    conflict_files=""
    merge_base=$(git merge-base "origin/$BASE_BRANCH" "origin/$branch" 2>/dev/null || echo "origin/$BASE_BRANCH")
    merge_result=$(git merge-tree "$merge_base" "origin/$BASE_BRANCH" "origin/$branch" 2>/dev/null || echo "")
    
    if echo "$merge_result" | grep -q "<<<<<<< "; then
        conflict_status="⚠️ HAS CONFLICTS"
        has_conflicts=true
        ((total_conflicts++))
        conflict_files=$(echo "$merge_result" | grep -A1 "<<<<<<< " | head -10)
    else
        conflict_status="✅ No conflicts"
    fi
    
    # Check for staleness
    days_old=$(( ($(date +%s) - $(git log -1 --format="%at" "origin/$branch")) / 86400 ))
    if [ "$days_old" -gt "$STALENESS_THRESHOLD_DAYS" ]; then
        stale_status="⚠️ Stale ($days_old days old)"
        ((total_stale++))
    else
        stale_status="✅ Active ($days_old days old)"
        ((total_active++))
    fi
    
    # Get files changed
    files_changed=$(git diff --name-only "origin/$BASE_BRANCH...origin/$branch" 2>/dev/null | wc -l || echo "0")
    files_list=$(git diff --name-only "origin/$BASE_BRANCH...origin/$branch" 2>/dev/null | head -10 || echo "none")
    
    # Add to report
    cat >> "$REPORT_FILE" <<EOF
### $branch

**Conflict Status:** $conflict_status  
**Staleness:** $stale_status  
**Commits ahead:** $commit_count  
**Files changed:** $files_changed  
**Last commit:** $last_commit_date  
**Last commit message:** $last_commit_msg  
**Author:** $author

EOF

    if [ "$has_conflicts" = true ]; then
        echo "**Action Required:** Create fix branch: \`fix/${branch#copilot/}-merge\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "**Conflict preview:**" >> "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
        echo "$conflict_files" | head -10 >> "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
    fi
    
    if [ "$days_old" -gt 90 ]; then
        echo "**Recommendation:** Consider marking for deletion if no recent value" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
    
    # Console output
    echo "  Commits: $commit_count | Files: $files_changed | $conflict_status | $stale_status"
    echo ""
done

# Add summary statistics
cat >> "$REPORT_FILE" <<EOF

## Statistics

- **Total Branches:** ${#BRANCHES[@]}
- **Branches with Conflicts:** $total_conflicts
- **Stale Branches (>$STALENESS_THRESHOLD_DAYS days):** $total_stale
- **Active Branches (<$STALENESS_THRESHOLD_DAYS days):** $total_active

## Potential Duplicates

Based on branch names, the following pairs may be duplicates:
1. \`copilot/improve-variable-and-function-names\` and \`copilot/improve-variable-function-names\`
2. \`copilot/add-todo-list-application\` and \`copilot/add-todo-list-feature\`

**Action:** Compare these branches and consolidate into \`consolidate/*-merge\` branches if needed.

## Next Steps

1. **For branches with conflicts:** Create fix branches using \`fix/{branch-name}-merge\`
2. **For duplicates:** Create consolidation branches using \`consolidate/{feature-name}\`
3. **For stale branches:** Review and mark for deletion if no value
4. **For active branches:** Create PRs directly

EOF

echo "========================================"
echo "Analysis Complete!"
echo "  Branches analyzed: ${#BRANCHES[@]}"
echo "  With conflicts: $total_conflicts"
echo "  Stale (>30 days): $total_stale"
echo "  Active (<30 days): $total_active"
echo "========================================"
echo ""
echo "Report saved to: $REPORT_FILE"
echo ""
echo -e "${GREEN}Next step: Review $REPORT_FILE and create PRs${NC}"
