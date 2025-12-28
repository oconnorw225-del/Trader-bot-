# Chimera Trading System - Deployment Guide

**Last Updated:** December 20, 2024  
**Version:** 2.1.0

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Methods](#deployment-methods)
  - [Method 1: GitHub Pages](#method-1-github-pages-static-frontend)
  - [Method 2: Hybrid Deployment](#method-2-hybrid-deployment)
  - [Method 3: Full Server Deployment](#method-3-full-server-deployment)
  - [Method 4: Railway/Cloud Deployment](#method-4-railwaycloud-deployment)
- [Configuration](#configuration)
- [Security Best Practices](#security-best-practices)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## Overview

The Chimera Trading System is a production-ready autonomous trading platform that combines:

- **Real Exchange APIs**: NDAX and Binance connectors with testnet support
- **Unified Backend**: Node.js (Express) + Python (Flask) architecture
- **Real-Time Streaming**: WebSocket server for live market data
- **Advanced Dashboard**: React-based trading interface
- **Complete Monitoring**: Prometheus metrics and logging
- **Multiple Deployment Options**: From static hosting to full server deployment

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    www.aiwebe.online                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────┐    ┌──────────────────┐               │
│  │  React Frontend │◄──►│ Node.js Server   │               │
│  │  (Port 80/443)  │    │  (Port 3000)     │               │
│  └────────────────┘    └──────────────────┘               │
│                              │                              │
│                              ├──► WebSocket (Port 8080)     │
│                              ├──► Metrics (Port 9090)       │
│                              │                              │
│                              ▼                              │
│                    ┌──────────────────┐                     │
│                    │ Python Backend   │                     │
│                    │  (Port 8000)     │                     │
│                    └──────────────────┘                     │
│                              │                              │
│                    ┌─────────┴─────────┐                    │
│                    │                   │                    │
│                    ▼                   ▼                    │
│           ┌──────────────┐    ┌──────────────┐             │
│           │ NDAX API     │    │ Binance API  │             │
│           └──────────────┘    └──────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **Python**: 3.8 or higher
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Disk Space**: At least 1GB free

### Required Software

```bash
# Node.js and npm
node --version  # Should be 18+
npm --version

# Python 3
python3 --version  # Should be 3.8+
pip3 --version

# Git
git --version
```

### Optional (for production deployment)

- **Nginx**: For reverse proxy
- **Systemd**: For service management (Linux)
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)
- **Domain Name**: Custom domain (www.aiwebe.online configured)

## Quick Start

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine

# Install Node.js dependencies
npm install

# Install Python dependencies
pip3 install -r requirements.txt

# Create environment file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your credentials:

```bash
# IMPORTANT: Set testnet mode
TESTNET=true  # Use 'false' only for production trading

# Exchange API Keys
NDAX_API_KEY=your_ndax_api_key_here
NDAX_API_SECRET=your_ndax_api_secret_here
NDAX_USER_ID=your_user_id_here
NDAX_ACCOUNT_ID=your_account_id_here

BINANCE_API_KEY=your_binance_api_key_here
BINANCE_API_SECRET=your_binance_api_secret_here

# Domain (for production)
DOMAIN=www.aiwebe.online

# Security
ENCRYPTION_KEY=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
```

**⚠️ WARNING**: Never commit the `.env` file to version control!

### 3. Choose Deployment Method

```bash
# Run deployment script
./deploy.sh

# Or manually choose a method (see sections below)
```

## Deployment Methods

### Method 1: GitHub Pages (Static Frontend)

**Best for:** Testing, demos, and showcasing the UI

**Pros:**
- Free hosting on GitHub
- Automatic SSL
- Easy deployment with one command
- No server management

**Cons:**
- Frontend only (demo mode)
- No real trading functionality
- No backend services

#### Steps

1. **Update package.json** (already configured):
```json
{
  "homepage": "https://www.aiwebe.online"
}
```

2. **Deploy**:
```bash
npm run build
npm run deploy
```

3. **Configure GitHub Pages**:
- Go to repository Settings > Pages
- Source: `gh-pages` branch
- Custom domain: `www.aiwebe.online`

4. **DNS Configuration**:

Add these DNS records at your domain provider:

```
Type    Name    Value
CNAME   www     oconnorw225-del.github.io
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
```

**Access:** https://www.aiwebe.online (after DNS propagation)

---

### Method 2: Hybrid Deployment

**Best for:** Small to medium deployments with existing server infrastructure

**Pros:**
- Frontend on GitHub Pages (free, fast CDN)
- Backend on your own server (full control)
- Scalable and cost-effective
- Easy to update frontend independently

**Cons:**
- Requires backend server management
- CORS configuration needed
- Two separate services to maintain

#### Steps

**Part A: Frontend Deployment**

```bash
# Deploy frontend to GitHub Pages
npm run build
npm run deploy
```

**Part B: Backend Deployment**

On your server:

```bash
# 1. Copy repository to server
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with your credentials

# 3. Run backend deployment script
./backend-deploy.sh
```

Or manually:

```bash
# Install dependencies
npm install
pip3 install -r requirements.txt

# Start Node.js backend
npm run server &

# Start Python backend
npm run backend &
```

**Part C: Configure CORS**

Update `.env` on server:

```bash
CORS_ORIGIN=https://www.aiwebe.online
```

**Part D: Frontend API Configuration**

Update frontend API URLs to point to your backend server:

```javascript
// In .env or build configuration
VITE_API_URL=https://your-server.com:3000
VITE_PYTHON_API_URL=https://your-server.com:8000
```

---

### Method 3: Full Server Deployment

**Best for:** Production deployments with VPS or dedicated server

**Pros:**
- Complete control over all services
- Best performance
- Integrated monitoring
- Professional setup with nginx + systemd

**Cons:**
- Requires server administration knowledge
- Must manage SSL certificates
- Higher cost

#### Steps

**1. Prepare Server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx certbot python3-certbot-nginx build-essential
```

**2. Clone and Setup**

```bash
cd /opt
sudo git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine

# Set permissions
sudo chown -R www-data:www-data /opt/ndax-quantum-engine
```

**3. Configure Environment**

```bash
sudo cp .env.example .env
sudo nano .env
```

**4. Run Deployment**

```bash
sudo ./deploy.sh
# Select option 3: Full Server Deployment
```

This will:
- Install all dependencies
- Build the frontend
- Configure nginx
- Install systemd services
- Start all services
- Setup Dynamic DNS (optional)

**5. Configure SSL Certificate**

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d www.aiwebe.online
```

**6. Verify Services**

```bash
# Check service status
sudo systemctl status chimera-web
sudo systemctl status chimera-backend

# View logs
sudo journalctl -u chimera-web -f
sudo journalctl -u chimera-backend -f

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:8000/api/health
```

**Access:** https://www.aiwebe.online

---

### Method 4: Railway/Cloud Deployment

**Best for:** Quick deployment with automatic scaling

**Pros:**
- Automated deployment
- Built-in SSL
- Auto-scaling
- Easy rollbacks
- Integrated monitoring

**Cons:**
- Monthly costs (after free tier)
- Less control over infrastructure
- Potential cold starts

#### Steps

**Option A: Railway CLI**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add environment variables
railway variables set TESTNET=true
railway variables set NODE_ENV=production
# ... add all variables from .env.example

# 5. Deploy
railway up
```

**Option B: Railway Dashboard**

1. Go to https://railway.app/
2. Click "New Project" > "Deploy from GitHub"
3. Select your repository
4. Railway will detect `railway.json` and configure automatically
5. Add environment variables in Settings > Variables
6. Deploy automatically

**Option C: Heroku**

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create chimera-trading-system

# Add buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python

# Set environment variables
heroku config:set TESTNET=true
heroku config:set NODE_ENV=production
# ... add all other variables

# Deploy
git push heroku main
```

**Access:** Provided by the platform (e.g., chimera-trading-system.up.railway.app)

---

## Configuration

### Environment Variables

Complete list of required and optional environment variables:

#### Required Variables

```bash
# Application Mode
NODE_ENV=production
TESTNET=true  # ALWAYS use true for testing

# Server Ports
PORT=3000
PYTHON_BACKEND_PORT=8000
WS_PORT=8080

# Exchange API Keys (REQUIRED for trading)
NDAX_API_KEY=your_key
NDAX_API_SECRET=your_secret
NDAX_USER_ID=your_user_id
NDAX_ACCOUNT_ID=your_account_id

BINANCE_API_KEY=your_key
BINANCE_API_SECRET=your_secret

# Security (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your_32_char_key
JWT_SECRET=your_jwt_secret
```

#### Optional Variables

```bash
# Domain
DOMAIN=www.aiwebe.online
DDNS_PASSWORD=your_ddns_password

# Monitoring
PROMETHEUS_PORT=9090
ENABLE_METRICS=true
LOG_LEVEL=info

# Database (optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/chimera

# CORS
CORS_ORIGIN=https://www.aiwebe.online
```

### Dynamic DNS Setup

For home servers or dynamic IPs:

```bash
# Run Dynamic DNS setup
sudo ./setup-dynamic-dns.sh

# Select provider:
# 1. No-IP
# 2. DynDNS
# 3. Cloudflare
# 4. Manual configuration
```

## Security Best Practices

### 1. API Key Management

```bash
# ✅ DO: Use environment variables
NDAX_API_KEY=$NDAX_API_KEY

# ❌ DON'T: Hardcode in source
const apiKey = 'abc123secret'
```

### 2. Testnet First

**Always** test with testnet APIs before using production:

```bash
# Start in testnet mode
TESTNET=true npm start

# Only switch to production after thorough testing
TESTNET=false npm start  # Use with extreme caution
```

### 3. SSL/TLS

```bash
# Use Let's Encrypt for free SSL
sudo certbot --nginx -d www.aiwebe.online

# Force HTTPS in nginx configuration (already included)
```

### 4. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable

# Optional: Allow WebSocket directly
# sudo ufw allow 8080/tcp
```

### 5. Regular Updates

```bash
# Update dependencies regularly
npm audit
npm audit fix

pip3 list --outdated
pip3 install --upgrade -r requirements.txt
```

### 6. Secure File Permissions

```bash
# Protect .env file
chmod 600 .env

# Restrict systemd service files
sudo chmod 644 /etc/systemd/system/chimera-*.service
```

## Monitoring & Observability

### Health Checks

```bash
# Node.js backend
curl http://localhost:3000/api/health

# Python backend
curl http://localhost:8000/api/health

# WebSocket connection
wscat -c ws://localhost:8080
```

### Prometheus Metrics

Access metrics at: `http://localhost:9090/metrics`

Available metrics:
- `http_requests_total`: Total HTTP requests
- `websocket_connections_total`: Total WebSocket connections
- `websocket_active_connections`: Currently active connections
- `uptime_seconds`: Server uptime
- `memory_usage_bytes`: Memory usage

### Log Files

```bash
# Node.js logs
sudo journalctl -u chimera-web -f

# Python logs
sudo journalctl -u chimera-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/chimera_access.log
sudo tail -f /var/log/nginx/chimera_error.log

# Application logs
tail -f chimera_backend.log
```

### Status Dashboard

Built-in status endpoint:

```bash
curl http://localhost:3000/api/status
```

Response:
```json
{
  "status": "operational",
  "timestamp": "2024-12-20T23:00:00.000Z",
  "services": {
    "nodejs": "online",
    "websocket": "online",
    "python": "online"
  },
  "config": {
    "testnet": true,
    "environment": "production"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>
```

#### 2. Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Python modules
pip3 install -r requirements.txt --force-reinstall
```

#### 3. Exchange Connection Failed

```bash
# Check API credentials
echo $NDAX_API_KEY
echo $BINANCE_API_KEY

# Verify testnet mode
echo $TESTNET

# Test connection manually
curl -X POST http://localhost:8000/api/exchange/connect \
  -H "Content-Type: application/json" \
  -d '{"exchange_id": "ndax"}'
```

#### 4. WebSocket Not Connecting

```bash
# Check if WebSocket server is running
sudo lsof -i :8080

# Check nginx WebSocket proxy
sudo nginx -t
sudo systemctl restart nginx

# Test WebSocket connection
npm install -g wscat
wscat -c ws://localhost:8080
```

#### 5. SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test SSL
openssl s_client -connect www.aiwebe.online:443
```

### Debug Mode

Enable detailed logging:

```bash
# Node.js
NODE_ENV=development DEBUG=* npm start

# Python
FLASK_ENV=development python3 unified_system_with_exchanges.py
```

### Service Recovery

```bash
# Restart all services
sudo systemctl restart chimera-web chimera-backend nginx

# Check service status
sudo systemctl status chimera-web chimera-backend

# View recent errors
sudo journalctl -u chimera-web --since "10 minutes ago"
```

## Maintenance

### Regular Tasks

#### Daily
- Monitor service health
- Check error logs
- Verify trading activity (if live)

```bash
# Quick health check script
curl -s http://localhost:3000/api/health | jq
curl -s http://localhost:8000/api/health | jq
```

#### Weekly
- Review metrics and performance
- Check disk space
- Update dependencies (patch versions)

```bash
# Disk space
df -h

# Update patches
npm update
pip3 install --upgrade -r requirements.txt
```

#### Monthly
- Review security updates
- Backup configuration
- Test disaster recovery
- Rotate API keys (if policy requires)

```bash
# Backup
tar -czf chimera-backup-$(date +%Y%m%d).tar.gz \
  .env deployment-config.json data/
```

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install
pip3 install -r requirements.txt

# Build frontend
npm run build

# Restart services
sudo systemctl restart chimera-web chimera-backend
```

### Rollback Procedure

```bash
# Revert to previous version
git log --oneline
git checkout <previous-commit-hash>

# Rebuild
npm install
npm run build

# Restart
sudo systemctl restart chimera-web chimera-backend
```

## Support

### Getting Help

- **Documentation**: This file and other docs in `/docs`
- **Issues**: https://github.com/oconnorw225-del/ndax-quantum-engine/issues
- **Logs**: Check application logs for detailed error messages

### Reporting Issues

When reporting issues, include:

1. Deployment method used
2. Environment (OS, Node.js version, Python version)
3. Error messages and logs
4. Steps to reproduce
5. `.env` file (with credentials removed!)

## Appendix

### Deployment Checklist

Before going to production:

- [ ] Tested extensively in testnet mode
- [ ] All environment variables configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] API rate limits understood
- [ ] Emergency stop procedure documented
- [ ] Team trained on operations

### Performance Optimization

```bash
# Enable caching in nginx (add to nginx-config.conf)
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

# Enable compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Increase worker processes
worker_processes auto;
```

### Useful Commands

```bash
# Check all listening ports
sudo netstat -tulpn | grep LISTEN

# Monitor system resources
htop
iotop

# Check service logs in real-time
sudo journalctl -f

# Test API endpoints
./scripts/test-api.sh  # If available
```

---

**End of Deployment Guide**

For additional help, refer to:
- [README.md](README.md) - General project information
- [API.md](docs/API.md) - API documentation
- [SECURITY.md](SECURITY.md) - Security guidelines
