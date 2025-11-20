# 📋 System Menu Tygodniowego - Dokumentacja

**Data utworzenia:** 19.11.2025
**Wersja:** 1.0
**Status:** ✅ Zaimplementowane - Gotowe do testów

---

## 📌 Przegląd

System menu tygodniowego umożliwia:
- ✅ Zarządzanie menu przez admina dla każdego tygodnia
- ✅ Wybór dań przez subskrybentów z aktywnego menu
- ✅ Auto-generowanie zamówień (jeśli user nic nie wybierze)
- ✅ Elastyczne zarządzanie dostawami (wtorek/czwartek)
- ✅ Pauza, zmiana dnia dostawy, anulowanie subskrypcji

---

## 🗄️ Struktura Bazy Danych

### 1. `weekly_menus` - Menu tygodniowe

```sql
CREATE TABLE public.weekly_menus (
    id UUID PRIMARY KEY,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    label VARCHAR(100) NOT NULL,  -- np. "Tydzień 24-30 listopada 2025"
    is_active BOOLEAN DEFAULT false,  -- Tylko JEDNO menu może być aktywne
    is_published BOOLEAN DEFAULT false,  -- Czy widoczne dla klientów
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);
```

**Ważne:**
- Tylko jedno menu może mieć `is_active = true` na raz
- `is_published = true` oznacza że menu jest widoczne dla klientów

### 2. `weekly_menu_items` - Produkty w menu

```sql
CREATE TABLE public.weekly_menu_items (
    id UUID PRIMARY KEY,
    weekly_menu_id UUID NOT NULL REFERENCES public.weekly_menus(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,  -- ID produktu z bazy/OpenCart
    position INTEGER DEFAULT 0,  -- Kolejność wyświetlania
    is_featured BOOLEAN DEFAULT false,  -- Czy wyróżnione
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. `subscription_weekly_orders` - Zamówienia tygodniowe

```sql
CREATE TABLE public.subscription_weekly_orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    subscription_id UUID REFERENCES public.subscriptions(id),
    weekly_menu_id UUID NOT NULL REFERENCES public.weekly_menus(id),
    delivery_date DATE NOT NULL,
    delivery_day VARCHAR(20) NOT NULL,  -- 'tuesday' | 'thursday'
    status VARCHAR(50) DEFAULT 'pending',  -- pending | confirmed | delivered | cancelled
    is_auto_generated BOOLEAN DEFAULT false,  -- Czy system sam dobrał
    total_meals INTEGER NOT NULL,  -- people × days
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. `subscription_weekly_order_items` - Dania w zamówieniu

