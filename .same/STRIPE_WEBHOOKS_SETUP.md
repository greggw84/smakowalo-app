# 🔔 Stripe Webhooks Setup - KRYTYCZNE!

**Problem:** Subskrypcje nie pojawiają się w panelu użytkownika i nie wysyłają emaili.

**Przyczyna:** Stripe **NIE** powiadamia aplikacji o nowych subskrypcjach bo webhooks nie są skonfigurowane!

---

## ✅ Co robi Webhook?

Gdy użytkownik kupuje subskrypcję, Stripe MUSI powiadomić aplikację przez webhook, żeby:
1. ✅ Zapisać subskrypcję w Supabase
2. ✅ Wysłać email powitalny
3. ✅ Pokazać subskrypcję w panelu użytkownika
4. ✅ Wysłać potwierdzenie płatności

**Bez webhooka = brak emaili i pusta lista subskrypcji!**

---

## 🚀 Konfiguracja (5 minut):

### Krok 1: Otwórz Stripe Dashboard

1. Idź do: https://dashboard.stripe.com
2. **Upewnij się że jesteś w LIVE MODE** 🟢 (toggle w górnym prawym rogu)
3. Kliknij: **Developers** (lewy sidebar)
4. Kliknij: **Webhooks**

### Krok 2: Dodaj Endpoint

1. Kliknij: **"Add endpoint"** (przycisk w prawym górnym rogu)
2. W polu **"Endpoint URL"** wpisz:
   ```
   https://smakowalo.pl/api/webhooks/stripe
   ```
3. Kliknij: **"Select events"**

### Krok 3: Wybierz Events do Obsługi

Zaznacz **WSZYSTKIE** te eventy:

**Subscription events:**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `customer.subscription.trial_will_end`

**Payment events:**
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `invoice.upcoming`

**Checkout events:**
- ✅ `checkout.session.completed`
- ✅ `checkout.session.expired`

### Krok 4: Zapisz i Skopiuj Webhook Secret

1. Kliknij: **"Add endpoint"** (na dole)
2. Stripe pokaże nowy endpoint
3. Kliknij na endpoint żeby go otworzyć
4. Znajdź: **"Signing secret"**
5. Kliknij: **"Reveal"** lub **"Click to reveal"**
6. **SKOPIUJ** secret (zaczyna się od `whsec_...`)

---

## ⚙️ Krok 5: Dodaj Webhook Secret do Vercel

1. Idź do: https://vercel.com/dashboard
2. Projekt: `smakowalo-app`
3. **Settings** → **Environment Variables**
4. Znajdź: `STRIPE_WEBHOOK_SECRET`
5. Jeśli NIE MA - kliknij **"Add New"**:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (skopiowany secret ze Stripe)
   - **Environments:** ✅ Production ✅ Preview ✅ Development
   - Kliknij: **Save**
6. Jeśli JUŻ JEST - kliknij **Edit** (3 kropki):
   - Wklej nowy `whsec_...` secret
   - Sprawdź że są wszystkie 3 environments
   - **Save**

### Krok 6: Redeploy Vercel

1. Idź do: **Deployments**
2. Kliknij: **Redeploy** (3 kropki → Redeploy)
3. Czekaj 2-3 minuty

---

## 🧪 Testowanie

### Test 1: Webhook Response

1. W Stripe Dashboard → Developers → Webhooks
2. Kliknij na swój endpoint
3. Kliknij: **"Send test webhook"**
4. Wybierz: `customer.subscription.created`
5. Kliknij: **"Send test webhook"**
6. **Sprawdź odpowiedź:**
   - ✅ Status: `200 OK` - działa!
   - ❌ Status: `400`/`500` - sprawdź logi w Vercel

### Test 2: Prawdziwa Subskrypcja

