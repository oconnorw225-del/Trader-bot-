# Autonomous Startup & Operation Guide

## 🤖 Overview

Complete guide for running NDAX Quantum Engine in **fully autonomous mode** - the system will automatically start, seek work, execute tasks, earn money, and deposit to your NDAX wallet without manual intervention.

## 🎯 What is Autonomous Mode?

Autonomous mode enables the NDAX Quantum Engine to:

1. **🚀 Start Automatically** - Launch on system boot or schedule
2. **🔍 Seek Work** - Continuously scan 12 AI job platforms + 6 freelance platforms
3. **🎯 Select Tasks** - AI-powered task selection based on success rate & payment
4. **⚡ Execute** - Complete tasks automatically using AI orchestration
5. **✅ Submit** - Automated quality checks and submission
6. **💰 Earn** - Receive payments to NDAX wallet
7. **📈 Learn** - Improve strategy based on success/failure feedback
8. **🔄 Repeat** - 24/7 operation with minimal supervision

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│             Autonomous Control System                │
│                                                       │
│  ┌────────────────────────────────────────────┐    │
│  │         AutoStartManager                    │    │
│  │  - Platform Registration                    │    │
│  │  - Job Scanning (30s intervals)            │    │
│  │  - Queue Management                         │    │
│  └────────────────────────────────────────────┘    │
│                        │                             │
│         ┌──────────────┼──────────────┐            │
│         │              │               │            │
│  ┌──────▼─────┐ ┌─────▼─────┐ ┌──────▼──────┐    │
│  │  Strategy   │ │  Success  │ │   Learn     │    │
│  │  Selector   │ │ Predictor │ │   Engine    │    │
│  └─────────────┘ └───────────┘ └─────────────┘    │
│                                                       │
│  ┌────────────────────────────────────────────┐    │
│  │      Platform Communication Layer           │    │
│  │                                              │    │
│  │  [Toloka] [Remotasks] [RapidWorkers] ...   │    │
│  │  [Upwork] [Fiverr] [Freelancer] ...        │    │
│  └────────────────────────────────────────────┘    │
│                        │                             │
│                        ▼                             │
│  ┌────────────────────────────────────────────┐    │
│  │          NDAX Wallet Integration            │    │
│  │      Automatic Earnings Deposit             │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### System Requirements

- **OS:** Linux, macOS, or Windows
- **Node.js:** 18+ LTS
- **Python:** 3.8+
- **RAM:** 2GB minimum, 4GB recommended
- **Disk:** 1GB free space
- **Network:** Stable internet connection

### Account Requirements

1. **NDAX Account** - Verified with API access
2. **Platform Accounts** - At least 3 AI job platforms registered
3. **Email** - For notifications and account verification
4. **2FA** - Enabled on all platforms

## 🔧 Step 1: Initial Setup

### A. Environment Configuration

Edit `.env` file with all required credentials:

