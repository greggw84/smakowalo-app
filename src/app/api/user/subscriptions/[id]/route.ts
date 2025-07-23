import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { sendSubscriptionStatusUpdate } from '@/lib/sendgrid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubscriptionUpdate {
  action: 'pause' | 'resume' | 'cancel' | 'update_delivery_date' | 'update_meal_plan';
  pause_until?: string;
  next_delivery_date?: string;
  meal_plan_config?: {
    selectedMeals?: string[];
    dietPreferences?: string[];
    numberOfPeople?: number;
    numberOfDays?: number;
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const subscriptionId = Number.parseInt(params.id);
    const updateData: SubscriptionUpdate = await request.json();

    // Get current subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('customer_email', session.user.email)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    let updateFields: any = {};
    let emailAction: 'paused' | 'resumed' | 'canceled' | 'modified' = 'modified';
    let emailDetails = '';

    switch (updateData.action) {
      case 'pause':
        updateFields = {
          status: 'paused',
          pause_until: updateData.pause_until,
          updated_at: new Date().toISOString(),
        };
        emailAction = 'paused';
        emailDetails = updateData.pause_until
          ? `Subskrypcja zostanie automatycznie wznowiona dnia ${updateData.pause_until}`
          : 'Subskrypcja została wstrzymana na czas nieokreślony';
        break;

      case 'resume':
        const nextDelivery = updateData.next_delivery_date ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        updateFields = {
          status: 'active',
          pause_until: null,
          next_delivery_date: nextDelivery,
          updated_at: new Date().toISOString(),
        };
        emailAction = 'resumed';
        emailDetails = `Następna dostawa zaplanowana na ${nextDelivery}`;
        break;

      case 'cancel':
        updateFields = {
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        emailAction = 'canceled';
        break;

      case 'update_delivery_date':
        if (!updateData.next_delivery_date) {
          return NextResponse.json(
            { error: 'Next delivery date is required' },
            { status: 400 }
          );
        }

        updateFields = {
          next_delivery_date: updateData.next_delivery_date,
          updated_at: new Date().toISOString(),
        };
        emailDetails = `Data następnej dostawy została zmieniona na ${updateData.next_delivery_date}`;
        break;

      case 'update_meal_plan':
        if (!updateData.meal_plan_config) {
          return NextResponse.json(
            { error: 'Meal plan configuration is required' },
            { status: 400 }
          );
        }

        // Calculate new price based on updated meal plan
        const numberOfPeople = updateData.meal_plan_config.numberOfPeople || subscription.meal_plan_config?.numberOfPeople || 2;
        const numberOfDays = updateData.meal_plan_config.numberOfDays || subscription.meal_plan_config?.numberOfDays || 3;
        const pricePerPortion = 30; // 30 PLN per portion
        const newPrice = numberOfPeople * numberOfDays * pricePerPortion;

        updateFields = {
          meal_plan_config: {
            ...subscription.meal_plan_config,
            ...updateData.meal_plan_config,
          },
          price_per_delivery: newPrice,
          updated_at: new Date().toISOString(),
        };

        emailDetails = `Plan posiłków został zaktualizowany. Nowa cena za dostawę: ${newPrice.toFixed(2)} zł`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update subscription in database
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update(updateFields)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    // Create audit log entry
    await supabase
      .from('audit_log')
      .insert({
        user_id: null,
        action: `subscription_${updateData.action}`,
        table_name: 'subscriptions',
        record_id: subscriptionId.toString(),
        old_values: subscription,
        new_values: updatedSubscription,
        created_at: new Date().toISOString(),
      });

    // Send email notification (non-blocking)
    sendSubscriptionStatusUpdate(
      {
        email: subscription.customer_email,
        name: session.user.name || undefined
      },
      subscriptionId,
      emailAction,
      emailDetails
    ).catch(e => console.error('SendGrid subscription email error:', e));

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('Error in subscription update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const subscriptionId = Number.parseInt(params.id);

    // Get current subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('customer_email', session.user.email)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Update subscription status to canceled
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('Error canceling subscription:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
    }

    // Create audit log entry
    await supabase
      .from('audit_log')
      .insert({
        user_id: null,
        action: 'subscription_canceled',
        table_name: 'subscriptions',
        record_id: subscriptionId.toString(),
        old_values: subscription,
        new_values: { status: 'canceled', canceled_at: new Date().toISOString() },
        created_at: new Date().toISOString(),
      });

    // Send cancellation email (non-blocking)
    sendSubscriptionStatusUpdate(
      {
        email: subscription.customer_email,
        name: session.user.name || undefined
      },
      subscriptionId,
      'canceled'
    ).catch(e => console.error('SendGrid cancellation email error:', e));

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully'
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
