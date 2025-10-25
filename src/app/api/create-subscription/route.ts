import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPriceForPlan, buildPlanKey } from '@/lib/pricing'

// Ensure Node.js runtime for Stripe SDK compatibility
export const runtime = 'nodejs'

/**
 * POST /api/create-subscription
 * 
 * Creates a Stripe Checkout Session for a subscription plan
 * Validates environment variables and request payload
 * Searches for Stripe Price by lookup_key with fallback to list() + nickname matching
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate required environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripeProductId = process.env.STRIPE_PRODUCT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!stripeSecretKey || stripeSecretKey.trim() === '') {
      console.error('Missing STRIPE_SECRET_KEY environment variable')
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    if (!stripeProductId || stripeProductId.trim() === '') {
      console.error('Missing STRIPE_PRODUCT_ID environment variable')
      return NextResponse.json(
        { error: 'Stripe Product is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    if (!appUrl || appUrl.trim() === '') {
      console.error('Missing NEXT_PUBLIC_APP_URL environment variable')
      return NextResponse.json(
        { error: 'Application URL is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // 2. Parse and validate payload
    const body = await request.json()
    const { customer_email, numberOfPeople, numberOfDays } = body

    if (!customer_email || typeof customer_email !== 'string' || !customer_email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid or missing customer_email' },
        { status: 400 }
      )
    }

    if (![2, 3, 4].includes(numberOfPeople)) {
      return NextResponse.json(
        { error: 'Invalid numberOfPeople. Must be 2, 3, or 4.' },
        { status: 400 }
      )
    }

    if (![2, 3, 4, 5].includes(numberOfDays)) {
      return NextResponse.json(
        { error: 'Invalid numberOfDays. Must be 2, 3, 4, or 5.' },
        { status: 400 }
      )
    }

    // 3. Compute price and build plan key
    const priceInGrosze = getPriceForPlan(numberOfPeople, numberOfDays)
    const planKey = buildPlanKey(numberOfPeople, numberOfDays)

    console.log(`Creating subscription for plan ${planKey}: ${priceInGrosze} groszy`)

    // 4. Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    })

    // 5. Find or create Stripe Price
    let stripePrice: Stripe.Price | null = null

    try {
      // Try searching by lookup_key first
      console.log(`Searching for Price with lookup_key: ${planKey}`)
      const searchResult = await stripe.prices.search({
        query: `lookup_key:'${planKey}' AND active:'true'`,
        limit: 1,
      })

      if (searchResult.data.length > 0) {
        stripePrice = searchResult.data[0]
        console.log(`Found Price via search: ${stripePrice.id}`)
      }
    } catch (searchError: any) {
      console.warn('Price search failed, falling back to list():', searchError.message || searchError)
    }

    // Fallback: list prices and match by nickname
    if (!stripePrice) {
      try {
        console.log(`Listing prices for product ${stripeProductId} to find nickname match`)
        const pricesList = await stripe.prices.list({
          product: stripeProductId,
          active: true,
          limit: 100,
        })

        stripePrice = pricesList.data.find(
          (p) => p.nickname === planKey && p.unit_amount === priceInGrosze && p.currency === 'pln'
        ) || null

        if (stripePrice) {
          console.log(`Found Price via list + nickname match: ${stripePrice.id}`)
        }
      } catch (listError: any) {
        console.error('Price list failed:', listError.raw || listError.message || listError)
        return NextResponse.json(
          { error: 'Failed to retrieve Stripe prices. Please contact support.' },
          { status: 500 }
        )
      }
    }

    // Create price if not found
    if (!stripePrice) {
      try {
        console.log(`Creating new Price for plan ${planKey}`)
        stripePrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: priceInGrosze,
          currency: 'pln',
          recurring: {
            interval: 'week',
          },
          nickname: planKey,
          lookup_key: planKey,
        })
        console.log(`Created new Price: ${stripePrice.id}`)
      } catch (createError: any) {
        console.error('Failed to create Price:', createError.raw || createError.message || createError)
        return NextResponse.json(
          { error: 'Failed to create Stripe price. Please contact support.' },
          { status: 500 }
        )
      }
    }

    // 6. Create Stripe Checkout Session (subscription mode)
    let checkoutSession: Stripe.Checkout.Session
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card', 'p24'],
        line_items: [
          {
            price: stripePrice.id,
            quantity: 1,
          },
        ],
        customer_email: customer_email,
        success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/kreator`,
        metadata: {
          planKey,
          numberOfPeople: String(numberOfPeople),
          numberOfDays: String(numberOfDays),
        },
      })

      console.log(`Created Checkout Session: ${checkoutSession.id}`)
    } catch (sessionError: any) {
      console.error('Failed to create Checkout Session:', sessionError.raw || sessionError.message || sessionError)
      return NextResponse.json(
        { error: 'Failed to create payment session. Please try again.' },
        { status: 500 }
      )
    }

    // 7. Return session URL
    return NextResponse.json({
      url: checkoutSession.url,
    })

  } catch (error: any) {
    console.error('Error in /api/create-subscription:', error.raw || error.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
