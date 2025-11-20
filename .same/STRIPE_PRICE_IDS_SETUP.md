# 🔧 Stripe Price IDs - Setup Guide

**Date:** November 20, 2025
**Status:** ⚠️ **REQUIRED** - Subscription payments will not work without these IDs

---

## ❌ Current Problem

Your `.env.local` file has **placeholder values** for Stripe Price IDs:

```env
STRIPE_PRICE_2_2=price_xxxxxxxxxxxxx  # ❌ Invalid
STRIPE_PRICE_2_3=price_xxxxxxxxxxxxx  # ❌ Invalid
# ... etc (12 variants total)
```

This causes the error:
```
Error: No such price: 'price_xxxxxxxxxxxxx'
```

---

## ✅ Solution: Create Real Stripe Price IDs

You need to create **12 recurring subscription prices** in your Stripe Dashboard.

### Step 1: Login to Stripe

1. Go to https://dashboard.stripe.com
2. Login with your Stripe account
3. Make sure you're in **Test Mode** (toggle in top right) for testing
4. When ready for production, switch to **Live Mode**

---

### Step 2: Create Subscription Products & Prices

For **each combination** of people × days, create a subscription price:

#### Pricing Table (Weekly Subscription)

| People | Days | Price (PLN/week) | Env Variable Name |
|--------|------|------------------|-------------------|
| 2 | 2 | 180 zł | `STRIPE_PRICE_2_2` |
| 2 | 3 | 270 zł | `STRIPE_PRICE_2_3` |
| 2 | 4 | 360 zł | `STRIPE_PRICE_2_4` |
| 2 | 5 | 449 zł | `STRIPE_PRICE_2_5` |
| 3 | 2 | 270 zł | `STRIPE_PRICE_3_2` |
| 3 | 3 | 405 zł | `STRIPE_PRICE_3_3` |
| 3 | 4 | 540 zł | `STRIPE_PRICE_3_4` |
| 3 | 5 | 675 zł | `STRIPE_PRICE_3_5` |
| 4 | 2 | 360 zł | `STRIPE_PRICE_4_2` |
| 4 | 3 | 540 zł | `STRIPE_PRICE_4_3` |
| 4 | 4 | 720 zł | `STRIPE_PRICE_4_4` |
| 4 | 5 | 900 zł | `STRIPE_PRICE_4_5` |

---

### Step 3: Create Each Price in Stripe Dashboard

#### For Example: 2 people × 3 days = 270 zł/week

1. **Go to:** Products → Click "Add product" button
2. **Product Details:**
   - **Name:** `Smakowało Box - 2 osoby × 3 dni` (or similar descriptive name)
   - **Description:** `Subskrypcja pudełka dla 2 osób z 3 posiłkami tygodniowo`
   - **Image:** (Optional) Upload product image
3. **Pricing:**
   - **Pricing model:** Standard pricing
   - **Price:** `270` PLN
   - **Billing period:** Weekly (Recurring)
   - **Trial period:** (Optional) 0 days or add trial if you want
4. **Click "Save product"**
5. **Copy the Price ID:**
   - After saving, you'll see a **Price ID** like `price_1ABC123XYZ456`
   - **Copy this ID** - you'll need it for `.env.local`

#### Repeat for All 12 Variants

Create 11 more prices following the same pattern, changing:
- Product name (e.g., "2 osoby × 4 dni", "3 osoby × 2 dni")
- Price amount (see table above)
- Copy each Price ID

---

### Step 4: Update `.env.local` with Real Price IDs

Open `.env.local` and replace the placeholder values:

```env
# Stripe Subscription Price IDs (12 variants: people x days)
# Server-side only - used by API routes, not exposed to client
STRIPE_PRICE_2_2=price_1ABC123XYZ456  # ✅ Real ID from Stripe
STRIPE_PRICE_2_3=price_1DEF456UVW789  # ✅ Real ID from Stripe
STRIPE_PRICE_2_4=price_1GHI789RST012  # ✅ Real ID from Stripe
STRIPE_PRICE_2_5=price_1JKL012MNO345  # ✅ Real ID from Stripe
STRIPE_PRICE_3_2=price_1PQR345STU678  # ✅ Real ID from Stripe
STRIPE_PRICE_3_3=price_1VWX678YZA901  # ✅ Real ID from Stripe
STRIPE_PRICE_3_4=price_1BCD901EFG234  # ✅ Real ID from Stripe
STRIPE_PRICE_3_5=price_1HIJ234KLM567  # ✅ Real ID from Stripe
STRIPE_PRICE_4_2=price_1NOP567QRS890  # ✅ Real ID from Stripe
STRIPE_PRICE_4_3=price_1TUV890WXY123  # ✅ Real ID from Stripe
STRIPE_PRICE_4_4=price_1ZAB123CDE456  # ✅ Real ID from Stripe
STRIPE_PRICE_4_5=price_1FGH456IJK789  # ✅ Real ID from Stripe
```

---

### Step 5: Deploy to Vercel

After updating `.env.local`, you need to add these environment variables to Vercel:

1. Go to https://vercel.com
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add **all 12 variables** (one by one):
   - **Key:** `STRIPE_PRICE_2_2` (no NEXT_PUBLIC_ prefix - server-side only)
   - **Value:** `price_1ABC123XYZ456` (your real Stripe Price ID)
   - **Environment:** Production, Preview, Development
5. Click "Save"
6. **Redeploy** your project to apply the new environment variables

**Note:** These variables do NOT need `NEXT_PUBLIC_` prefix because they are used server-side only (in API routes). This is more secure as Stripe Price IDs are not exposed to the browser.

---

## 🧪 Testing

### Test Mode (Recommended First)

1. Create all 12 prices in Stripe **Test Mode**
2. Use test Price IDs in `.env.local` and Vercel
3. Test the full checkout flow with Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)

### Production Mode

1. When ready, switch Stripe to **Live Mode**
2. Create the same 12 prices again in Live Mode
3. Update `.env.local` and Vercel with **live Price IDs**
4. Test with a real card (or test with a small amount first)

---

## 📝 Quick Checklist

- [ ] Login to Stripe Dashboard
- [ ] Switch to Test Mode
- [ ] Create 12 subscription products + prices
- [ ] Copy all 12 Price IDs
- [ ] Update `.env.local` with real Price IDs
- [ ] Add environment variables to Vercel
- [ ] Redeploy Vercel project
- [ ] Test checkout flow with Stripe test card
- [ ] (When ready) Repeat for Live Mode

---

## 🚀 Alternative: Use Stripe CLI

If you prefer automation, use Stripe CLI to create all prices at once:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Create prices (run this script)
for people in 2 3 4; do
  for days in 2 3 4 5; do
    case "${people}_${days}" in
      2_2) price=180 ;;
      2_3) price=270 ;;
      2_4) price=360 ;;
      2_5) price=449 ;;
      3_2) price=270 ;;
      3_3) price=405 ;;
      3_4) price=540 ;;
      3_5) price=675 ;;
      4_2) price=360 ;;
      4_3) price=540 ;;
      4_4) price=720 ;;
      4_5) price=900 ;;
    esac

    stripe products create \
      --name "Smakowało Box - ${people} osoby × ${days} dni" \
      --description "Subskrypcja pudełka dla ${people} osób z ${days} posiłkami tygodniowo"

    # Use the product ID from above to create price
    stripe prices create \
      --currency pln \
      --unit-amount $((price * 100)) \
      --recurring[interval]=week \
      --product prod_XXXXX  # Replace with product ID from previous command
  done
done
```

---

## ❓ Need Help?

**Stripe Documentation:**
- https://stripe.com/docs/products-prices/overview
- https://stripe.com/docs/billing/subscriptions/overview

**Contact Same Support:**
- support@same.new

---

**Created by:** Same AI Assistant
**Powered by:** [Same.new](https://same.new)
