# OpenCart API Integration

## ✅ What Was Fixed

1. **Connected OpenCart Shop (shop.smakowalo.pl)**
   - Proper authentication with username/password
   - Session token caching
   - Multiple API endpoint fallbacks

2. **Removed Demo Data**
   - Panel shows real orders from Supabase
   - Empty state when no orders exist
   - Removed all mock/demo content

3. **Cleaned UI**
   - Removed session timeout warnings
   - Removed demo mode banners
   - Professional error handling

## 🔧 Vercel Environment Variables

Add these to your Vercel project (Production):

```bash
# OpenCart Integration
OPENCART_URL=https://shop.smakowalo.pl
OPENCART_API_USERNAME=admin2
OPENCART_API_PASSWORD=Smak2025!
OPENCART_API_ROUTE_PREFIX=index.php?route=
```

## 🧪 Testing

### 1. Test OpenCart Connection
```
https://www.smakowalo.pl/api/opencart/test
```

Expected response:
```json
{
  "success": true,
  "message": "OpenCart connection successful",
  "products_count": 50,
  "categories_count": 6,
  "sample_products": [...]
}
```

### 2. Test Menu Page
```
https://www.smakowalo.pl/menu
```

Should display real products from shop.smakowalo.pl with:
- Product names and descriptions
- Real images from OpenCart
- Correct prices
- Category information

### 3. Test Panel
```
https://www.smakowalo.pl/panel
```

Should show:
- Real user profile from Supabase
- Real orders (or empty state)
- No demo/mock data
- No warning banners

## 📝 Technical Details

### OpenCart Authentication Flow

1. **Login** (`/index.php?route=api/login`)
   - POST with username and password
   - Returns `api_token`
   - Token cached for 1 hour

2. **API Calls** (`/index.php?route=api/product?api_token=xxx`)
   - Include token in query params
   - Auto-refresh on expiry

### Endpoints Tried (in order)

**Products:**
- `api/product`
- `rest/products`
- `api/rest/product`

**Categories:**
- `api/category`
- `rest/categories`

## 🚀 Deployment

1. Add environment variables to Vercel
2. Redeploy from Vercel dashboard
3. Test `/api/opencart/test`
4. Verify menu page shows real products
5. Check panel has no demo data

## 🐛 Troubleshooting

### "OpenCart login failed"
- Check credentials in Vercel
- Verify shop.smakowalo.pl/admin is accessible
- Check OpenCart API is enabled

### "No products found"
- Test OpenCart API directly
- Check product visibility settings
- Verify API user permissions

### Menu shows mock products
- Check Vercel env variables are set for **Production**
- Redeploy after adding variables
- Clear browser cache
