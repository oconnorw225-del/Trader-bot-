# API Keys: Complete Step-by-Step Guide

## Overview

This guide walks you through getting API keys from each platform, **step by step**, with exact URLs, screenshots descriptions, and what to click.

**Time Required:** ~30-40 minutes total  
**Cost:** $0 to start (free tiers available)

---

## Quick Reference

| Platform | Time | Cost | Difficulty |
|----------|------|------|------------|
| Hugging Face | 2 min | Free | Easy ⭐ |
| Upwork | 10 min | Free | Medium ⭐⭐ |
| OpenAI | 3 min | $5 credit | Easy ⭐ |
| Fiverr | 8 min | Free | Medium ⭐⭐ |
| Freelancer | 5 min | Free | Easy ⭐ |
| Toptal | 15 min | Free | Hard ⭐⭐⭐ |
| Guru | 5 min | Free | Easy ⭐ |
| PeoplePerHour | 5 min | Free | Easy ⭐ |

---

## START HERE: Free APIs (Required)

### 1. Hugging Face API (100% Free - AI Proposal Generation)

**Why:** Generates AI proposals for free (unlimited)  
**Time:** 2 minutes  
**Cost:** $0 (completely free forever)

**Steps:**

1. **Sign Up**
   - Go to: https://huggingface.co/join
   - Enter email, username, password
   - Click "Sign Up"
   - Verify email (check inbox)

2. **Get API Token**
   - Go to: https://huggingface.co/settings/tokens
   - Click "New token" button
   - Name: `ndax-quantum-engine`
   - Type: Select "Read"
   - Click "Generate a token"
   - **COPY THE TOKEN** (starts with `hf_...`)

3. **Save It**
   ```bash
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**✅ Done!** You now have free AI proposal generation.

---

### 2. Upwork API (Free - Main Job Platform)

**Why:** Largest freelance platform, best job volume  
**Time:** 10 minutes  
**Cost:** $0 (free developer account)

**Steps:**

1. **Create Upwork Account** (if you don't have one)
   - Go to: https://www.upwork.com/signup
   - Choose "Work as a Freelancer"
   - Complete profile (name, skills, photo)
   - Verify email and phone

2. **Apply for Developer Access**
   - Go to: https://www.upwork.com/developer
   - Click "Register as a Developer"
   - Read Developer Agreement
   - Click "I Agree"

3. **Create an App**
   - Go to: https://www.upwork.com/developer/apps
   - Click "Create a New App"
   - Fill in:
     - **App Name:** `NDAX Quantum Engine`
     - **App Type:** Select "Web Application"
     - **Company:** Your name or company
     - **Website:** Your GitHub repo URL (or personal site)
     - **Description:** "AI-powered job automation tool"
     - **Redirect URI:** `http://localhost:3000/callback`
   - Click "Create App"

4. **Get Your Keys**
   - After creation, you'll see:
     - **Client ID** (long string)
     - **Client Secret** (even longer string)
   - **COPY BOTH**

5. **Save Them**
   ```bash
   UPWORK_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   UPWORK_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```

**✅ Done!** You can now fetch real Upwork jobs.

---

## OPTIONAL: Premium APIs (Better Quality)

### 3. OpenAI API (Best AI - $5 Free Credit)

**Why:** Best quality proposals, highest win rate  
**Time:** 3 minutes  
**Cost:** $5 free credit (then ~$0.002 per proposal)

**Steps:**

1. **Sign Up**
   - Go to: https://platform.openai.com/signup
   - Create account with email
   - Verify email

