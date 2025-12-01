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

    if (!hasSupabase) {
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

    const products = await fetchSupabaseProducts({
      category: category || undefined,
      diet: diet || undefined,
      search: search || undefined,
      featured: featured === 'true',
    })

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
        message:
          'Failed to fetch products from database. Please try again later.',
      },
      { status: 500 }
    )
  }
}
