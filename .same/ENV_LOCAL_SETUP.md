# 📝 How to Fill `.env.local`

**Created:** 20.11.2025
**File location:** `/home/project/.env.local`

---

## ✅ What I Already Did:

1. ✅ Created `.env.local` from template
2. ✅ Added your Supabase URL: `quqgpixujzxujauhessa.supabase.co`
3. ✅ Pre-filled SMTP settings (Bluehost)

---

## 🔑 What YOU Need To Fill:

### 1. **Supabase Keys** (CRITICAL)

Open `.env.local` and find these lines:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase
```

**Where to get them:**
1. Go to: https://supabase.com/dashboard/project/quqgpixujzxujauhessa/settings/api
2. Copy **anon public** key → paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
3. Copy **service_role** key → paste into `SUPABASE_SERVICE_ROLE_KEY=`

**Result should look like:**
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
```

---

### 2. **SMTP Password** (For Emails)

Open `.env.local` and find:

```env
SMTP_PASS=PUT_YOUR_BLUEHOST_PASSWORD_HERE
```

**Where to get it:**
1. Login to Bluehost cPanel
2. Go to: **Email Accounts**
3. Find: `no_reply@smakowalo.pl`
4. Click: **Manage** → **Generate Password** (or use existing)
5. Copy password → paste into `SMTP_PASS=`

**Result should look like:**
```env
SMTP_PASS=Abc123xyz!@#456
```

⚠️ **IMPORTANT:** Use the **SAME PASSWORD** in:
- ✅ `.env.local` (this file)
- ✅ Supabase SMTP settings (dashboard)

---

### 3. **OpenCart** (Optional - if you use shop)

```env
OPENCART_URL=https://shop.smakowalo.pl
OPENCART_API_TOKEN=your-opencart-api-token
OPENCART_API_USERNAME=your-opencart-username
```

If you have OpenCart, fill these. If not, leave as is.

---

### 4. **Stripe** (For Payments)

```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Where to get:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** → `STRIPE_PUBLISHABLE_KEY=`
3. Copy **Secret key** → `STRIPE_SECRET_KEY=`
4. For webhook: https://dashboard.stripe.com/test/webhooks

---

### 5. **Stripe Price IDs** (12 subscription variants)

You need to create these in Stripe Dashboard:

```env
STRIPE_PRICE_2_2=price_xxxxxxxxxxxxx  # 2 people, 2 days
STRIPE_PRICE_2_3=price_xxxxxxxxxxxxx  # 2 people, 3 days
# ... etc (12 total)
```

**Later:** I'll help you create these in Stripe.

---

## 🚀 Quick Start (Minimum Required):

**To get app running, you ONLY need:**

1. ✅ Supabase keys (2 lines)
2. ✅ SMTP password (1 line)

That's it! Rest can be added later.

---

## ✅ After Filling:

1. **Save** `.env.local`
2. **Restart** dev server:
   ```bash
   # Stop current server (Ctrl+C)
   bun run dev
   ```
3. **Check logs** - should see:
   ```
   📧 Using SMTP email service (Bluehost)
   ```

---

## 🔒 Security:

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ Never share this file publicly
- ✅ Never commit to Git
- ✅ Each developer creates their own

---

## 📋 Checklist:

- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added `SMTP_PASS` (from Bluehost)
- [ ] Saved `.env.local`
- [ ] Restarted dev server
- [ ] Tested email (registration)

---

## 🆘 Help:

**Can't find Supabase keys?**
→ https://supabase.com/dashboard/project/quqgpixujzxujauhessa/settings/api

**Can't find Bluehost password?**
→ Bluehost cPanel → Email Accounts → no_reply@smakowalo.pl

**Server not using SMTP?**
→ Check logs for "Using SMTP email service"
→ Verify all 6 SMTP_* variables are filled

---

**Next:** Fill in the 3 critical values and restart server! 🚀
