# Subscription Management & GDPR Compliance Documentation

## 📋 Overview

This document describes the subscription management system, GDPR-compliant account deletion, and email notification features implemented in the Smakowało application.

## 🗂️ Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  street_address TEXT,
  city TEXT,
  postal_code TEXT,
  dietary_preferences JSONB DEFAULT '[]',
  allergies JSONB DEFAULT '[]',
  newsletter_subscribed BOOLEAN DEFAULT false,
  default_people INTEGER DEFAULT 2,
  default_days INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  plan_type TEXT,
  amount DECIMAL(10, 2),
  price_per_delivery DECIMAL(10, 2),
  people INTEGER DEFAULT 2,
  days INTEGER DEFAULT 3,
  meal_plan_config JSONB DEFAULT '{}',
  diets JSONB DEFAULT '[]',
  allergies JSONB DEFAULT '[]',
  next_delivery_date DATE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  pause_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  delivery_date DATE,
  order_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Setup Instructions

### 1. Database Migration

Run the Supabase migrations to create all necessary tables:

```bash
# Apply all migrations in order
cd supabase/migrations

# Run each migration file:
psql $DATABASE_URL < 20251117000000_create_profiles_table.sql
psql $DATABASE_URL < 20251117000001_create_subscriptions_table.sql
psql $DATABASE_URL < 20251117000002_create_orders_table.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 2. Environment Variables

Add these to your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (Resend recommended)
RESEND_API_KEY=re_...
SENDGRID_FROM_EMAIL=noreply@smakowalo.pl

# Site
NEXT_PUBLIC_SITE_URL=https://smakowalo.pl
```

### 3. Configure Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from Dashboard → Developers → API keys
3. Create subscription products and prices in Dashboard → Products
4. Copy the price IDs to your `.env.local`

### 4. Configure Email Service (Optional but Recommended)

**Option A: Resend (Recommended)**

1. Sign up at https://resend.com
2. Get your API key
3. Add `RESEND_API_KEY` to `.env.local`

**Option B: SendGrid**

1. Sign up at https://sendgrid.com
2. Get your API key
3. Add `SENDGRID_API_KEY` to `.env.local`

**Option C: Development Mode**

If no email service is configured, emails will be logged to console instead.

## 🔄 API Endpoints

### 1. Pause Subscription

**Endpoint:** `POST /api/subscriptions/pause`

**Request Body:**
```json
{
  "subscription_id": 123,
  "stripe_subscription_id": "sub_xxx",
  "pause_until": "2025-12-31" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription paused successfully",
  "pause_until": "2025-12-31"
}
```

**Features:**
- Pauses the Stripe subscription (no charges during pause)
- Updates database status to 'paused'
- Sends email notification to user
- Optionally sets resume date

### 2. Resume Subscription

**Endpoint:** `POST /api/subscriptions/resume`

**Request Body:**
```json
{
  "subscription_id": 123,
  "stripe_subscription_id": "sub_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription resumed successfully"
}
```

**Features:**
- Resumes the Stripe subscription
- Updates database status to 'active'
- Clears pause_until date
- Sends email notification to user

### 3. Cancel Subscription

**Endpoint:** `POST /api/subscriptions/cancel`

**Request Body:**
```json
{
  "subscription_id": 123,
  "stripe_subscription_id": "sub_xxx",
  "cancel_immediately": false // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription will cancel at period end"
}
```

**Features:**
- Cancels immediately or at period end
- Updates Stripe subscription
- Updates database status
- Sends email notification to user

### 4. Delete Account (GDPR)

**Endpoint:** `DELETE /api/user/delete-account`

**Authentication:** Required (uses session cookie)

**Response:**
```json
{
  "success": true,
  "message": "Account and all associated data have been permanently deleted",
  "deleted_data": {
    "subscriptions": true,
    "orders": true,
    "favorites": true,
    "profiles": true,
    "auth": true
  }
}
```

**GDPR Compliance:**
- Cancels all active Stripe subscriptions
- Deletes Stripe customer
- Deletes all user data from database:
  - Subscriptions
  - Orders
  - Favorites
  - Profile
  - Auth account
- Sends confirmation email
- Complies with GDPR Article 17 (Right to be forgotten)

## 📧 Email Notifications

### Available Email Templates

1. **Subscription Paused**
   - Sent when subscription is paused
   - Includes pause duration if set
   - Link to panel to manage subscription

