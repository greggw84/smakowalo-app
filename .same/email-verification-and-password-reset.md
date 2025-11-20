# Email Verification & Password Reset - Dokumentacja

## Przegląd

Dodano kompletny system weryfikacji email i resetowania hasła dla użytkowników Smakowało.

## 🆕 Nowe Funkcje

### 1. Reset Hasła

#### Strona Zapomniałem Hasła (`/forgot-password`)
- Formularz z polem email
- Walidacja formatu email
- Wysyłanie linku resetującego na email
- Przyjazne komunikaty sukcesu i błędów
- Link powrotu do strony logowania

**Jak działa:**
1. Użytkownik wchodzi na `/forgot-password`
2. Podaje adres email powiązany z kontem
3. System generuje bezpieczny token resetowania (ważny 1 godzinę)
4. Email z linkiem resetującym jest wysyłany
5. Link prowadzi do `/reset-password?token=xxx`

#### Strona Resetowania Hasła (`/reset-password`)
- Formularz z dwoma polami: nowe hasło i potwierdzenie
- Walidacja zgodności haseł
- Minimalna długość hasła: 6 znaków
- Walidacja tokenu z emaila
- Automatyczne przekierowanie do logowania po sukcesie

**Jak działa:**
1. Użytkownik klika link z emaila
2. Wprowadza nowe hasło (2x dla pewności)
3. System weryfikuje token (czy ważny i nie wygasły)
4. Hasło jest aktualizowane w Supabase Auth
5. Przekierowanie do `/login?reset=success`
6. Komunikat sukcesu na stronie logowania

#### Link na Stronie Logowania
- Dodano link "Zapomniałeś hasła?" obok pola hasła
- Łatwy dostęp dla użytkowników

### 2. Weryfikacja Email (Przygotowana)

System jest gotowy do weryfikacji email, ale obecnie w trybie development:
- W **development**: Auto-potwierdzenie emaila (email_confirm: true)
- W **production**: Wymaga potwierdzenia emaila przez użytkownika

Aby włączyć pełną weryfikację w production, usuń `isDevelopment` check w:
- `src/app/api/auth/[...nextauth]/route.ts` (linia ~65)

## 📁 Nowe Pliki

### Strony (UI)
```
src/app/forgot-password/page.tsx       - Formularz żądania resetu hasła
src/app/reset-password/page.tsx        - Formularz ustawienia nowego hasła
```

### API Endpoints
```
src/app/api/auth/reset-password/route.ts           - Wysyłanie emaila resetującego
src/app/api/auth/reset-password/confirm/route.ts   - Potwierdzenie nowego hasła
```

### Istniejące Pliki (Już Zaimplementowane)
```
src/app/api/auth/verify-email/route.ts           - Weryfikacja emaila użytkownika
src/app/api/auth/resend-verification/route.ts    - Ponowne wysyłanie emaila weryfikacyjnego
```

## 🔒 Bezpieczeństwo

### Token Resetowania Hasła
- Generowany kryptograficznie bezpieczny 32-bajtowy token
- Hashowany SHA-256 przed zapisem
- Przechowywany w Supabase Auth user_metadata
- Ważność: 1 godzina
- Automatyczne wyczyszczenie po użyciu

### Ochrona Przed Enumeracją Email
- Zawsze zwracany sukces, nawet jeśli email nie istnieje
- Uniemożliwia sprawdzenie czy konto istnieje

### Walidacja
- Minimalna długość hasła: 6 znaków
- Zgodność hasła i potwierdzenia
- Weryfikacja tokenu przed każdą operacją
- Sprawdzanie czasu wygaśnięcia

## 📧 Szablony Email

### Email Resetowania Hasła
Lokalizacja: `src/lib/email.ts` → `emailTemplates.passwordReset()`

**Zawiera:**
- Profesjonalne logo i branding Smakowało
- Gradient header (zielony)
- Wyraźny przycisk CTA "Zresetuj hasło"
- Link do skopiowania (jako backup)
- Ostrzeżenie o ważności linku (1h)
- Informacja o ignorowaniu jeśli użytkownik nie prosił
- Dane kontaktowe firmy

### Email Weryfikacji (Gotowy)
Lokalizacja: `src/lib/email.ts` → `emailTemplates.emailVerification()`

**Zawiera:**
- Podobny design do reset hasła
- Przycisk "Potwierdź adres email"
- Ważność 24h

## 🧪 Testowanie

### 1. Test Resetowania Hasła

**Krok 1: Żądanie Resetu**
```
1. Przejdź do http://localhost:3000/forgot-password
2. Wprowadź email: greghdm@gmail.com (lub inny istniejący)
3. Kliknij "Wyślij link resetujący"
4. Sprawdź konsolę serwera - pojawi się:
   ✅ Password reset email sent to: [email]
```

**Krok 2: Sprawdź Email (Mock)**
```
Ponieważ używamy MockEmailService (brak konfiguracji SMTP),
email pojawi się w konsoli serwera z pełną treścią i linkiem.

Skopiuj link z konsoli, np:
http://localhost:3000/reset-password?token=abc123...
```

**Krok 3: Reset Hasła**
```
1. Otwórz link z emaila (lub konsoli)
2. Wprowadź nowe hasło (min 6 znaków)
3. Potwierdź nowe hasło
4. Kliknij "Zmień hasło"
5. Zobaczysz komunikat sukcesu i przekierowanie
```

