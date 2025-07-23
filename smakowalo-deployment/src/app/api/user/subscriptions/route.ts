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

// Mock subscription data
const mockSubscription = {
  id: 1,
  user_id: 'mock-user-id',
  plan_name: 'Premium',
  meals_per_week: 4,
  people_count: 2,
  weekly_price: 159.99,
  status: 'active',
  start_date: '2024-01-01',
  next_delivery_date: '2024-01-29',
  billing_cycle: 'weekly',
  delivery_day: 'monday',
  delivery_notes: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// GET /api/user/subscriptions - Get user subscriptions
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
        subscriptions: [mockSubscription]
      })
    }

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions || []
    })

  } catch (error) {
    console.error('Subscriptions API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user/subscriptions - Create new subscription
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
    if (!body.plan_name || !body.meals_per_week || !body.people_count || !body.weekly_price) {
      return NextResponse.json(
        { success: false, error: 'Missing required subscription fields' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Return mock success for testing
      const mockNewSubscription = {
        ...mockSubscription,
        id: Date.now(),
        user_id: session.user.email,
        plan_name: body.plan_name,
        meals_per_week: body.meals_per_week,
        people_count: body.people_count,
        weekly_price: body.weekly_price,
        start_date: body.start_date || new Date().toISOString().split('T')[0],
        next_delivery_date: body.next_delivery_date,
        delivery_day: body.delivery_day || 'monday',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        subscription: mockNewSubscription
      })
    }

    // Create subscription in Supabase
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: session.user.email,
        plan_name: body.plan_name,
        meals_per_week: body.meals_per_week,
        people_count: body.people_count,
        weekly_price: body.weekly_price,
        status: 'active',
        start_date: body.start_date || new Date().toISOString().split('T')[0],
        next_delivery_date: body.next_delivery_date,
        billing_cycle: body.billing_cycle || 'weekly',
        delivery_day: body.delivery_day || 'monday',
        delivery_notes: body.delivery_notes || '',
        stripe_subscription_id: body.stripe_subscription_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription
    })

  } catch (error) {
    console.error('Create subscription API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/user/subscriptions/:id - Update subscription
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const subscriptionId = body.id

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Return mock success for testing
      return NextResponse.json({
        success: true,
        subscription: {
          ...mockSubscription,
          ...body,
          updated_at: new Date().toISOString()
        }
      })
    }

    // Update subscription in Supabase
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        plan_name: body.plan_name,
        meals_per_week: body.meals_per_week,
        people_count: body.people_count,
        weekly_price: body.weekly_price,
        status: body.status,
        next_delivery_date: body.next_delivery_date,
        delivery_day: body.delivery_day,
        delivery_notes: body.delivery_notes,
        pause_until: body.pause_until,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .eq('user_id', session.user.email) // Ensure user owns this subscription
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription
    })

  } catch (error) {
    console.error('Update subscription API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
