# Complete Deployment Guide - NDAX Quantum Engine

**Version:** 2.1.0  
**Last Updated:** 2024-12-19

This guide provides comprehensive instructions for deploying the NDAX Quantum Engine to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Railway Deployment](#railway-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [Environment Variables](#environment-variables)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js:** 18.x or higher
- **Python:** 3.8 or higher
- **npm:** 9.x or higher
- **Git:** Latest version

### Required Accounts (for deployment)
- Railway account (for Railway deployment)
- Docker Hub account (for Docker deployment)
- AWS account (for AWS deployment)

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd backend/python
pip install -r requirements.txt
cd ../..
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required variables:
```env
# Node.js Backend
PORT=3000
NODE_ENV=development

# Python Backend
FLASK_PORT=5000
FLASK_ENV=development
DEMO_MODE=true

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret-key

# API Keys (optional for development)
NDAX_API_KEY=your-ndax-api-key
NDAX_API_SECRET=your-ndax-api-secret
UPWORK_CLIENT_ID=your-upwork-client-id
FIVERR_API_KEY=your-fiverr-api-key
```

### 4. Build the Frontend

```bash
npm run build
```

### 5. Start Development Servers

Option A: Start both servers separately
```bash
# Terminal 1: Start Node.js backend
npm start

# Terminal 2: Start Python backend
cd backend/python
python app.py
```

Option B: Use development mode (with Vite hot reload)
```bash
# Start both development servers concurrently
npm run dev:full
```

### 6. Access the Application

- **Frontend:** http://localhost:5173 (dev) or http://localhost:3000 (production)
- **Node.js API:** http://localhost:3000/api
- **Python API:** http://localhost:5000/api
- **Mobile App:** http://localhost:3000/mobile

## Railway Deployment

Railway provides the easiest deployment option with automatic builds and deployments.

### 1. Prepare Your Repository

Ensure these files are configured:

**Procfile:**
```
web: npm run start:railway
```

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:railway",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "healthcheck": {
    "path": "/api/health",
    "timeout": 10
  }
}
```

**package.json script:**
```json
{
  "scripts": {
    "start:railway": "npm run build && node backend/nodejs/server.js"
  }
}
```

### 2. Deploy to Railway

#### Option A: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Option B: Using GitHub Integration

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect and deploy

### 3. Configure Environment Variables

In Railway dashboard:
1. Select your project
2. Go to "Variables" tab
3. Add all required environment variables from `.env.example`
4. Click "Deploy" to apply changes

### 4. Custom Domain (Optional)

1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain" or add custom domain
4. Update DNS records if using custom domain

### 5. Verify Deployment

Check these endpoints:
- Health: `https://your-app.railway.app/api/health`
- Frontend: `https://your-app.railway.app/`

## Docker Deployment

### 1. Build Docker Images

```bash
# Build Node.js image
docker build -t ndax-nodejs:latest .

# Build Python image
docker build -f Dockerfile.python -t ndax-python:latest .
```

### 2. Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Manual Docker Run

```bash
# Run Node.js backend
docker run -d \
  --name ndax-nodejs \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --env-file .env \
  ndax-nodejs:latest

# Run Python backend
docker run -d \
  --name ndax-python \
  -p 5000:5000 \
  -e FLASK_ENV=production \
  --env-file .env \
  ndax-python:latest
```

### 4. Push to Docker Hub

```bash
# Tag images
docker tag ndax-nodejs:latest yourusername/ndax-nodejs:latest
docker tag ndax-python:latest yourusername/ndax-python:latest

# Push to Docker Hub
docker push yourusername/ndax-nodejs:latest
docker push yourusername/ndax-python:latest
```

## AWS Deployment

### 1. Prepare AWS Resources

#### Create ECR Repositories

```bash
# Create repositories
aws ecr create-repository --repository-name ndax-nodejs
aws ecr create-repository --repository-name ndax-python

# Get login command
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com
```

#### Push Images to ECR

```bash
# Tag images for ECR
docker tag ndax-nodejs:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/ndax-nodejs:latest

docker tag ndax-python:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/ndax-python:latest

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/ndax-nodejs:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/ndax-python:latest
```