2. **Subscription Resumed**
   - Sent when subscription is resumed
   - Includes next delivery date
   - Welcome back message

3. **Subscription Canceled**
   - Sent when subscription is canceled
   - Includes link to create new subscription
   - Feedback request

4. **Account Deletion Confirmation**
   - Sent after account is deleted
   - Lists all deleted data (GDPR compliance)
   - Includes link to create new account

### Email Service Configuration

```typescript
// src/lib/email-notifications.ts

// Send pause notification
import { sendSubscriptionPausedEmail } from '@/lib/email-notifications'

await sendSubscriptionPausedEmail('user@example.com', {
  userName: 'Jan',
  subscriptionId: '123',
  planName: 'Premium Plan',
  pauseUntil: '2025-12-31'
})
```

## 🎯 User Panel Features

### Profile Management
- Edit personal information
- Update address
- Change phone number
- Update dietary preferences
- Newsletter subscription toggle

### Subscription Management
- View all active subscriptions
- Pause subscription (with optional resume date)
- Resume paused subscription
- Cancel subscription
- View next delivery date
- See subscription status

### Security & Privacy
- **Change Password**
  - Secure dialog with validation
  - Minimum 6 characters
  - Password confirmation required

- **Export Data (GDPR)**
  - Download all personal data in JSON format
  - Includes: profile, orders, subscriptions, favorites
  - GDPR Article 15 compliance

- **Delete Account (GDPR)**
  - Requires typing "USUŃ KONTO" to confirm
  - Permanently deletes all data
  - Cancels active subscriptions
  - GDPR Article 17 compliance

## 🧪 Testing

### Test Stripe Subscriptions

Use Stripe test mode with test cards:

```
Successful payment: 4242 4242 4242 4242
Declined payment: 4000 0000 0000 0002
Requires authentication: 4000 0025 0000 3155
```

### Test Account Deletion

1. Create a test account
2. Add some orders and subscriptions
3. Go to Panel → Settings → Delete Account
4. Type "USUŃ KONTO" and confirm
5. Verify all data is deleted from database
6. Check deletion confirmation email

### Test Email Notifications

1. Configure `RESEND_API_KEY` or use console logging
2. Pause a subscription
3. Check console or email inbox for notification
4. Test resume and cancel notifications

## 🔒 Security Considerations

### Row Level Security (RLS)

All tables have RLS policies:

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

### Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and should:
- **NEVER** be exposed to the client
- Only be used in API routes
- Be stored securely in environment variables
- Have restricted access in production

### API Authentication

All sensitive endpoints require authentication:
- Account deletion requires valid session
- Subscription management requires user ownership
- Profile updates require user authorization

## 📊 Monitoring

### Logs to Monitor

```typescript
// Successful operations
console.log('✅ Subscription paused:', subscription_id)
console.log('✅ Email sent:', email)
console.log('✅ Account deleted:', user_id)

// Errors
console.error('❌ Stripe error:', error)
console.error('❌ Database error:', error)

// Warnings
console.warn('⚠️ Email failed (non-critical):', error)
```

### Database Queries for Reporting

```sql
-- Active subscriptions count
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';

-- Paused subscriptions
SELECT * FROM subscriptions WHERE status = 'paused';

-- Recent deletions (if you keep logs)
SELECT * FROM audit_logs WHERE action = 'account_deleted' AND created_at > NOW() - INTERVAL '30 days';
```

## 🐛 Troubleshooting

### Issue: Emails not sending

**Solution:**
1. Check `RESEND_API_KEY` is set correctly
2. Verify email service is configured
3. Check console logs for errors
4. Test with curl:
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@resend.dev","to":"user@example.com","subject":"Test","html":"Test"}'
```

### Issue: Stripe subscription not canceling

**Solution:**
1. Verify `STRIPE_SECRET_KEY` is correct
2. Check subscription ID is valid
3. Test in Stripe Dashboard
4. Check Stripe API logs

### Issue: Account deletion fails

**Solution:**
1. Check all foreign key constraints
2. Verify RLS policies allow deletion
3. Check service role key permissions
4. Review database logs

## 📝 Next Steps

1. **Set up Stripe Webhooks** to handle subscription events
2. **Configure Email Templates** in Resend/SendGrid
3. **Add Subscription Analytics** to track metrics
4. **Implement Refund Logic** for canceled subscriptions
5. **Add Audit Logs** for compliance tracking

## 🆘 Support

For issues or questions:
- Email: support@same.new
- Documentation: https://docs.same.new
- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs
