# Stripe Subscription System - Quick Start Guide

This PR implements a complete Stripe subscription system with 12 dynamic plan combinations (2-4 people × 2-5 days/week) at 30 PLN per portion.

## 🎯 What Was Implemented

### Backend
- ✅ `/api/create-subscription` - Creates Stripe Checkout sessions with dynamic pricing
- ✅ `/api/webhooks/stripe` - Handles subscription lifecycle events
- ✅ `/api/stripe/portal` - Customer self-service portal
- ✅ `lib/pricing.ts` - Dynamic price calculation helper
- ✅ `db/subscriptions.sql` - Enhanced database schema

### Frontend
- ✅ Updated kreator page - Correct payload format and Checkout redirect
- ✅ Updated panel page - Subscription display with "Manage" button
- ✅ No more 500 errors on subscription creation

### Documentation
- ✅ `STRIPE_ENV_SETUP.md` - Complete setup guide
- ✅ Updated `.env.example` with required variables

## 🚀 Quick Setup (5 Steps)

### 1. Set Up Stripe Account

1. Go to https://dashboard.stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys
3. Create a product:
   - Go to **Products** → **Add product**
   - Name: "Smakowalo Box"
   - Description: "Weekly meal subscription box"
   - Save and copy the Product ID (starts with `prod_`)

### 2. Set Up Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Click to reveal the **Signing secret** (starts with `whsec_`)

### 3. Run Database Migration

Run the SQL in `db/subscriptions.sql` on your Supabase project:

```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor and paste the contents of db/subscriptions.sql

# Option 2: Via psql
psql $DATABASE_URL -f db/subscriptions.sql
```

### 4. Add Environment Variables

Add these to your `.env.local` (development) and Vercel (production):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # From step 1
STRIPE_PRODUCT_ID=prod_...     # From step 1
STRIPE_WEBHOOK_SECRET=whsec_... # From step 2

# Application URL
NEXT_PUBLIC_APP_URL=https://www.smakowalo.pl

# Database (should already exist)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 5. Test the Flow

1. Start the development server: `npm run dev`
2. Go to `/kreator`
3. Select subscription mode
4. Choose people (2-4) and days (2-5)
5. Select diets and meals
6. Click "Opłać subskrypcję"
7. You should be redirected to Stripe Checkout
8. Use test card: `4242 4242 4242 4242` (any future date/CVC)
9. Complete payment
10. Check `/panel` - your subscription should appear!

## 📋 How It Works

### Subscription Flow

```
User selects plan → API creates Checkout session → Redirects to Stripe
                                                           ↓
User completes payment ← Returns to /panel ← Stripe redirects
                              ↓
                        Webhook receives event
                              ↓
                    Subscription saved to database
```

### Price Calculation

All prices are calculated dynamically:

```
Weekly Price = People × Days × 30 PLN

Examples:
- 2 people × 3 days = 6 portions = 180 PLN/week
- 3 people × 4 days = 12 portions = 360 PLN/week
- 4 people × 5 days = 20 portions = 600 PLN/week
```

### Database Structure

The webhook automatically saves:
- `stripe_subscription_id`, `stripe_customer_id`
- `people`, `days`, `plan_key` (e.g., "3x4")
- `diets[]`, `allergies[]`, `selected_meals[]`
- `current_period_start/end`, `status`
- `amount`, `currency`

## 🔧 Testing with Stripe CLI (Optional)

For local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will output a webhook secret - use it as STRIPE_WEBHOOK_SECRET
```

## 📱 Customer Portal

Users can manage their subscriptions via the Stripe Customer Portal:

1. Go to `/panel`
2. Find active subscription
3. Click "Zarządzaj subskrypcją"
4. Redirected to Stripe Customer Portal where they can:
   - Update payment method
   - Cancel subscription
   - View invoices
   - Update billing address

## 🐛 Troubleshooting

### "Payment system not configured" error
- Check that `STRIPE_SECRET_KEY` and `STRIPE_PRODUCT_ID` are set

### Webhook signature verification fails
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check endpoint URL is correct
- Verify webhook is using POST method

### Subscription not appearing in panel
- Check Supabase logs for errors
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (bypasses RLS)
- Verify webhook event was received (check Stripe dashboard)
- Check database: `SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;`

### "Price not found" errors
- Prices are created automatically on first use
- Check that `STRIPE_PRODUCT_ID` is correct
- Verify Stripe API keys are valid

## 📚 Additional Resources

- Full documentation: `STRIPE_ENV_SETUP.md`
- Database schema: `db/subscriptions.sql`
- Pricing logic: `src/lib/pricing.ts`
- API routes:
  - `src/app/api/create-subscription/route.ts`
  - `src/app/api/webhooks/stripe/route.ts`
  - `src/app/api/stripe/portal/route.ts`

## 🎉 Ready for Production

Once tested:

1. Get Stripe live keys from https://dashboard.stripe.com/apikeys
2. Create live product and webhook
3. Update environment variables in Vercel
4. Deploy! 🚀

## 💡 Notes

- All prices include VAT/tax (handled by Stripe)
- Subscriptions renew weekly automatically
- Failed payments trigger email from Stripe
- Customers receive invoices via email
- All metadata (diets, allergies, meals) is stored for reference

---

Need help? Check:
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://app.supabase.com
- Full setup guide: `STRIPE_ENV_SETUP.md`