**Krok 4: Weryfikacja**
```
1. Na stronie /login zobaczysz zielony komunikat:
   "Hasło zostało pomyślnie zmienione!"
2. Zaloguj się nowym hasłem
3. Sprawdź czy działa ✅
```

### 2. Test "Forgot Password" Link

```
1. Przejdź do /login
2. W sekcji "Logowanie", obok pola "Hasło" zobaczysz:
   "Zapomniałeś hasła?"
3. Kliknij link
4. Zostaniesz przekierowany do /forgot-password
```

## 🚀 Konfiguracja Email (Opcjonalna)

Obecnie system używa MockEmailService (development). Aby wysyłać prawdziwe emaile:

### Opcja 1: Resend (Polecane)
```env
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@smakowalo.pl
```

### Opcja 2: SendGrid
```env
# .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@smakowalo.pl
```

**Uwaga:** Musisz zweryfikować domenę w Resend/SendGrid!

## 📊 Flow Diagramy

### Reset Hasła
```
Użytkownik                  System                    Email
    |                         |                          |
    |--[Podaje email]-------->|                          |
    |                         |--[Generuje token]        |
    |                         |--[Zapisuje w Auth]       |
    |                         |--[Wysyła email]--------->|
    |<----[Sukces]------------|                          |
    |                         |                          |
    |<--------------[Link resetujący]-------------------|
    |                         |                          |
    |--[Klika link]---------->|                          |
    |                         |--[Sprawdza token]        |
    |<----[Formularz]---------|                          |
    |                         |                          |
    |--[Nowe hasło]---------->|                          |
    |                         |--[Weryfikuje token]      |
    |                         |--[Aktualizuje hasło]     |
    |                         |--[Usuwa token]           |
    |<----[Sukces]------------|                          |
    |--[Redirect /login]----->|                          |
```

## 🔧 Troubleshooting

### Problem: Email się nie wysyła
**Rozwiązanie:**
- Sprawdź konsolę serwera - email pojawi się tam (MockEmailService)
- Lub skonfiguruj Resend/SendGrid (patrz: Konfiguracja Email)

### Problem: Token invalid/expired
**Rozwiązanie:**
- Token ważny tylko 1h
- Poproś o nowy link resetujący
- Sprawdź czy data/czas systemu jest poprawna

### Problem: Nie mogę znaleźć linku "Forgot password"
**Rozwiązanie:**
- Idź do /login
- Kliknij zakładkę "Logowanie" (nie Rejestracja)
- Link jest obok pola "Hasło", po prawej stronie

### Problem: Hasło nie się zmienia
**Rozwiązanie:**
- Sprawdź konsolę przeglądarki (F12) - błędy?
- Sprawdź konsolę serwera - błędy API?
- Upewnij się że token jest w URL: `/reset-password?token=xxx`

## ✅ Co Działa

- ✅ Formularz żądania resetu hasła
- ✅ Generowanie bezpiecznych tokenów
- ✅ Wysyłanie emaili (mock lub rzeczywiste z Resend/SendGrid)
- ✅ Formularz ustawienia nowego hasła
- ✅ Walidacja tokenów i haseł
- ✅ Aktualizacja hasła w Supabase Auth
- ✅ Komunikaty sukcesu/błędu
- ✅ Przekierowania po operacjach
- ✅ Link "Forgot password" na /login
- ✅ Responsywny design
- ✅ Bezpieczne przechowywanie tokenów

## 🎨 Design

Wszystkie strony i emaile używają brandingu Smakowało:
- Kolory: Gradient zieleni (#74a53d → #34483c)
- Logo: Smakowało
- Fonty: System fonts (Arial, sans-serif)
- Responsywność: Mobile-first
- Komponenty: shadcn/ui

## 📝 Notatki Deweloperskie

### Przechowywanie Tokenów
Tokeny resetowania są przechowywane w `user_metadata` zamiast osobnej tabeli:
```typescript
user_metadata: {
  password_reset_token: 'hashed_token',
  password_reset_expires: '2025-10-15T14:30:00Z',
  first_name: 'Jan',
  last_name: 'Kowalski'
}
```

**Dlaczego?**
- Nie wymaga dodatkowych tabel w bazie
- Automatyczne czyszczenie przez Supabase
- Łatwe do zarządzania

### Alternatywne Podejście (Dla Dużych Aplikacji)
Możesz stworzyć osobną tabelę `password_reset_tokens`:
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Następne Kroki

1. **Skonfiguruj prawdziwy email service** (Resend polecane)
2. **Przetestuj całą funkcjonalność** end-to-end
3. **Włącz email verification w production** (usuń auto-confirm)
4. **Dodaj rate limiting** dla reset hasła (max 3 próby/godzinę)
5. **Monitoruj logi** - czy emaile się wysyłają
6. **Dodaj testy jednostkowe** dla API endpoints

## 📞 Support

Jeśli masz pytania lub problemy:
1. Sprawdź konsole (przeglądarka + serwer)
2. Przeczytaj Troubleshooting powyżej
3. Sprawdź logi Supabase Dashboard
4. Skontaktuj się z zespołem

---

**Ostatnia aktualizacja:** 15 października 2025
**Status:** ✅ Gotowe do testowania
