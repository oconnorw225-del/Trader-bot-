# Chimera Autonomous System - Quick Reference

**Version:** 2.1.0 | **Status:** ✅ Active | **Last Updated:** 2025-12-20

## 🚀 Quick Commands

### Status Checks
```bash
# Check if system is enabled
ls .chimera/AUTONOMOUS_ENABLED && echo "✅ Enabled" || echo "❌ Disabled"

# View configuration
cat .chimera/autonomous-config.json

# Check recent workflow runs
gh run list --limit 10

# View guardian status
gh run list --workflow=autonomous-guardian.yml --limit 5
```

### Manual Triggers
```bash
# Health check (with auto-fix)
gh workflow run chimera-autonomous.yml -f force_fixes=true

# Run maintenance
gh workflow run repo-maintenance.yml

# Repository consolidation (dry run)
gh workflow run smart-consolidation.yml -f dry_run=true

# Guardian monitoring
gh workflow run autonomous-guardian.yml

# Auto-fix specific issue
gh workflow run auto-fix.yml -f issue_number=123
```

### Emergency Controls
```bash
# EMERGENCY STOP - Immediate shutdown
touch .chimera/AUTONOMOUS_DISABLED
git add .chimera/AUTONOMOUS_DISABLED
git commit -m "🚨 Emergency stop"
git push

# Cancel all running workflows
gh run list --json databaseId --status in_progress | \
  jq -r '.[].databaseId' | xargs -I {} gh run cancel {}

# Re-enable after fixes
rm .chimera/AUTONOMOUS_DISABLED
git add .chimera/AUTONOMOUS_DISABLED
git commit -m "Re-enable autonomous system"
git push
```

## 📅 Default Schedules

| Workflow | Schedule | Frequency | Purpose |
|----------|----------|-----------|---------|
| Health Check | `0 */6 * * *` | Every 6 hours | Monitor code quality, tests, security |
| Maintenance | `0 0 * * 0` | Weekly (Sunday) | Update deps, cleanup branches |
| Consolidation | `0 2 * * 0` | Weekly (Sunday 2 AM) | Merge improvements from repos |
| Guardian | `0 * * * *` | Hourly | Safety monitoring, rate limits |

## ⚙️ Configuration Quick Edit

```bash
# Edit configuration
vim .chimera/autonomous-config.json

# Key settings to adjust:
{
  "tasks": {
    "health_checks": true,      // Enable/disable health monitoring
    "auto_fixes": true,          // Enable/disable automatic fixes
    "repository_consolidation": false  // Disable if not needed
  },
  "safety": {
    "max_prs_per_day": 10,      // Increase for more automation
    "max_issues_per_day": 20
  },
  "thresholds": {
    "lint_errors": 10,           // Adjust sensitivity
    "test_failures": 5
  }
}

# Commit changes
git add .chimera/autonomous-config.json
git commit -m "Update autonomous system config"
git push
```

## 🔍 Monitoring

### View Recent Activity
```bash
# List all autonomous PRs
gh pr list --label automated

# List autonomous issues
gh issue list --label autonomous-health-check

# View latest health report
gh run list --workflow=chimera-autonomous.yml --limit 1
gh run view <run-id> --log | grep -A 50 "health-report"

# Check guardian alerts
gh issue list --label guardian --state open
```

### Check System Health
```bash
# PR creation rate (last 24 hours)
gh pr list --label automated --json createdAt | \
  jq 'map(select(.createdAt > (now - 86400 | todate))) | length'

# Recent failures
gh run list --status failure --limit 10

# Active workflows
gh run list --status in_progress
```

## 🛡️ Safety Features

### Kill Switch
- **Location:** `.chimera/AUTONOMOUS_DISABLED`
- **Effect:** Stops ALL autonomous workflows immediately
- **Activation:** Create file and push to repository
- **Deactivation:** Delete file and push

### Rate Limits
- **PRs:** 10 per day (default, configurable)
- **Issues:** 20 per day (default, configurable)
- **Auto-stop:** Guardian activates kill switch if exceeded