```bash
# ===================================
# AUTONOMOUS MODE CONFIGURATION
# ===================================

# Enable Autonomous Mode
AUTOSTART_ENABLED=true
AUTOSTART_STRATEGY=balanced  # aggressive, balanced, conservative

# Job Platform Configuration
AUTOSTART_SCAN_INTERVAL=30000           # Scan every 30 seconds
AUTOSTART_MAX_CONCURRENT_JOBS=5         # Max simultaneous tasks
AUTOSTART_MIN_PAYMENT=0.01              # Minimum $0.01 per task
AUTOSTART_MAX_TASK_DURATION=3600        # Max 1 hour per task

# Learning & Optimization
ENABLE_FEEDBACK_LEARNING=true
SUCCESS_PREDICTION_ENABLED=true
AUTO_STRATEGY_OPTIMIZATION=true

# ===================================
# PLATFORM API KEYS (12 Platforms)
# ===================================

# Easy Platforms (Quick approval, instant payout)
TOLOKA_API_KEY=your_toloka_key
REMOTASKS_API_KEY=your_remotasks_key
RAPIDWORKERS_API_KEY=your_rapidworkers_key
CLICKWORKER_API_KEY=your_clickworker_key
MICROWORKERS_API_KEY=your_microworkers_key

# Medium Platforms (Good pay, weekly payout)
APPEN_API_KEY=your_appen_key
DATALOOP_API_KEY=your_dataloop_key
HIVE_API_KEY=your_hive_key
SPARE5_API_KEY=your_spare5_key

# Professional Platforms (High pay, monthly payout)
SCALEAI_API_KEY=your_scaleai_key
LIONBRIDGE_API_KEY=your_lionbridge_key
LABELBOX_API_KEY=your_labelbox_key

# ===================================
# FREELANCE PLATFORMS (6 Platforms)
# ===================================

UPWORK_CLIENT_ID=your_client_id
UPWORK_CLIENT_SECRET=your_client_secret
FIVERR_API_KEY=your_fiverr_key
FREELANCER_OAUTH_TOKEN=your_freelancer_token
TOPTAL_API_KEY=your_toptal_key
GURU_API_KEY=your_guru_key
PEOPLEPERHOUR_API_KEY=your_peopleperhour_key

# ===================================
# AI SERVICES
# ===================================

OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key

# ===================================
# NDAX WALLET INTEGRATION
# ===================================

NDAX_API_KEY=your_ndax_key
NDAX_API_SECRET=your_ndax_secret
NDAX_USER_ID=your_user_id

# Auto-deposit earnings to NDAX
AUTO_DEPOSIT_ENABLED=true
AUTO_DEPOSIT_THRESHOLD=100    # Deposit when balance > $100
AUTO_DEPOSIT_FREQUENCY=daily  # daily, weekly, monthly

# ===================================
# CRYPTO PAYOUT (Alternative)
# ===================================

CRYPTO_PAYOUT_ADDRESS=0xYourWalletAddress
ENABLE_CRYPTO_PAYOUTS=false

# ===================================
# NOTIFICATIONS
# ===================================

NOTIFICATION_EMAIL=your-email@example.com
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_WEBHOOK_NOTIFICATIONS=true
WEBHOOK_URL=https://your-webhook-url.com/notify

# ===================================
# SECURITY
# ===================================

ENCRYPTION_KEY=your_32_char_encryption_key
JWT_SECRET=your_jwt_secret_key_32_chars
```

### B. Platform Registration

Run the automated registration wizard:

```bash
npm run register
```

This will:
1. Test all API connections
2. Register with available platforms
3. Verify account status
4. Set up payment methods
5. Configure preferences

Expected output:
```
✅ Toloka - Connected (Balance: $0.00)
✅ Remotasks - Connected (Balance: $0.00)
✅ RapidWorkers - Connected (Balance: $0.00)
⚠️  Scale AI - Requires manual approval
✅ Appen - Connected (Balance: $0.00)
...
✓ 9/12 platforms connected
```

### C. Validate Setup

```bash
# Run system diagnostic
node scripts/verify-env.js

# Expected output:
# ✅ Node.js version: 18.x.x
# ✅ Python version: 3.8+
# ✅ NDAX API: Connected
# ✅ Platform APIs: 9/12 connected
# ✅ Database: Initialized
# ✅ Encryption: Configured
# ✅ Auto-start: Ready
```

## 🚀 Step 2: Start Autonomous Mode

### Option A: Manual Start

```bash
# Build frontend
npm run build

# Start backend (autonomous mode auto-starts)
npm start
```

### Option B: Docker

```bash
# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option C: System Service (Linux)

Create systemd service:

```bash
sudo nano /etc/systemd/system/ndax-quantum.service
```

Content:
```ini
[Unit]
Description=NDAX Quantum Engine
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/ndax-quantum-engine
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ndax-quantum
sudo systemctl start ndax-quantum
sudo systemctl status ndax-quantum
```

### Option D: Windows Service

Use NSSM (Non-Sucking Service Manager):

```powershell
# Install NSSM
choco install nssm

# Install service
nssm install NDaxQuantum "C:\Program Files\nodejs\npm.cmd" start
nssm set NDaxQuantum AppDirectory "C:\path\to\ndax-quantum-engine"
nssm start NDaxQuantum
```

## 📊 Step 3: Monitor Operations

### A. Web Dashboard

Access at: `http://localhost:3000`

**Key Sections:**
- **Dashboard** - Real-time stats (jobs completed, earnings, success rate)
- **Activity Log** - Detailed event history
- **Platform Status** - Connected platforms and balances
- **Performance Metrics** - Success rate by platform

### B. API Monitoring

Check status via API:

```bash
# System health
curl http://localhost:3000/api/health

# Auto-start status
curl http://localhost:3000/api/autostart/status

# Recent jobs
curl http://localhost:3000/api/autostart/jobs?limit=10

# Earnings summary
curl http://localhost:3000/api/autostart/earnings
```

### C. Logs

View real-time logs:

```bash
# Full logs
tail -f logs/autostart.log

# Errors only
tail -f logs/error.log

# Platform-specific
tail -f logs/toloka.log
```

## 🎯 Step 4: Strategy Configuration

### Strategy Types

#### 1. Conservative Strategy
- **Target:** $5-10/day
- **Risk:** Low
- **Platforms:** Easy platforms only (Toloka, RapidWorkers)
- **Task Types:** Simple data entry, surveys
- **Concurrent Jobs:** 2-3
- **Success Rate:** 90%+

```bash
curl -X POST http://localhost:3000/api/autostart/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "type": "conservative",
    "maxConcurrentJobs": 3,
    "minPayment": 0.02,
    "platforms": ["toloka", "rapidworkers", "clickworker"]
  }'
```

#### 2. Balanced Strategy (Recommended)
- **Target:** $15-25/day
- **Risk:** Medium
- **Platforms:** Mix of easy and medium platforms
- **Task Types:** Data labeling, transcription, simple coding
- **Concurrent Jobs:** 5
- **Success Rate:** 85%+

```bash
curl -X POST http://localhost:3000/api/autostart/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "type": "balanced",
    "maxConcurrentJobs": 5,
    "minPayment": 0.05,
    "platforms": ["toloka", "remotasks", "appen", "dataloop"]
  }'
```

#### 3. Aggressive Strategy
- **Target:** $30-50/day
- **Risk:** High
- **Platforms:** All platforms including professional
- **Task Types:** Complex coding, AI training, content creation
- **Concurrent Jobs:** 10
- **Success Rate:** 70%+

```bash
curl -X POST http://localhost:3000/api/autostart/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "type": "aggressive",
    "maxConcurrentJobs": 10,
    "minPayment": 0.10,
    "platforms": ["all"]
  }'
```

## 🔄 Step 5: Autonomous Workflow

### How It Works

```
1. SCANNING (every 30s)
   └─> AutoStartManager scans all platforms for new jobs
   
2. FILTERING
   └─> Filters by: payment, difficulty, success prediction, queue capacity
   
3. TASK SELECTION
   └─> StrategySelector ranks tasks by expected value
   
4. EXECUTION
   └─> AI Orchestrator completes task
       ├─> Content Generation (if needed)
       ├─> Plagiarism Check
       └─> Quality Assurance
   
5. SUBMISSION
   └─> Automatic submission to platform
   
6. VERIFICATION
   └─> Platform reviews and approves
   
7. PAYMENT
   └─> Earnings added to platform balance
   
8. WITHDRAWAL (when threshold met)
   └─> Auto-withdraw to NDAX wallet
   
9. LEARNING
   └─> Feedback loop improves future task selection
   
10. REPEAT
    └─> Continuous operation 24/7
```

### Example Autonomous Cycle

**Time: 00:00:00** - System starts
```
✅ AutoStartManager initialized
✅ 9 platforms connected
✅ Starting job scan...
```

**Time: 00:00:30** - First scan complete
```
📊 Found 47 available jobs
🎯 Filtered to 12 suitable tasks
⚡ Selected 3 highest-value tasks
```

