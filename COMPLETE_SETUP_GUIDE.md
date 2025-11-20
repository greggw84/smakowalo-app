# 🚀 Complete Setup Guide - Production Ready

This guide will walk you through setting up **everything** for production deployment.

## 📋 Overview

You'll set up:
1. ✅ **Supabase Database** (15 min) - User data, orders, products
2. ✅ **Email Service** (10 min) - SendGrid or Resend
3. ✅ **Vercel Deployment** (5 min) - Host your app
4. ✅ **Optional Services** (varies) - Analytics, custom domain, etc.

**Total time: ~30 minutes**

---

## 🗂️ Before You Start

### What You'll Need:

- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Supabase account (free)
- [ ] SendGrid or Resend account (free)
- [ ] Your domain (optional)

### Required Files:

All setup files are included in your project:
- `supabase/schema.sql` - Database schema
- `SUPABASE_SETUP.md` - Detailed Supabase guide
- `EMAIL_SETUP.md` - Detailed email guide
- `DEPLOYMENT.md` - Deployment guide

---

## 🎯 Quick Setup Path (Recommended)

### Step 1: Deploy App to Vercel (5 minutes)

**Why first?** Get your app live, then add services incrementally.

1. **Push to GitHub**:
   ```bash
   cd smakowalo-app
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repo
   - Click "Deploy"
   - Wait 2-3 minutes ✅

3. **Your app is live!** 🎉
   - URL: `https://your-project.vercel.app`
   - Works with mock data (no configuration needed)

### Step 2: Set Up Supabase Database (15 minutes)

**Follow:** `SUPABASE_SETUP.md`

**Quick steps:**
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL Editor
3. Copy API keys
4. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```
5. Redeploy app

**Result:** Real database, user registration, persistent cart ✅

### Step 3: Set Up Email Service (10 minutes)

**Follow:** `EMAIL_SETUP.md`

**Choose one:**

#### Option A: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Verify sender email
4. Add to Vercel:
   ```
   SENDGRID_API_KEY
   SENDGRID_FROM_EMAIL
   ```

#### Option B: Resend
1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Add to Vercel:
   ```
   RESEND_API_KEY
   RESEND_FROM_EMAIL
   ```

**Result:** Contact form, newsletters, order confirmations work ✅

### Step 4: Optional Enhancements

See sections below for:
- Google Analytics
- Custom domain
- Advanced features

---

## 📊 Complete Environment Variables

After all setup, your Vercel environment variables should include:

### Required (Core App)
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=Smakowało

# Authentication
NEXTAUTH_SECRET=generate-random-secret-32-chars
NEXTAUTH_URL=${NEXT_PUBLIC_SITE_URL}
```

### Database (After Step 2)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Email (After Step 3)
```bash
# SendGrid
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@smakowalo.pl

# OR Resend
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@smakowalo.pl

# Admin email
ADMIN_EMAIL=pomoc@smakowalo.pl
```

### Optional Services
```bash
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789

# OpenCart Integration (if you have OpenCart)
OPENCART_URL=https://your-opencart.com
OPENCART_API_TOKEN=your-token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 🔧 Optional Services Setup

### Google Analytics

**Time: 5 minutes**

1. **Create GA4 Property**:
   - Go to [analytics.google.com](https://analytics.google.com)
   - Create new property
   - Get Measurement ID (G-XXXXXXXXXX)

2. **Add to Vercel**:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   ```

3. **Redeploy**

**Result:** Track visitors, page views, events ✅

### Facebook Pixel

**Time: 5 minutes**

