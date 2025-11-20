# 🚀 Quick Start Guide - Subscription Management

## ⚡ 5-Minute Setup

### Step 1: Configure Supabase (2 minutes)

1. **Create Supabase Project**
   ```bash
   # Visit: https://supabase.com/dashboard
   # Create new project
   # Copy your project URL and keys
   ```

2. **Add to `.env.local`**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Run Database Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push
   ```

   Or manually run SQL in Supabase Dashboard → SQL Editor:
   - Copy contents of `supabase/migrations/20251117000000_create_profiles_table.sql`
   - Run in SQL Editor
   - Repeat for other migration files

### Step 2: Configure Stripe (2 minutes)

1. **Get Stripe Keys**
   ```bash
   # Visit: https://dashboard.stripe.com/test/apikeys
   # Copy your test API keys
   ```

2. **Add to `.env.local`**
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   ```

3. **Create Products (Optional)**
   ```bash
   # Visit: https://dashboard.stripe.com/test/products
   # Create subscription products
   # Copy price IDs
   ```

### Step 3: Configure Email (1 minute - Optional)

**Option A: Resend (Recommended)**
```bash
# Visit: https://resend.com/api-keys
# Create API key
# Add to .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@smakowalo.pl
```

**Option B: Skip (Development)**
```bash
# Emails will be logged to console
# No configuration needed
```

### Step 4: Test It! (1 minute)

```bash
# Start dev server
bun run dev

# Open browser
open http://localhost:3000

# Register new account
# Go to /panel
# Test features!
```

## ✅ Verification Checklist

- [ ] User can register and login
- [ ] Profile page loads in `/panel`
- [ ] Password change dialog works
- [ ] Data export downloads JSON file
- [ ] Account deletion asks for confirmation
- [ ] Subscription actions (if you have subscriptions)

## 🎯 Testing the Features

### Test 1: Change Password

1. Go to `/panel`
2. Click "Ustawienia" tab
3. Click "Zmień hasło"
4. Enter new password (min 6 chars)
5. Confirm password
6. Click "Zmień hasło"
7. ✅ Should see success message

### Test 2: Export Data (GDPR)

1. Go to `/panel` → "Ustawienia"
2. Click "Pobierz dane osobowe (GDPR)"
3. Click "Pobierz dane"
4. ✅ Should download JSON file with your data

### Test 3: Delete Account (GDPR)

1. Go to `/panel` → "Ustawienia"
2. Click "Usuń konto"
3. Type `USUŃ KONTO` in the input
4. Click "Usuń konto"
5. ✅ Should delete account and redirect to home

⚠️ **Warning:** This PERMANENTLY deletes your account!

### Test 4: Subscription Management

1. Create a subscription in Stripe Dashboard
2. Link it to your user in the database:
   ```sql
   INSERT INTO subscriptions (
     user_id,
     stripe_subscription_id,
     status,
     plan_type,
     amount,
     price_per_delivery
   ) VALUES (
     'your-user-id',
     'sub_xxxxxxxxxxxxx',
     'active',
     'Premium',
     449.00,
     449.00
   );
   ```

3. Go to `/panel` → "Subskrypcje"
4. Test Pause/Resume/Cancel buttons
5. ✅ Should update in Stripe and database

## 🐛 Common Issues

### Issue: "Supabase is not configured"

**Fix:**
```bash
# Check .env.local has these variables:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Restart dev server
bun run dev
```

### Issue: "Failed to update subscription in database"

**Fix:**
```bash
# Run migrations
cd supabase/migrations
psql $DATABASE_URL < 20251117000001_create_subscriptions_table.sql

# Or use Supabase CLI
supabase db push
```

### Issue: "Unauthorized" on delete account

**Fix:**
```bash
# Make sure you're logged in
# Check session in DevTools → Application → Cookies
# Look for sb-access-token cookie
```

### Issue: Emails not sending

**Fix:**
```bash
# Check console logs - emails are logged in development
# To send real emails, add RESEND_API_KEY to .env.local
# Or check SUBSCRIPTION_MANAGEMENT.md for full email setup
```

## 📚 Next Steps

1. **Read Full Documentation**
   - `SUBSCRIPTION_MANAGEMENT.md` - Complete guide
   - `README.md` - Project overview

2. **Customize Email Templates**
   - Edit `src/lib/email-notifications.ts`
   - Update branding and content

3. **Add Webhooks**
   - Set up Stripe webhooks for automatic updates
   - Handle subscription.updated events

4. **Deploy to Production**
   - Update `.env` with production values
   - Deploy to Vercel/Netlify
   - Configure custom domain

## 🎨 Customization

### Change Colors

Edit `src/app/panel/page.tsx`:
```typescript
// Find and replace color classes
className="bg-[var(--smakowalo-green-primary)]"
// With your brand color
className="bg-blue-600"
```

### Add More Features

- Add subscription pause reasons dropdown
- Add cancellation feedback form
- Add subscription plan upgrade/downgrade
- Add referral system
- Add loyalty points

## 💡 Pro Tips

1. **Use Stripe Test Mode**
   - Use test API keys during development
   - Test card: `4242 4242 4242 4242`

2. **Monitor Logs**
   ```bash
   # Watch server logs
   bun run dev | grep '✅\|❌\|⚠️'
   ```

3. **Test GDPR Compliance**
   - Create test account
   - Add data
   - Export data
   - Verify all data is in export
   - Delete account
   - Verify all data is deleted

4. **Email Testing**
   ```bash
   # Use Resend test environment
   # Or check console logs for email content
   ```

## 🆘 Get Help

- **Documentation:** Read `SUBSCRIPTION_MANAGEMENT.md`
- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Same Support:** support@same.new

## 🎉 You're Ready!

Your subscription management system is now fully set up with:
- ✅ User authentication (Supabase)
- ✅ Profile management
- ✅ Password change
- ✅ GDPR data export
- ✅ GDPR account deletion
- ✅ Stripe integration
- ✅ Email notifications
- ✅ Subscription pause/resume/cancel

Happy coding! 🚀