**Time: 00:01:00** - Task execution begins
```
🔄 Task 1: Image labeling (Toloka) - $0.05
🔄 Task 2: Text classification (Remotasks) - $0.08
🔄 Task 3: Data entry (RapidWorkers) - $0.03
```

**Time: 00:02:30** - Tasks completed
```
✅ Task 1: Completed (95% confidence)
✅ Task 2: Completed (88% confidence)
✅ Task 3: Completed (92% confidence)
💰 Earnings: $0.16
```

**Time: 00:03:00** - Next scan
```
📊 Found 51 available jobs
🎯 Processing...
```

## 💰 Step 6: Earnings Management

### Automatic NDAX Deposits

Configure auto-deposit:

```javascript
{
  "autoDeposit": {
    "enabled": true,
    "threshold": 100,         // Deposit when balance > $100
    "frequency": "daily",     // daily, weekly, monthly
    "destination": "NDAX",
    "keepMinimum": 20,        // Keep $20 for platform fees
    "notification": true
  }
}
```

### Manual Withdrawal

```bash
# Withdraw all earnings to NDAX
curl -X POST http://localhost:3000/api/autostart/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "NDAX",
    "amount": "all"
  }'
```

### Earnings Tracking

View earnings dashboard:
- **Today:** $24.50 (47 tasks)
- **This Week:** $156.80 (289 tasks)
- **This Month:** $612.40 (1,234 tasks)
- **All Time:** $1,847.90 (3,891 tasks)

**By Platform:**
- Toloka: $456.20 (987 tasks)
- Remotasks: $389.50 (654 tasks)
- RapidWorkers: $201.30 (1,123 tasks)
- Others: $800.90 (1,127 tasks)

## 🛡️ Step 7: Safety & Monitoring

### Health Checks

Automated health monitoring:
- **System Resources** - CPU, Memory, Disk
- **Network Status** - Internet connectivity
- **Platform Status** - API availability
- **Task Success Rate** - Real-time tracking
- **Error Rate** - Alert on high error rate

### Alerts

Configure alerts:

```javascript
{
  "alerts": {
    "email": "your-email@example.com",
    "conditions": {
      "lowSuccessRate": 0.70,      // Alert if < 70%
      "highErrorRate": 0.10,        // Alert if > 10%
      "platformDown": true,         // Alert if platform offline
      "dailyEarningsLow": 10,       // Alert if < $10/day
      "systemError": true           // Alert on any error
    }
  }
}
```

### Emergency Stop

Stop autonomous mode immediately:

```bash
# Via API
curl -X POST http://localhost:3000/api/autostart/stop

# Via CLI
npm run stop

# Via Dashboard
Dashboard → Auto-Start → Stop Button
```

## 🔧 Step 8: Optimization

### A. Performance Tuning

Monitor and optimize:

1. **Success Rate** - Target 85%+
   - If lower: Reduce difficulty, focus on easy platforms
   - Analyze failed tasks for patterns

2. **Earnings per Hour** - Target $5-10/hour
   - If lower: Increase concurrent jobs, select higher-paying tasks
   - Review platform mix

3. **Task Completion Time** - Target <5 minutes/task
   - If longer: Optimize AI models, improve code efficiency

### B. Learning & Adaptation

The system learns from:
- ✅ Successful tasks → Prioritize similar tasks
- ❌ Failed tasks → Avoid similar tasks
- 💰 High-paying tasks → Seek more like these
- ⏱️ Quick tasks → Maximize throughput

### C. Strategy Adjustment

Auto-adjustment based on performance:

```javascript
// If success rate drops below 80% for 1 hour
if (successRate < 0.80 && duration > 3600) {
  // Automatically switch to conservative strategy
  switchStrategy('conservative');
}

// If earnings exceed target
if (dailyEarnings > targetEarnings * 1.5) {
  // Maintain current strategy
  logSuccess('Strategy performing well');
}
```

## 📱 Step 9: Mobile Monitoring

### Mobile App

Access mobile interface: `http://localhost:3000/mobile`

**Features:**
- 📊 Real-time stats
- 🔔 Push notifications
- ⏸️ Start/Stop controls
- 💰 Earnings tracker
- 📈 Performance graphs

