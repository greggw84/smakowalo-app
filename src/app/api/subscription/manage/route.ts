import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

/**
 * POST /api/subscription/manage
 * Zarządzanie subskrypcją: pause, resume, cancel
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()

    const { action, subscription_id } = body

    // Verify auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', subscription_id || 0)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'pause':
        return await pauseSubscription(subscription, supabase)

      case 'resume':
        return await resumeSubscription(subscription, supabase)

      case 'cancel':
        return await cancelSubscription(subscription, supabase, stripe)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('❌ Error managing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Pause subscription - skip next week
 */
async function pauseSubscription(subscription: any, supabase: any) {
  try {
    // Calculate pause_until (next week)
    const nextDelivery = subscription.next_delivery_date
      ? new Date(subscription.next_delivery_date)
      : new Date()

    nextDelivery.setDate(nextDelivery.getDate() + 7) // Add 7 days

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'paused',
        pause_until: nextDelivery.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (error) {
      throw new Error('Failed to pause subscription')
    }

    // If Stripe subscription exists, pause it
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        pause_collection: {
          behavior: 'void',
          resumes_at: Math.floor(nextDelivery.getTime() / 1000)
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription paused successfully',
      pause_until: nextDelivery.toISOString().split('T')[0]
    })

  } catch (error: any) {
    console.error('Error pausing subscription:', error)
    throw error
  }
}

/**
 * Resume subscription
 */
async function resumeSubscription(subscription: any, supabase: any) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        pause_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (error) {
      throw new Error('Failed to resume subscription')
    }

    // If Stripe subscription exists, resume it
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        pause_collection: null
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully'
    })

  } catch (error: any) {
    console.error('Error resuming subscription:', error)
    throw error
  }
}

/**
 * Cancel subscription
 */
async function cancelSubscription(subscription: any, supabase: any, stripe: Stripe) {
  try {
    // Update in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (error) {
      throw new Error('Failed to cancel subscription')
    }

    // Cancel in Stripe (at period end)
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period'
    })

  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}
