#!/bin/bash
# Cleanup Duplicate Branches Script
# IMPORTANT: Only run this AFTER the consolidation branch has been merged to main

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
REPO="oconnorw225-del/ndax-quantum-engine"
CONSOLIDATION_REPORT="CONSOLIDATION_REPORT.md"
ARCHIVE_AGE_DAYS=90  # Delete archives older than 3 months
DRY_RUN=false
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--dry-run] [--force] [--help]"
            echo ""
            echo "Cleanup duplicate branches after consolidation has been merged."
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be deleted without actually deleting"
            echo "  --force      Skip confirmation prompts (use with caution!)"
            echo "  --help       Show this help message"
            echo ""
            echo "IMPORTANT: Only run this after the consolidation PR has been merged!"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Statistics
DELETED_DUPLICATES=0
DELETED_ARCHIVES=0
SKIPPED_BRANCHES=0

# Print header
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║   Branch Cleanup Script - Delete Duplicates & Archives  ║${NC}"
echo -e "${MAGENTA}║   Repository: ${REPO}                  ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔍 DRY RUN MODE - No branches will be deleted${NC}"
    echo ""
fi

# Safety check: Ensure we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ ERROR: Must run from repository root${NC}"
    exit 1
fi

# Safety check: Warn if consolidation report doesn't exist
if [ ! -f "$CONSOLIDATION_REPORT" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Consolidation report not found!${NC}"
    echo ""
    echo "The report file '${CONSOLIDATION_REPORT}' does not exist."
    echo "This usually means the consolidation script hasn't been run yet."
    echo ""
    
    if [ "$FORCE" = false ]; then
        read -p "Do you want to continue anyway? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo "Cancelled"
            exit 0
        fi
    fi
else
    echo -e "${GREEN}✓ Found consolidation report: ${CONSOLIDATION_REPORT}${NC}"
fi

# Safety check: Confirm consolidation has been merged
echo ""
echo -e "${YELLOW}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║                    ⚠️  WARNING ⚠️                      ║${NC}"
echo -e "${YELLOW}║                                                       ║${NC}"
echo -e "${YELLOW}║  This script will DELETE branches permanently!       ║${NC}"
echo -e "${YELLOW}║                                                       ║${NC}"
echo -e "${YELLOW}║  Only proceed if:                                     ║${NC}"
echo -e "${YELLOW}║  1. The consolidation PR has been merged to main     ║${NC}"
echo -e "${YELLOW}║  2. Tests are passing on main                        ║${NC}"
echo -e "${YELLOW}║  3. You have reviewed which branches will be deleted ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$FORCE" = false ]; then
    read -p "Has the consolidation PR been merged to main? (y/N): " merged_confirm
    if [[ ! "$merged_confirm" =~ ^[Yy]$ ]]; then
        echo -e "${RED}✗ Consolidation PR must be merged before running cleanup${NC}"
        echo ""
        echo "Steps to follow:"
        echo "  1. Run: bash scripts/merge-and-deduplicate-branches.sh"
        echo "  2. Create PR from consolidation branch to main"
        echo "  3. Review, test, and merge the PR"
        echo "  4. Then run this cleanup script"
        exit 1
    fi
fi

# Function: Get list of duplicate branches from report
get_duplicate_branches() {
    if [ ! -f "$CONSOLIDATION_REPORT" ]; then
        echo ""
        return
    fi
    
    # Extract duplicate branches from the "Skipped Branches" section
    # These are marked as "duplicate"
    grep "^- \*\*.*\*\* - Reason: duplicate" "$CONSOLIDATION_REPORT" 2>/dev/null | \
        sed 's/^- \*\*//; s/\*\* - Reason: duplicate//' || echo ""
}

# Function: Get list of old archive branches
get_old_archive_branches() {
    local cutoff_date=$(date -d "${ARCHIVE_AGE_DAYS} days ago" +%s 2>/dev/null || \
                       date -v-${ARCHIVE_AGE_DAYS}d +%s 2>/dev/null || \
                       echo "0")
    
    local old_archives=""
    local branches=$(git branch -r | grep -v HEAD | sed 's/origin\///' | grep "^archive/" || echo "")
    
    while IFS= read -r branch; do
        [ -z "$branch" ] && continue
        
        # Get last commit date
        local commit_date=$(git log -1 --format=%ct "origin/${branch}" 2>/dev/null || echo "0")
        
        if [ "$commit_date" -lt "$cutoff_date" ] && [ "$commit_date" -ne 0 ]; then
            local age_days=$(( ($(date +%s) - commit_date) / 86400 ))
            old_archives+="${branch}|${age_days}"$'\n'
        fi
    done <<< "$branches"
    
    echo "$old_archives"
}

