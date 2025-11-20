# Subscription Flow - Kompletna Dokumentacja

## 📌 Przegląd

Aplikacja Smakowało oferuje pełny system zarządzania subskrypcjami oparty na Stripe Checkout:
- **Utworzenie subskrypcji** - kreator + Stripe Checkout
- **Zarządzanie** - pause, resume, cancel
- **Synchronizacja** - webhooks → Supabase
- **Powiadomienia** - email notifications (SMTP Bluehost)

---

## 🎯 Flow Diagram

```
┌─────────────┐
│   KREATOR   │
│  /kreator   │
└──────┬──────┘
       │
       │ 1. User wybiera plan (Basic/Premium)
       │ 2. Konfiguruje posiłki (diety, alergeny, dni, osoby)
       │ 3. Klika "Subskrybuj"
       │
       ▼
┌──────────────────────────────┐
│  POST /api/create-subscription│
│                               │
│  - Walidacja danych           │
│  - Utworzenie Stripe Customer │
│  - Utworzenie Checkout Session│
│  - Zapisanie config w Supabase│
└──────────┬───────────────────┘
           │
           │ Redirect do Stripe Checkout
           │
           ▼
┌─────────────────────┐
│  STRIPE CHECKOUT    │
│                     │
│  - Wypełnienie karty│
│  - 7-day trial      │
│  - Billing address  │
└──────────┬──────────┘
           │
           ├─── SUCCESS ───┐
           │               │
           │               ▼
           │     ┌──────────────────────┐
           │     │ /subscription/success│
           │     │ session_id=cs_...    │
           │     │                      │
           │     │ - Potwierdzenie UI   │
           │     │ - Redirect → /panel  │
           │     └──────────────────────┘
           │
           └─── CANCEL ───┐
                          │
                          ▼
                ┌─────────────────────┐
                │ /subscription/cancel│
                │                     │
                │ - Info anulowania   │
                │ - Retry option      │
                └─────────────────────┘

WEBHOOK FLOW (równolegle):
═══════════════════════════════

Stripe Event → POST /api/webhooks/stripe
                     │
                     ├─ customer.subscription.created
                     │    ├─ Sync to Supabase
                     │    └─ Email: "Witaj w Smakowało!"
                     │
                     ├─ customer.subscription.updated
                     │    ├─ Update status
                     │    └─ Email: (pause/resume/cancel)
                     │
                     ├─ invoice.payment_succeeded
                     │    └─ Email: "Płatność potwierdzona"
                     │
                     └─ invoice.payment_failed
                          └─ Email: "Problem z płatnością"
```

---

## 🔧 Komponenty Systemu

### 1. API Endpoint: `/api/create-subscription`

**Lokalizacja:** `src/app/api/create-subscription/route.ts`

**Request:**
```json
{
  "planId": "basic" | "premium",
  "planType": "weekly",
  "userId": "uuid-from-supabase",
  "userEmail": "user@example.com",
  "numberOfPeople": 2,
  "numberOfDays": 3,
  "selectedDiets": [1, 2, 3],
  "selectedAllergies": ["gluten", "mleko"],
  "selectedMeals": [101, 102, 103]
}
```

**Response (Success):**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Response (Error):**
```json
{
  "error": "Missing required fields: planId, userId, userEmail"
}
```

**Co robi:**
1. Waliduje dane wejściowe
2. Tworzy lub pobiera Stripe Customer
3. Przygotowuje meal plan config
4. Tworzy Stripe Checkout Session z trial_period_days=7
5. Zapisuje config tymczasowo w Supabase (status: 'incomplete')
6. Zwraca URL do Stripe Checkout

---

### 2. Success Page: `/subscription/success`

**Lokalizacja:** `src/app/subscription/success/page.tsx`

**Query Params:**
- `session_id` - ID sesji Stripe Checkout (cs_...)

**Co pokazuje:**
- ✅ Potwierdzenie utworzenia subskrypcji
- ℹ️ Info o 7-dniowym trial
- ℹ️ Info o pierwszej dostawie
- 🔗 Link do panelu użytkownika
- 🔗 Link do menu

