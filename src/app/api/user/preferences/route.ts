import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createSupabaseClient } from '@/lib/supabase'

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Get user profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get user preferences (stored in profiles table or separate preferences table)
    const { data: preferences, error } = await supabase
      .from('profiles')
      .select('dietary_preferences, allergens, default_people_count, default_days_count')
      .eq('id', profile.id)
      .single()

    if (error) {
      console.error('Error fetching preferences:', error)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // Return preferences in kreator format
    return NextResponse.json({
      success: true,
      preferences: {
        numberOfPeople: preferences?.default_people_count || 2,
        numberOfDays: preferences?.default_days_count || 3,
        selectedDiets: preferences?.dietary_preferences || [],
        selectedAllergies: preferences?.allergens || []
      }
    })

  } catch (error) {
    console.error('Preferences API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user/preferences - Save user preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { numberOfPeople, numberOfDays, selectedDiets, selectedAllergies } = body

    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Get user profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Update user preferences
    const { error } = await supabase
      .from('profiles')
      .update({
        dietary_preferences: selectedDiets,
        allergens: selectedAllergies,
        default_people_count: numberOfPeople,
        default_days_count: numberOfDays,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (error) {
      console.error('Error saving preferences:', error)
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully'
    })

  } catch (error) {
    console.error('Preferences API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
