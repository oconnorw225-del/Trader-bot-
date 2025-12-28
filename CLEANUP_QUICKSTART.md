# Branch Cleanup - Quick Reference

## Current Situation

The repository has **29 branches** that need cleanup:
- 24 copilot/* branches (automated work)
- 3 feature/* branches
- 1 fix/* branch
- 1 main branch

## Quick Cleanup Instructions

### Option 1: Run the Interactive Script
```bash
./scripts/cleanup-branches.sh
```

### Option 2: Use Python Helper
```bash
# View summary
python3 scripts/cleanup-branches.py summary

# Generate GitHub CLI commands
python3 scripts/cleanup-branches.py cli

# Generate web interface instructions
python3 scripts/cleanup-branches.py web

# Create a shell script with all commands
python3 scripts/cleanup-branches.py script
```

### Option 3: Generate Commands
```bash
./scripts/generate-cleanup-commands.sh > cleanup.sh
chmod +x cleanup.sh
# Review cleanup.sh before running
./cleanup.sh
```

## Top 8 Branches to Merge

1. feature/autonomous-job-automation-complete
2. feature/auto-start-system
3. fix/lint-and-tests
4. copilot/configure-copilot-instructions
5. copilot/fix-ci-cd-workflow-issues
6. copilot/add-autostart-system-features
7. copilot/consolidate-mobile-styles
8. copilot/add-todo-list-feature

## Remaining 19 Branches to Delete

After merging the top 8, delete the remaining copilot/* branches.

See **[BRANCH_CLEANUP_GUIDE.md](BRANCH_CLEANUP_GUIDE.md)** for complete documentation.

## Files Created

- `BRANCH_CLEANUP_GUIDE.md` - Comprehensive cleanup documentation
- `scripts/cleanup-branches.sh` - Interactive cleanup script
- `scripts/generate-cleanup-commands.sh` - Command generator
- `scripts/cleanup-branches.py` - Python helper tool

## Expected Result

- **Before:** 29 branches
- **After:** ~2-5 branches (main + active work)
- **Deleted:** 19 copilot branches
- **Merged:** Top 8 feature branches into main
