# ⚡ Stripe Webhooks - Quick Start (5 minut)

**Cel:** Skonfigurować webhooks aby subskrypcje pojawiały się w Supabase

---

## 🎯 3 Kroki Do Wykonania

### Krok 1: Stripe API Keys (2 min)

1. **Otwórz:** https://dashboard.stripe.com
2. **Przełącz na:** Test Mode (toggle w prawym górnym rogu - niebieski)
3. **Idź do:** Developers → API Keys
4. **Skopiuj:**
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...` (kliknij "Reveal")

5. **Otwórz:** `.env.local` w projekcie
6. **Zamień linie 41-42:**
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_TWÓJ_KLUCZ_TUTAJ
   STRIPE_SECRET_KEY=sk_test_TWÓJ_SECRET_KEY_TUTAJ
   ```

---

### Krok 2: Utwórz Webhook (2 min)

1. **W Stripe Dashboard:** Developers → Webhooks
2. **Kliknij:** "+ Add endpoint"
3. **Endpoint URL:**
   ```
   https://www.smakowalo.pl/api/webhooks/stripe
   ```
   ⚠️ **Z** www! ⚠️ (bez www będzie przekierowanie 307!)

4. **Events:** Zaznacz te 7:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.trial_will_end`

5. **Kliknij:** "Add endpoint"

6. **Po utworzeniu:**
   - Kliknij na webhook (na liście)
   - Znajdź: "Signing secret"
   - Kliknij: "Reveal"
   - Skopiuj: `whsec_...`

7. **W `.env.local` zamień linię 43:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_TWÓJ_WEBHOOK_SECRET_TUTAJ
   ```

---

### Krok 3: Dodaj do Vercel (1 min)

1. **Otwórz:** https://vercel.com/dashboard
2. **Kliknij:** smakowalo-app
3. **Idź do:** Settings → Environment Variables
4. **Dodaj/Edytuj 3 zmienne:**

   ```
   STRIPE_PUBLISHABLE_KEY = pk_test_TWÓJ_KLUCZ
   STRIPE_SECRET_KEY = sk_test_TWÓJ_SECRET
   STRIPE_WEBHOOK_SECRET = whsec_TWÓJ_WEBHOOK_SECRET
   ```

5. **Dla każdej:** Zaznacz Production, Preview, Development
6. **Zapisz** każdą
7. **Zaczekaj** 2-3 minuty na auto-redeploy

---

## ✅ Testuj!

### Test 1: Sprawdź Konfigurację

Otwórz w przeglądarce:
```
https://smakowalo.pl/api/check-stripe-config
```

Powinno pokazać:
```json
{
  "allConfigured": true,
  "hasSecretKey": true,
  "hasWebhookSecret": true
}
```

### Test 2: Testowa Płatność

1. **Idź na:** https://smakowalo.pl/kreator
2. **Wybierz:** 2 osoby × 3 dni
3. **Przejdź** przez wszystkie 7 kroków
4. **Kliknij:** "Przejdź do płatności Stripe"
5. **W Stripe Checkout użyj testowej karty:**
   - Karta: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
6. **Kliknij:** "Pay"

### Test 3: Sprawdź Wyniki

#### A) Stripe Dashboard
- **Idź do:** Payments → Subscriptions
- **Sprawdź:** Czy jest nowy subscription ✅

#### B) Supabase
- **Idź do:** https://supabase.com/dashboard
- **Otwórz projekt:** quqgpixujzxujauhessa
- **Table Editor → subscriptions**
- **Sprawdź:** Czy jest nowy rekord ✅

#### C) Panel Użytkownika
- **Zaloguj się:** https://smakowalo.pl/panel
- **Zakładka:** Subskrypcja
- **Sprawdź:** Czy pokazuje aktywną subskrypcję ✅

---

## 🎉 Gotowe!

Jeśli wszystkie 3 testy przeszły ✅ - **webhooks działają!**

Każda kolejna płatność będzie **automatycznie** widoczna w Supabase.

---

## ❌ Jeśli Nie Działa

### Webhook zwraca error w Stripe Logs?

**Sprawdź:**
1. Czy `STRIPE_WEBHOOK_SECRET` w Vercel jest poprawny?
2. Czy Vercel deployment jest "Ready"?
3. Czy URL to `smakowalo.pl` (bez www)?

### Subskrypcja w Stripe ale nie w Supabase?

**Sprawdź:**
1. Vercel Function Logs: `/api/webhooks/stripe`
2. Czy `SUPABASE_SERVICE_ROLE_KEY` jest w Vercel?
3. Stripe Webhook Logs - czy status 200 OK?

### Dalsze problemy?

**Zobacz pełny guide:** `.same/WEBHOOK_SETUP_GUIDE.md`

---

Powered by [Same.new](https://same.new)
