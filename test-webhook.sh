#!/bin/bash

# Webhook Testing Script
# This script helps test the webhook endpoint locally with Stripe CLI

set -e

echo "🔧 Webhook Testing Helper"
echo "========================="
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed"
    echo "📥 Install from: https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "✅ Stripe CLI found"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Next.js server is not running on localhost:3000"
    echo "💡 Run 'npm run dev' in another terminal first"
    exit 1
fi

echo "✅ Next.js server is running"
echo ""

echo "🎯 Webhook endpoint: http://localhost:3000/api/webhooks/stripe"
echo ""

# Show menu
echo "Select test to run:"
echo "1) Forward all webhooks to local server"
echo "2) Trigger checkout.session.completed"
echo "3) Trigger customer.subscription.created"
echo "4) Trigger customer.subscription.updated"
echo "5) Trigger invoice.payment_succeeded"
echo "6) Trigger invoice.payment_failed"
echo "7) Trigger customer.subscription.deleted"
echo "8) Trigger customer.subscription.trial_will_end"
echo "9) Test all subscription events in sequence"
echo "0) Exit"
echo ""

read -p "Enter choice [0-9]: " choice

case $choice in
    1)
        echo ""
        echo "🎧 Starting webhook forwarding..."
        echo "📝 Copy the webhook secret (whsec_...) to your .env.local as STRIPE_WEBHOOK_SECRET"
        echo ""
        stripe listen --forward-to localhost:3000/api/webhooks/stripe
        ;;
    2)
        echo "📨 Triggering checkout.session.completed..."
        stripe trigger checkout.session.completed
        ;;
    3)
        echo "📨 Triggering customer.subscription.created..."
        stripe trigger customer.subscription.created
        ;;
    4)
        echo "📨 Triggering customer.subscription.updated..."
        stripe trigger customer.subscription.updated
        ;;
    5)
        echo "📨 Triggering invoice.payment_succeeded..."
        stripe trigger invoice.payment_succeeded
        ;;
    6)
        echo "📨 Triggering invoice.payment_failed..."
        stripe trigger invoice.payment_failed
        ;;
    7)
        echo "📨 Triggering customer.subscription.deleted..."
        stripe trigger customer.subscription.deleted
        ;;
    8)
        echo "📨 Triggering customer.subscription.trial_will_end..."
        stripe trigger customer.subscription.trial_will_end
        ;;
    9)
        echo "🔄 Testing all subscription events..."
        echo ""
        
        echo "1/7: checkout.session.completed"
        stripe trigger checkout.session.completed
        sleep 2
        
        echo "2/7: customer.subscription.created"
        stripe trigger customer.subscription.created
        sleep 2
        
        echo "3/7: invoice.payment_succeeded"
        stripe trigger invoice.payment_succeeded
        sleep 2
        
        echo "4/7: customer.subscription.updated"
        stripe trigger customer.subscription.updated
        sleep 2
        
        echo "5/7: customer.subscription.trial_will_end"
        stripe trigger customer.subscription.trial_will_end
        sleep 2
        
        echo "6/7: invoice.payment_failed"
        stripe trigger invoice.payment_failed
        sleep 2
        
        echo "7/7: customer.subscription.deleted"
        stripe trigger customer.subscription.deleted
        
        echo ""
        echo "✅ All tests complete! Check server logs for results."
        ;;
    0)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done! Check your server logs for webhook processing details."
echo "💡 Look for log emojis: ℹ️ (info) ✅ (success) ⚠️ (warning) ❌ (error)"
