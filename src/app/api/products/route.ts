import { type NextRequest, NextResponse } from 'next/server'
import { fetchSupabaseProducts, isSupabaseConfigured } from '@/lib/supabase-menu'
import { processProductImages } from '@/lib/supabase-storage'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const diet = url.searchParams.get('diet')
  const search = url.searchParams.get('search')
  const featured = url.searchParams.get('featured')

  try {
    const hasSupabase = isSupabaseConfigured()

    console.log('[products-api] Config:', {
      hasSupabase,
      supabaseUrl:
        process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not-configured',
    })

    if (!hasSupabase) {
      console.error(
        '[products-api] Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      )

      return NextResponse.json(
        {
          success: false,
          error: 'supabase-not-configured',
          message:
            'Supabase is not configured. Please contact administrator.',
        },
        { status: 500 }
      )
    }

    console.log('[products-api] 🔍 Fetching products from Supabase...', {
      category,
      diet,
      search,
      featured,
    })

    const products = await fetchSupabaseProducts({
      category: category || undefined,
      diet: diet || undefined,
      search: search || undefined,
      featured: featured === 'true',
    })

    console.log(
      `[products-api] ✅ Returning ${products.length} products from Supabase`
    )

    const productsWithImages = processProductImages(products)

    return NextResponse.json({
      success: true,
      products: productsWithImages,
      total: productsWithImages.length,
      source: 'supabase',
    })
  } catch (error) {
    console.error('[products-api] ❌ Products API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'internal-error',
        message: 'Failed to fetch products from database. Please try again later.',
      },
      { status: 500 }
    )
  }
}
