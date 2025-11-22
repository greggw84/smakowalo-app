#!/bin/bash

# Webhook and Email Testing Script
# This script helps verify that subscription webhooks and emails are working correctly

set -e

echo "🧪 Subscription Webhook & Email Testing Script"
echo "=============================================="
echo ""

# Load environment variables if .env.local exists
if [ -f .env.local ]; then
    echo "📋 Loading environment from .env.local..."
    # Safer way to load env vars
    set -a
    source .env.local
    set +a
else
    echo "⚠️  Warning: .env.local not found. Make sure environment variables are set."
fi

# Check required environment variables
echo ""
echo "🔍 Checking required environment variables..."
echo ""

REQUIRED_VARS=(
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "NEXT_PUBLIC_SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASS"
    "NEXT_PUBLIC_SITE_URL"
)

MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo "❌ Missing: $VAR"
        MISSING_VARS+=("$VAR")
    else
        # Show first 10 chars for verification (but hide sensitive data)
        if [[ "$VAR" == *"SECRET"* ]] || [[ "$VAR" == *"PASS"* ]] || [[ "$VAR" == *"KEY"* ]]; then
            echo "✅ Found: $VAR = ${!VAR:0:10}..."
        else
            echo "✅ Found: $VAR = ${!VAR}"
        fi
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "❌ ERROR: Missing required environment variables:"
    printf '%s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "Please set these variables in .env.local or your environment."
    exit 1
fi

echo ""
echo "✅ All required environment variables are set!"
echo ""

# Test database migration
echo "🗄️  Checking database migration..."
echo ""

MIGRATION_CHECK=$(cat <<'EOF'
SELECT COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'subscriptions'
AND policyname = 'Service role can manage subscriptions';
EOF
)

echo "To verify the migration was applied, run this query in Supabase SQL Editor:"
echo "$MIGRATION_CHECK"
echo ""
echo "Expected result: count = 1"
echo ""

# Test email sending
echo "📧 Testing email sending..."
echo ""

TEST_EMAIL="${TEST_EMAIL:-test@example.com}"

echo "Enter email address to test email sending (or press Enter to use $TEST_EMAIL):"
read -r USER_EMAIL
if [ -n "$USER_EMAIL" ]; then
    TEST_EMAIL="$USER_EMAIL"
fi

echo ""
echo "Sending test email to: $TEST_EMAIL"
echo ""

# Check if server is running
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "⚠️  Local server doesn't seem to be running at http://localhost:3000"
    echo "Please start the server with: npm run dev"
    echo ""
    exit 1
fi

# Send test email (using GET with query param)
EMAIL_RESPONSE=$(curl -s "http://localhost:3000/api/test-email?to=$TEST_EMAIL" \
    || echo '{"error": "Request failed"}')

echo "Response: $EMAIL_RESPONSE"
echo ""

if echo "$EMAIL_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Test email sent successfully!"
    echo "   Check inbox for: $TEST_EMAIL"
else
    echo "❌ Failed to send test email"
    echo "   Check the SMTP configuration and server logs"
fi

echo ""

# Test Stripe webhook with Stripe CLI
echo "🔗 Testing Stripe Webhooks..."
echo ""

if ! command -v stripe &> /dev/null; then
    echo "⚠️  Stripe CLI is not installed."
    echo "   Install it from: https://stripe.com/docs/stripe-cli"
    echo ""
    echo "After installing, you can test webhooks with:"
    echo "  stripe listen --forward-to localhost:3000/api/webhooks/stripe"
    echo "  stripe trigger checkout.session.completed"
    echo ""
else
    echo "✅ Stripe CLI is installed"
    echo ""
    echo "To test webhooks locally, run these commands in separate terminals:"
    echo ""
    echo "Terminal 1 (Forward webhooks):"
    echo "  stripe listen --forward-to localhost:3000/api/webhooks/stripe"
    echo ""
    echo "Terminal 2 (Trigger test event):"
    echo "  stripe trigger checkout.session.completed"
    echo ""
    echo "Watch the output in Terminal 1 for webhook processing logs."
    echo ""
fi

# Database query examples
echo "📊 Useful Database Queries"
echo "=========================="
echo ""

echo "1. Check recent subscriptions:"
echo ""
cat <<'EOF'
SELECT 
  id,
  user_id,
  stripe_subscription_id,
  status,
  people,
  days,
  delivery_day,
  created_at
FROM subscriptions
ORDER BY created_at DESC
LIMIT 5;
EOF
echo ""

echo "2. Check subscription by user email:"
echo ""
cat <<'EOF'
SELECT 
  s.id,
  s.stripe_subscription_id,
  s.status,
  s.people,
  s.days,
  u.email
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'user@example.com';
EOF
echo ""

echo "3. Check all subscription statuses:"
echo ""
cat <<'EOF'
SELECT 
  status,
  COUNT(*) as count
FROM subscriptions
GROUP BY status;
EOF
echo ""

# Summary
echo "📋 Summary"
echo "========="
echo ""
echo "✅ Environment variables checked"
echo "✅ Email sending tested"
echo ""
echo "Next steps:"
echo "1. Verify database migration is applied (check SQL query above)"
echo "2. Test webhook flow with Stripe CLI (commands shown above)"
echo "3. Create a test subscription through the UI"
echo "4. Check that subscription appears in panel"
echo "5. Verify welcome email is received"
echo ""
echo "For detailed troubleshooting, see: SUBSCRIPTION_FIX_GUIDE.md"
echo ""
