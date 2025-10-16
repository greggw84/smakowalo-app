# 🚨 CRITICAL: Required Environment Variables for Production

## ⚠️ Your Login Page is Stuck Loading!

This happens when **NEXTAUTH_SECRET** is not set in production.

## Required Variables for www.smakowalo.pl

### 1. NextAuth Configuration (CRITICAL!)

```bash
NEXTAUTH_URL=https://www.smakowalo.pl
NEXTAUTH_SECRET=<generate-a-random-secret>
```

**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

### 2. Supabase (Database)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Email Service (Already Set)

```bash
RESEND_API_KEY=re_AwTLPHeZ_PmJS1zgxVruwJtQasDF3uDW7
RESEND_FROM_EMAIL=noreply@smakowalo.pl
```

### 4. Site Configuration

```bash
NEXT_PUBLIC_SITE_URL=https://www.smakowalo.pl
```

---

## How to Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable above
5. Select: Production, Preview, Development
6. Click "Save"
7. Redeploy your application

---

## How to Test

After adding environment variables:

1. Go to: https://www.smakowalo.pl/login
2. Page should load (not infinite spinner)
3. You should see login/register tabs
4. Try to register a new account
5. Check if email verification works

---

## Common Issues

### Issue: Login page shows infinite loading spinner

**Cause:** NEXTAUTH_SECRET not set

**Solution:**
1. Generate secret: `openssl rand -base64 32`
2. Add to Vercel environment variables
3. Redeploy

### Issue: "Error: Invalid environment variables"

**Cause:** Missing required variables

**Solution:**
- Check all variables are set in Vercel
- Make sure no typos in variable names
- Redeploy after adding variables

### Issue: Can register but can't login

**Cause:** Supabase credentials missing or incorrect

**Solution:**
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check Supabase project is active
- Run database migration

---

## Quick Fix Checklist

- [ ] NEXTAUTH_URL set to: https://www.smakowalo.pl
- [ ] NEXTAUTH_SECRET generated and set
- [ ] NEXT_PUBLIC_SUPABASE_URL set
- [ ] SUPABASE_SERVICE_ROLE_KEY set
- [ ] RESEND_API_KEY set
- [ ] NEXT_PUBLIC_SITE_URL set to: https://www.smakowalo.pl
- [ ] All variables set for "Production" environment
- [ ] Application redeployed after adding variables
- [ ] Database migration SQL run in Supabase
- [ ] Domain verified in Resend

---

## Priority Order

**URGENT** (Fix login page):
1. NEXTAUTH_SECRET
2. NEXTAUTH_URL

**IMPORTANT** (Fix authentication):
3. NEXT_PUBLIC_SUPABASE_URL
4. SUPABASE_SERVICE_ROLE_KEY

**OPTIONAL** (Enable features):
5. RESEND_API_KEY (email verification)
6. GOOGLE_CLIENT_ID (Google login)
7. FACEBOOK_CLIENT_ID (Facebook login)
