# 🚀 QUICK FIX: Email & OAuth Not Working

## ⚡ Immediate Fix (5 minutes)

### Step 1: Update Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Update/Add these for Production environment:**

```bash
# Fix Email Sending (use Resend test domain)
RESEND_FROM_EMAIL=onboarding@resend.dev

# Enable Google OAuth (get credentials from Google Cloud Console)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Enable Facebook OAuth (get credentials from Facebook Developers)
FACEBOOK_CLIENT_ID=YOUR_FACEBOOK_APP_ID
FACEBOOK_CLIENT_SECRET=YOUR_FACEBOOK_APP_SECRET
```

### Step 2: Redeploy

1. Go to Vercel Dashboard → **Deployments**
2. Click **...** on latest deployment → **Redeploy**

---

## 📧 Why Emails Don't Work

**Problem:** Your domain `smakowalo.pl` is NOT verified in Resend.

**Quick Solution:** Use Resend's test domain `onboarding@resend.dev`

**Add to Vercel:**
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

⚠️ **Note:** Emails from test domain may go to spam. For production, verify your domain in Resend dashboard.

---

## 🔐 Why OAuth Doesn't Work

**Problem:** Facebook & Google credentials are missing.

**Quick Solution:**

### For Google:
1. Go to https://console.cloud.google.com/
2. Create OAuth credentials
3. Add redirect URI: `https://www.smakowalo.pl/api/auth/callback/google`
4. Copy Client ID & Secret to Vercel

### For Facebook:
1. Go to https://developers.facebook.com/
2. Create app and add Facebook Login
3. Add redirect URI: `https://www.smakowalo.pl/api/auth/callback/facebook`
4. Copy App ID & Secret to Vercel

---

## ✅ Full Setup Guide

See `OAUTH-EMAIL-SETUP.md` for detailed step-by-step instructions.

---

## 🧪 Test After Deployment

### Test Email:
1. Go to https://www.smakowalo.pl/login
2. Register new account
3. **Check your email** (and spam folder!)
4. Click verification link

### Test Google Login:
1. Click "Google" button on login page
2. Should redirect to Google OAuth

### Test Facebook Login:
1. Click "Facebook" button on login page
2. Should redirect to Facebook OAuth

---

## 🐛 Still Not Working?

**Check Vercel Function Logs:**
1. Vercel Dashboard → Functions
2. Click `/api/auth/[...nextauth]`
3. Look for error messages

**Common Issues:**
- Did you redeploy after adding environment variables?
- Are environment variables set for **Production** environment?
- Did you clear browser cookies?

**Get detailed setup instructions:** See `OAUTH-EMAIL-SETUP.md`
