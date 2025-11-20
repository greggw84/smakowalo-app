# Pricing Structure - 12 Variants

## 📌 Przegląd

Aplikacja Smakowało oferuje **jedną subskrypcję** z **12 wariantami cenowymi**, zależnymi od:
- **Liczby osób**: 2, 3, 4
- **Dni w tygodniu**: 2, 3, 4, 5

**Razem**: 3 × 4 = **12 kombinacji**

---

## 💰 Tabela Cen

| Liczba osób | Dni w tygodniu | Cena (PLN/tydzień) | Stripe Price ID |
|-------------|----------------|-------------------|-----------------|
| 2           | 2              | 180 zł             | price_1SVD45ChaDkFJkJI2DkNEpkK |
| 2           | 3              | 270 zł             | price_1SVD45ChaDkFJkJIzSzHEwGS |
| 2           | 4              | 360 zł             | price_1SVD45ChaDkFJkJI8OP7MDB3 |
| 2           | 5              | 449 zł             | price_1SVD45ChaDkFJkJIzdQ9CUAI |
| 3           | 2              | 270 zł             | price_1SVD45ChaDkFJkJIwhAc79kF |
| 3           | 3              | 405 zł             | price_1SVD45ChaDkFJkJIavPtADkM |
| 3           | 4              | 540 zł             | price_1SVD45ChaDkFJkJIQD8WJShG |
| 3           | 5              | 675 zł             | price_1SVD45ChaDkFJkJIdMvMGP4O |
| 4           | 2              | 360 zł             | price_1SVD45ChaDkFJkJIKS1x4fwL |
| 4           | 3              | 540 zł             | price_1SVD45ChaDkFJkJIsmkCYQvL |
| 4           | 4              | 720 zł             | price_1SVD45ChaDkFJkJIqwyRP3da |
| 4           | 5              | 900 zł             | price_1SVD45ChaDkFJkJIH0Rw81fj |

---

## 🎯 Flow Użytkownika

### Krok 1: Wybór liczby osób i dni

```
┌──────────────────────────────┐
│  Zapisz się na subskrypcję   │
│                              │
│  Liczba osób:                │
│  [2] [3] [4]                 │
│                              │
│  Dni w tygodniu:             │
│  [2] [3] [4] [5]             │
│                              │
│  ┌────────────────────────┐  │
│  │ Twój wybór:            │  │
│  │ 2 osoby × 3 dni        │  │
│  │                        │  │
│  │ Cena pełna: 270 zł     │  │
│  │ Pierwsze zamówienie:   │  │
│  │ 202.50 zł (-25%)       │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**Po wyborze:**
- Frontend oblicza cenę z tabeli `PRICING`
- Wyświetla panel podsumowania:
  - Twój wybór: X osób, Y dni
  - Nazwa planu: "Subskrypcja Smakowało"
  - Cena pełna: np. 449 zł / tydzień
  - Cena pierwszego zamówienia z rabatem -25%: np. 336.75 zł

### Krok 2-4: Preferencje, dania, płatność
- Bez zmian w istniejącym flow

---

## 🔧 Implementacja Techniczna

### Frontend (`kreator/page.tsx`)

```typescript
// Stripe Price IDs mapping
const PRICE_IDS: Record<string, string> = {
  '2-2': 'price_1SVD45ChaDkFJkJI2DkNEpkK',
  '2-3': 'price_1SVD45ChaDkFJkJIzSzHEwGS',
  // ... etc
};

// Pricing table
const PRICING: Record<string, number> = {
  '2-2': 180,
  '2-3': 270,
  // ... etc
};

// Helper functions
const getPrice = (people: number, days: number): number => {
  const key = `${people}-${days}`;
  return PRICING[key] || 0;
};

const getPriceId = (people: number, days: number): string => {
  const key = `${people}-${days}`;
  return PRICE_IDS[key] || '';
};
```

### Backend (`/api/create-subscription/route.ts`)

```typescript
// Same mapping on backend
const PRICE_IDS: Record<string, string> = {
  '2-2': process.env.STRIPE_PRICE_2_2!,
  '2-3': process.env.STRIPE_PRICE_2_3!,
  // ... etc
};

// Payload from frontend:
{
  numberOfPeople: 2,
  numberOfDays: 3,
  planType: 'weekly',
  // ... rest
}

// Backend selects correct priceId:
const priceId = getPriceId(numberOfPeople, numberOfDays);

