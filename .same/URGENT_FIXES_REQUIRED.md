# 🚨 PILNE NAPRAWY - 4 Krytyczne Problemy

**Status:** ❌ Płatność działa, ale system nie zapisuje subskrypcji i nie wysyła emaili!

---

## Problem 1: Zły URL Redirect (Vercel zamiast smakowalo.pl) ❌

**Objawy:**
- Przycisk "Przejdź do panelu" kieruje na `smakowalo-app.vercel.app/login`
- Powinien kierować na `smakowalo.pl/panel`
- Session zgubiona, wymaga ponownego logowania

**Przyczyna:**
`NEXT_PUBLIC_SITE_URL` w Vercel jest ustawione na `https://smakowalo-app.vercel.app`

**Naprawa:**

### Krok 1: Zmień NEXT_PUBLIC_SITE_URL w Vercel

1. Idź do: https://vercel.com/dashboard
2. Projekt: `smakowalo-app`
3. **Settings** → **Environment Variables**
4. Znajdź: `NEXT_PUBLIC_SITE_URL`
5. Kliknij: **Edit** (3 kropki)
6. **Zmień value z:**
   ```
   https://smakowalo-app.vercel.app
   ```
   **Na:**
   ```
   https://smakowalo.pl
   ```
7. **Environments:** Zaznacz wszystkie 3 (Production, Preview, Development)
8. **Save**
9. **Redeploy:** Deployments → 3 kropki → Redeploy

---

## Problem 2: Webhook nie zapisuje subskrypcji do Supabase ❌

**Objawy:**
- Panel pokazuje "Brak aktywnej subskrypcji"
- Subskrypcja jest w Stripe ale NIE w Supabase

**Przyczyna:**
Webhook miał zły URL: `www.smakowalo.pl/api/webhook/stripe` (już naprawione)
Ale subskrypcje utworzone PRZED naprawą NIE zostały zapisane

**Naprawa:**

### Krok 2.1: Sprawdź czy webhook działa teraz

1. **W Stripe:** Developers → Webhooks
2. Kliknij na endpoint: `https://smakowalo.pl/api/webhooks/stripe`
3. **Test:** "Send test webhook" → wybierz `customer.subscription.created`
4. Sprawdź status:
   - ✅ **200 OK** - działa!
   - ❌ **4xx/5xx** - sprawdź logs w Vercel

### Krok 2.2: Ręcznie zsynchronizuj istniejące subskrypcje

**Opcja A: Przez Stripe Dashboard (szybkie)**

1. Stripe → Subscriptions
2. Znajdź subskrypcję użytkownika (`info@hdmoments.com`)
3. Kliknij: 3 kropki → "Send events"
4. Wybierz: `customer.subscription.created`
5. Send

**Opcja B: Ręcznie dodaj do Supabase (jeśli A nie działa)**

1. Idź do: Supabase Dashboard
2. Table Editor → `subscriptions` table
3. **Insert** → **Insert row**
4. Wypełnij dane z Stripe:
   - `user_id`: ID użytkownika z Supabase (znajdź w `auth.users` gdzie email = `info@hdmoments.com`)
   - `stripe_subscription_id`: `sub_xxxxx` (z Stripe)
   - `stripe_customer_id`: `cus_xxxxx` (z Stripe)
   - `status`: `active` lub `trialing`
   - `plan_type`: `weekly`
   - `current_period_start`: Data z Stripe
   - `current_period_end`: Data z Stripe
5. Save

---

## Problem 3: Brak emaila o subskrypcji ❌

**Objawy:**
- Otrzymałeś email "Witaj w Smakowało! Potwierdź swój adres e-mail" ✅
- NIE otrzymałeś emaila "Subskrypcja utworzona" ❌

**Przyczyna:**
Webhook nie zadziałał → nie wysłał emaila

**Naprawa:**

### Krok 3: Po naprawie webhooka email będzie wysyłany automatycznie

1. Webhook zapisuje subskrypcję
2. Wysyła email: "Witaj w Smakowało! 🎉"

Dla istniejących subskrypcji (jeśli chcesz wysłać ręcznie):
- Opcja: Użyj "Send test webhook" w Stripe (Krok 2.1)

---

