# 🛒 OpenCart Integration Guide

## Current Status
❌ **Products are using MOCK DATA with placeholder images**
✅ **Need to connect to: shop.smakowalo.pl**

---

## How to Connect Real OpenCart Products

### Step 1: Get OpenCart API Credentials

1. Log in to your OpenCart admin panel: **shop.smakowalo.pl/admin**
2. Go to: **System → Users → API**
3. Create a new API user or use existing one
4. Copy the API credentials (API Key/Token)

### Step 2: Enable OpenCart REST API

OpenCart requires an extension for REST API. You need:
- **OpenCart REST API extension** installed
- **API User** created in admin panel
- **API session token** for authentication

**Common OpenCart API endpoints:**
```
GET /index.php?route=api/products
GET /index.php?route=api/product&product_id=123
GET /index.php?route=api/categories
```

### Step 3: Add Environment Variables

Add to `.env.local` and Vercel:

```bash
# OpenCart API Configuration
OPENCART_API_URL=https://shop.smakowalo.pl/index.php?route=api
OPENCART_API_KEY=your_opencart_api_key_here
OPENCART_API_USERNAME=your_api_username
OPENCART_API_TOKEN=your_api_token
```

### Step 4: Image URLs from OpenCart

OpenCart stores images at:
```
https://shop.smakowalo.pl/image/catalog/products/product-name.jpg
```

You need to configure the API to return full image URLs.

---

## Current Mock Data Location

The mock data is in these files:

1. **`src/app/api/products/route.ts`** - Lines 26-800
   - Hardcoded products with fake images

2. **`src/app/api/opencart/product/[id]/route.ts`** - Lines 5-700
   - Detailed product data with instructions

---

## Option 1: Quick Fix - Update Image URLs

If you don't have OpenCart API ready, you can manually update the image URLs:

### Current (Mock):
```typescript
image: "https://ext.same-assets.com/817389662/206723592.jpeg"
```

### Change to (Your OpenCart):
```typescript
image: "https://shop.smakowalo.pl/image/catalog/products/krewetki-harissa.jpg"
```

**Files to update:**
- `src/app/api/products/route.ts`
- `src/app/api/opencart/product/[id]/route.ts`

---

## Option 2: Full OpenCart API Integration

I can create a complete OpenCart API integration that:
1. ✅ Fetches all products from shop.smakowalo.pl
2. ✅ Loads real product images
3. ✅ Syncs product data automatically
4. ✅ Uses OpenCart categories
5. ✅ Shows real prices and stock

**What I need from you:**
1. OpenCart API credentials
2. OpenCart REST API extension installed
3. Sample product URLs from your OpenCart store

---

## Quick Test

To test if your OpenCart API works:

```bash
curl -X GET "https://shop.smakowalo.pl/index.php?route=api/products" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

---

## Product Image Mapping

Tell me which OpenCart products match these dishes:

| Current Product | OpenCart Product ID | Image URL |
|----------------|---------------------|-----------|
| Krewetki z Harissą | ? | https://shop.smakowalo.pl/image/... |
| Kurczak Tikka Masala | ? | https://shop.smakowalo.pl/image/... |
| Risotto z dynia piżmową | ? | https://shop.smakowalo.pl/image/... |

---

## Next Steps

**Choose one:**

### A) Manual Image Update (Fast - 10 minutes)
1. Get product image URLs from shop.smakowalo.pl
2. I'll update the mock data with real images
3. Images will show immediately

### B) Full OpenCart Integration (Complete - 1 hour)
1. Provide OpenCart API credentials
2. I'll build full API integration
3. Products sync automatically from OpenCart

**Which option do you prefer?**

---

## Common Issues

### Issue: OpenCart doesn't have REST API

**Solution:** Install OpenCart REST API extension:
- https://www.opencart.com/index.php?route=marketplace/extension/info&extension_id=19884

### Issue: Can't access OpenCart admin

**Solution:** Contact your hosting provider or OpenCart administrator

### Issue: Images not loading

**Solution:** Check image permissions and URLs:
```bash
https://shop.smakowalo.pl/image/catalog/products/
```
