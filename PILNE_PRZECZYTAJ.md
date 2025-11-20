# 🚨 PILNE - NAPRAW PŁATNOŚCI TERAZ!

## ❌ Problem
**Stripe nie ma Price IDs w Vercel!**

Błąd który widzisz:
```
No such price: 'price_1SVWHUChaDkFJkJIAEZbXXei'
```

---

## ✅ Rozwiązanie - Wybierz JEDEN sposób:

### 🚀 SPOSÓB 1: Automatyczny (2 minuty)

**Jeśli masz Vercel CLI:**

```bash
# 1. Zainstaluj Vercel CLI (jeśli nie masz)
npm i -g vercel

# 2. Zaloguj się
vercel login

# 3. Link do projektu
vercel link

# 4. Uruchom skrypt
./add-to-vercel.sh
```

Ten skrypt automatycznie doda wszystkie 12 zmiennych do Vercel!

---

### 🖱️ SPOSÓB 2: Ręcznie przez Dashboard (10 minut)

1. **Otwórz:** https://vercel.com/dashboard
2. **Kliknij:** na projekt `smakowalo-app`
3. **Idź do:** Settings → Environment Variables
4. **Kliknij:** "Add New" → "Paste from .env"
5. **Skopiuj CAŁĄ treść** z pliku `.vercel-env-vars.txt` (jest w głównym folderze)
6. **Wklej** do Vercel
7. **Zaznacz:** Production, Preview, Development (wszystkie 3!)
8. **Kliknij:** Save

**Lub dodaj pojedynczo** - każdą zmienną z tabeli poniżej.

---

## 📋 Zmienne do Dodania (jeśli robisz ręcznie)

Skopiuj każdą linię i dodaj jako osobną zmienną w Vercel:

```
STRIPE_PRICE_2_2=price_1SVD45ChaDkFJkJI2DkNEpkK
STRIPE_PRICE_2_3=price_1SVWHUChaDkFJkJIAEZbXXei
STRIPE_PRICE_2_4=price_1SVD45ChaDkFJkJI8OP7MDB3
STRIPE_PRICE_2_5=price_1SVD45ChaDkFJkJIzdO9CUAI
STRIPE_PRICE_3_2=price_1SVD45ChaDkFJkJIwhAc79kF
STRIPE_PRICE_3_3=price_1SVD45ChaDkFJkJIavPtADkM
STRIPE_PRICE_3_4=price_1SVD45ChaDkFJkJIQD8WJShG
STRIPE_PRICE_3_5=price_1SVD45ChaDkFJkJIdMvMGP4O
STRIPE_PRICE_4_2=price_1SVD45ChaDkFJkJIKS1x4fwL
STRIPE_PRICE_4_3=price_1SVD45ChaDkFJkJIsmkCYQvL
STRIPE_PRICE_4_4=price_1SVD45ChaDkFJkJIgwyRP3da
STRIPE_PRICE_4_5=price_1SVD45ChaDkFJkJIH0Rw81fj
```

**Dla KAŻDEJ zmiennej:**
- ✅ Zaznacz: Production
- ✅ Zaznacz: Preview
- ✅ Zaznacz: Development
- ✅ Kliknij: Save

---

## ⏱️ Po Dodaniu

1. **Czekaj 2-3 minuty** - Vercel automatycznie zrobi redeploy
2. **Sprawdź deployment**:
   - Idź do: https://vercel.com/dashboard
   - Kliknij: Deployments
   - Poczekaj aż status będzie: ✅ Ready

3. **Testuj kreator**:
   - Idź na: https://smakowalo.pl/kreator
   - Wybierz plan (np. 2 osoby × 3 dni)
   - Przejdź do Step 7 - płatności
   - Powinno przekierować do Stripe ✅

---

## 🔍 Sprawdź Czy Działa

Po dodaniu zmiennych, otwórz w przeglądarce:
```
https://smakowalo.pl/api/check-stripe-config
```

**Powinno pokazać:**
```json
{
  "allConfigured": true,
  "missingCount": 0
}
```

Jeśli pokazuje `allConfigured: false` - zmienne jeszcze się nie zaaplikowały, poczekaj minutę i odśwież.

---

## ❓ Dlaczego To Się Stało?

- ✅ Lokalnie (na twoim komputerze) wszystko działa bo masz `.env.local`
- ❌ Vercel NIE czyta `.env.local` z GitHub
- ❌ Vercel potrzebuje WŁASNYCH zmiennych w dashboard
- ✅ Po dodaniu zmiennych Stripe zacznie widzieć Price IDs

---

## 📚 Dodatkowe Pliki Pomocy

- `.same/VERCEL_FIX_NOW.md` - Szczegółowy guide
- `.vercel-env-vars.txt` - Zmienne do skopiowania
- `add-to-vercel.sh` - Automatyczny skrypt

---

## 🆘 Potrzebujesz Pomocy?

1. Sprawdź deployment logs w Vercel
2. Sprawdź czy wszystkie 12 zmiennych są dodane
3. Upewnij się że są w Production, Preview i Development
4. Zaczekaj 2-3 minuty na redeploy

---

**🎯 Zrób to TERAZ - potrwa max 10 minut i płatności zaczną działać!**

Powered by [Same.new](https://same.new)
