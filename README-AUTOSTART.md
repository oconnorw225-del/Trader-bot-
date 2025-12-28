# Auto-Start System Documentation

## Overview

The NDAX Auto-Start System is an autonomous job platform integration system that automatically discovers, evaluates, and executes micro-tasks across 12 AI job platforms. It includes mobile control, real-time monitoring, and intelligent job strategy selection.

## Features

### 🤖 Autonomous Operation
- Continuous job scanning every 30 seconds
- Automatic job discovery and execution
- Smart platform health monitoring
- Configurable concurrent job limits

### 📱 Mobile Control App
- Real-time earnings dashboard (today/week/month/total)
- Big START/STOP button for system control
- 4 job strategy modes (quick-payout, big-yield, guaranteed-completion, balanced)
- Live platform status monitoring
- Real-time alert system with push notifications
- Emergency stop button for immediate shutdown

### 🎯 Job Strategies

#### Balanced (Default)
Optimal mix using weighted scoring:
- 40% payment amount
- 30% payout speed
- 20% success rate
- 10% difficulty

Best for: Consistent earnings with manageable risk

#### Quick Payout
Prioritizes instant and weekly payout jobs. Perfect for fast cash flow.

Best for: Immediate income needs

#### Big Yield
Targets high-paying jobs ($0.05+). Maximum earnings per task.

Best for: Maximizing hourly rate

#### Guaranteed Completion
Easy jobs with 90%+ success rate. Minimal risk of rejection.

Best for: Building reputation and steady income

### 🌐 Supported Platforms

| Platform | Auto-Approval | Payout Speed | Avg Payout | Success Rate | Difficulty |
|----------|--------------|--------------|------------|--------------|------------|
| **Toloka** | ✅ | Weekly | $0.05 | 85% | Easy |
| **Remotasks** | ✅ | Weekly | $0.10 | 88% | Medium |
| **RapidWorkers** | ✅ | Instant | $0.03 | 92% | Easy |
| **Scale AI** | ❌ | Weekly | $0.20 | 75% | Hard |
| **Appen** | ❌ | Monthly | $0.15 | 80% | Medium |
| **Lionbridge** | ❌ | Monthly | $0.18 | 78% | Hard |
| **Clickworker** | ✅ | Weekly | $0.08 | 86% | Easy |
| **Microworkers** | ✅ | Instant | $0.05 | 90% | Easy |
| **Dataloop** | ❌ | Biweekly | $0.12 | 82% | Medium |
| **Labelbox** | ❌ | Monthly | $0.25 | 70% | Hard |
| **Hive** | ✅ | Weekly | $0.10 | 84% | Medium |
| **Spare5** | ✅ | Instant | $0.02 | 95% | Easy |

**Legend:**
- ✅ Auto-Approval: Jobs start immediately without manual review
- ❌ Requires Approval: Manual approval needed (1-2 days)

## Quick Start

### 1. Initial Setup (First Time Only)

```bash
# Clone repository
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine

# Run quick setup (installs dependencies, creates .env, generates keys)
npm run setup
```

### 2. Register on Platforms (10-15 minutes)

```bash
# Run interactive registration wizard
npm run register
```

The wizard will:
1. Ask for your base email (e.g., `you@gmail.com`)
2. Generate unique emails for each platform (e.g., `you+toloka@gmail.com`)
3. Generate secure passwords for each platform
4. Open signup pages in your browser
5. Guide you through registration
6. Save API keys to `.env` automatically

**Tips:**
- Use Gmail's + addressing to create unique emails for each platform
- Save generated passwords in a password manager
- You need at least 3 platforms for optimal results
- Platforms with auto-approval are easiest to start with

### 3. Start the System

```bash
# Start backend server and auto-start system
npm start
```

### 4. Open Mobile App

Visit: `http://localhost:3000/mobile`

From here you can:
- View real-time earnings
- Start/stop the system
- Switch job strategies on the fly
- Monitor platform status
- Approve high-value jobs requiring manual review
- Emergency stop if needed

## API Endpoints

### Auto-Start System

#### Initialize System
```http
POST /api/autostart/initialize
```
Starts autonomous job scanning and execution.

Response:
```json
{
  "success": true,
  "status": "running",
  "message": "Auto-start system initialized",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Stop System
```http
POST /api/autostart/stop
```

#### Emergency Stop
```http
POST /api/autostart/emergency-stop
```
Stops system and cancels all active jobs.

### Platforms

#### Get Platform Status
```http
GET /api/autostart/platforms/status
```

Response:
```json
{
  "success": true,
  "platforms": [
    {
      "id": "toloka",
      "name": "Toloka",
      "status": "connected",
      "connected": true,
      "lastScanned": "2024-01-01T00:00:00.000Z",
      "jobsCompleted": 15,
      "earnings": 0.75
    }
  ],
  "count": 12,
  "connected": 8
}
```

#### Connect Platform
```http
POST /api/autostart/platforms/connect
Content-Type: application/json

{
  "platformId": "toloka",
  "apiKey": "your_api_key_here"
}
```

### Strategy

#### Change Strategy
```http
POST /api/autostart/strategy/change
Content-Type: application/json

