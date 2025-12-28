# NDAX Auto-Start System - Setup Instructions

Complete step-by-step guide to set up and run the NDAX Auto-Start System from a fresh repository clone.

## Prerequisites

### Required Software

- **Node.js 16+** - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **A modern web browser** (Chrome, Firefox, Safari, or Edge)

### Recommended Tools

- **Password Manager** - To store generated passwords
- **Gmail Account** - For using + addressing to create unique emails

### Time Requirements

- **Setup**: 5 minutes
- **Platform Registration**: 10-15 minutes
- **First Run**: Immediate

## Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git

# Navigate to project directory
cd ndax-quantum-engine
```

## Step 2: Quick Setup

The quick setup script will:
- Install all dependencies
- Create `.env` file from template
- Generate secure encryption keys
- Create configuration directory
- Run tests to verify installation

```bash
# Run quick setup
npm run setup
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║     🚀 NDAX Auto-Start System - Quick Setup 🚀              ║
╚══════════════════════════════════════════════════════════════╝

📋 Checking requirements...
✅ Node.js v18.x.x detected
📦 Installing dependencies...
✅ Dependencies installed
📝 Creating .env file...
✅ .env file created with generated keys
🧪 Running tests...
✅ Tests passed
╔══════════════════════════════════════════════════════════════╗
║                    ✅ Setup Complete! ✅                      ║
╚══════════════════════════════════════════════════════════════╝
```

### Troubleshooting Setup

**Problem:** Node.js version too old
```bash
# Check Node.js version
node -v

# If < 16, download latest from nodejs.org
```

**Problem:** npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

**Problem:** Tests fail
```
# This is OK for initial setup
# Tests may fail due to missing dependencies
# You can proceed to platform registration
```

## Step 3: Platform Registration

The registration wizard guides you through signing up on all 12 AI job platforms.

```bash
# Run registration wizard
npm run register
```

### Registration Process

The wizard will:

1. **Ask for Basic Information**
   ```
   Enter bot name (for identification): MyBot
   Enter your base email: you@gmail.com
   ```

2. **Generate Unique Emails**
   - Uses Gmail + addressing
   - Example: `you+toloka@gmail.com`, `you+remotasks@gmail.com`
   - All emails go to your main inbox

3. **Generate Secure Passwords**
   - Random 16-character passwords
   - Save these in your password manager!

4. **For Each Platform:**
   - Shows platform name and instructions
   - Opens signup page in browser
   - You complete registration
   - You paste API key back into wizard
   - API key is encrypted and saved to `.env`

### Platform Registration Tips

#### Quick Start Platforms (Auto-Approval)
Start with these - they&apos;re easiest and give immediate access:
1. **RapidWorkers** - Instant payout, easiest signup
2. **Microworkers** - Instant payout, simple tasks
3. **Spare5** - Instant payout, mobile-friendly
4. **Clickworker** - Weekly payout, good variety
5. **Toloka** - Weekly payout, well-documented

#### Premium Platforms (Manual Approval)
These require 1-2 days for approval but offer higher pay:
1. **Scale AI** - Highest pay, requires assessment
2. **Lionbridge** - Good pay, requires resume
3. **Appen** - Good pay, requires qualification test

### Finding API Keys

Each platform has different locations for API keys:

| Platform | API Key Location |
|----------|-----------------|
| Toloka | Settings → Developer → API Keys |
| Remotasks | Account → API Access |
| RapidWorkers | Settings → API |
| Clickworker | Profile → API Access |
| Microworkers | Account Settings → API |
| Spare5 | Profile → Developer → API |
| Others | Usually in Settings or Developer section |

### Registration Wizard Shortcuts

- Type `o` - Open signup page
- Type `s` - Skip platform
- Type `q` - Quit wizard
- Press Enter with empty API key - Skip platform

### Minimum Registration

You need **at least 3 platforms** for the system to work effectively.

**Recommended Setup:**
- Start: 3-5 platforms with auto-approval
- After 1 week: Add 2-3 premium platforms
- Long term: Connect all 12 platforms

## Step 4: Start the System

```bash
# Build and start backend server
npm start
```

**Expected Output:**
```
🚀 NDAX Quantum Engine Backend running on port 3000
📊 Health check: http://localhost:3000/api/health
📱 Mobile app: http://localhost:3000/mobile
🤖 Auto-start API: http://localhost:3000/api/autostart
```

### Verify Installation

Open these URLs to verify everything works:

1. **Health Check**
   ```
   http://localhost:3000/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Platform Status**
   ```
   http://localhost:3000/api/autostart/platforms/status
   ```
   Should show all 12 platforms

