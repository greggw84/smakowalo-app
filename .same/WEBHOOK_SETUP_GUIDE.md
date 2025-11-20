# 🎯 Stripe Webhooks - Kompletny Setup Guide

**WAŻNE:** Bez prawidłowej konfiguracji webhooks subskrypcje NIE będą się synchronizować z Supabase!

---

## ✅ Krok 1: Pobierz Stripe API Keys

### A) Otwórz Stripe Dashboard
1. Idź do: https://dashboard.stripe.com
2. Zaloguj się
3. **Przełącz na Test Mode** (toggle w górnym prawym rogu - niebieski)

### B) Pobierz API Keys
1. Kliknij: **Developers** (lewy sidebar)
2. Kliknij: **API Keys**
3. Skopiuj:
   - **Publishable key:** `pk_test_...` (51 znaków)
   - **Secret key:** `sk_test_...` (kliknij "Reveal live key")

### C) Dodaj do `.env.local`

Otwórz `.env.local` i zamień placeholder values:

```env
# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_test_TWOJ_PRAWDZIWY_KLUCZ_TUTAJ
STRIPE_SECRET_KEY=sk_test_TWOJ_PRAWDZIWY_SECRET_KEY_TUTAJ
```

### D) Dodaj do Vercel

1. Idź do: https://vercel.com/dashboard
2. Kliknij na projekt: **smakowalo-app**
3. Settings → Environment Variables
4. Dodaj/edytuj:
   - `STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
   - `STRIPE_SECRET_KEY` = `sk_test_...`
5. Environments: Production, Preview, Development
6. Save

---

## ✅ Krok 2: Skonfiguruj Webhook w Stripe

### A) Utwórz Webhook Endpoint

1. W Stripe Dashboard: **Developers** → **Webhooks**
2. Kliknij: **"Add endpoint"** (lub "+ Add an endpoint")

### B) Wprowadź Endpoint URL

```
https://www.smakowalo.pl/api/webhooks/stripe
```

**WAŻNE:**
- ✅ `www.smakowalo.pl/api/webhooks/stripe` (poprawne - Z www!)
- ❌ `smakowalo.pl/api/webhooks/stripe` (złe - przekierowanie 307!)
- ❌ `www.smakowalo.pl/api/webhook/stripe` (złe - webhook bez "s")

### C) Wybierz Eventi (Events to Listen)

Zaznacz **te konkretne eventy**:

```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
✅ customer.subscription.trial_will_end
```

**Lub szybciej:** Wybierz "Select all customer events" i "Select all invoice events"

### D) Zapisz Webhook

1. Kliknij **"Add endpoint"**
2. Stripe utworzy webhook i pokaże **Signing Secret**

---

## ✅ Krok 3: Dodaj Webhook Secret

### A) Skopiuj Webhook Secret

Po utworzeniu webhooka:
1. Kliknij na webhook (na liście webhooks)
2. Znajdź sekcję: **"Signing secret"**
3. Kliknij: **"Reveal"** (lub "Click to reveal")
4. Skopiuj: `whsec_...` (ok. 50 znaków)

### B) Dodaj do `.env.local`

```env
STRIPE_WEBHOOK_SECRET=whsec_TWOJ_PRAWDZIWY_WEBHOOK_SECRET_TUTAJ
```

### C) Dodaj do Vercel

1. Vercel Dashboard → Settings → Environment Variables
2. Dodaj/edytuj:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (Twój secret)
   - Environments: Production, Preview, Development
3. Save
4. **Redeploy** (Vercel zrobi to automatycznie)

---

## ✅ Krok 4: Testuj Webhook

### A) Test przez Stripe CLI (Lokalnie)

Jeśli testujesz lokalnie (localhost:3000):

```bash
# Zainstaluj Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# lub pobierz z: https://stripe.com/docs/stripe-cli

# Zaloguj się
stripe login

