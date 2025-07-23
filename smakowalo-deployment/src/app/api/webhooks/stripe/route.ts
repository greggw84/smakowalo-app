import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/sendgrid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
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

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);

    // Update payment intent status in database
    await supabase
      .from('payment_intents')
      .update({
        status: 'succeeded',
        stripe_metadata: paymentIntent.metadata
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    // Get payment intent data from database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (paymentError || !paymentData) {
      console.error('Payment intent not found in database:', paymentIntent.id);
      return;
    }

    // Extract metadata
    const metadata = paymentIntent.metadata;
    const customerInfo = {
      email: metadata.customer_email || paymentData.customer_email,
      firstName: metadata.customer_first_name || '',
      lastName: metadata.customer_last_name || '',
      address: metadata.customer_address ? JSON.parse(metadata.customer_address) : null,
    };

    const items = paymentData.items;
    const discountDetails = paymentData.discount_details || [];

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: null, // Will be linked by email
        customer_email: customerInfo.email,
        customer_first_name: customerInfo.firstName,
        customer_last_name: customerInfo.lastName,
        total_amount: paymentData.amount,
        subtotal: paymentData.subtotal,
        discount_amount: paymentData.discount_amount,
        discount_details: discountDetails,
        shipping_address: customerInfo.address ?
          `${customerInfo.address.street}, ${customerInfo.address.city}, ${customerInfo.address.postalCode}, ${customerInfo.address.country}` : '',
        status: 'confirmed',
        payment_intent_id: paymentIntent.id,
        stripe_payment_intent_id: paymentIntent.id,
        is_subscription: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return;
    }

    // Send order confirmation email (do not wait for result)
    const customerEmail: any = customerInfo.email || paymentData.customer_email;
    if (customerEmail) {
      const orderItems = (items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0
      }));

      sendOrderConfirmation(
        {
          email: customerEmail,
          name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim()
        },
        order.id,
        Number(order.total_amount),
        orderItems,
        order.delivery_date
      ).catch(e => console.error('SendGrid order email error', e));
    }

    // Create order items
    if (items && Array.isArray(items)) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        meal_plan_details: {
          selectedMeals: item.selectedMeals,
          dietPreferences: item.dietPreferences,
          numberOfPeople: item.numberOfPeople,
          numberOfDays: item.numberOfDays,
          pricePerPortion: item.pricePerPortion,
          totalPortions: item.totalPortions,
        },
        dietary_preferences: item.dietPreferences || [],
        selected_meals: item.selectedMeals || [],
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }
    }

    // Check if this creates a subscription (for recurring meal plans)
    const hasMealPlan = items.some((item: any) => item.selectedMeals && item.selectedMeals.length > 0);

    if (hasMealPlan && items.length > 0) {
      const mealPlanItem = items.find((item: any) => item.selectedMeals);

      if (mealPlanItem) {
        // Create subscription for meal plans
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: null, // Will be linked by email
            customer_email: customerInfo.email,
            status: 'active',
            plan_type: 'weekly',
            meal_plan_config: {
              selectedMeals: mealPlanItem.selectedMeals,
              dietPreferences: mealPlanItem.dietPreferences,
              numberOfPeople: mealPlanItem.numberOfPeople,
              numberOfDays: mealPlanItem.numberOfDays,
            },
            price_per_delivery: mealPlanItem.price,
            delivery_frequency: 7, // Weekly
            next_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
            created_at: new Date().toISOString(),
          });

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
        }
      }
    }

    // Create audit log entry
    await supabase
      .from('audit_log')
      .insert({
        action: 'payment_succeeded',
        table_name: 'orders',
        record_id: order.id.toString(),
        new_values: { payment_intent_id: paymentIntent.id, status: 'confirmed' },
        created_at: new Date().toISOString(),
      });

    console.log('Order created successfully:', order.id);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);

    // Update payment intent status
    await supabase
      .from('payment_intents')
      .update({
        status: 'failed',
        stripe_metadata: paymentIntent.metadata
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    // Create audit log entry
    await supabase
      .from('audit_log')
      .insert({
        action: 'payment_failed',
        table_name: 'payment_intents',
        record_id: paymentIntent.id,
        new_values: { status: 'failed' },
        created_at: new Date().toISOString(),
      });

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription created:', subscription.id);

    // Update subscription in database
    await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        status: subscription.status === 'active' ? 'active' : 'paused'
      })
      .eq('customer_email', subscription.customer as string);

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription updated:', subscription.id);

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status === 'active' ? 'active' :
                subscription.status === 'canceled' ? 'canceled' : 'paused'
      })
      .eq('stripe_subscription_id', subscription.id);

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription deleted:', subscription.id);

    // Mark subscription as canceled
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment succeeded:', invoice.id);

    // Handle recurring subscription payments
    if (invoice.subscription) {
      // Create new delivery for subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', invoice.subscription as string)
        .single();

      if (subscription) {
        // Create next delivery order
        const { error: deliveryError } = await supabase
          .from('subscription_deliveries')
          .insert({
            subscription_id: subscription.id,
            scheduled_date: new Date(Date.now() + subscription.delivery_frequency * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'scheduled',
            created_at: new Date().toISOString(),
          });

        if (deliveryError) {
          console.error('Error creating subscription delivery:', deliveryError);
        }

        // Update next delivery date
        await supabase
          .from('subscriptions')
          .update({
            next_delivery_date: new Date(Date.now() + subscription.delivery_frequency * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            last_delivery_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', subscription.id);
      }
    }

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}
