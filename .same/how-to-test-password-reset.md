# Jak Przetestować Reset Hasła - Przewodnik Krok po Kroku

## 🎯 Cel
Sprawdzić czy funkcja resetowania hasła działa poprawnie.

## ✅ Wymagania Wstępne
- Serwer działa (`bun run dev`)
- Masz konto użytkownika w systemie (np. `greghdm@gmail.com`)
- Znasz obecne hasło tego konta

## 📋 Kroki Testowe

### Test 1: Żądanie Resetu Hasła

1. **Otwórz przeglądarkę**
   - Przejdź do: `http://localhost:3000/login`

2. **Znajdź link "Zapomniałeś hasła?"**
   - Jest obok pola "Hasło" w sekcji "Logowanie"
   - Kliknij na niego

3. **Wypełnij formularz**
   - Email: `greghdm@gmail.com` (lub twój email)
   - Kliknij "Wyślij link resetujący"

4. **Sprawdź komunikat**
   - Powinien pojawić się zielony komunikat:
   - "Email z linkiem do resetowania hasła został wysłany..."

5. **Sprawdź konsolę serwera**
   - W terminalu gdzie działa `bun run dev`
   - Znajdź log: `📧 Password reset email sent to: [email]`
   - Znajdź link resetujący w treści emaila (mock mode)

### Test 2: Reset Hasła

1. **Skopiuj link resetujący**
   - Z konsoli serwera znajdź URL:
   - `http://localhost:3000/reset-password?token=xxx...`
   - Skopiuj cały link

2. **Otwórz link w przeglądarce**
   - Wklej skopiowany URL
   - Powinna załadować się strona "Ustaw nowe hasło"

3. **Wypełnij formularz**
   - Nowe hasło: `NoweHaslo123!`
   - Potwierdź nowe hasło: `NoweHaslo123!`
   - Kliknij "Zmień hasło"

4. **Sprawdź sukces**
   - Powinna pojawić się strona z ✅:
   - "Hasło zostało zmienione!"
   - Automatyczne przekierowanie po 2 sekundach

### Test 3: Logowanie Nowym Hasłem

1. **Zaloguj się**
   - Na stronie `/login` zobaczysz zielony komunikat:
   - "Hasło zostało pomyślnie zmienione! Zaloguj się używając nowego hasła."

2. **Wprowadź dane**
   - Email: `greghdm@gmail.com`
   - Hasło: `NoweHaslo123!` (nowe hasło)
   - Kliknij "Zaloguj się"

3. **Weryfikacja**
   - Jeśli logowanie przeszło ✅ - sukces!
   - Zostaniesz przekierowany do `/panel`

## 🔍 Sprawdzenia Dodatkowe

### Sprawdź Token Expiration
1. Poproś o reset hasła
2. Poczekaj 2 godziny (lub zmień czas w kodzie na 1 minutę dla testu)
3. Spróbuj użyć linku
4. Powinien pokazać błąd: "Token resetowania hasła wygasł"

### Sprawdź Invalid Token
1. Otwórz `/reset-password?token=faketoken123`
2. Wypełnij formularz
3. Powinien pokazać błąd: "Nieprawidłowy token resetowania hasła"

### Sprawdź Walidację Hasła
1. Poproś o reset hasła
2. Użyj linku z emaila
3. Wprowadź hasło krótsze niż 6 znaków (np. "12345")
4. Powinien pokazać błąd: "Hasło musi mieć co najmniej 6 znaków"

### Sprawdź Niezgodność Haseł
1. Poproś o reset hasła
2. Użyj linku z emaila
3. Nowe hasło: `Test123456`
4. Potwierdź hasło: `Test654321` (inne!)
5. Powinien pokazać błąd: "Hasła nie są identyczne"

## 🐛 Troubleshooting

### Problem: Nie widzę linku w konsoli
**Rozwiązanie:**
- Upewnij się że serwer działa
- Sprawdź czy konto istnieje w bazie
- Sprawdź logi terminala dokładnie (przewiń w górę)

### Problem: Token invalid
**Rozwiązanie:**
- Upewnij się że kopiujesz CAŁY URL z konsoli
- Token jest bardzo długi (64+ znaków)
- Sprawdź czy nie ma spacji na początku/końcu

### Problem: Hasło się nie zmienia
**Rozwiązanie:**
1. Otwórz DevTools (F12)
2. Przejdź do zakładki Console
3. Sprawdź czy są błędy JavaScript
4. Sprawdź zakładkę Network - odpowiedź API

## ✅ Checklist Testów

- [ ] Formularz forgot password wyświetla się poprawnie
- [ ] Email jest wysyłany (pojawia się w konsoli)
- [ ] Link resetujący działa
- [ ] Formularz reset password wyświetla się
- [ ] Walidacja haseł działa (min 6 znaków)
- [ ] Walidacja zgodności haseł działa
- [ ] Hasło jest aktualizowane w Supabase
- [ ] Można zalogować się nowym hasłem
- [ ] Komunikat sukcesu pojawia się na /login
- [ ] Wygasły token pokazuje błąd
- [ ] Nieprawidłowy token pokazuje błąd

## 📸 Screenshots do Weryfikacji

1. **Forgot Password Page**
   - Formularz z polem email
   - Przycisk "Wyślij link resetujący"
   - Link "Pamiętasz hasło? Zaloguj się"

2. **Reset Password Page**
   - Formularz z dwoma polami hasła
   - Przycisk "Zmień hasło"
   - Ikona kłódki w headerze

3. **Success Page**
   - Zielona ikona checkmark
   - Tekst "Hasło zostało zmienione!"
   - Przycisk "Przejdź do logowania"

4. **Login Page z Linkiem**
   - Pole "Hasło"
   - Link "Zapomniałeś hasła?" po prawej

## 🚀 Quick Test Script

```bash
# Terminal 1: Start server
bun run dev

# Terminal 2: Test z curl (opcjonalnie)
# Request reset
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"greghdm@gmail.com"}'

# Confirm reset (użyj token z emaila)
curl -X POST http://localhost:3000/api/auth/reset-password/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE","password":"NewPass123"}'
```

## 📝 Notatki

- Mock email service loguje emaile w konsoli serwera
- Tokeny są ważne 1 godzinę
- Hasło musi mieć minimum 6 znaków
- W development mode email verification jest auto-potwierdzona

---

**Status:** ✅ Gotowe do testowania
**Data:** 15 października 2025
