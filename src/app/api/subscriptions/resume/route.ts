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
    const { subscription_id, stripe_subscription_id } = await req.json()

    console.log('▶️ Resuming subscription:', {
      subscription_id,
      stripe_subscription_id
    })

    // 1. Resume Stripe subscription
    if (stripe_subscription_id) {
      try {
        // Remove pause from Stripe subscription
        await stripe.subscriptions.update(stripe_subscription_id, {
          pause_collection: null, // Remove pause
        })

        console.log('✅ Stripe subscription resumed:', stripe_subscription_id)
      } catch (stripeError) {
        console.error('❌ Stripe resume error:', stripeError)
        return NextResponse.json(
          { error: 'Failed to resume Stripe subscription' },
          { status: 500 }
        )
      }
    }

    // 2. Update subscription in database
    const { error: dbError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        pause_until: null,
        updated_at: new Date().toISOString()
      })
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
      message: 'Subscription resumed successfully'
    })

  } catch (error) {
    console.error('❌ Resume subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
