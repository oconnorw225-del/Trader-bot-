# Branch Cleanup Guide

## Overview

This guide provides instructions for cleaning up the 24 copilot branches and merging the top 8 most valuable branches to the main branch.

## Current State

- **Total Branches:** 29
- **Copilot Branches:** 24 (automated/temporary work branches)
- **Feature Branches:** 3
- **Fix Branches:** 1
- **Main Branch:** 1 (production)

## Cleanup Strategy

### Phase 1: Merge Top 8 Branches to Main

These branches contain the most valuable features and should be merged first:

1. **feature/autonomous-job-automation-complete**
   - Comprehensive 33-feature autonomous system
   - Major feature addition
   - Review PR before merging

2. **feature/auto-start-system**
   - Auto-start integration features
   - Production-ready functionality
   - Tested and documented

3. **fix/lint-and-tests**
   - Code quality fixes
   - Important for maintaining standards
   - Should be merged early

4. **copilot/configure-copilot-instructions**
   - Sets up Copilot for better results
   - Improves development workflow
   - Low risk, high value

5. **copilot/fix-ci-cd-workflow-issues**
   - CI/CD pipeline improvements
   - Infrastructure enhancement
   - Critical for deployment

6. **copilot/add-autostart-system-features**
   - Additional autostart capabilities
   - Complements feature/auto-start-system
   - Should be merged after #2

7. **copilot/consolidate-mobile-styles**
   - Mobile UI improvements
   - Style consistency
   - Low risk

8. **copilot/add-todo-list-feature**
   - Task management functionality
   - User-facing feature
   - Tested and ready

### Phase 2: Delete Remaining Copilot Branches

After merging the top 8, delete these 19 branches:

#### Duplicate Branches
- `copilot/improve-variable-and-function-names`
- `copilot/improve-variable-function-names`

#### Setup Branches (Already Applied)
- `copilot/setup-copilot-instructions`
- `copilot/setup-copilot-instructions-again`
- `copilot/rebase-copilot-instructions-branch`

#### Completed Work Branches
- `copilot/add-todo-list-application`
- `copilot/add-wallet-for-bots`
- `copilot/finish-original-issue`
- `copilot/fix-copilot-access-issue`
- `copilot/fix-copilot-review-issue`
- `copilot/fix-failjob-async-await-issue`
- `copilot/fix-pull-request-comments`
- `copilot/resolve-get-it-done-issue`
- `copilot/resolve-pull-request-overview-issues`
- `copilot/status-report`

#### Configuration Branches (No Longer Needed)
- `copilot/remove-all-duplicates`
- `copilot/remove-fork-invitation`
- `copilot/remove-forking-allowance`
- `copilot/update-forking-to-false`

## Method 1: Using GitHub CLI (Recommended)

### Prerequisites
```bash
# Install GitHub CLI if not already installed
# macOS
brew install gh

# Linux
sudo apt install gh

# Windows
winget install --id GitHub.cli
```

### Authenticate
```bash
gh auth login
```

### Merge Top 8 Branches

```bash
# Switch to main branch
git checkout main
git pull origin main

# For each branch, check if PR exists and merge
gh pr list --head feature/autonomous-job-automation-complete
gh pr merge feature/autonomous-job-automation-complete --merge --delete-branch

gh pr list --head feature/auto-start-system
gh pr merge feature/auto-start-system --merge --delete-branch

gh pr list --head fix/lint-and-tests
gh pr merge fix/lint-and-tests --merge --delete-branch

gh pr list --head copilot/configure-copilot-instructions
gh pr merge copilot/configure-copilot-instructions --merge --delete-branch

gh pr list --head copilot/fix-ci-cd-workflow-issues
gh pr merge copilot/fix-ci-cd-workflow-issues --merge --delete-branch

gh pr list --head copilot/add-autostart-system-features
gh pr merge copilot/add-autostart-system-features --merge --delete-branch

gh pr list --head copilot/consolidate-mobile-styles
gh pr merge copilot/consolidate-mobile-styles --merge --delete-branch

gh pr list --head copilot/add-todo-list-feature
gh pr merge copilot/add-todo-list-feature --merge --delete-branch
```

### Delete Remaining Branches

