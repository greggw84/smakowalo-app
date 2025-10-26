# Email Verification & OAuth Setup Guide

## 🚨 CRITICAL: Why Emails Aren't Sending

Your confirmation emails are NOT being sent because:

### Resend Domain Verification Required

Resend requires you to **verify your domain** before sending emails. Currently you're trying to send from `noreply@smakowalo.pl`, but `smakowalo.pl` is not verified in your Resend account.

## ✅ Step 1: Verify Your Domain in Resend

### 1.1 Login to Resend Dashboard
1. Go to https://resend.com/login
2. Sign in with your Resend account

### 1.2 Add Domain
1. Click **Domains** in the left sidebar
2. Click **Add Domain**
3. Enter: `smakowalo.pl`
4. Click **Add**

### 1.3 Verify Domain with DNS Records
Resend will give you DNS records to add. You need to add these to your domain's DNS settings:

**DNS Records to Add:**
```
Type: TXT
Name: @ (or leave empty)
Value: [Resend will provide this value]

Type: CNAME
Name: resend._domainkey
Value: [Resend will provide this value]
```

**Where to add DNS records:**
- If your domain is managed by Vercel: Go to Vercel Dashboard → Domains → DNS
- If your domain is managed elsewhere (e.g., GoDaddy, Namecheap): Login to your domain registrar

### 1.4 Verify Domain
1. After adding DNS records, go back to Resend dashboard
2. Click **Verify** button next to your domain
3. Wait for verification (can take up to 24-48 hours)
4. Once verified, you'll see a green checkmark ✅

### 1.5 Alternative: Use Resend's Test Domain (Quick Fix)
If you can't verify your domain immediately, you can use Resend's test domain:

**Update in Vercel Environment Variables:**
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

⚠️ **Note:** Test domain is for testing only. Emails may go to spam. Verify your domain for production.

---

## 🔐 Step 2: Set Up Google OAuth

### 2.1 Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click **Select a project** → **New Project**
3. Name: `Smakowalo App`
4. Click **Create**

### 2.2 Enable Google+ API
1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### 2.3 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace)
3. Click **Create**
4. Fill in:
   - **App name**: Smakowało
   - **User support email**: Your email
   - **App logo**: (optional) Upload Smakowało logo
   - **Application home page**: `https://www.smakowalo.pl`
   - **Authorized domains**: `smakowalo.pl`
   - **Developer contact**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click **Add or Remove Scopes**
   - Select: `email`, `profile`, `openid`
   - Click **Update** → **Save and Continue**
7. **Test users** (optional): Add test emails
8. Click **Save and Continue**

### 2.4 Create OAuth Credentials

⚠️ **IMPORTANT**: This app uses **Supabase OAuth**, not NextAuth OAuth.

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Smakowało Web App`
5. **Authorized JavaScript origins**:
   - `https://www.smakowalo.pl`
   - `https://smakowalo.pl`
6. **Authorized redirect URIs** (Supabase OAuth callback format):
   - `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`
   - Example: `https://abcdefghijk.supabase.co/auth/v1/callback`
   - ℹ️ Find your project ID in Supabase Dashboard → Settings → API
