# 🚀 Smakowało - Setup Instructions

## ✅ Co już masz skonfigurowane:

### 🔐 Supabase Database (GOTOWE!)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://quqqpixujzxujauhessa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... (WORKING)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (WORKING)
```
✅ **Status**: Baza danych w pełni skonfigurowana z 3 produktami!

### 📱 OAuth (GOTOWE!)
✅ **Facebook & Google**: Działają z prawdziwymi kluczami
✅ **Authentication**: NextAuth skonfigurowany

---

## 🔧 Co musisz skonfigurować:

### 1. 💳 Stripe Payments (5 minut)

1. **Idź na**: https://dashboard.stripe.com/register
2. **Zarejestruj się** (bezpłatne konto testowe)
3. **Idź do**: Dashboard → Developers → API Keys
4. **Skopiuj klucze**:
   ```bash
   # Publishable Key (zaczyna się od pk_test_)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TWÓJ_KLUCZ

   # Secret Key (zaczyna się od sk_test_)
   STRIPE_SECRET_KEY=sk_test_TWÓJ_KLUCZ
   ```
5. **Webhooks** (opcjonalne):
   - Idź do: Developers → Webhooks
   - Add endpoint: `http://localhost:3000/api/webhooks/stripe`
   - Skopiuj signing secret (zaczyna się od whsec_)

### 2. 📧 Email SMTP (opcjonalne)

Jeśli chcesz email authentication:

1. **Gmail App Password**:
   - Idź na: https://myaccount.google.com/security
   - 2-Step Verification → App passwords
   - Generate password for "Mail"

2. **Zaktualizuj w .env.local**:
   ```bash
   EMAIL_SERVER_USER=twój-email@gmail.com
   EMAIL_SERVER_PASSWORD=WYGENEROWANE_HASŁO_APLIKACJI
   ```

---

## 🎯 Quick Start:

### 1. Zaktualizuj Stripe klucze w `.env.local`
```bash
# Zamień te linie:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TWÓJ_PRAWDZIWY_KLUCZ
STRIPE_SECRET_KEY=sk_test_TWÓJ_PRAWDZIWY_KLUCZ
```

### 2. Restart serwera
```bash
cd smakowalo-app
bun run dev
```

### 3. Testuj aplikację
- **Registration**: http://localhost:3000/login
- **Customer Panel**: http://localhost:3000/panel
- **Menu**: http://localhost:3000/menu

---

## 🧪 Test Stripe Payments:

Użyj test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Any future date** dla expiry
- **Any 3 digits** dla CVC

---

## 🎉 Gotowe!

Po skonfigurowaniu Stripe będziesz mieć **w pełni funkcjonalną aplikację e-commerce** z:
- ✅ Authentication (Facebook, Google, Email)
- ✅ Database (Supabase z produktami)
- ✅ Payments (Stripe)
- ✅ Customer Panel
- ✅ Order Management

**Potrzebujesz pomocy?** Napisz co nie działa!
