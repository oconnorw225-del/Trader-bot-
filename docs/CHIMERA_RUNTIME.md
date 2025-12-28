# Chimera Bot Runtime System

**Version:** 1.0.0  
**Last Updated:** 2025-12-28  
**Status:** Production Ready

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the System](#running-the-system)
- [Monitoring and Reporting](#monitoring-and-reporting)
- [Safety Features](#safety-features)
- [Troubleshooting](#troubleshooting)
- [Emergency Procedures](#emergency-procedures)
- [FAQ](#faq)

## Overview

The Chimera Bot Runtime System is a comprehensive automated trading platform that runs the Chimera Bot in **paper trading mode** with full monitoring, reporting, and safety features. The system is designed for continuous operation with automatic health checks, metrics collection, and graceful error handling.

### Key Features

- ✅ **Paper Trading Only** - All trading is simulated, no real money at risk
- ✅ **Automated Monitoring** - Continuous health checks and metrics collection
- ✅ **Hourly Reporting** - Detailed reports every hour
- ✅ **Safety Lock** - Multiple safety mechanisms to prevent accidental live trading
- ✅ **Auto-Recovery** - Automatic restart on failures (up to 3 attempts)
- ✅ **Emergency Stop** - Immediate shutdown capability via workflow cancellation
- ✅ **Comprehensive Logging** - All operations logged for auditing

### Components

1. **Unified Server** (Node.js) - Primary backend server on port 3000
2. **Chimera Bot** (Python) - Trading bot with risk management
3. **Monitoring System** - Health checks and metrics collection
4. **Reporting System** - Hourly and daily reports
5. **GitHub Actions Workflow** - Automated scheduling and execution

## Architecture

```
┌─────────────────────────────────────────────────────┐
│             GitHub Actions Workflow                  │
│  (Scheduled every 6 hours or manual trigger)        │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  Runtime Controller    │
         │  (start-runtime.sh)    │
         └───────┬────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│Unified Server│  │ Chimera Bot  │
│  (Node.js)   │  │   (Python)   │
│  Port 3000   │  │ Paper Trading│
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                ▼
     ┌─────────────────────┐
     │ Monitoring System    │
     │ (monitor-runtime.sh) │
     └─────────────────────┘
                │
                ▼
     ┌─────────────────────┐
     │ Reports & Metrics    │
     │  (Artifacts)         │
     └─────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed
- GitHub repository cloned
- GitHub CLI (`gh`) configured (for consolidation only)
- `jq` installed for JSON parsing

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/oconnorw225-del/Trader-bot-.git
   cd Trader-bot-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   pip install -r requirements.txt
   pip install -r chimera-bot/requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Verify configuration:**
   ```bash
   cat .chimera/runtime-config.json
   ```

### Quick Start

**Manual Run (Local):**
```bash
# Start the runtime system
./scripts/start-runtime.sh

# Monitor in another terminal
./scripts/monitor-runtime.sh all
```

**Scheduled Run (GitHub Actions):**
The system runs automatically every 6 hours via GitHub Actions. You can also trigger it manually:
1. Go to Actions tab in GitHub
2. Select "Chimera Bot Runtime System"
3. Click "Run workflow"
4. Choose parameters and run

## Configuration

### Runtime Configuration (`.chimera/runtime-config.json`)

Main configuration file for the runtime system:

```json
{
  "system_name": "Chimera Bot Runtime System",
  "enabled": true,
  "mode": "paper",
  "runtime_settings": {
    "schedule": "0 */6 * * *",
    "duration_hours": 6,
    "auto_restart": true,
    "max_restarts": 3
  },
  "chimera_bot": {
    "trading_mode": "paper",
    "risk_level": "moderate",
    "max_position_size": 0.1,
    "max_daily_loss": 0.05
  },
  "safety": {
    "safety_lock": true,
    "emergency_stop_enabled": true,
    "max_runtime_hours": 6,
    "paper_trading_only": true
  }
}
```

**Key Settings:**

| Setting | Description | Default | Constraints |
|---------|-------------|---------|-------------|
| `enabled` | System enabled status | `true` | Must be `true` to run |
| `mode` | Trading mode | `paper` | Only `paper` allowed |
| `duration_hours` | Runtime duration | `6` | Max 6 hours |
| `risk_level` | Risk management level | `moderate` | conservative/moderate/aggressive |
| `safety_lock` | Safety lock enabled | `true` | Must be `true` |

### Environment Variables

Required environment variables in `.env`:

```bash
# Chimera Bot Runtime
CHIMERA_RUNTIME_ENABLED=true
TRADING_MODE=paper
RISK_LEVEL=moderate
MAX_POSITION_SIZE=0.1
MAX_DAILY_LOSS=0.05
PLATFORM=ndax
TESTNET=true

# Safety
SAFETY_LOCK=true
USE_LIVE_TRADING=false

# Monitoring
REPORTING_INTERVAL=3600
LOG_LEVEL=INFO
ENABLE_METRICS=true
```

## Running the System

### Local Execution

**Start the system:**
```bash
./scripts/start-runtime.sh
```

This will:
1. Validate environment and safety settings
2. Start unified server on port 3000
3. Start Chimera Bot in paper trading mode
4. Monitor processes for maximum runtime duration
5. Gracefully shutdown when time expires

**Output:**
```
╔════════════════════════════════════════════╗
║   Chimera Bot Runtime Startup              ║
║   v1.0.0 - Paper Trading Mode              ║
╚════════════════════════════════════════════╝

[INFO] Validating environment...
[SUCCESS] Environment validation passed
[INFO] Checking safety settings...
[SUCCESS] Safety checks passed
[INFO] Trading Mode: paper
[INFO] Risk Level: moderate
[INFO] Starting unified server...
[SUCCESS] Unified server started (PID: 12345)
[INFO] Starting Chimera Bot in paper trading mode...
[SUCCESS] Chimera Bot started (PID: 12346)
[SUCCESS] Runtime system started successfully
[INFO] Runtime will end at: 2025-12-28 21:00:00
```

### GitHub Actions Execution

**Automatic (Scheduled):**
The workflow runs automatically every 6 hours according to the cron schedule.

**Manual Trigger:**
1. Navigate to GitHub Actions
2. Select "Chimera Bot Runtime System" workflow
3. Click "Run workflow"
4. Configure parameters:
   - Trading Mode: `paper` or `test`
   - Risk Level: `conservative`, `moderate`, or `aggressive`
   - Duration: `1` to `6` hours
5. Click "Run workflow"

**Workflow Steps:**
1. ✅ Setup environment (Node.js + Python)
2. ✅ Install dependencies
3. ✅ Validate configuration
4. ✅ Start unified server
5. ✅ Start Chimera Bot
6. ✅ Monitor runtime (health checks every 5 minutes)
7. ✅ Generate hourly reports
8. ✅ Graceful shutdown
9. ✅ Upload artifacts (logs, reports, metrics)

## Monitoring and Reporting

### Real-time Monitoring

**Check system health:**
```bash
./scripts/monitor-runtime.sh health
```

**Collect metrics:**
```bash
./scripts/monitor-runtime.sh metrics
```

**Generate report:**
```bash
./scripts/monitor-runtime.sh report
```

**Run all monitoring tasks:**
```bash
./scripts/monitor-runtime.sh all
```

### Metrics Collected

- **System Metrics:**
  - CPU usage (%)
  - Memory usage (MB and %)
  - Disk usage (%)
  - System uptime

- **Application Metrics:**
  - Process status (running/stopped)
  - Error count
  - Warning count
  - Health status

- **Trading Metrics:**
  - Number of trades (paper)
  - Position sizes
  - Risk metrics
  - Performance indicators

### Reports

**Hourly Reports:**
Generated automatically every hour during runtime. Contains:
- System health summary
- Resource usage
- Process status
- Recent errors/warnings
- Recommendations

**Example Report Location:**
```
runtime-reports/runtime-report-20251228-150000.md
```

**Daily Summary:**
Comprehensive daily report including:
- Total runtime
- All metrics aggregated
- Error summary
- Performance analysis

### Viewing Reports

**Local:**
```bash
cat runtime-reports/runtime-report-*.md
```

**GitHub Actions:**
1. Go to Actions tab
2. Click on workflow run
3. Scroll to Artifacts section
4. Download "runtime-logs-XXX"
5. Extract and view reports

## Safety Features

### Multi-Layer Safety System

1. **Configuration Safety:**
   - `safety_lock` must be `true`
   - `trading_mode` must be `paper` or `test`
   - `testnet` must be `true`
   - Real trading explicitly disabled

2. **Environment Safety:**
   - `USE_LIVE_TRADING=false` enforced
   - `SAFETY_LOCK=true` required
   - Testnet mode mandatory

3. **Runtime Safety:**
   - Maximum runtime: 6 hours
   - Auto-shutdown on critical errors
   - Process monitoring every 5 minutes
   - Resource usage limits enforced

4. **Emergency Stop:**
   - Immediate shutdown via workflow cancellation
   - Graceful shutdown with 60-second timeout
   - Force kill if necessary

### Safety Checks

**Pre-flight Checks:**
```bash
# These checks are performed before starting:
✓ Configuration validation
✓ Safety lock verification
✓ Trading mode verification
✓ Environment variables check
✓ Required files check
```

**Runtime Checks:**
```bash
# Continuous monitoring during operation:
✓ Process health (every 5 minutes)
✓ Resource usage (every 5 minutes)
✓ Error rate monitoring
✓ Anomaly detection
```

### Circuit Breaker

Automatic shutdown triggers:
- Error rate > 5%
- Critical errors detected
- Memory usage > 90%
- CPU usage > 90% sustained
- Process crashes

## Troubleshooting

### Common Issues

**Issue: "Runtime configuration not found"**
```bash
# Solution: Create configuration file
cp .chimera/autonomous-config.json .chimera/runtime-config.json
# Edit to include runtime settings
```

**Issue: "Safety lock is not enabled"**
```bash
# Solution: Enable safety lock in config
jq '.safety.safety_lock = true' .chimera/runtime-config.json > tmp.json
mv tmp.json .chimera/runtime-config.json
```

**Issue: "Failed to start unified server"**
```bash
# Solution: Check if port is available
lsof -i :3000
# Kill process using port or change PORT in config

# Check server logs
tail -f unified-server.log
```

**Issue: "Chimera Bot stopped unexpectedly"**
```bash
# Solution: Check bot logs
tail -f chimera-bot.log

# Common causes:
# - Missing dependencies: pip install -r chimera-bot/requirements.txt
# - API key issues: Check .env file
# - Configuration errors: Validate runtime-config.json
```

**Issue: "High resource usage"**
```bash
# Check system resources
./scripts/monitor-runtime.sh metrics

# Solution: Reduce runtime duration or restart system
```

### Debug Mode

Enable verbose logging:
```bash
export LOG_LEVEL=DEBUG
./scripts/start-runtime.sh
```

View detailed logs:
```bash
tail -f chimera-runtime.log
```

### Log Locations

| Component | Log File |
|-----------|----------|
| Runtime System | `chimera-runtime.log` |
| Unified Server | `unified-server.log` |
| Chimera Bot | `chimera-bot.log` |
| Monitoring | `runtime-reports/*.md` |
| Metrics | `runtime-metrics.json` |

## Emergency Procedures

### Emergency Stop

**Method 1: Workflow Cancellation (Recommended)**
1. Go to GitHub Actions
2. Find the running workflow
3. Click "Cancel workflow"
4. System will gracefully shutdown within 60 seconds

**Method 2: Kill Switch**
```bash
# Create kill switch file locally
touch .chimera/RUNTIME_DISABLED

# Or via GitHub
echo "DISABLED" > .chimera/RUNTIME_DISABLED
git add .chimera/RUNTIME_DISABLED
git commit -m "Emergency stop: Runtime disabled"
git push
```

**Method 3: Direct Process Kill**
```bash
# Find PIDs
cat chimera-runtime.pid.server
cat chimera-runtime.pid.bot

# Kill processes
kill -TERM <PID>
# If not responding after 30 seconds:
kill -KILL <PID>
```

### System Recovery

**After Emergency Stop:**
1. Review logs to identify issue
2. Fix the root cause
3. Remove kill switch if used
4. Validate configuration
5. Restart system

```bash
# Remove kill switch
rm .chimera/RUNTIME_DISABLED

# Validate before restart
./scripts/monitor-runtime.sh health

# Restart
./scripts/start-runtime.sh
```

### Rollback Procedures

If system is misbehaving after updates:

```bash
# Git rollback
git log --oneline
git checkout <previous-commit>

# Or revert specific file
git checkout HEAD~1 .chimera/runtime-config.json

# Restart system
./scripts/start-runtime.sh
```

## FAQ

**Q: Is real money being used?**
A: No. The system operates in PAPER TRADING MODE ONLY. All trades are simulated. Multiple safety mechanisms prevent real trading.

**Q: How do I know it's safe?**
A: Check safety indicators:
- `SAFETY_LOCK=true` in config
- `trading_mode=paper` enforced
- `USE_LIVE_TRADING=false` in env
- All logs show "paper" mode

**Q: Can I run this continuously?**
A: The system is designed for 6-hour sessions. For continuous operation, the workflow will restart automatically every 6 hours.

**Q: What happens if it crashes?**
A: Auto-recovery will attempt to restart (up to 3 times). If that fails, an issue is created on GitHub for investigation.

**Q: How do I view the results?**
A: Reports are generated hourly and uploaded as GitHub Actions artifacts. Download and view them locally.

**Q: Can I change the trading strategy?**
A: Yes, modify `chimera-bot/strategy/chimera_core.py`. Test thoroughly before deployment.

**Q: How do I increase/decrease risk?**
A: Adjust `risk_level` in workflow inputs: conservative/moderate/aggressive. Never exceeds defined limits.

**Q: What if I want to stop it immediately?**
A: Cancel the workflow in GitHub Actions. System will shutdown within 60 seconds.

**Q: Are there any costs?**
A: No costs for paper trading. GitHub Actions has free tier limits (2000 minutes/month for free accounts).

**Q: How do I know if it's working?**
A: Check:
1. Workflow status in GitHub Actions
2. Artifacts uploaded after run
3. No error issues created
4. Reports show "healthy" status

## Support and Contributions

### Getting Help

- **Documentation:** Read this guide thoroughly
- **Issues:** Create GitHub issue with detailed description
- **Logs:** Always include relevant logs when reporting issues

### Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Version History

- **v1.0.0** (2025-12-28) - Initial release
  - Paper trading runtime system
  - Automated monitoring and reporting
  - GitHub Actions workflow
  - Comprehensive safety features

---

**⚠️ SAFETY REMINDER:**
This system operates in PAPER TRADING MODE ONLY. No real funds are at risk. All safety features are designed to prevent accidental live trading. Always verify safety settings before running.

**📊 MONITORING:**
The system generates comprehensive logs and reports. Review them regularly to ensure optimal performance and detect any issues early.

**🚀 AUTOMATION:**
The GitHub Actions workflow provides fully automated operation with minimal manual intervention. Set it and monitor it!

---

*For questions or issues, please create a GitHub issue or refer to the troubleshooting section above.*
