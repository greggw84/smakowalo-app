import { type NextRequest, NextResponse } from 'next/server'
import { fetchSupabaseCategories, isSupabaseConfigured } from '@/lib/supabase-menu'

const hasSupabase = isSupabaseConfigured()

export async function GET(request: NextRequest) {
  try {
    // Only use Supabase - no fallback to mock data
    if (!hasSupabase) {
      console.error('❌ Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
      return NextResponse.json({
        success: false,
        categories: [],
        source: 'none',
        error: 'Database not configured. Please contact administrator.',
      }, { status: 503 })
    }

    console.log('🔍 Fetching categories from Supabase...')
    const categories = await fetchSupabaseCategories()

    console.log(`✅ Returning ${categories.length} categories from Supabase`)
    return NextResponse.json({ success: true, categories, source: 'supabase' })
  } catch (e) {
    console.error('Categories API error', e)
    return NextResponse.json({
      success: false,
      categories: [],
      source: 'error',
      error: 'Failed to fetch categories from database. Please try again later.',
    }, { status: 500 })
  }
}
