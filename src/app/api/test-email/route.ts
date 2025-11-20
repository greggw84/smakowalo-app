import { NextResponse } from 'next/server'
import { sendEmailDirect } from '@/lib/email-notifications'

/**
 * Test endpoint to verify SMTP email configuration
 * GET /api/test-email?to=email@example.com
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const toEmail = searchParams.get('to')

  if (!toEmail) {
    return NextResponse.json(
      { error: 'Missing "to" parameter. Usage: /api/test-email?to=email@example.com' },
      { status: 400 }
    )
  }

  console.log('📧 Testing SMTP email to:', toEmail)

  const testSubject = '🧪 Test Email z Smakowało'
  const testText = `
Test email wysłany z aplikacji Smakowało.

Jeśli otrzymałeś ten email, oznacza to że konfiguracja SMTP działa poprawnie!

Konfiguracja:
- Host: ${process.env.SMTP_HOST}
- Port: ${process.env.SMTP_PORT}
- User: ${process.env.SMTP_USER}

Zespół Smakowało
  `.trim()

  const testHtml = `
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
    .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #155724; }
    .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #0c5460; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Test Email - Smakowało</h1>
    </div>
    <div class="content">
      <div class="success">
        <p><strong>✅ Sukces!</strong></p>
        <p>Jeśli widzisz ten email, konfiguracja SMTP działa poprawnie.</p>
      </div>

      <p>Email został wysłany z aplikacji Smakowało.</p>

      <div class="info">
        <p><strong>Konfiguracja SMTP:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${process.env.SMTP_PORT}</li>
          <li>User: ${process.env.SMTP_USER}</li>
          <li>From: ${process.env.SMTP_FROM_EMAIL}</li>
        </ul>
      </div>

      <p>Teraz możesz testować webhooks Stripe i powiadomienia subskrypcji!</p>

      <p>Pozdrawiamy,<br>Zespół Smakowało</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Smakowało. Wszystkie prawa zastrzeżone.</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  try {
    const success = await sendEmailDirect({
      to: toEmail,
      subject: testSubject,
      text: testText,
      html: testHtml,
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: `✅ Test email wysłany na: ${toEmail}`,
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          from: process.env.SMTP_FROM_EMAIL,
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Email nie został wysłany. Sprawdź logi serwera.',
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('❌ Test email error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
