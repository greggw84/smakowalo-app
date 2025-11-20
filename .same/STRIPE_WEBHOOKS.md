# Stripe Webhooks - Dokumentacja

## 📌 Przegląd

Endpoint webhooków Stripe automatycznie synchronizuje zmiany w subskrypcjach między Stripe a bazą danych Supabase.

**Endpoint:** `/api/webhooks/stripe`
**Metoda:** `POST`
**Weryfikacja:** Stripe signature (automatyczna)

## 🎯 Obsługiwane Eventy

### 1. `customer.subscription.created`
- **Kiedy:** Nowa subskrypcja utworzona
- **Akcja:** Zapisanie subskrypcji w bazie
- **Email:** Powitalny email z datą pierwszej dostawy

### 2. `customer.subscription.updated`
- **Kiedy:** Zmiana w subskrypcji (pause, resume, cancel)
- **Akcja:** Aktualizacja statusu w bazie
- **Email:**
  - Pause → "Subskrypcja wstrzymana"
  - Resume → "Subskrypcja wznowiona"
  - Cancel → "Subskrypcja anulowana"

### 3. `customer.subscription.deleted`
- **Kiedy:** Subskrypcja usunięta (koniec okresu)
- **Akcja:** Status ustawiony na 'canceled'

### 4. `invoice.payment_succeeded`
- **Kiedy:** Płatność zakończona sukcesem
- **Akcja:** Aktualizacja last_payment_status
- **Email:** Potwierdzenie płatności + link do faktury

### 5. `invoice.payment_failed`
- **Kiedy:** Płatność nie powiodła się
- **Akcja:** Aktualizacja last_payment_status
- **Email:** Powiadomienie o błędzie + info o retry

### 6. `customer.subscription.trial_will_end`
- **Kiedy:** 3 dni przed końcem trial
- **Akcja:** Brak (tylko email)
- **Email:** Przypomnienie o końcu okresu próbnego

## 🔐 Konfiguracja Webhook Secret

### 1. Stripe Dashboard
1. Przejdź do: https://dashboard.stripe.com/webhooks
2. Kliknij "Add endpoint"
3. URL: `https://twoja-domena.com/api/webhooks/stripe`
4. Wybierz eventy: wszystkie z listy powyżej
5. Skopiuj "Signing secret" (whsec_XXXXXXXXXXXXXXXXXXXXX...)

### 2. Zmienne środowiskowe
Dodaj do `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX
```

## 🧪 Testowanie Lokalnie

### Użyj Stripe CLI

```bash
# 1. Zainstaluj Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Zaloguj się
stripe login

# 3. Forward webhooks do localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. Trigger test events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

### Manualne testowanie

```bash
# 1. W Stripe Dashboard → Webhooks → "Send test webhook"
# 2. Wybierz event type
# 3. Sprawdź logi w konsoli aplikacji
```

## 📊 Monitorowanie

### Logi w aplikacji
Wszystkie eventy logowane z emoji:
- ✅ Sukces
- ❌ Błąd
- 📦 Nowa subskrypcja
- 🔄 Aktualizacja
- 🗑️ Usunięcie
- 💰 Płatność sukces
- ⏰ Trial ending

### Stripe Dashboard
1. Webhooks → Historia → Sprawdź delivery status
2. Retry failed webhooks jeśli potrzeba

## 🔒 Bezpieczeństwo

- ✅ Weryfikacja Stripe signature (automatyczna)
- ✅ HTTPS required w production
- ✅ Service role key używany do Supabase
- ⚠️ Webhook secret nigdy nie commituj do repo!

## 🚨 Troubleshooting

### "No signature" error
- Upewnij się że Stripe wysyła header `stripe-signature`
- Sprawdź czy endpoint jest publicznie dostępny

### "Webhook signature verification failed"
- Sprawdź `STRIPE_WEBHOOK_SECRET` w .env
- Upewnij się że używasz klucza z właściwego środowiska (test/live)

### Event nie został obsłużony
- Dodaj nowy case w switch statement
- Zaktualizuj listę eventów w Stripe Dashboard

### Email nie został wysłany
- Sprawdź `RESEND_API_KEY` w .env
- Zobacz logi w konsoli (fallback to console.log)

## 📝 Metadata w Subscriptionach

**WAŻNE:** Podczas tworzenia subskrypcji w Stripe Checkout, dodaj:

```javascript
metadata: {
  user_id: 'uuid-from-supabase',
  plan_type: 'weekly' | 'monthly'
}
```

Bez `user_id` webhook nie będzie mógł przypisać subskrypcji do użytkownika!

## 🔄 Flow Przykładowy

```
1. User tworzy subskrypcję → Stripe Checkout
2. Stripe wysyła: customer.subscription.created
3. Webhook zapisuje do Supabase subscriptions
4. Email: "Witaj w Smakowało!"

... po tygodniu ...

5. Stripe próbuje płatności
6a. Sukces → invoice.payment_succeeded → Email: "Płatność OK"
6b. Fail → invoice.payment_failed → Email: "Problem z płatnością"

... user pauzuje ...

7. API call → /api/subscriptions/pause
8. Stripe wysyła: customer.subscription.updated
9. Webhook aktualizuje status → Email: "Subskrypcja wstrzymana"
```

## ✅ Checklist Deployment

- [ ] `STRIPE_WEBHOOK_SECRET` dodany do Vercel
- [ ] Webhook endpoint dodany w Stripe Dashboard
- [ ] URL: `https://twoja-domena.com/api/webhooks/stripe`
- [ ] Wszystkie 6 eventów włączone
- [ ] Test webhook wysłany i sukces
- [ ] Sprawdź logi w Vercel i Stripe

---

**Ostatnia aktualizacja:** Wersja 188
**Status:** ✅ Gotowe do deploymentu
