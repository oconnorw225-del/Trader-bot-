# Railway Deployment Guide

**Last Updated:** 2025-12-28

## Prerequisites

1. Railway account ([railway.app](https://railway.app))
2. Railway CLI installed: `npm install -g @railway/cli`
3. GitHub repository connected to Railway
4. All secrets configured in Railway dashboard

## Required Railway Environment Variables

Configure these in Railway dashboard under Variables:

### Core Secrets
- `NDAX_API_KEY` - Your NDAX API key
- `NDAX_API_SECRET` - Your NDAX API secret
- `NDAX_USER_ID` - Your NDAX user ID
- `NDAX_ACCOUNT_ID` - Your NDAX account ID
- `SESSION_SECRET` - Random 32+ character string
- `JWT_SECRET` - Random 32+ character string
- `ENCRYPTION_KEY` - Random 32 character string
- `ACCESS_PASSWORD` - Admin access password

### Database (Railway provides automatically)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

### Optional
- `OPENAI_API_KEY` - For AI features
- `BINANCE_API_KEY` - For Binance integration
- `GITHUB_TOKEN` - For GitHub API integration

## Deployment Steps

### 1. Initial Setup

#### Login to Railway
```bash
railway login
```

#### Link your project
```bash
railway link
```

#### Set environment variables (or use Railway dashboard)
```bash
railway variables set NDAX_API_KEY="your_key"
railway variables set NDAX_API_SECRET="your_secret"
railway variables set NDAX_USER_ID="your_user_id"
railway variables set NDAX_ACCOUNT_ID="your_account_id"
railway variables set SESSION_SECRET="$(openssl rand -base64 32)"
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set ENCRYPTION_KEY="$(openssl rand -base64 32)"
railway variables set ACCESS_PASSWORD="your_secure_password"
```

### 2. Deploy

#### Deploy from CLI
```bash
railway up
```

#### Or push to main branch (auto-deploy via GitHub Actions)
```bash
git push origin main
```

### 3. Verify Deployment

#### Check logs
```bash
railway logs
```

#### Check service status
```bash
railway status
```

#### Test health endpoint
```bash
curl https://your-app.railway.app/api/health
```

## Monitoring

### View Logs
```bash
railway logs --follow
```

### Check Metrics
Visit Railway dashboard → Metrics

### Health Checks
- Node.js: `https://your-app.railway.app/api/health`
- Python: `https://your-app.railway.app/python/api/health`

## Configuration Files

The following files configure Railway deployment:

### `railway.json`
Primary Railway configuration with build and deploy settings.

### `railway.toml`
Additional configuration for health checks and environment.

### `nixpacks.toml`
Build configuration for Nixpacks builder.

### `.env.production`
Template for production environment variables.

## Troubleshooting

### Build Failures

1. Check Railway build logs
2. Verify all dependencies in package.json and requirements.txt
3. Ensure nixpacks.toml is configured correctly

**Common issues:**
- Missing dependencies: Run `npm install` locally to verify
- Python dependencies: Check `requirements.txt` format
- Build timeout: Contact Railway support to increase build time

### Runtime Errors

1. Check Railway runtime logs
2. Verify all environment variables are set
3. Check database connectivity

**Common issues:**
- Missing environment variables: Check Railway dashboard
- Port binding: Railway assigns PORT automatically
- Database connection: Verify DATABASE_URL format

### Secret Issues

1. Verify secrets in Railway dashboard
2. Check secret names match code exactly (case-sensitive)
3. Restart service after changing secrets

**Tip:** Use Railway CLI to quickly verify secrets:
```bash
railway variables
```

### Health Check Failures

If health checks fail:
1. Increase `healthcheckTimeout` in railway.json
2. Verify health endpoint returns 200 status
3. Check server logs for startup errors

## Rolling Back

### List deployments
```bash
railway deployments
```

### Rollback to specific deployment
```bash
railway rollback <deployment-id>
```

## Environment-Specific Configuration

### Production
- Set `NODE_ENV=production`
- Enable `SAFETY_LOCK=true`
- Use `TRADING_MODE=paper` initially

### Staging
- Set `NODE_ENV=staging`
- Use testnet: `TESTNET=true`
- Enable verbose logging: `LOG_LEVEL=debug`

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use Railway secrets** for sensitive data
3. **Enable 2FA** on Railway account
4. **Rotate secrets** regularly
5. **Monitor logs** for suspicious activity
6. **Use HTTPS** only (automatic with Railway)

## Performance Optimization

### Recommended Settings
- Health check timeout: 300s
- Restart policy: ON_FAILURE
- Max retries: 10

### Scaling
Railway auto-scales based on load. Monitor metrics:
- CPU usage
- Memory usage
- Request rate
- Response time

## Support

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Community:** [Railway Discord](https://discord.gg/railway)
- **Status:** [status.railway.app](https://status.railway.app)

## Additional Resources

- See `.env.production` for complete environment template
- Check `scripts/start-production.sh` for startup sequence
- Review `scripts/health-check.sh` for health validation

---

## Quick Reference

### Deploy
```bash
railway up
```

### Logs
```bash
railway logs --follow
```

### Environment Variables
```bash
railway variables
railway variables set KEY=value
```

### Status
```bash
railway status
```

### Rollback
```bash
railway rollback <deployment-id>
```