2. **Add Payment Method** (required for free $5 credit)
   - Go to: https://platform.openai.com/account/billing
   - Click "Set up paid account"
   - Add credit card (won't be charged until after $5 is used)
   - Get free $5 credit

3. **Create API Key**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name: `ndax-quantum-engine`
   - Click "Create secret key"
   - **COPY THE KEY** (starts with `sk-...`)
   - ⚠️ **SAVE NOW** - You can't see it again!

4. **Save It**
   ```bash
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**💰 Cost:** $5 credit = ~2,500 proposals (~$0.002 each)

**✅ Done!** You now have premium AI proposals.

---

## ADDITIONAL PLATFORMS: More Job Sources

### 4. Fiverr API (Gig-Based Work)

**Why:** Service-based jobs, recurring clients  
**Time:** 8 minutes  
**Cost:** $0

**Steps:**

1. **Create Fiverr Account**
   - Go to: https://www.fiverr.com/join
   - Sign up as Seller
   - Complete profile

2. **Developer Account**
   - Go to: https://developers.fiverr.com/
   - Click "Get Started"
   - Register as developer

3. **Create App**
   - Dashboard → "Create New App"
   - App Name: `NDAX Quantum Engine`
   - Redirect URI: `http://localhost:3000/callback`
   - Click "Create"

4. **Get Keys**
   - Copy "Client ID" and "Client Secret"

5. **Save Them**
   ```bash
   FIVERR_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   FIVERR_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```

**✅ Done!**

---

### 5. Freelancer.com API (High Volume)

**Why:** Lots of jobs, good for beginners  
**Time:** 5 minutes  
**Cost:** $0

**Steps:**

1. **Create Account**
   - Go to: https://www.freelancer.com/signup
   - Sign up as Freelancer
   - Verify email

2. **Developer Access**
   - Go to: https://developers.freelancer.com/
   - Click "Register Application"
   - Fill in details
   - Get OAuth credentials

3. **Save Keys**
   ```bash
   FREELANCER_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   FREELANCER_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```

**✅ Done!**

---

### 6. Toptal API (Premium Jobs)

**Why:** High-paying jobs ($100-200/hour), but harder to get in  
**Time:** 15 minutes  
**Cost:** $0

**Steps:**

1. **Apply to Toptal**
   - Go to: https://www.toptal.com/developers
   - Click "Apply as a Developer"
   - Complete screening process (may take days/weeks)

2. **Developer API** (after acceptance)
   - Contact Toptal support for API access
   - Request: "API access for job automation"
   - Wait for approval

3. **Get Keys** (provided by Toptal)
   ```bash
   TOPTAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Note:** Toptal has a vetting process. Skip this for now, come back later.

**✅ Done (when approved)!**

---

### 7. Guru API (Established Professionals)

**Why:** Quality jobs, professional clients  
**Time:** 5 minutes  
**Cost:** $0

**Steps:**

1. **Create Account**
   - Go to: https://www.guru.com/d/signup/
   - Sign up as Freelancer
   - Complete profile

2. **API Access**
   - Go to: https://www.guru.com/pro/api
   - Request API access
   - Get credentials via email

3. **Save Keys**
   ```bash
   GURU_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**✅ Done!**

---

### 8. PeoplePerHour API (UK/EU Focus)

**Why:** Good for European timezone jobs  
**Time:** 5 minutes  
**Cost:** $0

**Steps:**

1. **Create Account**
   - Go to: https://www.peopleperhour.com/freelancer/register
   - Sign up as Freelancer
   - Complete profile

2. **Developer API**
   - Email: api@peopleperhour.com
   - Subject: "API Access Request"
   - Body: "Hello, I'd like API access for job automation. My account: [your username]"
   - Wait for credentials (1-3 days)

3. **Save Keys** (when received)
   ```bash
   PEOPLEPERHOUR_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**✅ Done (when received)!**

---

## Quick Start Recommendation

**Start with just these 2:**

1. ✅ **Hugging Face** (free AI)
2. ✅ **Upwork** (best job volume)

This gives you:
- Free AI proposal generation
- Access to largest job platform
- Ability to start earning immediately

**Add later:**
3. **OpenAI** (when you want better proposals)
4. **Fiverr** (when you want more job sources)
5. **Others** (when scaling to $10k+/month)

---

## Complete .env Configuration

After getting keys, create `.env` file:

```bash
# Required - Start Here
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
UPWORK_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
UPWORK_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# Optional - Add Later for Better Results
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional - More Job Sources
FIVERR_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIVERR_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
FREELANCER_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FREELANCER_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
GURU_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PEOPLEPERHOUR_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TOPTAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Security (Required)
ENCRYPTION_KEY=your-secret-key-here-make-it-long-and-random
```

---

## Verification Checklist

Before starting the system, verify:

- [ ] Hugging Face token starts with `hf_`
- [ ] Upwork Client ID is ~32 characters
- [ ] Upwork Client Secret is ~64 characters
- [ ] OpenAI key starts with `sk-` (if using)
- [ ] .env file saved in project root
- [ ] .env file NOT committed to Git
- [ ] All keys copied exactly (no spaces)

---

## Testing Your Keys

After adding to `.env`, test each one:

```bash
# Test Hugging Face
curl -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
  https://huggingface.co/api/whoami

# Test OpenAI (if configured)
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Expected:** JSON response with your account info

---

## Troubleshooting

### "Invalid API Key"
- Copy key again (no extra spaces)
- Check key hasn't expired
- Verify you're using correct key type (some platforms have multiple)

### "Rate Limited"
- You're making too many requests
- Free tiers have limits (100-1000/day usually)
- Upgrade to paid tier or wait 24 hours

### "Access Denied"
- Developer account not approved yet
- Some platforms (Toptal, Guru) require manual approval
- Wait for approval email or contact support

### "Authentication Failed"
- Wrong key type (API key vs OAuth credentials)
- Client ID/Secret reversed
- Redirect URI doesn't match

---

## Cost Summary

| Service | Free Tier | Paid Cost | When to Upgrade |
|---------|-----------|-----------|-----------------|
| Hugging Face | Unlimited | N/A | Never (free forever) |
| Upwork | Free | $0 | Never |
| OpenAI | $5 credit | $0.002/proposal | After 2,500 proposals |
| Fiverr | Free | $0 | Never |
| Freelancer | Free | $0 | Never |
| Guru | Free | $0 | Never |
| Others | Free | $0 | Never |

**Total to start:** $0  
**Recommended investment:** $5-10 (OpenAI for better proposals)

---

## Next Steps

1. ✅ Get Hugging Face + Upwork keys (20 min)
2. ✅ Add to `.env` file
3. ✅ Test keys work
4. ✅ Run `npm start`
5. ✅ Submit first proposal
6. ✅ Land first job
7. ✅ Reinvest earnings in OpenAI
8. ✅ Add more platforms
9. ✅ Scale to $5k-10k/month

---

## Support

**Questions?** Check:
- `docs/QUICK_START.md` - General setup
- `docs/TERMUX_ANDROID_SETUP.md` - Android specific
- `docs/API_SETUP_GUIDE.md` - Advanced API config
- `docs/SETUP.md` - Technical details

**Need help?** Open an issue on GitHub with:
- Platform name
- Error message
- What you've tried

---

## Security Reminder

⚠️ **NEVER** share your API keys  
⚠️ **NEVER** commit .env to Git  
⚠️ **ALWAYS** use environment variables  
⚠️ **ROTATE** keys if exposed

Keep your `.env` file private and secure!

---

**Ready to start earning?** Get those first 2 keys and let's go! 🚀
