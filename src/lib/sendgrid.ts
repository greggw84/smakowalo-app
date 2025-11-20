import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailAddress {
  email: string
  name?: string
}

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smakowało</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #7c9885; padding: 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .footer { background-color: #2d3748; color: white; padding: 20px; text-align: center; }
    .btn { background-color: #7c9885; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
    .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .status-update { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #7c9885; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Smakowało</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Dziękujemy za wybór Smakowało!</p>
      <p>📧 kontakt@smakowalo.pl | 📞 +48 999 999 999</p>
    </div>
  </div>
</body>
</html>
`

export async function sendOrderConfirmation(
  customer: EmailAddress,
  orderId: number,
  orderTotal: number,
  items: OrderItem[],
  deliveryDate?: string
) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email')
    return
  }

  const itemsList = items.map(item =>
    `<li>${item.name} x${item.quantity} - ${item.price.toFixed(2)} zł</li>`
  ).join('')

  const content = `
    <h2>Dziękujemy za zamówienie!</h2>
    <p>Dzień dobry ${customer.name || ''},</p>
    <p>Twoje zamówienie <strong>#${orderId}</strong> zostało pomyślnie złożone i oczekuje na realizację.</p>

    <div class="order-details">
      <h3>Szczegóły zamówienia:</h3>
      <ul>${itemsList}</ul>
      <hr>
      <p><strong>Łączna kwota: ${orderTotal.toFixed(2)} zł</strong></p>
      ${deliveryDate ? `<p><strong>Data dostawy: ${deliveryDate}</strong></p>` : ''}
    </div>

    <p>Twoje świeże składniki zostaną przygotowane przez nasz zespół i dostarczone prosto pod Twoje drzwi.</p>
    <p>O każdej zmianie statusu zamówienia będziemy Cię informować.</p>

    <p>Smacznego gotowania!</p>
    <p>Zespół Smakowało</p>
  `

  const msg = {
    to: customer.email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@smakowalo.pl',
      name: 'Smakowało',
    },
    subject: `Potwierdzenie zamówienia #${orderId}`,
    html: getEmailTemplate(content),
  }

  try {
    await sgMail.send(msg)
    console.log(`Order confirmation email sent to ${customer.email}`)
  } catch (error) {
    console.error('SendGrid order confirmation error:', error)
    throw error
  }
}

export async function sendDeliveryStatusUpdate(
  customer: EmailAddress,
  orderId: number,
  status: string,
  estimatedDelivery?: string
) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email')
    return
  }

  const statusMessages = {
    confirmed: 'Twoje zamówienie zostało potwierdzone i przekazane do realizacji.',
    preparing: 'Nasz zespół przygotowuje Twoje świeże składniki.',
    shipped: 'Twoje zamówienie zostało wysłane i jest w drodze do Ciebie.',
    delivered: 'Twoje zamówienie zostało dostarczone. Smacznego gotowania!',
  }

  const statusMessage = statusMessages[status as keyof typeof statusMessages] || `Status został zaktualizowany na: ${status}`

  const content = `
    <h2>Aktualizacja statusu dostawy</h2>
    <p>Dzień dobry ${customer.name || ''},</p>

    <div class="status-update">
      <h3>Zamówienie #${orderId}</h3>
      <p><strong>${statusMessage}</strong></p>
      ${estimatedDelivery ? `<p>Przewidywana dostawa: <strong>${estimatedDelivery}</strong></p>` : ''}
    </div>

    ${status === 'delivered' ? `
      <p>Mamy nadzieję, że będziesz zadowolony z naszych składników!</p>
      <p>Podziel się swoją opinią lub zdjęciami przygotowanych dań - uwielbiamy widzieć, co tworzysz!</p>
    ` : `
      <p>Śledzimy Twoje zamówienie i będziemy informować o kolejnych etapach realizacji.</p>
    `}

    <p>Dziękujemy za zaufanie!</p>
    <p>Zespół Smakowało</p>
  `

  const msg = {
    to: customer.email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@smakowalo.pl',
      name: 'Smakowało',
    },
    subject: `Aktualizacja dostawy #${orderId}`,
    html: getEmailTemplate(content),
  }

  try {
    await sgMail.send(msg)
    console.log(`Delivery status email sent to ${customer.email}`)
  } catch (error) {
    console.error('SendGrid delivery status error:', error)
    throw error
  }
}

export async function sendSubscriptionStatusUpdate(
  customer: EmailAddress,
  subscriptionId: number,
  action: 'paused' | 'resumed' | 'canceled' | 'modified',
  details?: string
) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email')
    return
  }

  const actionMessages = {
    paused: 'Twoja subskrypcja została wstrzymana zgodnie z Twoją prośbą.',
    resumed: 'Twoja subskrypcja została wznowiona. Kolejna dostawa zostanie zaplanowana.',
    canceled: 'Twoja subskrypcja została anulowana. Dziękujemy za korzystanie z naszych usług.',
    modified: 'Ustawienia Twojej subskrypcji zostały zaktualizowane.',
  }

  const content = `
    <h2>Zmiana statusu subskrypcji</h2>
    <p>Dzień dobry ${customer.name || ''},</p>

    <div class="status-update">
      <h3>Subskrypcja #${subscriptionId}</h3>
      <p><strong>${actionMessages[action]}</strong></p>
      ${details ? `<p>${details}</p>` : ''}
    </div>

    ${action === 'canceled' ? `
      <p>Jeśli w przyszłości zechcesz ponownie korzystać z naszych usług, będziemy czekać z otwartymi ramionami!</p>
    ` : `
      <p>Możesz w każdej chwili zarządzać swoją subskrypcją w panelu klienta na naszej stronie.</p>
    `}

    <p>W razie pytań, jesteśmy do Twojej dyspozycji!</p>
    <p>Zespół Smakowało</p>
  `

  const msg = {
    to: customer.email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@smakowalo.pl',
      name: 'Smakowało',
    },
    subject: `Aktualizacja subskrypcji #${subscriptionId}`,
    html: getEmailTemplate(content),
  }

  try {
    await sgMail.send(msg)
    console.log(`Subscription status email sent to ${customer.email}`)
  } catch (error) {
    console.error('SendGrid subscription status error:', error)
    throw error
  }
}
