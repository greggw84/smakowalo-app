# 🚀 Vercel Deployment Guide

## ⚠️ Required Environment Variables

To deploy successfully to Vercel, you need to set these environment variables in your Vercel project settings.

### How to Add Environment Variables:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable below

---

## 📋 Required Variables

### 1. **Supabase Configuration**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these:**
- Go to your Supabase project dashboard
- Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` = "Project URL"
- `SUPABASE_SERVICE_ROLE_KEY` = "service_role" key (under "Project API keys")

⚠️ **Important:** The service role key is secret! Never expose it in client-side code.

---

### 2. **NextAuth Configuration**

```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-here
```

**How to generate NEXTAUTH_SECRET:**
```bash
# Run this command in your terminal:
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

---

### 3. **Resend Email Service**

```bash
RESEND_API_KEY=re_AwTLPHeZ_PmJS1zgxVruwJtQasDF3uDW7
RESEND_FROM_EMAIL=noreply@smakowalo.pl
```

**Already configured!** ✅

---

### 4. **Site Configuration**

```bash
NEXT_PUBLIC_SITE_URL=https://www.smakowalo.pl
```

Change this to your actual production domain.

---

### 5. **OAuth Providers (Optional)**

If you want to enable Google/Facebook login:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

**Note:** These are optional. The app works without them using email/password authentication.

---

## 🔧 Step-by-Step Deployment

### Step 1: Add Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all required variables listed above
5. Make sure to select the correct environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 2: Update Database

Before deploying, make sure you've run the SQL migration:

1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy contents of `supabase-migration-email-verification.sql`
4. Run the query

### Step 3: Verify Domain in Resend

1. Go to https://resend.com/domains
2. Add domain: `smakowalo.pl`
3. Add DNS records as shown
4. Wait for verification

### Step 4: Deploy

```bash
# Option 1: Push to GitHub (auto-deploy if connected)
git push origin main

# Option 2: Deploy manually
vercel --prod
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] Login/Register works
- [ ] Email verification emails are sent
- [ ] Welcome emails are sent after verification
- [ ] All pages load without errors
- [ ] Database connections work
- [ ] Environment variables are set correctly

---

## 🐛 Common Issues

### Issue: "supabaseKey is required"

**Solution:**
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- The key should be the "service_role" key, not "anon" key
- Key should be long (100+ characters)

### Issue: Build fails with "Module not found"

**Solution:**
- Clear build cache: Settings → General → Clear Build Cache
- Redeploy

### Issue: Emails not sending

**Solution:**
- Verify `RESEND_API_KEY` is set correctly
- Make sure domain is verified in Resend
- Check Resend dashboard for failed sends

### Issue: Authentication not working

**Solution:**
- Verify `NEXTAUTH_URL` matches your production URL
- Make sure `NEXTAUTH_SECRET` is set
- Check that Supabase credentials are correct

---

## 📝 Environment Variables Template

Copy this template to quickly set up your variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Resend Email
RESEND_API_KEY=re_AwTLPHeZ_PmJS1zgxVruwJtQasDF3uDW7
RESEND_FROM_EMAIL=noreply@smakowalo.pl

# Site
NEXT_PUBLIC_SITE_URL=

# Optional: OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local` to Git** ✅ (already in .gitignore)
2. **Use different keys for development and production**
3. **Rotate secrets periodically**
4. **Keep service role key secret**
5. **Enable RLS (Row Level Security) in Supabase**

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Check Resend dashboard for email delivery
4. Verify all environment variables are set correctly
5. Try clearing build cache and redeploying

---

## 🎉 Success!

Once deployed, your app will be available at:
- Production: https://www.smakowalo.pl
- Preview: https://your-branch-name-smakowalo.vercel.app

All features will work including:
- ✅ User registration
- ✅ Email verification
- ✅ Welcome emails
- ✅ Login/logout
- ✅ Database operations
- ✅ All pages and functionality
