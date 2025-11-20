# ✅ Vercel Deployment Checklist

**Critical:** Payment flow will NOT work until you complete this checklist!

---

## 📋 Step-by-Step Instructions

### Step 1: Open Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Login if needed
3. Find your project: **smakowalo-app**
4. Click on the project to open it

### Step 2: Navigate to Environment Variables
1. Click **"Settings"** tab (top navigation)
2. Click **"Environment Variables"** in left sidebar
3. You should see the "Add New" button

### Step 3: Add Each Price ID Variable

For **EACH** of the 12 variables below:

1. Click **"Add New"** button
2. **Key:** Copy the variable name (e.g., `STRIPE_PRICE_2_2`)
3. **Value:** Copy the price ID (e.g., `price_1SVD45ChaDkFJkJI2DkNEpkK`)
4. **Environment:** Select ALL three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### Variables to Add:

```
Key: STRIPE_PRICE_2_2
Value: price_1SVD45ChaDkFJkJI2DkNEpkK
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_2_3
Value: price_1SVWHUChaDkFJkJIAEZbXXei
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_2_4
Value: price_1SVD45ChaDkFJkJI8OP7MDB3
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_2_5
Value: price_1SVD45ChaDkFJkJIzdO9CUAI
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_3_2
Value: price_1SVD45ChaDkFJkJIwhAc79kF
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_3_3
Value: price_1SVD45ChaDkFJkJIavPtADkM
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_3_4
Value: price_1SVD45ChaDkFJkJIQD8WJShG
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_3_5
Value: price_1SVD45ChaDkFJkJIdMvMGP4O
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_4_2
Value: price_1SVD45ChaDkFJkJIKS1x4fwL
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_4_3
Value: price_1SVD45ChaDkFJkJIsmkCYQvL
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_4_4
Value: price_1SVD45ChaDkFJkJIgwyRP3da
Environment: Production, Preview, Development
```

```
Key: STRIPE_PRICE_4_5
Value: price_1SVD45ChaDkFJkJIH0Rw81fj
Environment: Production, Preview, Development
```

### Step 4: Wait for Auto-Deploy
After saving all variables:
1. Vercel will automatically trigger a redeploy
2. Wait 2-3 minutes for deployment to complete
3. Check **"Deployments"** tab to see progress
4. Look for green ✅ checkmark when done

### Step 5: Test the Kreator
1. Go to your production site: https://smakowalo.pl/kreator
2. Select a plan (e.g., 2 people × 3 days)
3. Complete all 7 steps
4. Step 7 should redirect to Stripe Checkout
5. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
6. Complete payment
7. Check Stripe Dashboard for new subscription

### Step 6: Verify Configuration
Visit: https://smakowalo.pl/api/check-stripe-config

Should return:
```json
{
  "allConfigured": true,
  "missingCount": 0,
  "total": 12
}
```

---

## ✅ Completion Checklist

- [ ] Logged into Vercel Dashboard
- [ ] Opened smakowalo-app project
- [ ] Navigated to Settings → Environment Variables
- [ ] Added STRIPE_PRICE_2_2
- [ ] Added STRIPE_PRICE_2_3
- [ ] Added STRIPE_PRICE_2_4
- [ ] Added STRIPE_PRICE_2_5
- [ ] Added STRIPE_PRICE_3_2
- [ ] Added STRIPE_PRICE_3_3
- [ ] Added STRIPE_PRICE_3_4
- [ ] Added STRIPE_PRICE_3_5
- [ ] Added STRIPE_PRICE_4_2
- [ ] Added STRIPE_PRICE_4_3
- [ ] Added STRIPE_PRICE_4_4
- [ ] Added STRIPE_PRICE_4_5
- [ ] Waited for Vercel auto-deploy to complete
- [ ] Tested kreator checkout flow
- [ ] Verified /api/check-stripe-config endpoint
- [ ] Completed test payment with Stripe

---

## 🎯 Quick Copy-Paste Format

If Vercel allows bulk import (check their docs):

```env
STRIPE_PRICE_2_2=price_1SVD45ChaDkFJkJI2DkNEpkK
STRIPE_PRICE_2_3=price_1SVWHUChaDkFJkJIAEZbXXei
STRIPE_PRICE_2_4=price_1SVD45ChaDkFJkJI8OP7MDB3
STRIPE_PRICE_2_5=price_1SVD45ChaDkFJkJIzdO9CUAI
STRIPE_PRICE_3_2=price_1SVD45ChaDkFJkJIwhAc79kF
STRIPE_PRICE_3_3=price_1SVD45ChaDkFJkJIavPtADkM
STRIPE_PRICE_3_4=price_1SVD45ChaDkFJkJIQD8WJShG
STRIPE_PRICE_3_5=price_1SVD45ChaDkFJkJIdMvMGP4O
STRIPE_PRICE_4_2=price_1SVD45ChaDkFJkJIKS1x4fwL
STRIPE_PRICE_4_3=price_1SVD45ChaDkFJkJIsmkCYQvL
STRIPE_PRICE_4_4=price_1SVD45ChaDkFJkJIgwyRP3da
STRIPE_PRICE_4_5=price_1SVD45ChaDkFJkJIH0Rw81fj
```

---

## ❓ Troubleshooting

**Q: Vercel deployment failed after adding variables**
- Check Vercel deployment logs for errors
- Verify all 12 variables are added correctly
- Make sure no typos in price IDs

**Q: Kreator shows "No such price" error**
- Check /api/check-stripe-config
- Verify environment variables in Vercel
- Redeploy manually from Vercel dashboard

**Q: Test payment not working**
- Make sure you're using test card: 4242 4242 4242 4242
- Check Stripe Dashboard → Developers → API Keys (use test mode)
- Verify STRIPE_SECRET_KEY is also in Vercel

---

**Time Estimate:** 10-15 minutes to add all variables

**Powered by:** [Same.new](https://same.new)