```sql
CREATE TABLE public.subscription_weekly_order_items (
    id UUID PRIMARY KEY,
    weekly_order_id UUID NOT NULL REFERENCES public.subscription_weekly_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. Aktualizacja tabeli `subscriptions`

Dodane kolumny:
```sql
ALTER TABLE public.subscriptions
ADD COLUMN delivery_day VARCHAR(20) DEFAULT 'tuesday',
ADD COLUMN next_delivery_date DATE,
ADD COLUMN last_delivery_date DATE,
ADD COLUMN cutoff_day VARCHAR(20) DEFAULT 'sunday',
ADD COLUMN cutoff_time TIME DEFAULT '23:59:00';
```

---

## 🔄 Flow Użytkownika

### Kreator Subskrypcji (6 kroków)

1. **Krok 1: Wybór Planu**
   - Wybór diet (max 3)
   - Wybór liczby osób (2, 3, 4)
   - Wybór dni w tygodniu (2, 3, 4, 5)
   - Wyświetlenie ceny i rabatu -25%

2. **Krok 2: Dzień Dostawy** ⭐ NOWY
   - Wybór: Wtorek lub Czwartek
   - Informacje:
     - "Zamów do niedzieli 23:59"
     - "Dostawa w cenie subskrypcji"
     - Możliwość zmiany w panelu klienta

3. **Krok 3: Rejestracja**
   - Email
   - Zgody marketingowe

4. **Krok 4: Adres Dostawy**
   - Imię, nazwisko
   - Ulica, miasto, kod pocztowy
   - Telefon
   - Instrukcje dostawy

5. **Krok 5: Płatność**
   - Wybór metody (PayPal/Karty)
   - Informacje o elastyczności

6. **Krok 6: Przekierowanie do Stripe**
   - Utworzenie Stripe Checkout Session
   - Przekierowanie do płatności
   - Po sukcesie: Panel klienta

---

## 👤 Panel Klienta

### Widok Główny

```
┌─────────────────────────────────────────────┐
│ Moja Subskrypcja                            │
├─────────────────────────────────────────────┤
│ Plan: 3 osoby × 4 dni                      │
│ Dostawa: Czwartek                           │
│ Najbliższa dostawa: 24.11.2025             │
│                                             │
│ [Wybierz dania na przyszły tydzień]        │
│ [Zmień liczbę osób/dni]                    │
│ [Zmień dzień dostawy]                      │
│ [Pomiń najbliższy tydzień]                 │
│ [Anuluj subskrypcję]                       │
└─────────────────────────────────────────────┘
```

### Wybór Dań na Tydzień

1. System wyświetla **aktywne menu tygodniowe**
2. User musi wybrać `people × days` dań
3. Przykład: 3 osoby × 4 dni = **12 dań**
4. UI pokazuje:
   - Lista dań z menu tygodniowego
   - Filtry według diet/alergii użytkownika
   - "Twój box" - wybrane dania (12/12)
5. Przycisk "Zapisz mój box na tydzień X"

Po zapisaniu:
- Utworzenie `subscription_weekly_order`
- Dodanie `subscription_weekly_order_items`
- Brak płatności - opłata idzie z subskrypcji Stripe

---

## 🤖 Auto-Generowanie Zamówień

### Cron Job (Niedziela 23:00)

Endpoint: `POST /api/subscription/auto-generate-orders`

**Proces:**
1. Pobierz wszystkie aktywne subskrypcje
2. Sprawdź czy user ma `subscription_weekly_order` na nadchodzący tydzień
3. Jeśli **TAK** → pomiń
4. Jeśli **NIE**:
   - Pobierz menu tygodnia
   - Filtruj według preferencji (diety, alergie)
   - Losowo wybierz `people × days` dań
   - Utwórz `subscription_weekly_order`
   - Wyślij email: "Przygotowaliśmy dla Ciebie box..."

**Bezpieczeństwo:**
```typescript
Authorization: Bearer <CRON_SECRET>
```

Ustaw w `.env.local`:
```env
CRON_SECRET=your-secret-key-here
```

**Harmonogram:**
- Vercel Cron: `0 23 * * 0` (niedziela 23:00)
- LUB zewnętrzny cron (np. cron-job.org)

---

## 🛠️ Panel Admina - Zarządzanie Menu

### Widok Listy Tygodni

```
┌──────────────────────────────────────────────────────────┐
│ Menu Tygodniowe                          [+ Nowy Tydzień]│
├──────────────────────────────────────────────────────────┤
│ • Tydzień 24-30 listopada 2025    [Aktywne] [Edytuj]    │
│   Dania: 25 | Zamówienia: 147                            │
│                                                           │
│ • Tydzień 1-7 grudnia 2025               [Edytuj] [❌]   │
│   Dania: 0 | Zamówienia: 0                               │
└──────────────────────────────────────────────────────────┘
```

### Tworzenie Nowego Menu

**Opcja 1: Od zera**
1. Kliknij "Nowy Tydzień"
2. Podaj:
   - Data rozpoczęcia (np. 2025-12-01)
   - Data zakończenia (np. 2025-12-07)
   - Label (np. "Tydzień 1-7 grudnia 2025")
3. Dodaj produkty:
   - Lista wszystkich produktów (lewo)
   - Wybrane produkty (prawo)
   - Drag & drop / checkboxy
4. Zapisz

**Opcja 2: Skopiuj z poprzedniego**
1. Kliknij "Nowy Tydzień"
2. Kliknij "Skopiuj z poprzedniego tygodnia"
3. System kopiuje wszystkie produkty
4. Edytuj (dodaj/usuń produkty)
5. Zapisz

**Aktywacja menu:**
- Zaznacz "is_active" → menu staje się "bieżące"
- Tylko JEDNO menu może być aktywne
- Klienci widzą tylko aktywne menu

---

## 📡 API Endpoints

### Frontend (dla użytkowników)

#### 1. GET `/api/menu/weekly/current`
Pobiera aktualne menu tygodniowe.

**Response:**
```json
{
  "success": true,
  "menu": {
    "id": "uuid",
    "week_start_date": "2025-11-24",
    "week_end_date": "2025-11-30",
    "label": "Tydzień 24-30 listopada 2025",
    "items": [
      {
        "id": "uuid",
        "product_id": 123,
        "position": 0,
        "product": {
          "id": 123,
          "name": "Kurczak Tikka Masala",
          "image": "...",
          "diets": ["wysokobiałkowa"],
          "allergens": ["mleko"]
        }
      }
    ]
  }
}
```

#### 2. GET `/api/subscription/weekly-order`
Pobiera zamówienie użytkownika na bieżący tydzień.

**Query params:**
- `weekly_menu_id` (optional)

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "delivery_date": "2025-11-28",
    "delivery_day": "thursday",
    "total_meals": 12,
    "items": [...]
  }
}
```

