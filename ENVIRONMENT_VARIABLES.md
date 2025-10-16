# 🔑 Environment Variables - Complete Reference

All environment variables for your Smakowało app, organized by category.

---

## 📋 Quick Reference

| Priority | Service | Required? | Time to Setup |
|----------|---------|-----------|---------------|
| 🔴 Critical | Site URL, NextAuth | **YES** | 2 min |
| 🟡 Recommended | Supabase Database | No (uses mock) | 15 min |
| 🟡 Recommended | Email Service | No (uses mock) | 10 min |
| 🟢 Optional | Analytics | No | 5 min |
| 🟢 Optional | Payment (Stripe) | No | 10 min |
| 🟢 Optional | OpenCart | No (uses mock) | varies |

---

## 🔴 CRITICAL (Required for Deployment)

### 1. Site Configuration

```bash
# Your deployed site URL
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
# or with custom domain:
# NEXT_PUBLIC_SITE_URL=https://smakowalo.pl

# Site name
NEXT_PUBLIC_SITE_NAME=Smakowało
```

**How to set:**
- Initially: Use your Vercel URL (e.g., `https://smakowalo-app.vercel.app`)
- After custom domain: Update to your domain
- Must start with `NEXT_PUBLIC_` to be accessible in browser

---

### 2. Authentication Secret

```bash
# Secret key for NextAuth.js (MUST be random and secure)
NEXTAUTH_SECRET=your-random-32-character-secret-here

# NextAuth URL (usually same as site URL)
NEXTAUTH_URL=${NEXT_PUBLIC_SITE_URL}
```

