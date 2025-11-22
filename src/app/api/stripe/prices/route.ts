import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Stripe Price IDs mapping - same as in create-subscription
const PRICE_IDS: Record<string, string> = {
  '2-2': process.env.STRIPE_PRICE_2_2 || 'price_1SVD45ChaDkFJkJI2DkNEpkK',
  '2-3': process.env.STRIPE_PRICE_2_3 || 'price_1SVWHUChaDkFJkJIAEZbXXei',
  '2-4': process.env.STRIPE_PRICE_2_4 || 'price_1SVD45ChaDkFJkJI8OP7MDB3',
  '2-5': process.env.STRIPE_PRICE_2_5 || 'price_1SVD45ChaDkFJkJIzdO9CUAI',
  '3-2': process.env.STRIPE_PRICE_3_2 || 'price_1SVD45ChaDkFJkJIwhAc79kF',
  '3-3': process.env.STRIPE_PRICE_3_3 || 'price_1SVD45ChaDkFJkJIavPtADkM',
  '3-4': process.env.STRIPE_PRICE_3_4 || 'price_1SVD45ChaDkFJkJIQD8WJShG',
  '3-5': process.env.STRIPE_PRICE_3_5 || 'price_1SVD45ChaDkFJkJIdMvMGP4O',
  '4-2': process.env.STRIPE_PRICE_4_2 || 'price_1SVD45ChaDkFJkJIKS1x4fwL',
  '4-3': process.env.STRIPE_PRICE_4_3 || 'price_1SVD45ChaDkFJkJIsmkCYQvL',
  '4-4': process.env.STRIPE_PRICE_4_4 || 'price_1SVD45ChaDkFJkJIgwyRP3da',
  '4-5': process.env.STRIPE_PRICE_4_5 || 'price_1SVD45ChaDkFJkJIH0Rw81fj',
};

/**
 * Get Stripe prices for all subscription plans
 * GET /api/stripe/prices
 */
export async function GET(req: NextRequest) {
  try {
    const prices: Record<string, number> = {}

    // Fetch all prices from Stripe
    for (const [key, priceId] of Object.entries(PRICE_IDS)) {
      try {
        const price = await stripe.prices.retrieve(priceId)
        
        // Stripe stores prices in cents, convert to PLN
        if (price.unit_amount) {
          prices[key] = price.unit_amount / 100
        } else {
          console.warn(`⚠️ Price ${priceId} for ${key} has no unit_amount`)
        }
      } catch (error: any) {
        console.error(`❌ Error fetching price ${priceId} for ${key}:`, error.message)
        // Continue with other prices even if one fails
      }
    }

    console.log('✅ Fetched Stripe prices:', prices)

    return NextResponse.json({
      success: true,
      prices,
    })

  } catch (error: any) {
    console.error('❌ Error fetching Stripe prices:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}
