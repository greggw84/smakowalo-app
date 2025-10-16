# Panel Redirect Loop Fix - Dokumentacja

## 🐛 Problem

Strona `/panel` "skakała" w nieskończoność między:
- `https://www.smakowalo.pl/panel`
- `https://www.smakowalo.pl/login?callbackUrl=/panel`

Użytkownik nie mógł wejść na panel - strona ciągle się przekierowywała.

---

## 🔍 Przyczyna

### Sekwencja wydarzeń (pętla):

1. **Użytkownik wchodzi na `/panel`**
2. Panel sprawdza sesję → `status: 'loading'`
3. Po 1 sekundzie timeout → przekierowanie do `/login`
4. Login sprawdza sesję → `status: 'authenticated'`
5. Login przekierowuje z powrotem do `/panel`
6. **Powrót do punktu 1** → nieskończona pętla ♾️

### Główne problemy w kodzie:

#### Problem 1: Brak flagi "już przekierowano"
```typescript
// ❌ PRZED - przekierowywało wielokrotnie
useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/panel')  // Wywoływane wielokrotnie!
  }
}, [status, session, router])
```

#### Problem 2: Zbyt krótki timeout (1 sekunda)
```typescript
// ❌ PRZED - za krótko dla wolniejszych połączeń
const timer = setTimeout(() => {
  if (status === 'loading') {
    router.push('/login?callbackUrl=/panel')
  }
}, 1000) // Za krótko!
```

#### Problem 3: Natychmiastowe przekierowanie na /login
```typescript
// ❌ PRZED - przekierowywało natychmiast po załadowaniu
if (status === 'authenticated' && session) {
  window.location.href = callbackUrl  // Za szybko!
}
```

---

## ✅ Rozwiązanie

### Fix 1: Flaga `hasRedirected`
**Plik**: `src/app/panel/page.tsx`

```typescript
// ✅ PO - dodano flagę
const [hasRedirected, setHasRedirected] = useState(false)

useEffect(() => {
  // KLUCZOWE: Jeśli już przekierowano, nie rób nic
  if (hasRedirected) return

  if (status === 'unauthenticated') {
    console.log('🚫 Not authenticated - redirecting to login')
    setHasRedirected(true)  // Ustaw flagę
    router.push('/login?callbackUrl=/panel')  // Przekieruj TYLKO RAZ
    return
  }
}, [status, session, router, hasRedirected])
```

**Efekt**: Przekierowanie następuje tylko **raz**, nawet jeśli useEffect wywoła się wielokrotnie.

---

### Fix 2: Zwiększony timeout (1s → 2s)
**Plik**: `src/app/panel/page.tsx`

```typescript
// ✅ PO - 2 sekundy timeout
if (status === 'loading') {
  const timer = setTimeout(() => {
    console.warn('⚠️ Session loading timeout - redirecting to login')
    setSessionTimedOut(true)
    setHasRedirected(true)
    router.push('/login?callbackUrl=/panel')
  }, 2000) // 2 sekundy - lepiej dla wolniejszych połączeń

  return () => clearTimeout(timer)
}
```

**Efekt**: Wolniejsze połączenia mają więcej czasu na załadowanie sesji.

---

### Fix 3: Opóźnienie przekierowania (100ms)
**Plik**: `src/app/login/page.tsx`

```typescript
// ✅ PO - opóźnienie 100ms
useEffect(() => {
  if (status === 'authenticated' && session) {
    console.log('✅ User authenticated, redirecting to:', callbackUrl)
    // Małe opóźnienie aby sesja była w pełni załadowana
    const redirectTimer = setTimeout(() => {
      window.location.href = callbackUrl
    }, 100)  // 100ms opóźnienia
    return () => clearTimeout(redirectTimer)
  }
}, [session, status, callbackUrl])
```

**Efekt**: Sesja ma czas się ustabilizować przed przekierowaniem.

---

### Fix 4: Lepsze guardy w render
**Plik**: `src/app/panel/page.tsx`

```typescript
// ✅ PO - return null podczas przekierowania
if (hasRedirected || status === 'unauthenticated') {
  return null  // Nic nie renderuj podczas przekierowania
}

if (status === 'loading') {
  return <SkeletonUI />  // Pokaż skeleton
}

if (!session) {
  return null  // Bezpieczeństwo - nie powinno się zdarzyć
}

// Renderuj normalny panel tylko gdy authenticated
return <PanelContent />
```

**Efekt**: Użytkownik nie widzi "skakania" - strona jest pusta podczas przekierowania.

---

## 📊 Przed vs Po

| **Przed** | **Po** |
|-----------|--------|
| Nieskończona pętla ♾️ | Jedno przekierowanie ✅ |
| Timeout 1s | Timeout 2s ⏱️ |
| Natychmiastowe przekierowanie | 100ms opóźnienie 🕐 |
| Strona "skacze" 📱 | Płynne przejście ✨ |
| Wielokrotne redirecty | Flaga `hasRedirected` 🚩 |

---

## 🧪 Testy

### Test 1: Zalogowany użytkownik wchodzi na /panel
**Oczekiwany wynik**: Panel się pokazuje bez przekierowań ✅

### Test 2: Niezalogowany użytkownik wchodzi na /panel
**Oczekiwany wynik**:
1. Pokazuje skeleton na 1-2 sekundy
2. Przekierowuje do `/login?callbackUrl=/panel`
3. **TYLKO RAZ** - bez pętli ✅

### Test 3: Wolne połączenie
**Oczekiwany wynik**:
1. Skeleton pokazuje się przez 2 sekundy
2. Albo załaduje panel (jeśli sesja się załadowała)
3. Albo przekieruje do loginu (jeśli timeout) ✅

### Test 4: Odświeżenie strony na /panel
**Oczekiwany wynik**:
1. Skeleton na moment
2. Panel się pokazuje (jeśli zalogowany)
3. Brak pętli przekierowań ✅

---

## 🔧 Dodatkowe ulepszenia

### Console logs dla debugowania

```typescript
console.log('🔍 Panel - Status:', status, 'Session:', !!session, 'HasRedirected:', hasRedirected)
```

Możesz teraz zobaczyć w DevTools dokładnie co się dzieje:
- Status sesji (`loading`, `authenticated`, `unauthenticated`)
- Czy sesja istnieje
- Czy już nastąpiło przekierowanie

### Lepsze komunikaty błędów

```typescript
console.warn('⚠️ Session loading timeout - redirecting to login')
console.log('🚫 Not authenticated - redirecting to login')
console.log('✅ User authenticated, redirecting to:', callbackUrl)
```

---

## 📝 Podsumowanie zmian

### Zmiany w `src/app/panel/page.tsx`:
1. ✅ Dodano state `hasRedirected`
2. ✅ Uproszczono logikę useEffect
3. ✅ Zwiększono timeout z 1s do 2s
4. ✅ Dodano return null podczas przekierowania
5. ✅ Lepsze console logi

### Zmiany w `src/app/login/page.tsx`:
1. ✅ Dodano 100ms opóźnienie przed przekierowaniem
2. ✅ Cleanup timera w useEffect

---

## 🎯 Rezultat

**Status**: ✅ **NAPRAWIONE** w wersji v139

Strona `/panel`:
- ✅ Nie "skacze" między stronami
- ✅ Przekierowanie następuje tylko raz
- ✅ Płynne przejście dla użytkownika
- ✅ Działa na wolniejszych połączeniach
- ✅ Stabilne zachowanie

**Przetestuj na**: https://www.smakowalo.pl/panel
