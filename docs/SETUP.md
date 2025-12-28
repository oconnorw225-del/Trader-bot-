# Setup Guide

Complete setup instructions for NDAX Quantum Engine.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [First Run](#first-run)
5. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 1 GB free space
- **Node.js**: v18.0.0 or higher
- **Python**: 3.8 or higher (for Flask backend)

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 5+ GB SSD
- **Node.js**: v20.0.0
- **Python**: 3.10+

## Installation

### 1. Install Node.js

**Windows/macOS:**
Download from [nodejs.org](https://nodejs.org/)

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:
```bash
node --version
npm --version
```

### 2. Install Python (Optional, for Flask backend)

**Windows/macOS:**
Download from [python.org](https://python.org/)

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip
```

Verify installation:
```bash
python3 --version
pip3 --version
```

### 3. Clone Repository

```bash
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine
```

### 4. Install Dependencies

**Node.js dependencies:**
```bash
npm install
```

**Python dependencies (if using Flask):**
```bash
cd backend/python
pip3 install -r requirements.txt
cd ../..
```

## Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure API Keys

Edit `.env` file with your API credentials:

#### Trading APIs
```env
NDAX_API_KEY=your_ndax_api_key
NDAX_API_SECRET=your_ndax_api_secret
NDAX_USER_ID=your_ndax_user_id
```

To get NDAX API keys:
1. Visit [NDAX](https://ndax.io/)
2. Create an account
3. Navigate to API settings
4. Generate new API key

#### Freelance Platforms

**Upwork:**
```env
UPWORK_CLIENT_ID=your_client_id
UPWORK_CLIENT_SECRET=your_client_secret
```
Get from: [Upwork Developers](https://www.upwork.com/ab/account-security/api)

**Fiverr:**
```env
FIVERR_API_KEY=your_api_key
```

**Other Platforms:**
Configure similarly for Freelancer, Toptal, Guru, and PeoplePerHour.

#### AI Services
```env
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_key
```

### 3. Security Configuration

Generate secure keys:

```bash
# Generate encryption key (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```env
ENCRYPTION_KEY=generated_32_char_key
JWT_SECRET=generated_jwt_secret
```

### 4. Risk Management Settings

```env
MAX_POSITION_SIZE=10000        # Maximum position size in USD
MAX_DAILY_LOSS=1000           # Maximum daily loss limit
RISK_LEVEL=moderate           # conservative, moderate, aggressive
```

### 5. Compliance Settings

```env
ENABLE_COMPLIANCE_CHECKS=true
COMPLIANCE_REGION=US          # US, EU, ASIA
```

### 6. Backup Settings

```env
ENABLE_AUTO_RECOVERY=true
BACKUP_INTERVAL_MINUTES=30
```

## First Run

### 1. Start Node.js Backend

```bash
npm start
```

The server will start on `http://localhost:3000`

### 2. Start Flask Backend (Optional)

In a new terminal:
```bash
cd backend/python
python3 app.py
```

The Flask server will start on `http://localhost:5000`

### 3. Verify Installation

Check health endpoints:

```bash
# Node.js backend
curl http://localhost:3000/api/health

# Flask backend
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. Run Tests

```bash
npm test
```

All tests should pass.

### 5. Run Setup Wizard

Access the setup wizard through your application interface to configure:
- Trading features
- Freelance platforms
- Risk settings
- AI models

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find and kill process using the port
# On Unix-like systems:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change the port in `.env`:
```env
PORT=3001
```

#### Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
npm install
```

#### Python Import Errors

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
cd backend/python
pip3 install -r requirements.txt
```

#### API Key Errors

**Error:** `API key not provided`

**Solution:**
1. Verify `.env` file exists
2. Check API keys are properly set
3. Restart the server

#### Permission Denied

**Error:** `EACCES: permission denied`

**Solution:**
```bash
# On Unix-like systems:
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Getting Help

If you encounter issues:

1. Check the logs:
   - Node.js: Check console output
   - Flask: Check `backend/python/app.log`

2. Enable debug mode:
   ```env
   NODE_ENV=development
   DEBUG=*
   ```

3. Verify configuration:
   ```bash
   npm run test
   ```

4. Open an issue on GitHub with:
   - Error message
   - System information
   - Steps to reproduce

## Next Steps

After successful setup:

1. Read [API Documentation](./API.md)
2. Review [Architecture Guide](./ARCHITECTURE.md)
3. Explore example strategies
4. Start with paper trading
5. Configure risk management
6. Enable compliance checks

## Security Checklist

Before going live:

- [ ] Strong encryption key configured
- [ ] API keys secured in `.env`
- [ ] `.env` added to `.gitignore`
- [ ] Risk limits configured
- [ ] Compliance checks enabled
- [ ] Backup recovery tested
- [ ] SSL/TLS enabled for production
- [ ] Rate limiting configured
- [ ] Monitoring enabled

## Production Deployment

For production deployment:

1. Use a process manager (PM2, systemd)
2. Enable SSL/TLS
3. Use production database
4. Configure load balancing
5. Set up monitoring
6. Enable logging
7. Configure backups
8. Use environment-specific configs

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.
