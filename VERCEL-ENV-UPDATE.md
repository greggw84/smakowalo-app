# Fix for Login & Panel Pages Not Loading on Vercel

## Problem
The login and panel pages won't load on `www.smakowalo.pl` due to incorrect NextAuth cookie configuration and environment variables.

## Solution
Update the following environment variables in your Vercel project dashboard:

### 1. Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your `smakowalo-app` project
3. Go to **Settings** → **Environment Variables**

### 2. Update These Variables

**CRITICAL - Update these immediately:**

```bash
# Site URL - MUST match your production domain
NEXT_PUBLIC_SITE_URL=https://www.smakowalo.pl

# NextAuth URL - MUST match production domain exactly
NEXTAUTH_URL=https://www.smakowalo.pl

# NextAuth Secret - Use this secure secret
NEXTAUTH_SECRET=6QYBkwpIycfg5yvnqoRu55Frhou1fjvNhMi0EyHU3Hw=
```

### 3. Redeploy
After updating the environment variables:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. OR just push a new commit to trigger automatic deployment

## What Was Fixed

### Code Changes Made:
1. ✅ Updated cookie domain to `.smakowalo.pl` (allows cookies to work on both `smakowalo.pl` and `www.smakowalo.pl`)
2. ✅ Fixed NEXT_PUBLIC_SITE_URL in `.env.local`
3. ✅ Generated secure NEXTAUTH_SECRET
4. ✅ Set correct NEXTAUTH_URL

### Cookie Configuration:
```typescript
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
      domain: '.smakowalo.pl',  // ← This is critical!
    },
  },
}
```

## Testing After Deployment

1. **Clear your browser cookies** for smakowalo.pl
2. Go to https://www.smakowalo.pl/login
3. Try to log in or register
4. If successful, you should be redirected to /panel

## Troubleshooting

### If login still doesn't work:

1. **Check browser console** (F12) for errors
2. **Check cookies** - You should see a cookie named `__Secure-next-auth.session-token` with domain `.smakowalo.pl`
3. **Verify environment variables** in Vercel dashboard
4. **Check Vercel logs** in the Functions tab for any runtime errors

### Common Issues:

- **"Session loading timeout"** → NextAuth can't verify the session (check NEXTAUTH_URL and NEXTAUTH_SECRET)
- **"Cookies not being set"** → Domain mismatch (verify cookie domain is `.smakowalo.pl`)
- **"Infinite redirect"** → NextAuth URL doesn't match the actual domain

## Important Notes

⚠️ **Cookie Domain**: The leading dot in `.smakowalo.pl` is important - it allows cookies to work on both the apex domain (`smakowalo.pl`) and subdomains (`www.smakowalo.pl`)

⚠️ **HTTPS Required**: Secure cookies (`__Secure-` prefix) only work over HTTPS. Never use HTTP in production.

⚠️ **Clear Cache**: After redeployment, clear your browser cache and cookies for the site.

## Next Steps

After these changes are deployed:
1. Test login functionality
2. Test registration with email verification
3. Test panel page access
4. Verify session persistence across page reloads
