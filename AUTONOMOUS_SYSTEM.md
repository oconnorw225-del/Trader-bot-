# Chimera Autonomous System Documentation

**Version:** 2.1.0  
**Status:** ✅ Active  
**Last Updated:** 2025-12-20

## 📋 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Autonomous Workflows](#autonomous-workflows)
- [Configuration](#configuration)
- [Safety Features](#safety-features)
- [Monitoring & Logging](#monitoring--logging)
- [Emergency Procedures](#emergency-procedures)
- [Integration](#integration)
- [FAQ](#faq)

## Overview

The Chimera Autonomous System is an intelligent automation framework that manages repository health, performs automatic fixes, and maintains code quality without human intervention. It operates alongside the existing NDAX Quantum Engine deployment and auto-start systems.

### Key Capabilities

✅ **Autonomous Health Monitoring** - Runs every 6 hours to check code quality, tests, dependencies, and security  
✅ **Auto-Fix System** - Automatically fixes common issues like linting errors and security vulnerabilities  
✅ **Repository Maintenance** - Weekly cleanup of dependencies, branches, and documentation  
✅ **Smart Consolidation** - Merges improvements from related repositories  
✅ **Guardian Protection** - Prevents runaway automation and enforces safety limits  
✅ **Kill Switch** - Emergency stop mechanism for immediate shutdown  

### What Tasks It Performs

The autonomous system continuously monitors and maintains:

1. **Code Quality** - Linting, formatting, and style consistency
2. **Test Coverage** - Running tests and fixing failures
3. **Security** - Scanning for vulnerabilities and applying fixes
4. **Dependencies** - Updating outdated packages
5. **Documentation** - Checking for broken links and TODOs
6. **Repository Health** - Disk usage, stale branches, old issues
7. **Performance** - Bundle size and optimization opportunities

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│            Chimera Autonomous System                     │
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Health Check    │         │  Auto-Fix        │     │
│  │  (Every 6h)      │────────▶│  (On Issues)     │     │
│  └──────────────────┘         └──────────────────┘     │
│           │                             │                │
│           │                             │                │
│           ▼                             ▼                │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Maintenance     │         │  Consolidation   │     │
│  │  (Weekly)        │         │  (Weekly)        │     │
│  └──────────────────┘         └──────────────────┘     │
│           │                             │                │
│           └──────────┬──────────────────┘                │
│                      │                                   │
│                      ▼                                   │
│           ┌──────────────────┐                          │
│           │  Guardian        │                          │
│           │  (Hourly)        │                          │
│           └──────────────────┘                          │
│                      │                                   │
│                      ▼                                   │
│           ┌──────────────────┐                          │
│           │  Kill Switch     │                          │
│           │  (Emergency)     │                          │
│           └──────────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

### Workflow Execution

1. **Scheduled Trigger** - Workflows run on cron schedules
2. **Kill Switch Check** - First step verifies system is not disabled
3. **Configuration Read** - Loads settings from `.chimera/autonomous-config.json`
4. **Task Execution** - Performs health checks, fixes, or maintenance
5. **Issue/PR Creation** - Creates issues for problems, PRs for fixes
6. **Guardian Monitoring** - Watches for rate limits, loops, failures
7. **Audit Logging** - Records all actions for transparency

## Autonomous Workflows

### 1. Chimera Autonomous Health Check

**File:** `.github/workflows/chimera-autonomous.yml`  
**Schedule:** Every 6 hours (`0 */6 * * *`)  
**Purpose:** Monitor repository health and detect issues

**What it checks:**
- Code quality (linting errors/warnings)
- Test results (passing/failing)
- Dependency status (outdated packages)
- Security vulnerabilities (critical/high)
- Disk usage

**Actions taken:**
- Creates issues for detected problems
- Triggers auto-fix workflow if configured
- Generates health reports
- Updates existing issues with new findings

**Manual trigger:**
```bash
gh workflow run chimera-autonomous.yml
```

### 2. Autonomous Auto-Fix

**File:** `.github/workflows/auto-fix.yml`  
**Trigger:** Issues labeled `autonomous-task` or `auto-fix`  
**Purpose:** Automatically fix common code problems

**What it fixes:**
- Linting errors (`npm run lint:fix`)
- Security vulnerabilities (`npm audit fix`)
- Outdated dependencies (`npm update`)

**Actions taken:**
- Analyzes issue to determine fix type
- Applies automatic fixes
- Runs tests to verify changes
- Creates PR with fixes
- Links PR to original issue

**Manual trigger:**
```bash
# Create an issue with 'auto-fix' label
gh issue create --title "Fix linting errors" --label "auto-fix"

# Or trigger directly
gh workflow run auto-fix.yml -f issue_number=123
```

### 3. Repository Maintenance

**File:** `.github/workflows/repo-maintenance.yml`  
**Schedule:** Weekly on Sunday (`0 0 * * 0`)  
**Purpose:** Perform routine repository maintenance

**Tasks performed:**
- Update dependencies (patch & minor versions)
- Identify stale branches (>30 days old)
- Archive old closed issues (>3 months)
- Check documentation for TODOs
- Run security scans
- Analyze performance metrics

**Actions taken:**
- Creates PR with dependency updates
- Generates reports on stale branches
- Labels old issues as 'archived'
- Creates maintenance summary

**Manual trigger:**
```bash
# Run all tasks
gh workflow run repo-maintenance.yml

# Run specific tasks
gh workflow run repo-maintenance.yml -f tasks=dependencies,security
```

### 4. Smart Repository Consolidation

**File:** `.github/workflows/smart-consolidation.yml`  
**Schedule:** Weekly on Sunday at 2 AM (`0 2 * * 0`)  
**Purpose:** Consolidate improvements from related repositories

**Source repositories:**
- `oconnorw225-del/quantum-engine-dashb`
- `oconnorw225-del/shadowforge-ai-trader`
- `oconnorw225-del/repository-web-app`

**What it does:**
- Clones source repositories
- Creates backup of current state
- Analyzes components across repos
- Identifies superior implementations
- (In live mode) Merges best components
- Runs tests to verify integration

**Actions taken:**
- Generates analysis report
- Creates consolidation PR (if changes made)
- Documents which components were merged

**Manual trigger:**
```bash
# Dry run (analysis only)
gh workflow run smart-consolidation.yml -f dry_run=true

# Live mode (with changes)
gh workflow run smart-consolidation.yml -f dry_run=false

# Custom repositories
gh workflow run smart-consolidation.yml -f source_repos="owner/repo1,owner/repo2"
```

### 5. Autonomous Guardian

**File:** `.github/workflows/autonomous-guardian.yml`  
**Schedule:** Hourly (`0 * * * *`)  
**Trigger:** Also runs after other autonomous workflows complete  
**Purpose:** Safety monitoring and emergency stop

**What it monitors:**
- Kill switch status
- PR creation rate (max 10/day by default)
- Workflow failure rate
- Infinite loop detection
- Suspicious activity patterns

**Actions taken:**
- Activates kill switch if rate limits exceeded
- Activates kill switch if loops detected
- Creates alert issues on emergency stops
- Generates guardian reports
- Prevents runaway automation

**Manual trigger:**
```bash
gh workflow run autonomous-guardian.yml
```

## Configuration

### Main Configuration File

**Location:** `.chimera/autonomous-config.json`

```json
{
  "enabled": true,
  "version": "2.1.0",
  
  "tasks": {
    "health_checks": true,
    "auto_fixes": true,
    "dependency_updates": true,
    "code_optimization": true,
    "security_scans": true,
    "repository_consolidation": true
  },
  
  "safety": {
    "max_prs_per_day": 10,
    "max_issues_per_day": 20,
    "rollback_on_failure": true,
    "notify_on_error": true
  },
  
  "thresholds": {
    "critical_vulnerabilities": 0,
    "high_vulnerabilities": 5,
    "lint_errors": 10,
    "test_failures": 5,
    "outdated_dependencies": 20,
    "disk_usage_percent": 80
  },
  
  "trading_safety": {
    "auto_trading_enabled": false,
    "require_manual_approval": true,
    "testnet_only": true
  }
}
```

### How to Configure Schedules

Edit the workflow files directly to change schedules:

```yaml
# Every 6 hours (default)
- cron: '0 */6 * * *'

# Every 12 hours
- cron: '0 */12 * * *'

# Daily at midnight
- cron: '0 0 * * *'

# Twice daily (noon and midnight)
- cron: '0 0,12 * * *'
```

### Enabling/Disabling Features

**Enable all features:**
```bash
# Ensure AUTONOMOUS_ENABLED file exists
touch .chimera/AUTONOMOUS_ENABLED

# Set all tasks to true in config
vim .chimera/autonomous-config.json
```

**Disable specific features:**
```json
{
  "tasks": {
    "health_checks": true,
    "auto_fixes": false,           // Disable auto-fixes
    "repository_consolidation": false  // Disable consolidation
  }
}
```

**Disable entire system:**
```bash
# Create kill switch file
touch .chimera/AUTONOMOUS_DISABLED

# Or delete enabled marker
rm .chimera/AUTONOMOUS_ENABLED
```

## Safety Features

### 1. Kill Switch

**Emergency stop mechanism that immediately halts all autonomous operations.**

**Activate manually:**
```bash
touch .chimera/AUTONOMOUS_DISABLED
git add .chimera/AUTONOMOUS_DISABLED
git commit -m "Emergency stop: Disable autonomous system"
git push
```

**Deactivate:**
```bash
rm .chimera/AUTONOMOUS_DISABLED
git add .chimera/AUTONOMOUS_DISABLED
git commit -m "Re-enable autonomous system"
git push
```

**Automatic activation:**
- Rate limit exceeded (>10 PRs/day)
- Infinite loop detected (same workflow runs >10 times/hour)
- Suspicious activity patterns

### 2. Rate Limiting

**Prevents spam and runaway automation.**

Default limits:
- **PRs:** 10 per day
- **Issues:** 20 per day
- **Workflow runs:** Monitored hourly

Configure in `.chimera/autonomous-config.json`:
```json
{
  "safety": {
    "max_prs_per_day": 15,      // Increase limit
    "max_issues_per_day": 30
  }
}
```

### 3. Rollback Capabilities

**Automatic rollback on failure:**
- All workflows create backups before making changes
- Failed deployments can be reverted
- Git history preserved for manual rollback

**Manual rollback:**
```bash
# Revert last autonomous commit
git revert HEAD

# Revert to before consolidation
git reset --hard <commit-before-consolidation>
git push --force-with-lease
```

### 4. Trading Safety

**CRITICAL: No autonomous trading without explicit approval.**

Default configuration:
```json
{
  "trading_safety": {
    "auto_trading_enabled": false,      // NEVER enable automatically
    "require_manual_approval": true,
    "testnet_only": true,               // Only testnet trades
    "max_trade_amount": 0               // No trades allowed
  }
}
```

**⚠️ WARNING:** Do not enable autonomous trading without:
1. Extensive testing in testnet mode
2. Manual approval workflow
3. Position size limits
4. Loss prevention mechanisms
5. Real-time monitoring

### 5. Audit Trail

**Every autonomous action is logged:**
- What was changed
- When it was changed
- Which workflow made the change
- Why the change was made

**View audit trail:**
```bash
# Check workflow run history
gh run list --workflow=chimera-autonomous.yml

# View specific run details
gh run view <run-id>

# Check guardian reports
gh run list --workflow=autonomous-guardian.yml
```

## Monitoring & Logging

### Dashboard

**GitHub Actions Dashboard:**
- Navigate to: `https://github.com/oconnorw225-del/ndax-quantum-engine/actions`
- View all workflow runs
- Check status of autonomous operations
- Access logs and artifacts

### Logs

**Workflow logs:**
- Each workflow run creates detailed logs
- Available for 90 days
- Downloadable as artifacts

**Key log files:**
- `health-report.md` - Health check results
- `maintenance-report.md` - Maintenance summary
- `guardian-report.md` - Safety monitoring
- `analysis-report.md` - Consolidation analysis

### Notifications

**GitHub Issues:**
- Automated issues created for problems
- Labels: `automated`, `autonomous-health-check`, `auto-fix`
- Issues updated with new findings

**Configure additional notifications:**
```json
{
  "notifications": {
    "email": {
      "enabled": true,
      "address": "your-email@example.com"
    },
    "slack": {
      "enabled": true,
      "webhook_url": "https://hooks.slack.com/..."
    }
  }
}
```

### Metrics

**Track autonomous system performance:**
- PRs created per day
- Issues resolved per week
- Workflow success rate
- Average fix time
- Security vulnerabilities patched

## Emergency Procedures

### Emergency Stop

**When to use:**
- System behaving unexpectedly
- Too many PRs/issues being created
- Workflows failing repeatedly
- Infinite loop suspected

**How to stop:**

1. **Immediate (GitHub UI):**
   - Go to Actions tab
   - Cancel running workflows
   - Create `.chimera/AUTONOMOUS_DISABLED` file via GitHub UI

2. **Command line:**
   ```bash
   # Stop all workflows
   gh run list --json databaseId --status in_progress | jq -r '.[].databaseId' | xargs -I {} gh run cancel {}
   
   # Activate kill switch
   touch .chimera/AUTONOMOUS_DISABLED
   git add .chimera/AUTONOMOUS_DISABLED
   git commit -m "🚨 Emergency stop"
   git push
   ```

3. **Verify stopped:**
   ```bash
   gh run list --limit 5
   # Should show no in_progress workflows
   ```

### Recovery Procedures

**After emergency stop:**

1. **Investigate:**
   - Review recent workflow runs
   - Check guardian reports
   - Identify root cause

2. **Fix issues:**
   - Address problems found
   - Update configuration if needed
   - Test fixes manually

3. **Re-enable system:**
   ```bash
   rm .chimera/AUTONOMOUS_DISABLED
   git add .chimera/AUTONOMOUS_DISABLED
   git commit -m "Re-enable autonomous system after fixes"
   git push
   ```

4. **Monitor closely:**
   - Watch first few workflow runs
   - Check PR/issue creation rates
   - Verify guardian reports

### Rollback Procedures

**If autonomous changes cause problems:**

1. **Revert specific PR:**
   ```bash
   gh pr list --label automated
   # Note PR number
   gh pr comment <PR-number> -b "Reverting due to issues"
   gh pr close <PR-number>
   
   # Create revert PR
   git revert <merge-commit>
   git push
   ```

2. **Restore from backup:**
   ```bash
   # Backups created in .github/workflows runs
   # Download from Actions artifacts
   
   # Extract and restore
   tar -xzf backup.tar.gz
   git add .
   git commit -m "Restore from backup"
   git push
   ```

3. **Hard reset (last resort):**
   ```bash
   # Find commit before autonomous changes
   git log --oneline | grep -v "🤖\|Automated"
   
   # Reset to that commit
   git reset --hard <commit-sha>
   git push --force-with-lease
   ```

## Integration

### With Existing Systems

**The autonomous system is designed to work alongside:**

1. **Deployment System** (Task 1)
   - Doesn't interfere with deployment workflows
   - Respects deployment locks
   - Coordinates with CI/CD pipeline

2. **Password Protection** (Task 2)
   - Doesn't modify authentication code
   - Respects security settings
   - Never exposes credentials

3. **Trading System**
   - **NO AUTONOMOUS TRADING** by default
   - Only analyzes, never executes trades
   - Requires manual approval for financial operations

4. **Auto-Start System**
   - Works in parallel with job automation
   - Doesn't modify platform credentials
   - Coordinates maintenance schedules

### API Integration

**Trigger workflows programmatically:**

```javascript
// Using Octokit (GitHub API)
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

await octokit.rest.actions.createWorkflowDispatch({
  owner: 'oconnorw225-del',
  repo: 'ndax-quantum-engine',
  workflow_id: 'chimera-autonomous.yml',
  ref: 'main',
  inputs: {
    force_fixes: 'true'
  }
});
```

**Check system status:**

```bash
# Via GitHub CLI
gh workflow view chimera-autonomous.yml

# Get recent runs
gh run list --workflow=chimera-autonomous.yml --limit 5

# Check if system is enabled
test -f .chimera/AUTONOMOUS_ENABLED && echo "Enabled" || echo "Disabled"
```

### Custom Workflows

**Add your own autonomous workflows:**

1. Create workflow file in `.github/workflows/`
2. Add kill switch check:
   ```yaml
   - name: Check for kill switch
     run: |
       if [ -f ".chimera/AUTONOMOUS_DISABLED" ]; then
         echo "System disabled"
         exit 0
       fi
   ```
3. Read configuration:
   ```yaml
   - name: Read config
     run: |
       cat .chimera/autonomous-config.json
   ```
4. Add to guardian monitoring
5. Document in this file

## FAQ

**Q: Will this system make trades automatically?**  
A: **NO.** Autonomous trading is disabled by default and requires explicit manual approval. The system only analyzes trading opportunities, never executes them.

**Q: How do I know if the system is working?**  
A: Check the Actions tab in GitHub. You should see scheduled workflow runs every 6 hours for health checks, weekly for maintenance.

**Q: Can I disable specific features?**  
A: Yes. Edit `.chimera/autonomous-config.json` and set tasks to `false`.

**Q: What if something goes wrong?**  
A: Use the kill switch: `touch .chimera/AUTONOMOUS_DISABLED` and push to GitHub. All workflows will stop immediately.

**Q: How much does this cost?**  
A: GitHub Actions provides 2,000 free minutes/month for private repos, unlimited for public repos. The autonomous system uses approximately 100-200 minutes/month.

**Q: Will it delete my code?**  
A: No. The system only creates PRs for review. You must manually merge changes. It never force-pushes or deletes code directly.

**Q: Can I review changes before they're applied?**  
A: Yes. All changes are made via pull requests that require manual review and approval before merging.

**Q: What about security?**  
A: The system scans for security vulnerabilities and can apply automatic fixes. All changes are audited and reversible.

**Q: How do I customize the schedules?**  
A: Edit the cron expressions in the workflow files (`.github/workflows/*.yml`).

**Q: Can I use this in my own project?**  
A: Yes! Copy the workflow files and configuration. Adjust settings for your needs.

**Q: What's the difference between this and GitHub Copilot?**  
A: GitHub Copilot suggests code during development. The Chimera system maintains code quality automatically after deployment.

**Q: Is this the original Chimera system?**  
A: This is an enhanced version inspired by the original concept, with improved safety features and integration with the current NDAX Quantum Engine.

## Support

**Issues:** Create a GitHub issue with label `autonomous-system`  
**Emergency:** Use kill switch immediately, then investigate  
**Questions:** Open a discussion in the GitHub Discussions tab  

**Related Documentation:**
- [AUTONOMOUS_WORKFLOWS.md](docs/AUTONOMOUS_WORKFLOWS.md) - Detailed workflow documentation
- [README-AUTOSTART.md](README-AUTOSTART.md) - Auto-start system integration
- [AUTONOMOUS_STARTUP.md](AUTONOMOUS_STARTUP.md) - Startup procedures

---

**Version:** 2.1.0  
**Last Updated:** 2025-12-20  
**Status:** ✅ Production Ready