```bash
# Delete branches without PRs or already merged
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/add-todo-list-application
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/add-wallet-for-bots
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/finish-original-issue
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/fix-copilot-access-issue
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/fix-copilot-review-issue
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/fix-failjob-async-await-issue
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/fix-pull-request-comments
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/improve-variable-and-function-names
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/improve-variable-function-names
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/rebase-copilot-instructions-branch
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/remove-all-duplicates
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/remove-fork-invitation
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/remove-forking-allowance
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/resolve-get-it-done-issue
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/resolve-pull-request-overview-issues
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/setup-copilot-instructions
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/setup-copilot-instructions-again
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/status-report
gh api -X DELETE repos/oconnorw225-del/ndax-quantum-engine/git/refs/heads/copilot/update-forking-to-false
```

## Method 2: Using GitHub Web Interface

### Merge Branches

1. Go to: https://github.com/oconnorw225-del/ndax-quantum-engine/pulls
2. For each of the top 8 branches listed above:
   - Find or create a pull request
   - Review the changes
   - Click "Merge pull request"
   - Optionally select "Delete branch" after merge

### Delete Branches

1. Go to: https://github.com/oconnorw225-del/ndax-quantum-engine/branches
2. Find each branch in the "Delete Remaining Branches" list
3. Click the trash icon next to each branch name
4. Confirm deletion

## Method 3: Using the Cleanup Script

We've provided an interactive script to help with cleanup:

```bash
# Run the cleanup script
cd /home/runner/work/ndax-quantum-engine/ndax-quantum-engine
./scripts/cleanup-branches.sh
```

The script will:
1. Analyze current branches
2. Show the top 8 to merge
3. List branches to delete
4. Provide options for cleanup (GitHub CLI, manual, or comparison URLs)

## Review Before Merging

Before merging each branch, review the changes:

### Feature Branches
- **feature/autonomous-job-automation-complete**
  - Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...feature/autonomous-job-automation-complete
  
- **feature/auto-start-system**
  - Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...feature/auto-start-system

- **fix/lint-and-tests**
  - Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...fix/lint-and-tests

### Copilot Branches
- **copilot/configure-copilot-instructions**
  - Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...copilot/configure-copilot-instructions

- **copilot/fix-ci-cd-workflow-issues**
  - Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...copilot/fix-ci-cd-workflow-issues

- **copilot/add-autostart-system-features**
  - Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...copilot/add-autostart-system-features

- **copilot/consolidate-mobile-styles**
  - Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...copilot/consolidate-mobile-styles

- **copilot/add-todo-list-feature**
  - Compare: https://github.com/oconnorw225-del/ndax-quantum-engine/compare/main...copilot/add-todo-list-feature

## Post-Cleanup Verification

After cleanup, verify:

```bash
# Check remaining branches
git fetch --all --prune
git branch -r

# Expected: only main and any active work branches remain
```

Expected result:
- `main` branch
- Any current working branches
- Total: ~2-5 branches (down from 29)

## Backup Strategy

Before cleanup, create a backup tag:

```bash
# Create backup tag
git tag -a backup-before-cleanup-$(date +%Y%m%d) -m "Backup before branch cleanup"
git push origin --tags
```

This allows recovery if needed:
```bash
# Restore a branch if needed
git checkout -b recovered-branch backup-before-cleanup-YYYYMMDD
```

## Troubleshooting

### PR Doesn't Exist for a Branch

Create one manually:
```bash
gh pr create --head BRANCH_NAME --base main --title "Merge BRANCH_NAME" --body "Cleanup merge"
```

Or use the web interface:
1. Go to https://github.com/oconnorw225-del/ndax-quantum-engine/compare
2. Select base: `main` and compare: `BRANCH_NAME`
3. Click "Create pull request"

### Branch Can't Be Deleted (Protected)

1. Go to repository Settings → Branches
2. Find branch protection rules
3. Temporarily disable or adjust rules
4. Delete the branch
5. Re-enable protection rules

### Merge Conflicts

For each conflicting branch:
1. Create a fresh branch from main
2. Cherry-pick the important commits
3. Resolve conflicts manually
4. Create new PR with resolved changes

## Final State

After cleanup:
- **Main branch:** Up to date with top 8 branches merged
- **Total branches:** ~2-5 (main + active work)
- **Deleted branches:** 19 copilot branches
- **Repository:** Clean and organized

## Next Steps

1. Update repository default branch to `main` (if not already)
2. Set up branch protection rules for `main`
3. Configure required reviews for PRs
4. Set up automatic stale branch detection

## Resources

- GitHub CLI Documentation: https://cli.github.com/manual/
- GitHub Branch Management: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository
- Git Documentation: https://git-scm.com/doc
