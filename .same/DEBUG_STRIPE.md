# 🔍 Debug: Stripe Price IDs - Sprawdzenie

## Problem
Dodałeś zmienne do Vercel ale nadal błąd:
```
No such price: 'price_1SVWHUChaDkFJkJIAEZbXXei'
```

---

## ✅ Krok 1: Sprawdź Deployment w Vercel

1. Idź do: https://vercel.com/dashboard
2. Kliknij: **Deployments** (tab)
3. Sprawdź najnowszy deployment:
   - ✅ Status: **Ready** (zielony checkmark)
   - ⏳ Status: **Building** (czekaj 2-3 min)
   - ❌ Status: **Error** (sprawdź logi)

**Jeśli deployment NIE jest Ready:**
- Kliknij **"Redeploy"** ręcznie (3 kropki → Redeploy)
- Czekaj 2-3 minuty

---

## ✅ Krok 2: Sprawdź Stripe Dashboard

### A) Sprawdź tryb (Test vs Live)

1. Idź do: https://dashboard.stripe.com
2. Sprawdź **toggle w górnym prawym rogu**:
   - 🔵 **Test Mode** - dla testowania
   - 🟢 **Live Mode** - produkcja

### B) Sprawdź Price IDs

W Stripe Dashboard:
1. Idź do: **Products** → **Prices**
2. Znajdź Price ID: `price_1SVWHUChaDkFJkJIAEZbXXei`
3. Sprawdź:
   - ✅ Czy istnieje?
   - ✅ Czy jest w **Test Mode** czy **Live Mode**?

### C) Sprawdź Secret Key w Vercel

**WAŻNE:** Twój `STRIPE_SECRET_KEY` w Vercel MUSI być z tego samego trybu co Price IDs!

1. Idź do Stripe: **Developers** → **API Keys**
2. Skopiuj klucz:
   - **Test Mode:** `sk_test_...`
   - **Live Mode:** `sk_live_...`
3. Idź do Vercel: **Settings** → **Environment Variables**
4. Znajdź: `STRIPE_SECRET_KEY`
5. Sprawdź:
   - ❌ Jeśli masz `sk_test_...` ale Price IDs są w **Live Mode** → BŁĄD!
   - ❌ Jeśli masz `sk_live_...` ale Price IDs są w **Test Mode** → BŁĄD!
   - ✅ Muszą być z tego samego trybu!

---

## ✅ Krok 3: Napraw Mismatch (jeśli jest)

### Scenariusz 1: Price IDs są w Test Mode

Price IDs zaczynają się od `price_1SV...` - to są prawdopodobnie **test mode**.

**Rozwiązanie:**
1. Stripe Dashboard → Przełącz na **Test Mode**
2. Developers → API Keys
3. Skopiuj **Secret Key** (Test): `sk_test_...`
4. Vercel → Settings → Environment Variables
5. Edytuj `STRIPE_SECRET_KEY`
6. Wklej test secret key: `sk_test_...`
7. Zapisz
8. Redeploy

### Scenariusz 2: Price IDs są w Live Mode

**Rozwiązanie:**
1. Stripe Dashboard → Przełącz na **Live Mode**
2. Developers → API Keys
3. Skopiuj **Secret Key** (Live): `sk_live_...`
4. Vercel → Settings → Environment Variables
5. Edytuj `STRIPE_SECRET_KEY`
6. Wklej live secret key: `sk_live_...`
7. Zapisz
8. Redeploy

### Scenariusz 3: Price ID nie istnieje w Stripe

Jeśli Price ID `price_1SVWHUChaDkFJkJIAEZbXXei` **nie istnieje** w Stripe:

1. Sprawdź czy to był placeholder (test ID)
2. Musisz utworzyć prawdziwe Price IDs w Stripe
3. Zobacz: `.same/STRIPE_PRICE_IDS_SETUP.md`

---

## ✅ Krok 4: Ręczny Test

Po naprawieniu:

```bash
# Test lokalnie
curl http://localhost:3000/api/check-stripe-config

# Test na produkcji
curl https://smakowalo.pl/api/check-stripe-config
```

Powinno zwrócić:
```json
{
  "allConfigured": true,
  "missingCount": 0,
  "hasSecretKey": true
}
```

---

## ✅ Krok 5: Test płatności

1. Idź na: https://smakowalo.pl/kreator
2. Wybierz: 2 osoby × 3 dni
3. Przejdź do Step 7
4. Kliknij "Przejdź do płatności Stripe"
5. **Powinno przekierować do Stripe Checkout** ✅

---

## 🚨 Najczęstsze Problemy

| Problem | Rozwiązanie |
|---------|-------------|
| `No such price` | Secret Key i Price IDs z różnych trybów |
| `Invalid API key` | STRIPE_SECRET_KEY jest błędny |
| `Price not found` | Price ID nie istnieje w Stripe |
| Redirect loop | Deployment nie jest Ready |
| 500 error | Sprawdź Vercel Function Logs |

---

## 📝 Checklist Debug

- [ ] Vercel deployment jest **Ready**
- [ ] Wszystkie 12 `STRIPE_PRICE_*` są w Vercel
- [ ] Sprawdziłem tryb w Stripe (Test vs Live)
- [ ] `STRIPE_SECRET_KEY` w Vercel jest z tego samego trybu co Price IDs
- [ ] Price ID `price_1SVWHUChaDkFJkJIAEZbXXei` istnieje w Stripe
- [ ] Zrobiłem redeploy po zmianie Secret Key
- [ ] Przetestowałem `/api/check-stripe-config`
- [ ] Przetestowałem kreator checkout flow

---

## 🆘 Dalsze Debugowanie

**Vercel Function Logs:**
1. Vercel Dashboard → Project
2. Deployments → Najnowszy
3. Functions → `/api/create-subscription`
4. Sprawdź logi błędów

**Stripe Logs:**
1. Stripe Dashboard → Developers → Logs
2. Sprawdź ostatnie requesty
3. Szukaj błędów `No such price`

---

Powered by [Same.new](https://same.new)
