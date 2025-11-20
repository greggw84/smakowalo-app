// Email utilities for different email services

interface EmailData {
  to: string | string[]
  from?: string
  subject: string
  html?: string
  text?: string
  templateId?: string
  dynamicTemplateData?: Record<string, unknown>
}

interface EmailService {
  sendEmail: (data: EmailData) => Promise<boolean>
}

// SendGrid Email Service
class SendGridService implements EmailService {
  private apiKey: string
  private fromEmail: string

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey
    this.fromEmail = fromEmail
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: Array.isArray(emailData.to)
              ? emailData.to.map(email => ({ email }))
              : [{ email: emailData.to }],
            dynamic_template_data: emailData.dynamicTemplateData || {}
          }],
          from: { email: emailData.from || this.fromEmail },
          template_id: emailData.templateId,
          content: emailData.templateId ? undefined : [{
            type: 'text/html',
            value: emailData.html || emailData.text || ''
          }],
          subject: emailData.templateId ? undefined : emailData.subject
        })
      })

      return response.ok
    } catch (error) {
      console.error('SendGrid email error:', error)
      return false
    }
  }
}

// Resend Email Service
class ResendService implements EmailService {
  private apiKey: string
  private fromEmail: string

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey
    this.fromEmail = fromEmail
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const fromEmail = emailData.from || this.fromEmail

      console.log('📧 Sending email via Resend:', {
        to: emailData.to,
        from: fromEmail,
        subject: emailData.subject
      })

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Resend API error:', result)
        return false
      }

      console.log('✅ Email sent successfully via Resend:', result)
      return true
    } catch (error) {
      console.error('❌ Resend email error:', error)
      return false
    }
  }
}

// SMTP Email Service (using Nodemailer)
class SMTPService implements EmailService {
  private config: {
    host: string
    port: number
    user: string
    pass: string
    fromEmail: string
    fromName: string
  }

  constructor(config: {
    host: string
    port: number
    user: string
    pass: string
    fromEmail: string
    fromName: string
  }) {
    this.config = config
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const nodemailer = await import('nodemailer')

      console.log('📧 Sending email via SMTP:', {
        to: emailData.to,
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        subject: emailData.subject
      })

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.port === 465, // true for 465, false for other ports
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      })

      // Send email
      const info = await transporter.sendMail({
        from: emailData.from || `${this.config.fromName} <${this.config.fromEmail}>`,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      })

      console.log('✅ Email sent successfully via SMTP:', info.messageId)
      return true
    } catch (error) {
      console.error('❌ SMTP email error:', error)
      return false
    }
  }
}

