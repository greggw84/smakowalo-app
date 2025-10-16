# Image Fix Guide - OpenCart vs Website

## Problem

Website shows **different images** than OpenCart shop:
- OpenCart: Broccoli dish
- Website: Noodles dish

## Root Cause

Website uses **hardcoded mock images**, not real OpenCart images.

## Solution

### 1. Verify OpenCart Connection

Test endpoint to see if OpenCart is working:

```bash
curl https://www.smakowalo.pl/api/opencart/direct-test
```

**Expected response:**
```json
{
  "success": true,
  "products": {
    "count": 50+,
    "sample": [
      {
        "id": 1,
        "name": "Krewetki z Harissą...",
        "image": "catalog/demo/product.jpg",
        "thumb": "catalog/demo/product-100x100.jpg"
      }
    ]
  }
}
```

### 2. Check Environment Variables

**Required in Vercel:**

```bash
OPENCART_URL=https://shop.smakowalo.pl
OPENCART_API_USERNAME=admin2
OPENCART_API_PASSWORD=Smak2025!
```

**How to verify:**
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Check all 3 variables exist for **Production**
4. If missing → Add them
5. Redeploy

### 3. Image URL Format

OpenCart returns:
```
image: "catalog/demo/product.jpg"
```

We convert to:
```
https://shop.smakowalo.pl/image/catalog/demo/product.jpg
```

### 4. Test After Deploy

```bash
# Test OpenCart connection
curl https://www.smakowalo.pl/api/opencart/test

# Test products API
curl https://www.smakowalo.pl/api/products | jq '.source'
# Should return: "opencart" (not "mock")

# Check image URLs
curl https://www.smakowalo.pl/api/products | jq '.products[0].image'
# Should return: "https://shop.smakowalo.pl/image/..."
```

## Debugging

### If images are still wrong:

1. **Check API source:**
   ```bash
   curl https://www.smakowalo.pl/api/products | jq '.source'
   ```
   - If returns `"mock"` → OpenCart not connected
   - If returns `"opencart"` → Images should be correct

2. **Check Vercel logs:**
   - Go to Vercel Dashboard → Deployments
   - Click latest deployment → Functions
   - Look for `/api/products` logs
   - Should see: "✅ Got X products from OpenCart"

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Reload menu page
   - Find `/api/products` request
   - Check response `source` field

### Common Issues

**Issue:** Images still from mock data
**Fix:**
- Verify env variables in Vercel
- Redeploy after adding variables
- Hard refresh browser (Ctrl+Shift+R)

**Issue:** "OpenCart login failed"
**Fix:**
- Check credentials in shop.smakowalo.pl/admin
- Verify API user permissions
- Check OpenCart API is enabled

**Issue:** Images return 404
**Fix:**
- Check image path format
- Verify images exist in OpenCart
- Check OpenCart image folder permissions

## How Images Work Now

### Before (Wrong):
```javascript
// Hardcoded mock images
const products = [
  {
    image: "https://ext.same-assets.com/817389662/206723592.jpeg"
  }
]
```

### After (Correct):
```javascript
// Real OpenCart images
const products = await fetchOpenCartProducts()
// Returns:
// image: "https://shop.smakowalo.pl/image/catalog/product/shrimp.jpg"
```

## Verification Steps

1. ✅ Add env variables to Vercel
2. ✅ Redeploy
3. ✅ Test `/api/opencart/direct-test`
4. ✅ Check `/api/products` returns `source: "opencart"`
5. ✅ Visit `/menu` - should show real images
6. ✅ Images match OpenCart shop

## Files Changed

- `src/lib/opencart.ts` - Image URL mapping
- `src/app/api/products/route.ts` - Use OpenCart instead of mock
- `src/app/api/opencart/direct-test/route.ts` - NEW diagnostic endpoint
