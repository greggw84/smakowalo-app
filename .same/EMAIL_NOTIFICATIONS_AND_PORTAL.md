# Email Notifications & Stripe Customer Portal

This document explains the email notification system and Stripe Customer Portal integration.

## 📧 Email Notifications

### Overview

Automatic email notifications are sent for key subscription events:
1. **Subscription Created** - Welcome email when subscription is activated
2. **Payment Succeeded** - Confirmation after successful payment
3. **Payment Failed** - Alert when payment fails with action required

### Email Service

The system uses **SMTP via Nodemailer** with Bluehost configuration:
- Host: `cs347.bluehost.com`
- Port: `587`
- From: `no_reply@smakowalo.pl`

**Fallback options:**
- SendGrid (if `SENDGRID_API_KEY` is set)
- Resend (if `RESEND_API_KEY` is set)
- Mock service (for development)

### Email Templates

All templates are in `src/lib/email.ts` with professional Polish branding:

#### 1. Subscription Created Email

**Trigger:** Stripe webhook `checkout.session.completed`

**Content:**
- Welcome message
- Trial period notification (if applicable)
- Subscription details (plan, delivery day, price)
- What's next steps
- Link to manage subscription

**Template data:**
```typescript
{
  name: string
  planDetails: string  // e.g., "3 osoby, 4 dni w tygodniu"
  deliveryDay: string  // "Wtorek" or "Czwartek"
  firstDeliveryDate: string
  weeklyPrice: string  // e.g., "540.00 PLN"
  trialDays?: number   // Optional trial period
  manageUrl: string
}
```

#### 2. Payment Succeeded Email

**Trigger:** Stripe webhook `invoice.payment_succeeded`

**Content:**
- Payment confirmation
- Amount paid
- Plan details
- Next payment date
- Link to download invoice

**Template data:**
```typescript
{
  name: string
  amount: string       // e.g., "540.00 PLN"
  invoiceUrl: string   // Stripe hosted invoice
  nextPaymentDate: string
  planDetails: string
}
```

#### 3. Payment Failed Email

**Trigger:** Stripe webhook `invoice.payment_failed`

**Content:**
- Payment failure alert
- Amount due
- Retry date
- Instructions to update payment method
- Link to Stripe Customer Portal

**Template data:**
```typescript
{
  name: string
  amount: string
  retryDate: string
  updatePaymentUrl: string  // Stripe Customer Portal
  planDetails: string
}
```

### Webhook Integration

The webhook handler at `/api/webhook/stripe/route.ts` automatically:
1. Receives Stripe events
2. Verifies webhook signature
3. Updates database
4. Sends appropriate email
5. Logs all actions

**Email sending flow:**
```
Stripe Event → Webhook → Database Update → Email Template → SMTP → User
```

### Testing Emails

#### Local Testing

1. **Check email service initialization:**
   ```
   📧 Using SMTP email service
   ```

2. **Test individual templates:**
   ```typescript
   import { sendEmail, emailTemplates } from '@/lib/email'

   await sendEmail({
     to: 'test@example.com',
     ...emailTemplates.subscriptionCreated({
       name: 'Jan',
       planDetails: '2 osoby, 3 dni',
       deliveryDay: 'Wtorek',
       firstDeliveryDate: '12 grudnia 2025',
       weeklyPrice: '270.00 PLN',
       manageUrl: 'https://smakowalo.pl/panel'
     })
   })
   ```

3. **Trigger via Stripe CLI:**
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger invoice.payment_succeeded
   stripe trigger invoice.payment_failed
   ```

#### Production Testing

1. Complete a real subscription checkout
2. Check user's email inbox
3. Verify Stripe Dashboard → Webhooks → Event deliveries
4. Check server logs for email sending confirmations

### Email Logs

Look for these log messages:

```
✅ Email sent successfully via SMTP: <message-id>
❌ SMTP email error: <error>
✅ Subscription created email sent to: user@example.com
✅ Payment succeeded email sent to: user@example.com
✅ Payment failed email sent to: user@example.com
```

---

## 💳 Stripe Customer Portal

### Overview

The Stripe Customer Portal allows users to self-service their subscription:
- **Update payment method** (add/remove cards)
- **View invoices** (download past invoices)
- **Update billing details** (address, tax ID)
- **Cancel subscription** (with confirmation)

### Architecture

**Flow:**
```
User clicks "Zarządzaj płatnościami"
  ↓
Frontend calls /api/stripe/customer-portal
  ↓
Backend creates portal session with Stripe
  ↓
User redirected to Stripe-hosted portal
  ↓
After completion, return to /panel
```

### API Endpoint

**Location:** `/api/stripe/customer-portal/route.ts`

**Method:** POST

**Authentication:** Requires Supabase auth token in Authorization header

**Request:**
```typescript
POST /api/stripe/customer-portal
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "url": "https://billing.stripe.com/session/xyz..."
}
```

**Errors:**
- `401` - Unauthorized (missing/invalid token)
- `404` - No subscription found
- `500` - Server error

### Frontend Integration

**Location:** `src/app/panel/subscription-overview.tsx`

**Button added:**
```tsx
<Button
  variant="outline"
  className="w-full justify-start text-blue-600 border-blue-300 hover:bg-blue-50"
  onClick={handleOpenCustomerPortal}
  disabled={portalLoading}
>
  {portalLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Ładowanie...
    </>
  ) : (
    <>
      <CreditCard className="w-4 h-4 mr-2" />
      Zarządzaj płatnościami
    </>
  )}
