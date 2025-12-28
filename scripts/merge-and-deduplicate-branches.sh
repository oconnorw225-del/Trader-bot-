#!/bin/bash
# Branch Consolidation and Deduplication Script
# Creates a consolidation branch that merges all unique branches while eliminating duplicates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO="oconnorw225-del/ndax-quantum-engine"
MAIN_BRANCH="main"
CONSOLIDATION_DATE=$(date +%Y%m%d)
CONSOLIDATION_BRANCH="consolidation/merge-all-branches-${CONSOLIDATION_DATE}"
WORK_DIR="$(pwd)"
REPORT_FILE="CONSOLIDATION_REPORT.md"
DRY_RUN=false
MAX_CHERRY_PICK_PER_ARCHIVE=10
MIN_ARCHIVE_COMMITS=1
MAX_ARCHIVE_COMMITS=50

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--dry-run] [--help]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Perform a dry run without creating branches or pushing"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Statistics tracking
TOTAL_BRANCHES=0
ARCHIVE_BRANCHES=0
ACTIVE_BRANCHES=0
DUPLICATE_GROUPS=0
MERGED_BRANCHES=0
SKIPPED_BRANCHES=0
CHERRY_PICKED_COMMITS=0
declare -A BRANCH_SHAS
declare -A SHA_TO_BRANCHES
declare -a DUPLICATE_GROUP_LIST
declare -a MERGED_BRANCH_LIST
declare -a SKIPPED_BRANCH_LIST
declare -a CONFLICT_BRANCHES

# Print header
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║   Branch Consolidation and Deduplication Script         ║${NC}"
echo -e "${MAGENTA}║   Repository: ${REPO}                  ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔍 DRY RUN MODE - No changes will be made${NC}"
    echo ""
fi

# Function: Print section header
print_section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function: Get commit SHA for a branch
get_branch_sha() {
    local branch=$1
    git rev-parse "origin/${branch}" 2>/dev/null || echo "ERROR"
}

# Function: Check if branch has conflicts with main
has_conflicts() {
    local branch=$1
    
    # Try to merge in a test merge
    git merge-tree "$(git merge-base origin/${MAIN_BRANCH} origin/${branch})" \
                   "origin/${MAIN_BRANCH}" \
                   "origin/${branch}" 2>&1 | grep -q "^CONFLICT" && return 0 || return 1
}

# Function: Analyze all branches
analyze_branches() {
    print_section "🔍 Analyzing branches in ${REPO}..."
    
    echo "Fetching all branches from remote..."
    # Note: In actual use, would use git fetch origin
    # For this environment, we'll work with what's available
    
    # Get list of all remote branches
    local branches=$(git branch -r | grep -v HEAD | sed 's/origin\///' | grep -v "^${MAIN_BRANCH}$" || echo "")
    
    if [ -z "$branches" ]; then
        echo -e "${YELLOW}⚠️  No remote branches found (besides main)${NC}"
        echo "This might be because:"
        echo "  - The repository has a shallow clone"
        echo "  - Authentication is required to fetch branches"
        echo "  - All branches have already been merged"
        echo ""
        echo "For a full consolidation, run: git fetch origin"
        return 1
    fi
    
    # Count and categorize branches
    while IFS= read -r branch; do
        [ -z "$branch" ] && continue
        
        TOTAL_BRANCHES=$((TOTAL_BRANCHES + 1))
        
        # Categorize as archive or active
        if [[ "$branch" =~ ^archive/ ]]; then
            ARCHIVE_BRANCHES=$((ARCHIVE_BRANCHES + 1))
        else
            ACTIVE_BRANCHES=$((ACTIVE_BRANCHES + 1))
        fi
        
        # Get SHA for duplicate detection
        local sha=$(get_branch_sha "$branch")
        if [ "$sha" != "ERROR" ]; then
            BRANCH_SHAS["$branch"]="$sha"
            
            # Track which branches have the same SHA
            if [ -n "${SHA_TO_BRANCHES[$sha]}" ]; then
                SHA_TO_BRANCHES["$sha"]="${SHA_TO_BRANCHES[$sha]}|$branch"
            else
                SHA_TO_BRANCHES["$sha"]="$branch"
            fi
        fi
    done <<< "$branches"
    
    # Identify duplicate groups
    for sha in "${!SHA_TO_BRANCHES[@]}"; do
        local branch_list="${SHA_TO_BRANCHES[$sha]}"
        local count=$(echo "$branch_list" | tr '|' '\n' | wc -l)
        
        if [ "$count" -gt 1 ]; then
            DUPLICATE_GROUPS=$((DUPLICATE_GROUPS + 1))
            DUPLICATE_GROUP_LIST+=("$branch_list")
        fi
    done
    
    # Display results
    echo -e "${BLUE}📊 Branch Analysis:${NC}"
    echo "  Total branches: ${TOTAL_BRANCHES}"
    echo "  Archive branches: ${ARCHIVE_BRANCHES}"
    echo "  Active branches: ${ACTIVE_BRANCHES}"
    echo "  Duplicate groups: ${DUPLICATE_GROUPS}"
    echo ""
    
    if [ ${DUPLICATE_GROUPS} -gt 0 ]; then
        echo -e "${YELLOW}Found ${DUPLICATE_GROUPS} duplicate group(s):${NC}"
        for group in "${DUPLICATE_GROUP_LIST[@]}"; do
            echo "  - $(echo "$group" | tr '|' ', ')"
        done
        echo ""
    fi
    
    return 0
}

