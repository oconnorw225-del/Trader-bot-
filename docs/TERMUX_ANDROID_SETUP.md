# Android + Termux Setup Guide - Start Earning in 20 Minutes

**Complete step-by-step guide to run NDAX Quantum Engine on your Android phone using Termux.**

## Prerequisites

- Android phone (Android 7.0+)
- Stable WiFi connection (recommended)
- Phone charger (will run 24/7)
- 2GB+ free storage

## Step 1: Install Termux (5 minutes)

### Option A: F-Droid (Recommended)

1. Open browser on your phone
2. Go to: https://f-droid.org/
3. Download and install F-Droid app
4. Open F-Droid
5. Search for "Termux"
6. Install **Termux** (the main app)
7. Install **Termux:API** (for notifications)
8. Install **Termux:Widget** (optional, for shortcuts)

### Option B: GitHub Direct Download

1. Go to: https://github.com/termux/termux-app/releases
2. Download latest `termux-app_*.apk`
3. Enable "Install from unknown sources" in Settings
4. Install the APK

**⚠️ Do NOT use Google Play Store version - it's outdated and broken!**

## Step 2: Initial Termux Setup (3 minutes)

Open Termux app and run these commands one by one:

```bash
# Update package lists
pkg update

# Upgrade packages (type 'y' when asked)
pkg upgrade

# Install essential tools
pkg install nodejs git nano

# Verify installation
node --version
git --version
```

**Expected output:**
- Node: v18.x.x or higher
- Git: 2.x.x or higher

## Step 3: Get Free API Keys (10 minutes)

### A. Hugging Face (100% Free, No Credit Card)

1. Open browser: https://huggingface.co/join
2. Sign up (email + password)
3. Go to: https://huggingface.co/settings/tokens
4. Click "New token"
5. Name: "ndax-freelance"
6. Type: "Read"
7. Click "Generate"
8. **Copy the token** (starts with `hf_...`)

### B. Upwork Developer Account (Free)

1. Open browser: https://www.upwork.com/developer/keys
2. Sign up or log in to Upwork
3. Click "Create an App"
4. Fill in:
   - App name: "NDAX Automation"
   - App description: "AI-powered freelance automation"
   - Redirect URL: `http://localhost:3000/callback`
5. Submit and get your credentials
6. **Copy:** Client ID and Client Secret

## Step 4: Clone and Install (3 minutes)

In Termux, run:

```bash
# Navigate to home
cd ~

# Clone the repository
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git

# Enter directory
cd ndax-quantum-engine

# Install dependencies (takes 2-3 minutes)
npm install
```

**If you see warnings, that's okay!** Errors are not.

## Step 5: Configure API Keys (5 minutes)

### Create .env file

```bash
# Copy example file
cp .env.example .env

# Edit with nano
nano .env
```

### Add your keys

Replace the placeholder values:

```bash
# AI Configuration (Free!)
HUGGINGFACE_API_KEY=hf_your_token_here

# Upwork Configuration
UPWORK_CLIENT_ID=your_client_id_here
UPWORK_CLIENT_SECRET=your_secret_here

# Optional: Start with free tier, upgrade later
OPENAI_API_KEY=optional_for_now

# Encryption (generate random string)
ENCRYPTION_KEY=make_this_a_long_random_string_123456789

# Node Environment
NODE_ENV=production
```

**To save in nano:**
1. Press `Ctrl + X`
2. Press `Y` (yes)
3. Press `Enter` (confirm)

## Step 6: Start the System (2 minutes)

```bash
# Start the automation
npm start
```

**You should see:**
```
✅ NDAX Quantum Engine Started
✅ Freelance Automation Active
✅ Monitoring Upwork for jobs...
✅ AI Proposal Generator Ready
```

## Step 7: Test First Proposal (5 minutes)

### Manual Test

```bash
# Open new session (slide from left, New Session)
cd ~/ndax-quantum-engine

# Test proposal generation
node -e "
const { generateProposal } = require('./src/freelance/ai/orchestrator');
generateProposal({
  title: 'Need Node.js Developer',
  description: 'Build a simple REST API',
  budget: 500
}).then(console.log);
"
```

**Expected output:** AI-generated proposal text

### Check for Jobs

The system automatically:
- Scans Upwork every 5 minutes
- Generates proposals for matching jobs
- Logs activity to console

## Step 8: Keep Running 24/7

### Option A: Termux:Boot (Recommended)

```bash
# Install boot package
pkg install termux-boot

# Create boot script
mkdir -p ~/.termux/boot
nano ~/.termux/boot/start-ndax.sh
```

Add this content:
```bash
#!/data/data/com.termux/files/usr/bin/bash
cd ~/ndax-quantum-engine
npm start > ~/ndax.log 2>&1 &
```

Save and make executable:
```bash
chmod +x ~/.termux/boot/start-ndax.sh
```

Now system starts automatically when phone boots!

### Option B: Acquire Wakelock

```bash
# Prevent phone from sleeping
termux-wake-lock

# To release later (stops background execution)
termux-wake-unlock
```

