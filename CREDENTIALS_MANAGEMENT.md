# Credentials Management Guide

**NEVER commit credentials to GitHub. NEVER hardcode secrets in code or documentation.**

## Setup Instructions

### 1. Create `.env.local` (LOCAL ONLY, NEVER COMMIT)

Copy from `.env.example` and fill in your actual values.

### 2. Store Credentials in Bitwarden (Free)

1. Download Bitwarden: https://bitwarden.com/download/
2. Create free account
3. Store each credential as a separate entry:
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio Phone Number
   - Supabase URL
   - Supabase Anon Key
   - Stripe keys (if using)

### 3. GitHub Secrets (For Deployments)

1. Go to repo Settings → Secrets and Variables → Actions
2. Add secrets for production
3. Vercel will automatically use these

### 4. Vercel Environment Variables

1. Go to Vercel Dashboard → hvac-demo → Settings → Environment Variables
2. Add the same secrets
3. Mark sensitive ones as "Sensitive"

## Security Rules

- ✅ Use `.env.local` for local development
- ✅ Use GitHub Secrets for CI/CD
- ✅ Use Bitwarden for credential storage
- ❌ NEVER commit `.env` files
- ❌ NEVER hardcode credentials in code
- ❌ NEVER paste credentials in documentation
- ❌ NEVER share credentials in chat/messages

## If Credentials Are Exposed

1. **Rotate immediately** in the service (Twilio, Stripe, etc.)
2. **Create new credentials**
3. **Update everywhere**: `.env.local`, Bitwarden, GitHub Secrets, Vercel
4. **Clean git history** (contact for help)
