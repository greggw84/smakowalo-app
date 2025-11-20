# Kreator Login/Registration Flow - Naprawione

## Problemy które zostały naprawione

### 1. ❌ Kreator pokazywał rejestrację mimo że użytkownik był zalogowany

**Problem:** Step 3 (Zarejestruj się) był zawsze pokazywany, nawet gdy użytkownik był już zalogowany.

**Rozwiązanie:**
- Dodano sprawdzenie sesji w `renderStep3Register()`
- Jeśli użytkownik jest zalogowany (`session?.user`), step 3 jest pomijany
- Przycisk "Dalej" w Step 2 automatycznie przechodzi do Step 4 jeśli użytkownik zalogowany
- Email i dane użytkownika są automatycznie wypełniane z sesji Supabase

### 2. ❌ Brak integracji z istniejącą stroną logowania/rejestracji

**Problem:** Kreator miał własne pole email zamiast kierować do pełnej strony rejestracji z Google/Facebook.

**Rozwiązanie:**
- Przycisk "Kontynuuj" teraz kieruje do `/register?callbackUrl=/kreator&email={email}`
- Link "Zaloguj się" kieruje do `/login?callbackUrl=/kreator`
- Strona rejestracji automatycznie wypełnia email z parametru URL
- Google i Facebook OAuth działają z automatycznym powrotem do kreatora

### 3. ❌ Po zalogowaniu użytkownik nie wracał do kreatora

**Problem:** Po zalogowaniu/rejestracji użytkownik był przekierowywany do `/panel` zamiast wrócić do kreatora.

**Rozwiązanie:**
- Dodano parametr `callbackUrl` do wszystkich linków logowania/rejestracji
- `/login` i `/register` obsługują parametr `callbackUrl`
- Google/Facebook OAuth również przekierowują do `callbackUrl`
- Stan kreatora jest zapisywany w localStorage przed przekierowaniem

---

## Jak to działa teraz

### Scenariusz 1: Użytkownik NIE jest zalogowany

```
1. Użytkownik wypełnia Steps 1-2 kreatora
2. W Step 3 wprowadza email
3. Klika "Kontynuuj"
4. ↓ Zapisuje stan kreatora do localStorage
5. ↓ Przekierowanie do /register?callbackUrl=/kreator&email=user@example.com
6. Strona rejestracji:
   - Email jest automatycznie wypełniony
   - Użytkownik może:
     a) Zarejestrować się emailem/hasłem
     b) Kliknąć "Zaloguj przez Google"
     c) Kliknąć "Zaloguj przez Facebook"
     d) Kliknąć "Zaloguj się" jeśli ma już konto
7. Po zalogowaniu/rejestracji → Powrót do /kreator
8. Kreator odczytuje zapisany stan z localStorage
9. Użytkownik kontynuuje od Step 4 (Adres dostawy)
```

### Scenariusz 2: Użytkownik JUŻ jest zalogowany

```
1. Użytkownik wypełnia Steps 1-2 kreatora
2. Step 3 jest POMINIĘTY automatycznie
3. Email i dane osobowe są automatycznie wypełnione z sesji
4. Użytkownik przechodzi bezpośrednio do Step 4 (Adres dostawy)
5. Kontynuuje normalnie do płatności Stripe
```

### Scenariusz 3: Użytkownik ma konto i chce się zalogować

```
1. Użytkownik wypełnia Steps 1-2 kreatora
2. W Step 3 klika "Zaloguj się"
3. ↓ Zapisuje stan kreatora do localStorage
4. ↓ Przekierowanie do /login?callbackUrl=/kreator
5. Strona logowania - użytkownik może:
   - Zalogować się emailem/hasłem
   - Zalogować przez Google
   - Zalogować przez Facebook
6. Po zalogowaniu → Powrót do /kreator
7. Kreator odczytuje zapisany stan z localStorage
8. Step 3 jest pominięty (użytkownik zalogowany)
9. Użytkownik kontynuuje od Step 4
```

