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
    const { subscription_id, stripe_subscription_id, pause_until } = await req.json()

    console.log('🔄 Pausing subscription:', {
      subscription_id,
      stripe_subscription_id,
      pause_until
    })

    // 1. Pause Stripe subscription
    if (stripe_subscription_id) {
      try {
        // Pause the Stripe subscription
        const pauseParams: any = {
          pause_collection: {
            behavior: 'void', // Don't charge during pause
          }
        }

        // If pause_until is provided, set resume date
        if (pause_until) {
          const resumeDate = new Date(pause_until)
          pauseParams.pause_collection.resumes_at = Math.floor(resumeDate.getTime() / 1000)
        }

        const stripe = getStripe()
        await stripe.subscriptions.update(stripe_subscription_id, pauseParams)

        console.log('✅ Stripe subscription paused:', stripe_subscription_id)
      } catch (stripeError) {
        console.error('❌ Stripe pause error:', stripeError)
        return NextResponse.json(
          { error: 'Failed to pause Stripe subscription' },
          { status: 500 }
        )
      }
    }

    // 2. Update subscription in database
    const updateData: any = {
      status: 'paused',
      updated_at: new Date().toISOString()
    }

    if (pause_until) {
      updateData.pause_until = pause_until
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

    // 3. Send notification email
    try {
      const { sendSubscriptionPausedEmail } = await import('@/lib/email-notifications')
      
      // Get user email and name from database
      const { data: subscription } = await getSupabase()
        .from('subscriptions')
        .select('user_id')
        .eq('id', subscription_id)
        .single()

      if (subscription?.user_id) {
        const { data: profile } = await getSupabase()
          .from('profiles')
          .select('email, first_name')
          .eq('id', subscription.user_id)
          .single()

        if (profile?.email) {
          await sendSubscriptionPausedEmail(profile.email, {
            userName: profile.first_name || 'Użytkowniku',
            subscriptionId: subscription_id.toString(),
            planName: 'Twoja subskrypcja',
            pauseUntil: pause_until
          })
        }
      }
    } catch (emailError) {
      console.log('⚠️ Email notification failed (non-critical):', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription paused successfully',
      pause_until: pause_until || null
    })

  } catch (error) {
    console.error('❌ Pause subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