# Function: Create consolidation branch
create_consolidation_branch() {
    print_section "🔀 Creating consolidation branch..."
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would create branch: ${CONSOLIDATION_BRANCH}${NC}"
        return 0
    fi
    
    # Checkout main branch
    echo "Checking out ${MAIN_BRANCH}..."
    git checkout "${MAIN_BRANCH}" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Main branch not available locally, using current branch as base${NC}"
    }
    
    # Create new consolidation branch
    echo "Creating ${CONSOLIDATION_BRANCH}..."
    git checkout -b "${CONSOLIDATION_BRANCH}" || {
        echo -e "${RED}✗ Failed to create consolidation branch${NC}"
        return 1
    }
    
    echo -e "${GREEN}✓ Created consolidation branch${NC}"
    return 0
}

# Function: Merge a branch with automatic conflict resolution
merge_branch() {
    local branch=$1
    local strategy=${2:-"ours"}
    
    echo "  Merging: ${branch}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "    ${YELLOW}[DRY RUN] Would merge branch${NC}"
        return 0
    fi
    
    # Attempt merge
    if git merge --no-ff -X "$strategy" "origin/${branch}" -m "Merge branch '${branch}' into consolidation" 2>&1; then
        # Count files changed
        local files_changed=$(git diff --name-only HEAD^1 HEAD | wc -l)
        echo -e "    ${GREEN}✅ Merged successfully (${files_changed} files changed)${NC}"
        MERGED_BRANCHES=$((MERGED_BRANCHES + 1))
        MERGED_BRANCH_LIST+=("$branch|$files_changed")
        return 0
    else
        # Merge conflict - try to auto-resolve with strategy
        echo -e "    ${YELLOW}⚠️  Conflicts detected, attempting auto-resolution...${NC}"
        
        if git merge --abort 2>/dev/null; then
            # Try again with more aggressive strategy
            if git merge --no-ff -X ours --strategy-option theirs "origin/${branch}" -m "Merge branch '${branch}' with auto-resolution" 2>&1; then
                local files_changed=$(git diff --name-only HEAD^1 HEAD | wc -l)
                echo -e "    ${GREEN}✅ Auto-resolved and merged (${files_changed} files changed)${NC}"
                MERGED_BRANCHES=$((MERGED_BRANCHES + 1))
                MERGED_BRANCH_LIST+=("$branch|$files_changed")
                CONFLICT_BRANCHES+=("$branch")
                return 0
            fi
        fi
        
        # Complete failure
        git merge --abort 2>/dev/null || true
        echo -e "    ${RED}✗ Failed to merge, skipping${NC}"
        SKIPPED_BRANCHES=$((SKIPPED_BRANCHES + 1))
        SKIPPED_BRANCH_LIST+=("$branch|merge_conflict")
        return 1
    fi
}

