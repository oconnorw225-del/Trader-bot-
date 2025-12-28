# Password Setup Guide

## Overview

The NDAX Quantum Engine includes a password-protected authentication system that secures access to the Chimera dashboard. This guide explains how to set up, configure, and manage the access password.

## Quick Start

### 1. Set Your Access Password

Edit your `.env` file and set the `ACCESS_PASSWORD` variable:

```bash
ACCESS_PASSWORD=your_secure_password_here
```

**Important:** 
- Choose a strong password (minimum 12 characters recommended)
- Include uppercase, lowercase, numbers, and special characters
- Never commit your `.env` file to version control

### 2. Configure JWT Secret

Set a secure JWT secret for token generation:

```bash
JWT_SECRET=your_jwt_secret_key_here_at_least_32_chars
```

Generate a secure random secret using:
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Start the Server

```bash
npm start
```

The authentication system will now be active!

## Configuration Options

### Environment Variables

All authentication settings are configured in your `.env` file:

```bash
# Required Settings
ACCESS_PASSWORD=change_me_in_production
JWT_SECRET=your_jwt_secret_key_here_at_least_32_chars

# Optional Settings (with defaults)
TOKEN_EXPIRY=24h                # Token expiration time (e.g., 1h, 12h, 7d)
MAX_LOGIN_ATTEMPTS=5            # Maximum failed login attempts before lockout
LOCKOUT_DURATION=900            # Lockout duration in seconds (900 = 15 minutes)
REQUIRE_AUTH=true               # Enable/disable authentication requirement
```

### Token Expiry Format

The `TOKEN_EXPIRY` setting accepts various formats:
- `60` - 60 seconds
- `1h` - 1 hour
- `12h` - 12 hours
- `24h` - 24 hours (default)
- `7d` - 7 days
- `30d` - 30 days

## Changing the Password

### Production Environment

1. **Update `.env` file:**
   ```bash
   ACCESS_PASSWORD=new_secure_password
   ```

2. **Restart the server:**
   ```bash
   npm restart
   ```

3. **Notify users:**
   - All existing sessions will remain valid until tokens expire
   - Users will need the new password for their next login

### Force Immediate Re-authentication

To force all users to re-authenticate immediately:

1. Change the password in `.env`
2. Change the JWT_SECRET in `.env` (this invalidates all tokens)
3. Restart the server

```bash
ACCESS_PASSWORD=new_password
JWT_SECRET=new_jwt_secret_generated_above
```

## Security Best Practices

### Password Requirements

**Recommended:**
- Minimum 12 characters
- Mix of uppercase and lowercase letters
- Include numbers and special characters
- Avoid dictionary words
- Don't reuse passwords from other systems

**Example strong passwords:**
```
T7$nK9pL@mQ4xW2v
Quantum2024!Secure#
Ch1m3r@_Tr4d1ng!2024
```

### Protecting Your Credentials

1. **Never commit `.env` to Git:**
   - The `.env` file is already in `.gitignore`
   - Double-check before committing

2. **Use different passwords per environment:**
   - Development: Simple password for convenience
   - Staging: Complex password, shared with team
   - Production: Highly secure, limited access

3. **Rotate passwords regularly:**
   - Change production password every 90 days
   - Update immediately if compromised

4. **Secure backups:**
   - Store production password in a secure password manager
   - Document recovery procedures

### Rate Limiting

The system includes built-in protection against brute force attacks:

- **5 failed attempts** → Account locked
- **15-minute lockout** → Automatic unlock after duration
- **Progressive delays** → Increasing delay between attempts
- **IP-based tracking** → Prevents multiple account attacks

## Development Mode

### Disabling Authentication for Development

For local development, you can disable authentication:

```bash
NODE_ENV=development
REQUIRE_AUTH=false
```

**Warning:** Never use `REQUIRE_AUTH=false` in production!

### Testing Authentication

Test the authentication system locally:

1. **Start server with auth enabled:**
   ```bash
   REQUIRE_AUTH=true npm start
   ```

2. **Access the application:**
   - Open http://localhost:3000
   - You should see the authentication page
   - Enter your password from `.env`

3. **Test failed attempts:**
   - Enter wrong password 5 times
   - Verify lockout occurs

## Password Recovery

### If You Forget the Password

1. **Access server environment:**
   - SSH into your server
   - Or access your hosting platform's environment variables

2. **Set new password:**
   ```bash
   # Edit .env file
   nano .env
   
   # Update ACCESS_PASSWORD
   ACCESS_PASSWORD=new_password_here
   ```

