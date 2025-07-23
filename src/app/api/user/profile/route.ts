import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Check if Supabase is configured
const hasSupabase = supabaseUrl.startsWith('https://') &&
                   !supabaseUrl.includes('placeholder') &&
                   supabaseServiceKey.length > 50 &&
                   !supabaseServiceKey.includes('placeholder')

const supabase = hasSupabase ? createClient(supabaseUrl, supabaseServiceKey) : null

// GET /api/user/profile - Get user profile
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
        profile: {
          id: session.user.email || '',
          email: session.user.email,
          first_name: session.user.name?.split(' ')[0] || '',
          last_name: session.user.name?.split(' ').slice(1).join(' ') || '',
          phone: '',
          street_address: '',
          city: '',
          postal_code: '',
          country: 'Poland',
          newsletter_subscribed: false,
          dietary_preferences: [],
          allergens: [],
        }
      })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.email)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Update user profile
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

    // Validate required fields
    if (!body.email || !body.first_name) {
      return NextResponse.json(
        { success: false, error: 'Email and first name are required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Return success for mock mode
      return NextResponse.json({
        success: true,
        profile: {
          ...body,
          id: session.user.email || '',
          updated_at: new Date().toISOString(),
        }
      })
    }

    // Update profile in Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name || '',
        phone: body.phone || '',
        street_address: body.street_address || '',
        city: body.city || '',
        postal_code: body.postal_code || '',
        country: body.country || 'Poland',
        newsletter_subscribed: body.newsletter_subscribed || false,
        dietary_preferences: body.dietary_preferences || [],
        allergens: body.allergens || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.email)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
