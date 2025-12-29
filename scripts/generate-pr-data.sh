#!/bin/bash

# Generate Pull Request Data
# This script generates PR data for branches in the repository
# Useful when the repository structure doesn't match expected branch list

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository details
REPO="oconnorw225-del/Trader-bot-"
DEFAULT_BASE="main"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$REPO_ROOT/.github/pr-data"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "========================================"
echo "Pull Request Data Generator"
echo "Repository: $REPO"
echo "========================================"
echo ""

# Function to generate PR data for current branch
generate_current_branch_pr() {
    local current_branch=$(git branch --show-current)
    
    if [[ -z "$current_branch" ]]; then
        echo -e "${RED}ERROR: Not on a branch${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Current Branch: $current_branch${NC}"
    
    # Get branch information
    local latest_commit=$(git log -1 --format="%H" 2>/dev/null || echo "unknown")
    local latest_commit_msg=$(git log -1 --format="%s" 2>/dev/null || echo "No commit message")
    local author=$(git log -1 --format="%an" 2>/dev/null || echo "Unknown")
    local date=$(git log -1 --format="%ai" 2>/dev/null || echo "Unknown date")
    local files_count=$(git ls-files | wc -l)
    
    # Generate PR title
    local pr_title="[${current_branch}] Pull Request: ${latest_commit_msg}"
    
    # Generate PR body
    local pr_body=$(cat <<EOF
# Pull Request: ${current_branch}

## Summary
This PR contains the work from the \`${current_branch}\` branch.

**Latest Commit:** ${latest_commit_msg}

## Branch Information
- **Branch Name:** \`${current_branch}\`
- **Latest Commit:** \`${latest_commit:0:7}\`
- **Author:** ${author}
- **Date:** ${date}
- **Total Files:** ${files_count}

## Changes
${latest_commit_msg}

## Testing
- [ ] All tests pass
- [ ] Code follows project standards
- [ ] Documentation updated (if needed)

## Checklist
- [ ] Code has been reviewed
- [ ] No merge conflicts
- [ ] CI/CD checks pass
- [ ] Branch can be safely merged

## Related Issues
Reference: commit ${latest_commit:0:7}

---
*Generated automatically by generate-pr-data.sh*
EOF
)
    
    # Save PR data to file
    local output_file="$OUTPUT_DIR/${current_branch//\//-}-pr-data.md"
    echo "$pr_body" > "$output_file"
    
    echo -e "${GREEN}✓ Generated PR data: $output_file${NC}"
    echo ""
    echo "PR Title:"
    echo "  $pr_title"
    echo ""
    echo "To create PR manually:"
    echo -e "${YELLOW}  gh pr create --title \"$pr_title\" --body-file \"$output_file\" --base main --head $current_branch${NC}"
    echo ""
    
    # Also output JSON format for automation
    local json_file="$OUTPUT_DIR/${current_branch//\//-}-pr-data.json"
    cat > "$json_file" <<EOF
{
  "branch": "$current_branch",
  "title": "$pr_title",
  "base": "$DEFAULT_BASE",
  "commit": "$latest_commit",
  "author": "$author",
  "date": "$date",
  "files_count": $files_count,
  "body_file": "$output_file"
}
EOF
    
    echo -e "${GREEN}✓ Generated JSON data: $json_file${NC}"
}

# Function to check repository state
check_repo_state() {
    echo "Checking repository state..."
    
    # Check for remote branches
    local remote_branches=$(git branch -r | wc -l)
    echo "  Remote branches: $remote_branches"
    
    # Check for main/master branch
    local has_main=false
    if git rev-parse --verify origin/main > /dev/null 2>&1; then
        has_main=true
        echo -e "  ${GREEN}✓ Has origin/main${NC}"
    elif git rev-parse --verify origin/master > /dev/null 2>&1; then
        has_main=true
        DEFAULT_BASE="master"
        echo -e "  ${GREEN}✓ Has origin/master${NC}"
    else
        echo -e "  ${YELLOW}⚠ No main/master branch found${NC}"
        echo -e "  ${YELLOW}  Consider creating a main branch first${NC}"
    fi
    
    echo ""
}

# Main execution
main() {
    check_repo_state
    generate_current_branch_pr
    
    echo "========================================"
    echo "Summary:"
    echo "  PR data files generated in: $OUTPUT_DIR"
    echo ""
    echo "Next steps:"
    echo "  1. Review the generated PR data"
    echo "  2. Ensure a main/base branch exists"
    echo "  3. Create PR using gh CLI or GitHub web interface"
    echo "========================================"
    echo -e "${GREEN}Done!${NC}"
}

# Run main function
main