# Function: Delete a branch
delete_branch() {
    local branch=$1
    local reason=$2
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${YELLOW}[DRY RUN]${NC} Would delete: ${branch} (${reason})"
        return 0
    fi
    
    # Check if branch exists
    if ! git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
        echo -e "  ${YELLOW}⚠️  Branch doesn't exist: ${branch}${NC}"
        SKIPPED_BRANCHES=$((SKIPPED_BRANCHES + 1))
        return 1
    fi
    
    # Confirm deletion for each branch (unless --force)
    if [ "$FORCE" = false ]; then
        read -p "  Delete ${branch}? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo -e "  ${YELLOW}⏭️  Skipped: ${branch}${NC}"
            SKIPPED_BRANCHES=$((SKIPPED_BRANCHES + 1))
            return 0
        fi
    fi
    
    # Delete the branch
    if git push origin --delete "${branch}" 2>&1; then
        echo -e "  ${GREEN}✓ Deleted: ${branch}${NC}"
        
        if [ "$reason" = "duplicate" ]; then
            DELETED_DUPLICATES=$((DELETED_DUPLICATES + 1))
        elif [ "$reason" = "old_archive" ]; then
            DELETED_ARCHIVES=$((DELETED_ARCHIVES + 1))
        fi
        
        return 0
    else
        echo -e "  ${RED}✗ Failed to delete: ${branch}${NC}"
        SKIPPED_BRANCHES=$((SKIPPED_BRANCHES + 1))
        return 1
    fi
}

# Main: Delete duplicate branches
delete_duplicates() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Step 1: Delete Duplicate Branches${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    local duplicates=$(get_duplicate_branches)
    
    if [ -z "$duplicates" ]; then
        echo "No duplicate branches identified in the consolidation report"
        return 0
    fi
    
    echo "Found duplicate branches to delete:"
    echo "$duplicates" | while IFS= read -r branch; do
        [ -z "$branch" ] && continue
        echo "  - ${branch}"
    done
    echo ""
    
    if [ "$FORCE" = false ] && [ "$DRY_RUN" = false ]; then
        read -p "Proceed with deleting these duplicates? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo "Skipped duplicate deletion"
            return 0
        fi
    fi
    
    echo "Deleting duplicate branches..."
    while IFS= read -r branch; do
        [ -z "$branch" ] && continue
        delete_branch "$branch" "duplicate"
    done <<< "$duplicates"
}

# Main: Delete old archive branches
delete_old_archives() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Step 2: Delete Old Archive Branches (>${ARCHIVE_AGE_DAYS} days)${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    local old_archives=$(get_old_archive_branches)
    
    if [ -z "$old_archives" ]; then
        echo "No old archive branches found"
        return 0
    fi
    
    echo "Found old archive branches to delete:"
    echo "$old_archives" | while IFS='|' read -r branch age; do
        [ -z "$branch" ] && continue
        echo "  - ${branch} (${age} days old)"
    done
    echo ""
    
    if [ "$FORCE" = false ] && [ "$DRY_RUN" = false ]; then
        read -p "Proceed with deleting these old archives? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo "Skipped archive deletion"
            return 0
        fi
    fi
    
    echo "Deleting old archive branches..."
    while IFS='|' read -r branch age; do
        [ -z "$branch" ] && continue
        delete_branch "$branch" "old_archive"
    done <<< "$old_archives"
}

# Display results
display_results() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Cleanup Summary${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}This was a dry run. No branches were deleted.${NC}"
        echo ""
        echo "Run without --dry-run to perform actual deletion:"
        echo "  bash scripts/cleanup-duplicate-branches.sh"
    else
        echo -e "${GREEN}✓ Cleanup complete!${NC}"
        echo ""
        echo "Summary:"
        echo "  🗑️  Deleted duplicates: ${DELETED_DUPLICATES}"
        echo "  🗑️  Deleted old archives: ${DELETED_ARCHIVES}"
        echo "  ⏭️  Skipped: ${SKIPPED_BRANCHES}"
    fi
    
    echo ""
    echo "To see remaining branches:"
    echo "  git branch -r"
    echo ""
}

# Main execution
main() {
    # Step 1: Delete duplicate branches
    delete_duplicates
    
    # Step 2: Delete old archive branches
    delete_old_archives
    
    # Step 3: Display results
    display_results
}

# Run main function
main
