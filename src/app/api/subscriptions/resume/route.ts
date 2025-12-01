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
    const { subscription_id, stripe_subscription_id } = await req.json()

    console.log('▶️ Resuming subscription:', {
      subscription_id,
      stripe_subscription_id
    })

    // 1. Resume Stripe subscription
    if (stripe_subscription_id) {
      try {
        const stripe = getStripe()
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
    const { error: dbError } = await getSupabase()
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
