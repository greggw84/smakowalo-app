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
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      // Return mock subscriptions data when Supabase is not configured
      const mockSubscriptions = []

      return NextResponse.json({
        subscriptions: mockSubscriptions,
        source: 'mock'
      })
    }

    // Get user subscriptions from database
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_email', session.user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscriptions: subscriptions || [] })

  } catch (error) {
    console.error('Error in subscriptions GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
