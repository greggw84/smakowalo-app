# Deployment Checklist - OpenCart Integration

## Changes Made

### 1. OpenCart API Integration ✅
- **File:** `src/lib/opencart.ts`
- Session-based authentication
- Login with username/password
- Token caching (1 hour)
- Multiple endpoint fallbacks

### 2. Products API Update ✅
- **File:** `src/app/api/products/route.ts`
- Updated credential check (username + password)
- Added logging for debugging

### 3. Removed Demo Data ✅
- **File:** `src/app/api/user/orders/route.ts`
- Returns empty array when Supabase not configured
- No mock orders

### 4. Panel Page Cleanup ✅
- **File:** `src/app/panel/page.tsx`
- Removed session timeout warnings
- Removed demo mode banners
- Professional UI

### 5. Test Endpoint ✅
- **File:** `src/app/api/opencart/test/route.ts`
- Test OpenCart connection
- Verify products/categories fetch

## Required Actions

### 🔴 CRITICAL - Add to Vercel

Go to: https://vercel.com/dashboard → smakowalo-app → Settings → Environment Variables

Add for **Production**:

```bash
OPENCART_URL=https://shop.smakowalo.pl
OPENCART_API_USERNAME=admin2
OPENCART_API_PASSWORD=Smak2025!
OPENCART_API_ROUTE_PREFIX=index.php?route=
```

### 🔄 Deploy

1. **Option A:** Push to GitHub (auto-deploy)
   ```bash
   git add .
   git commit -m "OpenCart integration + cleanup"
   git push origin main
   ```

2. **Option B:** Manual redeploy in Vercel
   - Deployments → ... → Redeploy

### ✅ Verify

After deployment:

1. **Test OpenCart:**
   ```
   curl https://www.smakowalo.pl/api/opencart/test
   ```

2. **Check Menu:**
   - Visit https://www.smakowalo.pl/menu
   - Should show real products from shop.smakowalo.pl

3. **Check Panel:**
   - Visit https://www.smakowalo.pl/panel
   - Should show clean UI without warnings

## Verification Commands

```bash
# Test OpenCart connection
curl https://www.smakowalo.pl/api/opencart/test | jq

# Test products API
curl https://www.smakowalo.pl/api/products | jq '.products | length'

# Test categories
curl https://www.smakowalo.pl/api/categories | jq
```

## Expected Results

### OpenCart Test
```json
{
  "success": true,
  "products_count": 50+,
  "categories_count": 6+
}
```

### Menu Page
- Real product names
- Images from shop.smakowalo.pl
- Correct prices
- No mock data

### Panel Page
- User profile from Supabase
- Real orders (or empty state)
- No warnings/banners

## Troubleshooting

### If OpenCart test fails:
1. Check Vercel env variables
2. Verify credentials work in shop.smakowalo.pl/admin
3. Check OpenCart API is enabled
4. View Vercel function logs

### If menu shows old data:
1. Hard refresh (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify env variables in Vercel
4. Check Vercel deployment logs

### If panel shows warnings:
1. Verify NEXT_PUBLIC_SUPABASE_URL is set
2. Check SUPABASE_SERVICE_ROLE_KEY
3. Test Supabase connection
