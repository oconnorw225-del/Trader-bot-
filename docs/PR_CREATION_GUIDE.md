# Pull Request Creation Guide

**Last Updated:** 2025-12-28

This guide explains how to create pull requests for the NDAX Quantum Engine repository, especially when dealing with a grafted repository or missing base branches.

## Overview

This repository uses a branch consolidation system to manage feature branches and create pull requests systematically. However, when the repository is grafted or doesn't have a main branch, special steps are needed.

## Prerequisites

1. **GitHub CLI (`gh`)** installed and authenticated
   ```bash
   gh auth login
   ```

2. **Repository cloned locally**
   ```bash
   git clone https://github.com/oconnorw225-del/Trader-bot-.git
   cd Trader-bot-
   ```

## Scenario 1: Creating PR for Current Branch (No Main Branch)

If you're on a branch and there's no main branch to create a PR against:

### Step 1: Generate PR Data

```bash
# Generate PR data for the current branch
bash scripts/generate-pr-data.sh
```

This creates:
- `.github/pr-data/[branch-name]-pr-data.md` - PR description
- `.github/pr-data/[branch-name]-pr-data.json` - PR metadata

### Step 2: Create Main Branch

Before creating a PR, you need a base branch. Choose one of these options:

**Option A: Use current branch as main**
```bash
# Push current branch as main
git push origin HEAD:main
```

**Option B: Create main from commit**
```bash
# Create main from the initial commit
git checkout -b main 8dd1539f214460f288ab75717725d58f96bd4c09
git push origin main
```

### Step 3: Create the Pull Request

```bash
# Method 1: Using generated data file
gh pr create \
  --title "[copilot/add-pull-request-data] Pull Request: Initial plan" \
  --body-file ".github/pr-data/copilot-add-pull-request-data-pr-data.md" \
  --base main \
  --head copilot/add-pull-request-data

# Method 2: Manual
gh pr create \
  --title "Your PR Title" \
  --body "Your PR description" \
  --base main \
  --head copilot/add-pull-request-data
```

## Scenario 2: Bulk PR Creation for Multiple Branches

If you have multiple branches listed in `.github/branch-cleanup/branches.txt`:

### Step 1: Verify branches exist

```bash
# Check which branches exist on remote
git branch -r

# Fetch all branches
git fetch origin --all
```

### Step 2: Run the bulk PR creation script

```bash
# Dry run first (shows what would be created)
bash scripts/create-branch-prs.sh

# Note: The script requires branches to actually exist on the remote
```

### Step 3: Handle missing branches

If branches listed in `branches.txt` don't exist:

1. **Update branches.txt** to remove non-existent branches
2. **Or create the branches** if they should exist:
   ```bash
   git checkout -b branch-name
   # Make changes
   git push origin branch-name
   ```

## Scenario 3: Creating PR via GitHub Web Interface

If CLI methods don't work:

1. Go to: `https://github.com/oconnorw225-del/Trader-bot-/compare`
2. Select:
   - **Base:** `main`
   - **Compare:** your branch name (e.g., `copilot/add-pull-request-data`)
3. Click "Create Pull Request"
4. Fill in title and description using the generated PR data file as reference
5. Add labels: `enhancement`, `cleanup`, `high-priority`
6. Create the PR

## PR Data Structure

The generated PR data includes:

```markdown
# Pull Request: [branch-name]

## Summary
Brief overview of changes

## Branch Information
- Branch Name
- Latest Commit
- Author
- Date
- File Count

## Changes
Description of what was changed

## Testing
- Checklist of testing items

## Checklist
- Pre-merge verification steps

## Related Issues
References to related commits/issues
```

## Troubleshooting

### Error: "base branch does not exist"

**Solution:** Create a main branch first:
```bash
git checkout -b main
git push origin main
```

### Error: "head branch does not exist"

**Solution:** Push your current branch:
```bash
git push origin HEAD
```

### Error: "gh: command not found"

**Solution:** Install GitHub CLI:
```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows
winget install GitHub.cli
```

### Error: "not authenticated"

**Solution:** Authenticate with GitHub:
```bash
gh auth login
# Follow the prompts
```

## Workflow Files

The repository includes automated workflows for PR creation:

- `.github/workflows/create-prs.yml` - Automated PR creation from branch list
- `.github/workflows/create-consolidation-prs.yml` - Branch consolidation PRs

These can be triggered via GitHub Actions:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Set parameters (dry run, base branch, etc.)

## Best Practices

1. **Always dry-run first** - Test scripts with dry-run mode before creating actual PRs
2. **Review PR data** - Check generated PR descriptions before creating PRs
3. **Verify base branch** - Ensure the base branch exists and is up to date
4. **Check for conflicts** - Review branches for merge conflicts before creating PRs
5. **Add appropriate labels** - Use labels for categorization and prioritization
6. **Link to issues** - Reference related issues in PR descriptions
7. **Update documentation** - Keep branch lists and reports up to date

## Scripts Reference

- `scripts/generate-pr-data.sh` - Generate PR data for current branch
- `scripts/create-branch-prs.sh` - Bulk create PRs from branch list

## Repository Structure

```
.github/
├── branch-cleanup/
│   ├── branches.txt        # List of branches to consolidate
│   ├── pr-template.md      # PR template
│   └── report.md           # Consolidation status report
├── pr-data/                # Generated PR data (gitignored)
│   ├── *.md                # PR descriptions
│   └── *.json              # PR metadata
└── workflows/              # GitHub Actions workflows
    ├── create-prs.yml
    └── ...
```

## Additional Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub API - Pull Requests](https://docs.github.com/en/rest/pulls)
- [Branch Consolidation Report](.github/branch-cleanup/report.md)
- [Project README](../README.md)

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review the GitHub Actions logs for automated workflows
3. Consult the repository documentation
4. Verify your GitHub CLI authentication status

---

*This guide is part of the NDAX Quantum Engine documentation.*
