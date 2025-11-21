# Webhook Troubleshooting Guide

## 🎯 Canonical Webhook Endpoint

**IMPORTANT**: There is only ONE webhook endpoint in this application:

```
https://your-domain.com/api/webhooks/stripe
```

All Stripe webhook events should be configured to send to this endpoint.

## ✅ Required Configuration

### 1. Environment Variables

Ensure these are set in your `.env.local` (development) and Vercel/production environment:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SMTP Configuration (for email notifications)
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=your-smtp-password
SMTP_FROM_EMAIL=no_reply@smakowalo.pl
SMTP_FROM_NAME=Smakowało

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Stripe Dashboard Configuration

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.trial_will_end`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add it to your environment as `STRIPE_WEBHOOK_SECRET`

### 3. Database Migration

Run this migration to add required columns:

```bash
# Using Supabase CLI
supabase migration up

# Or manually in Supabase Dashboard
# Go to: Database → SQL Editor
# Run: supabase/migrations/20251121000000_add_webhook_support_columns.sql
```

This adds the following columns to the `subscriptions` table:
- `trial_end` - Trial period end date
- `delivery_day` - Preferred delivery day
- `last_payment_status` - Status of last payment
- `last_payment_date` - Date of last payment

## 🔍 Testing Webhooks

### Local Development with Stripe CLI

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook secret** from CLI output and add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Trigger test events**:
   ```bash
   # Test checkout completion
   stripe trigger checkout.session.completed

   # Test subscription created
   stripe trigger customer.subscription.created

   # Test payment succeeded
   stripe trigger invoice.payment_succeeded

   # Test payment failed
   stripe trigger invoice.payment_failed
   ```

### Production Testing

1. **Use Stripe Dashboard** → Developers → Webhooks → Your endpoint
2. Click **Send test webhook**
3. Select event type (e.g., `checkout.session.completed`)
4. Click **Send test webhook**
5. Check the webhook logs for response

## 🐛 Common Issues

### Issue 1: "Webhook signature verification failed"

**Symptoms**: HTTP 400 error with message "Webhook verification failed"

**Causes**:
- Wrong `STRIPE_WEBHOOK_SECRET` value
- Using test secret with live key (or vice versa)
- Body parser middleware interfering with raw body

**Solutions**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches the one in Stripe Dashboard
2. Ensure test keys are used with test webhook secret
3. Check that Next.js is using raw body (our handler uses `req.text()`)

### Issue 2: "No signature" error

**Symptoms**: HTTP 400 error with message "No signature"

**Causes**:
- Request not coming from Stripe
- Missing `stripe-signature` header
- Incorrect webhook URL

**Solutions**:
1. Verify the webhook URL in Stripe Dashboard is correct
2. Check that you're testing with Stripe CLI or Dashboard, not manually

### Issue 3: Subscriptions not appearing in database

**Symptoms**: Webhook succeeds (HTTP 200) but no data in Supabase

**Causes**:
- Missing `user_id` in Stripe metadata
- Database migration not run
- RLS policies blocking insert
- Supabase credentials incorrect

**Solutions**:
1. Check that subscription metadata includes `user_id`:
   ```javascript
   // When creating checkout session
   metadata: {
     user_id: 'uuid-here',
     plan_type: 'weekly',
     // ... other metadata
   }
   ```

2. Run the database migration (see above)

3. Check Supabase logs for errors:
   - Go to Supabase Dashboard → Logs
   - Filter by table: `subscriptions`

4. Verify service role key is correct (has admin access)

### Issue 4: Emails not sending

**Symptoms**: Webhook succeeds but no emails received

**Causes**:
- SMTP credentials not configured
- SMTP server blocking connections
- Email going to spam

**Solutions**:
1. Check SMTP environment variables are set
2. Test SMTP connection manually:
   ```bash
   npm run test:email
   ```

3. Check application logs for email errors:
   ```
   logWebhook('warn', 'Failed to send email', ...)
   ```

4. Note: Email failures are non-blocking - webhook will still succeed

### Issue 5: Orders not created

**Symptoms**: Subscription created but no order in `orders` table

**Causes**:
- Missing `user_id` in checkout metadata
- Order creation error (check logs)
- Database permissions

**Solutions**:
1. Ensure checkout session has `user_id` in metadata
2. Check webhook logs for order creation errors
3. Verify `orders` table exists and has proper structure
4. Check RLS policies on `orders` table allow service role insert

## 📊 Monitoring

### Webhook Logs

The webhook handler provides comprehensive logging:

```
ℹ️ [Webhook] Webhook received
✅ [Webhook] Webhook signature verified: checkout.session.completed
ℹ️ [Webhook] Processing checkout.session.completed
✅ [Webhook] Subscription upserted to database
✅ [Webhook] Order created
✅ [Webhook] Welcome email sent
✅ [Webhook] Event checkout.session.completed processed successfully
```

### Log Emoji Legend

- ℹ️ - Info: Normal operation
- ✅ - Success: Operation completed successfully  
- ⚠️ - Warning: Non-critical issue (e.g., email failed)
- ❌ - Error: Critical failure

### Where to Find Logs

**Local Development**:
- Terminal output where `npm run dev` is running

**Vercel Production**:
- Go to Vercel Dashboard → Your Project → Functions
- Click on the webhook function
- View logs in real-time

**Stripe Dashboard**:
- Go to Developers → Webhooks → Your endpoint
- Click on individual webhook attempts
- View Request/Response details

## 🔄 Webhook Event Flow

### Successful Subscription Flow

1. **User completes checkout**
   ```
   Event: checkout.session.completed
   → Creates/updates subscription in database
   → Creates initial order
   → Sends welcome email
   ```

2. **Subscription created** (may fire after checkout)
   ```
   Event: customer.subscription.created
   → Upserts subscription data
   → Updates with user_id if missing
   ```

3. **Payment succeeds** (first payment and recurring)
   ```
   Event: invoice.payment_succeeded
   → Updates last_payment_status to 'succeeded'
   → Sends payment confirmation email
   ```

4. **Trial ending** (if applicable)
   ```
   Event: customer.subscription.trial_will_end
   → Sends reminder email 3 days before trial ends
   ```

### Cancellation Flow

1. **User cancels subscription**
   ```
   Event: customer.subscription.updated
   → Sets cancel_at_period_end to true
   → Sends cancellation confirmation email
   ```

2. **Subscription ends**
   ```
   Event: customer.subscription.deleted
   → Sets status to 'canceled'
   → Updates canceled_at timestamp
   ```

## 📝 Best Practices

1. **Always include user_id** in Stripe metadata
2. **Test locally** with Stripe CLI before deploying
3. **Monitor webhook logs** regularly
4. **Set up alerts** for failed webhooks in production
5. **Keep webhook secret secure** - never commit to Git
6. **Use test mode** for development and staging
7. **Verify database migrations** are applied before going live

## 🆘 Still Having Issues?

If you've tried all the above and still have problems:

1. **Check application logs** for detailed error messages
2. **Verify all environment variables** are set correctly
3. **Test with Stripe CLI** to isolate the issue
4. **Check Stripe Dashboard** webhook logs for request/response details
5. **Review Supabase logs** for database errors
6. **Ensure database migration** has been applied

## 📚 Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Database](https://supabase.com/docs/guides/database)
