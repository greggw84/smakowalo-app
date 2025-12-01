import { type NextRequest, NextResponse } from 'next/server'
import { fetchSupabaseProducts, isSupabaseConfigured } from '@/lib/supabase-menu'
import { processProductImages } from '@/lib/supabase-storage'

// Check if Supabase is configured
const hasSupabase = isSupabaseConfigured()

console.log('Data source configuration:', {
  hasSupabase,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not configured',
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const diet = url.searchParams.get('diet')
    const search = url.searchParams.get('search')
    const featured = url.searchParams.get('featured')

    // Only use Supabase - no fallback to mock data
    if (!hasSupabase) {
      console.error('❌ Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
      return NextResponse.json({
        success: false,
        products: [],
        total: 0,
        source: 'none',
        error: 'Database not configured. Please contact administrator.',
      }, { status: 503 })
    }

    console.log('🔍 Fetching products from Supabase...')

    const products = await fetchSupabaseProducts({
      category: category || undefined,
      diet: diet || undefined,
      search: search || undefined,
      featured: featured === 'true',
    })

    console.log(`✅ Returning ${products.length} products from Supabase`)

    // Process images to generate proper URLs for storage paths
    const productsWithImages = processProductImages(products)

    return NextResponse.json({
      success: true,
      products: productsWithImages,
      total: productsWithImages.length,
      source: 'supabase',
    })
  } catch (error) {
    console.error('❌ Products API error:', error)
    return NextResponse.json({
      success: false,
      products: [],
      total: 0,
      source: 'error',
      error: 'Failed to fetch products from database. Please try again later.',
    }, { status: 500 })
  }
}
