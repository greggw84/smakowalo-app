# Login Redirect Loop Fix - Implementation Summary

## Problem
The login page (`/login`) was experiencing a redirect loop when users visited `/login?callbackUrl=/panel`. The issue was caused by the `useEffect` hook checking `supabase.auth.getSession()` on mount and immediately redirecting if any session existed, even if that session was stale or invalid. This created a loop:
1. User visits `/login?callbackUrl=/panel`
2. Code checks session on mount
3. Stale/invalid session found → redirects to `/panel`
4. Middleware checks session → no valid session → redirects to `/login?callbackUrl=/panel`
5. Loop repeats

## Root Cause
In the original code (lines 98-127), the `useEffect` hook:
```typescript
const checkSession = async () => {
  const { data } = await supabase.auth.getSession()
  if (!cancelled) {
    if (data?.session) {
      // Immediate redirect on mount if any session exists
      router.replace(callbackUrl)
    } else {
      // Only then subscribe to auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session && !cancelled) {
          router.replace(callbackUrl)
        }
      })
    }
  }
}
```

This approach had two problems:
1. **Auto-redirects on mount**: Any cached session state triggered an immediate redirect, even before verifying it was valid
2. **Conditional subscription**: The auth state change listener was only set up if no initial session existed

## Solution
The fix implements the following changes:

### 1. Remove Auto-Redirect on Mount
- Removed the `getSession()` call on mount
- No longer redirects immediately when the page loads
- Users can now see and interact with the login form immediately

### 2. Subscribe to Auth State Changes Only
- Always subscribe to `supabase.auth.onAuthStateChange()`
- Only redirect when the event is specifically `'SIGNED_IN'`
- Ignore other events like `'INITIAL_SESSION'` which can trigger on page load

```typescript
// Subscribe to auth state changes - only redirect on SIGNED_IN event
const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state change:', event)
  
  // Only redirect on SIGNED_IN event, not on other events like INITIAL_SESSION
  if (event === 'SIGNED_IN' && session && !cancelled) {
    const callbackUrl = getValidCallbackUrl()
    console.log('Redirecting to:', callbackUrl)
    router.replace(callbackUrl)
  }
})
```

### 3. Add Debug Query Parameters

#### `stay=1`
Prevents any auto-redirect, even after successful login. Useful for debugging:
```
/login?stay=1
```
When this parameter is present, the login page never redirects, allowing developers to inspect the UI state.

#### `logout=1`
Clears both Supabase and NextAuth sessions when the page loads:
```
/login?logout=1
```
This helps developers test from a clean state or force logout users who are stuck in a bad state.

### 4. Preserve Existing Features
- ✅ CallbackUrl validation (prevents open redirect attacks)
- ✅ Single-flight OAuth guard (prevents duplicate /authorize calls)
- ✅ OAuth button loading states with aria-busy
- ✅ Password login flow with validated callbackUrl

## Implementation Details

### Code Changes
**File**: `src/app/login/page.tsx`

1. **Import signOut** (line 6):
```typescript
import { signOut } from 'next-auth/react'
```

2. **Add logout handler** (lines 99-111):
```typescript
useEffect(() => {
  const logout = searchParams.get('logout')
  if (logout === '1') {
    const clearSessions = async () => {
      await supabase.auth.signOut()
      await signOut({ redirect: false })
      setSuccess('Sesje zostały wyczyszczone.')
    }
    clearSessions()
  }
}, [searchParams])
```

3. **Fix redirect logic** (lines 113-140):
```typescript
useEffect(() => {
  let cancelled = false
  
  // Check if stay=1 parameter is present (for debugging)
  const stay = searchParams.get('stay')
  if (stay === '1') {
    console.log('stay=1 detected - auto-redirect disabled for debugging')
    return
  }

  // Subscribe to auth state changes - only redirect on SIGNED_IN event
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event)
    
    if (event === 'SIGNED_IN' && session && !cancelled) {
      const callbackUrl = getValidCallbackUrl()
      console.log('Redirecting to:', callbackUrl)
      router.replace(callbackUrl)
    }
  })

  return () => {
    cancelled = true
    listener.subscription.unsubscribe()
  }
}, [router, getValidCallbackUrl, searchParams])
```

## Testing

### E2E Tests Added
**File**: `tests/e2e/login-redirect-fix.spec.ts`