#### 3. POST `/api/subscription/weekly-order`
Zapisuje wybór dań użytkownika.

**Request:**
```json
{
  "weekly_menu_id": "uuid",
  "selected_product_ids": [123, 456, 789, ...],
  "delivery_date": "2025-11-28",
  "delivery_day": "thursday"
}
```

**Walidacja:**
- Liczba dań = `people × days`
- Wszystkie produkty muszą być w menu

---

### Admin (zarządzanie menu)

#### 4. GET `/api/admin/weekly-menu`
Lista wszystkich menu (admin only).

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "menus": [...]
}
```

#### 5. POST `/api/admin/weekly-menu`
Tworzy nowe menu (admin only).

**Request:**
```json
{
  "week_start_date": "2025-12-01",
  "week_end_date": "2025-12-07",
  "label": "Tydzień 1-7 grudnia 2025",
  "is_active": false,
  "is_published": false,
  "product_ids": [123, 456, 789],
  "copy_from_menu_id": "uuid"  // optional
}
```

#### 6. PUT `/api/admin/weekly-menu`
Aktualizuje menu (admin only).

**Request:**
```json
{
  "menu_id": "uuid",
  "is_active": true,
  "product_ids": [123, 456, 789, ...]
}
```

#### 7. DELETE `/api/admin/weekly-menu?id=uuid`
Usuwa menu (tylko jeśli brak zamówień).

---

### Cron (automatyzacja)

#### 8. POST `/api/subscription/auto-generate-orders`
Auto-generuje zamówienia dla userów bez wyboru.

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_subscriptions": 150,
    "generated": 43,
    "skipped": 105,
    "failed": 2
  }
}
```

---

## 🚀 Deployment Checklist

### 1. Migracja Bazy Danych
```bash
# Uruchom migrację w Supabase SQL Editor
cat supabase/migrations/20251119000000_weekly_menu_system.sql
```

### 2. Environment Variables
Dodaj do `.env.local` (i Vercel):
```env
CRON_SECRET=your-random-secret-key-here
```

### 3. Vercel Cron Job
Dodaj do `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/subscription/auto-generate-orders",
    "schedule": "0 23 * * 0"
  }]
}
```

### 4. Admin Setup
- Nadaj użytkownikowi role `admin` w `profiles` table:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@smakowalo.pl';
```

---

## 📖 Przewodniki

### Jak dodać nowy tydzień menu (Admin)

1. **Zaloguj się** jako admin
2. **Przejdź** do `/admin/weekly-menu` (TODO: stworzyć stronę)
3. **Kliknij** "Nowy Tydzień"
4. **Wybierz** daty: 1-7 grudnia 2025
5. **Skopiuj** z poprzedniego tygodnia (opcjonalnie)
6. **Dodaj/Usuń** produkty według potrzeb
7. **Zapisz** jako Draft (`is_published = false`)
8. **Testuj** (tylko admin widzi)
9. **Opublikuj** (`is_published = true`)
10. **Aktywuj** gdy nadejdzie czas (`is_active = true`)

### Jak oznaczyć tydzień jako "aktywny"

**Opcja 1: Admin Panel**
- Kliknij "Aktywuj" przy wybranym tygodniu
- System automatycznie dezaktywuje poprzedni

**Opcja 2: SQL**
```sql
-- Dezaktywuj wszystkie
UPDATE weekly_menus SET is_active = false WHERE is_active = true;

-- Aktywuj wybrany
UPDATE weekly_menus
SET is_active = true, is_published = true
WHERE id = 'uuid-nowego-tygodnia';
```

### Jak działa cron/generator boxów

**Automatycznie (Niedziela 23:00):**
1. System sprawdza wszystkie aktywne subskrypcje
2. Dla każdej sprawdza czy user wybrał dania
3. Jeśli NIE → system losowo dobiera z menu
4. Tworzy zamówienie + wysyła email

**Manualnie (test):**
```bash
curl -X POST https://smakowalo.pl/api/subscription/auto-generate-orders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🎓 Najlepsze Praktyki

