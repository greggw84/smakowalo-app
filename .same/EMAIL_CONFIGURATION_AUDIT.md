# 📧 Email Configuration Audit - Smakowało

**Date:** 20.11.2025
**Status:** Mixed Configuration - Requires Action

---

## 🔍 Current Situation

You received an email from `onboarding@resend.dev` - this is **Supabase's default email sender** for authentication emails.

### Email Types & Current Senders:

| Email Type | Current Sender | Service Used | Status |
|-----------|---------------|--------------|--------|
| **Email Verification** | onboarding@resend.dev | Supabase (Resend) | ⚠️ Default |
| **Password Reset** | onboarding@resend.dev | Supabase (Resend) | ⚠️ Default |
| **OAuth Confirmation** | onboarding@resend.dev | Supabase (Resend) | ⚠️ Default |
| **Order Confirmation** | Not configured | SendGrid (code ready) | ⚠️ Needs API key |
| **Delivery Updates** | Not configured | SendGrid (code ready) | ⚠️ Needs API key |
| **Subscription Emails** | Not configured | SMTP/Bluehost (code ready) | ⚠️ Needs config |
| **Payment Notifications** | Not configured | SMTP/Bluehost (code ready) | ⚠️ Needs config |
| **Newsletter** | Not configured | SMTP/Bluehost (code ready) | ⚠️ Needs config |
| **Contact Form** | Not configured | SMTP/Bluehost (code ready) | ⚠️ Needs config |

---

## 📋 Available Email Services in Codebase

### 1. **SMTP (Bluehost)** - ✅ Recommended for Custom Domain
**Files:** `src/lib/email.ts`, `src/lib/email-notifications.ts`

**Configuration Required:**
```env
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=your-password-here
SMTP_FROM_EMAIL=no_reply@smakowalo.pl
SMTP_FROM_NAME=Smakowało
```

**Pros:**
- ✅ Uses your custom domain `noreply@smakowalo.pl`
- ✅ Professional branding
- ✅ No monthly fees (included with Bluehost)
- ✅ Full control

**Cons:**
- ⚠️ Requires SMTP password from Bluehost
- ⚠️ Lower delivery limits than dedicated services

**Best for:**
- Subscription notifications
- Payment confirmations
- Order updates
- Contact form responses

---

### 2. **SendGrid** - ✅ Professional Email Service
**File:** `src/lib/sendgrid.ts`

**Configuration Required:**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@smakowalo.pl
```

**Pros:**
- ✅ High deliverability (>95%)
- ✅ 100 emails/day FREE
- ✅ Professional templates
- ✅ Analytics & tracking
- ✅ Verified sender domain

**Cons:**
- ⚠️ Requires SendGrid account setup
- ⚠️ Domain verification needed

**Best for:**
- Transactional emails (orders, payments)
- Marketing campaigns
- High-volume sending

---

### 3. **Resend** - ⚠️ Currently Active (via Supabase)
**File:** `src/lib/email.ts`

**Configuration Required:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@smakowalo.pl
```

**Pros:**
- ✅ Modern API
- ✅ 100 emails/day FREE
- ✅ Good deliverability
- ✅ Easy domain verification

**Cons:**
- ⚠️ Currently using Supabase's default sender
- ⚠️ No custom domain configured

**Status:**
- Supabase uses Resend by default with `onboarding@resend.dev`
- Can be customized to use `noreply@smakowalo.pl`

---

### 4. **Supabase Auth Emails** - 🔴 Action Required

**Current Status:** Using Resend's default `onboarding@resend.dev`

**Options to Fix:**

#### Option A: Configure Custom SMTP in Supabase (Recommended)
1. Go to Supabase Dashboard → Project Settings → Auth → Email Templates
2. Enable "Custom SMTP"
3. Add Bluehost SMTP credentials:
   ```
   Host: cs347.bluehost.com
   Port: 587
   User: no_reply@smakowalo.pl
   Password: [your-smtp-password]
   ```
4. Sender email: `noreply@smakowalo.pl`
5. Sender name: `Smakowało`

#### Option B: Use Resend with Custom Domain
1. Create Resend account (free tier: 100 emails/day)
2. Verify domain `smakowalo.pl`
3. Add to Supabase:
   - Go to Auth → Email Settings
   - Add Resend API key
   - Set sender: `noreply@smakowalo.pl`

#### Option C: Disable Supabase emails, use custom flow
- Handle auth emails via Next.js API routes
- Full control over templates
- More complex setup

---

## 🎯 Recommended Solution

### **For Production: Hybrid Approach**

