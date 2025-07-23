import { type NextRequest, NextResponse } from 'next/server'
import { getServerStripe, createPaymentIntentOptions } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'pln', metadata = {} } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create payment intent
    const stripe = getServerStripe()
    const paymentIntent = await stripe.paymentIntents.create(
      createPaymentIntentOptions(amount, currency, {
        ...metadata,
        integration: 'smakowalo',
      })
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    return NextResponse.json(
      { error: 'Payment intent creation failed' },
      { status: 500 }
    )
  }
}
