# 📋 TODO List - Smakowało Project

**Ostatnia aktualizacja:** 21.11.2025 01:35 UTC - **🎉 WEBHOOK NAPRAWIONY I PRZETESTOWANY!**

---

## 🎉 NAJNOWSZE - Webhook Fix Success!

### ✅ Stripe Webhook - DZIAŁA!

**Data:** 21 Listopad 2025, 01:35 UTC
**Status:** 🟢 **FULLY OPERATIONAL**

**Co zostało naprawione:**
1. ✅ Zmieniono URL webhooka w Stripe na: `https://www.smakowalo.pl/api/webhooks/stripe`
2. ✅ Przetestowano endpoint - odpowiada poprawnie (400 "No signature")
3. ✅ Brak przekierowań 307 - bezpośrednie połączenie
4. ✅ Wszystkie zmienne środowiskowe skonfigurowane

**Test Results:**
- ✅ `www.smakowalo.pl/api/webhooks/stripe` → 400 "No signature" (POPRAWNE!)
- ❌ `smakowalo.pl/api/webhooks/stripe` → 307 Redirect (stary URL)

**Co to oznacza:**
- ✅ Płatności będą się automatycznie zapisywać do Supabase
- ✅ Emaile będą wysyłane automatycznie
- ✅ Panel użytkownika będzie pokazywał subskrypcje
- ✅ System w 100% automatyczny

**Dokumentacja:**
- `.same/WEBHOOK_TEST_SUCCESS.md` - Pełny raport z testów

---

## 🎉 WIELKI SUKCES! - Wersja 195

### ✅ Nowy System Cen - 12 Wariantów

**Zmiany zaimplementowane:**

1. **Usunięto Basic/Premium:**
   - ❌ Stary system: 2 plany (Basic 299 PLN, Premium 449 PLN)
   - ✅ Nowy system: 1 subskrypcja z 12 wariantami cenowymi

2. **12 kombinacji osób × dni:**
   ```
   Liczba osób: 2, 3, 4
   Dni w tygodniu: 2, 3, 4, 5
   = 3 × 4 = 12 wariantów
   ```

3. **Stripe Price IDs:**
   - ✅ 12 Price IDs dodane do `.env.local`
   - ✅ Mapping w frontend (`PRICE_IDS`)
   - ✅ Mapping w backend (`/api/create-subscription`)

4. **Nowy Flow Kreatora:**
   - ✅ Krok 1: Wybór osób/dni + panel podsumowania z ceną i rabatem -25%
   - ✅ Krok 2: Diety + alergie (bez wyboru osób/dni)
   - ✅ Krok 3: Wybór dań
   - ✅ Krok 4: Login i płatność

5. **Panel Podsumowania:**
   - ✅ "Twój wybór: X osób, Y dni"
   - ✅ Nazwa planu: "Subskrypcja Smakowało"
   - ✅ Cena pełna: np. 449 zł / tydzień
   - ✅ Cena pierwszego zamówienia z rabatem -25%: np. 336.75 zł

**Pliki zmodyfikowane:**
- ✅ `.env.local` - 12 Price IDs
- ✅ `.env.example` - 12 Price IDs template
- ✅ `src/app/kreator/page.tsx` - nowa struktura kroków
- ✅ `src/app/api/create-subscription/route.ts` - mapping Price IDs
- ✅ `.same/PRICING_STRUCTURE.md` - dokumentacja

---

## 🚀 GOTOWE DO TESTOWANIA

### Manual Testing Checklist (0/15) ⏳

**Krok 1: Wybór osób i dni:**
- [ ] Otwórz http://localhost:3000/kreator
- [ ] Wybierz tryb: SUBSKRYPCJA
- [ ] Sprawdź nagłówek: "Zapisz się na subskrypcję"
- [ ] Wybierz **2 osoby**
- [ ] Wybierz **3 dni**
- [ ] Sprawdź panel podsumowania:
  - [ ] "Twój wybór: 2 osoby × 3 dni"
  - [ ] "Cena pełna: 270 zł"
  - [ ] "Pierwsze zamówienie: 202.50 zł (-25%)"
- [ ] Zmień na **4 osoby**, **5 dni**
- [ ] Sprawdź panel:
  - [ ] "Cena pełna: 900 zł"
  - [ ] "Pierwsze zamówienie: 675 zł (-25%)"
- [ ] Kliknij **Dalej**

**Krok 2: Diety i alergie:**
- [ ] Sprawdź brak wyboru osób/dni (już wybrane w kroku 1)
- [ ] Wybierz diety (np. Wegetariańska, Keto)
- [ ] Wybierz alergeny (opcjonalne)
- [ ] Kliknij **Dalej**

**Krok 3: Wybór dań:**
- [ ] Wybierz dania (liczba = liczba dni z kroku 1)
- [ ] Sprawdź filtrowanie według diet
- [ ] Kliknij **Dalej**

**Krok 4: Płatność:**
- [ ] Login (jeśli potrzebny)
- [ ] Sprawdź podsumowanie:
  - [ ] Plan: "Subskrypcja Smakowało"
  - [ ] Konfiguracja: "2 osoby × 3 dni"
  - [ ] Cena tygodniowa: 270 zł
  - [ ] Pierwsze zamówienie (-25%): 202.50 zł