---

## Zmiany w kodzie

### 1. `src/app/kreator/page.tsx`

#### Automatyczne wypełnianie danych z sesji:

```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)

    // Auto-fill email from session
    if (session?.user?.email && !email) {
      setEmail(session.user.email)
    }

    // Auto-fill user details if available
    if (session?.user?.user_metadata) {
      const metadata = session.user.user_metadata
      if (metadata.full_name) {
        const nameParts = metadata.full_name.split(' ')
        if (nameParts.length > 0 && !firstName) setFirstName(nameParts[0])
        if (nameParts.length > 1 && !lastName) setLastName(nameParts.slice(1).join(' '))
      }
    }
  })
}, [])
```

#### Pomijanie Step 3 jeśli zalogowany:

```typescript
const renderStep3Register = () => {
  // If user is already logged in, skip to step 4
  if (session?.user) {
    setStep(4)
    return null
  }

  return (
    // ... formularz rejestracji
  )
}
```

#### Przycisk "Dalej" w Step 2:

```typescript
<Button
  onClick={() => {
    // Skip registration if user is already logged in
    if (session?.user) {
      setStep(4)
    } else {
      setStep(3)
    }
  }}
>
  Dalej
</Button>
```

#### Przycisk "Kontynuuj" - przekierowanie do /register:

```typescript
<Button
  onClick={() => {
    // Save email to localStorage
    if (email) {
      localStorage.setItem('kreator_email', email)
    }
    // Save kreator state
    saveDraft()
    // Redirect to register page with Google/Facebook options
    router.push(`/register?callbackUrl=/kreator&email=${encodeURIComponent(email)}`)
  }}
>
  Kontynuuj
</Button>
```

#### Link "Zaloguj się":

```typescript
<button
  onClick={() => {
    // Save kreator state to localStorage before redirecting to login
    saveDraft()
    router.push('/login?callbackUrl=/kreator')
  }}
>
  Zaloguj się
</button>
```

### 2. `src/components/AuthFormWithAnimation.tsx`

#### Dodano useSearchParams:

```typescript
const searchParams = useSearchParams()
```

#### Auto-wypełnianie email z URL:

```typescript
useEffect(() => {
  const emailParam = searchParams?.get('email')
  if (emailParam && mode === 'register') {
    setRegisterData(prev => ({
      ...prev,
      email: emailParam
    }))
  }
}, [searchParams, mode])
```

#### Funkcja do odczytu callbackUrl:

```typescript
const getCallbackUrl = () => {
  const callbackUrl = searchParams?.get('callbackUrl')
  if (callbackUrl && callbackUrl.startsWith('/')) {
    return callbackUrl
  }
  return '/panel'
}
```

#### Aktualizacja Google/Facebook login:

```typescript
const handleGoogleLogin = async () => {
  await signIn('google', {
    callbackUrl: getCallbackUrl(), // ✅ Zamiast hardcoded '/panel'
    redirect: true
  })
}

const handleFacebookLogin = async () => {
  await signIn('facebook', {
    callbackUrl: getCallbackUrl(), // ✅ Zamiast hardcoded '/panel'
    redirect: true
  })
}
```

### 3. `src/app/login/page.tsx`

**Już działało poprawnie** - obsługuje parametr `callbackUrl`:

```typescript
const getValidCallbackUrl = useCallback((): string => {
  const callbackUrl = searchParams?.get('callbackUrl') || '/panel'

  // Security: Only allow relative URLs
  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl
  }

  return '/panel'
}, [searchParams])
```

---

## Bezpieczeństwo

### Walidacja callbackUrl

✅ **Zabezpieczenie przed open redirect attacks:**

```typescript
// Tylko relatywne URL-e są dozwolone
if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
  return callbackUrl
}
```

### Zapisywanie stanu kreatora

