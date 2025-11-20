# 🚀 Konfiguracja Kreatora z Subskrypcją

Nowy kreator został zainstalowany! Oto co musisz skonfigurować:

## ✅ Co zostało zaimplementowane:

1. **Nowy kreator** (`src/app/kreator/page.tsx`) z dwoma trybami:
   - **Subskrypcja** - 4 kroki: Wybór planu → Preferencje+Alergeny → Wybór dań → Płatność
   - **Jednorazowy zakup** - 3 kroki: Diety → Osoby/Dni → Dania → Koszyk

2. **API Endpoints**:
   - `/api/user/preferences` - Zapisywanie i odczytywanie preferencji użytkownika
   - `/api/stripe/subscribe` - Tworzenie sesji Stripe Checkout dla subskrypcji

3. **Migracja Supabase**: `supabase/migrations/20251113000000_add_kreator_preferences.sql`

4. **Nowe funkcje**:
   - ✨ Draft saving (24h w localStorage)
   - ✨ 8 opcji alergii pokarmowych
   - ✨ 2 plany subskrypcyjne (Basic 299zł, Premium 449zł)
   - ✨ Integracja Stripe dla płatności subskrypcji
   - ✨ Zapisywanie preferencji użytkownika
   - ✨ Przełącznik Subskrypcja/Jednorazowe zamówienie

---

## 📋 WYMAGANA KONFIGURACJA

### 1. **Uruchom migrację Supabase**

```bash
# Opcja A: Użyj Supabase CLI
supabase migration up

# Opcja B: Wykonaj ręcznie w Supabase Dashboard
# Skopiuj zawartość: supabase/migrations/20251113000000_add_kreator_preferences.sql
# Wklej w: Database → SQL Editor → New query → Run
```

To doda następujące kolumny do tabeli `profiles`:
- `dietary_preferences` - Preferencje dietetyczne (array)
- `allergens` - Alergeny (array)
- `default_people_count` - Domyślna liczba osób (integer)
- `default_days_count` - Domyślna liczba dni (integer)

---

### 2. **Skonfiguruj Stripe**

#### A) Utwórz produkty i ceny w Stripe Dashboard:

1. Przejdź do: https://dashboard.stripe.com/products
2. Utwórz 2 produkty:

**Produkt 1: Smakowało Basic**
- Nazwa: `Smakowało Basic`
- Opis: `Plan podstawowy - 3 posiłki tygodniowo`
- Cena: `299 PLN/miesiąc` (recurring)
- Skopiuj **Price ID** (zaczyna się od `price_...`)

**Produkt 2: Smakowało Premium**
- Nazwa: `Smakowało Premium`
- Opis: `Plan premium - 5 posiłków tygodniowo`
- Cena: `449 PLN/miesiąc` (recurring)
- Skopiuj **Price ID** (zaczyna się od `price_...`)

#### B) Dodaj klucze do `.env.local`:

```bash
# Stripe Configuration (już istnieje w .env.example)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NOWE: Stripe Subscription Price IDs
STRIPE_BASIC_PRICE_ID=price_...    # <-- Wklej Price ID dla Basic
STRIPE_PREMIUM_PRICE_ID=price_...  # <-- Wklej Price ID dla Premium
```

#### C) Skonfiguruj webhook Stripe (opcjonalnie):

1. W Stripe Dashboard: **Developers → Webhooks → Add endpoint**
2. URL: `https://twoja-domena.pl/api/stripe/webhook`
3. Events to listen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Skopiuj **Webhook Secret** do `.env.local`

---

### 3. **Uruchom dev server i przetestuj**

```bash
bun run dev
```

Przejdź do: http://localhost:3000/kreator

**Testuj oba tryby:**
- ✅ Subskrypcja - sprawdź czy przekierowuje do Stripe
- ✅ Jednorazowy zakup - sprawdź czy dodaje do koszyka

---

## 🎯 Funkcje kreatora

### **Tryb Subskrypcji:**
1. **Krok 1**: Wybór planu (Basic/Premium)
2. **Krok 2**: Preferencje diet (max 3) + Alergie
3. **Krok 3**: Wybór dań (liczba zależy od planu i dni)
4. **Krok 4**: Płatność przez Stripe

### **Tryb Jednorazowy:**
1. **Krok 1**: Wybór diet (max 3)
2. **Krok 2**: Liczba osób (2/4) i dni (3/4/5)
3. **Krok 3**: Wybór dań + Dodanie do koszyka

### **Draft Saving:**
- Postęp zapisuje się automatycznie w localStorage
- Ważność: 24 godziny
- Przywracany po zalogowaniu (parametr `?resume=1`)

### **Preferencje użytkownika:**
- Zapisywane w bazie Supabase (profiles table)
- Fallback do localStorage dla niezalogowanych
- Ładowane automatycznie przy powrocie

---

## 🐛 Rozwiązywanie problemów

### Błąd: "Database not configured"
- Sprawdź czy `NEXT_PUBLIC_SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` są w `.env.local`
- Uruchom migrację Supabase

### Błąd: "Stripe error"
- Sprawdź czy `STRIPE_SECRET_KEY` jest poprawny
- Sprawdź czy `STRIPE_BASIC_PRICE_ID` i `STRIPE_PREMIUM_PRICE_ID` są ustawione
- Upewnij się że używasz klucza **SECRET** (nie publishable)

### Brak produktów w kreatorze
- Sprawdź czy endpoint `/api/products` działa
- Sprawdź czy OpenCart jest skonfigurowany

### Draft nie przywraca się
- Wyczyść localStorage: `localStorage.removeItem('kreator_draft_v1')`
- Sprawdź console.log w przeglądarce

---

## 📝 Co dalej?

1. **Webhook handler** - Utwórz `/api/stripe/webhook` do obsługi zdarzeń Stripe
2. **Tabela subscriptions** - Dodaj tabelę do śledzenia aktywnych subskrypcji
3. **Email powitalny** - Wyślij email po utworzeniu subskrypcji
4. **Panel użytkownika** - Pokaż aktywne subskrypcje w `/panel`

---

## 🎨 Customizacja

### Zmiana cen planów:
Edytuj: `src/app/kreator/page.tsx` → `subscriptionPlans`

### Dodanie nowego planu:
```typescript
const subscriptionPlans = [
  // ... existing plans
  {
    id: 'family',
    name: 'Rodzinny',
    description: '...',
    price: 699,
    meals_per_week: 7,
    features: ['...']
  }
]
```

### Zmiana opcji alergii:
Edytuj: `src/app/kreator/page.tsx` → `allergyOptions`

---

✅ **Kreator gotowy do użycia!**
