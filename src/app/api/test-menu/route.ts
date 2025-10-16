import { NextResponse } from 'next/server'
import { scrapeProducts, scrapeCategories } from '@/lib/opencart-scraper'

export async function GET() {
  try {
    console.log('🧪 Testing Menu page - OpenCart connection...')

    const [products, categories] = await Promise.all([
      scrapeProducts(),
      scrapeCategories()
    ])

    const categoryCounts = products.reduce((acc: any, p: any) => {
      acc[p.category_name] = (acc[p.category_name] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      message: 'Menu page connected to OpenCart!',
      source: 'shop.smakowalo.pl',
      connection: {
        url: 'https://shop.smakowalo.pl',
        method: 'Web Scraper (no API key needed)',
        status: 'Connected ✅'
      },
      data: {
        total_products: products.length,
        total_categories: categories.length,
        products_by_category: categoryCounts
      },
      sample_products: products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category_name,
        image: p.image,
        source_url: `https://shop.smakowalo.pl/index.php?route=product/product&product_id=${p.id}`
      })),
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug
      }))
    })
  } catch (error: any) {
    console.error('❌ Menu test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      connection_status: 'Failed to connect to shop.smakowalo.pl'
    }, { status: 500 })
  }
}