7. Click **Create**
8. **Copy the Client ID and Client Secret** (you'll need these for Supabase)

### 2.5 Configure Google OAuth in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Find **Google** and click **Enable**
3. Enter:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
4. Click **Save**

### 2.6 Add to Vercel Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
# These are already configured in Supabase, no need to add to Vercel
# The app uses Supabase Auth which handles OAuth internally
```

---

## 📘 Step 3: Set Up Facebook OAuth

### 3.1 Create Facebook App
1. Go to https://developers.facebook.com/
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Click **Next**
5. Fill in:
   - **App name**: Smakowało
   - **App contact email**: Your email
6. Click **Create App**

### 3.2 Add Facebook Login Product
1. In your app dashboard, find **Facebook Login**
2. Click **Set Up**
3. Select **Web**
4. Enter site URL: `https://www.smakowalo.pl`
5. Click **Save** → **Continue**

### 3.3 Configure Facebook Login Settings

⚠️ **IMPORTANT**: This app uses **Supabase OAuth**, not NextAuth OAuth.

1. Go to **Products** → **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs** (Supabase OAuth callback format):
   - Add: `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`
   - Example: `https://abcdefghijk.supabase.co/auth/v1/callback`
   - ℹ️ Find your project ID in Supabase Dashboard → Settings → API
3. **Allowed Domains for the JavaScript SDK**:
   - Add: `smakowalo.pl`
4. Click **Save Changes**

### 3.4 Get App Credentials
1. Go to **Settings** → **Basic**
2. **Copy App ID** (this is your Facebook Client ID)
3. **Copy App Secret** (click **Show** to reveal)
   - ⚠️ Keep this secret secure!

### 3.5 Configure Facebook OAuth in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Find **Facebook** and click **Enable**
3. Enter:
   - **Client ID**: Your Facebook App ID
   - **Client Secret**: Your Facebook App Secret
4. Click **Save**

### 3.6 Set App to Live Mode
1. At the top of the dashboard, find the toggle switch
2. Change from **Development** to **Live**
3. You may need to provide additional business verification

---

## 📋 Step 4: Update Vercel Environment Variables

Go to https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add/Update ALL of these:**

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.smakowalo.pl
NEXTAUTH_URL=https://www.smakowalo.pl
NEXTAUTH_SECRET=6QYBkwpIycfg5yvnqoRu55Frhou1fjvNhMi0EyHU3Hw=

# Email (Resend)
RESEND_API_KEY=re_AwTLPHeZ_PmJS1zgxVruwJtQasDF3uDW7
RESEND_FROM_EMAIL=noreply@smakowalo.pl
# OR use test domain temporarily:
# RESEND_FROM_EMAIL=onboarding@resend.dev

# Supabase (REQUIRED for OAuth)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google and Facebook OAuth are configured in Supabase Dashboard
# No need to add GOOGLE_CLIENT_ID or FACEBOOK_CLIENT_ID to Vercel
# The app uses Supabase Auth which handles OAuth internally
```

**IMPORTANT:** Make sure to select **Production** environment when adding variables.

---

## 🚀 Step 5: Redeploy

After adding all environment variables:

1. Go to Vercel Dashboard → **Deployments**
2. Click on the latest deployment's **...** menu
3. Click **Redeploy**
4. Wait for deployment to complete

---

## 🧪 Step 6: Test Everything

### Test Email Verification:
1. Clear browser cookies for smakowalo.pl
2. Go to https://www.smakowalo.pl/login
3. Click **Rejestracja** (Register) tab
4. Enter email, password, and personal info
5. Click **Utwórz konto**
6. **Check your email inbox** (and spam folder)
7. Click the verification link in the email
8. You should be redirected to login page with success message

### Test Google Login:
1. Go to https://www.smakowalo.pl/login
2. Click **Google** button
3. You should see Google's OAuth consent screen
4. Select your Google account
5. Grant permissions
6. You should be redirected to /panel

### Test Facebook Login:
1. Go to https://www.smakowalo.pl/login
2. Click **Facebook** button
3. You should see Facebook's OAuth consent screen
4. Login with Facebook
5. Grant permissions
6. You should be redirected to /panel

---

## 🐛 Troubleshooting

### Emails Still Not Sending?

**Check Vercel Function Logs:**
1. Go to Vercel Dashboard → Your Project → **Functions**
2. Click on `/api/auth/[...nextauth]`
3. Look for errors related to Resend

**Common Issues:**
- ❌ Domain not verified in Resend → Verify domain or use `onboarding@resend.dev`
- ❌ Invalid Resend API key → Check API key in Resend dashboard
- ❌ FROM email doesn't match verified domain → Update `RESEND_FROM_EMAIL`

### Google OAuth Not Working?

**Common Issues:**
- ❌ Redirect URI mismatch → Double-check authorized redirect URIs
- ❌ JavaScript origin not allowed → Add your domain to authorized origins
- ❌ App not published → Make sure OAuth consent screen is published

### Facebook OAuth Not Working?

**Common Issues:**
- ❌ App in development mode → Switch app to **Live** mode
- ❌ Invalid OAuth redirect URI → Check Facebook Login settings
- ❌ Domain not allowed → Add domain to allowed domains

### Check Browser Console:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any error messages when clicking OAuth buttons

---

## 📧 Quick Fix: Use Resend Test Domain

If you need email verification to work **immediately** while waiting for domain verification:

**Update in Vercel:**
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Then redeploy.**

Emails will be sent from Resend's test domain. They may go to spam, but they will work.

---

## ✅ Summary Checklist

- [ ] Verify domain in Resend (or use test domain `onboarding@resend.dev`)
- [ ] Create Google OAuth credentials
- [ ] Create Facebook OAuth credentials
- [ ] Add all environment variables to Vercel
- [ ] Redeploy application
- [ ] Test email registration
- [ ] Test Google login
- [ ] Test Facebook login

---

## 🆘 Need Help?

If you're still having issues:

1. Check Vercel Function Logs for detailed error messages
2. Check browser console for JavaScript errors
3. Verify all environment variables are set correctly in Vercel
4. Make sure you redeployed after adding environment variables
5. Try incognito/private browsing mode to avoid cookie issues
