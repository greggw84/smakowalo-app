/**
 * Admin utility to link orphaned subscriptions to users
 * This endpoint finds subscriptions without user_id and tries to link them by email
 * 
 * POST /api/admin/link-subscriptions
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    // Simple auth check with constant-time comparison
    const authHeader = req.headers.get('authorization')
    const adminKey = process.env.ADMIN_API_KEY
    
    // Ensure both values exist and have same length before comparison
    if (!authHeader || !adminKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const expectedAuth = `Bearer ${adminKey}`
    
    // Constant-time string comparison to prevent timing attacks
    if (authHeader.length !== expectedAuth.length) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    let matches = true
    for (let i = 0; i < authHeader.length; i++) {
      if (authHeader[i] !== expectedAuth[i]) {
        matches = false
      }
    }
    
    if (!matches) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find subscriptions without user_id
    const { data: orphanedSubs, error: findError } = await supabase
      .from('subscriptions')
      .select('id, stripe_customer_id, stripe_subscription_id, customer_email')
      .is('user_id', null)

    if (findError) {
      console.error('Error finding orphaned subscriptions:', findError)
      return NextResponse.json(
        { error: 'Database error', details: findError.message },
        { status: 500 }
      )
    }

    if (!orphanedSubs || orphanedSubs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned subscriptions found',
        linked: 0
      })
    }

    console.log(`Found ${orphanedSubs.length} orphaned subscriptions`)

    // Initialize Stripe (only if needed)
    let stripe: any = null
    const getStripe = async () => {
      if (!stripe) {
        const Stripe = (await import('stripe')).default
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2024-12-18.acacia' as any,
        })
      }
      return stripe
    }

    let linkedCount = 0
    const errors: { subscription_id: number; error: string }[] = []

    // Process each orphaned subscription
    for (const sub of orphanedSubs) {
      try {
        let customerEmail = sub.customer_email

        // If no customer_email in DB, try to get from Stripe
        if (!customerEmail && sub.stripe_customer_id) {
          const stripeClient = await getStripe()
          const customer = await stripeClient.customers.retrieve(sub.stripe_customer_id)
          customerEmail = (customer as { email?: string }).email
          
          // Update the subscription with the customer_email for future use
          if (customerEmail) {
            await supabase
              .from('subscriptions')
              .update({ customer_email: customerEmail })
              .eq('id', sub.id)
          }
        }

        if (!customerEmail) {
          console.log(`Subscription ${sub.id} has no customer email`)
          continue
        }

        // Find user by email
        const { data: users } = await supabase.auth.admin.listUsers()
        const user = users?.users?.find((u: { email?: string }) => u.email === customerEmail)

        if (user) {
          // Link subscription to user
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ user_id: user.id })
            .eq('id', sub.id)

          if (updateError) {
            errors.push({
              subscription_id: sub.id,
              error: updateError.message
            })
          } else {
            linkedCount++
            console.log(`✅ Linked subscription ${sub.id} to user ${user.id}`)
          }
        } else {
          console.log(`No user found for email: ${customerEmail}`)
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        errors.push({
          subscription_id: sub.id,
          error: errorMessage
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${orphanedSubs.length} orphaned subscriptions`,
      linked: linkedCount,
      total: orphanedSubs.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in link-subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