1. Idź na: https://smakowalo.pl/kreator
2. Wybierz plan
3. Dokończ checkout
4. **Sprawdź:**
   - ✅ Otrzymałeś email powitalny
   - ✅ Subskrypcja pojawia się w panelu: https://smakowalo.pl/panel
   - ✅ Stripe Logs pokazują webhook `200 OK`

### Test 3: Sprawdź Logi

**Stripe Logs:**
1. https://dashboard.stripe.com/logs
2. Szukaj: `webhook` filter
3. Sprawdź czy są requesty do `/api/webhooks/stripe`
4. Sprawdź status: `200 OK`

**Vercel Logs:**
1. Vercel Dashboard → Deployments → Najnowszy
2. **Functions** → `/api/webhooks/stripe`
3. Sprawdź logi - powinny być:
   ```
   ✅ Webhook verified: customer.subscription.created
   📦 Subscription created: sub_xxxxx
   ✉️ Email sent to: user@email.com
   ```

---

## 📋 Checklist Konfiguracji

- [ ] Otworzyłem Stripe Dashboard w **Live Mode**
- [ ] Dodałem endpoint: `https://smakowalo.pl/api/webhooks/stripe`
- [ ] Zaznaczyłem wszystkie wymagane eventy
- [ ] Skopiowałem **Signing secret** (`whsec_...`)
- [ ] Dodałem `STRIPE_WEBHOOK_SECRET` do Vercel
- [ ] Zrobiłem **Redeploy** w Vercel
- [ ] Przetestowałem "Send test webhook" w Stripe
- [ ] Status: `200 OK`
- [ ] Przetestowałem prawdziwą subskrypcję
- [ ] Otrzymałem email powitalny
- [ ] Subskrypcja pojawia się w panelu użytkownika

---

## 🚨 Troubleshooting

### Problem: Webhook zwraca 400/500

**Sprawdź:**
1. Czy `STRIPE_WEBHOOK_SECRET` w Vercel jest poprawny
2. Czy zrobiłeś redeploy po dodaniu secret
3. Vercel Function Logs - jaki błąd?

**Fix:**
1. Skopiuj secret ponownie ze Stripe
2. Zaktualizuj w Vercel
3. Redeploy

### Problem: Webhook 200 OK ale brak emaili

**Sprawdź:**
1. Vercel Logs → `/api/webhooks/stripe`
2. Szukaj błędów w wysyłaniu emaili
3. Sprawdź czy SMTP credentials są w Vercel:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`

**Fix:**
1. Dodaj brakujące SMTP zmienne
2. Redeploy

### Problem: Subskrypcja nie pojawia się w panelu

**Sprawdź:**
1. Czy webhook zapisał dane do Supabase
2. Supabase → Table Editor → `subscriptions` table
3. Czy jest wpis dla tego user_id?

**Fix:**
1. Sprawdź Vercel Logs - czy był błąd Supabase
2. Sprawdź `SUPABASE_SERVICE_ROLE_KEY` w Vercel
3. Redeploy

---

## 📊 Oczekiwany Flow

**Użytkownik kupuje subskrypcję:**
1. Stripe Checkout → Płatność OK
2. Stripe wysyła webhook → `https://smakowalo.pl/api/webhooks/stripe`
3. Webhook zapisuje subskrypcję do Supabase
4. Webhook wysyła email powitalny
5. Użytkownik widzi subskrypcję w panelu
6. Użytkownik otrzymuje email z szczegółami

**Bez webhooka:**
- ❌ Brak zapisu w Supabase
- ❌ Brak emaila
- ❌ Pusty panel użytkownika

---

## ✅ Po Konfiguracji

**Wszystko powinno działać:**
- ✅ Emaile automatycznie wysyłane
- ✅ Subskrypcje widoczne w panelu
- ✅ Powiadomienia o płatnościach
- ✅ Trial reminders (jeśli używasz trial)

---

**Webhook jest KRYTYCZNY dla działania systemu!**

Bez niego Stripe i aplikacja nie komunikują się ze sobą.

Powered by [Same.new](https://same.new)
