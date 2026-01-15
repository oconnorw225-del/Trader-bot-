# Scripts Directory

This directory contains utility scripts for managing the NDAX Quantum Engine repository.

## Pull Request & Branch Management Scripts

### `generate-pr-data.sh`

**Purpose:** Generate pull request data for the current branch.

**Usage:**
```bash
bash scripts/generate-pr-data.sh
```

**What it does:**
- Analyzes the current branch
- Generates PR title and description
- Creates PR data files in `.github/pr-data/`
- Outputs command to create PR via GitHub CLI

**Output files:**
- `.github/pr-data/[branch-name]-pr-data.md` - Markdown formatted PR description
- `.github/pr-data/[branch-name]-pr-data.json` - JSON metadata for automation

**When to use:**
- You're on a feature branch and need to create a PR
- Repository doesn't have a main branch yet
- Need to generate PR templates for manual submission

### `create-branch-prs.sh`

**Purpose:** Bulk create pull requests for multiple branches listed in configuration.

**Usage:**
```bash
bash scripts/create-branch-prs.sh
```

**Configuration:**
- Reads branch list from `.github/branch-cleanup/branches.txt`
- Skips backup branches (starting with `backup/`)
- Checks for existing PRs before creating new ones

**Requirements:**
- GitHub CLI (`gh`) must be installed and authenticated
- Branches must exist on remote
- Base branch (main) must exist

**What it does:**
1. Reads branch list from config
2. For each branch:
   - Checks if it exists on remote
   - Checks if PR already exists
   - Analyzes commits and conflicts
   - Creates PR with labels and description
3. Generates summary report

**Labels applied:**
- `enhancement`
- `cleanup`
- `high-priority`

## Other Utility Scripts

### Branch Management
- `create-fix-branches.sh` - Create fix branches for conflicts

### Analysis & Monitoring
- `health-check.sh` - Check system health and dependencies
- `validate-startup.sh` - Validate system requirements
- `verify-build.sh` - Verify build integrity
- `verify-deployment.sh` - Verify deployment configuration

### Platform Integration
- `register-platforms.sh` - Register freelance platforms
- `ndax-endpoint-bot.js` - NDAX API endpoint testing
- `earnings-report.js` - Generate earnings reports
- `demo-earnings.js` - Demo earnings data

### Setup & Deployment
- `quick-setup.sh` - Quick setup wizard
- `start-production.sh` - Start in production mode

## Common Workflows

### Creating PRs for Branch Consolidation

1. **First time setup (no main branch):**
   ```bash
   # Create main branch from current state
   git checkout -b main
   git push origin main
   
   # Switch back to feature branch
   git checkout copilot/add-pull-request-data
   ```

2. **Generate PR data for current branch:**
   ```bash
   bash scripts/generate-pr-data.sh
   ```

3. **Create the PR:**
   ```bash
   # Using generated data
   gh pr create \
     --title "[branch-name] Pull Request: Description" \
     --body-file ".github/pr-data/branch-name-pr-data.md" \
     --base main \
     --head branch-name
   ```

### Bulk Creating PRs

1. **Update branch list:**
   ```bash
   # Edit .github/branch-cleanup/branches.txt
   # Add branches that actually exist on remote
   ```

2. **Run bulk creation:**
   ```bash
   bash scripts/create-branch-prs.sh
   ```

3. **Review results:**
   - Check console output for success/failure
   - Verify PRs on GitHub
   - Update `.github/branch-cleanup/report.md`

## Script Standards

All scripts in this directory follow these standards:

### Bash Script Structure
```bash
#!/bin/bash
set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Script configuration
VARIABLE="value"

# Functions
function_name() {
    local param=$1
    # Function logic
}

# Main execution
main() {
    # Main logic
}

main
```

### Best Practices
1. **Error handling:** Use `set -e` to exit on errors
2. **Color output:** Use color codes for readability
3. **Functions:** Organize code into logical functions
4. **Comments:** Document complex logic
5. **Validation:** Check prerequisites before running
6. **Feedback:** Provide clear success/error messages

## Troubleshooting

### "Command not found: gh"
Install GitHub CLI:
```bash
# macOS
brew install gh

# Linux (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh
```

### "Permission denied"
Make script executable:
```bash
chmod +x scripts/script-name.sh
```

### "Not authenticated"
Authenticate with GitHub:
```bash
gh auth login
```

### "Branch does not exist"
Fetch latest branches:
```bash
git fetch origin --all
git branch -r  # List remote branches
```

## Documentation

For more detailed information:
- [PR Creation Guide](../docs/PR_CREATION_GUIDE.md)
- [Repository README](../README.md)

## Contributing

When adding new scripts:
1. Follow the bash script standards above
2. Add documentation to this README
3. Test thoroughly before committing
4. Include usage examples
5. Add error handling and validation

---

*For more information, see the [main documentation](../docs/).*