1. **Create Pixel**:
   - Go to [business.facebook.com](https://business.facebook.com)
   - Events Manager → Create Pixel
   - Copy Pixel ID

2. **Add to Vercel**:
   ```bash
   NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789
   ```

3. **Redeploy**

**Result:** Track conversions, retarget users ✅

### Custom Domain

**Time: 10 minutes**

1. **In Vercel Dashboard**:
   - Go to your project
   - Settings → Domains
   - Add domain: `smakowalo.pl`

2. **Update DNS** (at your domain registrar):
   ```
   A     @         76.76.21.21
   CNAME www       cname.vercel-dns.com
   ```

3. **Wait for verification** (5-10 minutes)

4. **Update environment variable**:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://smakowalo.pl
   ```

**Result:** Your own branded domain ✅

---

## ✅ Verification Checklist

After setup, verify everything works:

### Basic Functionality
- [ ] Homepage loads
- [ ] Menu page shows products
- [ ] Product pages work
- [ ] Cart system functional
- [ ] Kreator (meal planner) works

### Database Features (if Supabase set up)
- [ ] User registration works
- [ ] Login works
- [ ] Cart persists between sessions
- [ ] Favorites save correctly
- [ ] Orders are created
- [ ] User panel shows data

### Email Features (if email service set up)
- [ ] Contact form sends email
- [ ] Newsletter signup sends confirmation
- [ ] Order confirmation emails send
- [ ] Emails don't go to spam

### Analytics (if set up)
- [ ] Google Analytics tracking works
- [ ] Facebook Pixel fires events
- [ ] Cookie consent banner shows

---

## 🐛 Common Issues & Solutions

### 1. "Environment variables not found"

**Problem:** Variables not available in app

**Solution:**
1. Check they're set in Vercel dashboard
2. Client variables must start with `NEXT_PUBLIC_`
3. Redeploy after adding variables

### 2. "Database connection failed"

**Problem:** Can't connect to Supabase

**Solution:**
1. Verify Supabase URL and keys
2. Check Supabase project is running
3. Check RLS policies allow access

### 3. "Emails not sending"

**Problem:** Contact form doesn't send emails

**Solution:**
1. Verify API key is correct
2. Check sender email is verified
3. Check server logs for errors

### 4. Build fails

**Problem:** Deployment fails

**Solution:**
1. Check build logs in Vercel
2. Run `bun run build` locally
3. Fix any TypeScript errors

---

## 📈 Monitoring & Maintenance

### Vercel Dashboard

**Check regularly:**
- Deployment status
- Analytics
- Error logs
- Performance metrics

### Supabase Dashboard

**Monitor:**
- Database size
- Active users
- API requests
- Query performance

### Email Service

**Track:**
- Delivery rates
- Open rates
- Bounce rates
- Spam reports

---

## 🚀 Performance Optimization

Your app is already optimized, but you can improve further:

### 1. Enable Caching

```bash
# Add to environment variables
CACHE_TTL=3600  # Cache for 1 hour
```

### 2. Optimize Images

- Use Next.js Image component (already done ✅)
- Compress images before upload
- Use WebP format
- Implement lazy loading

### 3. Enable CDN

Vercel automatically uses CDN for:
- Static files
- Images
- API routes (edge functions)

### 4. Database Optimization

- Add indexes for slow queries
- Enable connection pooling
- Use database caching
- Archive old data

---

## 🔒 Security Checklist

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables secured
- [ ] Supabase RLS policies active
- [ ] API keys rotated regularly
- [ ] Database backups enabled
- [ ] Error messages don't expose secrets
- [ ] CORS configured correctly
- [ ] Rate limiting on API routes (optional)

---

## 📱 Testing Guide

### Test on Different Devices

- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet
- [ ] Different screen sizes

### Test All Features

- [ ] User registration and login
- [ ] Add products to cart
- [ ] Checkout process
- [ ] Newsletter signup
- [ ] Contact form
- [ ] Product search
- [ ] Meal planner (kreator)
- [ ] User panel
- [ ] Favorites system

### Load Testing (Optional)

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 https://your-site.com
```

---

## 📚 Next Steps

After setup, consider:

1. **Add Content**
   - Add real product data
   - Write blog posts
   - Create FAQ content

2. **Marketing**
   - Set up social media
   - Create email campaigns
   - Run ads

3. **Business**
   - Set up payment processing
   - Configure shipping
   - Set up invoicing

4. **Growth**
   - A/B testing
   - Conversion optimization
   - SEO improvements

---

## 🆘 Getting Help

If you're stuck:

1. **Check Documentation**
   - SUPABASE_SETUP.md
   - EMAIL_SETUP.md
   - DEPLOYMENT.md

2. **Check Service Status**
   - [Vercel Status](https://www.vercel-status.com)
   - [Supabase Status](https://status.supabase.com)
   - [SendGrid Status](https://status.sendgrid.com)

3. **Check Logs**
   - Vercel deployment logs
   - Browser console
   - Network tab

4. **Community Help**
   - Vercel Discord
   - Supabase Discord
   - Stack Overflow

---

## 🎉 Congratulations!

You now have a **fully functional, production-ready** meal kit delivery platform!

### What You Built:

✅ Next.js 15 app with App Router
✅ Full e-commerce functionality
✅ User authentication and profiles
✅ Database with Supabase
✅ Email notifications
✅ Analytics tracking
✅ Mobile-responsive design
✅ SEO optimized
✅ Performance optimized
✅ Security hardened

### Your Tech Stack:

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js
- **Email:** SendGrid or Resend
- **Hosting:** Vercel
- **Analytics:** Google Analytics, Facebook Pixel

**Time to launch!** 🚀

---

## 📞 Support

Need help? Found a bug?

- Email: support@smakowalo.pl
- Check logs for error details
- Review setup guides
- Verify all environment variables

**Happy cooking!** 🍽️
