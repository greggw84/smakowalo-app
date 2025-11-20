# Quick Testing Guide - Subscription Flow

## ⚡ Quick Start

### KROK 1: Utwórz Stripe Price IDs (TEST MODE)

1. **Zaloguj się do Stripe Dashboard (Test Mode)**
   https://dashboard.stripe.com/test/products

2. **Utwórz produkt "Basic Plan"**
   - Kliknij **"+ Add product"**
   - Name: `Smakowało - Plan Podstawowy (TEST)`
   - Description: `3 posiłki tygodniowo (TEST MODE)`
   - Pricing model: **Recurring**
   - Price: `299` PLN
   - Billing period: **Monthly**
   - Add pricing → **Add trial period: 7 days**
   - **Save**
   - **Copy Price ID** (np. `price_1QRaBcDeFgHiJkLmNoPqRsTu`)

3. **Utwórz produkt "Premium Plan"**
   - Name: `Smakowało - Plan Premium (TEST)`
   - Description: `5 posiłków tygodniowo (TEST MODE)`
   - Price: `449` PLN
   - Billing period: **Monthly**
   - Add trial period: **7 days**
   - **Save**
   - **Copy Price ID**

---

### KROK 2: Zaktualizuj .env.local

```bash
# Otwórz .env.local i dodaj Price IDs:
STRIPE_BASIC_PRICE_ID=price_1QRaBcDeFgHiJkLmNoPqRsTu    # <-- wklej Basic Price ID
STRIPE_PREMIUM_PRICE_ID=price_1XyZaBcDeFgHiJkLmNoPqRs   # <-- wklej Premium Price ID
```

**WAŻNE:** Używaj **TEST** Price IDs z TEST Mode w Stripe!

---

### KROK 3: Restart Dev Server

```bash
# Ctrl+C (stop server)
bun run dev
```

---

### KROK 4: Test Subscription Creation

1. **Otwórz kreator**
   ```
   http://localhost:3000/kreator
   ```

2. **Wybierz tryb: SUBSKRYPCJA**

3. **KROK 1: Wybierz plan**
   - Kliknij na **Basic** lub **Premium**
   - Kliknij **"Dalej"**

4. **KROK 2: Skonfiguruj preferencje**
   - Liczba osób: 2
   - Liczba dni: 3
   - Wybierz diety (np. Wegetariańska)
   - Wybierz alergeny (opcjonalne)
   - Kliknij **"Dalej"**

5. **KROK 3: Wybierz dania**
   - Wybierz 3-5 dań
   - Sprawdź podsumowanie
   - Kliknij **"Subskrybuj"**

6. **Login (jeśli nie zalogowany)**
   - Email: `test@example.com`
   - Password: `password123`
   - Lub utwórz nowe konto

7. **Stripe Checkout**
   - Powinien nastąpić redirect do Stripe
   - Użyj testowej karty:
     ```
     Numer: 4242 4242 4242 4242
     Exp: 12/34
     CVC: 123
     ZIP: 12345
     ```
   - **Complete payment**

8. **Success Page**
   - Redirect do `/subscription/success?session_id=cs_test_...`
   - Powinno pokazać ✅ potwierdzenie
   - Kliknij **"Przejdź do panelu"**

9. **Sprawdź Panel**
   ```
   http://localhost:3000/panel
   ```
   - Zakładka **"Subskrypcje"**
   - Powinna być widoczna nowa subskrypcja
   - Status: **"Trialing"** lub **"Active"**

---

### KROK 5: Sprawdź Supabase

1. **Zaloguj się do Supabase Dashboard**
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Table Editor → `subscriptions`**
   - Znajdź swój user_id
   - Sprawdź pola:
     - `status`: `trialing` lub `active`
     - `stripe_subscription_id`: `sub_...`
     - `meal_plan_config`: JSON z konfiguracją
     - `people`, `days`, `diets`, `allergies`

---

### KROK 6: Sprawdź Stripe Dashboard

1. **Stripe Dashboard → Customers**
   https://dashboard.stripe.com/test/customers

2. **Znajdź customer email** (test@example.com)

