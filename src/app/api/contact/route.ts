import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, type } = body

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Wszystkie wymagane pola muszą być wypełnione' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy format adresu email' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Send email via service like SendGrid, AWS SES, or Resend
    // 2. Store the message in a database
    // 3. Send notification to admin
    // 4. Send auto-reply to user

    // Example with a hypothetical email service:
    /*
    await sendEmail({
      to: 'pomoc@smakowalo.pl',
      from: 'noreply@smakowalo.pl',
      replyTo: email,
      subject: `[${type.toUpperCase()}] ${subject}`,
      html: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Imię i nazwisko:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
        <p><strong>Typ zapytania:</strong> ${type}</p>
        <p><strong>Temat:</strong> ${subject}</p>
        <p><strong>Wiadomość:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    })

    // Send auto-reply to user
    await sendEmail({
      to: email,
      from: 'pomoc@smakowalo.pl',
      subject: 'Potwierdzenie otrzymania wiadomości - Smakowało',
      html: `
        <h2>Dziękujemy za kontakt!</h2>
        <p>Cześć ${name},</p>
        <p>Otrzymaliśmy Twoją wiadomość i odpowiemy tak szybko, jak to możliwe.</p>
        <p><strong>Temat:</strong> ${subject}</p>
        <p>Zespół Smakowało</p>
      `
    })
    */

    // For development, just log the message
    console.log('📧 Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      type,
      timestamp: new Date().toISOString()
    })

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json(
      {
        success: true,
        message: 'Wiadomość została wysłana pomyślnie'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)

    return NextResponse.json(
      {
        error: 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Metoda GET nie jest obsługiwana' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Metoda PUT nie jest obsługiwana' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Metoda DELETE nie jest obsługiwana' },
    { status: 405 }
  )
}
