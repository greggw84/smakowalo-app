/**
 * Consolidated Stripe Webhook Handler
 * ===========================================
 * This is the CANONICAL webhook endpoint for all Stripe events.
 * Webhook URL: https://your-domain.com/api/webhooks/stripe
 * 
 * Handles:
 * - Subscription lifecycle (created, updated, deleted)
 * - Payment events (succeeded, failed)
 * - Order creation from checkout completion
 * - Email notifications
 * - Database synchronization
 */

import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Webhook secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Logging helper
function logWebhook(level: 'info' | 'success' | 'error' | 'warn', message: string, data?: any) {
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️'
  };
  const prefix = emoji[level];
  console.log(`${prefix} [Webhook] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

/**
 * POST handler for Stripe webhook events
 * This must use raw body for signature verification
 */
export async function POST(req: NextRequest) {
  logWebhook('info', 'Webhook received');

  // Verify environment variables
  if (!webhookSecret) {
    logWebhook('error', 'STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    logWebhook('error', 'Supabase not configured');
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  // Get raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    logWebhook('error', 'No Stripe signature in request headers');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logWebhook('success', `Webhook signature verified: ${event.type}`, { id: event.id });
  } catch (err: any) {
    logWebhook('error', 'Webhook signature verification failed', { error: err.message });
    return NextResponse.json({ error: `Webhook verification failed: ${err.message}` }, { status: 400 });
  }

  // Create Supabase client for this request
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Handle the event with comprehensive error handling
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, supabase);
        break;

      default:
        logWebhook('warn', `Unhandled event type: ${event.type}`);
    }

    logWebhook('success', `Event ${event.type} processed successfully`);
    return NextResponse.json({ received: true, processed: event.type });

  } catch (error: any) {
    logWebhook('error', 'Error processing webhook event', {
      type: event.type,
      error: error.message,
      stack: error.stack
    });

    // Return 500 to tell Stripe to retry
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * Creates both subscription and initial order records
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  logWebhook('info', 'Processing checkout.session.completed', { sessionId: session.id });

  // Only process subscription checkouts
  if (session.mode !== 'subscription') {
    logWebhook('info', 'Skipping non-subscription checkout');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.user_id || session.client_reference_id;
  const customerEmail = session.customer_details?.email || session.customer_email;

  if (!subscriptionId) {
    logWebhook('error', 'No subscription ID in checkout session');
    return;
  }

  // Get full subscription details from Stripe
  let subscription: Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
    logWebhook('success', 'Retrieved subscription from Stripe', { subscriptionId });
  } catch (err: any) {
    logWebhook('error', 'Failed to retrieve subscription', { error: err.message });
    throw err;
  }

  // Extract metadata
  const mealPlanConfig = session.metadata?.meal_plan_config
    ? JSON.parse(session.metadata.meal_plan_config)
    : {};
  
  const people = Number.parseInt(session.metadata?.number_of_people || '2');
  const days = Number.parseInt(session.metadata?.number_of_days || '3');
  const deliveryDay = session.metadata?.delivery_day || 'tuesday';
  const planType = session.metadata?.plan_type || 'weekly';

  // Upsert subscription to database (userId or customerId)
  const subscriptionData: any = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: subscription.status,
    plan_type: planType,
    people,
    days,
    delivery_day: deliveryDay,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    meal_plan_config: mealPlanConfig,
    diets: mealPlanConfig.selected_diets || [],
    allergies: mealPlanConfig.selected_allergies || [],
    selected_meals: mealPlanConfig.selected_meals || [],
    delivery_frequency: 'weekly',
    updated_at: new Date().toISOString(),
  };

  // If we have user_id, use it; otherwise try to find user by email
  if (userId) {
    subscriptionData.user_id = userId;
  } else if (customerEmail) {
    // Try to find user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u: any) => u.email === customerEmail);
    
    if (user) {
      subscriptionData.user_id = user.id;
      logWebhook('success', 'Found user by email', { email: customerEmail, userId: user.id });
    } else {
      logWebhook('warn', 'No user found for email, storing with customer_id only', { email: customerEmail });
      // Store without user_id - can be linked later when user signs up
    }
  }

  // Upsert subscription
  const { error: subError, data: subData } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'stripe_subscription_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (subError) {
    logWebhook('error', 'Failed to upsert subscription', { error: subError });
    throw new Error(`Database error: ${subError.message}`);
  }

  logWebhook('success', 'Subscription upserted to database', { id: subData.id });

  // Create initial order for this subscription
  if (subscriptionData.user_id) {
    await createOrderFromCheckout(session, subscription, subscriptionData.user_id, supabase);
  }

  // Send welcome email with subscription details
  if (customerEmail && subscriptionData.user_id) {
    await sendSubscriptionWelcomeEmail(customerEmail, subscriptionData.user_id, {
      planDetails: `${people} ${people === 1 ? 'osoba' : people < 5 ? 'osoby' : 'osób'}, ${days} ${days === 1 ? 'dzień' : 'dni'} w tygodniu`,
      deliveryDay: deliveryDay === 'tuesday' ? 'Wtorek' : 'Czwartek',
      weeklyPrice: subscription.items.data[0]?.price?.unit_amount 
        ? `${(subscription.items.data[0].price.unit_amount / 100).toFixed(2)} PLN`
        : 'N/A',
      trialDays: subscription.trial_end ? 7 : undefined,
    }, supabase);
  }
}

/**
 * Helper: Calculate next delivery date based on delivery day preference
 */
function calculateDeliveryDate(deliveryDay: string): Date {
  const today = new Date();
  // Tuesday = 2, Thursday = 4
  const targetDay = deliveryDay.toLowerCase() === 'tuesday' ? 2 : 4;
  const currentDay = today.getDay();
  
  // Calculate days until next delivery day
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) {
    daysUntil += 7; // Move to next week if day has passed
  }
  
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + daysUntil);
  return deliveryDate;
}

/**
 * Helper: Create order from checkout session
 */
async function createOrderFromCheckout(
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription,
  userId: string,
  supabase: any
) {
  try {
    logWebhook('info', 'Creating order from checkout', { sessionId: session.id });

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
    const people = Number.parseInt(session.metadata?.number_of_people || '2');
    const days = Number.parseInt(session.metadata?.number_of_days || '3');
    const deliveryDay = session.metadata?.delivery_day || 'tuesday';

    // Calculate delivery date using helper function
    const deliveryDate = calculateDeliveryDate(deliveryDay);

    // Create order
    const { error: orderError, data: orderData } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        subtotal: totalAmount,
        total_amount: totalAmount,
        currency: 'PLN',
        status: 'confirmed',
        payment_status: 'succeeded',
        delivery_date: deliveryDate.toISOString().split('T')[0],
        order_items: JSON.stringify([{
          type: 'subscription',
          plan: session.metadata?.plan_type || 'weekly',
          people,
          days,
          meals: session.metadata?.selected_meals ? JSON.parse(session.metadata.selected_meals) : [],
        }]),
        stripe_payment_intent_id: session.payment_intent as string,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      logWebhook('error', 'Failed to create order', { error: orderError });
    } else {
      logWebhook('success', 'Order created', { orderNumber: orderData.order_number });
    }
  } catch (err: any) {
    logWebhook('error', 'Error creating order', { error: err.message });
    // Don't throw - order creation failure shouldn't fail the webhook
  }
}

/**
 * Helper: Send subscription welcome email
 */
async function sendSubscriptionWelcomeEmail(
  email: string,
  userId: string,
  details: {
    planDetails: string;
    deliveryDay: string;
    weeklyPrice: string;
    trialDays?: number;
  },
  supabase: any
) {
  try {
    // Get user details
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    if (!user) {
      logWebhook('warn', 'User not found for welcome email', { userId });
      return;
    }

    const name = user.user_metadata?.full_name || email.split('@')[0];

    // Calculate first delivery date using helper function
    const deliveryDayEn = details.deliveryDay.toLowerCase() === 'wtorek' ? 'tuesday' : 'thursday';
    const firstDeliveryDate = calculateDeliveryDate(deliveryDayEn);

    const emailSent = await sendEmail({
      to: email,
      ...emailTemplates.subscriptionCreated({
        name,
        planDetails: details.planDetails,
        deliveryDay: details.deliveryDay,
        firstDeliveryDate: firstDeliveryDate.toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        weeklyPrice: details.weeklyPrice,
        trialDays: details.trialDays,
        manageUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`
      })
    });

    if (emailSent) {
      logWebhook('success', 'Welcome email sent', { email });
    } else {
      logWebhook('warn', 'Failed to send welcome email', { email });
    }
  } catch (err: any) {
    logWebhook('error', 'Error sending welcome email', { error: err.message });
    // Don't throw - email failure shouldn't fail the webhook
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  logWebhook('info', 'Processing customer.subscription.created', { subscriptionId: subscription.id });

  // This event usually fires after checkout.session.completed
  // We may have already created the subscription, so just update it
  const customerId = subscription.customer as string;
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    logWebhook('warn', 'No user_id in subscription metadata, attempting email lookup');
    
    // Try to find user by customer email
    const customer = await stripe.customers.retrieve(customerId);
    const email = (customer as Stripe.Customer).email;
    
    if (email) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find((u: any) => u.email === email);
      
      if (user) {
        // Update subscription metadata with user_id
        await stripe.subscriptions.update(subscription.id, {
          metadata: { ...subscription.metadata, user_id: user.id }
        });
        logWebhook('success', 'Added user_id to subscription metadata', { userId: user.id });
      }
    }
    return;
  }

  // Upsert subscription
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
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
      ignoreDuplicates: false,
    });

  if (error) {
    logWebhook('error', 'Failed to upsert subscription', { error });
    throw new Error(`Database error: ${error.message}`);
  }

  logWebhook('success', 'Subscription created/updated in database');
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  logWebhook('info', 'Processing customer.subscription.updated', { subscriptionId: subscription.id });

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    logWebhook('warn', 'No user_id in subscription metadata');
    return;
  }

  // Get current subscription from DB to detect changes
  const { data: currentSub } = await supabase
    .from('subscriptions')
    .select('status, cancel_at_period_end')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  // Update subscription in database
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logWebhook('error', 'Failed to update subscription', { error });
    throw new Error(`Database error: ${error.message}`);
  }

  logWebhook('success', 'Subscription updated in database');

  // Send notification emails for status changes (non-blocking)
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const email = (customer as Stripe.Customer).email;

    if (currentSub && email) {
      // Cancelled (will end at period end)
      if (subscription.cancel_at_period_end && !currentSub.cancel_at_period_end) {
        await sendEmail({
          to: email,
          subject: 'Subskrypcja anulowana - Smakowało',
          html: `<p>Twoja subskrypcja zostanie zakończona ${new Date(subscription.current_period_end * 1000).toLocaleDateString('pl-PL')}.</p>`
        });
        logWebhook('success', 'Cancellation email sent', { email });
      }
    }
  } catch (emailErr: any) {
    logWebhook('warn', 'Failed to send notification email', { error: emailErr.message });
  }
}