### 2. Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name ndax-cluster

# Create task definitions (see aws/task-definition.json)
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json
```

### 3. Create Services

```bash
# Create Node.js service
aws ecs create-service \
  --cluster ndax-cluster \
  --service-name ndax-nodejs-service \
  --task-definition ndax-nodejs \
  --desired-count 2 \
  --launch-type FARGATE

# Create Python service
aws ecs create-service \
  --cluster ndax-cluster \
  --service-name ndax-python-service \
  --task-definition ndax-python \
  --desired-count 2 \
  --launch-type FARGATE
```

### 4. Configure Load Balancer

1. Create Application Load Balancer in AWS Console
2. Configure target groups for both services
3. Set up health checks pointing to `/api/health`
4. Configure listeners (HTTP/HTTPS)
5. Update Route 53 DNS records

## Environment Variables

### Required Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=production
FLASK_PORT=5000
FLASK_ENV=production

# Security
ENCRYPTION_KEY=<32-character-key>
JWT_SECRET=<random-secret>
FLASK_SECRET_KEY=<random-secret>

# Feature Flags
DEMO_MODE=false
```

### Optional Variables

```env
# Trading APIs
NDAX_API_KEY=<your-key>
NDAX_API_SECRET=<your-secret>

# Freelance Platforms
UPWORK_CLIENT_ID=<your-client-id>
UPWORK_CLIENT_SECRET=<your-client-secret>
FIVERR_API_KEY=<your-key>
FREELANCER_API_KEY=<your-key>

# AI Services
OPENAI_API_KEY=<your-key>

# Database (if using)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# AWS (if using)
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=us-east-1

# Docker (if using)
DOCKER_USERNAME=<your-username>
DOCKER_PASSWORD=<your-password>

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
```

## Production Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting clean (`npm run lint`)
- [ ] Environment variables configured
- [ ] Security audit passed (`npm audit`)
- [ ] TypeScript compilation clean (`npx tsc --noEmit`)

### Security

- [ ] All API keys stored as environment variables (not in code)
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled (Helmet.js)
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection enabled

### Performance

- [ ] Static assets minified and compressed
- [ ] Caching configured
- [ ] CDN setup (optional)
- [ ] Database indexes created (if using)
- [ ] Connection pooling configured
- [ ] Response times under 200ms

### Monitoring

- [ ] Health check endpoint working (`/api/health`)
- [ ] Logging configured (Winston)
- [ ] Error tracking setup (optional: Sentry)
- [ ] Metrics collection enabled
- [ ] Alerts configured for critical errors

### Backup & Recovery

- [ ] Database backups scheduled (if using)
- [ ] Configuration backups stored
- [ ] Disaster recovery plan documented
- [ ] Auto-recovery enabled (30-min intervals)

## Troubleshooting

### Build Failures

**Problem:** Build fails with "MODULE_NOT_FOUND"
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Problem:** Python dependencies fail to install
```bash
# Solution: Upgrade pip and reinstall
pip install --upgrade pip
pip install -r backend/python/requirements.txt
```

### Deployment Issues

**Problem:** Railway deployment fails
- Check build logs in Railway dashboard
- Verify `railway.json` configuration
- Ensure all environment variables are set
- Check Node.js version matches `engines` in package.json

**Problem:** Application crashes on startup
- Check application logs
- Verify PORT environment variable
- Check if all dependencies are installed
- Verify environment variables are set correctly

### Runtime Errors

**Problem:** API returns 500 errors
- Check server logs
- Verify database connection (if using)
- Check environment variables
- Test endpoints locally first

**Problem:** CORS errors in browser
- Verify CORS configuration in backend
- Check if origin is allowed
- Verify request headers

### Performance Issues

**Problem:** Slow response times
- Check database query performance
- Enable caching
- Optimize API endpoints
- Check server resources (CPU, memory)

**Problem:** High memory usage
- Check for memory leaks
- Implement connection pooling
- Limit concurrent requests
- Monitor with `pm2` or similar

## Support

For deployment assistance:
- GitHub Issues: https://github.com/oconnorw225-del/ndax-quantum-engine/issues
- Documentation: See README.md and docs/

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Docker Documentation](https://docs.docker.com/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
