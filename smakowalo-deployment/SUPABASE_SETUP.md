# Konfiguracja Supabase dla Smakowalo App

## 🚀 Kroki konfiguracji

### 1. Utworzenie projektu Supabase

1. Przejdź na [supabase.com](https://supabase.com)
2. Zaloguj się lub załóż konto
3. Kliknij "New Project"
4. Wybierz organizację i wprowadź dane projektu:
   - **Name**: `smakowalo-app`
   - **Database Password**: (wygeneruj silne hasło)
   - **Region**: Europe (Frankfurt) - `eu-central-1`
5. Kliknij "Create new project"

### 2. Uruchomienie SQL skryptu

1. W dashboard Supabase przejdź do **SQL Editor**
2. Kliknij **"New query"**
3. Skopiuj i wklej zawartość pliku `supabase-setup.sql`
4. Kliknij **"Run"** aby wykonać skrypt

Skrypt utworzy:
- Tabele: `categories`, `products`, `orders`, `order_items`, `reviews`, `cart_items`
- Indeksy dla wydajności
- Polityki RLS (Row Level Security)
- Triggery do automatycznego aktualizowania timestamp
- Przykładowe kategorie

### 3. Konfiguracja zmiennych środowiskowych

#### Lokalne środowisko (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Produkcja (Netlify)
1. W dashboard Netlify przejdź do **Site settings > Environment variables**
2. Dodaj zmienne:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`

### 4. Znalezienie kluczy Supabase

1. W dashboard Supabase przejdź do **Settings > API**
2. Skopiuj:
   - **URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Konfiguracja Authentication

1. W dashboard Supabase przejdź do **Authentication > Settings**
2. W sekcji **Site URL** dodaj:
   - Lokalne: `http://localhost:3000`
   - Produkcja: `https://your-netlify-domain.netlify.app`
3. W sekcji **Redirect URLs** dodaj:
   - `http://localhost:3000/reset-password`
   - `https://your-netlify-domain.netlify.app/reset-password`

### 6. Konfiguracja Email Templates

1. Przejdź do **Authentication > Email Templates**
2. Edytuj template **"Reset Password"**:

```html
<h2>Resetowanie hasła - Smakowalo</h2>
<p>Kliknij poniższy link aby zresetować hasło:</p>
<p><a href="{{ .SiteURL }}/reset-password#{{ .TokenHash }}">Zresetuj hasło</a></p>
<p>Jeśli nie prosiłeś o reset hasła, zignoruj ten email.</p>
```

## 🔄 Migracja danych z OpenCart

### Automatyczna migracja
```bash
curl -X POST http://localhost:3000/api/migrate-products \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "smakowalo-migration-2024"}'
```

### Ręczna migracja
1. Wyeksportuj produkty z OpenCart do JSON
2. Dostosuj format do struktury Supabase
3. Użyj API `/api/products` do dodawania produktów

## 📊 Struktura bazy danych

### Główne tabele:
- **categories** - Kategorie produktów
- **products** - Produkty z pełną informacją
- **orders** - Zamówienia użytkowników
- **order_items** - Pozycje zamówień
- **reviews** - Recenzje produktów
- **cart_items** - Koszyk użytkownika
- **profiles** - Profile użytkowników (rozszerzenie auth.users)

### Polityki bezpieczeństwa:
- Użytkownicy widzą tylko swoje zamówienia i koszyk
- Produkty i kategorie są publiczne
- Recenzje mogą dodawać tylko zalogowani użytkownicy

## 🧪 Testowanie

### Testowanie API produktów:
```bash
# Pobranie wszystkich produktów
curl http://localhost:3000/api/products

# Pobranie produktu po ID
curl http://localhost:3000/api/products/1

# Filtrowanie produktów
curl "http://localhost:3000/api/products?category=1&diet=Keto"
```

### Testowanie reset hasła:
1. Przejdź na `/forgot-password`
2. Wprowadź email
3. Sprawdź email i kliknij link
4. Ustaw nowe hasło na `/reset-password`

## ⚠️ Ważne uwagi

1. **RLS włączone**: Wszystkie tabele mają włączone Row Level Security
2. **Bezpieczeństwo**: Klucze API nigdy nie umieszczaj w kodzie
3. **Backup**: Supabase automatycznie tworzy backup, ale warto mieć własny
4. **Limity**: Plan darmowy ma ograniczenia na 500MB DB i 2GB transfer

## 🔧 Rozwiązywanie problemów

### Problem: "Database not configured"
- Sprawdź zmienne środowiskowe
- Upewnij się, że klucze są poprawne

### Problem: "RLS policy violation"
- Sprawdź polityki RLS w Supabase dashboard
- Upewnij się, że użytkownik jest zalogowany

### Problem: "Products not loading"
- Sprawdź czy tabele zostały utworzone
- Zweryfikuj migrację danych
- Sprawdź logi w Network tab przeglądarki

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi w Supabase dashboard
2. Sprawdź Console w przeglądarce
3. Zweryfikuj konfigurację krok po kroku
