import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerStripe } from '@/lib/stripe'

// Initialize Supabase only if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

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
    const { plan_type, price_per_delivery, meal_plan_config } = body

    // Validate required fields
    if (!plan_type || !price_per_delivery) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Stripe subscription (if Stripe is configured)
    let stripeSubscriptionId: string | null = null
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = getServerStripe()
        
        // In a real implementation, you would:
        // 1. Create or retrieve a Stripe customer
        // 2. Create a subscription with the appropriate price
        // 3. Return the checkout session or subscription ID
        
        // For now, we'll just simulate it
        console.log('Would create Stripe subscription for:', {
          customer_email: session.user.email,
          plan_type,
          price: price_per_delivery
        })
        
        // TODO: Uncomment when ready to integrate with Stripe
        // const customer = await stripe.customers.create({
        //   email: session.user.email,
        //   metadata: {
        //     plan_type,
        //   }
        // });
        
        // const subscription = await stripe.subscriptions.create({
        //   customer: customer.id,
        //   items: [{ price: 'price_xxx' }], // Use actual price ID
        //   metadata: {
        //     plan_type,
        //     meal_plan_config: JSON.stringify(meal_plan_config)
        //   }
        // });
        
        // stripeSubscriptionId = subscription.id
      }
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      // Don't fail the whole request if Stripe is not configured
    }

    // Save subscription to database (if Supabase is configured)
    if (supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          customer_email: session.user.email,
          plan_type,
          price_per_delivery,
          meal_plan_config,
          stripe_subscription_id: stripeSubscriptionId,
          status: 'active',
          next_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        subscription: data,
        message: 'Subscription created successfully'
      })
    }

    // If no database, return success with mock data
    return NextResponse.json({
      success: true,
      subscription: {
        id: Date.now(),
        customer_email: session.user.email,
        plan_type,
        price_per_delivery,
        meal_plan_config,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      message: 'Subscription created successfully (mock)',
      source: 'mock'
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
