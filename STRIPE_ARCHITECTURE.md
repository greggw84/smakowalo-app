# Stripe Subscription System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SMAKOWALO SUBSCRIPTION FLOW                       │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   /kreator   │  User selects subscription plan
└──────┬───────┘  - People: 2, 3, or 4
       │          - Days: 2, 3, 4, or 5
       │          - Diets & allergies
       │          - Meals for first delivery
       │
       v
┌──────────────────────────────────────┐
│  POST /api/create-subscription       │
│  --------------------------------    │
│  Payload:                            │
│  {                                   │
│    numberOfPeople: 3,                │
│    numberOfDays: 4,                  │
│    selectedDiets: ["Keto"],          │
│    selectedAllergies: ["gluten"],    │
│    selected_meals: ["Meal 1", ...]   │
│  }                                   │
│                                      │
│  Runtime: nodejs (required!)         │
│  --------------------------------    │
│  1. Calculate planKey: "3x4"         │
│  2. Calculate price: 360 PLN         │
│  3. Find/create Stripe Price         │
│  4. Create Checkout session          │
│  5. Return { url }                   │
└──────────────┬───────────────────────┘
               │
               v
┌──────────────────────────────────────┐
│   Stripe Checkout Session            │
│   https://checkout.stripe.com/...    │
│                                      │
│   User enters payment details        │
│   Test card: 4242 4242 4242 4242     │
│                                      │
│   Success URL: /panel?subscription=  │
│                success&session_id=X  │
│   Cancel URL:  /kreator?resume=1     │
└──────────────┬───────────────────────┘
               │
               │ (Payment successful)
               │
               v
┌──────────────────────────────────────┐
│   Stripe Webhook Event               │
│   POST /api/webhooks/stripe          │
│   --------------------------------   │
│   Event: customer.subscription.      │
│          created                     │
│                                      │
│   Metadata:                          │
│   - plan_key: "3x4"                  │
│   - people: 3                        │
│   - days: 4                          │
│   - diets: ["Keto"]                  │
│   - allergies: ["gluten"]            │
│   - selected_meals: [...]            │
│                                      │
│   Signature verified ✓               │
│   Runtime: nodejs (required!)        │
└──────────────┬───────────────────────┘
               │
               v
┌──────────────────────────────────────┐
│   Supabase Database                  │
│   subscriptions table                │
│   --------------------------------   │
│   INSERT/UPDATE:                     │
│   {                                  │
│     stripe_subscription_id: "sub_X"  │
│     stripe_customer_id: "cus_X"      │
│     customer_email: "user@email.com" │
│     status: "active"                 │
│     people: 3                        │
│     days: 4                          │
│     plan_key: "3x4"                  │
│     amount: 360.00                   │
│     currency: "pln"                  │
│     diets: ["Keto"]                  │
│     allergies: ["gluten"]            │
│     selected_meals: [...]            │
│     current_period_end: "2024-XX-XX" │
│     ...                              │
│   }                                  │
└──────────────┬───────────────────────┘
               │
               v
┌──────────────────────────────────────┐
│        /panel (User Panel)           │
│   --------------------------------   │
│   📦 Active Subscriptions            │
│                                      │
│   Smakowalo Box 3x4                  │
│   ✓ Active                           │
│                                      │
│   • 3 people                         │
│   • 4 days per week                  │
│   • Diety: Keto                      │
│   • Period ends: 2024-XX-XX          │
│                                      │
│   360.00 zł / weekly                 │
│                                      │
│   [Zarządzaj subskrypcją] ─────┐    │
└────────────────────────────────┼────┘
                                 │
                                 v
                    ┌────────────────────────┐
                    │  Stripe Customer Portal │
                    │  ---------------------- │
                    │  • Update payment       │
                    │  • Cancel subscription  │
                    │  • View invoices        │
                    │  • Update address       │
                    │                         │
                    │  Return URL: /panel     │
                    └─────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
                            PLAN COMBINATIONS
═══════════════════════════════════════════════════════════════════════════

Base price: 30 PLN per portion

