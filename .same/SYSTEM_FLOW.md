# 🔄 Smakowało - System Flow (Płatności + Webhooks)

## Jak Działa Cały System (Automatycznie)

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          1. UŻYTKOWNIK                              │
│                                                                     │
│  Wypełnia kreator (7 kroków) → Wybiera plan → Klik "Zapłać"        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    2. APLIKACJA NEXT.JS                             │
│                                                                     │
│  /api/create-subscription → Tworzy Stripe Checkout Session         │
│  → Przekierowuje do: checkout.stripe.com                           │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       3. STRIPE CHECKOUT                            │
│                                                                     │
│  Użytkownik płaci kartą → Stripe przetwarza płatność               │
│  → Tworzy subscription w Stripe                                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ↓
              ┌─────────────┴─────────────┐
              │                           │
              ↓                           ↓
┌──────────────────────┐    ┌──────────────────────────────────────┐
│  4a. REDIRECT        │    │  4b. STRIPE WEBHOOK                  │
│  (do użytkownika)    │    │  (do aplikacji - w tle)              │
│                      │    │                                      │
│  → /success          │    │  POST /api/webhooks/stripe           │
│  Użytkownik widzi:   │    │  Event: checkout.session.completed   │
│  "Płatność OK!"      │    │  Event: customer.subscription.created│
└──────────────────────┘    └────────────┬─────────────────────────┘
                                         │
                                         ↓
                            ┌────────────────────────────┐
                            │  5. WEBHOOK HANDLER        │
                            │  (src/app/api/webhooks/    │
                            │   stripe/route.ts)         │
                            │                            │
                            │  Przetwarza event:         │
                            │  1. Weryfikuje signature   │
                            │  2. Parsuje dane           │
                            │  3. Zapisuje do Supabase   │
                            │  4. Wysyła email           │
                            └────────────┬───────────────┘
                                         │
                                         ↓
                        ┌────────────────┴───────────────┐
                        │                                │
                        ↓                                ↓
          ┌──────────────────────┐         ┌─────────────────────┐
          │  6a. SUPABASE        │         │  6b. EMAIL (SMTP)   │
          │                      │         │                     │
          │  Tabela: subscriptions│        │  Wysyła do użytkownika:
          │  INSERT/UPDATE:       │        │  "Witaj w Smakowało!"│
          │  - user_id            │         │                     │
          │  - status: 'active'   │         │  Szablon: subscription_created
          │  - plan_type          │         │                     │
          │  - stripe_sub_id      │         │                     │
          │  - current_period_*   │         │                     │
          └──────────────────────┘         └─────────────────────┘
                        │
                        ↓
          ┌──────────────────────────────────┐
          │  7. PANEL UŻYTKOWNIKA            │
          │                                  │
          │  /panel → Zakładka Subskrypcja   │
          │  Pobiera dane z Supabase         │
          │  Wyświetla: ✅ Aktywna subskrypcja│
          └──────────────────────────────────┘
```

---

## 🔍 Szczegóły Kroków

### Krok 1: Użytkownik Wypełnia Kreator
**Strona:** `/kreator`
**Co się dzieje:**
- User wybiera: liczbę osób, dni, diety, dania
- User podaje: email, adres, dane kontaktowe
- User klika: "Przejdź do płatności Stripe"

---

### Krok 2: API Tworzy Checkout Session
**Endpoint:** `/api/create-subscription`
**Input:**
```json
{
  "numberOfPeople": 2,
  "numberOfDays": 3,
  "userId": "user_123",
  "userEmail": "user@example.com",
  "selectedMeals": [1, 2, 3]
}
```

**Proces:**
1. Pobiera Stripe Price ID z env vars
2. Tworzy/odnajduje Stripe Customer
3. Tworzy Stripe Checkout Session
4. Zwraca URL do checkout

**Output:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

### Krok 3: Stripe Przetwarza Płatność
**Gdzie:** Stripe Checkout Page
**Co się dzieje:**
1. User wpisuje dane karty
2. Stripe weryfikuje kartę
3. Stripe pobiera płatność
4. Stripe tworzy subscription object

---

### Krok 4a: Redirect Success
**Gdzie:** `/subscription/success?session_id=cs_test_...`
**Co widzi user:**
- ✅ "Płatność powiodła się!"
- 🎉 "Witamy w Smakowało!"
- 🔗 Link: "Przejdź do panelu"

---

### Krok 4b: Stripe Wysyła Webhooks
**Endpoint:** `https://www.smakowalo.pl/api/webhooks/stripe`

**Eventy (w kolejności):**
1. `checkout.session.completed` (po opłaceniu checkout)
2. `customer.subscription.created` (po utworzeniu subscription)
3. `invoice.payment_succeeded` (po udanej płatności)

**Każdy event zawiera:**
```json
{
  "id": "evt_...",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_...",
      "customer": "cus_...",
      "status": "active",
      "metadata": {
        "user_id": "user_123",
        "plan_type": "weekly"
      }
    }
  }
}
```

---

### Krok 5: Webhook Handler Przetwarza Event
**Plik:** `src/app/api/webhooks/stripe/route.ts`

**Proces:**
```typescript
1. Weryfikacja signature (STRIPE_WEBHOOK_SECRET)
   ↓
2. Parsowanie event type
   ↓
3. Switch na typ eventu:
   - checkout.session.completed → Log
   - customer.subscription.created → Upsert do Supabase + Email
   - customer.subscription.updated → Update w Supabase + Email
   - invoice.payment_succeeded → Update payment status
   ↓
4. Zwrócenie 200 OK do Stripe
```

