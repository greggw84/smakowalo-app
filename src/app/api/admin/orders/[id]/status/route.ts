import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { sendDeliveryStatusUpdate } from '@/lib/sendgrid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StatusUpdate {
  status: 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'canceled';
  delivery_date?: string;
  notes?: string;
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

    // TODO: Add admin role check here
    // For now, any authenticated user can update order status
    // In production, you should check if user has admin role

    const orderId = Number.parseInt(params.id);
    const updateData: StatusUpdate = await request.json();

    if (!updateData.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare update fields
    const updateFields: any = {
      status: updateData.status,
      updated_at: new Date().toISOString(),
    };

    if (updateData.delivery_date) {
      updateFields.delivery_date = updateData.delivery_date;
    }

    if (updateData.notes) {
      updateFields.notes = updateData.notes;
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateFields)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Create audit log entry
    await supabase
      .from('audit_log')
      .insert({
        user_id: null,
        action: `order_status_${updateData.status}`,
        table_name: 'orders',
        record_id: orderId.toString(),
        old_values: { status: order.status },
        new_values: { status: updateData.status },
        created_at: new Date().toISOString(),
      });

    // Send status update email if customer email exists (non-blocking)
    if (order.customer_email && updateData.status !== order.status) {
      const customerName = `${order.customer_first_name} ${order.customer_last_name}`.trim();
      const estimatedDelivery = updateData.delivery_date || order.delivery_date;

      sendDeliveryStatusUpdate(
        {
          email: order.customer_email,
          name: customerName || undefined
        },
        orderId,
        updateData.status,
        estimatedDelivery
      ).catch(e => console.error('SendGrid delivery status email error:', e));
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