{
  "strategy": "quick-payout"
}
```

Available strategies:
- `balanced` (default)
- `quick-payout`
- `big-yield`
- `guaranteed-completion`

#### List Strategies
```http
GET /api/autostart/strategy/list
```

### Jobs

#### Approve Job
```http
POST /api/autostart/jobs/:jobId/approve
```

#### Cancel Job
```http
POST /api/autostart/jobs/:jobId/cancel
```

### Status

#### Get Complete Status
```http
GET /api/autostart/status/complete
```

Returns complete system status including:
- Running state
- Current strategy
- All platform statuses
- Statistics (jobs completed, earnings, success rate)
- Active jobs count

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Bot Configuration
BOT_NAME=NDAX-Bot
BOT_EMAIL=your_email@example.com

# Auto-Start Configuration
AUTOSTART_STRATEGY=balanced           # Default strategy
AUTOSTART_SCAN_INTERVAL=30000         # Scan every 30 seconds
AUTOSTART_MAX_CONCURRENT_JOBS=5       # Max 5 jobs at once
AUTOSTART_MIN_PAYMENT=0.01            # Minimum $0.01 per job

# Security (generated by setup script)
ENCRYPTION_KEY=your_32_character_encryption_key
JWT_SECRET=your_jwt_secret_key

# Platform API Keys (filled by registration wizard)
TOLOKA_API_KEY=your_toloka_api_key
REMOTASKS_API_KEY=your_remotasks_api_key
# ... etc for all 12 platforms
```

### Programmatic Configuration

```javascript
import { AutoStartManager } from './src/services/AutoStartManager.js';

const manager = new AutoStartManager({
  strategy: 'balanced',
  scanInterval: 30000,
  maxConcurrentJobs: 5,
  minPayment: 0.01,
  encryptionKey: process.env.ENCRYPTION_KEY
});

// Start system
await manager.start();

// Listen to events
manager.on('job:completed', (job) => {
  console.log(`Earned $${job.earnings}`);
});

manager.on('job:approval-required', (job) => {
  console.log(`Manual approval needed for: ${job.title}`);
});

// Change strategy
manager.changeStrategy('quick-payout');

// Stop system
manager.stop();
```

## Security

### API Key Encryption
All API keys are encrypted using AES-256-GCM before storage. The encryption key is generated during setup and stored in `.env`.

### Rate Limiting
API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

### CORS
CORS is configured to allow requests only from trusted origins in production.

### Bot Disclosure
**Legal Requirement:** You must disclose that you&apos;re using automation tools on all platforms. Add this to your profile:
> "Tasks may be completed with assistance from automation tools."

### Data Storage
- API keys: Encrypted in `.env` file
- Job data: Stored in memory (cleared on restart)
- Earnings data: Logged but not persisted
- Platform credentials: Never stored in plain text

## Troubleshooting

### System Won&apos;t Start
```bash
# Check if .env file exists
ls -la .env

# Regenerate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### No Jobs Found
- Check platform API keys are valid
- Verify at least 3 platforms are connected
- Check platform status in mobile app
- Some platforms require manual approval (wait 1-2 days)

### Jobs Failing
- Check platform account status
- Verify qualifications are met
- Review platform-specific requirements
- Try switching to "guaranteed-completion" strategy

### Mobile App Not Loading
```bash
# Verify server is running
curl http://localhost:3000/api/health

# Check mobile files exist
ls -la src/mobile/
```

### Can&apos;t Connect to Platform
- Verify API key is correct
- Check platform is not under maintenance
- Try regenerating API key on platform dashboard
- Contact platform support if issue persists

## Performance Tips

### Maximize Earnings
1. **Connect More Platforms**: Each platform increases job availability
2. **Use Balanced Strategy**: Best long-term earnings with manageable risk
3. **Monitor Success Rate**: Switch to "guaranteed-completion" if rate drops below 80%
4. **Approve High-Value Jobs**: Don&apos;t miss opportunities requiring manual approval

### Optimize for Speed
1. **Use Quick Payout Strategy**: Focus on instant/weekly payout jobs
2. **Increase Concurrent Jobs**: Raise `AUTOSTART_MAX_CONCURRENT_JOBS` to 10
3. **Lower Minimum Payment**: Set `AUTOSTART_MIN_PAYMENT` to 0.005

### Minimize Risk
1. **Use Guaranteed Strategy**: Focus on easy, high-success-rate jobs
2. **Limit Concurrent Jobs**: Keep `AUTOSTART_MAX_CONCURRENT_JOBS` at 3
3. **Monitor Closely**: Check mobile app frequently during first week

## FAQ

**Q: How much can I earn?**
A: Varies widely. Typical range: $5-50/day depending on time spent, platforms connected, and strategy used.

**Q: Is this legal?**
A: Yes, but you must disclose bot usage on your platform profiles. Some platforms prohibit automation - check their terms.

**Q: Do I need to be at my computer?**
A: No! Start the system, close your laptop, and monitor from your phone. It runs autonomously.

**Q: What if a job fails?**
A: The system automatically moves to the next job. Failed jobs are logged but don&apos;t stop the system.

**Q: Can I use this with other bots?**
A: Yes, but be careful not to exceed platform API rate limits. Each platform has its own limits.

**Q: How do I get paid?**
A: Each platform has its own payment method. Most support PayPal, some offer direct deposit. Check platform settings.

**Q: What&apos;s the best strategy?**
A: For beginners: "balanced". For fast cash: "quick-payout". For maximum earnings: "big-yield". For safety: "guaranteed-completion".

**Q: Can I run multiple instances?**
A: Technically yes, but not recommended. Use higher concurrent job limits instead.

## Support

- **Issues**: https://github.com/oconnorw225-del/ndax-quantum-engine/issues
- **Discussions**: https://github.com/oconnorw225-del/ndax-quantum-engine/discussions
- **Email**: support@ndax-quantum.example.com (if available)

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## License

MIT License - see LICENSE file for details.
