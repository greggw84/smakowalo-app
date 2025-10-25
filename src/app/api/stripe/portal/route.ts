import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerStripe } from '@/lib/stripe'

// Force Node.js runtime (Stripe SDK not compatible with Edge)
export const runtime = 'nodejs'

/**
 * Create Stripe Customer Portal session
 * Allows customers to manage their subscriptions, update payment methods, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing customerId' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const stripe = getServerStripe()

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/panel`,
    })

    console.log('Customer portal session created:', {
      customerId,
      sessionId: portalSession.id,
      url: portalSession.url
    })

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create portal session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