```
┌─────────────────────────────────────────────┐
│           Email Flow Strategy                │
├─────────────────────────────────────────────┤
│                                             │
│  1. AUTH EMAILS (Supabase)                 │
│     └─> Custom SMTP (Bluehost)             │
│         Sender: noreply@smakowalo.pl       │
│                                             │
│  2. TRANSACTIONAL (Orders, Payments)       │
│     └─> SendGrid                           │
│         Sender: noreply@smakowalo.pl       │
│         High deliverability needed          │
│                                             │
│  3. SUBSCRIPTIONS & NOTIFICATIONS          │
│     └─> SMTP (Bluehost)                    │
│         Sender: noreply@smakowalo.pl       │
│         Low volume, custom domain           │
│                                             │
│  4. MARKETING & NEWSLETTER                 │
│     └─> SendGrid                           │
│         Sender: newsletter@smakowalo.pl    │
│         Bulk sending, tracking              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Setup Guide

### **Phase 1: Fix Supabase Auth Emails (URGENT)**

1. **Login to Bluehost cPanel**
   - Go to Email Accounts
   - Find or create `no_reply@smakowalo.pl`
   - Generate SMTP password

2. **Configure Supabase Custom SMTP**
   - Dashboard → https://supabase.com/dashboard/project/[your-project]/auth/templates
   - Scroll to "SMTP Settings"
   - Enable "Custom SMTP Provider"
   - Enter Bluehost credentials

3. **Test Auth Email**
   - Register new test account
   - Verify email comes from `noreply@smakowalo.pl`

### **Phase 2: Setup SendGrid (Optional but Recommended)**

1. **Create SendGrid Account**
   - Visit: https://sendgrid.com/
   - Free tier: 100 emails/day

2. **Verify Domain**
   - Add DNS records to smakowalo.pl
   - DKIM, SPF, DMARC records

3. **Add API Key to Environment**
   ```bash
   # Add to .env.local
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@smakowalo.pl
   ```

### **Phase 3: Configure Bluehost SMTP**

1. **Add to .env.local**
   ```env
   SMTP_HOST=cs347.bluehost.com
   SMTP_PORT=587
   SMTP_USER=no_reply@smakowalo.pl
   SMTP_PASS=[password-from-bluehost]
   SMTP_FROM_EMAIL=no_reply@smakowalo.pl
   SMTP_FROM_NAME=Smakowało
   ```

2. **Deploy to Vercel**
   ```bash
   # Add all SMTP variables to Vercel environment
   vercel env add SMTP_HOST
   vercel env add SMTP_PORT
   vercel env add SMTP_USER
   vercel env add SMTP_PASS
   vercel env add SMTP_FROM_EMAIL
   vercel env add SMTP_FROM_NAME
   ```

---

## 🔒 Email Priority Logic (Already Implemented)

**File: `src/lib/email.ts` - Lines 193-235**

The code checks in this order:
1. ✅ **SMTP (Bluehost)** - if all SMTP_* vars exist
2. ✅ **SendGrid** - if SENDGRID_API_KEY exists
3. ✅ **Resend** - if RESEND_API_KEY exists
4. ⚠️ **Mock** - for development (logs only)

Currently using: **Mock Service** (no emails sent except Supabase auth)

---

## ⚠️ Current Issues

1. **Supabase auth emails** use `onboarding@resend.dev` ← **FIX THIS FIRST**
2. **No transactional emails** configured (orders, payments)
3. **No SMTP credentials** in environment variables
4. **No SendGrid** setup (optional but recommended)

---

## ✅ Action Items

### URGENT (Do Now):
- [ ] Get SMTP password from Bluehost for `no_reply@smakowalo.pl`
- [ ] Configure Custom SMTP in Supabase Dashboard
- [ ] Test auth email flow

### High Priority (This Week):
- [ ] Add SMTP credentials to `.env.local` and Vercel
- [ ] Test subscription emails
- [ ] Test order confirmation emails

### Optional (Nice to Have):
- [ ] Setup SendGrid account
- [ ] Verify domain with SendGrid
- [ ] Configure email templates in SendGrid
- [ ] Setup email analytics

---

## 📊 Cost Comparison

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| **Bluehost SMTP** | ✅ Included | Included | Custom domain, basic needs |
| **SendGrid** | 100/day | $19.95/mo (40k) | Transactional, high volume |
| **Resend** | 100/day | $20/mo (50k) | Modern API, developers |
| **Supabase** | Free w/ custom SMTP | $25/mo for 50k | Auth emails only |

**Recommendation:** Start with Bluehost SMTP (free), add SendGrid later if needed.

---

## 🎨 Email Templates Available

All templates are already coded in `src/lib/email.ts`:

✅ Email Verification
✅ Welcome Email
✅ Password Reset
✅ Order Confirmation
✅ Newsletter Confirmation
✅ Contact Form Notification
✅ Subscription Created
✅ Payment Succeeded
✅ Payment Failed

**Ready to use once SMTP is configured!**

---

## 🔗 Useful Links

- **Supabase SMTP Setup:** https://supabase.com/docs/guides/auth/auth-smtp
- **SendGrid Domain Verification:** https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication
- **Bluehost Email:** https://my.bluehost.com/cgi/email

---

**Next Step:** Choose Option A (Bluehost SMTP in Supabase) and follow Phase 1 setup guide above.