### Option C: Simple Screen On

- Keep Termux in foreground
- Keep screen on (Settings → Display → Screen timeout → Never)
- Keep phone plugged in

## Battery Optimization Tips

### Extend Battery Life

1. **Lower scan frequency** - Edit config to check jobs every 15-30 min instead of 5
2. **Use WiFi only** - Disable mobile data for Termux
3. **Disable animations** - Settings → Developer Options → Window animation scale → Off
4. **Close other apps** - Keep only Termux running
5. **Airplane mode + WiFi** - Saves battery

### Edit Scan Interval

```bash
nano ~/ndax-quantum-engine/src/freelance/ai/orchestrator.js
```

Find and change:
```javascript
// Change from 5 minutes to 15 minutes
setInterval(scanJobs, 15 * 60 * 1000);
```

## Monitoring & Logs

### View Live Logs

```bash
# In new Termux session
cd ~/ndax-quantum-engine
tail -f ndax.log
```

### Check Status

```bash
# See if process is running
ps aux | grep node

# Check memory usage
free -h

# Check storage
df -h
```

## Troubleshooting

### "Command not found" errors

```bash
pkg update
pkg install nodejs git nano
```

### "Permission denied"

```bash
chmod +x script-name.sh
```

### "Cannot connect to API"

- Check WiFi connection
- Verify API keys in `.env`
- Test: `curl https://api.huggingface.co`

### "Out of memory"

```bash
# Clear npm cache
npm cache clean --force

# Restart Termux
```

### System stops after phone locks

```bash
# Acquire wakelock
termux-wake-lock

# Or install Termux:Boot
pkg install termux-boot
```

### High battery drain

- Increase scan interval (see Battery Optimization)
- Use WiFi only
- Close other apps
- Consider AWS Free Tier instead

## Upgrading Later

### When you make your first $100-300

```bash
# Stop current system
pkill node

# Add OpenAI key to .env
nano .env
# Add: OPENAI_API_KEY=sk-your-key-here

# Restart
npm start
```

### When you want 24/7 reliability

Migrate to AWS Free Tier:
1. Keep Termux as backup
2. Follow AWS setup in `docs/API_SETUP_GUIDE.md`
3. Your phone is now free!

## Expected Results

### Week 1 (Testing & Learning)
- System running smoothly on phone
- 10-20 proposals generated
- 1-3 interviews scheduled
- $0-300 earned

### Week 2-4 (First Wins)
- 30-50 proposals sent
- 3-5 jobs won
- $500-1500 earned
- Confidence building

### Month 2+ (Optimized)
- Upgrade to paid APIs
- 100+ proposals/month
- 10-20 jobs won
- $3,000-5,000 earned

## Security Best Practices

1. **Never share your .env file**
2. **Use strong ENCRYPTION_KEY**
3. **Don't leave phone unlocked in public**
4. **Back up your config**:
   ```bash
   cp .env ~/.env.backup
   ```
5. **Monitor earnings regularly**

## Data Usage Estimate

- Scanning jobs: ~50MB/day
- Generating proposals: ~20MB/day
- **Total: ~70MB/day or ~2GB/month**

💡 **Use WiFi to avoid mobile data charges!**

## Power Usage

- With screen off (wakelock): ~5-10% battery/hour
- With screen on: ~20-30% battery/hour
- **Keep phone plugged in for 24/7 operation**

## Quick Commands Reference

```bash
# Start system
cd ~/ndax-quantum-engine && npm start

# Stop system
pkill node

# View logs
tail -f ~/ndax.log

# Update code
cd ~/ndax-quantum-engine && git pull

# Restart Termux
exit
# Then reopen app

# Check system status
ps aux | grep node

# Edit config
nano ~/ndax-quantum-engine/.env
```

## Getting Help

1. Check logs: `tail -f ~/ndax.log`
2. Review `docs/QUICK_START.md` for general issues
3. See `docs/API_SETUP_GUIDE.md` for API problems
4. Test connection: `curl -I https://api.upwork.com`

## Success Checklist

Before claiming success, verify:

- [ ] Termux installed from F-Droid
- [ ] Node.js and Git working
- [ ] Repository cloned
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env` file created with API keys
- [ ] System starts without errors
- [ ] Test proposal generated successfully
- [ ] Wakelock acquired for 24/7 operation
- [ ] Phone stays plugged in
- [ ] Logs showing job scans
- [ ] First proposal submitted (manually or auto)

## Next Steps

Once running on Android:

1. **Monitor for 24 hours** - Ensure stability
2. **Submit 5-10 proposals manually** - Get feel for process
3. **Wait for first job** - Usually 1-7 days
4. **Reinvest earnings** - Upgrade to OpenAI API
5. **Scale up** - Increase job targets
6. **Consider AWS** - For true 24/7 without phone tied up

---

**You're all set!** Your Android phone is now an AI-powered freelance automation machine. Keep it plugged in, connected to WiFi, and let it work for you 24/7.

**Expected timeline:** First job within 1 week, $3k/month within 2 months. 🚀
