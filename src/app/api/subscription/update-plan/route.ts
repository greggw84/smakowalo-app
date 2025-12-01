import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors
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

/**
 * POST /api/subscription/update-plan
 * Update Stripe subscription to new price (change people/days)
 * Also updates metadata for diets and allergies
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      stripe_subscription_id,
      new_price_id,
      people,
      days,
      diets,
      allergies
    } = body

    if (!stripe_subscription_id || !new_price_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current subscription
    const stripe = getStripe()
    const subscription = await stripe.subscriptions.retrieve(stripe_subscription_id)

    // Build metadata update - preserve existing metadata and add new fields
    const updatedMetadata: Record<string, string> = {
      ...subscription.metadata,
      number_of_people: String(people),
      number_of_days: String(days),
    }

    // Add diets and allergies to metadata if provided
    if (diets !== undefined) {
      updatedMetadata.diets = Array.isArray(diets) ? diets.join(',') : ''
    }
    if (allergies !== undefined) {
      updatedMetadata.allergies = Array.isArray(allergies) ? allergies.join(',') : ''
    }

    // Update subscription to new price
    const updatedSubscription = await stripe.subscriptions.update(
      stripe_subscription_id,
      {
        items: [{
          id: subscription.items.data[0].id,
          price: new_price_id,
        }],
        proration_behavior: 'always_invoice', // Prorate the difference
        metadata: updatedMetadata
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Subscription plan updated successfully',
      subscription: {
        id: updatedSubscription.id,
        // Access current_period_end via items if it exists
        current_period_end: (updatedSubscription as { current_period_end?: number }).current_period_end
      }
    })

  } catch (error: unknown) {
    console.error('❌ Error updating subscription plan:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update plan'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