### 1. Planowanie Menu
- Twórz menu **tydzień wcześniej**
- Kopiuj z poprzedniego → edytuj
- Testuj jako draft przed publikacją

### 2. Aktywacja
- Aktywuj menu **w poniedziałek rano** (nowy tydzień)
- Poprzednie menu automatycznie dezaktywowane

### 3. Deadline Użytkowników
- User może wybierać dania do **niedzieli 23:59**
- Po deadline → auto-generowanie

### 4. Monitoring
- Sprawdzaj logi auto-generowania
- Email notifications dla failed orders
- Dashboard z statystykami

---

## 🐛 Troubleshooting

### Problem: User nie widzi menu
**Rozwiązanie:**
- Sprawdź `is_active = true` i `is_published = true`
- Sprawdź daty `week_start_date` i `week_end_date`

### Problem: Auto-generowanie nie działa
**Rozwiązanie:**
- Sprawdź logi Vercel Cron
- Verify `CRON_SECRET` w env vars
- Test manualnie przez curl

### Problem: Brak produktów w menu
**Rozwiązanie:**
- Sprawdź `weekly_menu_items` dla danego menu_id
- Verify products są dostępne w `/api/products`

---

## 📊 Metryki i Monitoring

### KPIs
- **% userów wybierających dania:** `(orders_manual / total_orders) * 100`
- **Średnia liczba dań w menu:** count(weekly_menu_items) / count(weekly_menus)
- **% auto-generowanych:** `(auto_generated / total_orders) * 100`

### SQL Queries
```sql
-- Statystyki tygodnia
SELECT
  wm.label,
  COUNT(DISTINCT swo.id) as total_orders,
  COUNT(DISTINCT CASE WHEN swo.is_auto_generated = true THEN swo.id END) as auto_orders,
  COUNT(DISTINCT CASE WHEN swo.is_auto_generated = false THEN swo.id END) as manual_orders
FROM weekly_menus wm
LEFT JOIN subscription_weekly_orders swo ON swo.weekly_menu_id = wm.id
GROUP BY wm.id, wm.label
ORDER BY wm.week_start_date DESC;
```

---

## ✅ Status Implementacji

| Funkcja | Status | Notatki |
|---------|--------|---------|
| Migracja bazy danych | ✅ Gotowe | `20251119000000_weekly_menu_system.sql` |
| API `/api/menu/weekly/current` | ✅ Gotowe | Pobieranie aktywnego menu |
| API `/api/subscription/weekly-order` (GET) | ✅ Gotowe | Pobieranie zamówienia |
| API `/api/subscription/weekly-order` (POST) | ✅ Gotowe | Zapisywanie wyboru |
| API `/api/subscription/auto-generate-orders` | ✅ Gotowe | Cron job |
| API `/api/admin/weekly-menu` | ✅ Gotowe | CRUD dla admina |
| Kreator - Krok 2 (Dzień dostawy) | ✅ Gotowe | Wybór wtorek/czwartek |
| Panel klienta - Widok subskrypcji | ⏳ TODO | Strona `/panel` |
| Panel klienta - Wybór dań | ⏳ TODO | Strona `/panel/select-meals` |
| Admin panel - Zarządzanie menu | ⏳ TODO | Strona `/admin/weekly-menu` |
| Strona "Menu tygodnia" (publiczna) | ⏳ TODO | Strona `/menu-tygodnia` |
| Email notifications | ⏳ TODO | Auto-generated order email |
| Vercel Cron setup | ⏳ TODO | `vercel.json` config |

---

## 🔜 Następne Kroki

1. **Stwórz panel klienta** (`/panel`)
   - Widok subskrypcji
   - Wybór dań na tydzień
   - Zarządzanie (pauza, zmiana dnia, anulowanie)

2. **Stwórz admin panel** (`/admin/weekly-menu`)
   - Lista menu
   - Tworzenie/edycja
   - Kopiowanie z poprzedniego

3. **Strona publiczna** (`/menu-tygodnia`)
   - Podgląd aktywnego menu
   - Marketing dla nowych userów

4. **Email notifications**
   - Auto-generated order
   - Reminder przed deadline
   - Potwierdzenie dostawy

5. **Testy E2E**
   - Kreator + wybór dnia dostawy
   - Panel klienta + wybór dań
   - Auto-generowanie

---

**Autor:** AI Assistant
**Data:** 19.11.2025
**Wersja:** 1.0.0
