import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * GET /api/admin/weekly-menu/items
 * Get items (products) for a specific weekly menu
 */
export async function GET(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Get menu_id from query params
    const { searchParams } = new URL(req.url)
    const menuId = searchParams.get('menu_id')

    if (!menuId) {
      return NextResponse.json(
        { error: 'Missing menu_id parameter' },
        { status: 400 }
      )
    }

    // Get menu items with product details
    const { data: menuItems, error: itemsError } = await supabase
      .from('weekly_menu_items')
      .select(`
        id,
        product_id,
        position,
        is_featured,
        day_of_week,
        created_at
      `)
      .eq('weekly_menu_id', menuId)
      .order('position', { ascending: true })

    if (itemsError) {
      console.error('Error fetching menu items:', itemsError)
      return NextResponse.json(
        { error: 'Error fetching menu items', details: itemsError.message },
        { status: 500 }
      )
    }

    // Fetch product details from products API
    const productIds = menuItems?.map(item => item.product_id) || []
    
    // Try to get products from API
    let products: Record<number, unknown> = {}
    try {
      const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products`)
      const productsData = await productsResponse.json()
      if (productsData.success && productsData.products) {
        // Create a map of product_id to product
        products = productsData.products.reduce((acc: Record<number, unknown>, p: { id: number }) => {
          acc[p.id] = p
          return acc
        }, {})
      }
    } catch (productError) {
      console.error('Error fetching products:', productError)
      // Continue without product details
    }

    // Combine menu items with product details
    const itemsWithProducts = menuItems?.map(item => ({
      ...item,
      product: products[item.product_id] || { id: item.product_id, name: `Product ${item.product_id}` }
    })) || []

    return NextResponse.json({
      success: true,
      items: itemsWithProducts,
      total: itemsWithProducts.length
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('❌ Error in GET /api/admin/weekly-menu/items:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
