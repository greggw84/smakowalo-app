/**
 * Stripe Webhook Handler
 * Processes Stripe events and syncs with Supabase
 * UPDATED: 2025-11-20 21:40 - Force redeploy to fix webhook redirect issue
 */
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email-notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ No Stripe signature found');
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Webhook verified:', event.type);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Error handling webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Handler: Checkout Session Completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🛒 Checkout session completed:', session.id);

  // Only process subscription checkouts
  if (session.mode !== 'subscription') {
    console.log('ℹ️ Not a subscription checkout, skipping');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    console.error('❌ No subscription ID in checkout session');
    return;
  }

  console.log('✅ Subscription checkout completed:', {
    customer: customerId,
    subscription: subscriptionId,
  });

  // The actual subscription data will be handled by customer.subscription.created event
  // This just logs the successful checkout
}

// Handler: Subscription Created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📦 Subscription created:', subscription.id);

  const customerId = subscription.customer as string;
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error('❌ No user_id in subscription metadata');
    return;
  }

  // Get customer email
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as Stripe.Customer).email;

  // Insert or update subscription in Supabase
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: subscription.status,
      plan_type: subscription.metadata?.plan_type || 'weekly',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id'
    });

  if (error) {
    console.error('❌ Error upserting subscription:', error);
    throw error;
  }

  // Send welcome email
  if (email) {
    await sendEmail({
      to: email,
      subject: 'Witaj w Smakowało! 🎉',
      template: 'subscription_created',
      data: {
        planType: subscription.metadata?.plan_type || 'weekly',
        nextDelivery: new Date(subscription.current_period_end * 1000).toLocaleDateString('pl-PL'),
      },
    });
  }

  console.log('✅ Subscription created and synced');
}

// Handler: Subscription Updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('❌ No user_id in subscription metadata');
    return;
  }

  // Get current subscription from DB to detect changes
  const { data: currentSub } = await supabase
    .from('subscriptions')
    .select('status, cancel_at_period_end')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  // Update subscription in Supabase
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('❌ Error updating subscription:', error);
    throw error;
  }

  // Get customer email for notifications
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const email = (customer as Stripe.Customer).email;

  // Detect status changes and send appropriate emails
  if (currentSub && email) {
    // Paused (pause_collection started)
    if (subscription.pause_collection && !currentSub.cancel_at_period_end) {
      await sendEmail({
        to: email,
        subject: 'Subskrypcja wstrzymana',
        template: 'subscription_paused',
        data: {
          resumeDate: subscription.pause_collection.resumes_at
            ? new Date(subscription.pause_collection.resumes_at * 1000).toLocaleDateString('pl-PL')
            : 'nieokreślona',
        },
      });
    }

    // Resumed (pause_collection removed)
    if (!subscription.pause_collection && currentSub.status === 'paused') {
      await sendEmail({
        to: email,
        subject: 'Subskrypcja wznowiona',
        template: 'subscription_resumed',
        data: {
          nextDelivery: new Date(subscription.current_period_end * 1000).toLocaleDateString('pl-PL'),
        },
      });
    }

    // Cancelled (will end at period end)
    if (subscription.cancel_at_period_end && !currentSub.cancel_at_period_end) {
      await sendEmail({
        to: email,
        subject: 'Subskrypcja anulowana',
        template: 'subscription_cancelled',
        data: {
          endDate: new Date(subscription.current_period_end * 1000).toLocaleDateString('pl-PL'),
        },
      });
    }
  }

  console.log('✅ Subscription updated and synced');
}

// Handler: Subscription Deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🗑️ Subscription deleted:', subscription.id);

  // Update subscription status to 'canceled' in Supabase
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('❌ Error deleting subscription:', error);
    throw error;
  }

  console.log('✅ Subscription deleted and synced');
}

// Handler: Invoice Payment Succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Invoice payment succeeded:', invoice.id);

  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log('ℹ️ Invoice not related to subscription');
    return;
  }

  // Update subscription payment status
  const { error } = await supabase
    .from('subscriptions')
    .update({
      last_payment_status: 'succeeded',
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('❌ Error updating payment status:', error);
  }

  // Send payment confirmation email
  if (invoice.customer_email) {
    await sendEmail({
      to: invoice.customer_email,
      subject: 'Płatność potwierdzona',
      template: 'payment_succeeded',
      data: {
        amount: (invoice.amount_paid / 100).toFixed(2),
        currency: invoice.currency.toUpperCase(),
        invoiceUrl: invoice.hosted_invoice_url || '',
      },
    });
  }

  console.log('✅ Invoice payment processed');
}

// Handler: Invoice Payment Failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);

  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log('ℹ️ Invoice not related to subscription');
    return;
  }

  // Update subscription payment status
  const { error } = await supabase
    .from('subscriptions')
    .update({
      last_payment_status: 'failed',
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('❌ Error updating payment status:', error);
  }

  // Send payment failure email
  if (invoice.customer_email) {
    await sendEmail({
      to: invoice.customer_email,
      subject: 'Płatność nie powiodła się',
      template: 'payment_failed',
      data: {
        amount: (invoice.amount_due / 100).toFixed(2),
        currency: invoice.currency.toUpperCase(),
        retryDate: invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('pl-PL')
          : 'wkrótce',
      },
    });
  }

  console.log('✅ Invoice payment failure processed');
}

// Handler: Trial Will End
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('⏰ Trial will end:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const email = (customer as Stripe.Customer).email;

  if (email) {
    await sendEmail({
      to: email,
      subject: 'Twój okres próbny kończy się wkrótce',
      template: 'trial_ending',
      data: {
        endDate: new Date(subscription.trial_end! * 1000).toLocaleDateString('pl-PL'),
      },
    });
  }

  console.log('✅ Trial ending notification sent');
}
