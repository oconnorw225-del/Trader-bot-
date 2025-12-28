# Branch Consolidation Guide

## Quick Start

The fastest way to consolidate all branches:

```bash
cd /path/to/ndax-quantum-engine
./scripts/consolidate-branches.sh
```

This interactive script will guide you through:
1. Analyzing all branches for conflicts and staleness
2. Creating fix branches for conflicts
3. Creating pull requests for all branches

## Why Can't the Agent Do This Automatically?

The Copilot coding agent has security constraints that prevent it from:
- Creating pull requests via GitHub API
- Pushing to remote branches without authentication
- Merging PRs automatically

This is by design to prevent unauthorized actions. Therefore, the agent has created comprehensive automation scripts that YOU can run with proper credentials.

## What the Agent Created

### 1. Analysis Tools
- **`scripts/analyze-branches.sh`** - Analyzes all 30 branches for:
  - Merge conflicts with main
  - Staleness (how old they are)
  - Number of commits and files changed
  - Potential duplicates

### 2. PR Creation Tools
- **`scripts/create-branch-prs.sh`** - Creates individual PRs for all branches
  - Generates proper titles and descriptions
  - Detects and reports conflicts
  - Applies correct labels
  - Links to issue #151

### 3. Conflict Resolution Tools
- **`scripts/create-fix-branches.sh`** - For branches with conflicts:
  - Creates fix/* branches
  - Attempts auto-resolution
  - Provides manual resolution instructions

### 4. Master Script
- **`scripts/consolidate-branches.sh`** - Interactive menu system
  - Orchestrates the entire process
  - Guides you through each step
  - Provides status and reports

### 5. GitHub Actions Workflow
- **`.github/workflows/create-consolidation-prs.yml`**
  - Can be triggered from GitHub Actions tab
  - Runs in cloud (no local setup needed)
  - Has dry-run mode for testing

### 6. Tracking System
- **`.github/branch-cleanup/report.md`** - Status tracking
- **`.github/branch-cleanup/pr-template.md`** - PR template
- **`.github/branch-cleanup/README.md`** - Process docs

## Step-by-Step Process

### Option 1: Interactive (Recommended)

```bash
./scripts/consolidate-branches.sh
```

Follow the menu:
1. **Analyze branches** - Understand what you're dealing with
2. **Create fix branches** - Handle conflicts automatically
3. **Create PRs** - Generate all pull requests
4. **Or choose full automation** - Does all steps at once

### Option 2: GitHub Actions

1. Go to: https://github.com/oconnorw225-del/ndax-quantum-engine/actions
2. Click "Create Branch Consolidation PRs"
3. Click "Run workflow"
4. Select "dry run" mode first to preview
5. Run again without dry run to create actual PRs

### Option 3: Step-by-Step Manual

#### Step 1: Analyze

```bash
./scripts/analyze-branches.sh
```

This creates `.github/branch-cleanup/analysis-report.md` with detailed info about each branch.

#### Step 2: Fix Conflicts (if any)

```bash
# For specific branches:
./scripts/create-fix-branches.sh copilot/branch-with-conflicts

# Or let the master script identify them automatically
```

#### Step 3: Create PRs

```bash
./scripts/create-branch-prs.sh
```

This creates ~29 pull requests, one for each branch.

## What Happens Next?

After PRs are created:

1. **Review each PR**
   - Check code quality
   - Verify it adds value
   - Ensure CI passes

2. **Merge approved PRs**
   - Use squash merge for feature branches
   - Wait for CI green + one approval

3. **Delete merged branches**
   - GitHub can auto-delete on merge
   - Or delete manually after merge

4. **Update tracking**
   - Update `.github/branch-cleanup/report.md`
   - Mark branches as MERGED, CLOSED, or DELETED

## Branches Being Consolidated

Total: 30 branches (29 to process + 1 backup to keep)

Key branches include:
- Feature additions (todo-list, wallet, autostart, etc.)
- Configuration updates (copilot instructions, dashboard, etc.)
- Bug fixes (API keys, CI/CD, async/await, etc.)
- Cleanup tasks (duplicates, forking, etc.)
- Deployment (Railway deployment)

See `.github/branch-cleanup/report.md` for the complete list.

## Potential Issues

### Duplicates Identified

These branches may be duplicates:
1. `copilot/improve-variable-and-function-names` vs `copilot/improve-variable-function-names`
2. `copilot/add-todo-list-application` vs `copilot/add-todo-list-feature`

**Action:** Compare them and consolidate if they're truly duplicates.

### Stale Branches

Some branches may be >30 days old. The analysis script identifies these. Consider:
- Is the feature still relevant?
- Has it been superseded by other work?
- Should it be marked for deletion?

### Merge Conflicts

Branches with conflicts will be identified by the analysis script. The fix branch script can handle many automatically.

## Requirements

- **gh CLI**: GitHub command-line tool
  - Install: https://cli.github.com/
  - Authenticate: `gh auth login`

- **git**: Obviously :)

- **bash**: Unix shell (Mac/Linux/WSL)

## Troubleshooting

### "Not authenticated with GitHub CLI"

```bash
gh auth login
```

Follow the prompts to authenticate.

### "Branch does not exist"

Run `git fetch origin` to get latest refs.

### "Permission denied"

Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### Script fails partway through

The scripts are designed to be re-runnable. They check if PRs already exist before creating them.

## Support

If you encounter issues:
1. Check the analysis report: `.github/branch-cleanup/analysis-report.md`
2. Check GitHub Actions logs if using the workflow
3. Review the consolidation notes: `CONSOLIDATION_NOTES.md`
4. Check the tracking report: `.github/branch-cleanup/report.md`

## Summary

The Copilot agent has created a complete automation system for branch consolidation. It cannot execute the automation due to security constraints, but it has provided:

✅ Analysis tools to understand branch status  
✅ Conflict resolution helpers  
✅ PR creation automation  
✅ Interactive master script  
✅ GitHub Actions workflow  
✅ Comprehensive documentation  
✅ Tracking and reporting system  

All you need to do is run the scripts with proper GitHub authentication!
