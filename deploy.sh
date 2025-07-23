#!/bin/bash

# 🔁 Przejdź do folderu projektu
cd ~/Downloads/smakowalo-app || {
  echo "❌ Nie można przejść do ~/Downloads/smakowalo-app"
  exit 1
}

# 📦 Rozpakowywanie pliku ZIP, jeśli istnieje
ZIP_FILE="smakowalo-deployment.zip"
if [ -f "$ZIP_FILE" ]; then
  echo "📦 Rozpakowywanie $ZIP_FILE..."
  unzip -o "$ZIP_FILE" -d .
else
  echo "⚠️ Brak pliku $ZIP_FILE — pomijam rozpakowywanie."
fi

# 📤 Commit + force push do GitHuba
echo "🟡 Commitowanie zmian..."
git add .
git commit -m "Auto deploy z same.new z dnia $(date '+%Y-%m-%d %H:%M')" || echo "ℹ️ Brak zmian do commitowania."
echo "🚀 Wysyłanie zmian do GitHuba (z --force)..."
git push origin main --force

# 🌐 Deployment do Vercel
echo "🟢 Deploy na Vercel..."
vercel --prod --confirm

echo "✅ Gotowe! Kod wysłany do GitHuba i zdeployowany na Vercel."
