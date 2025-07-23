# Supabase Setup Instructions for Smakowało

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Choose organization and project details:
   - **Name**: `smakowalo-production` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Europe (Frankfurt) for Poland-based users
5. Wait for project initialization (~2 minutes)

## 2. Configure Authentication

### Enable Email/Password Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure **Site URL**: `https://your-domain.com` (or `http://localhost:3000` for development)
4. Add **Redirect URLs**:
   - `http://localhost:3000/api/auth/callback/email`
   - `https://your-domain.com/api/auth/callback/email`

### Configure OAuth Providers
1. Go to **Authentication** → **Providers**

#### Facebook Provider
1. Toggle **Facebook** ON
2. Add **Facebook Client ID**: `1741126816798093`
3. Add **Facebook Client Secret**: `4dacbbb4464682e3910b8bb48776888e`
4. Add **Redirect URL** to your Facebook App settings:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback/facebook`

#### Google Provider
1. Toggle **Google** ON
2. Add **Google Client ID**: `962598026946-mfajp4sprhiucna0rcbj2u3e1bm3lek6.apps.googleusercontent.com`
3. Add **Google Client Secret**: `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`
4. Add **Redirect URL** to your Google Cloud Console:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback/google`

## 3. Run Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `database/schema.sql`
3. Run the SQL query
4. Verify all tables are created in **Table Editor**

## 4. Get Your Environment Variables

1. Go to **Settings** → **API**
2. Copy the following values:

```bash
# Your Project URL
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

# Your anon/public key (safe to use in frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Your service role key (KEEP SECRET - server use only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 5. Update Environment Variables

Update your `.env.local` file:

```bash
# Site configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=A+ezQGNqEGtXEZ+8Jzseb1/XMlUkqygXzbFTgP4Pqag=

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Facebook OAuth
FACEBOOK_CLIENT_ID=1741126816798093
FACEBOOK_CLIENT_SECRET=4dacbbb4464682e3910b8bb48776888e

# Google OAuth
GOOGLE_CLIENT_ID=962598026946-mfajp4sprhiucna0rcbj2u3e1bm3lek6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Email Configuration (for magic links)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@smakowalo.pl

# Stripe Configuration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 6. Configure Email Settings (Optional)

### For Gmail SMTP:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_SERVER_PASSWORD`

### For Production:
Consider using:
- **SendGrid**
- **AWS SES**
- **Postmark**
- **Resend**

## 7. Configure Stripe (for payments)

1. Go to [https://stripe.com](https://stripe.com)
2. Create account or login
3. Get your API keys from **Developers** → **API Keys**
4. Add webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
5. Add webhook events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## 8. Test Your Setup

1. Restart your development server
2. Try logging in with:
   - Email/password registration
   - Facebook OAuth
   - Google OAuth
3. Check that user profiles are created in Supabase
4. Test creating orders and subscriptions

## 9. Deploy to Production

1. Update environment variables in your hosting platform
2. Add production URLs to Supabase auth settings
3. Update OAuth provider redirect URLs
4. Configure custom domain (optional)

## Troubleshooting

### Common Issues:

1. **OAuth not working**: Check redirect URLs in both Supabase and OAuth provider settings
2. **Email not sending**: Verify SMTP credentials and from address
3. **Database errors**: Check RLS policies are correctly configured
4. **Environment variables**: Ensure all required variables are set and valid

### Support Resources:

- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Stripe Documentation](https://stripe.com/docs)
