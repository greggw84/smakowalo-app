# ⚡ Quick Supabase Setup (15 minutes)

## 1️⃣ Create Project (3 min)
1. Go to **https://supabase.com/** → Sign in
2. Click **New Project**
3. Name: `smakowalo-app`
4. Region: Europe (Frankfurt)
5. Generate strong password → **SAVE IT**
6. Click **Create**

## 2️⃣ Get Credentials (1 min)
**Settings** → **API** → Copy these:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

## 3️⃣ Create Tables (2 min)
**SQL Editor** → **New Query** → Paste this:

```sql
-- See SUPABASE-SETUP-NOW.md for full SQL
-- OR use this short version:

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT,
  email_verification_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for service role" ON public.profiles
  FOR ALL USING (true);
```

Click **Run**

## 4️⃣ Configure Auth (1 min)
**Authentication** → **Providers**:
- ✅ Email enabled
- ❌ Email confirmations OFF

**URL Configuration**:
- Site URL: `https://www.smakowalo.pl`

## 5️⃣ Add to Vercel (3 min)
**Vercel** → **Settings** → **Environment Variables**

Add for **Production**:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## 6️⃣ Deploy (2 min)
**Vercel** → **Deployments** → **...** → **Redeploy**

## 7️⃣ Test (3 min)
1. Go to **www.smakowalo.pl/login**
2. Register new account
3. Check email for verification link
4. Click link
5. Login
6. Should redirect to /panel ✅

---

## ✅ Done!
Your app now has:
- ✅ Real database
- ✅ User authentication
- ✅ Email verification
- ✅ No more 401 errors

---

**Full guide:** See `SUPABASE-SETUP-NOW.md` for detailed instructions
