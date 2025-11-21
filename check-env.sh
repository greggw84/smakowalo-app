#!/bin/bash

# Environment Variables Checker for Webhook Setup
# Verifies all required environment variables are set

echo "🔍 Checking Webhook Environment Variables"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Function to check required var
check_required() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo "❌ MISSING: $var_name"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ OK: $var_name (${var_value:0:20}...)"
    fi
}

# Function to check optional var
check_optional() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo "⚠️  OPTIONAL: $var_name (not set)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ OK: $var_name (${var_value:0:20}...)"
    fi
}

echo "📦 Required for Webhook Processing:"
echo "-----------------------------------"

# Load .env.local if it exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "📄 Loaded .env.local"
else
    echo "⚠️  No .env.local file found"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Stripe Configuration
echo "💳 Stripe Configuration:"
check_required "STRIPE_SECRET_KEY"
check_required "STRIPE_WEBHOOK_SECRET"
echo ""

# Supabase Configuration
echo "🗄️  Supabase Configuration:"
check_required "NEXT_PUBLIC_SUPABASE_URL"
check_required "SUPABASE_SERVICE_ROLE_KEY"
echo ""

# SMTP Configuration (for emails)
echo "📧 SMTP Configuration:"
check_optional "SMTP_HOST"
check_optional "SMTP_PORT"
check_optional "SMTP_USER"
check_optional "SMTP_PASS"
check_optional "SMTP_FROM_EMAIL"
check_optional "SMTP_FROM_NAME"
echo ""

# Site Configuration
echo "🌐 Site Configuration:"
check_required "NEXT_PUBLIC_SITE_URL"
echo ""

# Summary
echo "=========================================="
echo "📊 Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ All required environment variables are set!"
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm run dev' to start the server"
    echo "2. Run './test-webhook.sh' to test webhook events"
    echo "3. Or use 'stripe listen --forward-to localhost:3000/api/webhooks/stripe'"
    exit 0
else
    echo "❌ Missing required environment variables!"
    echo ""
    echo "Please set the missing variables in your .env.local file."
    echo "See .env.example for reference."
    exit 1
fi

if [ $WARNINGS -gt 0 ]; then
    echo ""
    echo "⚠️  Warning: Some optional features may not work:"
    echo "  - Email notifications require SMTP configuration"
fi
