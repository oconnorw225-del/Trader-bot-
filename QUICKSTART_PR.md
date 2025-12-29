# How to Create Pull Requests - Quick Start

This repository currently doesn't have a `main` branch, which is needed before creating pull requests.

## Quick Steps

### 1. Create the Main Branch

Choose **one** of these options:

#### Option A: Use current branch as main (Recommended)
```bash
# Push current branch as main
git push origin HEAD:refs/heads/main
```

#### Option B: Create from initial commit
```bash
# Create and push main branch
git checkout -b main 8dd1539f214460f288ab75717725d58f96bd4c09
git push origin main
git checkout -
```

### 2. Generate PR Data

```bash
# Generate PR description and metadata
bash scripts/generate-pr-data.sh
```

This creates files in `.github/pr-data/` with PR templates.

### 3. Create the Pull Request

#### Using GitHub CLI (Recommended)
```bash
gh pr create \
  --title "[copilot/add-pull-request-data] Add PR creation tools and documentation" \
  --body-file ".github/pr-data/copilot-add-pull-request-data-pr-data.md" \
  --base main \
  --head copilot/add-pull-request-data \
  --label "enhancement,cleanup,high-priority"
```

#### Using GitHub Web Interface
1. Go to: https://github.com/oconnorw225-del/Trader-bot-/compare
2. Select:
   - Base: `main`
   - Compare: `copilot/add-pull-request-data`
3. Click "Create Pull Request"
4. Copy content from `.github/pr-data/copilot-add-pull-request-data-pr-data.md`
5. Add labels: `enhancement`, `cleanup`, `high-priority`

## Using the Interactive Script

For a guided setup:

```bash
bash scripts/init-pr-creation.sh
```

This script will:
- Check if GitHub CLI is installed and authenticated
- Check repository state
- Offer to create main branch
- Generate PR data
- Show next steps

## Troubleshooting

### "gh: command not found"
Install GitHub CLI: https://cli.github.com/

### "not authenticated"
```bash
gh auth login
```

### "base branch does not exist"
You need to create the main branch first (see Step 1 above)

## Full Documentation

For complete details, see:
- [PR Creation Guide](docs/PR_CREATION_GUIDE.md)
- [Scripts Documentation](scripts/README.md)

---

**Current Status:**
- ✓ Scripts created
- ✓ Documentation added
- ✗ Main branch missing (needs to be created)
- ✗ PR not yet created (waiting for main branch)
