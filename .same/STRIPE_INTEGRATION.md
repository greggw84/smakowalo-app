# Stripe Subscription Integration

This document explains how the Stripe subscription payment system is integrated into Smakowało.

## Overview

The kreator (subscription builder) is now fully integrated with Stripe for payment processing:
- Users select their subscription plan (people + days per week)
- After providing shipping details, they're redirected to Stripe Checkout
- Stripe handles payment securely (cards, BLIK, etc.)
- Webhooks update the subscription status in Supabase
- Users are redirected back to the success page

## Architecture

### 1. Kreator Flow

```
Step 1: Select Plan (people: 2/3/4, days: 2/3/4/5)
  ↓
Step 2: Choose Delivery Day (Tuesday/Thursday)
  ↓
Step 3: Register/Login
  ↓
Step 4: Shipping Address
  ↓
Step 5: Payment Confirmation → Redirect to Stripe Checkout
  ↓
Stripe Checkout (secure payment)
  ↓
Success → /subscription/success
```

### 2. Pricing Model

12 subscription price variants based on:
- **People**: 2, 3, or 4
- **Days per week**: 2, 3, 4, or 5

Each combination has a unique Stripe Price ID configured in `.env.local`.

Example pricing (PLN per week):
- 2 people × 3 days = 270 PLN/week
- 3 people × 4 days = 540 PLN/week
- 4 people × 5 days = 900 PLN/week

### 3. API Endpoints

#### `/api/create-subscription` (POST)
Creates a Stripe Checkout Session for subscription payment.

**Request:**
```json
{
  "numberOfPeople": 3,
  "numberOfDays": 4,
  "deliveryDay": "tuesday",
  "userId": "uuid",
  "userEmail": "user@example.com",
  "selectedDiets": [1, 2],
  "selectedAllergies": ["gluten"],
  "selectedMeals": [],
  "shippingAddress": {
    "firstName": "Jan",
    "lastName": "Kowalski",
    "street": "ul. Główna 123",
    "city": "Warszawa",
    "postcode": "00-001",
    "phone": "+48 123 456 789"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

#### `/api/stripe/webhook` (POST)
Handles Stripe webhook events to update subscription status.

**Events handled:**
- `checkout.session.completed` - Update subscription after successful payment
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment succeeded
- `invoice.payment_failed` - Payment failed

### 4. Database Schema

Subscriptions are stored in the `subscriptions` table:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT, -- 'active', 'trialing', 'past_due', 'canceled', etc.
  plan_type TEXT DEFAULT 'weekly',
  people INTEGER,
  days INTEGER,
  delivery_day TEXT, -- 'tuesday' or 'thursday'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP,
  meal_plan_config JSONB,
  diets INTEGER[],
  allergies TEXT[],
  selected_meals INTEGER[],
  delivery_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Setup Instructions

### 1. Configure Stripe Dashboard

1. **Create Products and Prices**
   - Go to Stripe Dashboard → Products
   - Create 12 recurring prices (one for each combination)
   - Set billing period to "Weekly"
   - Set currency to PLN
   - Copy each Price ID to `.env.local`

2. **Set up Webhooks**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://www.smakowalo.pl/api/webhook/stripe`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`

### 2. Environment Variables

Required in `.env.local`:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX...

# Stripe Price IDs (backend)
STRIPE_PRICE_2_2=price_...
STRIPE_PRICE_2_3=price_...
STRIPE_PRICE_2_4=price_...
STRIPE_PRICE_2_5=price_...
STRIPE_PRICE_3_2=price_...
STRIPE_PRICE_3_3=price_...
STRIPE_PRICE_3_4=price_...
STRIPE_PRICE_3_5=price_...
STRIPE_PRICE_4_2=price_...
STRIPE_PRICE_4_3=price_...
STRIPE_PRICE_4_4=price_...
STRIPE_PRICE_4_5=price_...

# Frontend Price IDs (must match backend)
NEXT_PUBLIC_STRIPE_PRICE_2_2=price_...
NEXT_PUBLIC_STRIPE_PRICE_2_3=price_...
# ... (all 12 variants)

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Testing Webhooks Locally

To test webhooks on localhost, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhook/stripe

# Copy the webhook signing secret shown in the terminal to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX...

# Restart the dev server
bun run dev
```

Now test the checkout flow:
1. Go to `/kreator`
2. Complete all steps
3. Click "Przejdź do płatności Stripe"
4. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
5. Complete payment
6. Check terminal logs to see webhook events

### 4. Testing in Production

1. Deploy the application to production
2. Configure webhook endpoint in Stripe Dashboard with production URL
3. Update `.env` with production API keys
4. Test full flow with real payment methods

## Files Modified

- **Frontend:**
  - `src/app/kreator/page.tsx` - Removed fake payment UI, integrated Stripe redirect
  - `src/app/subscription/success/page.tsx` - Success page (existing)
  - `src/app/subscription/cancel/page.tsx` - Cancel page (existing)

- **Backend:**
  - `src/app/api/create-subscription/route.ts` - Creates Stripe Checkout Session
  - `src/app/api/webhook/stripe/route.ts` - **NEW** - Handles Stripe webhooks

- **Configuration:**
  - `.env.local` - Added frontend Stripe Price IDs

## Security Notes

1. **API Keys:**
   - Never expose `STRIPE_SECRET_KEY` in frontend code
   - Use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for frontend
   - Keep webhook secret secure

2. **Webhook Validation:**
   - All webhooks are validated using signature verification
   - Invalid signatures are rejected

3. **Database Security:**
   - Subscription updates use service role key (bypasses RLS)
   - Frontend uses authenticated user ID for queries

## Subscription Management

Users can manage their subscriptions in the client panel:

- **View subscription**: `/panel` (Subscription tab)
- **Select weekly meals**: `/panel/select-meals`
- **Change plan**: `/panel/manage-plan`
- **Change delivery day**: `/panel/change-delivery`
- **Pause/Resume/Cancel**: Via Stripe Customer Portal or API

## Next Steps

1. ✅ Kreator integrated with Stripe
2. ✅ Webhook handler created
3. ✅ Environment variables configured
4. ⏳ Test webhook locally with Stripe CLI
5. ⏳ Deploy webhook to production
6. ⏳ Configure production webhook in Stripe Dashboard
7. ⏳ Test full flow end-to-end
8. 🔜 Add email notifications (subscription created, payment failed, etc.)
9. 🔜 Add Stripe Customer Portal for self-service subscription management

## Troubleshooting

### Payment not creating subscription
- Check webhook logs in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Supabase logs for database errors

### Redirect URL not working
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check success/cancel URLs in create-subscription API

### Price ID errors
- Verify all 12 price IDs are configured in `.env.local`
- Ensure frontend and backend price IDs match
- Check Stripe Dashboard that prices are active

### Webhook signature verification fails
- Restart server after updating `STRIPE_WEBHOOK_SECRET`
- For local testing, use Stripe CLI webhook secret
- For production, use webhook secret from Stripe Dashboard

## Stripe Price Configuration Error Fix (Version 208)

### Issue
Users were encountering the error:
```
"Wystąpił błąd: Stripe price configuration missing for 2 people, 3 days. Please contact support."
```

This error appeared when attempting to subscribe through the kreator, specifically for the 2 people, 3 days plan (though the issue affected all combinations).

### Root Cause
The backend API route (`src/app/api/create-subscription/route.ts`) was looking for environment variables like `STRIPE_PRICE_2_2` without fallback values:

```typescript
// BEFORE (Backend) - No fallback values
const PRICE_IDS: Record<string, string | undefined> = {
  '2-2': process.env.STRIPE_PRICE_2_2,
  '2-3': process.env.STRIPE_PRICE_2_3,
  // ...
};
```

The frontend code already had fallback values:
```typescript
// Frontend - Has fallback values
const PRICE_IDS: Record<string, string> = {
  '2-2': process.env.NEXT_PUBLIC_STRIPE_PRICE_2_2 || 'price_1SVD45ChaDkFJkJI2DkNEpkK',
  '2-3': process.env.NEXT_PUBLIC_STRIPE_PRICE_2_3 || 'price_1SVD45ChaDkFJkJIzSzHEwGS',
  // ...
};
```

When deployed to Vercel, if the backend environment variables (`STRIPE_PRICE_*` without `NEXT_PUBLIC_` prefix) weren't set in the Vercel dashboard, the API would return null for the price ID and throw an error.

### Solution
Added fallback values to the backend API route to match the frontend implementation:

```typescript
// AFTER (Backend) - With fallback values
const PRICE_IDS: Record<string, string> = {
  '2-2': process.env.STRIPE_PRICE_2_2 || 'price_1SVD45ChaDkFJkJI2DkNEpkK',
  '2-3': process.env.STRIPE_PRICE_2_3 || 'price_1SVD45ChaDkFJkJIzSzHEwGS',
  '2-4': process.env.STRIPE_PRICE_2_4 || 'price_1SVD45ChaDkFJkJI8OP7MDB3',
  '2-5': process.env.STRIPE_PRICE_2_5 || 'price_1SVD45ChaDkFJkJIzdQ9CUAI',
  '3-2': process.env.STRIPE_PRICE_3_2 || 'price_1SVD45ChaDkFJkJIwhAc79kF',
  '3-3': process.env.STRIPE_PRICE_3_3 || 'price_1SVD45ChaDkFJkJIavPtADkM',
  '3-4': process.env.STRIPE_PRICE_3_4 || 'price_1SVD45ChaDkFJkJIQD8WJShG',
  '3-5': process.env.STRIPE_PRICE_3_5 || 'price_1SVD45ChaDkFJkJIdMvMGP4O',
  '4-2': process.env.STRIPE_PRICE_4_2 || 'price_1SVD45ChaDkFJkJIKS1x4fwL',
  '4-3': process.env.STRIPE_PRICE_4_3 || 'price_1SVD45ChaDkFJkJIsmkCYQvL',
  '4-4': process.env.STRIPE_PRICE_4_4 || 'price_1SVD45ChaDkFJkJIqwyRP3da',
  '4-5': process.env.STRIPE_PRICE_4_5 || 'price_1SVD45ChaDkFJkJIH0Rw81fj',
};
```

Now the subscription creation works even if backend environment variables aren't set in Vercel, using the default price IDs from the local `.env.local` file.

### Files Modified
- `src/app/api/create-subscription/route.ts`
  - Updated `PRICE_IDS` constant to include fallback values
  - Changed type from `Record<string, string | undefined>` to `Record<string, string>`

### Deployment Notes
For production deployment to Vercel, you have two options:

**Option 1: Use fallback values (Recommended)**
- No additional configuration needed
- Fallback values will be used automatically
- Simpler deployment process

**Option 2: Set environment variables in Vercel**
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Add all 12 `STRIPE_PRICE_*` variables (without `NEXT_PUBLIC_` prefix)
- Redeploy the project
- Environment variables will override fallback values

The fallback approach is recommended for consistency between local development and production.

### Testing
To verify the fix works:
1. Go to `/kreator`
2. Select any plan (e.g., 2 people, 3 days per week)
3. Complete all steps
4. Verify successful redirect to Stripe Checkout
5. No error message should appear

### Prevention
To prevent similar issues in the future:
- Always add fallback values for critical configuration constants
- Keep frontend and backend price ID mappings in sync
- Document all required environment variables in `.env.local` and deployment docs
