import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Initialize Supabase only if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      // Return mock profile data when Supabase is not configured
      console.log('📋 Returning mock profile for:', session.user.email)
      const mockProfile = {
        id: 1,
        email: session.user.email,
        first_name: session.user.name?.split(' ')[0] || '',
        last_name: session.user.name?.split(' ').slice(1).join(' ') || '',
        phone: '',
        street_address: '',
        city: '',
        postal_code: '',
        dietary_preferences: [],
        newsletter_subscribed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        profile: mockProfile,
        source: 'mock'
      })
    }

    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: session.user.email,
          first_name: session.user.name?.split(' ')[0] || '',
          last_name: session.user.name?.split(' ').slice(1).join(' ') || '',
          newsletter_subscribed: false,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({ profile: newProfile })
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error in profile GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const updateData = await request.json()

    // Check if Supabase is configured
    if (!supabase) {
      // Return success with mock data when Supabase is not configured
      const mockUpdatedProfile = {
        id: 1,
        email: session.user.email,
        ...updateData,
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        profile: mockUpdatedProfile,
        message: 'Profile updated successfully (mock mode)',
        source: 'mock'
      })
    }

    // Remove fields that shouldn't be updated directly
    const { id, email, created_at, updated_at, ...allowedFields } = updateData

    // Update user profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        ...allowedFields,
        updated_at: new Date().toISOString(),
      })
      .eq('email', session.user.email)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error in profile PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
