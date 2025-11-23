# NAPRAWA: Panel Subskrypcji Pusty i Brak Emaili

## Problem

Po dokonaniu płatności za subskrypcję:
1. Panel subskrypcji w panelu klienta pozostaje pusty
2. Nie przychodzą żadne emaile z potwierdzeniem subskrypcji

## Przyczyny

### 1. Polityki RLS Blokowały Webhooki
- Tabela `subscriptions` miała włączone RLS (Row Level Security)
- Polityki pozwalały tylko użytkownikom edytować własne subskrypcje
- Webhook używa `service_role` klucza, ale nie było polityki pozwalającej na bypass RLS
- **Skutek**: Webhook nie mógł zapisać subskrypcji do bazy danych

### 2. Konflikt przy Tworzeniu Subskrypcji
- API `/api/create-subscription` tworzyło subskrypcję ze statusem `incomplete`
- Webhook próbował utworzyć tę samą subskrypcję z `stripe_subscription_id`
- Mogło powodować konflikty przy zapisie
- **Skutek**: Subskrypcja mogła nie zostać poprawnie zapisana

### 3. Niepełne Przekazywanie Metadanych
- `user_id` było w metadata subscription_data, ale nie w session metadata
- Brak `client_reference_id` jako fallback
- **Skutek**: Czasami webhook nie mógł znaleźć user_id

### 4. Zbyt Restrykcyjne Filtrowanie Statusów
- Panel klienta szukał subskrypcji tylko ze statusami: `active`, `trialing`, `past_due`
- Stripe może ustawić status `incomplete` na początku
- **Skutek**: Panel nie wyświetlał subskrypcji w stanie "processing"

## Rozwiązanie

### Zmiany w Bazie Danych

**Plik**: `supabase/migrations/20251122000000_fix_subscription_rls_for_webhooks.sql`

Nowa migracja:
- Usuwa WSZYSTKIE istniejące polityki RLS na tabelach subscriptions i orders
- Tworzy nowe, ujednolicone polityki które pozwalają:
  - `service_role` (webhookom) zarządzać wszystkimi subskrypcjami
  - Zwykłym użytkownikom zarządzać tylko własnymi danymi
- Dodaje uprawnienia dla `service_role`

**Jak zastosować**:
```bash
# W Supabase Dashboard → SQL Editor wykonaj zawartość pliku migracji
# LUB używając Supabase CLI:
supabase migration up
```

### Zmiany w Kodzie

#### 1. Webhook Handler (`src/app/api/webhooks/stripe/route.ts`)
- ✅ Ulepszone logowanie błędów
- ✅ Szczegółowe logi wysyłania emaili
- ✅ Lepsze debugowanie problemów

#### 2. Create Subscription (`src/app/api/create-subscription/route.ts`)
- ✅ Dodano `client_reference_id` z user_id jako fallback
- ✅ Dodano metadata do session (oprócz subscription_data)
- ✅ Usunięto pre-tworzenie subskrypcji (teraz webhook to obsługuje)

#### 3. Panel Subskrypcji (`src/app/panel/subscription-tab.tsx`)
- ✅ Rozszerzono query o statusy: `incomplete`, `incomplete_expired`
- ✅ Panel teraz pokazuje subskrypcje w trakcie przetwarzania

#### 4. Widok Subskrypcji (`src/app/panel/subscription-overview.tsx`)
- ✅ Dodano bannery statusu dla `incomplete` i `past_due`
- ✅ Ulepszone wskaźniki statusu z kolorami
- ✅ Lepsze komunikaty dla użytkownika

## Instrukcja Wdrożenia

### Krok 1: Wdróż Zmiany w Kodzie

```bash
# Kod już jest na branchu copilot/fix-empty-subscription-panel
# Merge do main lub deploy bezpośrednio
git checkout main
git merge copilot/fix-empty-subscription-panel
git push
```

### Krok 2: Zastosuj Migrację w Bazie Danych

1. Otwórz Supabase Dashboard
2. Przejdź do: **Database** → **SQL Editor**
3. Kliknij **New Query** (Nowe zapytanie)
4. Otwórz plik `supabase/migrations/20251122000000_fix_subscription_rls_for_webhooks.sql`
5. **Skopiuj CAŁY kod SQL** zaczynając od linii 30 (po bloku komentarzy)
6. Wklej do SQL Editor w Supabase
7. Kliknij **Run** (lub naciśnij Ctrl/Cmd + Enter)

**Ważne uwagi**:
- Kopiuj kod SQL z wnętrza pliku, NIE ścieżkę do pliku!
- Ta migracja usuwa WSZYSTKIE istniejące polityki RLS i tworzy nowe
- Nowe polityki pozwalają webhookom (service_role) zarządzać wszystkimi subskrypcjami
- Zwykli użytkownicy nadal mogą zarządzać tylko własnymi danymi

