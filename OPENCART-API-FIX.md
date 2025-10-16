# OpenCart API 403 Forbidden Fix

## Problem
```
Error: Forbidden
403: Forbidden
```

When trying to access: `smakowalo.pl/opencart/index.php?route=api/login`

## Cause
OpenCart API has **IP address restrictions**. Vercel's servers are blocked.

## Solution ✅

### Add Wildcard IP to OpenCart

1. **Login to OpenCart Admin**
   - Go to: `https://shop.smakowalo.pl/admin`
   - Login: admin2 / Smak2025!

2. **Navigate to API Settings**
   - System → Users → API
   - Click **Edit** on your API user

3. **Add All IPs**
   - Click **IP Addresses** tab
   - Click blue **+** button
   - Enter: `0.0.0.0/0`
   - Click **Save**

4. **Test Connection**
```bash
curl -X POST https://shop.smakowalo.pl/index.php?route=api/login \
  -d "username=admin2&key=Smak2025!" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

**Expected response:**
```json
{
  "success": true,
  "api_token": "abc123..."
}
```

## After Adding IP

1. **Deploy to Vercel** (should auto-deploy from GitHub)

2. **Test endpoints:**
```bash
# Test OpenCart connection
curl https://www.smakowalo.pl/api/opencart/direct-test

# Should return:
# {
#   "success": true,
#   "login": { "status": true, "has_token": true },
#   "products": { "count": 50+ }
# }
```

3. **Check menu page:**
   - Visit: https://www.smakowalo.pl/menu
   - Should show real products from OpenCart
   - Images from: shop.smakowalo.pl/image/...

## Troubleshooting

### Still getting 403?
- Clear OpenCart cache: System → Maintenance → Clear cache
- Check API is enabled: System → Settings → Edit Store → Server → Enable API

### API login works but no products?
- Check product visibility in OpenCart
- Verify products are published and in stock
- Check Vercel function logs

## Security Note

`0.0.0.0/0` allows all IPs. More secure alternatives:

**Add specific Vercel IPs:**
```
76.76.21.0/24
76.223.0.0/20
```

**Or use API key authentication** (recommended for production).
