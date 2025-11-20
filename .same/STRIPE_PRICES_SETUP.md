# Stripe Subscription Prices - Setup Guide

## 📌 Przegląd

Aplikacja Smakowało oferuje 2 plany subskrypcji:
- **Basic Plan** (Podstawowy): 299 PLN/miesiąc - 3 posiłki tygodniowo
- **Premium Plan** (Premium): 449 PLN/miesiąc - 5 posiłków tygodniowo

Każda subskrypcja zawiera **7-dniowy okres próbny**.

---

## 🎯 Krok 1: Utwórz Produkty w Stripe Dashboard

### 1.1 Zaloguj się do Stripe Dashboard
https://dashboard.stripe.com/products

### 1.2 Utwórz Produkt: "Smakowało - Plan Podstawowy"

1. Kliknij **"+ Create product"**
2. Wypełnij:
   - **Name**: Smakowało - Plan Podstawowy
   - **Description**: 3 zdrowe posiłki tygodniowo + dostawa co tydzień
   - **Pricing model**: Recurring
   - **Price**: 299 PLN
   - **Billing period**: Monthly
   - **Trial period**: 7 days
3. **Save product**
4. **Skopiuj Price ID** (zaczyna się od `price_...`)
   - Przykład: `price_1QRaBcDeFgHiJkLmNoPqRsTu`

### 1.3 Utwórz Produkt: "Smakowało - Plan Premium"

1. Kliknij **"+ Create product"**
2. Wypełnij:
   - **Name**: Smakowało - Plan Premium
   - **Description**: 5 zdrowych posiłków tygodniowo + dostawa 2x w tygodniu + konsultacje
   - **Pricing model**: Recurring
   - **Price**: 449 PLN
   - **Billing period**: Monthly
   - **Trial period**: 7 days
3. **Save product**
4. **Skopiuj Price ID** (zaczyna się od `price_...`)

---

## 🔐 Krok 2: Dodaj Price IDs do Environment Variables

### Lokalne środowisko (.env.local)

```env
STRIPE_BASIC_PRICE_ID=price_xxxxxxxxxxxxx    # Wklej Basic Price ID
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxx  # Wklej Premium Price ID
```

### Production (Vercel)

1. Przejdź do: **Vercel Dashboard → Project Settings → Environment Variables**
2. Dodaj:
   - `STRIPE_BASIC_PRICE_ID` = `price_xxxxxxxxxxxxx`
   - `STRIPE_PREMIUM_PRICE_ID` = `price_xxxxxxxxxxxxx`
3. Wybierz środowisko: **Production, Preview, Development**
4. **Save** i **Redeploy**

---

## 🧪 Krok 3: Testowanie Subskrypcji

### Test Mode (Development)

1. Przejdź do: https://dashboard.stripe.com/test/products
2. Utwórz **testowe** produkty (tak samo jak wyżej, ale w Test Mode)
3. Użyj testowych Price IDs w `.env.local`
4. Testuj z kartą: `4242 4242 4242 4242` (test card)

### Lokalne testowanie

```bash
# Uruchom aplikację
bun run dev

# Przejdź do kreatora
http://localhost:3000/kreator

# Wybierz plan i kliknij "Subskrybuj"
# Sprawdź redirect do Stripe Checkout
```

### Testowanie webhooków

```bash
# Forward webhooks z Stripe do localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger customer.subscription.created
```

---

## 📊 Krok 4: Sprawdź Flow Subskrypcji

### Expected Flow:

1. **User** → Kreator → Wybiera plan → Klikasz "Subskrybuj"
2. **API** → `/api/create-subscription` → Tworzy Checkout Session
3. **Stripe** → Redirect do Stripe Checkout
4. **User** → Wypełnia dane karty
5. **Success** → Redirect do `/subscription/success?session_id=xxx`
6. **Webhook** → `customer.subscription.created` → Sync do Supabase
7. **Email** → Potwierdzenie subskrypcji (7-day trial)
8. **Panel** → User widzi aktywną subskrypcję

---

## ✅ Weryfikacja Konfiguracji

### Checklist:

- [ ] Produkty utworzone w Stripe Dashboard (Basic + Premium)
- [ ] Price IDs skopiowane poprawnie
- [ ] `.env.local` zaktualizowane z Price IDs
- [ ] Vercel env variables zaktualizowane
- [ ] Test Mode działa lokalnie
- [ ] Live Mode gotowe do produkcji
- [ ] Webhook endpoint skonfigurowany (`/api/webhooks/stripe`)
- [ ] Email notifications działają (SMTP Bluehost)

### Test Commands:

```bash
# Test subscription creation
curl -X POST http://localhost:3000/api/create-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "userId": "test-user-uuid",
    "userEmail": "test@example.com",
    "numberOfPeople": 2,
    "numberOfDays": 3,
    "selectedDiets": [1, 2],
    "selectedAllergies": ["gluten"],
    "selectedMeals": [1, 2, 3]
  }'
```

Spodziewany response:
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

## 🚨 Troubleshooting

### Błąd: "Stripe price configuration missing"
**Przyczyna:** Brak Price IDs w environment variables
**Rozwiązanie:**
- Sprawdź `.env.local` i upewnij się że są `STRIPE_BASIC_PRICE_ID` i `STRIPE_PREMIUM_PRICE_ID`
- Sprawdź czy Price IDs zaczynają się od `price_`

### Błąd: "No such price"
**Przyczyna:** Price ID nieprawidłowy lub z niewłaściwego środowiska (test vs live)
**Rozwiązanie:**
- Upewnij się że używasz **live** Price IDs z **live** Stripe keys
- Lub **test** Price IDs z **test** Stripe keys

### Checkout Session nie działa
**Przyczyna:** Nieprawidłowy success/cancel URL
**Rozwiązanie:**
- Sprawdź `NEXT_PUBLIC_SITE_URL` w `.env.local`
- Upewnij się że URLs są poprawne: `/subscription/success` i `/subscription/cancel`

### Webhook nie synchronizuje subskrypcji
**Przyczyna:** Brak webhook secret lub nieprawidłowa konfiguracja
**Rozwiązanie:**
- Sprawdź `STRIPE_WEBHOOK_SECRET` w `.env.local`
- Zweryfikuj webhook endpoint w Stripe Dashboard
- Sprawdź logi aplikacji: `✅ Webhook verified` powinno się pojawić

---

## 📝 Dodatkowe Informacje

### Promocje i Kupony

Stripe Checkout obsługuje kupony promocyjne automatycznie.
W Checkout Session ustawione jest: `allow_promotion_codes: true`

Aby utworzyć kupon:
1. Stripe Dashboard → **Coupons**
2. Create coupon (np. 20% off first month)
3. User może wpisać kod w Checkout

### Trial Period

Trial period (7 dni) jest ustawiony w:
- Stripe Checkout Session: `trial_period_days: 7`
- Produktach w Stripe Dashboard: Trial period = 7 days

User **nie płaci** przez pierwsze 7 dni.
Po 7 dniach, płatność automatyczna.

### Anulowanie Subskrypcji

User może anulować w panelu:
- **Natychmiast** → Stripe API: `cancel_at_period_end: false`
- **Na końcu okresu** → Stripe API: `cancel_at_period_end: true`

---

**Ostatnia aktualizacja:** Wersja 191
**Status:** ✅ Gotowe do konfiguracji
