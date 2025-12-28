# Branch Consolidation System

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Duplicate Detection Algorithm](#duplicate-detection-algorithm)
- [Conflict Resolution Strategies](#conflict-resolution-strategies)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Safety Features](#safety-features)

## Overview

The Branch Consolidation System is an intelligent automation tool designed to merge all usable branches in a repository while eliminating duplicates. It handles:

- **Automatic duplicate detection** by comparing commit SHAs
- **Intelligent merging** with automatic conflict resolution
- **Cherry-picking** valuable commits from archive branches
- **Comprehensive reporting** of all actions taken
- **Safe cleanup** of duplicate and old archive branches

### Key Benefits

- 🎯 **Reduces branch clutter** - Consolidates dozens of branches into one
- 🔍 **Identifies duplicates automatically** - No manual comparison needed
- 🛡️ **Non-destructive** - Creates new branch, doesn't delete anything initially
- 📊 **Transparent** - Detailed reporting of all actions
- ✅ **Safe** - Multiple safety checks and confirmations

## How It Works

### Step 1: Branch Analysis

The system fetches all remote branches and analyzes them:

```bash
# Fetch all branches
git fetch origin

# For each branch:
# 1. Get the latest commit SHA
# 2. Categorize as active or archive
# 3. Count unique commits vs main
# 4. Identify conflicts with main
```

### Step 2: Duplicate Detection

Branches with identical commit SHAs are grouped together:

```bash
# Example duplicate group:
# - copilot/add-feature (SHA: abc123...)
# - archive/copilot/add-feature (SHA: abc123...)
# Result: Both have same SHA, one is kept, other marked as duplicate
```

### Step 3: Consolidation Branch Creation

A new branch is created from main:

```bash
git checkout main
git checkout -b consolidation/merge-all-branches-YYYYMMDD
```

### Step 4: Intelligent Merging

For each unique branch:

1. **Check if duplicate**: Skip if another branch with same SHA was already merged
2. **Check for unique commits**: Skip if no unique changes vs main
3. **Attempt merge**: Try to merge with `--no-ff` strategy
4. **Auto-resolve conflicts**: Use `--ours` strategy if conflicts occur
5. **Track statistics**: Record files changed, conflicts resolved

### Step 5: Cherry-Picking (Optional)

For archive branches with valuable commits:

1. **Select archives** with 1-50 unique commits
2. **Extract non-merge commits** (last 10 per archive)
3. **Cherry-pick each commit** with conflict skipping
4. **Track picked commits** for reporting

### Step 6: Report Generation

A comprehensive markdown report is generated with:

- Summary statistics
- Duplicate groups identified
- All branches merged (with file counts)
- All branches skipped (with reasons)
- Recommended cleanup actions
- Rollback instructions

## Duplicate Detection Algorithm

### Algorithm Overview

The duplicate detection algorithm works by comparing the tip commit SHA of each branch:

```
For each branch B:
  SHA = get_commit_sha(B)
  
  If SHA not in seen_shas:
    seen_shas[SHA] = [B]
    unique_branches.append(B)
  Else:
    seen_shas[SHA].append(B)
    duplicate_branches.append(B)

For each SHA with multiple branches:
  Select first branch as representative
  Mark others as duplicates
```

### Why This Works

Two branches with the same tip commit SHA are functionally identical - they contain the exact same code state. Even if they have different names or creation dates, merging both would be redundant.

### Edge Cases Handled

1. **Diverged branches**: Branches that were the same but diverged are NOT duplicates
2. **Archive branches**: Archives with same SHA as active branches are marked as duplicates
3. **Multiple duplicates**: Groups of 3+ branches with same SHA are all consolidated

### Example Scenarios

**Scenario 1: True Duplicates**
```
Branch A: main -> commit1 -> commit2 (SHA: abc123)
Branch B: main -> commit1 -> commit2 (SHA: abc123)
Result: B is duplicate of A
```

**Scenario 2: Not Duplicates**
```
Branch A: main -> commit1 -> commit2 (SHA: abc123)
Branch B: main -> commit1 -> commit3 (SHA: def456)
Result: Both are unique
```

**Scenario 3: Archive Duplicate**
```
Branch A: copilot/feature (SHA: abc123)
Branch B: archive/copilot/feature (SHA: abc123)
Result: B is duplicate of A (archive)
```

## Conflict Resolution Strategies

When merging branches, conflicts can occur. The system uses a multi-stage resolution strategy:

### Stage 1: Standard Merge

```bash
git merge --no-ff origin/branch-name
```

Attempts a standard merge with no fast-forward. This preserves the branch history.

### Stage 2: Auto-Resolution with `--ours`

If Stage 1 fails:

```bash
git merge --abort
git merge --no-ff -X ours origin/branch-name
```

The `--ours` strategy means:
- **When conflict occurs**: Keep our version (consolidation branch)
- **Why this is safe**: We're consolidating into main, so main's version is authoritative
- **What it preserves**: All unique changes from the branch that don't conflict

### Stage 3: Skip on Failure

If both Stage 1 and 2 fail:

```bash
git merge --abort
# Branch is marked as skipped with reason "merge_conflict"
```

The branch is documented in the report for manual review.

### Conflict Resolution Best Practices

1. **Review auto-resolved conflicts**: Check the report for branches that needed auto-resolution
2. **Manual review recommended**: For critical branches, review the merge commit diff
3. **Test after consolidation**: Run full test suite to ensure no functionality is broken
4. **Iterative approach**: Can always cherry-pick specific commits if needed

## Usage Guide

### Method 1: Local Execution (Recommended)

```bash
# Navigate to repository
cd ndax-quantum-engine

# Ensure you have all branches
git fetch origin

# Run consolidation (dry run first)
bash scripts/merge-and-deduplicate-branches.sh --dry-run

# Review the output, then run for real
bash scripts/merge-and-deduplicate-branches.sh

# Review the report
cat CONSOLIDATION_REPORT.md

# Run tests
npm test

# Create PR
git push origin consolidation/merge-all-branches-YYYYMMDD
# Then create PR via GitHub UI

# After PR is merged, cleanup duplicates
bash scripts/cleanup-duplicate-branches.sh --dry-run
bash scripts/cleanup-duplicate-branches.sh
```

### Method 2: GitHub Actions Workflow

```bash
# 1. Go to GitHub Actions tab
# 2. Select "Branch Consolidation" workflow
# 3. Click "Run workflow"
# 4. Choose "dry_run: true" for first run
# 5. Review the artifact report
# 6. Run again with "dry_run: false"
# 7. Review and merge the auto-created PR
# 8. Run cleanup script locally
```

### Method 3: Manual Step-by-Step

```bash
# 1. Analyze branches manually
git fetch origin
git branch -r | grep -v HEAD

# 2. Identify duplicates manually
for branch in $(git branch -r | grep -v HEAD); do
  echo "$branch: $(git rev-parse $branch)"
done | sort -k2

# 3. Create consolidation branch
git checkout main
git pull origin main
git checkout -b consolidation/manual-merge

# 4. Merge branches one by one
git merge --no-ff origin/branch1
git merge --no-ff origin/branch2
# etc...

# 5. Push and create PR
git push origin consolidation/manual-merge
```

## Troubleshooting

### Issue: "No remote branches found"

**Cause**: Shallow clone or missing branches

**Solution**:
```bash
git fetch --unshallow
git fetch origin
```

### Issue: "Authentication failed"

**Cause**: Missing or invalid Git credentials

**Solution**:
```bash
# For GitHub CLI
gh auth login

# For Git credentials
git config --global credential.helper store
git pull  # Will prompt for credentials
```

### Issue: "Branch already exists"

**Cause**: Previous consolidation branch wasn't cleaned up

**Solution**:
```bash
# Delete old consolidation branch
git branch -D consolidation/merge-all-branches-*
git push origin --delete consolidation/merge-all-branches-*

# Run script again
bash scripts/merge-and-deduplicate-branches.sh
```

### Issue: "Merge conflicts can't be resolved"

**Cause**: Complex conflicts that auto-resolution can't handle

**Solution**:
1. Note which branches failed (in the report)
2. Complete the consolidation without them
3. Manually merge problem branches later:
```bash
git checkout consolidation/merge-all-branches-YYYYMMDD
git merge origin/problem-branch
# Manually resolve conflicts
git commit
```

### Issue: "Tests failing after consolidation"

**Cause**: Conflicting changes between branches

**Solution**:
1. Review test failures
2. Identify which merged branch introduced the issue
3. Either:
   - Fix the issue in the consolidation branch, or
   - Revert that specific merge commit:
```bash
git revert -m 1 <merge-commit-sha>
```

### Issue: "Report not generated"

**Cause**: Script failed before completion

**Solution**:
1. Check script output for errors
2. Common causes:
   - No branches to consolidate
   - Permission issues
   - Disk space issues
3. Run with more verbose output:
```bash
bash -x scripts/merge-and-deduplicate-branches.sh
```

## FAQ

### Q: Will this delete any branches?

**A:** No. The consolidation script only creates a new branch and generates a report. The cleanup script (which must be run separately) is what deletes branches, and it asks for confirmation.

### Q: What if I don't want to merge all branches?

**A:** You can:
1. Edit the script to skip specific branches
2. Use the GitHub Actions workflow PR creation method and edit the PR
3. Manually cherry-pick only what you want after consolidation

### Q: How do I know which branches are duplicates?

**A:** The consolidation report lists all duplicate groups with the branches in each group. The script keeps the first branch alphabetically and marks others as duplicates.

### Q: Can I undo the consolidation?

**A:** Yes. Since it's just a new branch:
```bash
# Delete locally
git branch -D consolidation/merge-all-branches-YYYYMMDD

# Delete from remote (if pushed)
git push origin --delete consolidation/merge-all-branches-YYYYMMDD
```

### Q: What about branch protection rules?

**A:** The consolidation branch is new, so protection rules don't apply to it initially. After it's merged to main, you can delete it. Protection rules on main still apply when merging the PR.

### Q: Should I merge the consolidation PR as-is?

**A:** Not necessarily. Review it first:
1. Check the consolidation report
2. Review the diff
3. Run tests locally
4. Get a code review
5. Then merge

### Q: What happens to branches with conflicts?

**A:** The script tries to auto-resolve with `--ours` strategy. If that fails, the branch is skipped and listed in the report. You can manually merge these later.

### Q: Can I run this multiple times?

**A:** Yes, but you'll need to delete or rename previous consolidation branches first. Each run creates a new branch with the current date.

### Q: What about archive branches?

**A:** Archive branches are:
1. Analyzed for duplicates like other branches
2. Optionally cherry-picked from (if they have valuable commits)
3. Can be automatically deleted if older than 3 months (via cleanup script)

### Q: How long does consolidation take?

**A:** Depends on repository size:
- Small repos (10-20 branches): 1-2 minutes
- Medium repos (50-100 branches): 5-10 minutes
- Large repos (100+ branches): 10-30 minutes

### Q: Is it safe to run in production?

**A:** Yes, with caveats:
1. Always run `--dry-run` first
2. Review the consolidation report
3. Test the consolidation branch before merging
4. Have a rollback plan
5. Communicate with your team

## Safety Features

### Non-Destructive Operation

- Creates new branch instead of modifying existing branches
- Original branches remain untouched until manual cleanup
- All actions are reversible

### Detailed Logging

- Every action is logged to console
- Comprehensive report generated
- Easy to trace what happened

### Dry-Run Mode

```bash
bash scripts/merge-and-deduplicate-branches.sh --dry-run
```

- Shows what would happen without making changes
- Generates report without creating branch
- Safe for testing and planning

### Confirmation Prompts

The cleanup script asks for confirmation:
- Before deleting any branches
- For each branch (unless --force flag used)
- Warns about permanence of deletion

### Test Verification

- Workflow runs tests before creating PR
- Failures don't prevent report generation
- Can catch issues before merging

### Rollback Instructions

Included in every report:
```bash
# Delete consolidation branch
git branch -D consolidation/merge-all-branches-YYYYMMDD
git push origin --delete consolidation/merge-all-branches-YYYYMMDD
```

### Separate Cleanup Step

- Consolidation and cleanup are separate scripts
- Cleanup requires confirmation that PR is merged
- Multiple safety prompts before deletion
- Dry-run mode available for cleanup too

### Audit Trail

- All actions logged in consolidation report
- Git history preserved in merge commits
- Easy to identify what came from which branch

### Protection Against Runaway

- No infinite loops
- Bounded cherry-pick count (max 10 per archive)
- Archives limited to reasonable size (1-50 commits)
- Skips problematic branches instead of hanging

---

## Additional Resources

- **Main Script**: `scripts/merge-and-deduplicate-branches.sh`
- **Cleanup Script**: `scripts/cleanup-duplicate-branches.sh`
- **Workflow**: `.github/workflows/branch-consolidation.yml`
- **Usage Guide**: `README.md` (Branch Management section)

## Contributing

If you find issues or have improvements:

1. Test the scripts in a fork first
2. Document the issue/improvement
3. Submit a PR with clear description
4. Include tests if adding new functionality

## License

This consolidation system is part of the NDAX Quantum Engine project and follows the same license.