# Forward eventy do localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# W innym terminalu: trigger test event
stripe trigger checkout.session.completed
```

### B) Test przez Stripe Dashboard (Produkcja)

1. W Stripe: Developers → Webhooks
2. Kliknij na swój webhook endpoint
3. Kliknij: **"Send test webhook"**
4. Wybierz event: `customer.subscription.created`
5. Kliknij: **"Send test webhook"**

### C) Sprawdź Logi

#### W Stripe:
- Developers → Webhooks → (kliknij webhook) → **"Logs"**
- Powinno pokazać: ✅ Status 200 OK

#### W Vercel:
- Dashboard → Deployments → (najnowszy) → **Functions**
- Kliknij: `/api/webhooks/stripe`
- Sprawdź logi - powinny być:
  ```
  ✅ Webhook verified: customer.subscription.created
  ✅ Subscription created and synced
  ```

#### W Supabase:
- Idź do: https://supabase.com/dashboard
- Otwórz projekt: `quqgpixujzxujauhessa`
- Table Editor → `subscriptions`
- **Powinien być nowy rekord!** ✅

---

## ✅ Krok 5: Testuj Pełny Flow (End-to-End)

### A) Użyj Testowej Karty Stripe

1. Idź na: https://smakowalo.pl/kreator
2. Wybierz plan (np. 2 osoby × 3 dni)
3. Przejdź przez wszystkie 7 kroków
4. W Step 7 kliknij: "Przejdź do płatności Stripe"
5. Zostaniesz przekierowany do Stripe Checkout
6. Użyj testowej karty:
   - **Numer karty:** `4242 4242 4242 4242`
   - **Expiry:** `12/34` (dowolna przyszła data)
   - **CVC:** `123` (dowolne 3 cyfry)
   - **ZIP:** `12345` (dowolny)
7. Kliknij: "Pay"

### B) Co Powinno Się Stać (Automatycznie!)

**Po 2-5 sekundach:**

1. ✅ **Stripe wysyła webhook** do `smakowalo.pl/api/webhooks/stripe`
2. ✅ **Webhook handler** przetwarza event `checkout.session.completed`
3. ✅ **Stripe wysyła kolejny webhook:** `customer.subscription.created`
4. ✅ **Handler zapisuje do Supabase:**
   - Tabela: `subscriptions`
   - Dane: user_id, plan, status, daty, etc.
5. ✅ **Email wysyłany** przez SMTP: "Witaj w Smakowało!"
6. ✅ **Redirect** do `/subscription/success`

### C) Sprawdź Wyniki

#### 1. Stripe Dashboard
- Payments → Subscriptions
- Powinien być nowy subscription ✅

#### 2. Supabase Database
- Table Editor → `subscriptions`
- Powinien być nowy rekord z:
  - `status: 'active'` lub `'trialing'`
  - `user_id: ...`
  - `stripe_subscription_id: sub_...`

#### 3. Email
- Sprawdź skrzynkę email użytkownika
- Powinien przyjść: "Witaj w Smakowało! 🎉"

#### 4. Panel Użytkownika
- Zaloguj się na: https://smakowalo.pl/panel
- Zakładka: **Subskrypcja**
- Powinno pokazać: ✅ Aktywna subskrypcja

---

## 🔍 Troubleshooting

### Problem: Webhook zwraca 401 Unauthorized

**Rozwiązanie:**
- Sprawdź czy `STRIPE_WEBHOOK_SECRET` w Vercel jest poprawny
- Upewnij się że skopiowałeś CAŁY secret (około 50 znaków)
- Redeploy Vercel

### Problem: Webhook zwraca 500 Internal Error

**Rozwiązanie:**
- Sprawdź Vercel Function Logs
- Sprawdź czy `SUPABASE_SERVICE_ROLE_KEY` jest dodany do Vercel
- Sprawdź czy tabela `subscriptions` istnieje w Supabase

### Problem: Subskrypcja w Stripe ale nie w Supabase

**Rozwiązanie:**
- Sprawdź Stripe Webhook Logs - czy status 200 OK?
- Sprawdź czy wszystkie 7 eventów są dodane do webhooka
- Sprawdź Vercel Function Logs pod `/api/webhooks/stripe`

### Problem: Brak emaila po płatności

**Rozwiązanie:**
- Sprawdź czy `SMTP_*` zmienne są w Vercel
- Sprawdź Vercel Function Logs - czy email był wysłany?
- Sprawdź folder SPAM

---

## 📋 Checklist - Sprawdź Czy Wszystko Jest Gotowe

Przed testowaniem upewnij się że:

### Stripe API Keys
- [ ] `STRIPE_PUBLISHABLE_KEY` w `.env.local` (pk_test_...)
- [ ] `STRIPE_SECRET_KEY` w `.env.local` (sk_test_...)
- [ ] Oba klucze dodane do Vercel Environment Variables

### Stripe Webhook
- [ ] Webhook utworzony w Stripe Dashboard
- [ ] URL: `https://smakowalo.pl/api/webhooks/stripe` (bez www!)
- [ ] 7 eventów zaznaczonych (checkout, subscription, invoice)
- [ ] Webhook Secret skopiowany

### Webhook Secret
- [ ] `STRIPE_WEBHOOK_SECRET` w `.env.local` (whsec_...)
- [ ] Dodany do Vercel Environment Variables
- [ ] Vercel redeploy wykonany

### Stripe Price IDs
- [ ] Wszystkie 12 `STRIPE_PRICE_*` zmiennych w Vercel
- [ ] Zweryfikowane przez `/api/check-stripe-config`

### Supabase
- [ ] Tabela `subscriptions` istnieje
- [ ] `SUPABASE_SERVICE_ROLE_KEY` w Vercel

### Email (SMTP)
- [ ] Wszystkie `SMTP_*` zmienne w Vercel
- [ ] Email testowy wysłany

### Test Payment
- [ ] Kreator flow działa (wszystkie 7 kroków)
- [ ] Redirect do Stripe Checkout działa
- [ ] Test payment z kartą 4242... przeszedł pomyślnie
- [ ] Webhook otrzymany (status 200 w Stripe Logs)
- [ ] Subskrypcja w Supabase ✅
- [ ] Email otrzymany ✅
- [ ] Panel użytkownika pokazuje subskrypcję ✅

---

## 🎉 Gotowe!

Po wykonaniu wszystkich kroków Twój system będzie **w pełni automatyczny**:

- ✅ Płatności przez Stripe
- ✅ Automatyczna synchronizacja z Supabase
- ✅ Automatyczne emaile
- ✅ Panel użytkownika z subskrypcją
- ✅ Obsługa trial periods, cancellations, updates

**Każde kolejne zamówienie będzie automatycznie widoczne w Supabase!** 🚀

---

## 📚 Dodatkowe Zasoby

- Stripe Webhooks Docs: https://stripe.com/docs/webhooks
- Stripe Test Cards: https://stripe.com/docs/testing
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Webhook Events Reference: https://stripe.com/docs/api/events/types

---

Powered by [Same.new](https://same.new)
