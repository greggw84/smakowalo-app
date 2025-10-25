export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerStripe } from '@/lib/stripe'
import { getPriceForPlan, getPlanKey, isValidPlan } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      numberOfPeople,
      numberOfDays,
      selectedDiets,
      selectedAllergies,
      selected_meals,
    } = body

    // Validate required fields
    if (!numberOfPeople || !numberOfDays) {
      return NextResponse.json(
        { error: 'Missing required fields: numberOfPeople and numberOfDays' },
        { status: 400 }
      )
    }

    // Validate plan configuration
    if (!isValidPlan(numberOfPeople, numberOfDays)) {
      return NextResponse.json(
        { error: `Invalid plan configuration: ${numberOfPeople} people, ${numberOfDays} days` },
        { status: 400 }
      )
    }

    // Get Stripe configuration
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripeProductId = process.env.STRIPE_PRODUCT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!stripeSecretKey || !stripeProductId) {
      console.error('Missing Stripe configuration')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    const stripe = getServerStripe()

    // Build plan key and calculate price
    const planKey = getPlanKey(numberOfPeople, numberOfDays)
    const weeklyPriceGrosze = getPriceForPlan(numberOfPeople, numberOfDays)

    console.log('Creating subscription:', {
      customer_email: session.user.email,
      planKey,
      weeklyPriceGrosze,
      numberOfPeople,
      numberOfDays,
    })

    // Safer price resolution with search + verification and list() fallback
    const lookupKey = planKey
    let priceId: string | null = null

    // 1) Prefer prices.search by lookup_key
    try {
      const search = await stripe.prices.search({
        query: `active:'true' AND product:'${stripeProductId}' AND lookup_key:'${lookupKey}'`,
        limit: 1,
      })
      if (search.data.length > 0) {
        const p = search.data[0]
        if (p.unit_amount === weeklyPriceGrosze && p.recurring?.interval === 'week') {
          priceId = p.id
          console.log(`Found matching price via search: ${priceId}`)
        } else {
          console.warn('Price found via search has mismatched amount/interval; will ignore', {
            foundAmount: p.unit_amount,
            expectedAmount: weeklyPriceGrosze,
            interval: p.recurring?.interval,
          })
        }
      }
    } catch (err: any) {
      console.warn('Stripe price search failed; falling back to list():', err?.message || err)
    }

    // 2) Fallback: list active prices for product and verify
    if (!priceId) {
      const list = await stripe.prices.list({ product: stripeProductId, active: true, limit: 100 })
      const candidate = list.data.find(
        (p) => (p.lookup_key === lookupKey || (p.nickname && p.nickname.includes(planKey))) &&
               p.unit_amount === weeklyPriceGrosze &&
               p.recurring?.interval === 'week'
      )
      if (candidate) {
        priceId = candidate.id
        console.log(`Found matching price via list(): ${priceId}`)
      }
    }

    // 3) Create correct price if none matched
    if (!priceId) {
      console.log('Creating new Stripe price with lookup_key', lookupKey)
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: weeklyPriceGrosze,
        currency: 'pln',
        recurring: { interval: 'week', interval_count: 1 },
        lookup_key: lookupKey,
        nickname: `Smakowalo Box ${planKey} (tygodniowo)`,
        metadata: {
          plan_key: planKey,
          people: numberOfPeople.toString(),
          days: numberOfDays.toString(),
        },
      })
      priceId = price.id
      console.log(`Created new price: ${priceId}`)
    }

    // Create Checkout Session in subscription mode
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          plan_key: planKey,
          people: numberOfPeople.toString(),
          days: numberOfDays.toString(),
          diets: selectedDiets ? JSON.stringify(selectedDiets) : '[]',
          allergies: selectedAllergies ? JSON.stringify(selectedAllergies) : '[]',
          selected_meals: selected_meals ? JSON.stringify(selected_meals) : '[]',
        },
      },
      success_url: `${appUrl}/panel?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/kreator?resume=1`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        plan_key: planKey,
        people: numberOfPeople.toString(),
        days: numberOfDays.toString(),
      },
      locale: 'pl',
    })

    console.log('Checkout session created:', checkoutSession.id)

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error.message },
      { status: 500 }
    )
  }
}