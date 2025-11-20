import { NextResponse } from 'next/server'
import { fetchOpenCartProducts, fetchOpenCartCategories } from '@/lib/opencart'
import { scrapeProducts, scrapeCategories } from '@/lib/opencart-scraper'

export async function GET() {
  try {
    console.log('🧪 Testing OpenCart connection...')

    // Try scraping first (no API available)
    let products: any[] = []
    let categories: any[] = []
    let method = 'unknown'

    try {
      console.log('🕷️ Trying web scraper...')
      products = await scrapeProducts()
      categories = await scrapeCategories()
      method = 'scraper'
      console.log(`✅ Scraped ${products.length} products`)
    } catch (scrapeError) {
      console.log('❌ Scraping failed, trying API...')
      try {
        products = await fetchOpenCartProducts()
        categories = await fetchOpenCartCategories()
        method = 'api'
        console.log(`✅ Fetched ${products.length} products from API`)
      } catch (apiError) {
        throw new Error(`Both scraper and API failed: ${scrapeError} | ${apiError}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `OpenCart connection successful (using ${method})`,
      method: method,
      products_count: products.length,
      categories_count: categories.length,
      sample_products: products.slice(0, 5).map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        price: p.price,
        category: p.category_name || 'Unknown'
      })),
      sample_categories: categories.slice(0, 6)
    })
  } catch (error: any) {
    console.error('❌ OpenCart test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 })
  }
}