Tests cover:
1. ✅ No auto-redirect on page load
2. ✅ No auto-redirect with callbackUrl parameter
3. ✅ `stay=1` parameter prevents all redirects
4. ✅ `logout=1` parameter clears sessions
5. ✅ Login form displays immediately without delay
6. ✅ CallbackUrl parameter preserved during navigation
7. ✅ External URLs rejected by callbackUrl validation
8. ✅ Protocol-relative URLs rejected
9. ✅ Relative paths allowed in callbackUrl
10. ✅ OAuth buttons remain functional
11. ✅ No INITIAL_SESSION redirect triggers

### Manual Testing Scenarios

#### Scenario 1: Fresh Incognito Login
1. Open incognito window
2. Visit `/login`
3. ✅ Page stays on `/login`, no redirect
4. Enter credentials and sign in
5. ✅ Redirects to `/panel` after successful login

#### Scenario 2: OAuth Flow
1. Visit `/login?callbackUrl=/menu`
2. Click "Google" button once
3. ✅ Exactly one `/authorize` request
4. Complete OAuth consent
5. ✅ Returns to `/login` and redirects to `/menu`

#### Scenario 3: Debug Mode
1. Visit `/login?stay=1`
2. ✅ Page stays on `/login` even if session exists
3. Sign in with password
4. ✅ Page still stays on `/login` (stay=1 prevents redirect)

#### Scenario 4: Force Logout
1. Visit `/login?logout=1`
2. ✅ Sessions cleared
3. ✅ Success message: "Sesje zostały wyczyszczone."
4. ✅ Form shown and ready for login

## Supabase Auth Events Reference

The Supabase auth listener receives different events:
- `SIGNED_IN`: User successfully signed in (password or OAuth)
- `SIGNED_OUT`: User signed out
- `TOKEN_REFRESHED`: Access token refreshed
- `USER_UPDATED`: User metadata updated
- `PASSWORD_RECOVERY`: Password recovery initiated
- `INITIAL_SESSION`: Session loaded from storage on page load ⚠️

The key fix is to **only redirect on `SIGNED_IN`**, not on `INITIAL_SESSION` which fires when a cached session is loaded from local storage.

## Security Considerations

### CallbackUrl Validation
The existing `getValidCallbackUrl()` function is preserved and used in all redirect paths:
- ✅ Only allows relative URLs starting with `/`
- ✅ Rejects protocol-relative URLs (`//evil.com`)
- ✅ Validates same-origin for full URLs
- ✅ Falls back to `/panel` for invalid URLs

### Session Management
- ✅ Supabase session cleared on `logout=1`
- ✅ NextAuth session cleared on `logout=1` with `redirect: false`
- ✅ No credentials stored in URL parameters

## Backward Compatibility

### Preserved Behavior
- ✅ CallbackUrl parameter works as before (validated)
- ✅ OAuth buttons have single-flight guard
- ✅ Password login redirects after successful sign-in
- ✅ Register flow unchanged

### Changed Behavior
- ❌ No longer auto-redirects on page load
- ✅ Must sign in to trigger redirect (password or OAuth)
- ✅ Login form always visible on initial load

## Deployment Considerations

1. **No environment changes needed**: Uses existing Supabase configuration
2. **No middleware changes**: Middleware unchanged, still protects `/panel`
3. **No provider changes**: OAuth providers unchanged
4. **No database changes**: No schema modifications needed

## Monitoring & Debugging

### Console Logs
The implementation includes helpful console logs:
```
Auth state change: SIGNED_IN
Redirecting to: /panel
```

Or with `stay=1`:
```
stay=1 detected - auto-redirect disabled for debugging
```

### Debug URLs
- `/login?stay=1` - Inspect UI without redirect
- `/login?logout=1` - Clear sessions and start fresh
- `/login?stay=1&logout=1` - Clear sessions and stay on page

## Known Limitations

1. **Browser back button**: If user navigates back after redirect, they return to login page (expected behavior)
2. **Multiple tabs**: Each tab manages its own auth state independently
3. **Slow networks**: Auth state change event may take time to fire after OAuth redirect

## Future Enhancements

Potential improvements for future iterations:
1. Add loading spinner while waiting for OAuth redirect
2. Show session status indicator for debugging
3. Add session expiry countdown
4. Implement "Remember me" checkbox
5. Add rate limiting for login attempts

## Conclusion

This fix resolves the redirect loop by:
1. Removing the problematic auto-redirect on mount
2. Only redirecting after confirmed SIGNED_IN events
3. Adding debug tools (stay=1, logout=1)
4. Preserving all security validations and existing features

The solution is minimal, focused, and maintains backward compatibility while fixing the core issue.
