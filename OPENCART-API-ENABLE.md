# Enable OpenCart API

## OpenCart URLs

- **Shop:** https://shop.smakowalo.pl/
- **Admin:** https://shop.smakowalo.pl/admin ← Login here
- **API Endpoint:** https://shop.smakowalo.pl/index.php?route=api/login

## Problem
API returns empty array `[]` - API might be disabled.

## Steps to Enable API

### 1. Check if API is Enabled

**Login to:** https://shop.smakowalo.pl/admin

**Then go to:** System → Settings

1. Click **Edit** on your store
2. Go to **Server** tab
3. Find **Use API**
4. Set to: **Yes**
5. Click **Save** (top right)

### 2. Verify API User Exists

**Go to:** System → Users → API

1. Check if **admin2** user exists
2. If not, click **Add New**:
   - **Username**: admin2
   - **Status**: Enabled
   - Click **Save**

### 3. Generate API Key

**Still in System → Users → API:**

1. Click **Edit** on admin2
2. Go to **General** tab
3. Note the **Key** field
4. This might be auto-generated or you can set: `Smak2025!`
5. **Status**: Must be **Enabled**

### 4. Set IP Addresses

**IP Addresses tab** (you already did this):
- Should have: `0.0.0.0/0`

### 5. Test API Endpoint

Try accessing API directly:

```bash
# Test if API responds
curl https://shop.smakowalo.pl/index.php?route=api/login \
  -d "username=admin2" \
  -d "key=Smak2025!"
```

**Expected successful response:**
```json
{
  "success": true,
  "api_token": "abc123..."
}
```

**Current response (means API disabled or wrong key):**
```json
[]
```

### 6. Alternative: Check API Format

OpenCart 3.x might use different endpoint. Try:

```bash
# Alternative endpoint
curl https://shop.smakowalo.pl/index.php?route=rest/login \
  -d "username=admin2" \
  -d "password=Smak2025!"
```

## Common Issues

### Empty Array `[]`
- API is disabled: Settings → Server → Use API = No
- Wrong API key
- API user is disabled

### 403 Forbidden
- IP not whitelisted (already fixed)

### 404 Not Found
- Wrong endpoint path
- OpenCart version uses different API structure

## What to Check Now

1. ✅ System → Settings → Edit Store → Server → **Use API = Yes**
2. ✅ System → Users → API → admin2 → **Status = Enabled**
3. ✅ System → Users → API → admin2 → **Key matches password**
4. ✅ System → Users → API → admin2 → IP Addresses → **0.0.0.0/0** exists

After checking these, test the API endpoint again.
