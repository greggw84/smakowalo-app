# Stripe Subscription Flow Setup Guide

This document explains how to set up and test the hardened Stripe subscription flow implemented to fix 500 errors.

## Overview

The subscription flow now includes:
- Server-side environment variable validation
- Request payload validation
- Automatic Stripe Price creation with fallback search
- Comprehensive error logging
- Stripe Checkout Session creation in subscription mode

## Required Environment Variables

Add these to your Vercel/production environment:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...                    # Your Stripe secret key
STRIPE_PRODUCT_ID=prod_...                       # Your Stripe Product ID
STRIPE_WEBHOOK_SECRET=whsec_...                  # For webhook verification (future use)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # For client-side Stripe (if needed)

# Application URLs
NEXT_PUBLIC_APP_URL=https://smakowalo.pl         # Your production URL (no trailing slash)

# Optional (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Setting Up Stripe

### 1. Create a Stripe Product

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Enter product details:
   - Name: "Smakowało Meal Subscription"
   - Description: "Weekly meal subscription service"
4. Save the product and copy the **Product ID** (starts with `prod_`)

### 2. Prices are Auto-Created

The API automatically creates prices with the following format:
- **Unit Amount**: Calculated as `numberOfPeople × numberOfDays × 30 PLN × 100` (in grosze)
- **Currency**: PLN
- **Recurring**: Weekly
- **Lookup Key**: `{numberOfPeople}x{numberOfDays}` (e.g., "2x3", "4x5")
- **Nickname**: Same as lookup key

Valid combinations:
- People: 2, 3, or 4
- Days: 2, 3, 4, or 5
- Total: 12 possible plans

Examples:
- 2 people × 3 days = 180 PLN/week (18,000 groszy)
- 3 people × 5 days = 450 PLN/week (45,000 groszy)
- 4 people × 4 days = 480 PLN/week (48,000 groszy)

## API Endpoint: `/api/create-subscription`

### Request

```typescript
POST /api/create-subscription
Content-Type: application/json

{
  "customer_email": "user@example.com",
  "numberOfPeople": 2,      // Must be 2, 3, or 4
  "numberOfDays": 3          // Must be 2, 3, 4, or 5
}
```

### Successful Response

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

The frontend should redirect to this URL.

### Error Responses

**Missing Environment Variable (500):**
```json
{
  "error": "Stripe is not configured. Please contact support."
}
```

**Invalid Payload (400):**
```json
{
  "error": "Invalid numberOfPeople. Must be 2, 3, or 4."
}
```

**Stripe API Error (500):**
```json
{
  "error": "Failed to create checkout session. Please try again."
}
```

## Frontend Integration

The kreator page (`src/app/kreator/page.tsx`) already implements the correct flow:

```typescript
const handleSubscriptionPayment = async () => {
  const payload = {
    customer_email: session.user?.email,
    numberOfPeople,
    numberOfDays,
  };

  const response = await fetch('/api/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (response.ok && result.url) {
    window.location.href = result.url;  // Redirect to Stripe Checkout
  } else {
    console.error('API error:', result);
    alert('Error processing payment');
  }
};
```

## Testing Checklist

### Local Testing

1. Set environment variables in `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRODUCT_ID=prod_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to `/kreator` and complete the subscription flow
4. Check console logs for detailed error messages
5. Verify redirect to Stripe Checkout

### Production Testing

1. Deploy to Vercel with production environment variables
2. Test each plan combination (2x2, 2x3, etc.)
3. Verify Stripe Dashboard shows:
   - Checkout Sessions created
   - Prices created with correct lookup_keys
   - Subscriptions created after payment

### Error Testing

Test these scenarios to ensure proper error handling:

1. **Missing env vars**: Comment out `STRIPE_SECRET_KEY` → Should show "Stripe is not configured"
2. **Invalid people**: Try `numberOfPeople: 1` → Should show validation error
3. **Invalid days**: Try `numberOfDays: 6` → Should show validation error
4. **Invalid email**: Try `customer_email: "invalid"` → Should show validation error

## Monitoring & Debugging

### Vercel Logs

All errors are logged to Vercel with full details:
```javascript
console.error('Failed to create Checkout Session:', error.raw || error.message)
```

Check logs at: https://vercel.com/your-project/logs

### Stripe Dashboard

Monitor in real-time:
- **Checkout Sessions**: https://dashboard.stripe.com/checkout/sessions
- **Prices**: https://dashboard.stripe.com/prices
- **Subscriptions**: https://dashboard.stripe.com/subscriptions

### Common Issues

**Issue**: "Failed to fetch from Stripe"
- **Cause**: Invalid `STRIPE_SECRET_KEY`
- **Solution**: Verify key starts with `sk_live_` or `sk_test_`

**Issue**: "Failed to create price"
- **Cause**: Invalid `STRIPE_PRODUCT_ID`
- **Solution**: Verify product exists in Stripe Dashboard

**Issue**: "Redirect URL error"
- **Cause**: Invalid `NEXT_PUBLIC_APP_URL`
- **Solution**: Ensure URL has no trailing slash

## Webhooks (Future Implementation)

To handle subscription events (payment success, cancellation, etc.):

1. Create webhook endpoint: `/api/stripe/webhook`
2. Add webhook URL in Stripe Dashboard
3. Set `STRIPE_WEBHOOK_SECRET` environment variable
4. Handle events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Security Considerations

✅ Environment variables validated on server-side
✅ Request payload validated before processing
✅ Stripe API keys never exposed to client
✅ No security vulnerabilities detected by CodeQL
✅ Comprehensive error logging without exposing sensitive data

## Support

For issues or questions:
1. Check Vercel logs for detailed error messages
2. Review Stripe Dashboard for failed transactions
3. Ensure all environment variables are correctly set
4. Verify pricing calculations in `src/lib/pricing.ts`