</Button>
```

**Handler function:**
```typescript
const handleOpenCustomerPortal = async () => {
  setPortalLoading(true)
  try {
    // Get Supabase session
    const supabase = createClient(...)
    const { data: { session } } = await supabase.auth.getSession()

    // Create portal session
    const response = await fetch('/api/stripe/customer-portal', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
    })

    const data = await response.json()

    // Redirect to Stripe
    if (data.url) {
      window.location.href = data.url
    }
  } catch (error) {
    alert('Nie udało się otworzyć panelu płatności.')
  } finally {
    setPortalLoading(false)
  }
}
```

### Stripe Customer Portal Configuration

**In Stripe Dashboard:**

1. Go to **Settings** → **Billing** → **Customer Portal**
2. Enable the portal
3. Configure features:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to view invoices
   - ✅ Allow customers to update billing details
   - ✅ Allow customers to cancel subscriptions
4. Set cancellation options:
   - Cancel immediately OR
   - Cancel at period end (recommended)
5. Set return URL: `https://www.smakowalo.pl/panel`

### Security

**Authentication:**
- User must be logged in (Supabase auth)
- API verifies user owns the subscription
- Stripe session is single-use and expires

**Data Protection:**
- No sensitive data stored in database
- Card details never touch our servers
- All payment processing via Stripe

### User Experience

**What users see:**
1. Click "Zarządzaj płatnościami" button
2. Redirected to Stripe-hosted page (same branding)
3. Can perform self-service actions
4. Returned to /panel after completion

**Benefits:**
- No credit card form to maintain
- PCI compliance handled by Stripe
- Professional, secure experience
- Instant updates reflected in webhooks

---

## 📁 Files Modified

### Email System
- ✏️ `src/lib/email.ts` - Added SMTP service & subscription templates
- ✏️ `src/app/api/webhook/stripe/route.ts` - Added email sending logic

### Customer Portal
- ➕ `src/app/api/stripe/customer-portal/route.ts` - NEW API endpoint
- ✏️ `src/app/panel/subscription-overview.tsx` - Added portal button

### Documentation
- ➕ `.same/EMAIL_NOTIFICATIONS_AND_PORTAL.md` - This file

---

## 🧪 Testing Checklist

### Email Notifications

- [ ] SMTP configuration in .env.local is correct
- [ ] Webhook receives `checkout.session.completed` event
- [ ] User receives subscription created email
- [ ] Webhook receives `invoice.payment_succeeded` event
- [ ] User receives payment succeeded email
- [ ] Webhook receives `invoice.payment_failed` event
- [ ] User receives payment failed email with portal link
- [ ] All emails display correctly in Gmail, Outlook, etc.
- [ ] Polish characters (ą, ć, ę, etc.) display correctly

### Customer Portal

- [ ] API endpoint requires authentication
- [ ] Portal session created successfully
- [ ] User redirected to Stripe portal
- [ ] User can update payment method
- [ ] User can view/download invoices
- [ ] User can cancel subscription
- [ ] Return URL redirects to /panel
- [ ] Changes sync back via webhooks

---

## 🚀 Deployment

### Environment Variables

Ensure these are set in production:

```env
# SMTP (already configured)
SMTP_HOST=cs347.bluehost.com
SMTP_PORT=587
SMTP_USER=no_reply@smakowalo.pl
SMTP_PASS=@Justyna_Justyna.21
SMTP_FROM_EMAIL=no_reply@smakowalo.pl
SMTP_FROM_NAME=Smakowalo.pl

# Stripe (already configured)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX...

# Site URL
NEXT_PUBLIC_SITE_URL=https://www.smakowalo.pl
```

### Stripe Configuration

1. **Enable Customer Portal** in Stripe Dashboard
2. **Configure webhook** to send events to `/api/webhook/stripe`
3. **Test webhook** with Stripe CLI or test mode
4. **Monitor logs** for email sending confirmations

---

## 🐛 Troubleshooting

### Emails not sending

1. **Check email service logs:**
   ```
   📧 Using SMTP email service
   ```
2. **Verify SMTP credentials** in .env.local
3. **Check webhook event delivery** in Stripe Dashboard
4. **Look for error logs:**
   ```
   ❌ SMTP email error: ...
   ```

### Customer Portal not working

1. **Check user is authenticated:**
   ```
   ❌ Unauthorized - No auth token provided
   ```
2. **Verify subscription exists:**
   ```
   ❌ No active subscription found
   ```
3. **Check Stripe Customer ID:**
   ```
   ❌ Stripe customer not found
   ```
4. **Enable Customer Portal** in Stripe Dashboard

### Emails in spam folder

1. **Configure SPF record** for smakowalo.pl domain
2. **Add DKIM signature** in Bluehost
3. **Test with** [mail-tester.com](https://www.mail-tester.com)
4. **Consider** using SendGrid for better deliverability

---

## 📊 Monitoring

### Email Delivery

Monitor these metrics:
- Email send success rate
- Bounce rate
- Spam complaints
- Open rate (if tracking enabled)

### Customer Portal Usage

Track in Stripe Dashboard:
- Number of portal sessions created
- Payment method updates
- Subscription cancellations
- Invoice downloads

---

## 🔜 Future Enhancements

1. **Email tracking** - Track opens and clicks
2. **Email preferences** - Let users opt out of certain emails
3. **Transactional email service** - Migrate to SendGrid/Postmark
4. **Email templates in CMS** - Allow editing without code changes
5. **Localization** - Support multiple languages
6. **SMS notifications** - For critical alerts
7. **In-app notifications** - Show notifications in panel
8. **Email analytics dashboard** - Track email performance

---

## 📚 References

- [Stripe Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Best Practices](https://www.campaignmonitor.com/resources/guides/email-best-practices/)
