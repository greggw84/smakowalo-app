import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

const STRIPE_PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic_placeholder',
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_placeholder'
}

// POST /api/stripe/subscribe - Create Stripe Checkout session for subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Supabase user ID
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let userId: string | null = null

    if (supabaseUrl && supabaseServiceKey) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Look up user by email
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users?.find((u: any) => u.email === session.user.email)
      
      if (user) {
        userId = user.id
      }
    }

    const body = await request.json()
    const {
      plan, // 'basic' or 'premium'
      price,
      meals_per_week,
      selectedMeals,
      dietPreferences,
      allergyPreferences,
      numberOfPeople
    } = body

    if (!plan || !['basic', 'premium'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get Stripe price ID for the plan
    const priceId = STRIPE_PRICE_IDS[plan as 'basic' | 'premium']

    // Prepare metadata
    const metadata = {
      plan,
      meals_per_week: meals_per_week.toString(),
      numberOfPeople: numberOfPeople.toString(),
      selectedMeals: JSON.stringify(selectedMeals),
      dietPreferences: JSON.stringify(dietPreferences),
      allergyPreferences: JSON.stringify(allergyPreferences),
      user_email: session.user.email,
      ...(userId && { user_id: userId }), // Include user_id if found
    }

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      mode: 'subscription',
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
      subscription_data: {
        metadata,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/panel?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/kreator?subscription=cancelled`,
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Stripe Checkout session created:', checkoutSession.id, { userId })
    }

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    })

  } catch (error) {
    console.error('❌ Stripe subscription error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: `Stripe error: ${error.message}`
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to create subscription'
    }, { status: 500 })
  }
}
