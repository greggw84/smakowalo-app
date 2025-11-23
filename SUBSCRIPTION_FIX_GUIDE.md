# Subscription Panel and Email Fix Guide

## Problem Summary

The subscription panel was showing empty after payment, and confirmation emails were not being sent. This was caused by:

1. **RLS policies blocking webhook operations** - Service role couldn't insert subscriptions
2. **Missing metadata in Stripe** - user_id wasn't always passed correctly
3. **Pre-creation conflicts** - API pre-creating subscriptions conflicted with webhook
4. **Status filtering** - Panel only showing 'active', 'trialing', 'past_due' but missing 'incomplete'

## Solution Applied

### 1. Database Migration (MUST RUN FIRST)

**File**: `supabase/migrations/20251122000000_fix_subscription_rls_for_webhooks.sql`

This migration:
- Adds service role bypass to RLS policies
- Allows webhooks to create/update subscriptions and orders
- Grants necessary permissions to service_role

**How to apply**:

```bash
# Option 1: Using Supabase CLI (recommended if available)
supabase migration up

# Option 2: In Supabase Dashboard (manual method)
# 1. Go to SQL Editor
# 2. Click "New Query"
# 3. Open the file: supabase/migrations/20251122000000_fix_subscription_rls_for_webhooks.sql
# 4. Copy ALL the SQL code from inside the file
# 5. Paste into the SQL Editor
# 6. Click "Run" or press Ctrl/Cmd + Enter
#
# IMPORTANT: Copy the SQL code, NOT the file path!
```

**Verification**:
```sql
-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('subscriptions', 'orders')
AND policyname LIKE 'Service role%';

-- Should return 2 rows:
-- Service role can manage subscriptions
-- Service role can manage orders
```

### 2. Code Changes

#### Webhook Handler Improvements
- **Better error logging**: Now logs detailed error info for debugging
- **Email logging**: Tracks email sending attempts and failures
- **Metadata handling**: Better fallback for finding user_id

#### Create Subscription Improvements
- **Added client_reference_id**: Passes user_id as fallback identifier
- **Added session metadata**: Ensures user_id in both places
- **Removed pre-creation**: Let webhook handle all subscription creation

#### Panel UI Improvements
- **Expanded status query**: Now includes 'incomplete' and 'incomplete_expired'
- **Status banners**: Shows appropriate messages for incomplete/past_due
- **Better badges**: Color-coded status indicators

## Testing Checklist

### Before Testing

- [ ] Run the database migration
- [ ] Verify environment variables are set:
  ```bash
  STRIPE_SECRET_KEY=sk_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  SMTP_HOST=cs347.bluehost.com
  SMTP_PORT=587
  SMTP_USER=no_reply@smakowalo.pl
  SMTP_PASS=***
  SMTP_FROM_EMAIL=no_reply@smakowalo.pl
  NEXT_PUBLIC_SITE_URL=https://your-domain.com
  ```
- [ ] Deploy to production or staging environment
- [ ] Verify Stripe webhook is configured and active

### Test Scenario 1: New Subscription

1. **Create test user**:
   - Sign up with a test email
   - Verify email if required

2. **Start subscription flow**:
   - Go through kreator (meal planner)
   - Select plan (e.g., 2 people, 3 days)
   - Complete checkout with test card: `4242 4242 4242 4242`

3. **Expected results**:
   - ✅ Checkout completes successfully
   - ✅ Redirected to success page
   - ✅ Subscription appears in panel (may show "incomplete" briefly)
   - ✅ Welcome email received within 1-2 minutes
   - ✅ Subscription status updates to "active" or "trialing"

4. **What to check**:
   ```bash
   # Check Vercel logs
   # Look for these log entries:
   ℹ️ [Webhook] Webhook received
   ✅ [Webhook] Webhook signature verified: checkout.session.completed
   ℹ️ [Webhook] Processing checkout.session.completed
   ℹ️ [Webhook] Attempting to upsert subscription
   ✅ [Webhook] Subscription upserted to database
   ✅ [Webhook] Order created
   ℹ️ [Webhook] Preparing to send welcome email
   ✅ [Webhook] Welcome email sent successfully
   ```

