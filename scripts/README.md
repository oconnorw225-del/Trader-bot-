# Scripts Directory

This directory contains automation scripts for the NDAX Quantum Engine / Trader Bot system.

## Consolidation & Runtime Scripts

### Repository Consolidation

#### `consolidate-repos.sh`
Consolidates 5 source repositories into a unified structure with intelligent conflict resolution.

**Usage:**
```bash
# Dry-run mode (recommended first)
./scripts/consolidate-repos.sh --dry-run --verbose

# Full consolidation
./scripts/consolidate-repos.sh

# With options
./scripts/consolidate-repos.sh --skip-backup --verbose
```

**Features:**
- Clones 5 source repositories safely
- Creates timestamped backups (tar.gz)
- Validates repositories before consolidation
- Intelligent conflict resolution
- Detailed markdown reports
- Dry-run mode for safety
- Rollback capability

**Source Repositories:**
- `oconnorw225-del/ndax-quantum-engine` → API and documentation
- `oconnorw225-del/quantum-engine-dashb` → Frontend components
- `oconnorw225-del/shadowforge-ai-trader` → Backend strategy
- `oconnorw225-del/repository-web-app` → Web app frontend
- `oconnorw225-del/The-new-ones` → Additional components

**Documentation:** See consolidation report generated after run

### Chimera Bot Runtime

#### `start-runtime.sh`
Starts the Chimera Bot runtime system with unified server and monitoring.

**Usage:**
```bash
./scripts/start-runtime.sh
```

**Features:**
- Environment validation
- Safety checks (paper trading only)
- Unified server startup (Node.js)
- Chimera Bot startup (Python)
- Process monitoring
- Graceful shutdown
- Maximum 6-hour runtime

**Configuration:** `.chimera/runtime-config.json`

#### `monitor-runtime.sh`
Monitors the runtime system and generates reports.

**Usage:**
```bash
# Check system health
./scripts/monitor-runtime.sh health

# Collect metrics
./scripts/monitor-runtime.sh metrics

# Generate report
./scripts/monitor-runtime.sh report

# Detect anomalies
./scripts/monitor-runtime.sh anomalies

# Run all monitoring tasks
./scripts/monitor-runtime.sh all
```

**Features:**
- System health checks
- Performance metrics collection
- Hourly report generation
- Anomaly detection
- Resource usage monitoring

**Documentation:** `docs/CHIMERA_RUNTIME.md`

## Setup & Registration Scripts

### `quick-setup.sh`
Quick setup script for initializing the system.

**Usage:**
```bash
./scripts/quick-setup.sh
```

### `registration-wizard.js`
Interactive wizard for platform registration.

**Usage:**
```bash
npm run register
# or
node scripts/registration-wizard.js
```

## Validation Scripts

### `validate-startup.sh`
Validates system startup configuration.

**Usage:**
```bash
./scripts/validate-startup.sh
```

### `verify-build.sh`
Verifies the build process.

**Usage:**
```bash
./scripts/verify-build.sh
```

### `verify-deployment.sh`
Verifies deployment configuration.

**Usage:**
```bash
./scripts/verify-deployment.sh
```

### `verify-env.js`
Verifies environment variables.

**Usage:**
```bash
node scripts/verify-env.js
```

## Branch Management Scripts

### `consolidate-branches.sh`
Master consolidation script for branch management.

**Usage:**
```bash
./scripts/consolidate-branches.sh
```

### `create-branch-prs.sh`
Creates pull requests for branches.

**Usage:**
```bash
./scripts/create-branch-prs.sh
```

### `cleanup-branches.sh`
Cleans up old branches.

**Usage:**
```bash
./scripts/cleanup-branches.sh
```

### `merge-and-deduplicate-branches.sh`
Merges and deduplicates branches.

**Usage:**
```bash
./scripts/merge-and-deduplicate-branches.sh
```

## Trading & Earnings Scripts

### `ndax-endpoint-bot.js`
NDAX API endpoint testing bot.

**Usage:**
```bash
npm run ndax:test
# or
node scripts/ndax-endpoint-bot.js
```

### `earnings-report.js`
Generates earnings reports.

**Usage:**
```bash
# JSON format
npm run earnings:json

# Regular format
npm run earnings
```

### `demo-earnings.js`
Demo earnings report generator.

**Usage:**
```bash
npm run earnings:demo
# or
node scripts/demo-earnings.js
```

## Platform Scripts

### `register-platforms.js`
Registers trading platforms.

**Usage:**
```bash
node scripts/register-platforms.js
```

## Utility Scripts

### `lib-branch-utils.sh`
Library of branch utility functions (sourced by other scripts).

## Best Practices

### Before Running Scripts

1. **Read Documentation:**
   - Check script header comments
   - Review related documentation
   - Understand what the script does

2. **Dry-Run Mode:**
   - Use `--dry-run` when available
   - Test in safe environment first
   - Verify output before production

3. **Backup:**
   - Create backups before major operations
   - Use version control
   - Keep rollback plan ready

4. **Permissions:**
   - Ensure scripts are executable: `chmod +x script.sh`
   - Run with appropriate user permissions
   - Never run as root unless necessary

### Safety Checks

✅ Always use paper trading mode for Chimera Bot
✅ Verify environment variables before running
✅ Check configuration files are valid
✅ Review logs after execution
✅ Monitor resource usage

## Common Issues

### Script Won't Execute
```bash
# Make executable
chmod +x scripts/script-name.sh

# Check syntax
bash -n scripts/script-name.sh
```

### Missing Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### Configuration Errors
```bash
# Verify JSON configuration
jq empty .chimera/runtime-config.json

# Verify environment variables
node scripts/verify-env.js
```

## Getting Help

- **Documentation:** Check `docs/` directory
- **Issues:** Create GitHub issue
- **Logs:** Review script output and log files

## Contributing

When adding new scripts:

1. Add clear header comments
2. Include usage instructions
3. Implement error handling
4. Add to this README
5. Test thoroughly
6. Document in main docs

## Script Organization

```
scripts/
├── consolidate-repos.sh           # NEW: Repository consolidation
├── start-runtime.sh               # NEW: Runtime startup
├── monitor-runtime.sh             # NEW: Runtime monitoring
├── consolidate-branches.sh        # Branch consolidation
├── quick-setup.sh                 # System setup
├── registration-wizard.js         # Platform registration
├── validate-startup.sh            # Startup validation
├── verify-build.sh                # Build verification
├── verify-deployment.sh           # Deployment verification
├── verify-env.js                  # Environment verification
├── ndax-endpoint-bot.js           # NDAX testing
├── earnings-report.js             # Earnings reporting
├── demo-earnings.js               # Demo earnings
└── (other scripts...)
```

---

**⚠️ IMPORTANT:**
Always review script source code before execution. Ensure you understand what a script does, especially when it involves:
- API calls
- File system modifications
- System configuration changes
- Trading operations

**🔒 SECURITY:**
Never commit API keys, passwords, or sensitive data. Always use environment variables and `.env` files (which are gitignored).

---

*For detailed documentation, see `docs/` directory*