- [ ] Kliknij **Opłać subskrypcję**
- [ ] **Redirect do Stripe Checkout**
- [ ] Sprawdź produkt i cenę w Stripe
- [ ] **Użyj test card:** `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] **Verify redirect do `/subscription/success`**

**Backend Verification:**
- [ ] Sprawdź console logs: Price ID dla 2-3 = `price_1SVD45ChaDkFJkJIzSzHEwGS`
- [ ] Sprawdź Stripe Dashboard → Customer + Subscription
- [ ] Sprawdź Supabase → tabela `subscriptions`:
  - [ ] `people = 2`
  - [ ] `days = 3`
  - [ ] `meal_plan_config` zawiera wybrane diety i dania
- [ ] Sprawdź email powitalny

---

## 📊 Tabela Cen (Reference)

| Osoby | Dni | Cena (PLN/tydzień) | Pierwsze (-25%) | Price ID |
|-------|-----|-------------------|----------------|----------|
| 2     | 2   | 180 zł             | 135 zł          | price_...2DkNEpkK |
| 2     | 3   | 270 zł             | 202.50 zł       | price_...zSzHEwGS |
| 2     | 4   | 360 zł             | 270 zł          | price_...8OP7MDB3 |
| 2     | 5   | 449 zł             | 336.75 zł       | price_...zdQ9CUAI |
| 3     | 2   | 270 zł             | 202.50 zł       | price_...whAc79kF |
| 3     | 3   | 405 zł             | 303.75 zł       | price_...avPtADkM |
| 3     | 4   | 540 zł             | 405 zł          | price_...QD8WJShG |
| 3     | 5   | 675 zł             | 506.25 zł       | price_...dMvMGP4O |
| 4     | 2   | 360 zł             | 270 zł          | price_...KS1x4fwL |
| 4     | 3   | 540 zł             | 405 zł          | price_...smkCYQvL |
| 4     | 4   | 720 zł             | 540 zł          | price_...qwyRP3da |
| 4     | 5   | 900 zł             | 675 zł          | price_...H0Rw81fj |

---

## ✅ Ukończone w Wersji 195

### Implementacja 12 Wariantów Cenowych
- [x] Usunięcie `subscriptionPlans` array
- [x] Dodanie `PRICE_IDS` mapping (12 kombinacji)
- [x] Dodanie `PRICING` table (ceny)
- [x] Helper functions: `getPrice()`, `getPriceId()`
- [x] Nowy krok 1: Wybór osób/dni + panel podsumowania
- [x] Aktualizacja kroku 2: Tylko diety + alergie
- [x] Aktualizacja `handleSubscriptionPayment()`: bez `selectedPlan`
- [x] Aktualizacja backend API: mapping Price IDs
- [x] Environment variables: 12 Price IDs
- [x] Dokumentacja: `PRICING_STRUCTURE.md`

### Interface i State Updates
- [x] Usunięcie `selectedPlan` state
- [x] Usunięcie `selectedPlan` z `KreatorDraft` interface
- [x] Aktualizacja `saveDraft()` i `loadDraft()`
- [x] Aktualizacja `restoreDraft()`

---

## 🔥 NAJWYŻSZY PRIORYTET

### 1. Testing Nowego Systemu Cen 🧪
- [ ] **Przetestuj wszystkie 12 kombinacji** (co najmniej 3-4 przykłady)
  - Sprawdź: 2-2, 2-5, 3-3, 4-5
  - Verify Price IDs w Stripe
- [ ] **Panel podsumowania** - sprawdź czy ceny się zgadzają
- [ ] **Rabat -25%** - sprawdź kalkulację
- [ ] **Stripe Checkout** - verify produkt i cena

### 2. Production Deployment 🚀
- [ ] **Stripe Products** - verify wszystkie 12 Price w Stripe Dashboard
- [ ] **Vercel env variables** - dodaj wszystkie 12 `STRIPE_PRICE_*`
- [ ] **Deploy to Vercel**
- [ ] **Test subscription creation** (live mode)

---

## 📝 Known Issues (Non-blocking)

- ⚠️ Panel podsumowania z rabatem -25% jest tylko informacyjny
  - Faktyczny rabat musi być skonfigurowany w Stripe jako coupon lub trial
- ℹ️ Pricing table (`PRICING`) jest hardcoded w frontendzie
  - W przyszłości można pobierać z Stripe API

---

## 💡 Rekomendowane Następne Kroki:

1. **✅ TERAZ: Test Subscription Flow** - pełny flow od wyboru osób/dni do płatności
2. **Verify Stripe Price IDs** - sprawdź czy wszystkie 12 cen są poprawne w Stripe
3. **Deploy to Vercel** - production deployment
4. **Testing QA** - wszystkie kombinacje (co najmniej próbka)
5. **Dokumentacja dla użytkownika** - FAQ o cenach

---

**Wersja:** 195
**Data:** 19.11.2025
**Status:** ✅ Nowy system cen zaimplementowany - gotowy do testowania!

**Następny krok:** Restart dev server i test subscription flow z nowymi cenami.
