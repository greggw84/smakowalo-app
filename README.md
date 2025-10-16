# 🍽️ Smakowało - Meal Kit Delivery Platform

A modern, full-stack meal kit delivery platform built with Next.js 15, TypeScript, and Bun. Features include meal planning, subscription management, favorites system, and comprehensive analytics.

## 📚 Setup Guides

**New to the project?** Start here:

### 🎯 Quick Start (Nowe!)
- ✅ **[Master Setup Checklist](./.same/master-setup-checklist.md)** - Pełna konfiguracja krok po kroku (30 min)
- 🗄️ **[Supabase Database](./.same/setup-supabase-guide.md)** - Szczegółowy przewodnik bazy danych
- 📧 **[Email Notifications](./.same/setup-email-guide.md)** - SendGrid + Resend konfiguracja

### 📖 Deployment Guides
- 🚀 **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Complete production setup (30 min)
- 🗄️ **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Database setup guide (English)
- 📧 **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** - Email service setup (English)
- ⚡ **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Deploy to Vercel in 5 minutes
- 📖 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide

## ✨ Features

- 🥘 **Meal Planning**: Interactive meal creator with dietary preferences
- 📱 **Responsive Design**: Mobile-first design with modern UI/UX
- ❤️ **Favorites System**: Save and manage favorite recipes
- 📧 **Newsletter Integration**: Email subscription with multiple providers
- 📊 **Analytics**: Google Analytics and Facebook Pixel integration
- 🔒 **Authentication**: Secure user authentication and profiles
- 🛒 **Shopping Cart**: Full e-commerce functionality
- 📦 **API Integration**: OpenCart integration with fallback mock data
- 🌐 **SEO Optimized**: Meta tags, Open Graph, and structured data
- ⚡ **Performance**: Optimized loading states and caching

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- Node.js 18+ (for compatibility)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smakowalo-app.git
   cd smakowalo-app
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration values.

4. **Run the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Runtime**: Bun
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Email**: SendGrid / Resend
- **Analytics**: Google Analytics, Facebook Pixel
- **Deployment**: Vercel

## 📁 Project Structure

```
smakowalo-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── danie/             # Recipe pages
│   │   ├── kreator/           # Meal creator
│   │   ├── menu/              # Menu browsing
│   │   ├── panel/             # User dashboard
│   │   └── ulubione/          # Favorites page
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Analytics.tsx     # Analytics integration
│   │   ├── ContactForm.tsx   # Contact form
│   │   ├── ErrorBoundary.tsx # Error handling
│   │   ├── FavoriteButton.tsx# Favorites functionality
│   │   ├── Footer.tsx        # Site footer
│   │   ├── Loading.tsx       # Loading states
│   │   ├── Navigation.tsx    # Navigation component
│   │   ├── NewsletterSignup.tsx # Email subscription
│   │   └── SEO.tsx          # SEO meta tags
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.tsx   # Authentication state
│   │   ├── CartContext.tsx   # Shopping cart state
│   │   └── FavoritesContext.tsx # Favorites state
│   ├── lib/                  # Utility functions
│   │   ├── cache.ts         # Caching utilities
│   │   ├── email.ts         # Email services
│   │   └── utils.ts         # General utilities
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── .env.local             # Local environment (gitignored)
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   In your Vercel dashboard, add these environment variables:

   ```bash
   # Required
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-generated-secret

   # Optional (for full functionality)
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
   SENDGRID_API_KEY=your-sendgrid-key
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   bun run build
   ```

2. **Start production server**
   ```bash
   bun start
   ```

## 📧 Email Configuration (Optional but Recommended)

The app supports multiple email providers. See **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** for complete instructions.

### Quick Setup:

### SendGrid (Recommended)
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Resend
```bash
RESEND_API_KEY=your_resend_api_key
```

### Development (Mock)
If no email service is configured, the app will use a mock service that logs emails to the console.

## 📊 Analytics Setup

### Google Analytics
1. Create a GA4 property
2. Add your Measurement ID:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Facebook Pixel
1. Create a Facebook Pixel
2. Add your Pixel ID:
   ```bash
   NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
   ```

## 🗄️ Database Setup (Optional but Recommended)

The app works with mock data by default. For production, set up a real database:

### Quick Setup:
See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for complete instructions.

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database schema** from `supabase/schema.sql`
3. **Add your credentials**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

**What you get:**
- User authentication & profiles
- Persistent shopping cart
- Order history
- Favorites system
- Product reviews
- Newsletter subscribers
- Contact form messages

## 🛠️ Development

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run linter
bun run type-check   # TypeScript type checking

# Utilities
bun run clean        # Clean build artifacts
```

### Adding New Features

1. **API Routes**: Add to `src/app/api/`
2. **Pages**: Add to `src/app/`
3. **Components**: Add to `src/components/`
4. **Styles**: Use Tailwind CSS classes
5. **Types**: Add to `src/types/`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Your site URL | Yes | - |
| `NEXTAUTH_SECRET` | Authentication secret | Yes | - |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | No | - |
| `SENDGRID_API_KEY` | SendGrid API key | No | Mock service |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | No | Mock data |
| `CACHE_TTL` | Cache duration (seconds) | No | 3600 |

### Feature Flags

```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf .next node_modules
   bun install
   bun run build
   ```

2. **Environment Variables Not Working**
   - Ensure `.env.local` exists
   - Check variable names (must start with `NEXT_PUBLIC_` for client-side)
   - Restart development server

3. **Email Not Sending**
   - Check email service configuration
   - Verify API keys
   - Check logs for error messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Email**: support@smakowalo.pl
- **Issues**: [GitHub Issues](https://github.com/yourusername/smakowalo-app/issues)
- **Documentation**: [docs.smakowalo.pl](https://docs.smakowalo.pl)

---

Built with ❤️ for the Smakowało community
