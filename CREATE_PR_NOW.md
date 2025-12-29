# STEP-BY-STEP: Create Your First Pull Request

This is the simplest possible guide to create a PR from the `copilot/add-pull-request-data` branch.

## Prerequisites Check

Run this command to check if you're ready:
```bash
gh auth status
```

If it fails, run:
```bash
gh auth login
```

## Step 1: Create Main Branch (1 command)

Pick **ONE** of these options:

### Option A: Quick (Recommended)
```bash
git push origin HEAD:refs/heads/main
```

### Option B: From Initial Commit
```bash
git checkout -b main 8dd1539f214460f288ab75717725d58f96bd4c09
git push origin main
git checkout copilot/add-pull-request-data
```

## Step 2: Generate PR Data (1 command)

```bash
bash scripts/generate-pr-data.sh
```

This creates the PR description in `.github/pr-data/`

## Step 3: Create the PR (1 command)

```bash
gh pr create \
  --title "[copilot/add-pull-request-data] Add PR creation tools and documentation" \
  --body-file ".github/pr-data/copilot-add-pull-request-data-pr-data.md" \
  --base main \
  --head copilot/add-pull-request-data \
  --label "enhancement"
```

## Done! 🎉

Your PR is now created. View it on GitHub.

---

## Alternative: Use the Interactive Script

If you prefer a guided approach:

```bash
bash scripts/init-pr-creation.sh
```

Follow the prompts and it will do everything for you.

---

## Alternative: Use GitHub Web Interface

1. First create main branch (Step 1 above)
2. Go to: https://github.com/oconnorw225-del/Trader-bot-/compare
3. Set:
   - Base: `main`
   - Compare: `copilot/add-pull-request-data`
4. Click "Create Pull Request"
5. Copy content from `.github/pr-data/copilot-add-pull-request-data-pr-data.md`
6. Paste as PR description
7. Click "Create Pull Request"

---

## Troubleshooting

**Error: base branch does not exist**
→ Do Step 1 first

**Error: gh command not found**
→ Install: https://cli.github.com/

**Error: not authenticated**
→ Run: `gh auth login`

---

**Need more help?** See [QUICKSTART_PR.md](QUICKSTART_PR.md) or [docs/PR_CREATION_GUIDE.md](docs/PR_CREATION_GUIDE.md)
