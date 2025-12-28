#!/bin/bash
# Quick Branch Cleanup Commands Generator
# Generates ready-to-run commands for branch cleanup

echo "# ============================================="
echo "# NDAX Quantum Engine - Branch Cleanup Commands"
echo "# ============================================="
echo ""
echo "# Generated on: $(date)"
echo ""

echo "# ============================================="
echo "# STEP 1: Switch to main and update"
echo "# ============================================="
echo "git checkout main"
echo "git pull origin main"
echo ""

echo "# ============================================="
echo "# STEP 2: Merge Top 8 Branches (via PR)"
echo "# ============================================="
echo "# Option A: If using GitHub CLI (gh)"
echo ""

TOP_8=(
    "feature/autonomous-job-automation-complete"
    "feature/auto-start-system"
    "fix/lint-and-tests"
    "copilot/configure-copilot-instructions"
    "copilot/fix-ci-cd-workflow-issues"
    "copilot/add-autostart-system-features"
    "copilot/consolidate-mobile-styles"
    "copilot/add-todo-list-feature"
)

for branch in "${TOP_8[@]}"; do
    echo "# Merge $branch"
    echo "gh pr list --head $branch"
    echo "# If PR exists:"
    echo "gh pr merge $branch --merge --delete-branch"
    echo "# If no PR exists, create one:"
    echo "gh pr create --head $branch --base main --title \"Merge $branch to main\" --body \"Cleanup merge\""
    echo ""
done

echo "# Option B: Using GitHub Web Interface"
echo "# Go to: https://github.com/oconnorw225-del/ndax-quantum-engine/pulls"
echo "# Review and merge each PR for the branches listed above"
echo ""

echo "# ============================================="
echo "# STEP 3: Delete Remaining Copilot Branches"
echo "# ============================================="
echo "# Option A: Using GitHub CLI (gh)"
echo ""

BRANCHES_TO_DELETE=(
    "copilot/add-todo-list-application"
    "copilot/add-wallet-for-bots"
    "copilot/finish-original-issue"
    "copilot/fix-copilot-access-issue"
    "copilot/fix-copilot-review-issue"
    "copilot/fix-failjob-async-await-issue"
    "copilot/fix-pull-request-comments"
    "copilot/improve-variable-and-function-names"
    "copilot/improve-variable-function-names"
    "copilot/rebase-copilot-instructions-branch"
    "copilot/remove-all-duplicates"
    "copilot/remove-fork-invitation"
    "copilot/remove-forking-allowance"
    "copilot/resolve-get-it-done-issue"
    "copilot/resolve-pull-request-overview-issues"
    "copilot/setup-copilot-instructions"
    "copilot/setup-copilot-instructions-again"
    "copilot/status-report"
    "copilot/update-forking-to-false"
)

for branch in "${BRANCHES_TO_DELETE[@]}"; do
    echo "gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/$branch"
done

echo ""
echo "# Option B: Using GitHub Web Interface"
echo "# Go to: https://github.com/oconnorw225-del/ndax-quantum-engine/branches"
echo "# Click the trash icon next to each branch listed above"
echo ""

echo "# ============================================="
echo "# STEP 4: Cleanup local repository"
echo "# ============================================="
echo "git fetch --all --prune"
echo "git branch -r"
echo ""

echo "# ============================================="
echo "# STEP 5: Verify cleanup"
echo "# ============================================="
echo "echo 'Remaining branches:'"
echo "git branch -r | wc -l"
echo "echo 'Expected: ~2-5 branches (down from 29)'"
echo ""

echo "# ============================================="
echo "# OPTIONAL: Create backup tag before cleanup"
echo "# ============================================="
echo "git tag -a backup-before-cleanup-$(date +%Y%m%d) -m \"Backup before branch cleanup\""
echo "git push origin --tags"
echo ""

echo "# ============================================="
echo "# Summary"
echo "# ============================================="
echo "# Total branches before: 29"
echo "# Branches to merge: ${#TOP_8[@]}"
echo "# Branches to delete: ${#BRANCHES_TO_DELETE[@]}"
echo "# Expected remaining: ~2-5"
echo "# ============================================="
