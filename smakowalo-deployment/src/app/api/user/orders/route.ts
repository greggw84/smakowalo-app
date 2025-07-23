import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const hasSupabase = supabaseUrl.startsWith('https://') &&
                   !supabaseUrl.includes('placeholder') &&
                   supabaseServiceKey.length > 50 &&
                   !supabaseServiceKey.includes('placeholder')

const supabase = hasSupabase ? createClient(supabaseUrl, supabaseServiceKey) : null

// Mock orders data - now connected to real products
const mockOrders = [
  {
    id: 1,
    order_number: 'SMK-2024-001',
    status: 'delivered',
    total_amount: 156.99,
    currency: 'PLN',
    delivery_date: '2024-01-15',
    created_at: '2024-01-12T10:00:00Z',
    items: [
      {
        name: 'Kurczak Tikka Masala',
        quantity: 2,
        unit_price: 35.00,
        total_price: 70.00,
        image: 'https://ext.same-assets.com/3234956792/tikka-masala.jpg'
      },
      {
        name: 'Krewetki z Harissą',
        quantity: 2,
        unit_price: 39.00,
        total_price: 78.00,
        image: 'https://ext.same-assets.com/3234956792/harissa-shrimp.jpg'
      }
    ],
    delivery_address: {
      name: 'Jan Kowalski',
      street: 'ul. Przykładowa 123',
      city: 'Warszawa',
      postal_code: '00-001',
      phone: '+48 123 456 789'
    }
  },
  {
    id: 2,
    order_number: 'SMK-2024-002',
    status: 'preparing',
    total_amount: 105.99,
    currency: 'PLN',
    delivery_date: '2024-01-22',
    created_at: '2024-01-19T14:30:00Z',
    items: [
      {
        name: 'Łosoś na Risotto',
        quantity: 1,
        unit_price: 42.00,
        total_price: 42.00,
        image: 'https://ext.same-assets.com/3234956792/salmon-risotto.jpg'
      },
      {
        name: 'Kurczak Tikka Masala',
        quantity: 2,
        unit_price: 35.00,
        total_price: 70.00,
        image: 'https://ext.same-assets.com/3234956792/tikka-masala.jpg'
      }
    ],
    delivery_address: {
      name: 'Jan Kowalski',
      street: 'ul. Przykładowa 123',
      city: 'Warszawa',
      postal_code: '00-001',
      phone: '+48 123 456 789'
    }
  }
]

// GET /api/user/orders - Get user orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!supabase) {
      // Return mock data if Supabase not configured
      return NextResponse.json({
        success: true,
        orders: mockOrders
      })
    }

    // Fetch orders with items from Supabase
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            image
          )
        )
      `)
      .eq('user_id', session.user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedOrders = orders?.map(order => ({
      ...order,
      items: order.order_items?.map((item: { products?: { name?: string; image?: string }; quantity: number; unit_price: number; total_price: number }) => ({
        name: item.products?.name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        image: item.products?.image
      })) || []
    })) || []

    return NextResponse.json({
      success: true,
      orders: transformedOrders
    })

  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order items are required' },
        { status: 400 }
      )
    }

    if (!body.delivery_address) {
      return NextResponse.json(
        { success: false, error: 'Delivery address is required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Return mock success for testing
      const mockOrder = {
        id: Date.now(),
        order_number: `SMK-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        user_id: session.user.email,
        status: 'pending',
        total_amount: body.total_amount || 0,
        currency: 'PLN',
        delivery_address: body.delivery_address,
        created_at: new Date().toISOString(),
        items: body.items
      }

      return NextResponse.json({
        success: true,
        order: mockOrder
      })
    }

    // Generate order number
    const orderNumber = `SMK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.email,
        order_number: orderNumber,
        status: 'pending',
        subtotal: body.subtotal || body.total_amount,
        delivery_fee: body.delivery_fee || 0,
        discount: body.discount || 0,
        tax: body.tax || 0,
        total_amount: body.total_amount,
        currency: 'PLN',
        delivery_address: body.delivery_address,
        billing_address: body.billing_address || body.delivery_address,
        delivery_date: body.delivery_date,
        order_notes: body.notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = body.items.map((item: { product_id: number; quantity: number; unit_price: number; total_price: number; selected_meals?: string[] }) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      selected_meals: item.selected_meals || []
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Try to delete the order if items creation failed
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: body.items
      }
    })

  } catch (error) {
    console.error('Create order API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
