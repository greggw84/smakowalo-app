# 🍽️ Smakowało - Subscription Meal Planning Platform

A modern Next.js application for healthy meal subscriptions with Stripe integration.

## 🚀 Features

- **Subscription Plans**: Basic (299 PLN) and Premium (449 PLN) monthly plans
- **Meal Planning**: Customizable meal selection with dietary preferences
- **Stripe Integration**: Secure payment processing with 7-day trial
- **Email Notifications**: SMTP-based email system for subscription updates
- **User Dashboard**: Complete subscription management (pause, resume, cancel)
- **GDPR Compliant**: Data export and account deletion
- **Webhook Sync**: Automatic Stripe → Supabase synchronization

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout + Subscriptions
- **Email**: Nodemailer (SMTP Bluehost)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ or Bun
- Stripe account (test & live mode)
- Supabase project
- SMTP credentials (Bluehost or similar)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/greggw84/smakowalo-app.git
cd smakowalo-app
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Environment Variables**

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_BASIC_PRICE_ID` - Stripe price ID for basic plan
- `STRIPE_PREMIUM_PRICE_ID` - Stripe price ID for premium plan
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP port (587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM_EMAIL` - From email address
- `SMTP_FROM_NAME` - From name

4. **Run Supabase Migrations**

Execute all SQL migrations in `supabase/migrations/` in your Supabase SQL Editor:
- `20251113000000_add_kreator_preferences.sql`
- `20251117000000_create_profiles_table.sql`
- `20251117000001_create_subscriptions_table.sql`
- `20251117000002_create_orders_table.sql`

5. **Create Stripe Products**

In Stripe Dashboard, create:
- Basic Plan: 299 PLN/month, recurring, 7-day trial
- Premium Plan: 449 PLN/month, recurring, 7-day trial

Copy the Price IDs to `.env.local`

6. **Setup Stripe Webhook**

Create a webhook endpoint in Stripe Dashboard:
- URL: `https://your-domain.com/api/webhooks/stripe`
- Events: `customer.subscription.*`, `invoice.*`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🚀 Development

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

Run automated tests:
```bash
chmod +x test-subscription-flow.sh
./test-subscription-flow.sh
```

Test subscription creation:
```bash
./test-final-verification.sh
```

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add all environment variables
4. Deploy

Or use Vercel CLI:
```bash
vercel --prod
```

### Environment Variables in Vercel

Add all variables from `.env.example` in Vercel Dashboard → Settings → Environment Variables.

**Important**: Use LIVE Stripe keys and Price IDs for production!

## 📚 Documentation

Detailed documentation in `.same/` directory:

- **SUBSCRIPTION_FLOW.md** - Complete subscription flow architecture
- **STRIPE_PRICES_SETUP.md** - Stripe products setup guide
- **STRIPE_WEBHOOKS.md** - Webhook configuration
- **SMTP_SETUP.md** - Email configuration
- **TESTING_SUBSCRIPTION_FLOW.md** - Testing guide
- **FINAL_TEST_REPORT_V192.md** - Latest test results

## 🎯 Key Features

### Subscription Management
- Create subscription via kreator
- 7-day free trial
- Pause subscription (14 days)
- Resume subscription
- Cancel (immediate or end of period)

### Email Notifications
- Welcome email
- Subscription paused/resumed
- Payment succeeded/failed
- Trial ending reminder
- Cancellation confirmation

### User Dashboard
- Profile management
- Subscription overview
- Order history
- Favorites
- GDPR compliance (data export, account deletion)

## 🔒 Security

- Environment variables never committed
- Stripe webhook signature verification
- Supabase RLS policies
- CSRF protection
- Secure authentication

## 📊 Current Status

**Version**: 193
**Test Status**: 32/32 Automated Tests Passing ✅
**Stripe Integration**: Fully Functional ✅
**Email System**: Operational ✅
**Production Ready**: Yes (after Stripe webhook setup) ✅

## 🤝 Contributing

This is a private project. For issues or questions, contact the development team.

## 📄 License

Proprietary - All rights reserved.

## 👤 Author

**greggw84**

## 🆘 Support

For technical support, see documentation in `.same/` directory or contact support@smakowalo.pl

---

**Built with ❤️ using Next.js, Stripe, and Supabase**
