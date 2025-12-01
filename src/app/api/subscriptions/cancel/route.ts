import { type NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null
function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase not configured')
    supabaseInstance = createClient(url, key)
  }
  return supabaseInstance
}

let stripeInstance: Stripe | null = null
function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured')
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    })
  }
  return stripeInstance
}

export async function POST(req: NextRequest) {
  try {
    const { subscription_id, stripe_subscription_id, cancel_immediately } = await req.json()

    console.log('❌ Canceling subscription:', {
      subscription_id,
      stripe_subscription_id,
      cancel_immediately
    })

    // 1. Cancel Stripe subscription
    if (stripe_subscription_id) {
      try {
        const stripe = getStripe()
        if (cancel_immediately) {
          // Cancel immediately
          await stripe.subscriptions.cancel(stripe_subscription_id)
          console.log('✅ Stripe subscription canceled immediately')
        } else {
          // Cancel at period end (let them finish their paid period)
          await stripe.subscriptions.update(stripe_subscription_id, {
            cancel_at_period_end: true
          })
          console.log('✅ Stripe subscription will cancel at period end')
        }
      } catch (stripeError) {
        console.error('❌ Stripe cancel error:', stripeError)
        return NextResponse.json(
          { error: 'Failed to cancel Stripe subscription' },
          { status: 500 }
        )
      }
    }

    // 2. Update subscription in database
    const updateData: any = {
      status: cancel_immediately ? 'canceled' : 'canceling',
      cancel_at_period_end: !cancel_immediately,
      updated_at: new Date().toISOString()
    }

    if (cancel_immediately) {
      updateData.canceled_at = new Date().toISOString()
    }

    const { error: dbError } = await getSupabase()
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscription_id)

    if (dbError) {
      console.error('❌ Database update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update subscription in database' },
        { status: 500 }
      )
    }

    // 3. Send notification email (optional)
    // TODO: Implement email notification
    console.log('📧 Email notification skipped (not implemented)')

    return NextResponse.json({
      success: true,
      message: cancel_immediately
        ? 'Subscription canceled immediately'
        : 'Subscription will cancel at period end'
    })

  } catch (error) {
    console.error('❌ Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