### Guardian Protection
- **Frequency:** Hourly monitoring
- **Checks:** Rate limits, infinite loops, failures
- **Action:** Auto-disable on suspicious activity
- **Alerts:** Creates urgent issues on emergency stop

## 🔧 Common Tasks

### Adjust Rate Limits
```json
{
  "safety": {
    "max_prs_per_day": 15,    // Increase from 10
    "max_issues_per_day": 30   // Increase from 20
  }
}
```

### Disable Specific Features
```json
{
  "tasks": {
    "health_checks": true,
    "auto_fixes": false,               // Disable auto-fixes
    "repository_consolidation": false  // Disable consolidation
  }
}
```

### Change Schedules
Edit workflow YAML files:
```yaml
on:
  schedule:
    - cron: '0 */12 * * *'  # Every 12 hours instead of 6
```

### Custom Maintenance Tasks
```bash
# Run only security scan
gh workflow run repo-maintenance.yml -f tasks=security

# Run dependencies and security
gh workflow run repo-maintenance.yml -f tasks="dependencies,security"

# Run all tasks
gh workflow run repo-maintenance.yml -f tasks=all
```

## 📊 Understanding Reports

### Health Report Structure
```markdown
# Autonomous Health Check Report

**Date:** 2025-12-20 12:00:00 UTC
**Trigger:** schedule

## Summary
| Check | Status | Details |
|-------|--------|---------|
| Code Quality | ✅/⚠️ | X errors, Y warnings |
| Tests | ✅/⚠️ | X passing, Y failing |
| Dependencies | ✅/⚠️ | X outdated packages |
| Security | ✅/🚨 | X critical, Y high |
| Disk Usage | ✅/⚠️ | X% used |

## Actions Taken
- Health check completed
- Issues created (if thresholds exceeded)
```

### Guardian Report Structure
```markdown
# Autonomous Guardian Report

**Date:** 2025-12-20 13:00:00 UTC

## System Status
- Kill Switch: ✅ Inactive / 🛑 ACTIVE
- Rate Limit: X/10 PRs (24h)
- Recent Failures: X workflows (1h)
- Loop Detection: ✅ Normal / ⚠️ Detected

## Actions Taken
- Monitoring complete
- Emergency stop activated (if needed)
```

## 🚨 Troubleshooting

### Workflows Not Running
1. Check kill switch: `ls .chimera/AUTONOMOUS_DISABLED`
2. Verify workflow enabled: `gh workflow view chimera-autonomous.yml`
3. Check YAML syntax: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/chimera-autonomous.yml'))"`
4. Enable workflow: `gh workflow enable chimera-autonomous.yml`

### Too Many PRs Created
1. Check current rate: `gh pr list --label automated --json createdAt`
2. Guardian should auto-stop at 10/day
3. If not stopped, activate kill switch manually
4. Adjust rate limit in config after investigation

### Auto-Fix Not Working
1. Verify auto_fixes enabled in config
2. Check issue has correct label: `auto-fix` or `autonomous-task`
3. Review workflow logs: `gh run view --log`
4. Trigger manually: `gh workflow run auto-fix.yml -f issue_number=X`

### Consolidation Failing
1. Use dry run first: `gh workflow run smart-consolidation.yml -f dry_run=true`
2. Check source repo access
3. Review logs for git conflicts
4. Disable if not needed: Set `repository_consolidation: false` in config

## 📚 Documentation Links

- **Main Guide:** [AUTONOMOUS_SYSTEM.md](../AUTONOMOUS_SYSTEM.md)
- **Technical Details:** [docs/AUTONOMOUS_WORKFLOWS.md](AUTONOMOUS_WORKFLOWS.md)
- **README:** [README.md](../README.md#-using-the-autonomous-system)

## 🆘 Emergency Contacts

**For issues:**
- Create GitHub issue with label `autonomous-system`
- Tag maintainers if urgent

**For security concerns:**
- Activate kill switch immediately
- Create private security advisory
- Do not disable security scans

---

**Remember:** All autonomous operations create pull requests for review. Nothing is merged automatically without approval (unless explicitly configured). Always review PRs before merging!

**Version:** 2.1.0 | **Last Updated:** 2025-12-20