## Problem 4: Session Cookies - wymaga ponownego logowania ❌

**Objawy:**
- Po zakupie subskrypcji, kliknięcie "Przejdź do panelu" wymaga logowania
- Mimo że użytkownik właśnie się zarejestrował i kupił

**Przyczyna:**
1. Stripe przekierowuje na `smakowalo-app.vercel.app` (zła domena)
2. Session cookies są dla `smakowalo.pl` → nie działają na `vercel.app`

**Naprawa:**

Po naprawie `NEXT_PUBLIC_SITE_URL` (Problem 1) to się naprawi automatycznie.

**Dodatkowa opcja:** Auto-login po sukcesie płatności

Możemy zmodyfikować `/subscription/success` żeby automatycznie zalogowało użytkownika.

---

## ✅ Checklist Napraw (wykonaj po kolei):

- [ ] **1. Zmień `NEXT_PUBLIC_SITE_URL` w Vercel** na `https://smakowalo.pl`
- [ ] **2. Redeploy** w Vercel
- [ ] **3. Sprawdź webhook test** w Stripe → powinien być 200 OK
- [ ] **4. Zsynchronizuj istniejące subskrypcje:**
  - [ ] Opcja A: "Send events" w Stripe
  - [ ] Opcja B: Ręcznie dodaj do Supabase
- [ ] **5. Test całego flow:**
  - [ ] Nowa subskrypcja przez kreator
  - [ ] Sprawdź czy przekierowuje na `smakowalo.pl/panel`
  - [ ] Sprawdź czy subskrypcja pojawia się w panelu
  - [ ] Sprawdź czy przyszedł email

---

## 🧪 Test Po Naprawach

### Test 1: URL Redirect

1. Przejdź przez kreator
2. Po płatności sprawdź URL
3. Powinien być: `https://smakowalo.pl/subscription/success?session_id=...`
4. Kliknij "Przejdź do panelu"
5. Powinien kierować na: `https://smakowalo.pl/panel`
6. **BEZ** wymagania logowania ✅

### Test 2: Subskrypcja w Panelu

1. Zaloguj się na konto testowe
2. Idź do: Panel → Subskrypcje
3. Powinna się pokazać aktywna subskrypcja ✅

### Test 3: Email

1. Sprawdź inbox: `info@hdmoments.com`
2. Powinien być email: "Witaj w Smakowało! 🎉" ✅
3. Z detalami subskrypcji

### Test 4: Webhook Logs

1. Stripe → Developers → Logs
2. Filter: `webhook`
3. Sprawdź ostatnie requesty
4. Wszystkie powinny być: **200 OK** ✅

---

## 📊 Vercel Logs - Jak sprawdzić błędy

1. Vercel Dashboard → Deployments
2. Kliknij na najnowszy deployment
3. **Functions** → `/api/webhooks/stripe`
4. Sprawdź logi - szukaj:
   - ✅ `✅ Webhook verified: customer.subscription.created`
   - ✅ `📦 Subscription created: sub_xxxxx`
   - ✅ `✉️ Email sent to: user@email.com`
   - ❌ Błędy (jeśli są)

---

## ⚠️ Najczęstsze Błędy

| Błąd | Przyczyna | Rozwiązanie |
|------|-----------|-------------|
| Redirect na vercel.app | `NEXT_PUBLIC_SITE_URL` źle | Zmień na `https://smakowalo.pl` |
| Webhook 400 | Zły secret | Sprawdź `STRIPE_WEBHOOK_SECRET` w Vercel |
| Brak subskrypcji w panelu | Webhook nie zapisał | Resend event lub dodaj ręcznie |
| Brak emaila | Webhook nie wywołany | Test webhook lub resend |
| Wymaga logowania | Inna domena | Naprawi się po zmianie URL |

---

## 🎯 Priorytet

**NAJPIERW:**
1. Zmień `NEXT_PUBLIC_SITE_URL` → `https://smakowalo.pl`
2. Redeploy

**POTEM:**
3. Test webhook
4. Zsynchronizuj istniejące subskrypcje

**SPRAWDŹ:**
5. Test całego flow
6. Wszystko powinno działać ✅

---

**Po naprawie wszystkie 4 problemy znikną!** 🚀

Powered by [Same.new](https://same.new)
