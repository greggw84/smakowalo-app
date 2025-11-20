/**
 * Email Notifications Service
 * Handles sending emails via SMTP (Bluehost) for subscription changes, account actions, etc.
 */

import nodemailer from 'nodemailer'

interface EmailParams {
  to: string
  subject: string
  text: string
  html: string
}

interface SubscriptionEmailData {
  userName: string
  subscriptionId: string
  planName: string
  nextDeliveryDate?: string
  pauseUntil?: string
}

/**
 * Create SMTP transporter (Bluehost)
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'cs347.bluehost.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || 'no_reply@smakowalo.pl',
      pass: process.env.SMTP_PASS || '',
    },
  })
}

/**
 * Send email using SMTP (Bluehost)
 */
export async function sendEmailDirect({ to, subject, text, html }: EmailParams): Promise<boolean> {
  try {
    const transporter = createTransporter()

    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || 'Smakowalo.pl'} <${process.env.SMTP_FROM_EMAIL || 'no_reply@smakowalo.pl'}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('✅ Email sent successfully via SMTP:', info.messageId, 'to:', to)
    return true
  } catch (error) {
    console.error('❌ SMTP email error:', error)
    return false
  }
}

/**
 * Generic send email function with template support (for webhooks)
 */
export async function sendEmail({
  to,
  subject,
  template,
  data
}: {
  to: string
  subject: string
  template: string
  data: any
}): Promise<boolean> {
  let text = ''
  let html = ''

  switch (template) {
    case 'subscription_created':
      text = `Witaj w Smakowało! 🎉

Twoja subskrypcja ${data.planType} została utworzona.
Następna dostawa: ${data.nextDelivery}

Zarządzaj subskrypcją: ${process.env.NEXT_PUBLIC_SITE_URL}/panel

Zespół Smakowało`

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: #4A7C59; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
.content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
.footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
</style></head><body>
<div class="container">
<div class="header"><h1>Witaj w Smakowało! 🎉</h1></div>
<div class="content">
<p>Twoja subskrypcja <strong>${data.planType}</strong> została utworzona.</p>
<p>Następna dostawa: <strong>${data.nextDelivery}</strong></p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/panel" style="display:inline-block;padding:12px 24px;background:#4A7C59;color:white;text-decoration:none;border-radius:5px;">Przejdź do panelu</a></p>
</div>
<div class="footer"><p>&copy; ${new Date().getFullYear()} Smakowało</p></div>
</div></body></html>`
      break

    case 'subscription_paused':
      text = `Subskrypcja wstrzymana

Twoja subskrypcja została wstrzymana.
Zostanie wznowiona: ${data.resumeDate}

Zespół Smakowało`

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: #4A7C59; color: white; padding: 20px; text-align: center; }
.content { background: #f9f9f9; padding: 30px; }
</style></head><body>
<div class="container">
<div class="header"><h1>Subskrypcja wstrzymana</h1></div>
<div class="content">
<p>Twoja subskrypcja została wstrzymana.</p>
<p>Zostanie wznowiona: <strong>${data.resumeDate}</strong></p>
</div></div></body></html>`
      break

    case 'subscription_resumed':
      text = `Subskrypcja wznowiona! 🎉

Twoja subskrypcja jest ponownie aktywna.
Następna dostawa: ${data.nextDelivery}

Zespół Smakowało`

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: #4A7C59; color: white; padding: 20px; text-align: center; }
.content { background: #f9f9f9; padding: 30px; }
</style></head><body>
<div class="container">
<div class="header"><h1>Subskrypcja wznowiona! 🎉</h1></div>
<div class="content">
<p>Twoja subskrypcja jest ponownie aktywna.</p>
<p>Następna dostawa: <strong>${data.nextDelivery}</strong></p>
</div></div></body></html>`
      break

    case 'subscription_cancelled':
      text = `Subskrypcja anulowana

Twoja subskrypcja zostanie zakończona: ${data.endDate}

Zespół Smakowało`

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: #dc3545; color: white; padding: 20px; text-align: center; }
.content { background: #f9f9f9; padding: 30px; }
</style></head><body>
<div class="container">
<div class="header"><h1>Subskrypcja anulowana</h1></div>
<div class="content">
<p>Twoja subskrypcja zostanie zakończona: <strong>${data.endDate}</strong></p>
</div></div></body></html>`
      break

    case 'payment_succeeded':
      text = `Płatność potwierdzona ✅

Kwota: ${data.amount} ${data.currency}

Zespół Smakowało`

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: #28a745; color: white; padding: 20px; text-align: center; }
.content { background: #f9f9f9; padding: 30px; }
</style></head><body>
<div class="container">
<div class="header"><h1>Płatność potwierdzona ✅</h1></div>
<div class="content">
<p>Kwota: <strong>${data.amount} ${data.currency}</strong></p>
${data.invoiceUrl ? `<p><a href="${data.invoiceUrl}">Zobacz fakturę</a></p>` : ''}
</div></div></body></html>`
      break

    case 'payment_failed':
      text = `Płatność nie powiodła się ❌

Kwota: ${data.amount} ${data.currency}
Następna próba: ${data.retryDate}

Zespół Smakowało`

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: #dc3545; color: white; padding: 20px; text-align: center; }
.content { background: #f9f9f9; padding: 30px; }
</style></head><body>
<div class="container">
<div class="header"><h1>Płatność nie powiodła się ❌</h1></div>
<div class="content">
<p>Kwota: <strong>${data.amount} ${data.currency}</strong></p>
<p>Następna próba: <strong>${data.retryDate}</strong></p>
</div></div></body></html>`
      break

    case 'trial_ending':
      text = `Okres próbny kończy się wkrótce ⏰

Data zakończenia: ${data.endDate}

Zespół Smakowało`

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
.content { background: #f9f9f9; padding: 30px; }
</style></head><body>
<div class="container">
<div class="header"><h1>Okres próbny kończy się wkrótce ⏰</h1></div>
<div class="content">
<p>Twój okres próbny kończy się: <strong>${data.endDate}</strong></p>
</div></div></body></html>`
      break

    default:
      console.error('❌ Unknown email template:', template)
      return false
  }

  return sendEmailDirect({ to, subject, text, html })
}

/**
 * Send subscription paused notification
 */
export async function sendSubscriptionPausedEmail(
  email: string,
  data: SubscriptionEmailData
): Promise<boolean> {
  const { userName, planName, pauseUntil } = data

  const subject = 'Subskrypcja Smakowało została wstrzymana'

  const text = `
Witaj ${userName},

Twoja subskrypcja "${planName}" została wstrzymana.

${pauseUntil ? `Subskrypcja zostanie automatycznie wznowiona: ${pauseUntil}` : 'Możesz wznowić subskrypcję w dowolnym momencie w panelu klienta.'}

Pozdrawiamy,
Zespół Smakowało
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4A7C59; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 12px 24px; background: #4A7C59; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Subskrypcja wstrzymana</h1>
    </div>
    <div class="content">
      <p>Witaj ${userName},</p>

      <p>Twoja subskrypcja <strong>"${planName}"</strong> została wstrzymana.</p>

      ${pauseUntil ?
        `<p>Subskrypcja zostanie automatycznie wznowiona: <strong>${pauseUntil}</strong></p>` :
        '<p>Możesz wznowić subskrypcję w dowolnym momencie w panelu klienta.</p>'
      }

      <p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/panel" class="button">Przejdź do panelu</a>
      </p>

      <p>Pozdrawiamy,<br>Zespół Smakowało</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Smakowało. Wszystkie prawa zastrzeżone.</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return sendEmailDirect({ to: email, subject, text, html })
}

/**
 * Send subscription resumed notification
 */
export async function sendSubscriptionResumedEmail(
  email: string,
  data: SubscriptionEmailData
): Promise<boolean> {
  const { userName, planName, nextDeliveryDate } = data

  const subject = 'Subskrypcja Smakowało została wznowiona'

  const text = `
Witaj ${userName},

Twoja subskrypcja "${planName}" została wznowiona!

${nextDeliveryDate ? `Następna dostawa: ${nextDeliveryDate}` : 'Dostawy będą realizowane zgodnie z harmonogramem.'}

Cieszymy się, że wracasz!

Zespół Smakowało
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4A7C59; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 12px 24px; background: #4A7C59; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Subskrypcja wznowiona! 🎉</h1>
    </div>
    <div class="content">
      <div class="success">
        <p><strong>Twoja subskrypcja została pomyślnie wznowiona!</strong></p>
      </div>

      <p>Witaj ${userName},</p>

      <p>Twoja subskrypcja <strong>"${planName}"</strong> jest teraz aktywna.</p>

      ${nextDeliveryDate ?
        `<p>Następna dostawa: <strong>${nextDeliveryDate}</strong></p>` :
        '<p>Dostawy będą realizowane zgodnie z harmonogramem.</p>'
      }

      <p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/panel" class="button">Przejdź do panelu</a>
      </p>

      <p>Cieszymy się, że wracasz!</p>

      <p>Pozdrawiamy,<br>Zespół Smakowało</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Smakowało. Wszystkie prawa zastrzeżone.</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return sendEmailDirect({ to: email, subject, text, html })
}

/**
 * Send subscription canceled notification
 */
export async function sendSubscriptionCanceledEmail(
  email: string,
  data: SubscriptionEmailData
): Promise<boolean> {
  const { userName, planName } = data

  const subject = 'Subskrypcja Smakowało została anulowana'

  const text = `
Witaj ${userName},

Twoja subskrypcja "${planName}" została anulowana.

Przykro nam, że odchodzisz. Jeśli masz uwagi lub sugestie, podziel się nimi z nami: kontakt@smakowalo.pl

Zawsze możesz wrócić i stworzyć nową subskrypcję w kreatorze.

yczymy smacznego!
Zespół Smakowało
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 12px 24px; background: #4A7C59; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Subskrypcja anulowana</h1>
    </div>
    <div class="content">
      <p>Witaj ${userName},</p>

      <p>Twoja subskrypcja <strong>"${planName}"</strong> została anulowana.</p>

      <p>Przykro nam, że odchodzisz. Jeśli masz uwagi lub sugestie, podziel się nimi z nami: <a href="mailto:kontakt@smakowalo.pl">kontakt@smakowalo.pl</a></p>

      <p>Zawsze możesz wrócić i stworzyć nową subskrypcję:</p>

      <p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/kreator" class="button">Stwórz plan posiłków</a>
      </p>

      <p>Życzymy smacznego!<br>Zespół Smakowało</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Smakowało. Wszystkie prawa zastrzeżone.</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return sendEmailDirect({ to: email, subject, text, html })
}

/**
 * Send account deletion confirmation
 */
export async function sendAccountDeletionEmail(
  email: string,
  userName: string
): Promise<boolean> {
  const subject = 'Potwierdzenie usunięcia konta - Smakowało'

  const text = `
Witaj ${userName},

Potwierdzamy, że Twoje konto w Smakowało zostało trwale usunięte zgodnie z Twoją prośbą.

Wszystkie Twoje dane osobowe zostały usunięte z naszych systemów zgodnie z wymogami RODO.

Jeśli to był błąd lub chcesz wrócić, zawsze możesz utworzyć nowe konto na: ${process.env.NEXT_PUBLIC_SITE_URL}

yczymy wszystkiego dobrego!
Zespół Smakowało
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
    .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Potwierdzenie usunięcia konta</h1>
    </div>
    <div class="content">
      <p>Witaj ${userName},</p>

      <p>Potwierdzamy, że Twoje konto w Smakowało zostało trwale usunięte zgodnie z Twoją prośbą.</p>

      <div class="info">
        <p><strong>Usunięte dane (RODO):</strong></p>
        <ul>
          <li>Dane osobowe (imię, nazwisko, adres)</li>
          <li>Historia zamówień</li>
          <li>Subskrypcje</li>
          <li>Preferencje dietetyczne</li>
          <li>Ulubione przepisy</li>
        </ul>
      </div>

      <p>Jeśli to był błąd lub chcesz wrócić, zawsze możesz utworzyć nowe konto na: <a href="${process.env.NEXT_PUBLIC_SITE_URL}">${process.env.NEXT_PUBLIC_SITE_URL}</a></p>

      <p>Życzymy wszystkiego dobrego!<br>Zespół Smakowało</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Smakowało. Wszystkie prawa zastrzeżone.</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  return sendEmailDirect({ to: email, subject, text, html })
}
