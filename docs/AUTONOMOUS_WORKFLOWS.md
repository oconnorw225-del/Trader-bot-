# Autonomous Workflows - Detailed Documentation

**Version:** 2.1.0  
**Last Updated:** 2025-12-20

## 📑 Table of Contents

- [Overview](#overview)
- [Workflow Specifications](#workflow-specifications)
- [Workflow Dependencies](#workflow-dependencies)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

This document provides detailed technical documentation for all autonomous workflows in the Chimera system. Each workflow is designed to operate independently while coordinating through the Guardian monitoring system.

## Workflow Specifications

### 1. Chimera Autonomous Health Check

**File:** `.github/workflows/chimera-autonomous.yml`

#### Trigger Conditions
- **Schedule:** Cron `0 */6 * * *` (every 6 hours)
- **Manual:** `workflow_dispatch` with optional `force_fixes` input
- **Execution time:** ~5-10 minutes

#### Steps

1. **Repository Checkout**
   - Fetches full history (`fetch-depth: 0`)
   - Required for accurate git operations

2. **Kill Switch Verification**
   - Checks for `.chimera/AUTONOMOUS_DISABLED` file
   - Exits gracefully if found
   - Output: `disabled` (boolean)

3. **Environment Setup**
   - Node.js 18.x with npm cache
   - Installs dependencies via `npm ci`

4. **Code Quality Check**
   - Runs: `npm run lint`
   - Captures: Error count, warning count
   - Threshold: 10 errors triggers issue
   - Output: `lint-report.txt`

5. **Test Execution**
   - Runs: `npm test`
   - Captures: Passing count, failing count
   - Threshold: 5 failures triggers issue
   - Output: `test-report.txt`

6. **Dependency Audit**
   - Runs: `npm outdated`
   - Captures: Outdated package count
   - Threshold: 20 outdated triggers issue
   - Output: `deps-report.txt`

7. **Security Scan**
   - Runs: `npm audit --json`
   - Captures: Critical count, high count
   - Threshold: Any critical triggers issue
   - Output: `audit-report.json`

8. **Disk Usage Check**
   - Checks filesystem usage
   - Threshold: >80% triggers issue

9. **Report Generation**
   - Creates markdown report with all results
   - Includes status indicators (✅/⚠️/🚨)
   - Lists recommended actions

10. **Issue Management**
    - Updates existing health check issue if open
    - Creates new issue if none exists
    - Labels: `autonomous-health-check`, `automated`

11. **Auto-Fix Trigger**
    - Conditionally triggers auto-fix workflow
    - Only if `force_fixes` input is true
    - Only if issues detected

#### Outputs

**Files Created:**
- `health-report.md` - Comprehensive health analysis
- `lint-report.txt` - Linting results
- `test-report.txt` - Test results
- `deps-report.txt` - Dependency status
- `audit-report.json` - Security audit

**GitHub Actions:**
- Creates/updates issues
- Triggers auto-fix workflow (conditional)

#### Configuration

```json
{
  "tasks": {
    "health_checks": true
  },
  "thresholds": {
    "lint_errors": 10,
    "test_failures": 5,
    "outdated_dependencies": 20,
    "critical_vulnerabilities": 0
  }
}
```

---

### 2. Autonomous Auto-Fix

**File:** `.github/workflows/auto-fix.yml`

#### Trigger Conditions
- **Issue labeled:** `autonomous-task` or `auto-fix`
- **Manual:** `workflow_dispatch` with `issue_number` input
- **Execution time:** ~3-7 minutes

#### Steps

1. **Repository Checkout**
   - Full history for proper git operations

2. **Kill Switch Check**
   - Verifies system is enabled

3. **Environment Setup**
   - Node.js 18.x installation
   - Dependency installation

4. **Issue Parsing**
   - Extracts issue number, title, body
   - Determines fix type from title keywords:
     - `lint` → linting fixes
     - `test` → test fixes
     - `dependency` → dependency updates
     - `security` → security patches
   - Outputs: `issue_number`, `fix_type`, `title`

5. **Fix Application** (based on type)

   **Linting:**
   ```bash
   npm run lint:fix
   ```

   **Dependencies:**
   ```bash
   npm update
   ```

   **Security:**
   ```bash
   npm audit fix
   ```

6. **Change Detection**
   - Checks if files were modified
   - Sets `no_changes` flag

7. **Branch Creation**
   - Creates branch: `autofix/issue-<number>`
   - Commits changes with descriptive message
   - Pushes to remote

8. **Test Verification**
   - Runs full test suite
   - Logs results (non-blocking)

9. **PR Creation**
   - Creates pull request with:
     - Title: "🤖 Auto-fix: <issue-title>"
     - Body: Fix details, safety checks
     - Links to original issue
   - Adds labels: `automated`, `auto-fix`
   - Comments on original issue

10. **No Changes Handler**
    - Comments on issue if no fixes applied
    - Suggests manual intervention

#### Outputs

**Git Changes:**
- New branch: `autofix/issue-<number>`
- Committed fixes

**GitHub Actions:**
- Pull request created
- Issue commented
- Labels applied

#### Configuration

```json
{
  "tasks": {
    "auto_fixes": true
  },
  "safety": {
    "require_approval": false
  }
}
```

---

### 3. Repository Maintenance

**File:** `.github/workflows/repo-maintenance.yml`

#### Trigger Conditions
- **Schedule:** Cron `0 0 * * 0` (weekly, Sunday midnight)
- **Manual:** `workflow_dispatch` with `tasks` input
- **Execution time:** ~10-15 minutes

#### Tasks

**A. Dependency Updates**
- Runs: `npm update`
- Updates only patch and minor versions
- Creates report of changes
- Generates: `deps-report.md`

**B. Branch Cleanup**
- Fetches all branches
- Identifies stale branches (>30 days)
- Lists candidates for deletion
- Generates: `branch-report.md`

**C. Issue Archiving**
- Queries closed issues >3 months old
- Adds `archived` label
- Maintains issue history

**D. Documentation Check**
- Scans markdown files for TODO/FIXME
- Reports findings
- Non-blocking

**E. Security Scan**
- Runs: `npm audit --json`
- Parses vulnerability counts
- Generates: `security-report.md`
- Critical threshold: 0

**F. Performance Analysis**
- Checks package size
- Identifies large files (>1MB)
- Reports bundle size

#### Workflow

1. Kill switch check
2. Configuration read
3. Task execution (based on config)
4. Test execution (if dependencies updated)
5. PR creation (if changes made)
6. Report generation

#### Outputs

**Files Created:**
- `deps-report.md` - Dependency update details
- `branch-report.md` - Stale branch list
- `security-report.md` - Security findings
- `maintenance-report.md` - Summary

**GitHub Actions:**
- Pull request (if updates made)
- Issue labels (archived)

#### Configuration

```json
{
  "tasks": {
    "dependency_updates": true
  },
  "safety": {
    "max_prs_per_day": 10
  }
}
```

---

### 4. Smart Repository Consolidation

**File:** `.github/workflows/smart-consolidation.yml`

#### Trigger Conditions
- **Schedule:** Cron `0 2 * * 0` (weekly, Sunday 2 AM)
- **Manual:** `workflow_dispatch` with inputs:
  - `dry_run` - Analysis only (default: true)
  - `source_repos` - Custom repo list
- **Execution time:** ~15-30 minutes

#### Steps

1. **Kill Switch & Config Check**
   - Verifies system enabled
   - Reads consolidation settings

2. **Repository Cloning**
   - Clones specified source repositories:
     - `quantum-engine-dashb`
     - `shadowforge-ai-trader`
     - `repository-web-app`
   - Handles private/missing repos gracefully

3. **Backup Creation**
   - Creates timestamped backup
   - Excludes: node_modules, .git, dist
   - Saves as: `backups/pre-consolidation-<timestamp>.tar.gz`

4. **Analysis Phase**
   - Counts files per repository
   - Identifies key components:
     - Quantum trading modules
     - AI components
     - Dashboard implementations
   - Generates analysis report

5. **Component Identification**
   - Maps components to source repos
   - Identifies superior implementations
   - Documents in report

6. **Extraction & Merging** (live mode only)
   - Copies superior components
   - Merges package.json dependencies
   - Updates documentation
   - Preserves current configuration

7. **Test Verification**
   - Runs: `npm ci && npm test`
   - Validates integration

8. **PR Creation**
   - Creates consolidation PR
   - Includes analysis report
   - Labels: `automated`, `consolidation`

#### Outputs

**Files Created:**
- `analysis-report.md` - Component analysis
- `backups/pre-consolidation-*.tar.gz` - State backup

**GitHub Actions:**
- Pull request (live mode with changes)

#### Configuration

```json
{
  "tasks": {
    "repository_consolidation": true
  },
  "consolidation": {
    "enabled": true,
    "dry_run_default": true,
    "source_repositories": [
      "oconnorw225-del/quantum-engine-dashb",
      "oconnorw225-del/shadowforge-ai-trader"
    ],
    "backup_before_merge": true
  }
}
```

---

### 5. Autonomous Guardian

**File:** `.github/workflows/autonomous-guardian.yml`

#### Trigger Conditions
- **Schedule:** Cron `0 * * * *` (hourly)
- **Workflow completion:** After any autonomous workflow
- **Manual:** `workflow_dispatch`
- **Execution time:** ~2-5 minutes

#### Monitoring Functions

**A. Kill Switch Status**
- Checks for `.chimera/AUTONOMOUS_DISABLED`
- Reports current state
- Output: `status` (enabled/disabled)

**B. Safety Configuration**
- Reads max PRs/day setting
- Reads rollback setting
- Outputs: `max_prs`, `rollback_enabled`

**C. Rate Limit Check**
- Queries PRs created in last 24 hours
- Filters for automated PRs
- Compares against threshold
- Output: `pr_count`, `rate_exceeded`

**D. Failure Monitoring**
- Lists recent workflow runs
- Counts failures in last hour
- Output: `failure_count`, `has_failures`

**E. Loop Detection**
- Tracks workflow run frequency
- Detects >10 runs/hour of same workflow
- Output: `loop_detected`

**F. Suspicious Activity**
- Counts open automated issues
- Threshold: >50 issues
- Output: `suspicious`

#### Actions

**Emergency Stop (Rate Limit):**
- Creates `.chimera/AUTONOMOUS_DISABLED`
- Commits with reason
- Pushes to repository

**Emergency Stop (Loop Detected):**
- Creates `.chimera/AUTONOMOUS_DISABLED`
- Documents loop details
- Pushes to repository

**Alert Creation:**
- Creates urgent issue
- Labels: `urgent`, `automated`, `guardian`
- Includes guardian report
- Provides recovery instructions

#### Outputs

**Files Created:**
- `guardian-report.md` - Status summary

**GitHub Actions:**
- Kill switch file (emergency)
- Alert issues (emergency)

**System State:**
- Autonomous system disabled (emergency)

#### Configuration

```json
{
  "safety": {
    "max_prs_per_day": 10,
    "enable_kill_switch": true,
    "rate_limit_monitoring": true
  }
}
```

---

## Workflow Dependencies

### Dependency Graph

```
Guardian (Hourly) ──┐
                     │
Health Check (6h) ───┼──> Creates Issues ──> Auto-Fix (On Label)
                     │
Maintenance (Weekly) │
                     │
Consolidation (Weekly)
                     │
                     └──> Monitors All ──> Emergency Stop
```

### Interaction Rules

1. **Health Check → Auto-Fix**
   - Health check creates issues
   - Auto-fix responds to issue labels

2. **All Workflows → Guardian**
   - Guardian monitors all workflow completions
   - Checks for failures, loops, rate limits

3. **Guardian → Kill Switch**
   - Guardian activates kill switch on emergency
   - All workflows check kill switch first

4. **Maintenance ⊥ Consolidation**
   - Run at different times to avoid conflicts
   - Both respect safety limits

## Configuration Reference

### Complete Configuration Schema

```json
{
  "enabled": true,
  "version": "2.1.0",
  "description": "Chimera Autonomous System Configuration",
  
  "schedule": {
    "health_check": "0 */6 * * *",    // Every 6 hours
    "maintenance": "0 0 * * 0",        // Sunday midnight
    "consolidation": "0 2 * * 0",      // Sunday 2 AM
    "guardian": "0 * * * *"            // Every hour
  },
  
  "tasks": {
    "health_checks": true,             // Enable health monitoring
    "auto_fixes": true,                // Enable automatic fixes
    "dependency_updates": true,        // Enable dep updates
    "code_optimization": true,         // Enable optimization
    "security_scans": true,            // Enable security scans
    "repository_consolidation": true   // Enable consolidation
  },
  
  "safety": {
    "require_approval": false,         // Auto-merge (not recommended)
    "max_prs_per_day": 10,            // Rate limit
    "max_issues_per_day": 20,         // Issue limit
    "rollback_on_failure": true,       // Auto-rollback
    "notify_on_error": true,           // Create alert issues
    "enable_kill_switch": true,        // Enable emergency stop
    "rate_limit_monitoring": true      // Monitor rates
  },
  
  "thresholds": {
    "critical_vulnerabilities": 0,     // Max critical CVEs
    "high_vulnerabilities": 5,         // Max high CVEs
    "lint_errors": 10,                 // Max lint errors
    "test_failures": 5,                // Max test failures
    "outdated_dependencies": 20,       // Max outdated packages
    "disk_usage_percent": 80           // Max disk usage
  },
  
  "integrations": {
    "copilot": true,                   // GitHub Copilot integration
    "github_actions": true,            // GitHub Actions enabled
    "auto_start_system": true          // Auto-start integration
  },
  
  "trading_safety": {
    "auto_trading_enabled": false,     // NEVER enable automatically
    "require_manual_approval": true,   // Always require approval
    "testnet_only": true,              // Testnet mode only
    "max_trade_amount": 0,             // No trades allowed
    "trading_hours": []                // No trading hours
  },
  
  "consolidation": {
    "enabled": true,                   // Enable consolidation
    "dry_run_default": true,           // Default to analysis only
    "source_repositories": [
      "oconnorw225-del/quantum-engine-dashb",
      "oconnorw225-del/shadowforge-ai-trader",
      "oconnorw225-del/repository-web-app"
    ],
    "backup_before_merge": true,       // Always backup first
    "run_tests_after_merge": true      // Verify after merge
  },
  
  "notifications": {
    "email": {
      "enabled": false,
      "address": ""
    },
    "slack": {
      "enabled": false,
      "webhook_url": ""
    },
    "github_issues": {
      "enabled": true,                 // Create GitHub issues
      "create_on_error": true,         // On errors
      "update_existing": true          // Update existing issues
    }
  },
  
  "logging": {
    "level": "info",                   // Log level
    "audit_trail": true,               // Enable audit logging
    "retention_days": 30               // Log retention
  },
  
  "workflow_permissions": {
    "create_prs": true,                // Can create PRs
    "create_issues": true,             // Can create issues
    "modify_code": true,               // Can modify code
    "update_dependencies": true,       // Can update deps
    "merge_prs": false,                // Cannot auto-merge
    "close_issues": false              // Cannot auto-close
  }
}
```

## Troubleshooting

### Common Issues

**1. Workflows Not Running**

**Symptoms:** No scheduled runs appearing

**Causes:**
- Kill switch active
- Repository archived
- Workflow disabled
- Syntax errors in YAML

**Solutions:**
```bash
# Check kill switch
ls -la .chimera/AUTONOMOUS_DISABLED

# Verify workflow syntax
gh workflow view chimera-autonomous.yml

# Enable workflow
gh workflow enable chimera-autonomous.yml

# Trigger manually
gh workflow run chimera-autonomous.yml
```

**2. Rate Limit Exceeded**

**Symptoms:** Guardian activated kill switch

**Causes:**
- Too many PRs created
- Infinite loop
- Configuration too aggressive

**Solutions:**
```bash
# Check recent PRs
gh pr list --label automated --limit 20

# Adjust rate limit
vim .chimera/autonomous-config.json
# Increase max_prs_per_day

# Re-enable system
rm .chimera/AUTONOMOUS_DISABLED
git add .chimera/
git commit -m "Re-enable with adjusted limits"
git push
```

**3. Auto-Fix Not Working**

**Symptoms:** Issues created but no PRs

**Causes:**
- Auto-fix disabled in config
- No fixable issues
- Workflow permissions insufficient

**Solutions:**
```bash
# Enable auto-fix
vim .chimera/autonomous-config.json
# Set "auto_fixes": true

# Check workflow permissions
gh workflow view auto-fix.yml

# Manually trigger
gh workflow run auto-fix.yml -f issue_number=123
```

**4. Consolidation Failing**

**Symptoms:** Consolidation workflow fails

**Causes:**
- Source repositories private/missing
- Git conflicts
- Test failures after merge

**Solutions:**
```bash
# Use dry run mode
gh workflow run smart-consolidation.yml -f dry_run=true

# Check source repo access
gh repo view oconnorw225-del/quantum-engine-dashb

# Review logs
gh run view --log
```

## Best Practices

### 1. Configuration Management

**DO:**
- ✅ Start with conservative settings
- ✅ Test changes in dry-run mode first
- ✅ Document configuration changes
- ✅ Review guardian reports regularly

**DON'T:**
- ❌ Disable kill switch
- ❌ Set rate limits too high
- ❌ Enable autonomous trading
- ❌ Ignore emergency alerts

### 2. Monitoring

**Daily:**
- Check Actions dashboard
- Review new issues/PRs
- Verify guardian reports

**Weekly:**
- Analyze workflow success rates
- Review consolidated changes
- Update configuration if needed

**Monthly:**
- Audit autonomous actions
- Review security scans
- Optimize thresholds

### 3. Safety

**Always:**
- Keep kill switch functional
- Monitor rate limits
- Review PRs before merging
- Maintain audit trail

**Never:**
- Auto-merge without review
- Disable safety features
- Ignore guardian warnings
- Enable autonomous trading

### 4. Maintenance

**Regular:**
- Update workflow actions versions
- Review and update thresholds
- Clean up old backups
- Archive old reports

**As Needed:**
- Adjust schedules for timezone
- Add custom notifications
- Extend workflow capabilities
- Document custom changes

## Examples

### Example 1: Manual Health Check

```bash
# Trigger health check with auto-fix
gh workflow run chimera-autonomous.yml -f force_fixes=true

# Wait for completion
gh run watch

# View report
gh run view --log | grep "health-report"
```

### Example 2: Custom Maintenance

```bash
# Run only security scan
gh workflow run repo-maintenance.yml -f tasks=security

# Run dependencies and security
gh workflow run repo-maintenance.yml -f tasks="dependencies,security"
```

### Example 3: Emergency Stop

```bash
# Immediate stop
touch .chimera/AUTONOMOUS_DISABLED
echo "Emergency stop at $(date)" >> .chimera/AUTONOMOUS_DISABLED
git add .chimera/AUTONOMOUS_DISABLED
git commit -m "🚨 Emergency stop"
git push

# Cancel running workflows
gh run list --json databaseId --status in_progress | \
  jq -r '.[].databaseId' | \
  xargs -I {} gh run cancel {}
```

### Example 4: Recovery After Emergency

```bash
# 1. Investigate
gh run list --limit 10
gh run view <failed-run-id> --log

# 2. Fix issues
# (make necessary changes)

# 3. Test manually
npm test
npm run lint

# 4. Re-enable
rm .chimera/AUTONOMOUS_DISABLED
git add .chimera/
git commit -m "Re-enable autonomous system after fixes"
git push

# 5. Monitor
gh run list --workflow=autonomous-guardian.yml --limit 5
```

### Example 5: Custom Consolidation

```bash
# Analyze specific repositories
gh workflow run smart-consolidation.yml \
  -f dry_run=true \
  -f source_repos="owner/repo1,owner/repo2"

# Wait and review report
gh run watch

# If good, run live consolidation
gh workflow run smart-consolidation.yml \
  -f dry_run=false \
  -f source_repos="owner/repo1,owner/repo2"
```

---

**Version:** 2.1.0  
**Last Updated:** 2025-12-20  
**Maintainer:** Chimera Autonomous System Team
