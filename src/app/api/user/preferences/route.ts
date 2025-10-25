import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createSupabaseClient } from '@/lib/supabase'

interface UserPreferences {
  numberOfPeople: number
  numberOfDays: number
  selectedDiets: number[]
  selectedAllergies: string[]
}

// Check if Supabase is configured
const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email

    // Try Supabase if configured
    if (hasSupabase) {
      try {
        const supabase = createSupabaseClient()
        
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('email', userEmail)
          .single()

        if (error) {
          // If table doesn't exist or row not found, fall back to defaults
          console.log('Supabase preferences fetch error (using defaults):', error.message)
          return NextResponse.json({
            success: true,
            preferences: {
              numberOfPeople: 2,
              numberOfDays: 3,
              selectedDiets: [],
              selectedAllergies: []
            },
            source: 'default'
          })
        }

        return NextResponse.json({
          success: true,
          preferences: data.preferences as UserPreferences,
          source: 'supabase'
        })
      } catch (supabaseError) {
        console.error('Supabase error, using defaults:', supabaseError)
        // Fall through to default response
      }
    }

    // If Supabase not configured or error, return defaults
    // Client will handle localStorage
    return NextResponse.json({
      success: true,
      preferences: {
        numberOfPeople: 2,
        numberOfDays: 3,
        selectedDiets: [],
        selectedAllergies: []
      },
      source: 'default'
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email
    const body = await request.json()
    
    const preferences: UserPreferences = {
      numberOfPeople: body.numberOfPeople || 2,
      numberOfDays: body.numberOfDays || 3,
      selectedDiets: body.selectedDiets || [],
      selectedAllergies: body.selectedAllergies || []
    }

    // Try Supabase if configured
    if (hasSupabase) {
      try {
        const supabase = createSupabaseClient()
        
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            email: userEmail,
            preferences: preferences,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email'
          })

        if (error) {
          console.error('Supabase upsert error:', error.message)
          // Fall through to success response (client will use localStorage)
        } else {
          return NextResponse.json({
            success: true,
            message: 'Preferences saved',
            source: 'supabase'
          })
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError)
        // Fall through to mock response
      }
    }

    // If Supabase not configured or error, return success
    // Client will handle localStorage
    return NextResponse.json({
      success: true,
      message: 'Preferences saved (localStorage)',
      source: 'mock'
    })
  } catch (error) {
    console.error('Error saving user preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
