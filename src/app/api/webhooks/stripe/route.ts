import { type NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getServerStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { parsePlanKey } from '@/lib/pricing'

// Force Node.js runtime (Stripe SDK not compatible with Edge)
export const runtime = 'nodejs'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * Stripe webhook handler for subscription events
 * Handles: customer.subscription.created, updated, deleted
 * Also handles: checkout.session.completed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const stripe = getServerStripe()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    console.log(`Received webhook event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionCreatedOrUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout.session.completed event
 * This fires when a customer successfully completes checkout
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)

  if (session.mode !== 'subscription') {
    console.log('Ignoring non-subscription checkout')
    return
  }

  // The subscription will be handled by customer.subscription.created event
  // We just log this for tracking
  console.log('Subscription checkout completed for customer:', session.customer)
}

/**
 * Handle customer.subscription.created and customer.subscription.updated events
 * Upserts subscription data to database
 */
async function handleSubscriptionCreatedOrUpdated(subscription: Stripe.Subscription) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping database update')
    return
  }

  const metadata = subscription.metadata || {}
  const planKey = metadata.plan_key || ''
  const people = Number.parseInt(metadata.people || '2', 10)
  const days = Number.parseInt(metadata.days || '3', 10)

  // Parse diets, allergies, and meals from metadata
  let diets: string[] = []
  let allergies: string[] = []
  let selectedMeals: string[] = []

  try {
    if (metadata.diets) diets = JSON.parse(metadata.diets)
    if (metadata.allergies) allergies = JSON.parse(metadata.allergies)
    if (metadata.selected_meals) selectedMeals = JSON.parse(metadata.selected_meals)
  } catch (error) {
    console.error('Error parsing metadata JSON:', error)
  }

  // Get price and product info
  const priceId = subscription.items.data[0]?.price.id
  const productId = subscription.items.data[0]?.price.product as string
  const amount = subscription.items.data[0]?.price.unit_amount || 0
  const currency = subscription.items.data[0]?.price.currency || 'pln'

  // Get customer email
  let customerEmail = ''
  if (typeof subscription.customer === 'string') {
    try {
      const stripe = getServerStripe()
      const customer = await stripe.customers.retrieve(subscription.customer)
      if ('email' in customer && customer.email) {
        customerEmail = customer.email
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
    }
  } else if (subscription.customer?.email) {
    customerEmail = subscription.customer.email
  }

  // Calculate period dates
  const currentPeriodStart = new Date(subscription.current_period_start * 1000)
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

  // Build subscription data
  const subscriptionData = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || '',
    customer_email: customerEmail,
    product_id: productId,
    price_id: priceId,
    status: subscription.status,
    amount: amount / 100, // Convert from cents to PLN
    currency,
    people,
    days,
    plan_key: planKey,
    diets,
    allergies,
    selected_meals: selectedMeals,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: currentPeriodStart.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    updated_at: new Date().toISOString()
  }

  console.log('Upserting subscription to database:', {
    subscription_id: subscription.id,
    customer_email: customerEmail,
    plan_key: planKey,
    status: subscription.status
  })

  // Upsert subscription
  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'stripe_subscription_id'
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }

  console.log('Subscription upserted successfully')
}

/**
 * Handle customer.subscription.deleted event
 * Updates subscription status to canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping database update')
    return
  }

  console.log('Marking subscription as deleted:', subscription.id)

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log('Subscription marked as canceled')
}
