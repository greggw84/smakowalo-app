# Przepływ Wyboru Dań w Subskrypcji

Ten dokument opisuje jak działa system wyboru dań dla subskrypcji w aplikacji Smakowało.

## Przegląd

Użytkownicy z aktywną subskrypcją mogą:
1. Przeglądać dostępne menu tygodniowe
2. Wybierać dania na podstawie swojego planu (liczba osób × liczba dni)
3. Uwzględniać swoje preferencje dietetyczne i alergie
4. Pobierać terminy dostaw do kalendarza

## Kluczowe Komponenty

### Typy (`src/types/subscription.ts`)

Definiuje główne interfejsy:
- `Meal` - dane produktu/dania
- `WeeklyMenu` - menu tygodniowe z pozycjami
- `MealSelection` - wybór dania przez użytkownika
- `SelectionStatus` - status wyboru: 'open', 'closed', 'completed', 'incomplete'
- `UserPreferences` - preferencje dietetyczne i alergie użytkownika

### Helpery Statusu Wyboru (`src/lib/subscription/selectionStatus.ts`)

```typescript
// Sprawdza czy deadline minął
isSelectionDeadlinePassed(deliveryDate: Date, now?: Date): boolean

// Pobiera status wyboru
getSelectionStatus(now, deliverySlot, currentSelections, requiredMealsCount): SelectionStatus

// Pobiera szczegółowe info o statusie z polskimi komunikatami
getSelectionStatusInfo(now, deliveryDate, currentSelections, requiredMealsCount): SelectionStatusInfo
```

### Helpery Auto-selekcji (`src/lib/subscription/autoSelection.ts`)

```typescript
// Sprawdza czy danie zawiera alergeny
mealContainsAllergen(meal, userAllergies): boolean

// Sprawdza czy danie pasuje do diety
mealFitsDietPreferences(meal, userDiets): boolean

// Generuje automatyczny wybór dań
generateAutoSelection(availableMeals, preferences, mealsPerDay, numberOfDays): MealSelection[]

// Pobiera dania z ostrzeżeniem o alergenach
getMealsWithAllergenWarning(meals, preferences): number[]

// Pobiera rekomendowane dania
getRecommendedMeals(meals, preferences): number[]
```

### Eksport Kalendarza (`src/lib/calendar/ics.ts`)

```typescript
// Buduje plik ICS dla dostawy
buildDeliveryIcs(options: DeliveryICSOptions): string

// Pobiera plik kalendarza
downloadDeliveryCalendarEvent(options: DeliveryICSOptions): void
```

## Zasada 48h Cutoff

Deadline na wybór dań jest **48 godzin przed datą dostawy**.

### Obliczanie Deadline'u

```typescript
// src/lib/subscription-utils.ts
export const DEADLINE_HOURS_BEFORE_DELIVERY = 48;

export function calculateDeadline(deliveryDate: Date): Date {
  const deadline = new Date(deliveryDate);
  deadline.setDate(deadline.getDate() - 2); // 48h / 24h = 2 dni
  deadline.setHours(23, 59, 0, 0);
  return deadline;
}
```

### Przykład

| Dzień dostawy | Deadline wyboru |
|---------------|-----------------|
| Wtorek 10:00 | Niedziela 23:59 |
| Czwartek 10:00 | Wtorek 23:59 |

### Zachowanie po Deadline

Po upływie deadline'u:
1. Przycisk "Zapisz wybór" jest zablokowany
2. Karty dań są wyszarzone i nieklikalne
3. Wyświetlany jest banner "Wybór dań zamknięty"
4. System automatycznie dobiera dania według preferencji

## Eksport Kalendarza (.ics)

### Generowanie Pliku ICS

Plik `.ics` zawiera:
- **SUMMARY**: "Smakowało - Dostawa (Wtorek/Czwartek)"
- **DTSTART/DTEND**: Okno dostawy 10:00-12:00
- **DESCRIPTION**: Szczegóły planu i liczba posiłków
- **LOCATION**: Adres dostawy (jeśli podany)
- **VALARM**: Przypomnienia:
  - 1 dzień przed: "Jutro dostawa Smakowało!"
  - 2 godziny przed: "Dostawa Smakowało za 2 godziny!"

### Użycie

Ikona kalendarza jest wyświetlana przy:
- Kafelku "Najbliższa dostawa" w panelu subskrypcji
- Kafelku "Kolejna dostawa" w panelu subskrypcji

Kliknięcie pobiera plik `.ics`, który można zaimportować do:
- Google Calendar
- Apple Calendar
- Outlook
- Innych klientów obsługujących format iCalendar

## Preferencje i Alergie

### Wpływ na Wyświetlanie Menu

