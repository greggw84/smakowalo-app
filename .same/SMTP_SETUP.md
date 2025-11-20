# SMTP Email Configuration - Bluehost

## 📧 Przegląd

Aplikacja używa **SMTP Bluehost** do wysyłania wszystkich emaili:
- Powiadomienia subskrypcji (webhooks Stripe)
- Potwierdzenia płatności
- Powiadomienia GDPR (eksport/usunięcie danych)
- Inne powiadomienia użytkowników

**UWAGA:** Supabase Auth (reset hasła, weryfikacja email) używa **własnego SMTP** skonfigurowanego w Supabase Dashboard → Authentication → Email.

---

## 🔐 Konfiguracja

### Zmienne Środowiskowe

Dodaj do `.env.local`:

```env
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=@Justyna_Justyna.21
SMTP_FROM_EMAIL=no_reply@smakowalo.pl
SMTP_FROM_NAME=Smakowalo.pl
```

### Deployment (Vercel)

1. Przejdź do: **Vercel Dashboard → Project Settings → Environment Variables**
2. Dodaj wszystkie zmienne SMTP (powyżej)
3. Wybierz środowisko: **Production, Preview, Development**
4. Kliknij **Save**
5. **Redeploy** projekt

---

## 🧪 Testowanie

### Test 1: Endpoint API

```bash
# Lokalnie
curl "http://localhost:3000/api/test-email?to=twoj@email.com"

# Production
curl "https://smakowalo.pl/api/test-email?to=twoj@email.com"
```

**Spodziewany wynik:**
```json
{
  "success": true,
  "message": "✅ Test email wysłany na: twoj@email.com",
  "config": {
    "host": "cs347.bluehost.com",
    "port": "587",
    "user": "no_reply@smakowalo.pl",
    "from": "no_reply@smakowalo.pl"
  }
}
```

### Test 2: Webhook Stripe

```bash
# Trigger test event
stripe trigger customer.subscription.created

# Sprawdź logi aplikacji
# Powinien wysłać email powitalny
```

### Test 3: Panel Użytkownika

1. Zaloguj się do `/panel`
2. Subskrypcje → **Wstrzymaj**
3. Sprawdź email: "Subskrypcja wstrzymana"

---

## 📊 Monitoring

### Logi Aplikacji
```bash
# Sukces
✅ Email sent successfully via SMTP: <messageId> to: user@example.com

# Błąd
❌ SMTP email error: <error details>
```

### Bluehost Webmail
1. Zaloguj się do: https://webmail.bluehost.com
2. Email: `no_reply@smakowalo.pl`
3. Sprawdź folder **Sent** (wysłane)

---

## 🚨 Troubleshooting

### Błąd: "Connection timeout"
**Przyczyna:** Firewall blokuje port 587
**Rozwiązanie:**
- Upewnij się że port 587 jest otwarty
- Sprawdź czy `SMTP_PORT=587` (nie 465 ani 25)

### Błąd: "Authentication failed"
**Przyczyna:** Błędne hasło SMTP
**Rozwiązanie:**
- Sprawdź `SMTP_PASS` w .env.local
- Zresetuj hasło w Bluehost cPanel:
  1. cPanel → Email Accounts
  2. Znajdź `no_reply@smakowalo.pl`
  3. Change Password

### Błąd: "Sender address rejected"
**Przyczyna:** `SMTP_FROM_EMAIL` nie istnieje
**Rozwiązanie:**
- Upewnij się że email `no_reply@smakowalo.pl` został utworzony w cPanel
- Sprawdź czy `SMTP_USER` === `SMTP_FROM_EMAIL`

### Email trafia do SPAM
**Rozwiązanie:**
1. Skonfiguruj **SPF Record** w DNS:
   ```
   v=spf1 include:bluehost.com ~all
   ```
2. Skonfiguruj **DKIM** w Bluehost cPanel
3. Dodaj **DMARC Record**:
   ```
   v=DMARC1; p=quarantine; rua=mailto:admin@smakowalo.pl
   ```

---

## 📝 Email Templates

Wszystkie szablony w: `src/lib/email-notifications.ts`

### Dostępne Szablony:
1. **subscription_created** - Nowa subskrypcja
2. **subscription_paused** - Subskrypcja wstrzymana
3. **subscription_resumed** - Subskrypcja wznowiona
4. **subscription_cancelled** - Subskrypcja anulowana
5. **payment_succeeded** - Płatność OK
6. **payment_failed** - Błąd płatności
7. **trial_ending** - Koniec okresu próbnego

### Wysyłanie Email (przykład):

```typescript
import { sendEmail } from '@/lib/email-notifications'

await sendEmail({
  to: 'user@example.com',
  subject: 'Witaj w Smakowało!',
  template: 'subscription_created',
  data: {
    planType: 'weekly',
    nextDelivery: '2025-01-25',
  },
})
```

---

## ✅ Checklist Production

- [x] SMTP credentials dodane do Vercel
- [x] Test email wysłany pomyślnie
- [x] Webhook Stripe przetestowany
- [x] SPF/DKIM skonfigurowane
- [ ] Monitoring emaili (opcjonalne - Postmark/SendGrid analytics)

---

## 🔄 Migracja z Resend → SMTP

Jeśli kiedyś chcesz wrócić do Resend:

1. **Usuń** zmienne SMTP z .env.local
2. **Dodaj** `RESEND_API_KEY`
3. **Zmodyfikuj** `src/lib/email-notifications.ts`:
   - Zamień `nodemailer` na `fetch` do Resend API
   - Usuń `createTransporter()`

---

**Ostatnia aktualizacja:** Wersja 189
**Status:** ✅ SMTP Bluehost skonfigurowane i działające