### Test Scenario 2: Failed Payment

1. **Use test card that fails**: `4000 0000 0000 0341`

2. **Expected results**:
   - ❌ Payment fails
   - ✅ User sees error message
   - ✅ Subscription shows "Problem z płatnością" banner
   - ✅ Payment failed email sent
   - ✅ User can update payment method

### Test Scenario 3: Incomplete Subscription

1. **Simulate incomplete state**:
   - Start checkout but don't complete payment
   - Or manually set status to 'incomplete' in database

2. **Expected results**:
   - ✅ Subscription appears in panel
   - ✅ Shows "Oczekuje na płatność" banner
   - ✅ User can complete payment

## Debugging

### Subscription Not Appearing

**Check 1: Database**
```sql
-- Check if subscription exists
SELECT id, user_id, stripe_subscription_id, status, created_at
FROM subscriptions
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;

-- If no rows: Webhook didn't create subscription
-- If exists with wrong user_id: Metadata issue
-- If exists but status is unexpected: Check Stripe status
```

**Check 2: Webhook Logs**
```bash
# In Vercel Dashboard:
# 1. Go to Functions
# 2. Find /api/webhooks/stripe
# 3. Check recent invocations

# Look for errors:
❌ [Webhook] Failed to upsert subscription
# This means RLS policy issue - check if migration ran

❌ [Webhook] No subscription ID in checkout session
# This means checkout session is malformed
```

**Check 3: Stripe Dashboard**
```
1. Go to Developers → Webhooks
2. Find your endpoint
3. Click on recent attempts
4. Check if any returned errors (not 200 OK)
```

### Emails Not Sending

**Check 1: SMTP Configuration**
```bash
# Verify environment variables
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
# etc.
```

**Check 2: Webhook Logs**
```bash
# Look for email logs:
ℹ️ [Webhook] Preparing to send welcome email
ℹ️ [Webhook] Sending welcome email

# If you see:
⚠️ [Webhook] Failed to send welcome email
# Check the error details in the logs
```

**Check 3: Test Email Manually**
```bash
# Use the test endpoint
curl -X POST https://your-domain.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

**Common SMTP Errors**:
- `ECONNREFUSED`: Wrong host/port or firewall blocking
- `EAUTH`: Wrong username/password
- `535 Authentication failed`: Wrong credentials
- `553 Relaying denied`: SMTP server not allowing sending

### Panel Shows Empty Despite Subscription Existing

**Check 1: Query Status**
The panel now queries for these statuses:
- `active`
- `trialing`
- `past_due`
- `incomplete`
- `incomplete_expired`

If subscription has a different status, it won't show. Check:
```sql
SELECT status, COUNT(*) 
FROM subscriptions 
GROUP BY status;
```

**Check 2: User ID Match**
```sql
-- Verify subscription user_id matches logged-in user
SELECT s.id, s.user_id, s.stripe_subscription_id, u.email
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'user-email@example.com';
```

## Environment Variables Reference

### Required for Webhooks
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Required for Emails
```env
# SMTP (Bluehost)
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=your-password
SMTP_FROM_EMAIL=no_reply@smakowalo.pl
SMTP_FROM_NAME=Smakowało
```

## Rollback Plan

If issues occur after deployment:

1. **Revert code changes**:
   ```bash
   git revert d9f960a
   git push
   ```

2. **Keep database migration**: The RLS changes are safe to keep and improve security

3. **Alternative**: Temporarily disable RLS on subscriptions (NOT RECOMMENDED):
   ```sql
   ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
   ```

## Success Metrics

After fix is deployed, monitor these metrics:

- **Subscription creation rate**: Should match payment success rate
- **Email delivery rate**: Should be >95% for welcome emails
- **Panel empty reports**: Should drop to zero
- **Payment confirmation time**: Users should see subscription within seconds

## Support

If issues persist:

1. Check all steps in this guide
2. Review Vercel logs for errors
3. Check Stripe webhook logs
4. Verify database migration ran successfully
5. Test email sending separately

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [SMTP Troubleshooting](WEBHOOK_TROUBLESHOOTING.md)
