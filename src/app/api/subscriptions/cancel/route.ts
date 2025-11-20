import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

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

    const { error: dbError } = await supabase
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
