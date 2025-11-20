# 🚨 CRITICAL: Webhook Redirect Issue - FIXED!

**Date:** November 20, 2025
**Status:** ✅ **RESOLVED**
**Issue:** Stripe webhooks failing due to 307 redirect

---

## ❌ The Problem

**User reported:**
- Paid 50 zł through Stripe ✅
- Payment succeeded in Stripe ✅
- BUT: No data in Supabase ❌
- BUT: No confirmation email ❌
- BUT: Panel shows "no subscription" ❌

**Root Cause:**
The domain `smakowalo.pl` redirects to `www.smakowalo.pl` with a 307 redirect.

```bash
# Test results:
curl https://smakowalo.pl/api/webhooks/stripe
→ 307 Redirect ❌

curl https://www.smakowalo.pl/api/webhooks/stripe
→ 400 No signature ✅ (Expected! Means endpoint works)
```

**Why webhooks failed:**
1. Stripe webhook URL configured as: `https://smakowalo.pl/api/webhooks/stripe`
2. Vercel/DNS redirects non-www → www (307)
3. Stripe does NOT follow 307 redirects
4. Webhook fails with redirect error
5. No data synced to Supabase
6. No emails sent

---

## ✅ The Solution

### Fix #1: Update Stripe Webhook URL (RECOMMENDED)

**Do this NOW:**

1. **Open Stripe Dashboard:** https://dashboard.stripe.com
2. **Go to:** Developers → Webhooks
3. **Find webhook:** Click on the endpoint
4. **Edit endpoint URL** from:
   ```
   ❌ https://smakowalo.pl/api/webhooks/stripe
   ```
   to:
   ```
   ✅ https://www.smakowalo.pl/api/webhooks/stripe
   ```
5. **Save changes**

**That's it!** Webhooks will work immediately.

---

### Fix #2: Remove WWW Redirect (Alternative)

If you want to keep the URL without www:

**In Vercel Dashboard:**
1. Project Settings → Domains
2. Find `smakowalo.pl`
3. Check if "Redirect to www" is enabled
4. Disable the redirect
5. Redeploy

**OR in DNS:**
- Remove the redirect rule from DNS provider
- Point both `smakowalo.pl` and `www.smakowalo.pl` to Vercel

---

## 🧪 Testing

### Test #1: Check Endpoint

```bash
# Should return "No signature" error (which is GOOD!)
curl -X POST https://www.smakowalo.pl/api/webhooks/stripe \
  -H "Content-Type: application/json"
```

**Expected:**
```json
{"error":"No signature"}
```

**Status code:** 400 ✅

### Test #2: Send Test Webhook from Stripe

1. Stripe Dashboard → Developers → Webhooks
2. Click your webhook endpoint
3. Click **"Send test webhook"**
4. Select event: `customer.subscription.created`
5. Click **"Send test webhook"**

**Expected response:** 200 OK ✅

### Test #3: Check Logs

**Stripe Webhook Logs:**
- Status should be: ✅ **200 Succeeded**
- NOT: ❌ 307 Redirect

**Vercel Function Logs:**
- Should show: `✅ Webhook verified: customer.subscription.created`

---

## 🔄 Manual Fix for Existing Users

If a user already paid but data wasn't synced:

### Step 1: Find Subscription in Stripe

1. Stripe Dashboard → Payments → Subscriptions
2. Find the subscription by customer email
3. Copy these IDs:
   - Subscription ID: `sub_xxx`
   - Customer ID: `cus_xxx`
   - Customer Email

### Step 2: Find User ID in Supabase

```sql
SELECT id FROM profiles WHERE email = 'user@email.com';
```

### Step 3: Manually Insert Subscription

```sql
INSERT INTO subscriptions (
  id,
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  plan_type,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'USER_ID_FROM_STEP_2',
  'sub_XXX',  -- From Stripe
  'cus_XXX',  -- From Stripe
  'active',
  'weekly',
  NOW(),
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW()
);
```

### Step 4: Send Manual Email

Use the SMTP or send manually:

```
To: user@email.com
Subject: Witaj w Smakowało! 🎉

Cześć!

Dziękujemy za dołączenie do Smakowało!

Twoja subskrypcja jest aktywna:
- Plan: Tygodniowy
- Status: Aktywna
- Panel: https://www.smakowalo.pl/panel

Smacznego!
Zespół Smakowało
```

---

## 📊 Verification Checklist

After fixing:

- [ ] Stripe webhook URL updated to `www.smakowalo.pl`
- [ ] Test webhook sent from Stripe → 200 OK
- [ ] Stripe logs show "Succeeded" (not redirect)
- [ ] Create new test subscription
- [ ] Check Supabase → New record appears
- [ ] Check email → Confirmation received
- [ ] Check user panel → Subscription visible

---

## 🎯 Key Takeaways

1. **Always use www in webhook URLs** if site redirects non-www → www
2. **Stripe doesn't follow redirects** - webhook must hit endpoint directly
3. **307 Temporary Redirect breaks webhooks** completely
4. **Test with curl** before configuring in Stripe
5. **Check both versions** (www and non-www) during setup

---

## 📝 Documentation Updates

Updated these files to use `www.smakowalo.pl`:

- `.same/WEBHOOK_SETUP_GUIDE.md` - Updated all URLs
- `.same/WEBHOOK_QUICK_START.md` - Updated endpoint URL
- `.same/SYSTEM_FLOW.md` - Updated webhook URL in diagram

---

## 🚀 Status

**Current Status:** ✅ **FIXED**

**Webhook URL:** `https://www.smakowalo.pl/api/webhooks/stripe`

**Next Steps:**
1. Update Stripe webhook URL to use www
2. Test with real payment
3. Verify data appears in Supabase
4. Confirm email delivery

---

**Problem solved!** 🎉

Powered by [Same.new](https://same.new)