---

### 3. Cancel Page: `/subscription/cancel`

**Lokalizacja:** `src/app/subscription/cancel/page.tsx`

**Co pokazuje:**
- ⚠️ Info o anulowaniu
- 💡 Sugestie co dalej (retry, zmiana planu, kontakt)
- 🔗 Link do kreatora (spróbuj ponownie)
- 🔗 Link do strony głównej

---

### 4. Kreator Integration

**Lokalizacja:** `src/app/kreator/page.tsx`

**Funkcja:** `handleSubscriptionPayment()`

**Co robi:**
1. Sprawdza autentykację użytkownika
2. Waliduje wybór planu
3. Pobiera user ID z Supabase Auth
4. Przygotowuje payload z meal plan config
5. Wywołuje `/api/create-subscription`
6. Zapisuje preferencje użytkownika
7. Redirect do Stripe Checkout

**Stan loading:** `isProcessingPayment`

---

### 5. Webhook Handler: `/api/webhooks/stripe`

**Lokalizacja:** `src/app/api/webhooks/stripe/route.ts`

**Obsługiwane eventy:**

#### `customer.subscription.created`
- Zapisuje subskrypcję w Supabase (status: 'active' lub 'trialing')
- Wysyła email powitalny
- Metadata: user_id, plan_type, meal_plan_config

#### `customer.subscription.updated`
- Aktualizuje status subskrypcji
- Wykrywa zmiany (pause/resume/cancel)
- Wysyła odpowiedni email

#### `customer.subscription.deleted`
- Ustawia status: 'canceled'
- Aktualizuje canceled_at timestamp

#### `invoice.payment_succeeded`
- Aktualizuje last_payment_status: 'succeeded'
- Wysyła email z linkiem do faktury

#### `invoice.payment_failed`
- Aktualizuje last_payment_status: 'failed'
- Wysyła email z info o retry

#### `customer.subscription.trial_will_end`
- Wysyła email 3 dni przed końcem trial

---

## 📊 Baza Danych: Subscriptions Table

**Tabela:** `subscriptions`

**Kluczowe pola:**

```sql
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- Stripe
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- Status
  status TEXT DEFAULT 'active',
  plan_type TEXT,

  -- Meal Plan Config
  people INTEGER DEFAULT 2,
  days INTEGER DEFAULT 3,
  meal_plan_config JSONB DEFAULT '{}',
  diets JSONB DEFAULT '[]',
  allergies JSONB DEFAULT '[]',
  selected_meals JSONB DEFAULT '[]',

  -- Delivery
  next_delivery_date DATE,
  delivery_frequency TEXT DEFAULT 'weekly',

  -- Billing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  pause_until DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Users can SELECT/INSERT/UPDATE/DELETE own subscriptions
- Policy: `auth.uid() = user_id`

---

## 🧪 Testing Guide

### Test 1: Subscription Creation (Local)

```bash
# 1. Start dev server
bun run dev

# 2. Open kreator
http://localhost:3000/kreator

# 3. Select plan (Basic or Premium)
# 4. Configure meals
# 5. Click "Subskrybuj"
# 6. Login if needed
# 7. Redirect to Stripe Checkout

# 8. Use test card:
#    4242 4242 4242 4242
#    Exp: 12/34
#    CVC: 123
```

**Expected:**
- ✅ Redirect to `/subscription/success?session_id=cs_test_...`
- ✅ Email: "Witaj w Smakowało!" sent
- ✅ Subscription in Supabase with status: 'trialing'

---

### Test 2: Pause Subscription

```bash
# 1. Login to panel
http://localhost:3000/panel