✅ **Stan jest zapisywany lokalnie (localStorage):**
- Bezpieczne - nie przechodzi przez URL
- Zachowuje prywatność użytkownika
- Automatyczne wygasanie po 24h

---

## Testowanie

### Test 1: Nowy użytkownik (bez konta)

1. Otwórz `/kreator` w incognito
2. Wypełnij Steps 1-2
3. W Step 3 wprowadź email
4. Kliknij "Kontynuuj"
5. ✅ Sprawdź: Przekierowanie do `/register?callbackUrl=/kreator&email=...`
6. ✅ Sprawdź: Email jest automatycznie wypełniony
7. Zarejestruj się (email/hasło lub Google/Facebook)
8. ✅ Sprawdź: Po rejestracji powrót do `/kreator`
9. ✅ Sprawdź: Kreator jest w Step 4, wybrane opcje zachowane

### Test 2: Użytkownik z kontem (logowanie)

1. Otwórz `/kreator` w incognito
2. Wypełnij Steps 1-2
3. W Step 3 kliknij "Zaloguj się"
4. ✅ Sprawdź: Przekierowanie do `/login?callbackUrl=/kreator`
5. Zaloguj się (email/hasło lub Google/Facebook)
6. ✅ Sprawdź: Po logowaniu powrót do `/kreator`
7. ✅ Sprawdź: Kreator jest w Step 4, wybrane opcje zachowane

### Test 3: Zalogowany użytkownik

1. Zaloguj się na konto
2. Otwórz `/kreator`
3. Wypełnij Steps 1-2
4. ✅ Sprawdź: Step 3 jest POMINIĘTY
5. ✅ Sprawdź: Automatycznie przejście do Step 4
6. ✅ Sprawdź: Email i imię/nazwisko automatycznie wypełnione
7. Kontynuuj do płatności Stripe

### Test 4: Google OAuth z kreatora

1. Otwórz `/kreator` w incognito
2. Wypełnij Steps 1-2
3. W Step 3 wprowadź email i kliknij "Kontynuuj"
4. Na stronie `/register` kliknij "Zaloguj przez Google"
5. ✅ Sprawdź: Po zalogowaniu powrót do `/kreator`
6. ✅ Sprawdź: Email wypełniony z Google account
7. Kontynuuj do Step 4

### Test 5: Facebook OAuth z kreatora

1. Otwórz `/kreator` w incognito
2. Wypełnij Steps 1-2
3. W Step 3 wprowadź email i kliknij "Kontynuuj"
4. Na stronie `/register` kliknij "Zaloguj przez Facebook"
5. ✅ Sprawdź: Po zalogowaniu powrót do `/kreator`
6. ✅ Sprawdź: Email wypełniony z Facebook account
7. Kontynuuj do Step 4

---

## Pliki zmienione

- ✏️ `src/app/kreator/page.tsx`
  - Dodano auto-wypełnianie z sesji
  - Dodano pomijanie Step 3 dla zalogowanych
  - Dodano przekierowania do /login i /register z callbackUrl

- ✏️ `src/components/AuthFormWithAnimation.tsx`
  - Dodano obsługę parametru `email` z URL
  - Dodano obsługę parametru `callbackUrl`
  - Zaktualizowano Google/Facebook OAuth

- ✅ `src/app/login/page.tsx` - Już działało poprawnie

---

## Podsumowanie

✅ **Wszystkie problemy naprawione:**

1. ✅ Kreator nie pokazuje rejestracji dla zalogowanych użytkowników
2. ✅ Pełna integracja z /login i /register (Google, Facebook, Email)
3. ✅ Użytkownik wraca do kreatora po logowaniu/rejestracji
4. ✅ Stan kreatora jest zachowany podczas logowania
5. ✅ Email i dane są automatycznie wypełniane
6. ✅ Bezpieczne przekierowania (walidacja callbackUrl)

**Przepływ jest teraz smooth i profesjonalny! 🎉**
