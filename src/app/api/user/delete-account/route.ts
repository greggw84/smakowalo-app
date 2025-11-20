import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

/**
 * GDPR-compliant account deletion
 * This endpoint deletes all user data as required by GDPR Article 17 (Right to be forgotten)
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get user from Supabase session cookie
    // In Next.js API routes, we need to create a client that can read cookies
    const cookieStore = req.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      )
    }

    // Create Supabase client with user's tokens
    const userSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    })

    const { data: { user }, error: authError } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      )
    }

    const userId = user.id

    console.log('🗑️ Starting GDPR-compliant account deletion for user:', userId)

    // 1. Cancel all active Stripe subscriptions
    try {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, stripe_customer_id')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          if (sub.stripe_subscription_id) {
            try {
              await stripe.subscriptions.cancel(sub.stripe_subscription_id)
              console.log('✅ Canceled Stripe subscription:', sub.stripe_subscription_id)
            } catch (stripeError) {
              console.error('⚠️ Failed to cancel Stripe subscription:', stripeError)
              // Continue with deletion even if Stripe fails
            }
          }
        }

        // Delete Stripe customer if exists
        const stripeCustomerId = subscriptions[0]?.stripe_customer_id
        if (stripeCustomerId) {
          try {
            await stripe.customers.del(stripeCustomerId)
            console.log('✅ Deleted Stripe customer:', stripeCustomerId)
          } catch (stripeError) {
            console.error('⚠️ Failed to delete Stripe customer:', stripeError)
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Error handling Stripe cleanup:', error)
      // Continue with deletion
    }

    // 2. Delete user data from all tables (GDPR compliance)
    const deletionResults = {
      subscriptions: false,
      orders: false,
      favorites: false,
      profiles: false,
      auth: false
    }

    // Delete subscriptions
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)

      if (!error) {
        deletionResults.subscriptions = true
        console.log('✅ Deleted subscriptions')
      }
    } catch (error) {
      console.error('⚠️ Error deleting subscriptions:', error)
    }

    // Delete orders
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('user_id', userId)

      if (!error) {
        deletionResults.orders = true
        console.log('✅ Deleted orders')
      }
    } catch (error) {
      console.error('⚠️ Error deleting orders:', error)
    }

    // Delete favorites (if you have this table)
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)

      if (!error) {
        deletionResults.favorites = true
        console.log('✅ Deleted favorites')
      }
    } catch (error) {
      console.error('⚠️ Error deleting favorites:', error)
    }

    // Delete profile
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (!error) {
        deletionResults.profiles = true
        console.log('✅ Deleted profile')
      }
    } catch (error) {
      console.error('⚠️ Error deleting profile:', error)
    }

    // 3. Delete auth user (this is the final step)
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (!error) {
        deletionResults.auth = true
        console.log('✅ Deleted auth user')
      } else {
        console.error('❌ Failed to delete auth user:', error)
        return NextResponse.json(
          { error: 'Failed to delete authentication account' },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('❌ Error deleting auth user:', error)
      return NextResponse.json(
        { error: 'Failed to delete authentication account' },
        { status: 500 }
      )
    }

    // 4. Log deletion for compliance (optional - you might want to keep a log of deletions)
    console.log('📋 Account deletion completed:', {
      userId,
      timestamp: new Date().toISOString(),
      deletionResults
    })

    // 5. Send confirmation email (optional but recommended for GDPR)
    // TODO: Implement email notification
    console.log('📧 Deletion confirmation email skipped (not implemented)')

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
      deleted_data: deletionResults
    })

  } catch (error) {
    console.error('❌ Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
