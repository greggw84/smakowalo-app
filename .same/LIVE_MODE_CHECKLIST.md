# ✅ Stripe LIVE MODE - Checklist Produkcyjny

**Status:** 🔴 LIVE MODE - Prawdziwe płatności!

**Dodane klucze:**
- ✅ `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- ✅ `STRIPE_SECRET_KEY` (sk_live_...)
- ✅ `STRIPE_WEBHOOK_SECRET` (whsec_...)

---

## 🚨 WAŻNE: LIVE MODE vs TEST MODE

### Różnice:

| Tryb | Klucze | Płatności | Price IDs | Webhook |
|------|--------|-----------|-----------|---------|
| **Test** | pk_test_..., sk_test_... | Fałszywe (karta 4242...) | price_test_... | whsec_test_... |
| **Live** | pk_live_..., sk_live_... | **PRAWDZIWE** 💳 | price_live_... | whsec_live_... |

### Twój Status: 🔴 LIVE MODE

- ✅ Masz live API keys
- ❓ **Czy Price IDs są z LIVE MODE?**
- ❓ **Czy webhook jest z LIVE MODE?**

---

## ⚠️ Krok 1: Sprawdź Price IDs (KRYTYCZNE!)

### A) Otwórz Stripe Dashboard w LIVE MODE

1. Idź do: https://dashboard.stripe.com
2. **Przełącz na LIVE MODE** (toggle w prawym górnym rogu - powinien być **zielony**)
3. Idź do: **Products**

### B) Sprawdź Czy Price IDs Istnieją

Twoje obecne Price IDs w `.env.local`:
```
STRIPE_PRICE_2_2=price_1SVD45ChaDkFJkJI2DkNEpkK
STRIPE_PRICE_2_3=price_1SVWHUChaDkFJkJIAEZbXXei
... (12 sztuk)
```

**Sprawdź:**
1. W Stripe Products → kliknij na produkt
2. Sprawdź Price ID - czy zaczyna się od `price_1SV...`?
3. Sprawdź czy są w **LIVE MODE** (toggle zielony!)

### C) Jeśli Price IDs NIE ISTNIEJĄ w Live Mode:

**MUSISZ UTWORZYĆ NOWE!**

Dla KAŻDEJ z 12 kombinacji:

1. **Products** → **Add product**
2. **Name:** np. "Smakowało Box - 2 osoby × 3 dni"
3. **Pricing:**
   - Amount: Zobacz tabelę poniżej
   - Billing period: **Weekly**
   - Currency: **PLN**
4. **Save**
5. **Skopiuj Price ID** (price_...)
6. **Dodaj do `.env.local`** i **Vercel**

### Tabela Cen (Live Mode):

| Kombinacja | Cena (PLN/tydzień) | Env Variable |
|------------|-------------------|--------------|
| 2 osoby × 2 dni | 180 zł | STRIPE_PRICE_2_2 |
| 2 osoby × 3 dni | 270 zł | STRIPE_PRICE_2_3 |
| 2 osoby × 4 dni | 360 zł | STRIPE_PRICE_2_4 |
| 2 osoby × 5 dni | 449 zł | STRIPE_PRICE_2_5 |
| 3 osoby × 2 dni | 270 zł | STRIPE_PRICE_3_2 |
| 3 osoby × 3 dni | 405 zł | STRIPE_PRICE_3_3 |
| 3 osoby × 4 dni | 540 zł | STRIPE_PRICE_3_4 |
| 3 osoby × 5 dni | 675 zł | STRIPE_PRICE_3_5 |
| 4 osoby × 2 dni | 360 zł | STRIPE_PRICE_4_2 |
| 4 osoby × 3 dni | 540 zł | STRIPE_PRICE_4_3 |
| 4 osoby × 4 dni | 720 zł | STRIPE_PRICE_4_4 |
| 4 osoby × 5 dni | 900 zł | STRIPE_PRICE_4_5 |

---

## ✅ Krok 2: Sprawdź Webhook (LIVE MODE)

### A) Otwórz Webhooks w LIVE MODE

1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Upewnij się że jesteś w LIVE MODE** (toggle zielony!)

### B) Znajdź Webhook Endpoint

**Szukaj:**
```
https://smakowalo.pl/api/webhooks/stripe
```

**Jeśli NIE MA:**

1. Kliknij **"+ Add endpoint"**
2. **Endpoint URL:**
   ```
   https://smakowalo.pl/api/webhooks/stripe
   ```
3. **Events to send:** Zaznacz:
   - ✅ checkout.session.completed
   - ✅ customer.subscription.created
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed
   - ✅ customer.subscription.trial_will_end
4. **Add endpoint**
5. **Skopiuj Signing Secret** (whsec_...)
6. **Sprawdź czy to TEN SAM** co masz w `.env.local`

**Jeśli inny signing secret:**
- Zaktualizuj `.env.local`
- Zaktualizuj Vercel env vars
- Redeploy

---

## ✅ Krok 3: Sprawdź Vercel Environment Variables

### A) Otwórz Vercel Dashboard

1. https://vercel.com/dashboard
2. Kliknij: **smakowalo-app**
3. **Settings** → **Environment Variables**

### B) Upewnij się że WSZYSTKIE są dodane:

**Stripe Keys (3 zmienne):**
- ✅ `STRIPE_PUBLISHABLE_KEY` = `pk_live_51Ro7DW...`
- ✅ `STRIPE_SECRET_KEY` = `sk_live_51Ro7DW...`
- ✅ `STRIPE_WEBHOOK_SECRET` = `whsec_e1lec0CKzq7DmW25...`

**Stripe Price IDs (12 zmiennych):**
- ✅ `STRIPE_PRICE_2_2` = `price_...` (LIVE MODE ID!)
- ✅ `STRIPE_PRICE_2_3` = `price_...`
- ... (wszystkie 12)

**Dla każdej zmiennej:**
- ✅ Zaznacz: Production, Preview, Development
- ✅ Save

### C) Redeploy

Po dodaniu/edycji zmiennych:
1. Vercel automatycznie zrobi redeploy
2. Czekaj 2-3 minuty
3. Sprawdź **Deployments** → Status: **Ready** ✅

---

## ✅ Krok 4: Test Konfiguracji

### A) Test API Endpoint

Otwórz w przeglądarce:
```
https://smakowalo.pl/api/check-stripe-config
```

**Powinno zwrócić:**
```json
{
  "allConfigured": true,
  "missingCount": 0,
  "hasSecretKey": true,
  "hasWebhookSecret": true
}
```

**Jeśli `allConfigured: false`:**
- Sprawdź które Price IDs brakują
- Dodaj do Vercel
- Redeploy

### B) Test Webhook (Opcjonalnie)

1. Stripe Dashboard → Developers → Webhooks
2. Kliknij na webhook: `smakowalo.pl/api/webhooks/stripe`
3. Kliknij: **"Send test webhook"**
4. Wybierz event: `customer.subscription.created`
5. Kliknij: **"Send test webhook"**
6. **Sprawdź Response:** Powinno być **200 OK** ✅

---

## ✅ Krok 5: Test Płatności (PRODUKCYJNEJ!)

### ⚠️ UWAGA: To będzie PRAWDZIWA płatność!

Jeśli chcesz przetestować bez prawdziwej płatności:
1. Przełącz Stripe na **Test Mode**
2. Użyj test keys (pk_test_..., sk_test_...)
3. Przetestuj z kartą `4242 4242 4242 4242`
4. Potem wróć do Live Mode

### Test Live Payment (Prawdziwa karta):

1. **Idź na:** https://smakowalo.pl/kreator
2. **Wybierz plan:** np. 2 osoby × 3 dni
3. **Przejdź** przez wszystkie 7 kroków
4. **Kliknij:** "Przejdź do płatności Stripe"
5. **W Stripe Checkout:**
   - Użyj **prawdziwej karty** 💳
   - Lub użyj małej kwoty do testu (np. 2×2 = 180 zł)
6. **Zapłać**

### Co powinno się stać:

1. ✅ Redirect do `/subscription/success`
2. ✅ Stripe wysyła webhook do `/api/webhooks/stripe`
3. ✅ Webhook zapisuje do Supabase → tabela `subscriptions`
4. ✅ Email wysłany do użytkownika
5. ✅ Panel użytkownika pokazuje subskrypcję

### Sprawdź Wyniki:

**Stripe:**
- Dashboard → Payments → Subscriptions
- Powinien być nowy subscription ✅

**Supabase:**
- Table Editor → `subscriptions`
- Powinien być nowy rekord ✅

**Email:**
- Sprawdź skrzynkę
- Powinien przyjść: "Witaj w Smakowało!" ✅

**Panel:**
- https://smakowalo.pl/panel
- Zakładka: Subskrypcja
- Powinna być aktywna subskrypcja ✅

---

## 📋 Quick Checklist

Przed uruchomieniem produkcyjnym:

- [ ] Stripe w **LIVE MODE** (toggle zielony)
- [ ] Wszystkie 12 Price IDs istnieją w **LIVE MODE**
- [ ] Webhook endpoint utworzony w **LIVE MODE**
- [ ] Webhook Secret skopiowany i dodany do Vercel
- [ ] Wszystkie 3 Stripe keys w Vercel (pk_live, sk_live, whsec)
- [ ] Wszystkie 12 STRIPE_PRICE_* w Vercel (**LIVE MODE IDs!**)
- [ ] Vercel deployment **Ready**
- [ ] Test: `/api/check-stripe-config` → allConfigured: true
- [ ] Test: Webhook → 200 OK
- [ ] Test: Płatność (mała kwota) → sukces
- [ ] Sprawdź: Supabase → nowy rekord
- [ ] Sprawdź: Email → otrzymany
- [ ] Sprawdź: Panel → subskrypcja widoczna

---

## 🚨 Ważne Uwagi

### 1. LIVE MODE = Prawdziwe Pieniądze
- Każda płatność będzie **rzeczywiście pobrana z karty**
- Stripe pobiera **prowizję** (ok. 1.4% + 1 PLN)
- Faktury będą **prawdziwe**

### 2. Test Mode Zalecany Na Początek
Jeśli jeszcze nie jesteś pewny:
1. Przełącz na **Test Mode**
2. Użyj test keys
3. Przetestuj pełny flow
4. Dopiero potem przejdź na Live Mode

### 3. Webhook Signing Secret
- **Test Mode** i **Live Mode** mają **RÓŻNE** webhook secrets!
- Upewnij się że używasz właściwego dla trybu

### 4. Price IDs
- **Test Mode** Price IDs: `price_test_...`
- **Live Mode** Price IDs: `price_live_...` lub `price_1...`
- **NIE** możesz mieszać test i live Price IDs!

---

## 🆘 Troubleshooting

### Błąd: "No such price"
**Przyczyna:** Price ID z Test Mode użyty w Live Mode (lub odwrotnie)
**Rozwiązanie:** Upewnij się że Price IDs są z właściwego trybu

### Błąd: Webhook 401 Unauthorized
**Przyczyna:** Webhook secret z Test Mode użyty w Live Mode
**Rozwiązanie:** Skopiuj właściwy webhook secret z Live Mode

### Brak zapisu do Supabase
**Przyczyna:** Webhook nie działa lub błędny secret
**Rozwiązanie:**
1. Sprawdź Stripe Webhook Logs
2. Sprawdź Vercel Function Logs
3. Sprawdź czy webhook secret jest poprawny

---

## 🎯 Następne Kroki

Po pomyślnym teście:
1. ✅ Monitoruj pierwsze subskrypcje
2. ✅ Sprawdź czy emaile przychodzą
3. ✅ Sprawdź czy panel użytkownika działa
4. ✅ Monitoruj Stripe Dashboard (płatności, disputes)
5. ✅ Ustawienie powiadomień w Stripe (email o płatnościach)

---

**Gotowy do Live Mode?** 🚀

Powered by [Same.new](https://same.new)