3. **Restart server:**
   ```bash
   npm restart
   # Or use your hosting platform's restart command
   ```

### Emergency Access

If you're completely locked out:

1. **Disable authentication temporarily:**
   ```bash
   REQUIRE_AUTH=false
   ```

2. **Restart server and access dashboard**

3. **Set new password in `.env`**

4. **Re-enable authentication:**
   ```bash
   REQUIRE_AUTH=true
   ```

5. **Restart server again**

## Deployment-Specific Instructions

### Railway

1. **Set environment variables in Railway dashboard:**
   - Go to your project → Variables
   - Add `ACCESS_PASSWORD`
   - Add `JWT_SECRET`

2. **Redeploy:**
   - Railway will automatically redeploy

### Docker

1. **Pass environment variables to container:**
   ```bash
   docker run -e ACCESS_PASSWORD=your_password \
              -e JWT_SECRET=your_secret \
              -p 3000:3000 ndax-quantum-engine
   ```

2. **Or use docker-compose.yml:**
   ```yaml
   environment:
     - ACCESS_PASSWORD=${ACCESS_PASSWORD}
     - JWT_SECRET=${JWT_SECRET}
   ```

### AWS / Cloud Platforms

1. **Use secrets management:**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Cloud Secret Manager

2. **Load secrets at runtime:**
   ```javascript
   // Example for AWS
   const password = await secretsManager.getSecretValue('ACCESS_PASSWORD');
   ```

## Monitoring & Logging

### Authentication Logs

The system logs all authentication attempts:

```
✅ Successful login from IP: 192.168.1.100
❌ Failed login attempt from IP: 192.168.1.101 (3/5)
🔒 IP locked out: 192.168.1.102
```

### Monitoring Failed Attempts

Check logs for suspicious activity:

```bash
# View recent authentication logs
npm start | grep "Failed login"

# Count failed attempts by IP
npm start | grep "Failed login" | sort | uniq -c
```

## Troubleshooting

### "Invalid Password" Error (Correct Password)

1. **Check for whitespace:**
   - Remove spaces from password in `.env`
   - Format: `ACCESS_PASSWORD=password` (no quotes, no spaces)

2. **Restart server:**
   - Changes to `.env` require restart

3. **Verify environment variables loaded:**
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.ACCESS_PASSWORD)"
   ```

### "Token Expired" Error

- Token expiry is working correctly
- User needs to log in again
- Adjust `TOKEN_EXPIRY` if sessions are too short

### "Too Many Attempts" Lockout

- Wait 15 minutes for automatic unlock
- Or clear localStorage in browser:
  ```javascript
  localStorage.removeItem('auth_lockout_until');
  localStorage.removeItem('auth_attempts');
  ```

### Authentication Not Working

1. **Verify auth routes are accessible:**
   ```bash
   curl http://localhost:3000/auth/verify
   ```

2. **Check middleware is loaded:**
   - Look for auth middleware in server logs
   - Verify `auth-middleware.js` exists

3. **Verify JWT_SECRET is set:**
   ```bash
   echo $JWT_SECRET
   ```

## Advanced Configuration

### Custom Lockout Duration

Adjust lockout time for stricter security:

```bash
LOCKOUT_DURATION=1800  # 30 minutes
LOCKOUT_DURATION=3600  # 1 hour
```

### Custom Attempt Limits

```bash
MAX_LOGIN_ATTEMPTS=3  # Stricter (lock after 3 attempts)
MAX_LOGIN_ATTEMPTS=10 # More lenient (lock after 10 attempts)
```

### Session Management

Shorter sessions for sensitive environments:

```bash
TOKEN_EXPIRY=1h   # 1 hour sessions
TOKEN_EXPIRY=30m  # 30 minute sessions
```

Longer sessions for convenience:

```bash
TOKEN_EXPIRY=7d   # 1 week sessions
TOKEN_EXPIRY=30d  # 1 month sessions
```

## Future Enhancements

Planned authentication features:

- [ ] Two-factor authentication (2FA)
- [ ] Multiple user accounts with roles
- [ ] OAuth integration (Google, GitHub)
- [ ] Session management dashboard
- [ ] Password reset via email
- [ ] Audit log export
- [ ] IP whitelist/blacklist
- [ ] Device fingerprinting

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review server logs for error messages
3. Consult the main README.md
4. Open an issue on GitHub with details

## Security Disclosure

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email security concerns privately
3. Include detailed reproduction steps
4. Allow time for patch before disclosure

---

**Last Updated:** December 20, 2024  
**Version:** 1.0.0