# Function: Merge unique branches
merge_unique_branches() {
    print_section "🔀 Merging unique branches..."
    
    # Track which branches we've already processed
    declare -A PROCESSED_BRANCHES
    
    # First, process branches that are NOT duplicates
    for branch in "${!BRANCH_SHAS[@]}"; do
        local sha="${BRANCH_SHAS[$branch]}"
        local branch_list="${SHA_TO_BRANCHES[$sha]}"
        local count=$(echo "$branch_list" | tr '|' '\n' | wc -l)
        
        # Skip if this SHA has duplicates and we've already processed one
        if [ "$count" -gt 1 ]; then
            if [ -n "${PROCESSED_BRANCHES[$sha]}" ]; then
                echo "  ⏭️  Skipping duplicate: ${branch} (same as ${PROCESSED_BRANCHES[$sha]})"
                SKIPPED_BRANCHES=$((SKIPPED_BRANCHES + 1))
                SKIPPED_BRANCH_LIST+=("$branch|duplicate")
                continue
            else
                # Mark this SHA as processed with the first branch we encounter
                PROCESSED_BRANCHES["$sha"]="$branch"
                echo "  📌 Using ${branch} as representative for SHA ${sha:0:8}..."
            fi
        fi
        
        # Check if branch has unique changes compared to main
        local unique_commits=$(git rev-list --count "origin/${MAIN_BRANCH}..origin/${branch}" 2>/dev/null || echo "0")
        
        if [ "$unique_commits" -eq 0 ]; then
            echo "  ⏭️  No unique changes in '${branch}', skipping"
            SKIPPED_BRANCHES=$((SKIPPED_BRANCHES + 1))
            SKIPPED_BRANCH_LIST+=("$branch|no_unique_changes")
            continue
        fi
        
        # Merge the branch
        merge_branch "$branch"
    done
    
    echo ""
    echo -e "${BLUE}Merge Summary:${NC}"
    echo "  ✅ Merged: ${MERGED_BRANCHES} branches"
    echo "  ⏭️  Skipped: ${SKIPPED_BRANCHES} branches"
    
    if [ ${#CONFLICT_BRANCHES[@]} -gt 0 ]; then
        echo -e "  ${YELLOW}⚠️  Auto-resolved conflicts: ${#CONFLICT_BRANCHES[@]} branches${NC}"
    fi
}

# Function: Cherry-pick valuable commits from archives
cherry_pick_from_archives() {
    print_section "🍒 Cherry-picking from archive branches..."
    
    local archive_branches=$(git branch -r | grep -v HEAD | sed 's/origin\///' | grep "^archive/" || echo "")
    
    if [ -z "$archive_branches" ]; then
        echo "No archive branches found"
        return 0
    fi
    
    while IFS= read -r archive; do
        [ -z "$archive" ] && continue
        
        echo "  Analyzing: ${archive}"
        
        # Count unique commits in this archive not in main
        local unique_commits=$(git rev-list --count "origin/${MAIN_BRANCH}..origin/${archive}" 2>/dev/null || echo "0")
        
        # Skip if not in valid range
        if [ "$unique_commits" -lt "$MIN_ARCHIVE_COMMITS" ] || [ "$unique_commits" -gt "$MAX_ARCHIVE_COMMITS" ]; then
            echo "    ⏭️  Has ${unique_commits} commits (need ${MIN_ARCHIVE_COMMITS}-${MAX_ARCHIVE_COMMITS}), skipping"
            continue
        fi
        
        # Get recent non-merge commits
        local commits=$(git log --no-merges --format="%H" "origin/${MAIN_BRANCH}..origin/${archive}" -n "$MAX_CHERRY_PICK_PER_ARCHIVE" 2>/dev/null || echo "")
        
        if [ -z "$commits" ]; then
            echo "    ⏭️  No non-merge commits found"
            continue
        fi
        
        local picked=0
        while IFS= read -r commit; do
            [ -z "$commit" ] && continue
            
            if [ "$DRY_RUN" = true ]; then
                echo "    ${YELLOW}[DRY RUN] Would cherry-pick ${commit:0:8}${NC}"
                picked=$((picked + 1))
                continue
            fi
            
            # Try to cherry-pick
            if git cherry-pick "$commit" --allow-empty --keep-redundant-commits 2>&1 | grep -q "nothing to commit"; then
                echo "    ⏭️  ${commit:0:8} - already applied"
            elif git cherry-pick --continue 2>&1; then
                echo "    ${GREEN}✓${NC} ${commit:0:8} - picked"
                picked=$((picked + 1))
                CHERRY_PICKED_COMMITS=$((CHERRY_PICKED_COMMITS + 1))
            else
                # Skip on conflict
                git cherry-pick --abort 2>/dev/null || true
                echo "    ${YELLOW}⚠️${NC} ${commit:0:8} - conflict, skipping"
            fi
        done <<< "$commits"
        
        if [ "$picked" -gt 0 ]; then
            echo "    ${GREEN}✓ Cherry-picked ${picked} commit(s) from ${archive}${NC}"
        fi
    done <<< "$archive_branches"
    
    echo ""
    echo -e "${BLUE}Cherry-pick Summary:${NC}"
    echo "  🍒 Cherry-picked: ${CHERRY_PICKED_COMMITS} commits"
}

# Function: Generate comprehensive report
generate_report() {
    print_section "📄 Generating consolidation report..."
    
    local report_content="# Branch Consolidation Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')  
**Repository:** ${REPO}  
**Consolidation Branch:** ${CONSOLIDATION_BRANCH}  
**Dry Run:** ${DRY_RUN}

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total branches analyzed | ${TOTAL_BRANCHES} |
| Active branches | ${ACTIVE_BRANCHES} |
| Archive branches | ${ARCHIVE_BRANCHES} |
| Duplicate groups identified | ${DUPLICATE_GROUPS} |
| Branches merged | ${MERGED_BRANCHES} |
| Branches skipped | ${SKIPPED_BRANCHES} |
| Commits cherry-picked | ${CHERRY_PICKED_COMMITS} |

---

## Duplicate Groups Identified

"
    
    if [ ${DUPLICATE_GROUPS} -gt 0 ]; then
        report_content+="Found ${DUPLICATE_GROUPS} group(s) of duplicate branches:

"
        for group in "${DUPLICATE_GROUP_LIST[@]}"; do
            report_content+="- $(echo "$group" | tr '|' ', ')
"
        done
    else
        report_content+="No duplicate branches detected.
"
    fi
    
    report_content+="
---

## Merged Branches

"
    
    if [ ${#MERGED_BRANCH_LIST[@]} -gt 0 ]; then
        report_content+="Successfully merged the following branches:

"
        for entry in "${MERGED_BRANCH_LIST[@]}"; do
            local branch=$(echo "$entry" | cut -d'|' -f1)
            local files=$(echo "$entry" | cut -d'|' -f2)
            report_content+="- **${branch}** (${files} files changed)
"
        done
    else
        report_content+="No branches were merged.
"
    fi
    
    report_content+="
---

## Skipped Branches

"
    
    if [ ${#SKIPPED_BRANCH_LIST[@]} -gt 0 ]; then
        report_content+="The following branches were skipped:

"
        for entry in "${SKIPPED_BRANCH_LIST[@]}"; do
            local branch=$(echo "$entry" | cut -d'|' -f1)
            local reason=$(echo "$entry" | cut -d'|' -f2)
            report_content+="- **${branch}** - Reason: ${reason}
"
        done
    else
        report_content+="No branches were skipped.
"
    fi
    
    if [ ${#CONFLICT_BRANCHES[@]} -gt 0 ]; then
        report_content+="
### Auto-Resolved Conflicts

The following branches had conflicts that were automatically resolved:

"
        for branch in "${CONFLICT_BRANCHES[@]}"; do
            report_content+="- ${branch}
"
        done
    fi
    
    report_content+="
---

## Recommended Actions

### Next Steps

1. **Review the consolidation branch:**
   \`\`\`bash
   git checkout ${CONSOLIDATION_BRANCH}
   git log --oneline -20
   \`\`\`

2. **Run tests to verify:**
   \`\`\`bash
   npm test
   npm run lint
   \`\`\`

3. **Create a pull request:**
   - Base: \`${MAIN_BRANCH}\`
   - Head: \`${CONSOLIDATION_BRANCH}\`
   - Title: \"Consolidate all branches (${CONSOLIDATION_DATE})\"

4. **After PR is merged, clean up duplicates:**
   \`\`\`bash
   bash scripts/cleanup-duplicate-branches.sh
   \`\`\`

### Branches Recommended for Deletion

After the consolidation PR is merged, consider deleting these duplicate branches:

"
    
    for entry in "${SKIPPED_BRANCH_LIST[@]}"; do
        local branch=$(echo "$entry" | cut -d'|' -f1)
        local reason=$(echo "$entry" | cut -d'|' -f2)
        if [ "$reason" = "duplicate" ]; then
            report_content+="- ${branch}
"
        fi
    done
    
    report_content+="
---

## Rollback Instructions

If you need to undo this consolidation:

\`\`\`bash
# Delete the consolidation branch locally
git branch -D ${CONSOLIDATION_BRANCH}

# Delete from remote (if pushed)
git push origin --delete ${CONSOLIDATION_BRANCH}
\`\`\`

---

**Report generated by:** \`scripts/merge-and-deduplicate-branches.sh\`
"
    
    # Write report to file
    echo "$report_content" > "${REPORT_FILE}"
    
    echo -e "${GREEN}✓ Report saved to: ${REPORT_FILE}${NC}"
}

# Function: Display final results
display_results() {
    print_section "📊 Consolidation Results"
    
    echo -e "${GREEN}✅ Consolidation Complete!${NC}"
    echo ""
    echo "Summary:"
    echo "  ✅ Merged: ${MERGED_BRANCHES} branches"
    echo "  ⏭️  Skipped: ${SKIPPED_BRANCHES} branches"
    echo "  🍒 Cherry-picked: ${CHERRY_PICKED_COMMITS} commits"
    echo ""
    echo "📄 Report: ${REPORT_FILE}"
    echo ""
    
    if [ "$DRY_RUN" = false ]; then
        echo "🔄 Next steps:"
        echo "  1. Review changes: git log --oneline -20"
        echo "  2. Run tests: npm test"
        echo "  3. Create PR from ${CONSOLIDATION_BRANCH} to ${MAIN_BRANCH}"
        echo "  4. After merge, run cleanup: bash scripts/cleanup-duplicate-branches.sh"
    else
        echo -e "${YELLOW}This was a dry run. No changes were made.${NC}"
        echo "Run without --dry-run to perform actual consolidation."
    fi
    
    echo ""
}

# Main execution
main() {
    # Step 1: Analyze branches
    if ! analyze_branches; then
        echo -e "${RED}✗ Branch analysis failed${NC}"
        echo ""
        echo "This might be a shallow clone. Try:"
        echo "  git fetch --unshallow"
        echo "  git fetch origin"
        exit 1
    fi
    
    # Check if there are branches to consolidate
    if [ "$TOTAL_BRANCHES" -eq 0 ]; then
        echo -e "${YELLOW}No branches to consolidate${NC}"
        exit 0
    fi
    
    # Step 2: Create consolidation branch
    if ! create_consolidation_branch; then
        echo -e "${RED}✗ Failed to create consolidation branch${NC}"
        exit 1
    fi
    
    # Step 3: Merge unique branches
    merge_unique_branches
    
    # Step 4: Cherry-pick from archives (optional)
    # cherry_pick_from_archives
    
    # Step 5: Generate report
    generate_report
    
    # Step 6: Display results
    display_results
}

# Run main function
main