1. **Alergie (obowiązkowe)**:
   - Dania z alergenami są oznaczone czerwonym trójkątem
   - Nie można ich wybrać (kliknięcie pokazuje ostrzeżenie)
   - Są wyszarzone w UI

2. **Diety (preferencja)**:
   - Dania pasujące do diety mają badge "Dla Ciebie" (żółta gwiazdka)
   - Pozostałe dania są normalnie dostępne

### Automatyczny Dobór Dań

Gdy użytkownik nie wybierze dań przed deadline'em:

1. **Filtracja obowiązkowa**: Wykluczenie wszystkich dań z alergenami
2. **Preferencja**: Priorytet dla dań pasujących do diety
3. **Różnorodność**: Unikanie duplikatów gdy to możliwe
4. **Fallback**: Jeśli brakuje dań, duplikowanie bezpiecznych opcji

```typescript
const selections = generateAutoSelection(
  availableMeals,
  { allergies: ['gluten', 'nuts'], diets: ['vegetarian'] },
  2, // osób
  3  // dni
);
// Zwraca MealSelection[] z 6 daniami (2 × 3)
```

## Tabele Supabase

### `weekly_menus`
- `id`: UUID
- `week_start_date`: Data początku tygodnia
- `week_end_date`: Data końca tygodnia
- `label`: Etykieta (np. "Menu 2-8 grudnia")
- `is_active`: Czy menu jest aktywne

### `weekly_menu_items`
- `id`: UUID
- `weekly_menu_id`: FK do weekly_menus
- `product_id`: FK do products
- `day_of_week`: Dzień tygodnia (0-6)

### `subscription_weekly_orders`
- `id`: Serial
- `user_id`: UUID użytkownika
- `subscription_id`: FK do subscriptions
- `weekly_menu_id`: FK do weekly_menus
- `delivery_date`: Data dostawy
- `delivery_day`: 'tuesday' | 'thursday'
- `status`: 'pending' | 'scheduled' | 'delivered' | 'skipped'
- `is_auto_generated`: Boolean - czy system wygenerował
- `total_meals`: Liczba posiłków

### `subscription_weekly_order_items`
- `id`: Serial
- `weekly_order_id`: FK do subscription_weekly_orders
- `product_id`: FK do products
- `quantity`: Ilość

## API Routes

### GET `/api/menu/weekly/current`
Pobiera aktualnie aktywne menu tygodniowe z produktami.

**Response:**
```json
{
  "success": true,
  "menu": {
    "id": "uuid",
    "week_start_date": "2024-12-02",
    "week_end_date": "2024-12-08",
    "label": "Menu 2-8 grudnia",
    "items": [{ "product": { ... } }]
  }
}
```

### GET `/api/subscription/weekly-order`
Pobiera zamówienie tygodniowe użytkownika.

**Query params:**
- `weekly_menu_id` (opcjonalny): ID konkretnego menu

**Headers:**
- `Authorization: Bearer <access_token>`

### POST `/api/subscription/weekly-order`
Zapisuje wybór dań.

**Body:**
```json
{
  "weekly_menu_id": "uuid",
  "selected_product_ids": [1, 2, 3, 4, 5, 6],
  "delivery_day": "tuesday"
}
```

**Walidacja:**
- Użytkownik musi mieć aktywną subskrypcję
- Liczba wybranych dań musi = `people × days`
- Deadline nie może być przekroczony (walidacja po stronie klienta)

## Statusy Wyboru

| Status | Opis | UI |
|--------|------|-----|
| `open` | Okno wyboru otwarte, brak wyborów | Zielony przycisk "Chcę sam wybrać dania" |
| `incomplete` | Okno otwarte, wybory niekompletne | Żółty przycisk "Dokończ wybór dań" |
| `completed` | Wszystkie dania wybrane, przed deadline | Outline przycisk "Zmień wybór dań" |
| `closed` | Po deadline | Zablokowany przycisk "Wybór dań zamknięty" |

## Polskie Teksty UI

### Przyciski
- "Chcę sam wybrać dania" - główny CTA
- "Zapisz wybór dań" - zapis selekcji
- "Wróć do panelu" - powrót
- "Zmień wybór" - edycja istniejącego wyboru
- "Dokończ wybór dań" - dla incomplete

### Statusy
- "Wybór dań otwarty" - badge dla open
- "Dania wybrane" - badge dla completed
- "Wybór dań zamknięty" - badge dla closed

### Ostrzeżenia
- "Wybór dań zamknięty 48h przed dostawą"
- "Zawiera alergeny z Twojej listy"
- "Aktualnie nie ma dostępnego menu na najbliższy tydzień"

### Tooltips
- "Dodaj do kalendarza" - dla ikony kalendarza