**How to generate:**
```bash
# Option 1: Use OpenSSL
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**Example result:**
```bash
NEXTAUTH_SECRET=Kd8sJ3mP9vB2nF5qT7wY1xC4zA6hL0gR
```

---

## 🟡 RECOMMENDED (For Production Features)

### 3. Supabase Database

```bash
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Public anonymous key (safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (KEEP SECRET - server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get (15 minutes):**

1. **Create Supabase account:** [supabase.com](https://supabase.com)
2. **Create new project:**
   - Name: `Smakowało`
   - Region: Europe (closest to Poland)
   - Generate strong password
3. **Get API keys:**
   - Go to: Settings → API
   - Copy: Project URL
   - Copy: `anon` `public` key
   - Copy: `service_role` `secret` key
4. **Run database schema:**
   - Go to: SQL Editor
   - Paste contents of `supabase/schema.sql`
   - Click Run

**See full guide:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**If not configured:** App uses mock data (works fine for testing)

---

### 4. Email Service (Choose One)

#### Option A: SendGrid (Recommended)

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@smakowalo.pl
ADMIN_EMAIL=pomoc@smakowalo.pl
```

**How to get (10 minutes):**

1. **Sign up:** [sendgrid.com](https://sendgrid.com)
2. **Create API Key:**
   - Settings → API Keys
   - Create API Key
   - Name: "Smakowalo Production"
   - Permissions: Full Access
   - Copy the key (shows only once!)
3. **Verify sender:**
   - Settings → Sender Authentication
   - Verify Single Sender
   - Use your email or domain

**Free tier:** 100 emails/day

---

#### Option B: Resend (Modern Alternative)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@smakowalo.pl
ADMIN_EMAIL=pomoc@smakowalo.pl
```

**How to get (5 minutes):**

1. **Sign up:** [resend.com](https://resend.com)
2. **Create API Key:**
   - API Keys → Create API Key
   - Name: "Smakowalo"
   - Copy the key
3. **Add domain (optional but recommended):**
   - Domains → Add Domain
   - Follow DNS instructions

**Free tier:** 3,000 emails/month

**See full guide:** [EMAIL_SETUP.md](./EMAIL_SETUP.md)

**If not configured:** App uses mock email service (logs to console)

---

## 🟢 OPTIONAL (Nice to Have)

### 5. Google Analytics

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

**How to get (5 minutes):**

1. **Go to:** [analytics.google.com](https://analytics.google.com)
2. **Create property:**
   - Admin → Create Property
   - Name: "Smakowało"
   - Configure data stream for your website
3. **Get Measurement ID:**
   - Data Streams → Your website
   - Copy: Measurement ID (starts with `G-`)

**What it does:** Tracks visitors, page views, events

---

### 6. Facebook Pixel

```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
```

**How to get (5 minutes):**

1. **Go to:** [business.facebook.com](https://business.facebook.com)
2. **Events Manager:**
   - Create Pixel
   - Name: "Smakowało"
   - Copy Pixel ID (15-16 digits)

**What it does:** Track conversions, retarget users

---

### 7. Stripe Payments

```bash
# Publishable key (safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
# or for testing:
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Secret key (KEEP SECRET - server-side only)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Webhook secret (for receiving payment events)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**How to get:**

1. **Sign up:** [stripe.com](https://stripe.com)
2. **Get API keys:**
   - Developers → API Keys
   - Copy: Publishable key
   - Copy: Secret key
3. **Setup webhook:**
   - Developers → Webhooks
   - Add endpoint: `https://your-site.com/api/webhooks/stripe`
   - Copy: Webhook secret

**Free:** No monthly fees, only transaction fees

---

### 8. OpenCart Integration (Optional)

```bash
OPENCART_URL=https://your-opencart-site.com
OPENCART_API_TOKEN=your-api-token
OPENCART_API_USERNAME=your-username
```

**How to get:**

1. Your OpenCart admin panel
2. System → Users → API
3. Create new API user
4. Copy credentials

**If not configured:** App uses built-in product data

---

### 9. Google Site Verification

```bash
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-verification-code
```

**How to get:**

1. **Go to:** [search.google.com/search-console](https://search.google.com/search-console)
2. **Add property:** Your website URL
3. **Verify:** HTML tag method
4. **Copy:** The verification code

**What it does:** Enables Google Search Console

---

## ⚙️ SYSTEM CONFIGURATION

### 10. Feature Flags

```bash
# Enable/disable features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

---

### 11. Caching

```bash
# Cache duration in seconds (default: 1 hour)
CACHE_TTL=3600
```

---

### 12. Development Settings

```bash
# Environment
NODE_ENV=production

# Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

---

## 📥 How to Add to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to:** [vercel.com](https://vercel.com)
2. **Select your project**
3. **Settings → Environment Variables**
4. **Add each variable:**
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://your-app.vercel.app`
   - Environment: Production (+ Preview if needed)
   - Click "Save"
5. **Redeploy** after adding variables

---

### Method 2: Vercel CLI

```bash
# Set single variable
vercel env add NEXT_PUBLIC_SITE_URL

# Set from .env file
vercel env pull .env.local
```

---

### Method 3: Import from .env.local

1. Create `.env.local` file with all variables
2. In Vercel dashboard: Settings → Environment Variables
3. Click "Import" → Select `.env.local`

---

## 📋 Quick Setup Checklist

### Minimum (Deploy immediately):
- [ ] `NEXT_PUBLIC_SITE_URL` - Your Vercel URL
- [ ] `NEXTAUTH_SECRET` - Generate random string

### Recommended (Production-ready):
- [ ] All minimum variables ✓
- [ ] Supabase database (15 min)
- [ ] Email service (10 min)

### Full Setup (All features):
- [ ] All recommended variables ✓
- [ ] Google Analytics
- [ ] Facebook Pixel
- [ ] Stripe payments
- [ ] Custom domain

---

## 🔒 Security Best Practices

**DO:**
✅ Use strong random values for secrets
✅ Different secrets for dev/production
✅ Store secrets in Vercel dashboard
✅ Use `NEXT_PUBLIC_` only for safe values
✅ Rotate secrets periodically

**DON'T:**
❌ Commit `.env.local` to git
❌ Share secrets publicly
❌ Use same secret across projects
❌ Put secrets in frontend code
❌ Use `NEXT_PUBLIC_` for secret keys

---

## 🆘 Troubleshooting

### "Environment variable not found"

**Problem:** Variable not accessible in code

**Solution:**
1. Check it's added in Vercel dashboard
2. Client-side variables need `NEXT_PUBLIC_` prefix
3. Redeploy after adding variables

---

### "Invalid authentication secret"

**Problem:** `NEXTAUTH_SECRET` not set or too short

**Solution:**
```bash
# Generate new secret
openssl rand -base64 32

# Add to Vercel
# Redeploy
```

---

### "Database connection failed"

**Problem:** Supabase credentials incorrect

**Solution:**
1. Verify URL and keys in Supabase dashboard
2. Check for typos
3. Make sure project is active
4. Check keys haven't expired

---

## 📚 Related Guides

- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Full production setup
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Database setup details
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** - Email service details
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide

---

## ✅ Summary

**Minimum to deploy:**
- `NEXT_PUBLIC_SITE_URL`
- `NEXTAUTH_SECRET`

**Everything else is optional!** Your app works with mock data by default.

Add services incrementally as you need them. Start simple, grow as needed! 🚀
