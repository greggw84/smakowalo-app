# Stripe Webhook and Subscription Display Fix

## Problem
The Stripe webhook at `/api/webhooks/stripe` was not properly displaying subscriptions and purchases in the user panel at `/panel/`. Additionally, customers needed the ability to pause their subscriptions from the user panel.

## Root Causes

### 1. Incomplete Panel Data Loading
The panel page (`src/app/panel/page.tsx`) had commented-out code for loading orders and subscriptions from the database. This meant even if data was saved correctly by the webhook, it wouldn't display in the panel.

### 2. Inconsistent Stripe API Versions
Different parts of the codebase were using different Stripe API versions:
- `src/lib/stripe.ts`: `'2025-06-30.basil'` (incorrect future version)
- `src/app/api/webhooks/stripe/route.ts`: `'2024-12-18.acacia'`
- `src/app/api/stripe/subscribe/route.ts`: `'2024-11-20.acacia'`

This could cause compatibility issues with Stripe API features like `pause_collection`.

### 3. Missing user_id in Metadata
The `/api/stripe/subscribe` endpoint was not including `user_id` in the Stripe checkout session metadata, only `user_email`. This made it harder for the webhook to link subscriptions to the correct user.

### 4. Insufficient Error Handling
The application lacked comprehensive logging and error handling to diagnose issues with subscription linking and data loading.

## Solutions Implemented

### 1. Fixed Panel Data Loading
**File:** `src/app/panel/page.tsx`

Uncommented and enhanced the code to load both orders and subscriptions from Supabase:

```typescript
// Load orders
const { data: ordersData, error: ordersError } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', currentUser.id)
  .order('created_at', { ascending: false })

// Load subscriptions
const { data: subsData, error: subsError } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', currentUser.id)
  .order('created_at', { ascending: false })
```

### 2. Standardized Stripe API Version
**Files:** `src/lib/stripe.ts`, `src/app/api/stripe/subscribe/route.ts`

All Stripe client instances now use the same API version: `'2024-12-18.acacia'`

### 3. Enhanced user_id Handling

#### In Subscribe Endpoint
**File:** `src/app/api/stripe/subscribe/route.ts`

Added Supabase user lookup to include `user_id` in checkout session metadata:

```typescript
// Get Supabase user ID
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
let userId: string | null = null

if (supabaseUrl && supabaseServiceKey) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Look up user by email
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.find((u: any) => u.email === session.user.email)
  
  if (user) {
    userId = user.id
  }
}

// Include in metadata
metadata: {
  // ... other fields
  ...(userId && { user_id: userId }),
}
```

#### In Webhook Handler
**File:** `src/app/api/webhooks/stripe/route.ts`

Improved user lookup to check multiple sources:

```typescript
const userId = session.metadata?.user_id || session.client_reference_id;

// Fallback to email lookup with both auth and profiles table
if (!userId && customerEmail) {
  // Check auth users
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u: any) => u.email === customerEmail);
  
  if (user) {
    subscriptionData.user_id = user.id;
  } else {
    // Fallback to profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();
    
    if (profile) {
      subscriptionData.user_id = profile.id;
    }
  }
}
```

### 4. Fixed Database Upsert Logic
**File:** `src/app/api/webhooks/stripe/route.ts`

Changed the `onConflict` parameter to be consistent:

```typescript
// Before: Dynamic onConflict based on user_id presence (unreliable)
.upsert(subscriptionData, {
  onConflict: subscriptionData.user_id ? 'user_id' : 'stripe_subscription_id',
  ignoreDuplicates: false,
})

// After: Always use stripe_subscription_id (reliable unique key)
.upsert(subscriptionData, {
  onConflict: 'stripe_subscription_id',
  ignoreDuplicates: false,
})
```

### 5. Added Comprehensive Logging
Added detailed logging throughout the stack:

**Webhook:**
- User lookup status (from metadata, email, etc.)
- Subscription upsert results (id, user_id, status)
- Error details at each step

**Panel:**
- Orders loaded count
- Subscriptions loaded count
- Calculated statistics

**Subscription Tab:**
- Database query results
- Error codes and messages

### 6. Created Admin Utility
**File:** `src/app/api/admin/link-subscriptions/route.ts`

