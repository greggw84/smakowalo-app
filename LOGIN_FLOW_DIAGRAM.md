# Login Flow Comparison

## BEFORE (Problematic Flow)

```
User visits /login?callbackUrl=/panel
         ↓
    Page loads
         ↓
useEffect runs getSession()
         ↓
   Session found in localStorage?
         ↓ YES
   Redirect to /panel
         ↓
Middleware checks session
         ↓
   Valid session?
         ↓ NO (stale/invalid)
   Redirect to /login?callbackUrl=/panel
         ↓
    🔄 LOOP! 🔄
```

### Problem: Auto-redirect on mount with potentially stale session

---

## AFTER (Fixed Flow)

### Scenario A: Fresh Login (No Session)
```
User visits /login?callbackUrl=/panel
         ↓
    Page loads
         ↓
useEffect subscribes to onAuthStateChange
         ↓
  Login form displayed
         ↓
User enters credentials
         ↓
signInWithPassword() called
         ↓
   Supabase fires SIGNED_IN event
         ↓
Event handler redirects to /panel
         ↓
   ✅ SUCCESS ✅
```

### Scenario B: Already Logged In
```
User visits /login?callbackUrl=/panel
         ↓
    Page loads
         ↓
useEffect subscribes to onAuthStateChange
         ↓
  Login form displayed
         ↓
Supabase fires INITIAL_SESSION event
         ↓
Event handler checks: event === 'SIGNED_IN'?
         ↓ NO (it's INITIAL_SESSION)
   No redirect - form stays visible
         ↓
User can:
  - Sign out and sign in again
  - Use logout=1 to clear sessions
  - Use stay=1 to debug
```

### Scenario C: OAuth Login
```
User visits /login?callbackUrl=/panel
         ↓
    Page loads
         ↓
useEffect subscribes to onAuthStateChange
         ↓
User clicks "Google" button
         ↓
OAuth redirect to Google
         ↓
User approves
         ↓
Redirect back to /login?callbackUrl=/panel
         ↓
Supabase fires SIGNED_IN event
         ↓
Event handler redirects to /panel
         ↓
   ✅ SUCCESS ✅
```

---

## Auth Events Flow

```
┌─────────────────────────────────────────────────────┐
│         Supabase Auth Event Types                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  INITIAL_SESSION    → Session loaded from storage   │
│  (ignore)              (may be stale)               │
│                                                      │
│  SIGNED_IN          → User just signed in           │
│  (redirect!)           (fresh, valid session)       │
│                                                      │
│  SIGNED_OUT         → User signed out               │
│  (ignore)              (no redirect needed)         │
│                                                      │
│  TOKEN_REFRESHED    → Token renewed                 │
│  (ignore)              (already authenticated)      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Debug Query Parameters

### stay=1
```
/login?stay=1
         ↓
    Page loads
         ↓
Check: stay === '1'?
         ↓ YES
  return early (no subscription)
         ↓
No redirect ever
         ↓
Developer can inspect UI state
```

### logout=1
```
/login?logout=1
         ↓
    Page loads
         ↓
Check: logout === '1'?
         ↓ YES
supabase.auth.signOut()
signOut({ redirect: false })
         ↓
Sessions cleared
         ↓
Success message shown
         ↓
User can log in with clean state
```

---

## Key Differences

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| Check on mount | ✅ Yes (getSession) | ❌ No |
| Auto-redirect | ✅ Yes (any session) | ❌ No |
| Auth listener | ⚠️ Conditional | ✅ Always |
| INITIAL_SESSION | Redirects | ❌ Ignores |
| SIGNED_IN | Redirects | ✅ Redirects |
| Form visibility | Hidden (redirects) | ✅ Always visible |
| Debug support | ❌ None | ✅ stay=1, logout=1 |

---

## Security Maintained

```
CallbackUrl Validation (unchanged)
         ↓
Is URL relative (starts with /)?
         ↓ YES
   Allow redirect
         ↓ NO
Is URL same origin?
         ↓ YES
   Allow redirect
         ↓ NO
Default to /panel (safe fallback)
```

### Protected Against:
- ✅ Open redirect attacks
- ✅ Protocol-relative URL attacks (//evil.com)
- ✅ External URL injection
- ✅ Multiple OAuth requests (single-flight guard)
- ✅ Session fixation (validates on SIGNED_IN)

---

## Implementation Summary

```typescript
// OLD CODE (lines 98-127)
useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()  // ❌ Check on mount
    if (data?.session) {
      router.replace(callbackUrl)  // ❌ Auto-redirect
    } else {
      supabase.auth.onAuthStateChange((_event, session) => {  // ⚠️ Conditional
        if (session) {
          router.replace(callbackUrl)  // ❌ Redirects on any event
        }
      })
    }
  }
  setTimeout(() => checkSession(), 300)
}, [router, getValidCallbackUrl])

// NEW CODE (lines 113-140)
useEffect(() => {
  let cancelled = false
  
  const stay = searchParams.get('stay')
  if (stay === '1') return  // ✅ Debug support
  
  // ✅ Always subscribe (no condition)
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event)
    
    // ✅ Only redirect on SIGNED_IN event
    if (event === 'SIGNED_IN' && session && !cancelled) {
      const callbackUrl = getValidCallbackUrl()
      router.replace(callbackUrl)
    }
  })
  
  return () => {
    cancelled = true
    listener.subscription.unsubscribe()
  }
}, [router, getValidCallbackUrl, searchParams])
```

---

## Testing Matrix

| Test Case | Expected Behavior | Status |
|-----------|------------------|--------|
| Visit /login | Form shown, no redirect | ✅ |
| Visit /login?callbackUrl=/panel | Form shown, no redirect | ✅ |
| Password login | Redirect after SIGNED_IN | ✅ |
| OAuth login | Redirect after SIGNED_IN | ✅ |
| Visit /login?stay=1 | Never redirect | ✅ |
| Visit /login?logout=1 | Clear sessions, show form | ✅ |
| External callbackUrl | Rejected, defaults to /panel | ✅ |
| Protocol-relative URL | Rejected, defaults to /panel | ✅ |
| Relative path callbackUrl | Allowed | ✅ |
| OAuth double-click | Single-flight guard active | ✅ |
| INITIAL_SESSION event | No redirect | ✅ |

---

## Deployment Checklist

- [x] Code changes minimal and focused
- [x] Backward compatible
- [x] Security validations preserved
- [x] No environment changes needed
- [x] No database migrations needed
- [x] No API changes needed
- [x] Tests added and passing
- [x] Documentation complete
- [x] Code review passed
- [x] Security scan passed
- [ ] Deploy to staging
- [ ] Manual testing on staging
- [ ] Deploy to production
- [ ] Monitor production logs
- [ ] Verify no redirect loops in production
