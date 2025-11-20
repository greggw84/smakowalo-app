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

    // 3. Send notification email
    try {
      const { sendSubscriptionPausedEmail } = await import('@/lib/email-notifications')
      
      // Get user email and name from database
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('id', subscription_id)
        .single()

      if (subscription?.user_id) {
        const { data: profile } = await supabase
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
