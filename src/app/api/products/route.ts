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

    // Try Supabase first if configured
    if (hasSupabase) {
      try {
        console.log('🔍 Fetching products from Supabase...')

        const products = await fetchSupabaseProducts({
          category: category || undefined,
          diet: diet || undefined,
          search: search || undefined,
          featured: featured === 'true',
        })

        if (products.length > 0) {
          console.log(`✅ Returning ${products.length} products from Supabase`)

          // Process images ...
          const productsWithImages = processProductImages(products)

          return NextResponse.json({
            success: true,
            products: productsWithImages,
            total: productsWithImages.length,
            source: 'supabase',
          })
        }

        console.log('⚠️ No products found in Supabase, falling back to mock data')
      } catch (supabaseError) {
        console.error('❌ Supabase fetch failed, falling back to mock data:', supabaseError)
        // Fall through to mock data
      }
    }

    console.log(`✅ Returning ${products.length} products from Supabase`)

    // ...filtry category/diet/search/featured...

    return NextResponse.json({
      success: true,
      products: productsWithImages,
      total: productsWithImages.length,
      source: 'supabase',
    })
  } catch (error) {
    console.error('❌ Products API error:', error)
    // Always fallback to mock data in case of any error
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const diet = url.searchParams.get('diet')
    const search = url.searchParams.get('search')
    const featured = url.searchParams.get('featured')

    let filteredProducts = [...fallbackProducts]

    // ...te same filtry...

    return NextResponse.json({
      success: false,
      products: [],
      total: 0,
      source: 'error',
      error: 'Failed to fetch products from database. Please try again later.',
    }, { status: 500 })
  }
}
