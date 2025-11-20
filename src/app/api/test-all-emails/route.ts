import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-notifications'

/**
 * Test endpoint to send all 7 email templates
 * GET /api/test-all-emails?to=email@example.com
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const toEmail = searchParams.get('to')

  if (!toEmail) {
    return NextResponse.json(
      { error: 'Missing "to" parameter. Usage: /api/test-all-emails?to=email@example.com' },
      { status: 400 }
    )
  }

  console.log('📧 Testing ALL email templates to:', toEmail)

  const results = []

  // Helper function to add delay between emails (avoid SMTP rate limiting)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Template 1: Subscription Created
  try {
    await sendEmail({
      to: toEmail,
      subject: 'Witaj w Smakowało! 🎉',
      template: 'subscription_created',
      data: {
        planType: 'Tygodniowy (5 posiłków)',
        nextDelivery: '25 stycznia 2025',
      },
    })
    results.push({ template: 'subscription_created', status: 'sent' })
    console.log('✅ 1/7 subscription_created')
  } catch (e: any) {
    results.push({ template: 'subscription_created', status: 'failed', error: e.message })
  }

  await delay(500) // 500ms delay to avoid rate limiting

  // Template 2: Subscription Paused
  try {
    await sendEmail({
      to: toEmail,
      subject: 'Subskrypcja wstrzymana',
      template: 'subscription_paused',
      data: {
        resumeDate: '1 lutego 2025',
      },
    })
    results.push({ template: 'subscription_paused', status: 'sent' })
    console.log('✅ 2/7 subscription_paused')
  } catch (e: any) {
    results.push({ template: 'subscription_paused', status: 'failed', error: e.message })
  }

  // Template 3: Subscription Resumed
  try {
    await sendEmail({
      to: toEmail,
      subject: 'Subskrypcja wznowiona! 🎉',
      template: 'subscription_resumed',
      data: {
        nextDelivery: '8 lutego 2025',
      },
    })
    results.push({ template: 'subscription_resumed', status: 'sent' })
    console.log('✅ 3/7 subscription_resumed')
  } catch (e: any) {
    results.push({ template: 'subscription_resumed', status: 'failed', error: e.message })
  }

  // Template 4: Subscription Cancelled
  try {
    await sendEmail({
      to: toEmail,
      subject: 'Subskrypcja anulowana',
      template: 'subscription_cancelled',
      data: {
        endDate: '31 stycznia 2025',
      },
    })
    results.push({ template: 'subscription_cancelled', status: 'sent' })
    console.log('✅ 4/7 subscription_cancelled')
  } catch (e: any) {
    results.push({ template: 'subscription_cancelled', status: 'failed', error: e.message })
  }

  // Template 5: Payment Succeeded
  try {
    await sendEmail({
      to: toEmail,
      subject: 'Płatność potwierdzona ✅',
      template: 'payment_succeeded',
      data: {
        amount: '149.99',
        currency: 'PLN',
        invoiceUrl: 'https://stripe.com/invoice/test123',
      },
    })
    results.push({ template: 'payment_succeeded', status: 'sent' })
    console.log('✅ 5/7 payment_succeeded')
  } catch (e: any) {
    results.push({ template: 'payment_succeeded', status: 'failed', error: e.message })
  }

  // Template 6: Payment Failed
  try {
    await sendEmail({
      to: toEmail,
      subject: 'Płatność nie powiodła się ❌',
      template: 'payment_failed',
      data: {
        amount: '149.99',
        currency: 'PLN',
        retryDate: '22 stycznia 2025',
      },
    })
    results.push({ template: 'payment_failed', status: 'sent' })
    console.log('✅ 6/7 payment_failed')
  } catch (e: any) {
    results.push({ template: 'payment_failed', status: 'failed', error: e.message })
  }

  // Template 7: Trial Ending
  try {
    await sendEmail({
      to: toEmail,
      subject: 'Okres próbny kończy się wkrótce ⏰',
      template: 'trial_ending',
      data: {
        endDate: '20 stycznia 2025',
      },
    })
    results.push({ template: 'trial_ending', status: 'sent' })
    console.log('✅ 7/7 trial_ending')
  } catch (e: any) {
    results.push({ template: 'trial_ending', status: 'failed', error: e.message })
  }

  const sentCount = results.filter(r => r.status === 'sent').length
  const failedCount = results.filter(r => r.status === 'failed').length

  console.log(`📊 Summary: ${sentCount} sent, ${failedCount} failed`)

  return NextResponse.json({
    success: failedCount === 0,
    message: `Wysłano ${sentCount}/7 email templates na: ${toEmail}`,
    results,
    summary: {
      total: 7,
      sent: sentCount,
      failed: failedCount,
    },
  })
}