Created a utility endpoint to link orphaned subscriptions (those without `user_id`) to users by looking up their email in Stripe.

Usage:
```bash
curl -X POST https://your-domain.com/api/admin/link-subscriptions \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

## Testing the Fix

### 1. Create a New Subscription
1. Go to the subscription creation flow (`/kreator`)
2. Complete the Stripe checkout
3. Verify the webhook receives and processes the event (check logs)
4. Go to `/panel` and verify the subscription appears

### 2. Verify Existing Subscriptions
1. Run the admin utility to link orphaned subscriptions:
   ```bash
   curl -X POST https://smakowalo.pl/api/admin/link-subscriptions \
     -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
   ```
2. Check the response to see how many subscriptions were linked
3. Have users refresh their panel page to see their subscriptions

### 3. Test Pause Functionality
1. Go to `/panel`
2. Click on the "Subscriptions" tab
3. Click "Pomiń najbliższy tydzień" (Skip next week)
4. Confirm the action
5. Verify the subscription status changes to "Wstrzymana" (Paused)
6. Verify in Stripe Dashboard that the subscription is paused

### 4. Test Resume Functionality
1. While on a paused subscription
2. Click "Wznów dostawy" (Resume deliveries)
3. Verify the subscription status changes back to "Aktywna" (Active)
4. Verify in Stripe Dashboard that the subscription is active

## Environment Variables Required

Ensure these are set in your production environment:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin (for link-subscriptions utility)
ADMIN_API_KEY=your_secure_admin_key

# Site
NEXT_PUBLIC_SITE_URL=https://smakowalo.pl
```

## Stripe Webhook Configuration

Ensure your Stripe webhook is configured to send these events to `https://smakowalo.pl/api/webhooks/stripe`:

- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `customer.subscription.trial_will_end`

## Monitoring

Check these logs to verify everything is working:

### Webhook Logs (in Vercel or your hosting platform)
```
ℹ️ [Webhook] Webhook received
✅ [Webhook] Webhook signature verified: checkout.session.completed
✅ [Webhook] Using user_id from metadata: uuid
✅ [Webhook] Subscription upserted to database: { id: 123, user_id: uuid, status: 'active' }
✅ [Webhook] Order created: { orderNumber: 'ORD-123' }
```

### Panel Logs (in browser console)
```
📦 Loaded orders: 5
🔄 Loaded subscriptions: 1
📊 Panel stats: { totalOrders: 5, activeSubscriptions: 1, totalSpent: 500, totalSaved: 50 }
```

### Subscription Tab Logs (in browser console)
```
📊 Subscription loaded: { user_id: 'uuid', found: true, subscription_id: 123, status: 'active' }
```

## Troubleshooting

### Subscriptions Still Not Showing
1. Check browser console for errors
2. Verify user is logged in with the correct account
3. Check database directly for subscriptions with `user_id = <user's id>`
4. Run the link-subscriptions admin utility
5. Check Stripe webhook logs for any errors

### Orders Not Showing
1. Verify orders exist in the database with `user_id = <user's id>`
2. Check browser console for database errors
3. Verify RLS policies allow the user to read their orders

### Pause Not Working
1. Check browser console for API errors
2. Verify the subscription has a `stripe_subscription_id`
3. Check Stripe Dashboard to see if pause was applied
4. Verify Stripe API version is `2024-12-18.acacia`

## Files Modified

1. `src/lib/stripe.ts` - Standardized API version
2. `src/app/api/stripe/subscribe/route.ts` - Added user_id to metadata
3. `src/app/api/webhooks/stripe/route.ts` - Improved user lookup and logging
4. `src/app/panel/page.tsx` - Enabled data loading and added logging
5. `src/app/panel/subscription-tab.tsx` - Added error handling and logging
6. `src/app/api/admin/link-subscriptions/route.ts` - New admin utility (created)

## Summary

The fix addresses all the core issues:

✅ Subscriptions now display in the panel
✅ Orders now display in the panel  
✅ User can pause subscriptions
✅ User can resume subscriptions
✅ Better error handling and debugging
✅ Consistent Stripe API version
✅ Improved user linking in webhooks
✅ Admin utility for fixing existing data

The subscription management flow now works end-to-end from Stripe checkout → webhook → database → panel display.