// Mock Email Service for development
class MockEmailService implements EmailService {
  async sendEmail(emailData: EmailData): Promise<boolean> {
    console.log('📧 Mock Email Service - Email would be sent:')
    console.log('To:', emailData.to)
    console.log('From:', emailData.from)
    console.log('Subject:', emailData.subject)
    console.log('Content:', emailData.html || emailData.text)

    if (emailData.dynamicTemplateData) {
      console.log('Template Data:', emailData.dynamicTemplateData)
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return true
  }
}

// Email service factory
function createEmailService(): EmailService {
  // ONLY USE SMTP (Bluehost) - No SendGrid, No Resend
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFromEmail = process.env.SMTP_FROM_EMAIL
  const smtpFromName = process.env.SMTP_FROM_NAME

  if (smtpHost && smtpPort && smtpUser && smtpPass && smtpFromEmail) {
    console.log('📧 Using SMTP email service (Bluehost)')
    return new SMTPService({
      host: smtpHost,
      port: Number.parseInt(smtpPort),
      user: smtpUser,
      pass: smtpPass,
      fromEmail: smtpFromEmail,
      fromName: smtpFromName || 'Smakowało',
    })
  }

  // Fallback to mock service for development
  console.warn('⚠️ SMTP not configured! Using Mock email service (no emails will be sent)')
  console.warn('⚠️ Please configure SMTP variables in .env.local')
  return new MockEmailService()
}

// Singleton email service instance
const emailService = createEmailService()

// Main email sending function
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    return await emailService.sendEmail(emailData)
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Email templates
export const emailTemplates = {
  // Email verification
  emailVerification: (name: string, verificationUrl: string) => ({
    subject: 'Potwierdź swój adres email - Smakowało',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #74a53d 0%, #34483c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #74a53d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f6f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Witaj w Smakowało!</h1>
          </div>
          <div class="content">
            <p>Cześć ${name},</p>
            <p>Dziękujemy za rejestrację w Smakowało! Aby dokończyć proces rejestracji, potwierdź swój adres email klikając poniższy przycisk:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Potwierdź adres email</a>
            </div>
            <p style="color: #666; font-size: 14px;">Lub skopiuj i wklej ten link w przeglądarce:</p>
            <p style="background: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
            <p><strong>Link jest ważny przez 24 godziny.</strong></p>
            <p>Jeśli nie zakładałeś konta w Smakowało, po prostu zignoruj tę wiadomość.</p>
          </div>
          <div class="footer">
            <p>© 2025 Smakowało Sp. z o.o.<br>
            ul. Ks. Józefa Bryzy 42/2, 62-080 Tarnowo Podgórne</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Welcome email for new users
  welcome: (name: string, loginUrl: string) => ({
    subject: 'Witaj w Smakowało! 🍽️',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #74a53d 0%, #34483c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #74a53d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .feature { background: #f8f6f0; padding: 15px; margin: 10px 0; border-radius: 6px; }
          .footer { background: #f8f6f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Witaj w rodzinie Smakowało!</h1>
          </div>
          <div class="content">
            <p>Cześć ${name}!</p>
            <p>Cieszymy się, że dołączyłeś do rodziny Smakowało! Twoje konto zostało pomyślnie aktywowane.</p>

            <h2 style="color: #74a53d;">Co możesz teraz zrobić?</h2>

            <div class="feature">
              <strong>🍳 Przeglądaj nasze menu</strong><br>
              Odkryj setki smacznych przepisów z 8 różnymi opcjami diet
            </div>

            <div class="feature">
              <strong>📋 Twórz plany posiłków</strong><br>
              Spersonalizuj swoje zestawy według swoich preferencji dietetycznych
            </div>

            <div class="feature">
              <strong>🚚 Zamawiaj dostawy</strong><br>
              Otrzymuj świeże składniki prosto pod drzwi
            </div>

            <div class="feature">
              <strong>❤️ Zapisuj ulubione</strong><br>
              Dodawaj swoje ulubione przepisy do listy
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Zaloguj się i rozpocznij</a>
            </div>

            <p style="margin-top: 30px;">Miłego gotowania!<br><strong>Zespół Smakowało</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Smakowało Sp. z o.o.<br>
            ul. Ks. Józefa Bryzy 42/2, 62-080 Tarnowo Podgórne<br>
            <a href="mailto:pomoc@smakowalo.pl" style="color: #74a53d;">pomoc@smakowalo.pl</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Order confirmation
  orderConfirmation: (orderNumber: string, orderTotal: number, deliveryDate: string) => ({
    subject: `Potwierdzenie zamówienia #${orderNumber}`,
    html: `
      <h1>Dziękujemy za zamówienie!</h1>
      <p>Twoje zamówienie #${orderNumber} zostało przyjęte.</p>
      <p><strong>Wartość zamówienia:</strong> ${orderTotal.toFixed(2)} zł</p>
      <p><strong>Przewidywana dostawa:</strong> ${deliveryDate}</p>
      <p>Śledzenie zamówienia znajdziesz w swoim panelu użytkownika.</p>
      <p>Zespół Smakowało</p>
    `
  }),

  // Newsletter signup confirmation
  newsletterConfirmation: (email: string) => ({
    subject: 'Potwierdzenie subskrypcji newslettera - Smakowało',
    html: `
      <h1>Dziękujemy za zapisanie się!</h1>
      <p>Twój adres email ${email} został dodany do naszego newslettera.</p>
      <p>Będziemy wysyłać Ci najnowsze przepisy, promocje i inspiracje kulinarne.</p>
      <p>Możesz zrezygnować z subskrypcji w każdej chwili klikając link w stopce każdego newslettera.</p>
      <p>Zespół Smakowało</p>
    `
  }),

  // Contact form notification
  contactFormNotification: (name: string, email: string, subject: string, message: string, type: string) => ({
    subject: `[${type.toUpperCase()}] Nowa wiadomość: ${subject}`,
    html: `
      <h2>Nowa wiadomość z formularza kontaktowego</h2>
      <p><strong>Imię i nazwisko:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Typ zapytania:</strong> ${type}</p>
      <p><strong>Temat:</strong> ${subject}</p>
      <p><strong>Wiadomość:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  }),

  // Password reset
  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset hasła - Smakowało',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #74a53d 0%, #34483c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #74a53d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { background: #f8f6f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset hasła</h1>
          </div>
          <div class="content">
            <p>Cześć ${name},</p>
            <p>Otrzymaliśmy prośbę o reset hasła do Twojego konta Smakowało.</p>
            <p>Aby ustawić nowe hasło, kliknij poniższy przycisk:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Zresetuj hasło</a>
            </div>
            <p style="color: #666; font-size: 14px;">Lub skopiuj i wklej ten link w przeglądarce:</p>
            <p style="background: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
            <div class="alert">
              <strong>⚠️ Ważne:</strong> Link jest ważny przez 1 godzinę.
            </div>
            <p>Jeśli nie prosiłeś o reset hasła, możesz bezpiecznie zignorować tę wiadomość. Twoje hasło pozostanie niezmienione.</p>
            <p style="margin-top: 30px;">Pozdrawiamy,<br><strong>Zespół Smakowało</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Smakowało Sp. z o.o.<br>
            ul. Ks. Józefa Bryzy 42/2, 62-080 Tarnowo Podgórne<br>
            <a href="mailto:pomoc@smakowalo.pl" style="color: #74a53d;">pomoc@smakowalo.pl</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Subscription created
  subscriptionCreated: (data: {
    name: string
    planDetails: string
    deliveryDay: string
    firstDeliveryDate: string
    weeklyPrice: string
    trialDays?: number
    manageUrl: string
  }) => ({
    subject: 'Witaj w Smakowało! Twoja subskrypcja została aktywowana 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #74a53d 0%, #34483c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #74a53d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .info-box { background: #f8f6f0; border-left: 4px solid #74a53d; padding: 15px; margin: 20px 0; }
          .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .footer { background: #f8f6f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Witaj w rodzinie Smakowało!</h1>
          </div>
          <div class="content">
            <p>Cześć ${data.name},</p>
            <p>Dziękujemy za dołączenie do Smakowało! Twoja subskrypcja została pomyślnie aktywowana.</p>

            ${data.trialDays ? `
            <div class="success-box">
              <strong>🎁 Gratulacje!</strong> Masz ${data.trialDays} dni darmowego okresu próbnego. Pierwsza płatność zostanie pobrana po zakończeniu okresu próbnego.
            </div>
            ` : ''}

            <div class="info-box">
              <h3 style="margin-top: 0;">📦 Szczegóły Twojej subskrypcji:</h3>
              <ul style="margin: 10px 0;">
                <li><strong>Plan:</strong> ${data.planDetails}</li>
                <li><strong>Dzień dostawy:</strong> ${data.deliveryDay}</li>
                <li><strong>Pierwsza dostawa:</strong> ${data.firstDeliveryDate}</li>
                <li><strong>Cena tygodniowa:</strong> ${data.weeklyPrice}</li>
              </ul>
            </div>

            <h3>Co dalej?</h3>
            <ul>
              <li>✅ Wybierz posiłki na nadchodzący tydzień w panelu klienta</li>
              <li>✅ Dostosuj preferencje dietetyczne w dowolnym momencie</li>
              <li>✅ Wstrzymaj lub zmień plan gdy tylko chcesz</li>
            </ul>

            <div style="text-align: center;">
              <a href="${data.manageUrl}" class="button">Zarządzaj subskrypcją</a>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Masz pytania? Skontaktuj się z nami:<br>
              📧 <a href="mailto:pomoc@smakowalo.pl" style="color: #74a53d;">pomoc@smakowalo.pl</a><br>
              📞 +48 123 456 789
            </p>

            <p style="margin-top: 30px;">Smacznego!<br><strong>Zespół Smakowało</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Smakowało Sp. z o.o.<br>
            ul. Ks. Józefa Bryzy 42/2, 62-080 Tarnowo Podgórne</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Payment succeeded
  paymentSucceeded: (data: {
    name: string
    amount: string
    invoiceUrl: string
    nextPaymentDate: string
    planDetails: string
  }) => ({
    subject: 'Płatność potwierdzona - Smakowało',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #74a53d 0%, #34483c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #74a53d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .info-box { background: #f8f6f0; border-left: 4px solid #74a53d; padding: 15px; margin: 20px 0; }
          .footer { background: #f8f6f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Płatność potwierdzona</h1>
          </div>
          <div class="content">
            <p>Cześć ${data.name},</p>

            <div class="success-box">
              <strong>✅ Płatność została pomyślnie przetworzona!</strong>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0;">💳 Szczegóły płatności:</h3>
              <ul style="margin: 10px 0;">
                <li><strong>Kwota:</strong> ${data.amount}</li>
                <li><strong>Plan:</strong> ${data.planDetails}</li>
                <li><strong>Następna płatność:</strong> ${data.nextPaymentDate}</li>
              </ul>
            </div>

            <p>Twoja subskrypcja jest aktywna i możesz cieszyć się naszymi pysznymi posiłkami!</p>

            <div style="text-align: center;">
              <a href="${data.invoiceUrl}" class="button">Pobierz fakturę</a>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Wszystkie faktury dostępne są w panelu klienta.
            </p>

            <p style="margin-top: 30px;">Smacznego!<br><strong>Zespół Smakowało</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Smakowało Sp. z o.o.<br>
            ul. Ks. Józefa Bryzy 42/2, 62-080 Tarnowo Podgórne</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Payment failed
  paymentFailed: (data: {
    name: string
    amount: string
    retryDate: string
    updatePaymentUrl: string
    planDetails: string
  }) => ({
    subject: '⚠️ Problem z płatnością - Smakowało',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .info-box { background: #f8f6f0; border-left: 4px solid #74a53d; padding: 15px; margin: 20px 0; }
          .footer { background: #f8f6f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Problem z płatnością</h1>
          </div>
          <div class="content">
            <p>Cześć ${data.name},</p>

            <div class="warning-box">
              <strong>⚠️ Nie udało się przetworzyć płatności</strong><br>
              Płatność za Twoją subskrypcję została odrzucona.
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0;">💳 Szczegóły:</h3>
              <ul style="margin: 10px 0;">
                <li><strong>Kwota:</strong> ${data.amount}</li>
                <li><strong>Plan:</strong> ${data.planDetails}</li>
                <li><strong>Ponowna próba:</strong> ${data.retryDate}</li>
              </ul>
            </div>

            <p><strong>Co musisz zrobić?</strong></p>
            <ul>
              <li>Sprawdź, czy karta ma wystarczające środki</li>
              <li>Upewnij się, że dane karty są aktualne</li>
              <li>Zaktualizuj metodę płatności poniżej</li>
            </ul>

            <div style="text-align: center;">
              <a href="${data.updatePaymentUrl}" class="button">Zaktualizuj płatność</a>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Jeśli nie zaktualizujesz metody płatności, Twoja subskrypcja może zostać zawieszona.
            </p>

            <p style="margin-top: 20px;">Potrzebujesz pomocy? Skontaktuj się z nami:<br>
            📧 <a href="mailto:pomoc@smakowalo.pl" style="color: #dc3545;">pomoc@smakowalo.pl</a><br>
            📞 +48 123 456 789</p>

            <p style="margin-top: 30px;">Pozdrawiamy,<br><strong>Zespół Smakowało</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Smakowało Sp. z o.o.<br>
            ul. Ks. Józefa Bryzy 42/2, 62-080 Tarnowo Podgórne</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

// Newsletter service integration
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  // This would integrate with your newsletter service (Mailchimp, ConvertKit, etc.)
  // For now, we'll send a confirmation email

  const confirmationEmail = emailTemplates.newsletterConfirmation(email)

  return await sendEmail({
    to: email,
    ...confirmationEmail
  })
}

// Contact form handler
export async function handleContactForm(
  name: string,
  email: string,
  subject: string,
  message: string,
  type: string
): Promise<boolean> {
  // Send notification to admin
  const adminNotification = emailTemplates.contactFormNotification(name, email, subject, message, type)

  const adminEmail = process.env.ADMIN_EMAIL || 'pomoc@smakowalo.pl'

  const success = await sendEmail({
    to: adminEmail,
    from: 'noreply@smakowalo.pl',
    replyTo: email,
    ...adminNotification
  })

  // Send auto-reply to user
  if (success) {
    await sendEmail({
      to: email,
      subject: 'Potwierdzenie otrzymania wiadomości - Smakowało',
      html: `
        <h2>Dziękujemy za kontakt!</h2>
        <p>Cześć ${name},</p>
        <p>Otrzymaliśmy Twoją wiadomość i odpowiemy tak szybko, jak to możliwe.</p>
        <p><strong>Temat:</strong> ${subject}</p>
        <p>Zespół Smakowało</p>
      `
    })
  }

  return success
}

export default emailService
