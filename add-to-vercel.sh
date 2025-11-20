#!/bin/bash

echo "🚀 Adding Stripe Price IDs to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "Install it with: npm i -g vercel"
    echo ""
    echo "Or add variables manually via dashboard:"
    echo "https://vercel.com/dashboard"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Array of environment variables
declare -A ENV_VARS=(
    ["STRIPE_PRICE_2_2"]="price_1SVD45ChaDkFJkJI2DkNEpkK"
    ["STRIPE_PRICE_2_3"]="price_1SVWHUChaDkFJkJIAEZbXXei"
    ["STRIPE_PRICE_2_4"]="price_1SVD45ChaDkFJkJI8OP7MDB3"
    ["STRIPE_PRICE_2_5"]="price_1SVD45ChaDkFJkJIzdO9CUAI"
    ["STRIPE_PRICE_3_2"]="price_1SVD45ChaDkFJkJIwhAc79kF"
    ["STRIPE_PRICE_3_3"]="price_1SVD45ChaDkFJkJIavPtADkM"
    ["STRIPE_PRICE_3_4"]="price_1SVD45ChaDkFJkJIQD8WJShG"
    ["STRIPE_PRICE_3_5"]="price_1SVD45ChaDkFJkJIdMvMGP4O"
    ["STRIPE_PRICE_4_2"]="price_1SVD45ChaDkFJkJIKS1x4fwL"
    ["STRIPE_PRICE_4_3"]="price_1SVD45ChaDkFJkJIsmkCYQvL"
    ["STRIPE_PRICE_4_4"]="price_1SVD45ChaDkFJkJIgwyRP3da"
    ["STRIPE_PRICE_4_5"]="price_1SVD45ChaDkFJkJIH0Rw81fj"
)

echo "📦 Total variables to add: ${#ENV_VARS[@]}"
echo ""

# Counter
count=0

# Add each environment variable
for key in "${!ENV_VARS[@]}"; do
    value="${ENV_VARS[$key]}"
    count=$((count + 1))

    echo "[$count/${#ENV_VARS[@]}] Adding $key..."

    # Add to production, preview, and development
    echo "$value" | vercel env add "$key" production preview development 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "  ✅ $key added successfully"
    else
        echo "  ⚠️  $key might already exist (this is OK)"
    fi

    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All environment variables processed!"
echo ""
echo "🔄 Now redeploying to production..."
echo ""

# Redeploy to production
vercel --prod

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DONE!"
echo ""
echo "🧪 Test your kreator now:"
echo "   https://smakowalo.pl/kreator"
echo ""
echo "🔍 Verify configuration:"
echo "   https://smakowalo.pl/api/check-stripe-config"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