3. **Mobile App**
   ```
   http://localhost:3000/mobile
   ```
   Should load the control interface

## Step 5: Open Mobile App

Visit: **http://localhost:3000/mobile**

### Mobile App Features

1. **Earnings Dashboard**
   - Today, Week, Month, Total earnings
   - Updates in real-time

2. **START/STOP Button**
   - Big green button to start system
   - Turns red when running (STOP)
   - Click to toggle

3. **Strategy Selector**
   - 4 strategies to choose from
   - Switch anytime without restart
   - Active strategy is highlighted

4. **Platform Status**
   - Shows all connected platforms
   - Displays jobs completed and earnings
   - Color-coded connection status

5. **Alerts**
   - Real-time notifications
   - Job completion alerts
   - Approval required alerts
   - Platform connection alerts

## Step 6: Start Auto-Start System

In the mobile app:

1. Click the big green **START** button
2. System begins scanning for jobs
3. Watch earnings accumulate in real-time
4. Check alerts for important notifications

### Choosing a Strategy

**For Beginners:** Use "Balanced"
- Good mix of everything
- Lowest risk
- Consistent earnings

**For Fast Cash:** Use "Quick Payout"
- Prioritizes instant payouts
- Get money same day
- Lower earnings per job

**For Maximum Earnings:** Use "Big Yield"
- Highest paying jobs only
- May require more time
- Best hourly rate

**For Safety:** Use "Guaranteed Completion"
- Easy jobs only
- 90%+ success rate
- Build reputation safely

## Common Setup Issues

### Port Already in Use

**Problem:** Port 3000 already in use

**Solution:**
```bash
# Change port in .env file
echo "PORT=3001" >> .env

# Restart server
npm start

# Mobile app now at http://localhost:3001/mobile
```

### No Platforms Connected

**Problem:** "No platforms connected" error

**Solution:**
```bash
# Verify API keys in .env
cat .env | grep _API_KEY

# Re-run registration wizard
npm run register

# Or manually add API keys to .env
```

### API Key Not Working

**Problem:** Platform connection fails

**Solutions:**
1. Verify API key is correct (copy/paste carefully)
2. Check platform account status
3. Regenerate API key on platform
4. Wait if platform requires approval (1-2 days)

### Mobile App Won&apos;t Load

**Problem:** Blank page or 404 error

**Solutions:**
```bash
# Verify mobile files exist
ls -la src/mobile/

# Check server logs for errors
# Look for error messages in terminal

# Try different browser
# Clear browser cache
```

### Jobs Not Starting

**Problem:** System starts but no jobs execute

**Possible Causes:**
1. No platforms connected (need at least 3)
2. Platforms don&apos;t have available jobs
3. Minimum payment threshold too high
4. All platforms require manual approval

**Solutions:**
- Connect more platforms
- Lower `AUTOSTART_MIN_PAYMENT` in .env
- Try different strategy
- Check platform websites for job availability

## Advanced Configuration

### Environment Variables

Edit `.env` file to customize:

```bash
# System Configuration
AUTOSTART_STRATEGY=balanced          # Default strategy
AUTOSTART_SCAN_INTERVAL=30000        # Scan every 30 seconds
AUTOSTART_MAX_CONCURRENT_JOBS=5      # Max 5 jobs at once
AUTOSTART_MIN_PAYMENT=0.01          # Minimum $0.01 per job

# Performance Tuning
# For more aggressive earning:
AUTOSTART_MAX_CONCURRENT_JOBS=10    # Double concurrent jobs
AUTOSTART_MIN_PAYMENT=0.005         # Lower minimum

# For safety:
AUTOSTART_MAX_CONCURRENT_JOBS=3     # Fewer concurrent jobs
AUTOSTART_MIN_PAYMENT=0.05          # Higher minimum
```

### Using with Phone/Tablet

The mobile app works great on phones and tablets:

1. **Find your computer&apos;s IP address:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Update CORS in .env:**
   ```bash
   CORS_ORIGIN=*
   ```

3. **Visit from phone:**
   ```
   http://YOUR_IP:3000/mobile
   ```

4. **Bookmark it** for easy access

### Running in Background

**macOS/Linux:**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "ndax-autostart" -- start

# View logs
pm2 logs ndax-autostart

# Stop
pm2 stop ndax-autostart
```

**Windows:**
```bash
# Use npm script
npm run autostart

# Keep terminal window open
```

## Maintenance

### Update API Keys

If an API key changes:

1. Edit `.env` file
2. Update the `PLATFORM_API_KEY` value
3. Restart server: `npm start`
4. Reconnect platform in mobile app

### Check Earnings

Earnings are displayed in mobile app but also logged:

```bash
# View server logs
# Look for "Job completed" messages
# Shows platform, job, and earnings
```

### Monitor System Health

```bash
# Health check endpoint
curl http://localhost:3000/api/health

# Platform status
curl http://localhost:3000/api/autostart/platforms/status

# Complete status
curl http://localhost:3000/api/autostart/status/complete
```

## Security Best Practices

### Protect Your API Keys

1. **Never commit .env to git**
   - .env is in .gitignore
   - Never share your .env file

2. **Use strong passwords**
   - Use wizard-generated passwords
   - Store in password manager
   - Don&apos;t reuse passwords

3. **Rotate API keys periodically**
   - Every 3-6 months
   - If you suspect compromise

### Bot Disclosure

**Legal Requirement:** Disclose bot usage on platform profiles

Add to your profile on each platform:
> "I use automation tools to assist with task completion."

### Monitor for Suspicious Activity

- Check platform account status regularly
- Review earnings for anomalies
- Report any issues to platform support

## Getting Help

### Documentation

- **Main README**: `README.md`
- **Auto-Start Docs**: `README-AUTOSTART.md`
- **This Guide**: `SETUP-INSTRUCTIONS.md`

### Troubleshooting

1. Check error messages in terminal
2. Review mobile app alerts
3. Check platform status endpoint
4. Verify .env configuration

### Support Channels

- **GitHub Issues**: Report bugs and problems
- **GitHub Discussions**: Ask questions
- **Email Support**: (if available)

## Next Steps

After successful setup:

1. **Monitor First Week**
   - Check earnings daily
   - Verify jobs completing successfully
   - Adjust strategy if needed

2. **Optimize Strategy**
   - Try different strategies
   - Compare earnings
   - Find best fit for your goals

3. **Scale Up**
   - Add more platforms
   - Increase concurrent jobs
   - Adjust thresholds

4. **Automate Further**
   - Set up automatic startup
   - Configure alerts
   - Integrate with other tools

## Congratulations! 🎉

Your NDAX Auto-Start System is now set up and running. You should see jobs being discovered and executed automatically.

**Quick Reference Commands:**

```bash
npm run setup      # Initial setup
npm run register   # Register platforms
npm start          # Start system
npm test           # Run tests
npm run lint       # Check code
```

**Mobile App:** http://localhost:3000/mobile

Happy automating! 🤖💰
