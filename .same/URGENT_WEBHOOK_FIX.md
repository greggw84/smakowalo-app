# 🚨 PILNE: Webhooks Nie Działają - User Zapłacił Ale Nic Się Nie Zapisało!

**Data:** November 20, 2025
**Status:** 🔴 **CRITICAL BUG**
**Impact:** User zapłacił 50 zł, płatność przeszła, ale subskrypcja nie została zapisana!

---

## ❌ Problem

**User zgłasza:**
- ✅ Zapłacił 50 zł przez Stripe
- ✅ Success page się pokazała: "Subskrypcja utworzona pomyślnie!"
- ❌ Panel użytkownika: "Brak aktywnej subskrypcji"
- ❌ Supabase subscriptions table: **PUSTE**
- ❌ Supabase payments table: **PUSTE**
- ❌ Email: **NIE PRZYSZEDŁ**

**Root Cause:**
- 🚨 **WEBHOOKS NIE DZIAŁAJĄ!**
- **ROZWIĄZANIE:** Domain redirect! smakowalo.pl → www.smakowalo.pl (307)
- Stripe webhook URL musi być: `https://www.smakowalo.pl/api/webhooks/stripe`
- Stripe NIE podąża za 307 redirects
- Zobacz: `.same/WEBHOOK_REDIRECT_FIX.md` dla pełnego rozwiązania

---

## 🔍 Diagnoza

### 1. Vercel Deployment Failed

**Sprawdź:**
- https://vercel.com/dashboard → Deployments
- Ostatni deployment ma status: ❌ **FAILED**
- Kod webhook NIE jest zaktualizowany

### 2. Stripe Webhook Logs

**Sprawdź w Stripe:**
1. Stripe Dashboard → Developers → Webhooks
2. Kliknij endpoint: `smakowalo.pl/api/webhooks/stripe`
3. **Logs** → Sprawdź ostatnie requesty
4. Prawdopodobnie status: **400** lub **500**

### 3. Missing Environment Variables

**Możliwe przyczyny:**
- `STRIPE_WEBHOOK_SECRET` - brak lub błędny
- `SUPABASE_SERVICE_ROLE_KEY` - brak
- `SMTP_*` - brak (dla emaili)

---

## ✅ Natychmiastowe Rozwiązanie

### Krok 1: Sprawdź Vercel Deployment

```bash
# Check if deployment succeeded
curl https://smakowalo.pl/api/debug-webhook
```

**Powinno zwrócić:**
```json
{
  "webhookSecret": "SET (whsec_...)",
  "stripeSecretKey": "SET (sk_live_...)",
  "supabaseUrl": "https://...",
  "supabaseServiceKey": "SET"
}
```

**Jeśli zwraca 404 lub błąd:**
- ❌ Deployment failed
- ❌ Kod nie jest wdrożony
- 🔧 Trzeba naprawić deployment

### Krok 2: Napraw Deployment

**Sprawdź Vercel Dashboard:**
1. Idź do: https://vercel.com/dashboard
2. Kliknij: smakowalo-app
3. **Deployments** → Sprawdź ostatni
4. Jeśli **Failed** → Kliknij na deployment → Zobacz logs

**Najczęstsze przyczyny:**
- Build error (TypeScript errors, missing imports)
- Missing environment variables
- Timeout podczas buildu

**Fix:**
1. Zobacz error logs
2. Napraw błąd w kodzie lokalnie
3. Git commit + push
4. Poczekaj na auto-redeploy

### Krok 3: Manualnie Zapisz Subskrypcję (Tymczasowo)

Jeśli deployment nie można szybko naprawić, **RĘCZNIE DODAJ** subskrypcję do Supabase:

```sql
-- 1. Sprawdź Stripe Dashboard → Subscriptions
-- Znajdź subscription ID (sub_xxx) dla usera

-- 2. W Supabase SQL Editor:
INSERT INTO subscriptions (
  id,
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  plan_type,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'USER_ID_FROM_PROFILES_TABLE', -- Znajdź po email gregh dm@gmail.com
  'sub_XXX', -- Z Stripe Dashboard
  'cus_XXX', -- Z Stripe Dashboard
  'active',
  'weekly',
  NOW(),
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW()
);
```

**Znajdź user_id:**
```sql
SELECT id FROM profiles WHERE email = 'greghdm@gmail.com';
```

---

## 🔧 Długoterminowe Rozwiązanie

### Fix 1: Napraw Deployment Error

