# 🚀 Deployment Guide - Netlify

## Przewodnik deploymentu aplikacji Smakowało na Netlify

### 📋 Wymagania wstępne

1. **Konto Netlify** - [netlify.com](https://netlify.com)
2. **Konto GitHub** z repozytorium aplikacji
3. **Klucze Supabase** (opcjonalne - aplikacja działa z mock data)
4. **Klucze Stripe** (opcjonalne - dla płatności)

### 🔧 Konfiguracja zmiennych środowiskowych

#### W Netlify Dashboard:
1. Przejdź do **Site settings > Environment variables**
2. Dodaj następujące zmienne:

#### 🔐 Zmienne wymagane (Supabase - opcjonalne):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 💳 Zmienne płatności (Stripe - opcjonalne):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 🌐 Zmienne podstawowe:
```
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NODE_VERSION=20
```

### 📁 Struktura deploymentu

```
smakowalo-app/
├── netlify.toml          # Konfiguracja Netlify
├── next.config.js        # Konfiguracja Next.js
├── package.json          # Dependencies i scripts
├── DEPLOYMENT.md         # Ten przewodnik
└── src/
    ├── app/             # App Router pages
    ├── components/      # Komponenty React
    ├── contexts/        # Context providers
    └── lib/            # Utilities i konfiguracja
```

### 🚀 Kroki deploymentu

#### Opcja 1: Deploy przez GitHub (rekomendowane)
1. **Push kod do GitHub**:
   ```bash
   git add .
   git commit -m "🚀 Deploy ready"
   git push origin main
   ```

2. **Podłącz repozytorium w Netlify**:
   - Zaloguj się do Netlify
   - Kliknij "New site from Git"
   - Wybierz GitHub i swoje repozytorium
   - Ustaw build settings:
     - **Build command**: `bun install && bun run build`
     - **Publish directory**: `.next`

3. **Dodaj zmienne środowiskowe** (patrz sekcja wyżej)

4. **Deploy** - Netlify automatycznie zbuduje i wdroży aplikację

#### Opcja 2: Manual deploy
```bash
# Zbuduj aplikację lokalnie
cd smakowalo-app
bun install
bun run build

# Deploy przez Netlify CLI
npx netlify-cli deploy --prod --dir=.next
```

### ⚙️ Konfiguracja netlify.toml

Plik `netlify.toml` zawiera:
- **Build settings** - komendy i publikacja
- **Redirects** - obsługa Next.js routing
- **Headers** - bezpieczeństwo i cache
- **Functions** - obsługa API routes

### 🔍 Weryfikacja deploymentu

Po deploymencie sprawdź:

1. **✅ Strona główna** - ładuje się poprawnie
2. **✅ Menu** - pokazuje produkty (mock data lub Supabase)
3. **✅ Koszyk** - dodawanie/usuwanie produktów
4. **✅ Checkout** - formularz i płatności
5. **✅ Auth** - logowanie/rejestracja (jeśli Supabase skonfigurowany)

### 🐛 Rozwiązywanie problemów

#### Problem: Build fails
```bash
# Sprawdź logi w Netlify Dashboard
# Najczęstsze przyczyny:
- Brak zmiennych środowiskowych
- TypeScript errors
- Missing dependencies
```

#### Problem: Images nie ładują się
- Sprawdź konfigurację `next.config.js`
- Zweryfikuj domeny w `images.domains`
- Sprawdź `netlify.toml` sekcję `[images]`

#### Problem: API routes nie działają
- Sprawdź redirects w `netlify.toml`
- Zweryfikuj Next.js API routes
- Sprawdź funkcje w Netlify dashboard

#### Problem: Routing nie działa
- Sprawdź SPA fallback w `netlify.toml`
- Zweryfikuj Next.js App Router konfigurację

### 📊 Monitoring i Analytics

Po deploymencie możesz włączyć:
- **Netlify Analytics** - ruch na stronie
- **Function logs** - błędy API
- **Build logs** - problemy z buildem
- **Form handling** - formularze kontaktowe

### 🔒 Bezpieczeństwo

Aplikacja zawiera:
- **Headers bezpieczeństwa** w netlify.toml
- **Environment variables** dla wrażliwych danych
- **HTTPS** automatycznie przez Netlify
- **XSS Protection** i inne zabezpieczenia

### 📈 Performance

Zoptymalizowane:
- **Static assets caching** - długoterminowe cache
- **Image optimization** - Next.js images
- **Code splitting** - automatyczne w Next.js
- **Bundle optimization** - Tree shaking

### 🆔 Konfiguracja domeny (opcjonalne)

1. W Netlify Dashboard:
   - Przejdź do **Domain settings**
   - Kliknij **Add custom domain**
   - Wprowadź swoją domenę
   - Skonfiguruj DNS zgodnie z instrukcjami

2. Zaktualizuj zmienne środowiskowe:
   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

### 📞 Wsparcie

W przypadku problemów:
1. Sprawdź **build logs** w Netlify
2. Sprawdź **function logs** dla API errors
3. Zweryfikuj zmienne środowiskowe
4. Sprawdź **Network tab** w browser dev tools

---

## 🎉 Gratulacje!

Twoja aplikacja Smakowało jest teraz dostępna online!

**Live URL**: https://your-site.netlify.app

### Następne kroki:
- 📧 Skonfiguruj emaile transakcyjne
- 📊 Dodaj Google Analytics
- 🔍 Zoptymalizuj SEO
- 📱 Przetestuj na urządzeniach mobilnych
