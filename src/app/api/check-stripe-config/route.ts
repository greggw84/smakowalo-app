import { NextResponse } from 'next/server'

/**
 * Check Stripe Configuration
 * GET /api/check-stripe-config
 * Returns info about configured Stripe price IDs (for debugging)
 */
export async function GET() {
  const priceIds = {
    '2-2': !!process.env.STRIPE_PRICE_2_2,
    '2-3': !!process.env.STRIPE_PRICE_2_3,
    '2-4': !!process.env.STRIPE_PRICE_2_4,
    '2-5': !!process.env.STRIPE_PRICE_2_5,
    '3-2': !!process.env.STRIPE_PRICE_3_2,
    '3-3': !!process.env.STRIPE_PRICE_3_3,
    '3-4': !!process.env.STRIPE_PRICE_3_4,
    '3-5': !!process.env.STRIPE_PRICE_3_5,
    '4-2': !!process.env.STRIPE_PRICE_4_2,
    '4-3': !!process.env.STRIPE_PRICE_4_3,
    '4-4': !!process.env.STRIPE_PRICE_4_4,
    '4-5': !!process.env.STRIPE_PRICE_4_5,
  }

  const missing = Object.entries(priceIds)
    .filter(([_, configured]) => !configured)
    .map(([key]) => key)

  return NextResponse.json({
    configured: priceIds,
    missing,
    total: Object.keys(priceIds).length,
    missingCount: missing.length,
    allConfigured: missing.length === 0,
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
  })
}
