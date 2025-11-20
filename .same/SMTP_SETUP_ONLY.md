# 📧 Email Setup - SMTP (Bluehost) Only

**Date:** 20.11.2025
**Services:** Bluehost SMTP + Supabase Auth

---

## 🎯 Email Strategy (Simplified)

```
ALL EMAILS → Bluehost SMTP (no_reply@smakowalo.pl)

✅ Supabase Auth emails (verification, password reset)
✅ Order confirmations
✅ Subscription notifications
✅ Payment confirmations
✅ Contact form responses
✅ Newsletter
```

**NO SendGrid, NO Resend, NO other services!**

---

## ✅ What's Already Done

### 1. Supabase SMTP Configuration ✅
From your screenshot, you already configured:
- Host: `cs347.bluehost.com`
- Port: `587`
- Username: `no_reply@smakowalo.pl`
- Sender: `no_reply@smakowalo.pl`
- Sender name: `Smakowalo.pl`

**Status:** ✅ Configured (just click "Save changes")

### 2. Code Updated ✅
- Removed SendGrid priority
- Removed Resend priority
- **ONLY SMTP is used now**

---

## 🔧 What You Need To Do

### Step 1: Add SMTP to Environment Variables

**Local Development (.env.local):**
```env
# Email - Bluehost SMTP
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=your-bluehost-password-here
SMTP_FROM_EMAIL=no_reply@smakowalo.pl
SMTP_FROM_NAME=Smakowało
```

**Production (Vercel):**
```bash
# Add these environment variables to Vercel:
vercel env add SMTP_HOST production
# Enter: cs347.bluehost.com

vercel env add SMTP_PORT production
# Enter: 587

vercel env add SMTP_USER production
# Enter: no_reply@smakowalo.pl

vercel env add SMTP_PASS production
# Enter: [your-password]

vercel env add SMTP_FROM_EMAIL production
# Enter: no_reply@smakowalo.pl

vercel env add SMTP_FROM_NAME production
# Enter: Smakowało
```

---

### Step 2: Get Bluehost SMTP Password

1. **Login to Bluehost cPanel**
2. **Go to:** Email Accounts
3. **Find:** `no_reply@smakowalo.pl`
4. **Click:** Manage
5. **Generate/Copy:** Password

**Important:** Use the same password in:
- ✅ Supabase SMTP Settings
- ✅ `.env.local` (local development)
- ✅ Vercel Environment Variables (production)

---

### Step 3: Save Supabase SMTP Settings

1. Go to Supabase Dashboard → Auth → Email → SMTP Settings
2. Verify all fields are correct
3. **Click "Save changes"** (green button)
4. Wait 2-3 minutes for changes to apply

---

### Step 4: Test Email Flow

#### Test 1: Auth Email (Supabase)
```bash
# Open in incognito mode:
https://www.smakowalo.pl/register

# Register with email: test@example.com
# Check email - should come from: no_reply@smakowalo.pl
```

#### Test 2: Transactional Email (Next.js)
```bash
# After adding SMTP to .env.local and restarting:
bun run dev

# Test contact form or subscription creation
# Check logs for: "📧 Using SMTP email service (Bluehost)"
```

---

## 🔍 Troubleshooting

### Problem: Still getting `onboarding@resend.dev`

**Solutions:**
1. ✅ Click "Save changes" in Supabase SMTP settings
2. ✅ Wait 5-10 minutes
3. ✅ Delete test user and re-register
4. ✅ Check Supabase Logs → Auth Logs for SMTP errors

### Problem: "Mock email service" in logs

**Solution:**
```bash
# SMTP variables not configured!
# Add all 6 SMTP_* variables to .env.local
# Restart dev server: bun run dev
```

### Problem: SMTP authentication failed

**Solutions:**
1. ✅ Verify password is correct in Bluehost
2. ✅ Password must be same in Supabase AND .env.local
3. ✅ Check email account is active in Bluehost
4. ✅ Try port 465 if 587 fails (update both Supabase and .env)

---

## 📋 Checklist

### Supabase Configuration
- [ ] SMTP enabled in Supabase Dashboard
- [ ] Host: `cs347.bluehost.com`
- [ ] Port: `587`
- [ ] Username: `no_reply@smakowalo.pl`
- [ ] Password: [from Bluehost]
- [ ] Sender email: `no_reply@smakowalo.pl`
- [ ] Sender name: `Smakowało`
- [ ] **Clicked "Save changes"**

### Local Development (.env.local)
- [ ] `SMTP_HOST=cs347.bluehost.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER=no_reply@smakowalo.pl`
- [ ] `SMTP_PASS=[password]`
- [ ] `SMTP_FROM_EMAIL=no_reply@smakowalo.pl`
- [ ] `SMTP_FROM_NAME=Smakowało`

### Production (Vercel)
- [ ] All 6 SMTP_* variables added to Vercel
- [ ] Redeployed after adding variables
- [ ] Tested production email

### Testing
- [ ] Auth email test (register new user)
- [ ] Email comes from `no_reply@smakowalo.pl`
- [ ] Transactional emails working
- [ ] No "Mock service" warnings in logs

---

## 📧 Email Templates Available

All templates in `src/lib/email.ts`:

✅ Email Verification
✅ Welcome Email
✅ Password Reset
✅ Order Confirmation
✅ Newsletter Confirmation
✅ Contact Form
✅ Subscription Created
✅ Payment Succeeded
✅ Payment Failed

**All use Bluehost SMTP automatically!**

---

## 🚀 Quick Start Commands

```bash
# 1. Add SMTP variables to .env.local
cp .env.example .env.local
# Edit .env.local and add your SMTP password

# 2. Restart dev server
bun run dev

# 3. Check logs - should see:
# "📧 Using SMTP email service (Bluehost)"

# 4. Test registration
# Open: http://localhost:3000/register
```

---

## 📞 Support

**Bluehost SMTP Issues:**
- cPanel → Email Accounts
- Verify `no_reply@smakowalo.pl` exists
- Check quota, disk space
- Generate new password if needed

**Supabase Issues:**
- Dashboard → Logs → Auth Logs
- Look for SMTP errors
- Verify SMTP settings saved

**Next.js Issues:**
- Check `.env.local` has all SMTP_* variables
- Restart dev server after changes
- Check console logs for email service used

---

**Next Step:** Add SMTP password to `.env.local` and click "Save changes" in Supabase!
