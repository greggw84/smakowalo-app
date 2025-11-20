#!/bin/bash

# Test Script for Subscription Flow
# Version 191

echo "🧪 Testing Subscription Flow - Smakowało"
echo "========================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=$5

    echo -n "Testing: $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

echo "1️⃣  Testing Core API Endpoints"
echo "--------------------------------"

# Test health endpoint
test_endpoint "Health Check" "GET" "$BASE_URL/api/health" "" "200"

# Test user endpoints
test_endpoint "User Profile (unauthenticated)" "GET" "$BASE_URL/api/user/profile" "" "401"

# Test subscription endpoints (should require auth)
test_endpoint "User Subscriptions (unauthenticated)" "GET" "$BASE_URL/api/user/subscriptions" "" "401"

echo ""
echo "2️⃣  Testing Subscription Pages"
echo "--------------------------------"

# Test success page
test_endpoint "Subscription Success Page" "GET" "$BASE_URL/subscription/success?session_id=test123" "" "200"

# Test cancel page
test_endpoint "Subscription Cancel Page" "GET" "$BASE_URL/subscription/cancel" "" "200"

# Test kreator page
test_endpoint "Kreator Page" "GET" "$BASE_URL/kreator" "" "200"

# Test panel page
test_endpoint "Panel Page" "GET" "$BASE_URL/panel" "" "200"

echo ""
echo "3️⃣  Testing Email Endpoints"
echo "--------------------------------"

# Test email endpoint (requires 'to' parameter)
test_endpoint "Test Email (missing param)" "GET" "$BASE_URL/api/test-email" "" "400"

# Test with valid email
test_endpoint "Test Email (with param)" "GET" "$BASE_URL/api/test-email?to=test@example.com" "" "200"

echo ""
echo "4️⃣  Testing Webhook Endpoint"
echo "--------------------------------"

# Webhook should reject requests without signature
test_endpoint "Stripe Webhook (no signature)" "POST" "$BASE_URL/api/webhooks/stripe" '{"test":"data"}' "400"

echo ""
echo "5️⃣  File Structure Check"
echo "--------------------------------"

# Check if all required files exist
files=(
    "src/app/api/create-subscription/route.ts"
    "src/app/subscription/success/page.tsx"
    "src/app/subscription/cancel/page.tsx"
    "src/app/api/webhooks/stripe/route.ts"
    "src/app/api/subscriptions/pause/route.ts"
    "src/app/api/subscriptions/resume/route.ts"
    "src/app/api/subscriptions/cancel/route.ts"
    "src/lib/email-notifications.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $file (missing)"
        ((FAILED++))
    fi
done

echo ""
echo "6️⃣  Environment Variables Check"
echo "--------------------------------"

# Check required env vars
check_env() {
    local var_name=$1
    if grep -q "^$var_name=" .env.local; then
        local value=$(grep "^$var_name=" .env.local | cut -d'=' -f2)
        if [ -n "$value" ] && [ "$value" != "" ]; then
            echo -e "${GREEN}✓${NC} $var_name (configured)"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠${NC} $var_name (empty)"
        fi
    else
        echo -e "${RED}✗${NC} $var_name (missing)"
        ((FAILED++))
    fi
}

check_env "STRIPE_SECRET_KEY"
check_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
check_env "STRIPE_BASIC_PRICE_ID"
check_env "STRIPE_PREMIUM_PRICE_ID"
check_env "NEXT_PUBLIC_SUPABASE_URL"
check_env "SUPABASE_SERVICE_ROLE_KEY"
check_env "SMTP_HOST"
check_env "SMTP_USER"
check_env "SMTP_PASS"

echo ""
echo "7️⃣  Documentation Check"
echo "--------------------------------"

docs=(
    ".same/SUBSCRIPTION_FLOW.md"
    ".same/STRIPE_PRICES_SETUP.md"
    ".same/TESTING_SUBSCRIPTION_FLOW.md"
    ".same/STRIPE_WEBHOOKS.md"
    ".same/SMTP_SETUP.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $doc (missing)"
        ((FAILED++))
    fi
done

echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ Next Steps:"
    echo "1. Test subscription creation in kreator"
    echo "2. Test pause/resume flow in panel"
    echo "3. Test cancel flow in panel"
    echo "4. Verify webhook sync with Stripe CLI"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review above.${NC}"
    exit 1
fi
