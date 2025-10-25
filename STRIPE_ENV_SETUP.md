# Stripe Subscription System - Environment Variables

This document describes the environment variables required for the Stripe subscription system.

## Required Stripe Variables

### STRIPE_SECRET_KEY
- **Type**: Secret key (server-side only)
- **Format**: `sk_test_...` (test) or `sk_live_...` (production)
- **Description**: Your Stripe secret API key for server-side operations
- **Where to get it**: https://dashboard.stripe.com/apikeys
- **Example**: `STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz`

### STRIPE_PRODUCT_ID
- **Type**: Product ID
- **Format**: `prod_...`
- **Description**: Single Stripe Product ID for "Smakowalo Box" - all plans use this product with different prices
- **Where to create**: https://dashboard.stripe.com/products
  1. Go to Products
  2. Click "+ Add product"
  3. Name: "Smakowalo Box"
  4. Description: "Weekly meal subscription box"
  5. Create product and copy the ID (starts with `prod_`)
- **Example**: `STRIPE_PRODUCT_ID=prod_AbCdEfGhIjKlMnOp`

### STRIPE_WEBHOOK_SECRET
- **Type**: Webhook signing secret
- **Format**: `whsec_...`
- **Description**: Secret for verifying webhook signatures from Stripe
- **Where to get it**: https://dashboard.stripe.com/webhooks
  1. Click "+ Add endpoint"
  2. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
  3. Events to listen to:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.completed` (optional)
  4. After creating, click to reveal the "Signing secret"
- **Example**: `STRIPE_WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz1234567890`

### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Optional - for future use)
- **Type**: Publishable key (client-side safe)
- **Format**: `pk_test_...` (test) or `pk_live_...` (production)
- **Description**: Your Stripe publishable API key for client-side operations (not currently used but good to have)
- **Where to get it**: https://dashboard.stripe.com/apikeys
- **Example**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz`

## Required Application Variables

### NEXT_PUBLIC_APP_URL
- **Type**: URL
- **Description**: Your application's public URL (used for Stripe redirect URLs)
- **Development**: `http://localhost:3000`
- **Production**: `https://www.smakowalo.pl` or `https://yourdomain.com`
- **Example**: `NEXT_PUBLIC_APP_URL=https://www.smakowalo.pl`

## Required Database Variables

### NEXT_PUBLIC_SUPABASE_URL
- **Type**: URL
- **Description**: Your Supabase project URL
- **Where to get it**: https://app.supabase.com/project/YOUR_PROJECT/settings/api
- **Example**: `NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co`

### SUPABASE_SERVICE_ROLE_KEY
- **Type**: Secret key (server-side only)
- **Description**: Your Supabase service role key (bypasses RLS for webhook operations)
- **Where to get it**: https://app.supabase.com/project/YOUR_PROJECT/settings/api
- **Example**: `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Complete .env.local Example

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
STRIPE_PRODUCT_ID=prod_AbCdEfGhIjKlMnOp
STRIPE_WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz1234567890
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz

# Application URL
NEXT_PUBLIC_APP_URL=https://www.smakowalo.pl

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next Auth (existing)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://www.smakowalo.pl
```

## Setup Checklist

- [ ] Create Stripe account at https://stripe.com
- [ ] Get Stripe API keys from https://dashboard.stripe.com/apikeys
- [ ] Create "Smakowalo Box" product in Stripe dashboard
- [ ] Set up webhook endpoint at `/api/webhooks/stripe`
- [ ] Add webhook secret to environment variables
- [ ] Run database migration: `db/subscriptions.sql`
- [ ] Test subscription flow in development mode
- [ ] Switch to live keys for production

## Testing in Development

1. Use Stripe test mode keys (starting with `sk_test_` and `pk_test_`)
2. Use Stripe CLI to forward webhooks to localhost:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. The CLI will provide a webhook signing secret for testing
4. Use test card: `4242 4242 4242 4242` with any future expiry and CVC

## Production Deployment (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the variables listed above
4. Redeploy your application
5. Update webhook endpoint URL in Stripe dashboard to production URL
6. Switch to live Stripe keys

## Troubleshooting

### Webhook signature verification fails
- Ensure `STRIPE_WEBHOOK_SECRET` matches the value in Stripe dashboard
- Check that the webhook endpoint URL is correct
- Verify that the endpoint is using `runtime = 'nodejs'`

### Subscription not appearing in database
- Check Supabase logs for any RLS policy issues
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (bypasses RLS)
- Verify webhook is being received (check Stripe dashboard webhook logs)

### Prices not being found
- Ensure `STRIPE_PRODUCT_ID` is set correctly
- Check that prices are being created with correct `lookup_key`
- Verify product exists in Stripe dashboard

## Support

For more information:
- Stripe Documentation: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Documentation: https://supabase.com/docs