**Weryfikacja**:
```sql
-- Sprawdź czy polityki zostały utworzone
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('subscriptions', 'orders')
AND policyname LIKE 'Service role%';

-- Powinny być 2 wiersze:
-- Service role can manage subscriptions
-- Service role can manage orders
```

### Krok 3: Sprawdź Zmienne Środowiskowe

Upewnij się, że wszystkie są ustawione w Vercel/Production:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# SMTP (dla emaili)
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=***
SMTP_FROM_EMAIL=no_reply@smakowalo.pl
SMTP_FROM_NAME=Smakowało

# URL Strony
NEXT_PUBLIC_SITE_URL=https://smakowalo.pl
```

### Krok 4: Przetestuj

1. **Utwórz testową subskrypcję**:
   - Zaloguj się jako testowy użytkownik
   - Przejdź przez kreator
   - Wybierz plan (np. 2 osoby, 3 dni)
   - Użyj testowej karty: `4242 4242 4242 4242`

2. **Sprawdź wyniki**:
   - ✅ Checkout się powiedzie
   - ✅ Przekierowanie na stronę sukcesu
   - ✅ Subskrypcja pojawia się w panelu
   - ✅ Email powitalny przychodzi (1-2 minuty)
   - ✅ Status zmienia się na "Aktywna" lub "Okres próbny"

## Rozwiązywanie Problemów

### Subskrypcja Nie Pojawia się w Panelu

**Sprawdź w bazie danych**:
```sql
-- Czy subskrypcja istnieje?
SELECT id, user_id, stripe_subscription_id, status, created_at
FROM subscriptions
WHERE user_id = 'id-użytkownika'
ORDER BY created_at DESC;
```

**Możliwe przyczyny**:
- Brak wiersza → Webhook nie utworzył subskrypcji (sprawdź logi)
- Wiersz istnieje, ale user_id jest NULL → Problem z metadata
- Wiersz istnieje, ale status inny niż dozwolone → Rozszerz query

### Emaile Nie Przychodzą

**Sprawdź logi Vercel**:
```
ℹ️ [Webhook] Preparing to send welcome email
ℹ️ [Webhook] Sending welcome email
```

Jeśli widzisz:
```
⚠️ [Webhook] Failed to send welcome email
```

Sprawdź:
1. Czy SMTP_* zmienne są ustawione
2. Czy hasło SMTP jest poprawne
3. Czy serwer SMTP (Bluehost) jest dostępny
4. Czy email nie trafił do spamu

**Test ręczny**:
```bash
curl -X POST https://smakowalo.pl/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "twoj@email.com"}'
```

### Webhook Zwraca Błąd

**Sprawdź w Stripe Dashboard**:
1. Developers → Webhooks
2. Znajdź endpoint `https://smakowalo.pl/api/webhooks/stripe`
3. Sprawdź ostatnie próby
4. Jeśli błąd 400/500 → sprawdź szczegóły

**Częste błędy**:
- `Webhook verification failed` → Zły `STRIPE_WEBHOOK_SECRET`
- `Database error` → RLS blokuje (sprawdź czy migracja została zastosowana)
- `No user_id` → Problem z metadata w Stripe

## Monitorowanie

### Metryki Sukcesu

Po wdrożeniu monitoruj:
- **Współczynnik tworzenia subskrypcji**: Powinien równać się płatnościom
- **Dostarczalność emaili**: >95% dla emaili powitalnych
- **Zgłoszenia pustego panelu**: Powinny spaść do zera
- **Czas potwierdzenia**: Użytkownicy powinni widzieć subskrypcję w sekundach

### Logi do Monitorowania

```
✅ [Webhook] Webhook signature verified
✅ [Webhook] Subscription upserted to database
✅ [Webhook] Order created
✅ [Webhook] Welcome email sent successfully
```

## Wsparcie

Jeśli problemy nadal występują:

1. Sprawdź wszystkie kroki w tym przewodniku
2. Przejrzyj logi Vercel pod kątem błędów
3. Sprawdź logi webhooków w Stripe Dashboard
4. Zweryfikuj, że migracja została zastosowana
5. Przetestuj wysyłanie emaili osobno

## Zobacz Też

- `SUBSCRIPTION_FIX_GUIDE.md` - Szczegółowy przewodnik techniczny (EN)
- `WEBHOOK_TROUBLESHOOTING.md` - Rozwiązywanie problemów z webhookami
- `test-subscription-fix.sh` - Skrypt testowy

## Cofnięcie Zmian

Jeśli wystąpią problemy:

```bash
# Cofnij zmiany w kodzie
git revert d9f960a
git push

# Zachowaj zmiany w bazie danych - one są bezpieczne i poprawiają bezpieczeństwo
```