3. **Kliknij customer → Subscriptions**
   - Status: **Trialing** (7 days)
   - Plan: Basic lub Premium
   - Trial ends: +7 dni od dzisiaj

---

### KROK 7: Test Webhooks (Opcjonalne)

```bash
# Terminal 1: Dev server
bun run dev

# Terminal 2: Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

**Sprawdź logi aplikacji:**
```
✅ Webhook verified: customer.subscription.created
📦 Subscription created: sub_...
✅ Subscription created and synced
```

---

### KROK 8: Test Email Notifications (Opcjonalne)

**Sprawdź czy email został wysłany:**

1. **Check application logs:**
   ```
   ✅ Email sent successfully via SMTP: <messageId> to: test@example.com
   ```

2. **Check inbox** (test@example.com)
   - Subject: **"Witaj w Smakowało! 🎉"**
   - Body: Info o subskrypcji + 7-day trial

3. **If email didn't arrive:**
   - Check SMTP config in `.env.local`
   - Test manually: `GET /api/test-email?to=test@example.com`
   - See `.same/SMTP_SETUP.md`

---

## 🧪 Test Cases

### ✅ Test Case 1: Basic Plan Subscription
- [x] Select Basic Plan
- [x] Configure 2 people, 3 days
- [x] Select vegetarian diet
- [x] Choose 3 meals
- [x] Complete checkout
- [x] Verify in Supabase
- [x] Verify in Stripe
- [x] Check email notification

### ✅ Test Case 2: Premium Plan Subscription
- [x] Select Premium Plan
- [x] Configure 4 people, 5 days
- [x] Select multiple diets
- [x] Choose 5 meals
- [x] Complete checkout
- [x] Verify in panel

### ✅ Test Case 3: Cancel Checkout
- [x] Start checkout flow
- [x] Click "Cancel" in Stripe Checkout
- [x] Verify redirect to `/subscription/cancel`
- [x] Retry from cancel page

### ✅ Test Case 4: Pause Subscription
- [x] Go to panel → Subscriptions
- [x] Click "Wstrzymaj"
- [x] Select pause duration (14 days)
- [x] Confirm
- [x] Verify status: paused
- [x] Check email: "Subskrypcja wstrzymana"

### ✅ Test Case 5: Resume Subscription
- [x] Go to panel → Subscriptions
- [x] Click "Wznów"
- [x] Confirm
- [x] Verify status: active
- [x] Check email: "Subskrypcja wznowiona"

### ✅ Test Case 6: Cancel Subscription (End of Period)
- [x] Go to panel → Subscriptions
- [x] Click "Anuluj"
- [x] Choose "Na końcu okresu"
- [x] Confirm
- [x] Verify: cancel_at_period_end = true
- [x] Check email: "Subskrypcja anulowana"

---

## 🚨 Common Issues

### Issue 1: "Stripe price configuration missing"
**Fix:** Add Price IDs to `.env.local` and restart server

### Issue 2: "User not authenticated"
**Fix:** Login before going to kreator

### Issue 3: "No such price: price_..."
**Fix:** Use TEST Price IDs with TEST Stripe keys

### Issue 4: Webhook not syncing
**Fix:**
1. Check `STRIPE_WEBHOOK_SECRET` in `.env.local`
2. Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Check webhook logs in Stripe Dashboard

### Issue 5: Email not sent
**Fix:**
1. Check SMTP config in `.env.local`
2. Test: `GET /api/test-email?to=your@email.com`
3. Check logs for `✅ Email sent` or `❌ SMTP error`

---

## 📊 Success Criteria

Subscription flow is **working** when:

- ✅ User can select plan in kreator
- ✅ Redirect to Stripe Checkout works
- ✅ Payment with test card succeeds
- ✅ Redirect to `/subscription/success` works
- ✅ Subscription saved in Supabase
- ✅ Subscription visible in Stripe Dashboard
- ✅ Email notification sent
- ✅ Subscription visible in panel
- ✅ Pause/Resume works
- ✅ Cancel works (immediate + end of period)

---

**Created:** Version 191
**Status:** Ready for testing
**Next:** Create Stripe Price IDs and test full flow