### Remote Access

Set up secure remote access:

1. Install Tailscale or similar VPN
2. Access from anywhere: `http://your-device-ip:3000`
3. Use HTTPS for production

## 🆘 Troubleshooting

### Low Earnings

**Problem:** Earning less than expected

**Solutions:**
1. Check platform availability (may be low job volume)
2. Increase concurrent jobs
3. Lower minimum payment threshold
4. Expand to more platforms
5. Switch to aggressive strategy

### High Error Rate

**Problem:** Many tasks failing

**Solutions:**
1. Switch to conservative strategy
2. Focus on easier platforms (Toloka, RapidWorkers)
3. Check AI model performance
4. Review task types - may be too complex
5. Update AI models

### Platform Connection Issues

**Problem:** Platforms going offline

**Solutions:**
1. Check API credentials
2. Verify platform status (may be down)
3. Check rate limits (may be throttled)
4. Wait and retry (automatic retry every 5 minutes)
5. Disable problematic platform temporarily

### System Performance

**Problem:** System running slow

**Solutions:**
1. Check system resources (CPU, RAM)
2. Reduce concurrent jobs
3. Clear logs and cache
4. Restart system
5. Optimize database

## 📚 Advanced Configuration

### Custom Task Filters

```javascript
{
  "taskFilters": {
    "minPayment": 0.05,
    "maxDuration": 600,           // 10 minutes max
    "preferredTypes": [
      "data_entry",
      "image_labeling",
      "text_classification"
    ],
    "excludeTypes": [
      "phone_verification",
      "video_creation"
    ],
    "languages": ["en"],
    "regions": ["US", "CA", "UK"]
  }
}
```

### Custom AI Models

Train custom models for specific task types:

```javascript
import { aiOrchestrator } from './src/freelance/ai/orchestrator.js';

// Register custom model
aiOrchestrator.registerModel({
  name: 'custom-classifier',
  type: 'NLP',
  endpoint: 'http://your-model-api.com/classify',
  capabilities: ['text-classification', 'sentiment-analysis']
});
```

## 🎓 Best Practices

1. **Start Conservative** - Begin with conservative strategy, scale up gradually
2. **Monitor Daily** - Check dashboard daily for first week
3. **Optimize Weekly** - Review and optimize strategy weekly
4. **Diversify Platforms** - Don't rely on single platform
5. **Maintain Quality** - High success rate = more task opportunities
6. **Keep Updated** - Update platform credentials when they expire
7. **Backup Configuration** - Save successful configurations
8. **Scale Gradually** - Increase concurrent jobs slowly
9. **Rest Periods** - Schedule maintenance windows
10. **Stay Compliant** - Follow platform terms of service

## 📊 Expected Performance

### Conservative Strategy
- **Daily Earnings:** $5-10
- **Monthly Earnings:** $150-300
- **Success Rate:** 90%+
- **Time Investment:** 10-20 hours/week (monitoring)

### Balanced Strategy
- **Daily Earnings:** $15-25
- **Monthly Earnings:** $450-750
- **Success Rate:** 85%+
- **Time Investment:** 5-10 hours/week (monitoring)

### Aggressive Strategy
- **Daily Earnings:** $30-50
- **Monthly Earnings:** $900-1,500
- **Success Rate:** 70%+
- **Time Investment:** 2-5 hours/week (monitoring)

## 🎉 Success Checklist

- [ ] All platform APIs configured
- [ ] NDAX wallet connected
- [ ] Auto-start enabled
- [ ] Strategy selected and configured
- [ ] Monitoring dashboard accessible
- [ ] Alerts configured
- [ ] First successful task completed
- [ ] First payout received
- [ ] System running 24/7
- [ ] Earnings meeting targets

---

**Congratulations!** Your NDAX Quantum Engine is now running autonomously. The system will work 24/7 to earn money and deposit it to your NDAX wallet. Check the dashboard regularly and optimize as needed.

**Version:** 2.1.0  
**Last Updated:** 2025-12-20  
**Status:** ✅ Production Ready
