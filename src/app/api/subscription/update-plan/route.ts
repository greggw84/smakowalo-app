import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

/**
 * POST /api/subscription/update-plan
 * Update Stripe subscription to new price (change people/days)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      stripe_subscription_id,
      new_price_id,
      people,
      days
    } = body

    if (!stripe_subscription_id || !new_price_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(stripe_subscription_id)

    // Update subscription to new price
    const updatedSubscription = await stripe.subscriptions.update(
      stripe_subscription_id,
      {
        items: [{
          id: subscription.items.data[0].id,
          price: new_price_id,
        }],
        proration_behavior: 'always_invoice', // Prorate the difference
        metadata: {
          ...subscription.metadata,
          number_of_people: String(people),
          number_of_days: String(days),
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Subscription plan updated successfully',
      subscription: {
        id: updatedSubscription.id,
        current_period_end: updatedSubscription.current_period_end
      }
    })

  } catch (error: any) {
    console.error('❌ Error updating subscription plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update plan' },
      { status: 500 }
    )
  }
}