# 2. Navigate to Subskrypcje tab
# 3. Click "Wstrzymaj subskrypcję"
# 4. Select pause duration (14 days)
# 5. Confirm
```

**Expected:**
- ✅ Status updated in Supabase: pause_until = date
- ✅ Stripe subscription paused (pause_collection)
- ✅ Email: "Subskrypcja wstrzymana" sent
- ✅ Webhook: customer.subscription.updated

---

### Test 3: Resume Subscription

```bash
# 1. In panel, click "Wznów subskrypcję"
# 2. Confirm
```

**Expected:**
- ✅ Status updated: pause_until = null
- ✅ Stripe subscription resumed
- ✅ Email: "Subskrypcja wznowiona" sent
- ✅ Webhook: customer.subscription.updated

---

### Test 4: Cancel Subscription (End of Period)

```bash
# 1. In panel, click "Anuluj subskrypcję"
# 2. Choose "Na końcu okresu rozliczeniowego"
# 3. Confirm
```

**Expected:**
- ✅ cancel_at_period_end = true
- ✅ Stripe: subscription.cancel_at_period_end = true
- ✅ Email: "Subskrypcja anulowana" sent
- ✅ Subscription stays active until current_period_end

---

### Test 5: Cancel Subscription (Immediately)

```bash
# 1. In panel, click "Anuluj natychmiast"
# 2. Confirm
```

**Expected:**
- ✅ Status: 'canceled'
- ✅ canceled_at = now
- ✅ Stripe: subscription canceled immediately
- ✅ Email: "Subskrypcja anulowana" sent
- ✅ Webhook: customer.subscription.deleted

---

## 🔐 Environment Variables

**Required:**

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX...

# Stripe Price IDs
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Site
NEXT_PUBLIC_SITE_URL=https://smakowalo.pl

# SMTP (for emails)
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=...
SMTP_FROM_EMAIL=no_reply@smakowalo.pl
SMTP_FROM_NAME=Smakowalo.pl
```

---

## 🚨 Troubleshooting

### Error: "Stripe price configuration missing"

**Przyczyna:** Brak Price IDs w .env.local

**Rozwiązanie:**
1. Zaloguj się do Stripe Dashboard
2. Utwórz produkty (Basic + Premium)
3. Skopiuj Price IDs
4. Dodaj do `.env.local`
5. Restart dev server

---

### Error: "User not authenticated"

**Przyczyna:** Brak sesji użytkownika

**Rozwiązanie:**
- Zaloguj się przed przejściem do kreatora
- Sprawdź czy Supabase auth działa poprawnie
- Sprawdź session w localStorage (`smakowalo_auth`)

---

### Subscription nie synchronizuje się

**Przyczyna:** Webhook nie działa lub brak metadata

**Rozwiązanie:**
1. Sprawdź webhook endpoint: `/api/webhooks/stripe`
2. Sprawdź `STRIPE_WEBHOOK_SECRET`
3. Sprawdź logi w Stripe Dashboard → Webhooks
4. Upewnij się że metadata zawiera `user_id`

---

### Email nie wysłany

**Przyczyna:** SMTP błąd lub brak konfiguracji

**Rozwiązanie:**
1. Sprawdź `.env.local` - SMTP credentials
2. Test SMTP: `GET /api/test-email?to=your@email.com`
3. Sprawdź logi aplikacji: `✅ Email sent` lub `❌ SMTP error`
4. Zobacz dokumentację: `.same/SMTP_SETUP.md`

---

## ✅ Production Checklist

- [ ] Stripe Products utworzone (Basic + Premium)
- [ ] Price IDs dodane do Vercel env variables
- [ ] Webhook endpoint dodany w Stripe Dashboard
- [ ] Webhook secret dodany do env variables
- [ ] SMTP Bluehost skonfigurowany
- [ ] Supabase migrations uruchomione w production
- [ ] RLS policies zweryfikowane
- [ ] Email templates przetestowane
- [ ] Test subscription creation (end-to-end)
- [ ] Test pause/resume flow
- [ ] Test cancel flow (immediate + end of period)

---

## 📚 Dokumentacja Powiązana

- `.same/STRIPE_WEBHOOKS.md` - Webhook configuration
- `.same/STRIPE_PRICES_SETUP.md` - Prices setup guide
- `.same/SMTP_SETUP.md` - Email configuration
- `.same/SUBSCRIPTION_MANAGEMENT.md` - Panel user guide

---

**Ostatnia aktualizacja:** Wersja 191
**Status:** ✅ Implementacja ukończona
**Następny krok:** Utworzenie Stripe Price IDs i testing
