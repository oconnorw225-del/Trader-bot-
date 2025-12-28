# Complete Deployment Instructions

## 🚀 Overview

This guide provides step-by-step instructions for deploying the complete NDAX Quantum Engine in various environments - from local development to production cloud deployment.

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment (AWS, GCP, Azure)](#cloud-deployment)
4. [Railway Deployment](#railway-deployment)
5. [Self-Hosted VPS](#self-hosted-vps)
6. [Mobile Deployment (Termux)](#mobile-deployment)
7. [Production Checklist](#production-checklist)

---

## 1. Local Development

### Quick Start (5 minutes)

```bash
# Clone repository
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit with your API keys

# Build frontend
npm run build

# Start server
npm start
```

Visit: `http://localhost:3000`

### Full Development Setup

```bash
# 1. Install Node.js dependencies
npm install

# 2. Install Python dependencies
cd backend/python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# 3. Configure environment
cp .env.example .env

# Edit .env with your credentials:
# - NDAX API keys
# - Platform API keys (at least 3)
# - AI service keys
# - Security keys

# 4. Run setup wizard
npm run register

# 5. Start development servers

# Terminal 1: Node.js backend
npm run dev

# Terminal 2: Python backend (optional)
cd backend/python
python app.py

# Terminal 3: Frontend development (optional)
npm run dev
```

### Development URLs

- **Frontend:** `http://localhost:5173` (Vite dev server)
- **Backend API:** `http://localhost:3000`
- **Python API:** `http://localhost:5000`
- **Mobile App:** `http://localhost:3000/mobile`

---

## 2. Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### One-Command Deployment

```bash
# Clone and start
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine
cp .env.example .env
# Edit .env with your keys
docker-compose up -d
```

### Docker Compose Configuration

The system includes a complete `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Node.js Backend + Frontend
  nodejs:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - python
    networks:
      - ndax-network

  # Python Backend
  python:
    build:
      context: ./backend/python
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - FLASK_PORT=5000
    env_file:
      - .env
    restart: unless-stopped
    networks:
      - ndax-network

networks:
  ndax-network:
    driver: bridge
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update and rebuild
git pull
docker-compose build --no-cache
docker-compose up -d

# View resource usage
docker stats
```

### Docker Environment Variables

Create `.env` file with:

```bash
# Required for Docker
NODE_ENV=production
PORT=3000
FLASK_PORT=5000

# All other variables from .env.example
```

---

## 3. Cloud Deployment

### AWS Deployment

#### Option A: AWS ECS (Elastic Container Service)

```bash
# 1. Install AWS CLI
pip install awscli

# 2. Configure AWS credentials
aws configure

# 3. Create ECR repositories
aws ecr create-repository --repository-name ndax-quantum-nodejs
aws ecr create-repository --repository-name ndax-quantum-python

# 4. Build and push Docker images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker build -t ndax-quantum-nodejs .
docker tag ndax-quantum-nodejs:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ndax-quantum-nodejs:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ndax-quantum-nodejs:latest

docker build -t ndax-quantum-python ./backend/python
docker tag ndax-quantum-python:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ndax-quantum-python:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ndax-quantum-python:latest

# 5. Deploy to ECS
aws ecs create-cluster --cluster-name ndax-quantum-cluster
aws ecs register-task-definition --cli-input-json file://aws/ecs/task-definition-nodejs.json
aws ecs create-service --cluster ndax-quantum-cluster --service-name nodejs --task-definition ndax-quantum-nodejs --desired-count 1
```

#### Option B: AWS EC2

```bash
# 1. Launch EC2 instance (t3.medium or larger)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# 4. Clone and deploy
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine
cp .env.example .env
nano .env  # Add your keys
docker-compose up -d

# 5. Configure security group
# Allow inbound: Port 3000 (HTTP), Port 22 (SSH)
```

### Google Cloud Platform (GCP)

```bash
# 1. Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# 2. Initialize gcloud
gcloud init

# 3. Create GCE instance
gcloud compute instances create ndax-quantum \
  --machine-type=e2-medium \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --tags=http-server

# 4. SSH and deploy
gcloud compute ssh ndax-quantum

# Follow same steps as AWS EC2
```

### Microsoft Azure

```bash
# 1. Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 2. Login to Azure
az login

# 3. Create resource group
az group create --name ndax-quantum-rg --location eastus

# 4. Create container instance
az container create \
  --resource-group ndax-quantum-rg \
  --name ndax-quantum-nodejs \
  --image YOUR_DOCKER_HUB_USERNAME/ndax-quantum-nodejs:latest \
  --dns-name-label ndax-quantum \
  --ports 3000 \
  --environment-variables $(cat .env | xargs)

# 5. Get URL
az container show \
  --resource-group ndax-quantum-rg \
  --name ndax-quantum-nodejs \
  --query ipAddress.fqdn
```

---

## 4. Railway Deployment

Railway provides the easiest cloud deployment.

### Method 1: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/oconnorw225-del/ndax-quantum-engine)

### Method 2: CLI Deploy

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add environment variables
railway variables set NDAX_API_KEY=your_key
railway variables set NDAX_API_SECRET=your_secret
# ... add all required variables

# 5. Deploy
railway up

# 6. Get URL
railway domain
```

### Railway Configuration

The repo includes `railway.json` and `railway.toml` for automatic configuration.

**Features:**
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Zero-downtime deployments
- ✅ Automatic scaling
- ✅ Built-in monitoring

---

## 5. Self-Hosted VPS

### Ubuntu/Debian VPS

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Python 3.8+
sudo apt install -y python3 python3-pip python3-venv

# 4. Install PM2 for process management
sudo npm install -g pm2

# 5. Clone repository
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine

# 6. Install dependencies
npm install
cd backend/python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..

# 7. Configure environment
cp .env.example .env
nano .env  # Add your keys

# 8. Build frontend
npm run build

# 9. Start with PM2
pm2 start backend/nodejs/server.js --name "ndax-nodejs"
pm2 start backend/python/app.py --name "ndax-python" --interpreter python3

# 10. Enable auto-start
pm2 startup
pm2 save

# 11. Setup Nginx reverse proxy (optional)
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/ndax-quantum
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ndax-quantum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 6. Mobile Deployment (Termux)

Run on Android phone using Termux.

### Setup

```bash
# 1. Install Termux from F-Droid
# https://f-droid.org/en/packages/com.termux/

# 2. Install dependencies
pkg update && pkg upgrade
pkg install git nodejs python

# 3. Clone repository
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine

# 4. Run setup script
bash termux-setup.sh

# 5. Configure and start
cp .env.example .env
nano .env  # Add your keys
npm run build
npm start
```

### Keep Running in Background

```bash
# Install termux-services
pkg install termux-services

# Create service
mkdir -p ~/.termux/services/ndax
nano ~/.termux/services/ndax/run

# Content:
#!/data/data/com.termux/files/usr/bin/bash
cd /data/data/com.termux/files/home/ndax-quantum-engine
exec npm start 2>&1

# Make executable
chmod +x ~/.termux/services/ndax/run

# Enable and start service
sv-enable ndax
sv up ndax
```

### Access from Other Devices

```bash
# Install termux-api
pkg install termux-api

# Get device IP
ifconfig

# Access from browser on same network:
# http://YOUR_PHONE_IP:3000
```

---

## 7. Production Checklist

### Security

- [ ] Change default encryption keys
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable 2FA on all accounts
- [ ] Restrict API access by IP (if possible)
- [ ] Regular security audits
- [ ] Backup encryption keys securely

### Configuration

- [ ] Set NODE_ENV=production
- [ ] Configure proper logging
- [ ] Set up monitoring (uptime, errors, performance)
- [ ] Configure auto-restart on crash
- [ ] Set resource limits (CPU, memory)
- [ ] Configure auto-scaling (if cloud)
- [ ] Set up CDN for static assets (if needed)

### Monitoring

- [ ] Setup health check endpoint monitoring
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Setup performance monitoring (New Relic, DataDog)
- [ ] Configure log aggregation (ELK, CloudWatch)
- [ ] Setup alerting (email, Slack, PagerDuty)
- [ ] Monitor disk space
- [ ] Monitor database connections

### Backup

- [ ] Database backups (if applicable)
- [ ] Configuration backups
- [ ] Code repository backups
- [ ] API key backups (encrypted)
- [ ] Disaster recovery plan
- [ ] Test restoration procedures

### Testing

- [ ] Run full test suite
- [ ] Load testing
- [ ] Security testing
- [ ] API endpoint testing
- [ ] Integration testing
- [ ] Mobile app testing
- [ ] Cross-browser testing

### Documentation

- [ ] Update README with deployment URL
- [ ] Document custom configurations
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures
- [ ] API documentation updated
- [ ] User guide for team members

### Performance

- [ ] Enable caching
- [ ] Optimize database queries
- [ ] Compress responses (gzip)
- [ ] Minify assets
- [ ] Use CDN for static files
- [ ] Enable HTTP/2
- [ ] Optimize images
- [ ] Database indexing

---

## 📊 Deployment Comparison

| Feature | Local Dev | Docker | AWS | Railway | VPS |
|---------|-----------|--------|-----|---------|-----|
| **Cost** | Free | Free | $20-50/mo | $5-20/mo | $5-20/mo |
| **Setup Time** | 5 min | 10 min | 30 min | 5 min | 20 min |
| **Scalability** | Low | Medium | High | Medium | Low |
| **Maintenance** | Manual | Low | Medium | Very Low | High |
| **SSL/HTTPS** | No | Manual | Yes | Auto | Manual |
| **Custom Domain** | No | Manual | Yes | Yes | Yes |
| **Best For** | Development | Testing | Production | Quick Deploy | Self-host |

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
```

### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Monitor memory
free -h
top
```

### Permission Issues

```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /path/to/ndax-quantum-engine

# Fix Docker permissions
sudo usermod -aG docker $USER
```

### Database Connection Issues

```bash
# Check database status
sudo systemctl status postgresql

# Restart database
sudo systemctl restart postgresql

# Check logs
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 📞 Support

- **GitHub Issues:** [Report Issues](https://github.com/oconnorw225-del/ndax-quantum-engine/issues)
- **Documentation:** Check `docs/` directory
- **Community:** Join our Discord/Slack (if available)

---

## 🎉 Success!

Once deployed, access your NDAX Quantum Engine at:
- **Local:** `http://localhost:3000`
- **Docker:** `http://localhost:3000`
- **Cloud:** `https://your-domain.com`

The system is now:
- ✅ Running 24/7
- ✅ Automatically trading on NDAX
- ✅ Seeking work on 18 platforms
- ✅ Earning and depositing to NDAX wallet
- ✅ Learning and optimizing strategies

**Monitor your earnings and optimize as needed!**

---

**Version:** 2.1.0  
**Last Updated:** 2025-12-20  
**Status:** ✅ Production Ready
