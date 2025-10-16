# 🚀 Vercel Deployment Guide - Smakowało

## ✅ Pre-deployment Checklist

The project is now **fully optimized** for Vercel deployment with:
- ✅ Next.js 15.3.2 with standalone output
- ✅ Production-ready build configuration
- ✅ Vercel-specific optimizations
- ✅ Image optimization enabled
- ✅ API routes as serverless functions
- ✅ Security headers configured
- ✅ Environment variables ready

## 📦 Deployment Steps

### 1. Connect to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (recommended):
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Deploy via CLI**:
   ```bash
   cd smakowalo-app
   vercel
   ```

### 2. Environment Variables Setup

In Vercel dashboard, add these environment variables:

#### 🔐 Authentication
```env
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secure-secret-key
```

#### 🏗️ Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 💳 Stripe Payments
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### 📧 Email Services
```env
SENDGRID_API_KEY=SG.your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### 🛒 OpenCart Integration
```env
OPENCART_URL=https://your-store.com/api
OPENCART_API_TOKEN=your-api-token
OPENCART_API_USERNAME=your-api-username
OPENCART_API_SECRET=your-api-secret
```

#### 🔗 OAuth Providers
```env
FACEBOOK_CLIENT_ID=your-facebook-id
FACEBOOK_CLIENT_SECRET=your-facebook-secret
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

#### ⚡ Performance Settings
```env
REDIS_URL=your-redis-url (optional)
CACHE_TTL=3600
ENABLE_CACHE=true
```

### 3. Build Configuration

The project includes optimized configurations:

#### `next.config.js` features:
- ✅ Standalone output for serverless
- ✅ Image optimization for Vercel
- ✅ Security headers
- ✅ Webpack optimizations

#### `vercel.json` features:
- ✅ 30-second function timeout
- ✅ CORS headers for API routes
- ✅ EU region deployment (fra1)
- ✅ Health check endpoint

### 4. Domain Configuration

1. **Custom Domain**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate**:
   - Vercel automatically provides SSL
   - No additional configuration needed

## 🔧 Post-deployment Setup

### 1. Database Migration

If using Supabase:
```sql
-- Run the schema from database/schema.sql in Supabase SQL Editor
```

### 2. Webhook Configuration

#### Stripe Webhooks:
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `invoice.payment_succeeded`
4. Copy webhook secret to Vercel environment variables

### 3. Test Critical Paths

✅ **Authentication**:
- Test login/register functionality
- Verify OAuth providers (if configured)

✅ **API Routes**:
- `/api/products` - Product listing
- `/api/categories` - Categories
- `/api/auth/[...nextauth]` - Authentication

✅ **Payment Flow**:
- Test payment intent creation
- Verify webhook processing

✅ **Email System**:
- Test order confirmations
- Verify password reset emails

## 📊 Performance Monitoring

### Vercel Analytics
1. Enable in Project Settings → Analytics
2. Monitor Core Web Vitals
3. Track function execution times

### Error Monitoring
- Vercel automatically captures errors
- Set up Sentry for detailed monitoring (optional)

## 🔍 Troubleshooting

### Common Issues:

#### Build Failures:
```bash
# Check build logs in Vercel dashboard
# Verify all dependencies in package.json
# Ensure TypeScript compilation passes
```

#### API Route Errors:
```bash
# Check function logs in Vercel dashboard
# Verify environment variables
# Check database connectivity
```

#### Image Loading Issues:
```bash
# Verify image domains in next.config.js
# Check CORS settings for external images
```

### Performance Optimization:

#### Database:
- Use connection pooling for Supabase
- Implement caching for frequently accessed data
- Optimize queries with proper indexes

#### Images:
- Use Next.js Image component everywhere
- Leverage Vercel's image optimization
- Compress images before upload

#### API Routes:
- Implement proper error handling
- Add request validation
- Use efficient database queries

## 🚀 Production Checklist

### Pre-launch:
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Payment system tested
- [ ] Email templates verified
- [ ] Domain SSL working
- [ ] Analytics enabled

### Security:
- [ ] HTTPS enforced
- [ ] Security headers active
- [ ] API rate limiting (if needed)
- [ ] Input validation implemented
- [ ] Secrets properly configured

### Performance:
- [ ] Image optimization working
- [ ] Caching configured
- [ ] Bundle size optimized
- [ ] Core Web Vitals passing

## 📈 Scaling Considerations

### Vercel Plans:
- **Hobby**: 100GB bandwidth, 100 serverless functions
- **Pro**: 1TB bandwidth, unlimited functions
- **Enterprise**: Custom limits

### Database:
- **Supabase Free**: 500MB, 2 databases
- **Supabase Pro**: 8GB, unlimited databases

### Caching Strategy:
- Use Redis for session storage (if needed)
- Implement API response caching
- Leverage CDN for static assets

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**: Check Vercel Analytics regularly
2. **Set Up Alerts**: Configure error notifications
3. **Backup Strategy**: Regular database backups
4. **Security Audit**: Regular dependency updates
5. **Performance Testing**: Load testing for high traffic

---

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs

Your Smakowało application is now ready for production deployment! 🎉
