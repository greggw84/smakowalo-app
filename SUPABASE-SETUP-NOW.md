# 🚀 Set Up Supabase NOW - Complete Guide

This guide will fix your authentication issues by setting up Supabase database.

---

## Part 1: Create Supabase Project (5 minutes)

### Step 1: Go to Supabase
1. Visit: **https://supabase.com/**
2. Click **Start your project** (top right)
3. Sign in with GitHub (recommended) or email

### Step 2: Create New Project
1. Click **New Project**
2. Select your organization (or create one)
3. Fill in project details:
   - **Name**: `smakowalo-app`
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to Poland (e.g., `Europe (Frankfurt)`)
   - **Pricing Plan**: Select **Free** (perfect for starting)
4. Click **Create new project**
5. ⏳ Wait 2-3 minutes for setup to complete

### Step 3: Get Your Credentials
Once project is ready, go to **Settings** → **API**:

1. **Project URL** (under Project URL section)
   - Copy this: `https://xxxxxxxxxxxxx.supabase.co`
   - This is your `NEXT_PUBLIC_SUPABASE_URL`

2. **anon/public key** (under Project API keys)
   - Copy the `anon public` key
   - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **service_role key** (under Project API keys)
   - Click **Reveal** next to `service_role`
   - Copy this key (KEEP SECRET!)
   - This is your `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ SAVE THESE THREE VALUES - You'll need them in Step 5!**

---

## Part 2: Set Up Database Tables (3 minutes)

### Step 4: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  street_address TEXT,
  city TEXT,
  postal_code TEXT,
  dietary_preferences TEXT[],
  newsletter_subscribed BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT,
  email_verification_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  delivery_date DATE,
  delivery_address TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  plan_type TEXT NOT NULL,
  price_per_delivery DECIMAL(10,2) NOT NULL,
  next_delivery_date DATE,
  pause_until DATE,
  meal_plan_config JSONB,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for order_items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click **Run** (bottom right)
5. You should see: ✅ **Success. No rows returned**

---

## Part 3: Configure Authentication (2 minutes)

### Step 5: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **Enabled** (toggle should be ON)
4. Scroll down and configure:
   - **Enable email confirmations**: OFF (we'll use custom email verification)
   - Click **Save**

### Step 6: Configure Site URL

1. Still in **Authentication** settings
2. Go to **URL Configuration** tab
3. Set **Site URL** to: `https://www.smakowalo.pl`
4. Under **Redirect URLs**, add:
   - `https://www.smakowalo.pl/**`
   - `https://smakowalo.pl/**`
5. Click **Save**

---

## Part 4: Add Credentials to Vercel (3 minutes)

### Step 7: Update Environment Variables

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these THREE variables for **Production** environment:

```bash
# Replace with YOUR values from Step 3
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

5. Click **Save** after each one

### Step 8: Also Add Email Variable

Add this for the email fix we made earlier:

```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

## Part 5: Deploy & Test (2 minutes)

### Step 9: Redeploy

1. In Vercel dashboard, go to **Deployments**
2. Click **...** menu on latest deployment
3. Click **Redeploy**
4. ⏳ Wait for deployment to complete (~2 minutes)

### Step 10: Test Everything

1. Go to **https://www.smakowalo.pl/login**
2. Click **Rejestracja** tab
3. Create a new account:
   - Email: your-real-email@example.com
   - Password: Test123!
   - First Name: Your name
   - Last Name: Your surname
4. Click **Utwórz konto**
5. You should see success message
6. **Check your email** (and spam folder!)
7. Click the verification link
8. Go back to login page
9. Sign in with your credentials
10. You should be redirected to `/panel` ✅

---

## ✅ Checklist

- [ ] Created Supabase project
- [ ] Saved Project URL, anon key, and service_role key
- [ ] Ran SQL to create tables
- [ ] Enabled Email authentication
- [ ] Configured Site URL and Redirect URLs
- [ ] Added 3 Supabase variables to Vercel
- [ ] Added RESEND_FROM_EMAIL to Vercel
- [ ] Redeployed from Vercel
- [ ] Tested registration
- [ ] Tested email verification
- [ ] Tested login
- [ ] Successfully accessed /panel

---

## 🐛 Troubleshooting

### Registration doesn't work?
- Check Vercel Function Logs for errors
- Make sure all 3 Supabase environment variables are set
- Verify you redeployed after adding variables

### Email verification link doesn't work?
- Check that RESEND_API_KEY is set in Vercel
- Check that RESEND_FROM_EMAIL is set to `onboarding@resend.dev`
- Look in spam folder

### Can't login after verification?
- Go to Supabase → **Authentication** → **Users**
- Find your user
- Check if email is confirmed
- If not, click **...** → **Confirm email**

### Still getting 401 errors?
- Double-check all environment variables are for **Production** environment
- Make sure NEXTAUTH_SECRET is set
- Clear browser cookies for smakowalo.pl
- Try incognito mode

---

## 📊 Verify Database Setup

To check if tables were created correctly:

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `profiles`
   - `orders`
   - `order_items`
   - `subscriptions`

3. Click on `profiles` table
4. You should see columns: id, email, first_name, last_name, etc.

---

## 🎉 Success!

Once you complete all steps and can login successfully, your app will have:

✅ Full user authentication with Supabase
✅ Email verification working
✅ User profiles stored in database
✅ Orders and subscriptions ready
✅ Secure authentication with JWT

---

## 📝 Summary of Environment Variables

After setup, you should have these in Vercel (Production):

```bash
# Site
NEXT_PUBLIC_SITE_URL=https://www.smakowalo.pl
NEXTAUTH_URL=https://www.smakowalo.pl
NEXTAUTH_SECRET=6QYBkwpIycfg5yvnqoRu55Frhou1fjvNhMi0EyHU3Hw=

# Supabase (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email
RESEND_API_KEY=re_AwTLPHeZ_PmJS1zgxVruwJtQasDF3uDW7
RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

## 🆘 Need Help?

**Can't create Supabase project?**
- Make sure you're signed in to Supabase
- Try a different organization
- Check your internet connection

**SQL query failed?**
- Make sure you copied the ENTIRE SQL script
- Try running each CREATE TABLE statement separately
- Check for any error messages in red

**Still stuck after all steps?**
- Share the error message from Vercel Function Logs
- Check Supabase logs: Dashboard → Logs
- Verify all environment variables are set correctly
