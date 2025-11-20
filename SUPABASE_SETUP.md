# 🗄️ Supabase Database Setup Guide

Complete guide to set up your Supabase database for the Smakowało app.

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up or log in** (free account available)
3. **Click "New Project"**
   - Organization: Create new or select existing
   - Name: `Smakowało`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users (Europe for Poland)
   - Pricing Plan: Free (or Pro for production)
4. **Click "Create new project"**
5. **Wait 2-3 minutes** for project to initialize

### Step 2: Run Database Schema

1. **Open SQL Editor** (left sidebar in Supabase dashboard)
2. **Click "New query"**
3. **Copy the entire contents** of `supabase/schema.sql`
4. **Paste into SQL Editor**
5. **Click "Run"** or press Ctrl/Cmd + Enter
6. **Wait for success message** ✅

You should see:
```
Success. No rows returned.
```

### Step 3: Get Your API Keys

1. **Go to Project Settings** (gear icon, bottom left)
2. **Click "API"** in the left menu
3. **Copy these values:**

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (long string)
   - **service_role secret**: `eyJhbG...` (long string, keep secret!)

### Step 4: Add to Environment Variables

#### For Local Development (.env.local):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-role-key
```

#### For Vercel Deployment:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings → Environment Variables**
4. **Add these three variables:**

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |

5. **Redeploy your app**

### Step 5: Test Connection

1. **Restart your development server**:
   ```bash
   cd smakowalo-app
   bun run dev
   ```

2. **Check server logs** - you should see:
   ```
   ✅ Creating Supabase client with valid config
   ```

3. **Test features:**
   - Register a new account
   - Add items to cart
   - Create an order
   - Add favorites

---

## 📊 Database Structure

Your database includes these tables:

### Core Tables
- **`categories`** - Product categories
- **`products`** - All meal products
- **`profiles`** - User profiles (extends auth.users)

### E-commerce Tables
- **`orders`** - Customer orders
- **`order_items`** - Items in each order
- **`cart_items`** - Shopping cart (persisted)
- **`subscriptions`** - Meal plan subscriptions

### Engagement Tables
- **`reviews`** - Product reviews
- **`favorites`** - User favorites
- **`newsletter_subscribers`** - Newsletter signups
- **`contact_messages`** - Contact form messages

### Business Tables
- **`discount_codes`** - Promo codes
- **`audit_log`** - Activity tracking

---

## 🔒 Security (Row Level Security)

Your database is secured with RLS policies:

✅ **Users can only:**
- View/edit their own profile
- View their own orders
- Manage their own cart
- Manage their own favorites
- Write/edit their own reviews

✅ **Everyone can:**
- View active products
- View active categories
- View all reviews

✅ **Admins can:** (service_role key)
- Access all data
- Manage all tables

---

## 🌱 Seed Data

The schema includes sample data:

- **6 categories** (Dania główne, Sałatki, etc.)
- **3 discount codes** (WELCOME10, SUMMER25, FREEDELIVERY)

To add products, you can:

1. **Use SQL Editor**:
   ```sql
   INSERT INTO products (name, slug, description, image, price, category_id, ...)
   VALUES (...);
   ```

2. **Use Supabase Table Editor** (easier):
   - Go to Table Editor
   - Select `products`
   - Click "Insert row"
   - Fill in the form

3. **Import from CSV**:
   - Prepare CSV file
   - Go to Table Editor → products
   - Click menu → Import data → CSV

---

## 🔧 Advanced Configuration

### Enable Realtime (Optional)

For real-time updates:

1. Go to Database → Replication
2. Enable replication for tables you want real-time:
   - `cart_items` - Live cart updates
   - `products` - Stock updates
   - `orders` - Order status updates

### Set Up Database Backups

1. **Go to Settings → Backups**
2. **Enable automated backups**
3. **Choose frequency:** Daily
4. **Retention:** 7 days (Free tier) or more (Pro tier)

### Add Database Functions

You can add custom functions for complex queries:

```sql
-- Example: Get user's total orders
CREATE OR REPLACE FUNCTION get_user_order_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*) FROM orders WHERE user_id = $1
$$ LANGUAGE SQL STABLE;
```

### Set Up Database Webhooks

Get notified of events:

1. **Go to Database → Webhooks**
2. **Create webhook**
3. **Choose table and events**
4. **Add webhook URL**

Example: Send notification when new order is created

---

## 📈 Monitoring & Analytics

### View Database Activity

1. **Go to Reports** (left sidebar)
2. **View metrics:**
   - Database size
   - Active connections
   - Query performance
   - API requests

### Check Logs

1. **Go to Logs** (left sidebar)
2. **Filter by:**
   - API requests
   - Database queries
   - Auth events
   - Errors

### Query Performance

1. **Go to SQL Editor**
2. **Run EXPLAIN ANALYZE** for slow queries:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM products WHERE category_id = 1;
   ```

