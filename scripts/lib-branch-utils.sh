#!/bin/bash

# Shared utility functions for branch consolidation scripts
# Source this file in other scripts: source "$(dirname "$0")/lib-branch-utils.sh"

# Function to load branch list from configuration file
load_branches() {
    local script_dir="${1:-$(dirname "${BASH_SOURCE[1]}")}"
    local repo_root="$(cd "$script_dir/.." && pwd)"
    local branch_list_file="$repo_root/.github/branch-cleanup/branches.txt"
    
    if [ ! -f "$branch_list_file" ]; then
        echo "ERROR: Branch list file not found: $branch_list_file" >&2
        return 1
    fi
    
    # Read branches, skip comments and empty lines, exclude backup branches
    # Returns array via stdout, one branch per line
    grep -v '^#' "$branch_list_file" | grep -v '^backup/' | grep -v '^$' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

# Function to extract branch name without prefix
# Usage: branch_name=$(extract_branch_name "copilot/my-feature")
# Returns: "my-feature"
extract_branch_name() {
    local full_branch="$1"
    # Remove common prefixes (copilot/, feature/, fix/, etc.)
    echo "$full_branch" | sed 's|^[^/]*/||'
}

# Function to check if a branch exists in remote
# Usage: if branch_exists "copilot/my-feature"; then ...
branch_exists() {
    local branch="$1"
    git rev-parse --verify "origin/$branch" >/dev/null 2>&1
}

# Function to get merge conflict status
# Usage: has_conflicts=$(check_merge_conflicts "origin/main" "origin/feature")
# Returns: "true" or "false"
check_merge_conflicts() {
    local base="$1"
    local branch="$2"
    
    local merge_base=$(git merge-base "$base" "$branch" 2>/dev/null || echo "$base")
    local merge_result=$(git merge-tree "$merge_base" "$base" "$branch" 2>/dev/null || echo "")
    
    if echo "$merge_result" | grep -q "<<<<<<< "; then
        echo "true"
    else
        echo "false"
    fi
}
