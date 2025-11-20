# 🚨 PILNE: Dodaj Zmienne do Vercel TERAZ!

**Problem:** Stripe nie widzi Price IDs bo **NIE MA ICH W VERCEL!**

---

## 🎯 2 Sposoby Naprawy

### SPOSÓB 1: Przez Dashboard Vercel (10 minut)

#### Krok 1: Otwórz Vercel
1. Idź do: https://vercel.com/dashboard
2. Zaloguj się
3. Kliknij na projekt **smakowalo-app**

#### Krok 2: Otwórz Environment Variables
1. Kliknij **Settings** (górny pasek)
2. Kliknij **Environment Variables** (lewy sidebar)

#### Krok 3: Dodaj WSZYSTKIE 12 zmiennych

**OPCJA A: Po jednej (wolniejsze)**
Dla każdej zmiennej:
1. Kliknij "Add New"
2. Skopiuj Key i Value z tabeli poniżej
3. Zaznacz: Production, Preview, Development (wszystkie 3!)
4. Kliknij Save

**OPCJA B: Bulk import (SZYBSZE!)**
1. Kliknij "Add New" → "Paste from .env"
2. Skopiuj CAŁĄ treść z pliku `.vercel-env-vars.txt` (w root projektu)
3. Wklej
4. Zaznacz: Production, Preview, Development
5. Kliknij Save All

---

### SPOSÓB 2: Przez Vercel CLI (2 minuty) ⚡

```bash
# Zainstaluj Vercel CLI (jeśli nie masz)
npm i -g vercel

# Zaloguj się
vercel login

# Przejdź do projektu
cd /path/to/smakowalo-app

# Link do projektu Vercel
vercel link

# Dodaj wszystkie zmienne AUTOMATYCZNIE
vercel env add STRIPE_PRICE_2_2 production preview development <<< "price_1SVD45ChaDkFJkJI2DkNEpkK"
vercel env add STRIPE_PRICE_2_3 production preview development <<< "price_1SVWHUChaDkFJkJIAEZbXXei"
vercel env add STRIPE_PRICE_2_4 production preview development <<< "price_1SVD45ChaDkFJkJI8OP7MDB3"
vercel env add STRIPE_PRICE_2_5 production preview development <<< "price_1SVD45ChaDkFJkJIzdO9CUAI"
vercel env add STRIPE_PRICE_3_2 production preview development <<< "price_1SVD45ChaDkFJkJIwhAc79kF"
vercel env add STRIPE_PRICE_3_3 production preview development <<< "price_1SVD45ChaDkFJkJIavPtADkM"
vercel env add STRIPE_PRICE_3_4 production preview development <<< "price_1SVD45ChaDkFJkJIQD8WJShG"
vercel env add STRIPE_PRICE_3_5 production preview development <<< "price_1SVD45ChaDkFJkJIdMvMGP4O"
vercel env add STRIPE_PRICE_4_2 production preview development <<< "price_1SVD45ChaDkFJkJIKS1x4fwL"
vercel env add STRIPE_PRICE_4_3 production preview development <<< "price_1SVD45ChaDkFJkJIsmkCYQvL"
vercel env add STRIPE_PRICE_4_4 production preview development <<< "price_1SVD45ChaDkFJkJIgwyRP3da"
vercel env add STRIPE_PRICE_4_5 production preview development <<< "price_1SVD45ChaDkFJkJIH0Rw81fj"

# Redeploy
vercel --prod
```

---

## 📋 Tabela Zmiennych do Dodania

| Key | Value |
|-----|-------|
| `STRIPE_PRICE_2_2` | `price_1SVD45ChaDkFJkJI2DkNEpkK` |
| `STRIPE_PRICE_2_3` | `price_1SVWHUChaDkFJkJIAEZbXXei` |
| `STRIPE_PRICE_2_4` | `price_1SVD45ChaDkFJkJI8OP7MDB3` |
| `STRIPE_PRICE_2_5` | `price_1SVD45ChaDkFJkJIzdO9CUAI` |
| `STRIPE_PRICE_3_2` | `price_1SVD45ChaDkFJkJIwhAc79kF` |
| `STRIPE_PRICE_3_3` | `price_1SVD45ChaDkFJkJIavPtADkM` |
| `STRIPE_PRICE_3_4` | `price_1SVD45ChaDkFJkJIQD8WJShG` |
| `STRIPE_PRICE_3_5` | `price_1SVD45ChaDkFJkJIdMvMGP4O` |
| `STRIPE_PRICE_4_2` | `price_1SVD45ChaDkFJkJIKS1x4fwL` |
| `STRIPE_PRICE_4_3` | `price_1SVD45ChaDkFJkJIsmkCYQvL` |
| `STRIPE_PRICE_4_4` | `price_1SVD45ChaDkFJkJIgwyRP3da` |
| `STRIPE_PRICE_4_5` | `price_1SVD45ChaDkFJkJIH0Rw81fj` |

---

## ✅ Po Dodaniu

1. **Czekaj 2-3 minuty** - Vercel automatycznie zrobi redeploy
2. **Sprawdź deployment**: https://vercel.com/dashboard → Deployments
3. **Testuj** kreator: https://smakowalo.pl/kreator
4. **Sprawdź API**: https://smakowalo.pl/api/check-stripe-config

---

## 🎯 Dlaczego To Nie Działało?

- ✅ `.env.local` jest TYLKO lokalnie (na twoim komputerze)
- ❌ Vercel NIE czyta `.env.local` z GitHub
- ✅ Vercel potrzebuje własnych Environment Variables w dashboard
- ❌ Bez tego Stripe nie widzi Price IDs → ERROR!

---

## 📸 Screenshot Guide

### Dashboard → Settings → Environment Variables
![Vercel Settings](https://assets.vercel.com/image/upload/front/vercel/env-vars.png)

### Kliknij "Add New" lub "Paste from .env"
1. Jeśli "Paste from .env" - skopiuj z `.vercel-env-vars.txt`
2. Zaznacz wszystkie 3 environments
3. Save

---

## ⚠️ Ważne!

**KAŻDA** zmienna MUSI mieć zaznaczone:
- ✅ Production
- ✅ Preview
- ✅ Development

Inaczej nie będzie działać na produkcji!

---

**Po dodaniu zmiennych wszystko zacznie działać!** 🎉

Powered by [Same.new](https://same.new)