// Creates Stripe Checkout Session with that priceId
```

---

## 📊 Environment Variables

### `.env.local` / `.env.example`

```env
# Stripe Subscription Price IDs (12 variants)
STRIPE_PRICE_2_2=price_1SVD45ChaDkFJkJI2DkNEpkK
STRIPE_PRICE_2_3=price_1SVD45ChaDkFJkJIzSzHEwGS
STRIPE_PRICE_2_4=price_1SVD45ChaDkFJkJI8OP7MDB3
STRIPE_PRICE_2_5=price_1SVD45ChaDkFJkJIzdQ9CUAI
STRIPE_PRICE_3_2=price_1SVD45ChaDkFJkJIwhAc79kF
STRIPE_PRICE_3_3=price_1SVD45ChaDkFJkJIavPtADkM
STRIPE_PRICE_3_4=price_1SVD45ChaDkFJkJIQD8WJShG
STRIPE_PRICE_3_5=price_1SVD45ChaDkFJkJIdMvMGP4O
STRIPE_PRICE_4_2=price_1SVD45ChaDkFJkJIKS1x4fwL
STRIPE_PRICE_4_3=price_1SVD45ChaDkFJkJIsmkCYQvL
STRIPE_PRICE_4_4=price_1SVD45ChaDkFJkJIqwyRP3da
STRIPE_PRICE_4_5=price_1SVD45ChaDkFJkJIH0Rw81fj
```

**Vercel:**
- Dodaj wszystkie 12 zmiennych w: `Project Settings → Environment Variables`

---

## 🎁 Rabat -25%

**Pierwszy okres rozliczeniowy** (tydzień) ma rabat -25%.

Implementacja w Stripe:
- Można użyć **Stripe Coupons** (opcjonalnie)
- Lub manualne obliczenie na frontendzie (tylko do wyświetlenia)

Frontend wyświetla:
```
Cena pełna: 449 zł
Pierwsze zamówienie: 336.75 zł (-25%)
```

**Note:** To jest tylko informacyjne. Faktyczny rabat musi być skonfigurowany w Stripe Dashboard jako:
- Coupon code (promocja)
- LUB Trial period (7 dni gratis, potem pełna cena)

---

## 🧪 Testing

### Test Flow:

1. **Kreator** → Krok 1
2. Wybierz **2 osoby**, **3 dni**
3. Sprawdź panel podsumowania:
   - Cena pełna: **270 zł**
   - Pierwsze zamówienie: **202.50 zł** (-25%)
4. Kliknij **Dalej**
5. Wybierz diety i alergie
6. Wybierz dania (3 dania)
7. **Opłać subskrypcję**
8. Sprawdź Stripe Checkout:
   - Produkt: Subskrypcja Smakowało (2 osoby, 3 dni)
   - Cena: **270 zł/tydzień** (lub z rabatem jeśli skonfigurowany)

---

## 🚀 Rozszerzalność

### Dodanie nowych kombinacji:

1. **Stripe Dashboard:**
   - Utwórz nowy produkt z ceną
   - Skopiuj Price ID

2. **Environment Variables:**
   - Dodaj `STRIPE_PRICE_X_Y=price_...`

3. **Frontend:**
   ```typescript
   const PRICE_IDS: Record<string, string> = {
     // ... existing
     '5-2': process.env.NEXT_PUBLIC_STRIPE_PRICE_5_2 || 'price_...',
   };

   const PRICING: Record<string, number> = {
     // ... existing
     '5-2': 450,
   };
   ```

4. **Backend:**
   ```typescript
   const PRICE_IDS: Record<string, string> = {
     // ... existing
     '5-2': process.env.STRIPE_PRICE_5_2!,
   };
   ```

### Dodanie typów diet (np. Vege, Keto):

Możliwe przez dodanie dodatkowych Price w Stripe z metadata:
```json
{
  "people": 2,
  "days": 3,
  "plan_type": "vege"
}
```

Następnie rozszerzyć mapę PRICE_IDS:
```typescript
const PRICE_IDS: Record<string, Record<string, string>> = {
  'standard': {
    '2-2': 'price_...',
    '2-3': 'price_...',
  },
  'vege': {
    '2-2': 'price_vege_...',
    '2-3': 'price_vege_...',
  },
};
```

---

## ✅ Checklist

- [x] Usunięcie Basic/Premium planu
- [x] Dodanie PRICE_IDS mapping (12 variants)
- [x] Dodanie PRICING table (ceny dla każdej kombinacji)
- [x] Nowy krok 1: Wybór osób/dni + panel podsumowania
- [x] Zaktualizowanie kroku 2: Tylko diety + alergie
- [x] Zaktualizowanie handleSubscriptionPayment: użycie numberOfPeople/numberOfDays
- [x] Zaktualizowanie backend API: getPriceId(people, days)
- [x] Dodanie env variables (12 Price IDs)
- [x] Dokumentacja: PRICING_STRUCTURE.md

**Gotowe do testowania!** 🎉

---

**Ostatnia aktualizacja:** Wersja 195
**Data:** 19.11.2025