┌────────┬──────┬──────────────┬────────────────┬──────────────┐
│ People │ Days │   Portions   │  Weekly Price  │   Plan Key   │
├────────┼──────┼──────────────┼────────────────┼──────────────┤
│   2    │  2   │  2×2 = 4     │    120 PLN     │     2x2      │
│   2    │  3   │  2×3 = 6     │    180 PLN     │     2x3      │
│   2    │  4   │  2×4 = 8     │    240 PLN     │     2x4      │
│   2    │  5   │  2×5 = 10    │    300 PLN     │     2x5      │
│   3    │  2   │  3×2 = 6     │    180 PLN     │     3x2      │
│   3    │  3   │  3×3 = 9     │    270 PLN     │     3x3      │
│   3    │  4   │  3×4 = 12    │    360 PLN     │     3x4      │
│   3    │  5   │  3×5 = 15    │    450 PLN     │     3x5      │
│   4    │  2   │  4×2 = 8     │    240 PLN     │     4x2      │
│   4    │  3   │  4×3 = 12    │    360 PLN     │     4x3      │
│   4    │  4   │  4×4 = 16    │    480 PLN     │     4x4      │
│   4    │  5   │  4×5 = 20    │    600 PLN     │     4x5      │
└────────┴──────┴──────────────┴────────────────┴──────────────┘

Total combinations: 12 plans

═══════════════════════════════════════════════════════════════════════════
                          STRIPE PRICE CREATION
═══════════════════════════════════════════════════════════════════════════

Prices are created automatically with:

Product: "Smakowalo Box" (STRIPE_PRODUCT_ID)
├── Price: 12000 grosze (120 PLN)  lookup_key: "2x2"  ✓
├── Price: 18000 grosze (180 PLN)  lookup_key: "2x3"  ✓
├── Price: 24000 grosze (240 PLN)  lookup_key: "2x4"  ✓
├── Price: 30000 grosze (300 PLN)  lookup_key: "2x5"  ✓
├── Price: 18000 grosze (180 PLN)  lookup_key: "3x2"  ✓
├── Price: 27000 grosze (270 PLN)  lookup_key: "3x3"  ✓
├── Price: 36000 grosze (360 PLN)  lookup_key: "3x4"  ✓
├── Price: 45000 grosze (450 PLN)  lookup_key: "3x5"  ✓
├── Price: 24000 grosze (240 PLN)  lookup_key: "4x2"  ✓
├── Price: 36000 grosze (360 PLN)  lookup_key: "4x3"  ✓
├── Price: 48000 grosze (480 PLN)  lookup_key: "4x4"  ✓
└── Price: 60000 grosze (600 PLN)  lookup_key: "4x5"  ✓

All prices:
• Recurring: Weekly (interval: week, interval_count: 1)
• Currency: PLN
• Created on-demand when first selected

═══════════════════════════════════════════════════════════════════════════
                          WEBHOOK EVENTS HANDLED
═══════════════════════════════════════════════════════════════════════════

✓ customer.subscription.created   → Insert new subscription
✓ customer.subscription.updated   → Update subscription details
✓ customer.subscription.deleted   → Mark as canceled
✓ checkout.session.completed      → Log checkout completion (optional)

All events store metadata:
• plan_key, people, days
• diets, allergies, selected_meals
• Stripe IDs: subscription, customer, price, product

═══════════════════════════════════════════════════════════════════════════
                          ENVIRONMENT VARIABLES
═══════════════════════════════════════════════════════════════════════════

Required for subscription system:

✓ STRIPE_SECRET_KEY              → sk_test_... or sk_live_...
✓ STRIPE_PRODUCT_ID              → prod_...
✓ STRIPE_WEBHOOK_SECRET          → whsec_...
✓ NEXT_PUBLIC_APP_URL            → https://www.smakowalo.pl
✓ NEXT_PUBLIC_SUPABASE_URL       → https://xxx.supabase.co
✓ SUPABASE_SERVICE_ROLE_KEY      → eyJhbGci...

See STRIPE_ENV_SETUP.md for detailed setup instructions.
