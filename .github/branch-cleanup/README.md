# Branch Consolidation Process

This directory contains tools and tracking for the branch consolidation effort.

## Overview

The goal is to consolidate 40+ feature branches into the main branch by:
1. Creating individual pull requests for each branch
2. Reviewing and merging valuable features
3. Resolving merge conflicts
4. Deleting obsolete/duplicate branches
5. Cleaning up branch naming issues

## Files in This Directory

- **report.md** - Main tracking document showing status of all branches
- **pr-template.md** - Template used for creating consolidation PRs
- **README.md** - This file

## How to Use

### Option 1: Automated PR Creation via GitHub Actions

The easiest way to create all PRs is through the GitHub Actions workflow:

1. Go to the repository on GitHub
2. Navigate to Actions → "Create Branch Consolidation PRs"
3. Click "Run workflow"
4. Choose "dry run" mode first to see what will be created
5. Run again with dry run disabled to actually create the PRs

### Option 2: Manual Script Execution

If you have the repository cloned locally:

```bash
# Ensure you're authenticated with gh CLI
gh auth login

# Run the script
cd /path/to/repository
./scripts/create-branch-prs.sh
```

### Option 3: Manual PR Creation

If automated methods don't work, you can create PRs manually:

1. For each branch in the list (see report.md)
2. Go to GitHub → Pull Requests → New Pull Request
3. Set base: main, compare: [branch-name]
4. Use the template from pr-template.md
5. Add labels: enhancement, cleanup, high-priority
6. Create the PR

## Branch List

See `report.md` for the complete list of branches to process.

## What Happens After PRs are Created

1. **Review**: Each PR should be reviewed for:
   - Code quality
   - Test coverage
   - Merge conflicts
   - Value to the project

2. **Merge**: Approved PRs are merged into main

3. **Cleanup**: After merging, the source branch is deleted

4. **Tracking**: The report.md file is updated with PR numbers and status

## Handling Merge Conflicts

If a PR has merge conflicts:

1. The PR will be labeled with "conflicts"
2. Create a fix branch: `fix/merge-[original-branch-name]`
3. Resolve conflicts in the fix branch
4. Update the original PR or create a new one from the fix branch

## Identifying Duplicates

Some branches may have similar purposes. These should be:
1. Compared to see if they're truly duplicates
2. The better implementation should be kept
3. The duplicate should be marked for deletion

Known potential duplicates:
- `copilot/improve-variable-and-function-names` vs `copilot/improve-variable-function-names`
- `copilot/add-todo-list-application` vs `copilot/add-todo-list-feature`

## Progress Tracking

The `report.md` file contains a table tracking:
- Branch name
- Status (PENDING, IN_REVIEW, MERGED, CLOSED)
- PR number
- Action taken
- Notes

Update this file as PRs are processed.

## Notes

- The backup branch `backup/main-before-bulk-merge` should NOT be deleted
- All automation uses the github CLI (`gh`) which requires authentication
- PRs are created with labels: enhancement, cleanup, high-priority
- Each PR references issue #151 for tracking
