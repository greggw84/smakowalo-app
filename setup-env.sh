#!/bin/bash

echo "🔧 Konfiguracja zmiennych środowiskowych dla Supabase"
echo "=================================================="
echo ""
echo "Pobierz credentials z Vercel:"
echo "https://vercel.com/greggw84/smakowalo-app/settings/environment-variables"
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  Plik .env.local już istnieje!"
    read -p "Czy chcesz go nadpisać? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Anulowano."
        exit 0
    fi
    mv .env.local .env.local.backup
    echo "✅ Utworzono backup: .env.local.backup"
fi

# Supabase URL
echo ""
echo "📝 Wklej NEXT_PUBLIC_SUPABASE_URL z Vercel:"
read -p "URL: " SUPABASE_URL

# Supabase Anon Key
echo ""
echo "📝 Wklej NEXT_PUBLIC_SUPABASE_ANON_KEY z Vercel:"
read -p "Anon Key: " SUPABASE_ANON_KEY

# Supabase Service Role Key
echo ""
echo "📝 Wklej SUPABASE_SERVICE_ROLE_KEY z Vercel:"
read -p "Service Role Key: " SUPABASE_SERVICE_KEY

# NextAuth Secret
echo ""
echo "📝 Wklej NEXTAUTH_SECRET z Vercel (lub wygeneruj nowy):"
read -p "NextAuth Secret: " NEXTAUTH_SECRET

# Create .env.local
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}

# NextAuth Configuration
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://localhost:3000

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Smakowało

# OpenCart Configuration
OPENCART_URL=https://shop.smakowalo.pl
OPENCART_API_USERNAME=admin
OPENCART_API_PASSWORD=your-password

# Development
NODE_ENV=development
EOF

echo ""
echo "✅ Plik .env.local został utworzony!"
echo ""
echo "Następne kroki:"
echo "1. Zrestartuj serwer deweloperski (Ctrl+C, potem 'bun dev')"
echo "2. Przejdź do http://localhost:3000/login"
echo "3. Zarejestruj się i przetestuj logowanie"
echo ""
echo "Sprawdź .same/setup-supabase.md dla szczegółowych instrukcji!"