**Sprawdź build logs w Vercel:**
1. Deployment → (kliknij na failed) → **Building**
2. Zobacz error message
3. Napraw problem w kodzie

**Typowe błędy:**
- **TypeScript errors:** Niepoprawne typy
- **Import errors:** Brakujące pliki
- **Environment variable errors:** Brak zmiennych

### Fix 2: Dodaj Brakujące Environment Variables

**Sprawdź w Vercel:**
Settings → Environment Variables

**Wymagane dla webhooks:**
```
STRIPE_SECRET_KEY=sk_live_51Ro7DW...
STRIPE_WEBHOOK_SECRET=whsec_e1lec0CKzq7DmW25...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=@Justyna_Justyna.21
```

### Fix 3: Test Webhook Ręcznie

**Po naprawie deployment:**

```bash
# Test endpoint istnieje
curl https://smakowalo.pl/api/webhooks/stripe

# Powinno zwrócić: 405 Method Not Allowed (bo GET, nie POST)
# Jeśli 404 → endpoint nie istnieje → deployment problem
```

**Test webhook w Stripe:**
1. Stripe Dashboard → Developers → Webhooks
2. Kliknij: endpoint
3. **Send test webhook** → customer.subscription.created
4. Sprawdź response: powinno być **200 OK**

---

## 📧 Powiadomienie Użytkownika

**User czeka na:**
- Subskrypcję w panelu
- Email potwierdzający
- Możliwość zarządzania

**WAŻNE:** Musisz natychmiast naprawić albo:

1. **Napraw deployment** → Webhook zadziała automatycznie dla przyszłych płatności
2. **Ręcznie dodaj subskrypcję** do Supabase (instrukcja wyżej)
3. **Wyślij email ręcznie** do usera

**Email do wysłania:**
```
To: greghdm@gmail.com
Subject: Witaj w Smakowało! 🍽️

Cześć!

Dziękujemy za dołączenie do Smakowało!

Twoja subskrypcja jest aktywna:
- Plan: Tygodniowy (2 osoby × 3 dni)
- Kwota: 50 zł/tydzień
- Następna dostawa: [DATA]

Możesz zarządzać swoją subskrypcją w panelu:
https://smakowalo.pl/panel

Przepraszamy za opóźnienie - system miał tymczasowy problem.

Smacznego!
Zespół Smakowało
```

---

## ✅ Checklist Naprawy

- [ ] Sprawdź Vercel deployment logs
- [ ] Napraw błędy buildu (jeśli są)
- [ ] Sprawdź wszystkie env vars w Vercel
- [ ] Redeploy na Vercel
- [ ] Test: curl /api/debug-webhook
- [ ] Test: Stripe webhook send test
- [ ] Ręcznie dodaj subskrypcję do Supabase (tymczasowo)
- [ ] Wyślij email do usera
- [ ] Sprawdź panel usera - powinna być subskrypcja

---

## 🔍 Debug Commands

```bash
# Check deployment
curl https://smakowalo.pl/api/debug-webhook

# Check if webhook endpoint exists
curl -X POST https://smakowalo.pl/api/webhooks/stripe

# Check Stripe config
curl https://smakowalo.pl/api/check-stripe-config
```

---

## 📊 Co Się Stało (Timeline)

1. **User:** Zarejestrował się (greghdm@gmail.com)
2. **User:** Przeszedł przez kreator (2 osoby × 3 dni)
3. **User:** Zapłacił 50 zł przez Stripe ✅
4. **Stripe:** Utworzył subscription ✅
5. **Stripe:** Wysłał webhook do `/api/webhooks/stripe` ❌
6. **Webhook:** FAILED (deployment problem lub env vars) ❌
7. **Supabase:** Brak zapisu ❌
8. **Email:** Nie wysłany ❌
9. **Panel:** Puste ❌

---

## 🚨 Action Plan - TERAZ

### Natychmiast (5 minut):
1. Sprawdź Vercel deployment logs
2. Zobacz co jest failed
3. Napraw błąd
4. Redeploy

### Tymczasowo (10 minut):
1. Ręcznie dodaj subskrypcję do Supabase
2. Wyślij email do usera
3. Sprawdź czy user widzi subskrypcję w panelu

### Długoterminowo (30 minut):
1. Napraw deployment error
2. Test webhooks
3. Dodaj monitoring webhook status
4. Dodaj alert gdy webhook fails

---

**PRIORYTET:** Napraw deployment TERAZ żeby przyszłe płatności działały!

Powered by [Same.new](https://same.new)