---

## 🔐 Authentication Setup

### Email/Password Auth (Already Enabled)

Your app uses Supabase Auth with email/password.

**To customize:**

1. **Go to Authentication → Settings**
2. **Configure:**
   - Disable email confirmations (for testing)
   - Set password requirements
   - Configure redirect URLs

### Add Social Login (Optional)

1. **Go to Authentication → Providers**
2. **Enable providers:**
   - Google
   - Facebook
   - GitHub
   - etc.

3. **Add credentials** from provider
4. **Update your app** (providers already configured in code!)

### Email Templates

Customize auth emails:

1. **Go to Authentication → Email Templates**
2. **Edit templates:**
   - Confirmation email
   - Password reset
   - Magic link
   - etc.

---

## 🌐 Custom Domain (Optional)

Use your own domain with Supabase:

1. **Go to Settings → Custom Domains**
2. **Add domain:** `api.smakowalo.pl`
3. **Add DNS records:**
   ```
   CNAME api.smakowalo.pl → xxxxx.supabase.co
   ```
4. **Wait for verification**
5. **Update environment variables:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://api.smakowalo.pl
   ```

---

## 📦 Database Migrations

For future schema changes:

### Option 1: SQL Editor (Simple)
1. Write SQL in editor
2. Run migration
3. Save SQL file in `supabase/migrations/`

### Option 2: Supabase CLI (Advanced)

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Create migration
supabase migration new add_new_table

# Apply migrations
supabase db push
```

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** Can't connect to Supabase

**Solutions:**
1. Check URL and keys are correct
2. Verify environment variables are set
3. Check Supabase project is running
4. Check network/firewall

### RLS Policy Errors

**Problem:** "Row level security policy violation"

**Solutions:**
1. Check user is authenticated
2. Verify RLS policies allow the operation
3. Use service_role key for admin operations
4. Check table policies in Supabase dashboard

### Database Size Limit

**Problem:** "Database exceeds size limit"

**Solutions:**
1. Upgrade to Pro plan
2. Delete old data
3. Archive historical data
4. Optimize images (use external storage)

### Slow Queries

**Problem:** Queries are slow

**Solutions:**
1. Add indexes:
   ```sql
   CREATE INDEX idx_products_name ON products(name);
   ```
2. Optimize query
3. Use database caching
4. Upgrade to Pro (more resources)

---

## ✅ Setup Checklist

- [ ] Create Supabase project
- [ ] Run schema.sql in SQL Editor
- [ ] Copy API keys
- [ ] Add environment variables to .env.local
- [ ] Add environment variables to Vercel
- [ ] Redeploy app
- [ ] Test user registration
- [ ] Test adding to cart
- [ ] Test creating order
- [ ] Test favorites
- [ ] Enable backups
- [ ] Set up monitoring
- [ ] Customize auth emails (optional)
- [ ] Add social login (optional)

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

## 🎉 You're All Set!

Your Supabase database is now configured and ready to use!

**What you can do now:**
- Users can register and log in
- Shopping cart persists across sessions
- Orders are saved to database
- Favorites are saved
- Reviews can be added
- Newsletter signups are stored
- Contact form messages are saved

**Next steps:**
1. Add some product data
2. Test all features
3. Set up email service (see EMAIL_SETUP.md)
4. Deploy to production
5. Monitor usage and performance
