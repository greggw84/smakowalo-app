# 📧 Email Service Setup Guide

Your app supports **SendGrid** and **Resend** email services. Choose one and follow the setup instructions below.

## 🚀 Quick Setup (Choose One)

### Option 1: SendGrid (Recommended for Production)

**Pros:** Established, reliable, good free tier (100 emails/day)
**Cons:** Requires domain verification for production

#### Step 1: Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account
3. Verify your email

#### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it: `Smakowalo App`
4. Select "Full Access"
5. Copy the API key (you won't see it again!)

#### Step 3: Verify Sender Email
1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your details:
   - From Name: `Smakowało`
   - From Email: `noreply@yourdomain.com` (or your email)
4. Check your email and verify

#### Step 4: Add to Environment Variables

In your Vercel dashboard or `.env.local`:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=pomoc@smakowalo.pl
```

#### Step 5: Test Email
Deploy and test contact form or newsletter signup!

---

### Option 2: Resend (Modern & Developer-Friendly)

**Pros:** Modern API, easy setup, generous free tier (3000 emails/month)
**Cons:** Newer service, requires domain for production

#### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up with GitHub or email
3. Verify your email

#### Step 2: Add Domain (Optional but Recommended)
1. Go to Domains
2. Click "Add Domain"
3. Add your domain: `smakowalo.pl`
4. Add the DNS records shown
5. Wait for verification (usually 5-10 minutes)

#### Step 3: Create API Key
1. Go to API Keys
2. Click "Create API Key"
3. Name it: `Smakowalo Production`
4. Select permissions: "Sending access"
5. Copy the API key

#### Step 4: Add to Environment Variables

In your Vercel dashboard or `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@smakowalo.pl
ADMIN_EMAIL=pomoc@smakowalo.pl
```

#### Step 5: Test Email
Deploy and test!

---

## 🧪 Testing Without Email Service

For development, the app uses a **mock email service** that logs emails to the console.

No configuration needed - just check your server logs!

---

## 📝 Email Templates Included

Your app automatically sends these emails:

### 1. **Newsletter Confirmation**
- Sent when someone subscribes
- Thanks them and confirms subscription
- Includes unsubscribe link

### 2. **Contact Form Auto-Reply**
- Sent to user after contact form submission
- Confirms we received their message
- Professional acknowledgment

### 3. **Contact Form Notification (to Admin)**
- Sent to your admin email
- Includes all form details
- Allows direct reply

### 4. **Order Confirmation**
- Sent after successful order
- Includes order number and details
- Delivery date information

### 5. **Welcome Email**
- Sent to new users
- Welcomes them to Smakowało
- Provides getting started info

### 6. **Password Reset**
- Sent when user requests password reset
- Secure reset link
- Expires in 1 hour

---

## 🎨 Customizing Email Templates

Email templates are in: `src/lib/email.ts`

### Example: Customize Welcome Email

```typescript
// Find this in src/lib/email.ts
welcome: (name: string, loginUrl: string) => ({
  subject: 'Witaj w Smakowało! 🍽️',
  html: `
    <h1>Witaj ${name}!</h1>
    <p>Cieszymy się, że dołączyłeś do rodziny Smakowało!</p>
    <!-- Customize this HTML -->
  `
})
```

---

## 🔧 Advanced Configuration

### Custom SMTP Server

If you have your own SMTP server:

```bash
# .env.local
EMAIL_SERVER_HOST=smtp.yourdomain.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@yourdomain.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=Smakowało <noreply@yourdomain.com>
```

### Multiple Email Addresses

```bash
# Admin emails (comma-separated)
ADMIN_EMAIL=admin1@smakowalo.pl,admin2@smakowalo.pl

# Different from emails for different purposes
SENDGRID_FROM_EMAIL=noreply@smakowalo.pl
ORDER_NOTIFICATION_EMAIL=orders@smakowalo.pl
SUPPORT_EMAIL=pomoc@smakowalo.pl
```

---

## 📊 Email Service Comparison

| Feature | SendGrid | Resend | Mock (Dev) |
|---------|----------|---------|------------|
| Free Tier | 100/day | 3000/month | Unlimited |
| Setup Time | 10 min | 5 min | 0 min |
| Domain Required | For production | For production | No |
| Analytics | Yes | Yes | No |
| Templates | Yes | Yes | No |
| Best For | Production | Modern apps | Development |

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check API Key**
   ```bash
   # Make sure it's set correctly
   echo $SENDGRID_API_KEY
   # or
   echo $RESEND_API_KEY
   ```

2. **Check From Email**
   - Must be verified in SendGrid/Resend
   - Check for typos
   - Ensure domain is verified

3. **Check Server Logs**
   ```bash
   # Vercel logs
   vercel logs

   # Or check your deployment logs in Vercel dashboard
   ```

### Emails Go to Spam

1. **Verify Domain**
   - Add SPF, DKIM records
   - Verify domain in SendGrid/Resend

2. **Improve Content**
   - Avoid spam trigger words
   - Include unsubscribe link
   - Use proper formatting

3. **Use Authenticated Domain**
   - Don't use Gmail/Yahoo as from address
   - Use your own domain

### Rate Limiting

If you hit rate limits:

1. **Upgrade Plan**
   - SendGrid: Pay per email
   - Resend: Upgrade tier

2. **Implement Queue**
   - Use Redis queue
   - Batch emails
   - Delay sending

---

## 📚 Email Best Practices

### 1. **Always Include Unsubscribe**
```html
<p style="font-size: 12px; color: #666;">
  <a href="${unsubscribeUrl}">Zrezygnuj z newslettera</a>
</p>
```

### 2. **Mobile-Friendly Design**
```html
<!-- Use responsive tables -->
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding: 20px;">
      Content here
    </td>
  </tr>
</table>
```

### 3. **Clear Call-to-Action**
```html
<a href="${actionUrl}" style="
  background: #74a53d;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  display: inline-block;
">
  Take Action
</a>
```

### 4. **Track Opens (Optional)**
```typescript
// In SendGrid dashboard
// Enable "Event Webhook"
// Track: opens, clicks, bounces
```

---

## ✅ Setup Checklist

- [ ] Choose email service (SendGrid or Resend)
- [ ] Create account and verify email
- [ ] Create API key
- [ ] Verify sender email/domain
- [ ] Add environment variables to Vercel
- [ ] Redeploy app
- [ ] Test contact form
- [ ] Test newsletter signup
- [ ] Check emails arrive
- [ ] Check they don't go to spam
- [ ] Customize email templates (optional)
- [ ] Set up email analytics (optional)

---

## 🎉 You're All Set!

Your email service is now configured and ready to send emails to your customers!

**Next Steps:**
1. Test all email functions
2. Monitor delivery rates
3. Customize templates to match your brand
4. Set up email analytics

Need help? Check the [SendGrid Docs](https://docs.sendgrid.com) or [Resend Docs](https://resend.com/docs)
