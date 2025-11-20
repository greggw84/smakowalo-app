import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailTemplates } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('📨 Stripe webhook event:', event.type)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription, supabase)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice, supabase)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice, supabase)
        break
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('✅ Checkout session completed:', session.id)

  const userId = session.metadata?.user_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('❌ No user_id in session metadata')
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const mealPlanConfig = session.metadata?.meal_plan_config
    ? JSON.parse(session.metadata.meal_plan_config)
    : {}

  // Update subscription in database
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: subscription.status,
      plan_type: session.metadata?.plan_type || 'weekly',
      people: Number.parseInt(session.metadata?.number_of_people || '2'),
      days: Number.parseInt(session.metadata?.number_of_days || '3'),
      delivery_day: session.metadata?.delivery_day || 'tuesday',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      meal_plan_config: mealPlanConfig,
      diets: mealPlanConfig.selected_diets || [],
      allergies: mealPlanConfig.selected_allergies || [],
      selected_meals: mealPlanConfig.selected_meals || [],
      delivery_frequency: 'weekly',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('❌ Error updating subscription:', error)
    return
  }

  console.log('✅ Subscription updated in database')

  // Get user details for email
  const { data: user } = await supabase.auth.admin.getUserById(userId)

  if (!user) {
    console.error('❌ Could not find user for email notification')
    return
  }

  // Calculate delivery dates
  const people = Number.parseInt(session.metadata?.number_of_people || '2')
  const days = Number.parseInt(session.metadata?.number_of_days || '3')
  const deliveryDay = session.metadata?.delivery_day || 'tuesday'
  const deliveryDayName = deliveryDay === 'tuesday' ? 'Wtorek' : 'Czwartek'

  // Calculate first delivery date (next delivery day)
  const today = new Date()
  const daysUntilDelivery = deliveryDay === 'tuesday' ? (9 - today.getDay()) % 7 : (11 - today.getDay()) % 7
  const firstDeliveryDate = new Date(today)
  firstDeliveryDate.setDate(today.getDate() + (daysUntilDelivery === 0 ? 7 : daysUntilDelivery))

  // Get price from subscription
  const pricePerWeek = subscription.items.data[0]?.price?.unit_amount
    ? (subscription.items.data[0].price.unit_amount / 100).toFixed(2)
    : '0.00'

  // Send subscription created email
  const emailSent = await sendEmail({
    to: user.email!,
    ...emailTemplates.subscriptionCreated({
      name: user.user_metadata?.full_name || user.email!.split('@')[0],
      planDetails: `${people} ${people === 1 ? 'osoba' : people < 5 ? 'osoby' : 'osób'}, ${days} ${days === 1 ? 'dzień' : 'dni'} w tygodniu`,
      deliveryDay: deliveryDayName,
      firstDeliveryDate: firstDeliveryDate.toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      weeklyPrice: `${pricePerWeek} PLN`,
      trialDays: subscription.trial_end ? 7 : undefined,
      manageUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`
    })
  })

  if (emailSent) {
    console.log('✅ Subscription created email sent to:', user.email)
  } else {
    console.error('❌ Failed to send subscription created email')
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
  console.log('✅ Subscription updated:', subscription.id)

  const userId = subscription.metadata?.user_id
  const customerId = subscription.customer as string

  if (!userId) {
    console.error('❌ No user_id in subscription metadata')
    return
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('❌ Error updating subscription:', error)
  } else {
    console.log('✅ Subscription status updated in database')
  }
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log('✅ Subscription deleted:', subscription.id)

  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('❌ No user_id in subscription metadata')
    return
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('❌ Error canceling subscription:', error)
  } else {
    console.log('✅ Subscription canceled in database')
  }
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log('✅ Payment succeeded for invoice:', invoice.id)

  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const amount = (invoice.amount_paid / 100).toFixed(2)
  console.log('Payment amount:', amount, 'PLN')

  // Get subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('❌ No user_id in subscription metadata')
    return
  }

  // Get user details
  const { data: user } = await supabase.auth.admin.getUserById(userId)
  if (!user) {
    console.error('❌ Could not find user for email notification')
    return
  }

  // Get subscription details from database
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('people, days')
    .eq('user_id', userId)
    .single()

  const planDetails = subData
    ? `${subData.people} ${subData.people === 1 ? 'osoba' : subData.people < 5 ? 'osoby' : 'osób'}, ${subData.days} ${subData.days === 1 ? 'dzień' : 'dni'} w tygodniu`
    : 'Subskrypcja Smakowało'

  // Calculate next payment date
  const nextPaymentDate = new Date(subscription.current_period_end * 1000)

  // Send payment succeeded email
  const emailSent = await sendEmail({
    to: user.email!,
    ...emailTemplates.paymentSucceeded({
      name: user.user_metadata?.full_name || user.email!.split('@')[0],
      amount: `${amount} PLN`,
      invoiceUrl: invoice.hosted_invoice_url || `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
      nextPaymentDate: nextPaymentDate.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      planDetails
    })
  })

  if (emailSent) {
    console.log('✅ Payment succeeded email sent to:', user.email)
  } else {
    console.error('❌ Failed to send payment succeeded email')
  }
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log('❌ Payment failed for invoice:', invoice.id)

  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const amount = (invoice.amount_due / 100).toFixed(2)
  console.log('Payment attempt failed:', amount, 'PLN')

  // Get subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('❌ No user_id in subscription metadata')
    return
  }

  // Get user details
  const { data: user } = await supabase.auth.admin.getUserById(userId)
  if (!user) {
    console.error('❌ Could not find user for email notification')
    return
  }

  // Get subscription details from database
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('people, days, stripe_customer_id')
    .eq('user_id', userId)
    .single()

  const planDetails = subData
    ? `${subData.people} ${subData.people === 1 ? 'osoba' : subData.people < 5 ? 'osoby' : 'osób'}, ${subData.days} ${subData.days === 1 ? 'dzień' : 'dni'} w tygodniu`
    : 'Subskrypcja Smakowało'

  // Calculate retry date (Stripe usually retries in a few days)
  const retryDate = new Date()
  retryDate.setDate(retryDate.getDate() + 3)

  // Create Stripe Customer Portal session for updating payment method
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subData?.stripe_customer_id || subscription.customer as string,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
  })

  // Send payment failed email
  const emailSent = await sendEmail({
    to: user.email!,
    ...emailTemplates.paymentFailed({
      name: user.user_metadata?.full_name || user.email!.split('@')[0],
      amount: `${amount} PLN`,
      retryDate: retryDate.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      updatePaymentUrl: portalSession.url,
      planDetails
    })
  })

  if (emailSent) {
    console.log('✅ Payment failed email sent to:', user.email)
  } else {
    console.error('❌ Failed to send payment failed email')
  }
}