**Dla `customer.subscription.created`:**
```typescript
async function handleSubscriptionCreated(subscription) {
  // 1. Pobierz user_id z metadata
  const userId = subscription.metadata.user_id

  // 2. Pobierz customer email ze Stripe
  const customer = await stripe.customers.retrieve(subscription.customer)
  const email = customer.email

  // 3. Upsert do Supabase
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status, // 'active', 'trialing', etc.
      plan_type: subscription.metadata.plan_type,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      // ... więcej pól
    })

  // 4. Wyślij email
  await sendEmail({
    to: email,
    subject: 'Witaj w Smakowało! 🎉',
    template: 'subscription_created',
    data: { planType: 'weekly', nextDelivery: '...' }
  })
}
```

---

### Krok 6a: Zapis do Supabase
**Tabela:** `subscriptions`

**Przykładowy rekord:**
```sql
INSERT INTO subscriptions (
  id,
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  plan_type,
  current_period_start,
  current_period_end,
  created_at
) VALUES (
  'uuid-123',
  'user-456',
  'sub_1ABC...',
  'cus_2DEF...',
  'active',
  'weekly',
  '2025-11-20 10:00:00',
  '2025-11-27 10:00:00',
  NOW()
);
```

---

### Krok 6b: Wysłanie Emaila
**SMTP:** Bluehost (cs347.bluehost.com)
**From:** no_reply@smakowalo.pl
**To:** user@example.com

**Szablon:**
```
Subject: Witaj w Smakowało! 🎉

Cześć!

Dziękujemy za dołączenie do Smakowało!

Twoja subskrypcja jest aktywna:
- Plan: Tygodniowy (2 osoby × 3 dni)
- Następna dostawa: 27.11.2025

Możesz zarządzać swoją subskrypcją w panelu:
https://smakowalo.pl/panel

Smacznego!
Zespół Smakowało
```

---

### Krok 7: Panel Użytkownika
**Strona:** `/panel` (zakładka Subskrypcja)

**Query do Supabase:**
```typescript
const { data } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .in('status', ['active', 'trialing', 'past_due'])
  .single()
```

**Wyświetla:**
- ✅ Status: Aktywna
- 📦 Plan: 2 osoby × 3 dni tygodniowo
- 📅 Następny okres: 20.11 - 27.11.2025
- 💳 Następna płatność: 27.11.2025 (270 zł)
- 🔗 Przyciski: Pauza, Anuluj, Zmień plan

---

## 🔄 Cykl Życia Subskrypcji

### 1. Utworzenie (Creation)
```
checkout.session.completed
  ↓
customer.subscription.created
  ↓
invoice.payment_succeeded
  ↓
Status: active ✅
```

### 2. Odnowienie (Renewal - co tydzień)
```
invoice.created (5 dni przed)
  ↓
invoice.payment_succeeded (w dniu odnowienia)
  ↓
customer.subscription.updated (nowy okres)
  ↓
Status: active ✅
```

### 3. Niepowodzenie Płatności (Payment Failed)
```
invoice.payment_failed
  ↓
Status: past_due ⚠️
  ↓
Email: "Płatność nie powiodła się"
  ↓
Stripe retry (3 próby)
  ↓
Jeśli fail: customer.subscription.deleted
```

### 4. Anulowanie (Cancellation)
```
User klika "Anuluj" w panelu
  ↓
API: POST /api/cancel-subscription
  ↓
Stripe: subscription.cancel_at_period_end = true
  ↓
customer.subscription.updated
  ↓
Status: active (do końca okresu) → potem canceled
```

### 5. Pauza (Pause)
```
User klika "Wstrzymaj" w panelu
  ↓
API: POST /api/pause-subscription
  ↓
Stripe: subscription.pause_collection
  ↓
customer.subscription.updated
  ↓
Status: paused ⏸️
```

---

## ⚙️ Konfiguracja Wymagana

### 1. Stripe API Keys
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 2. Stripe Webhook
- **URL:** `https://smakowalo.pl/api/webhooks/stripe`
- **Events:** 7 typów (checkout, subscription, invoice)
- **Secret:** `whsec_...`

### 3. Stripe Price IDs
```env
STRIPE_PRICE_2_2=price_1SVD45ChaDkFJkJI2DkNEpkK
STRIPE_PRICE_2_3=price_1SVWHUChaDkFJkJIAEZbXXei
# ... 12 kombinacji
```

### 4. Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://quqgpixujzxujauhessa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 5. SMTP (Email)
```env
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=...
```

---

## 🎯 Dlaczego Supabase Było Puste?

**Odpowiedź:** Bo nie było **prawidłowej konfiguracji webhooks!**

1. ❌ Brak `STRIPE_WEBHOOK_SECRET` w Vercel
2. ❌ Brak webhooka w Stripe Dashboard
3. ❌ Placeholder values w `.env.local`

**Po naprawie:**
1. ✅ Każda płatność → webhook
2. ✅ Webhook → zapis do Supabase
3. ✅ Zapis → widoczne w panelu
4. ✅ Automatyczny email

---

## 🚀 Następne Kroki

1. **Skonfiguruj webhooks** (`.same/WEBHOOK_QUICK_START.md`)
2. **Dodaj API keys do Vercel**
3. **Testuj płatność** (karta 4242...)
4. **Sprawdź Supabase** - powinien być rekord!
5. **Sprawdź email** - powinna przyjść wiadomość!

---

Powered by [Same.new](https://same.new)