/**
 * Handle customer.subscription.deleted event
 * Marks subscription as canceled when it's completely deleted from Stripe
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  logWebhook('info', 'Processing customer.subscription.deleted', { subscriptionId: subscription.id });

  // Update subscription status to 'canceled'
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logWebhook('error', 'Failed to mark subscription as deleted', { error });
    throw new Error(`Database error: ${error.message}`);
  }

  logWebhook('success', 'Subscription marked as canceled in database');
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  logWebhook('info', 'Processing invoice.payment_succeeded', { invoiceId: invoice.id });

  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    logWebhook('info', 'Invoice not related to subscription, skipping');
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
    logWebhook('error', 'Failed to update payment status', { error });
  } else {
    logWebhook('success', 'Payment status updated');
  }

  // Send payment confirmation email (non-blocking)
  if (invoice.customer_email) {
    try {
      // Get subscription details for better email content
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('people, days')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      const planDetails = subData
        ? `${subData.people} ${subData.people === 1 ? 'osoba' : subData.people < 5 ? 'osoby' : 'osób'}, ${subData.days} ${subData.days === 1 ? 'dzień' : 'dni'} w tygodniu`
        : 'Subskrypcja Smakowało';

      // Get subscription to find next payment date
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      await sendEmail({
        to: invoice.customer_email,
        ...emailTemplates.paymentSucceeded({
          name: invoice.customer_name || invoice.customer_email.split('@')[0],
          amount: `${(invoice.amount_paid / 100).toFixed(2)} PLN`,
          invoiceUrl: invoice.hosted_invoice_url || `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
          nextPaymentDate: new Date(subscription.current_period_end * 1000).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          planDetails
        })
      });

      logWebhook('success', 'Payment confirmation email sent', { email: invoice.customer_email });
    } catch (emailErr: any) {
      logWebhook('warn', 'Failed to send payment confirmation email', { error: emailErr.message });
    }
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  logWebhook('info', 'Processing invoice.payment_failed', { invoiceId: invoice.id });

  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    logWebhook('info', 'Invoice not related to subscription, skipping');
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
    logWebhook('error', 'Failed to update payment status', { error });
  } else {
    logWebhook('success', 'Payment failure status updated');
  }

  // Send payment failure notification (non-blocking)
  if (invoice.customer_email) {
    try {
      // Get subscription details
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('people, days, stripe_customer_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      const planDetails = subData
        ? `${subData.people} ${subData.people === 1 ? 'osoba' : subData.people < 5 ? 'osoby' : 'osób'}, ${subData.days} ${subData.days === 1 ? 'dzień' : 'dni'} w tygodniu`
        : 'Subskrypcja Smakowało';

      // Get subscription to find customer
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Create Stripe Customer Portal session for updating payment method
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subData?.stripe_customer_id || subscription.customer as string,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
      });

      const retryDate = new Date();
      retryDate.setDate(retryDate.getDate() + 3);

      await sendEmail({
        to: invoice.customer_email,
        ...emailTemplates.paymentFailed({
          name: invoice.customer_name || invoice.customer_email.split('@')[0],
          amount: `${(invoice.amount_due / 100).toFixed(2)} PLN`,
          retryDate: retryDate.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          updatePaymentUrl: portalSession.url,
          planDetails
        })
      });

      logWebhook('success', 'Payment failure email sent', { email: invoice.customer_email });
    } catch (emailErr: any) {
      logWebhook('warn', 'Failed to send payment failure email', { error: emailErr.message });
    }
  }
}

/**
 * Handle customer.subscription.trial_will_end event
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription, supabase: any) {
  logWebhook('info', 'Processing trial_will_end', { subscriptionId: subscription.id });

  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const email = (customer as Stripe.Customer).email;

    if (email && subscription.trial_end) {
      await sendEmail({
        to: email,
        subject: 'Twój okres próbny kończy się wkrótce - Smakowało',
        html: `
          <h2>Twój okres próbny kończy się wkrótce</h2>
          <p>Twój bezpłatny okres próbny zakończy się: <strong>${new Date(subscription.trial_end * 1000).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</strong></p>
          <p>Po zakończeniu okresu próbnego Twoja subskrypcja będzie kontynuowana, a pierwsza płatność zostanie pobrana automatycznie.</p>
          <p>Jeśli chcesz anulować subskrypcję przed zakończeniem okresu próbnego, możesz to zrobić w <a href="${process.env.NEXT_PUBLIC_SITE_URL}/panel">panelu użytkownika</a>.</p>
          <p>Zespół Smakowało</p>
        `
      });

      logWebhook('success', 'Trial ending notification sent', { email });
    }
  } catch (err: any) {
    logWebhook('warn', 'Failed to send trial ending notification', { error: err.message });
  }
}
