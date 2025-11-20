import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/admin/weekly-menu
 * Lista wszystkich menu tygodniowych (admin only)
 */
export async function GET(req: NextRequest) {
  try {
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

    // Get all weekly menus
    const { data: menus, error: menusError } = await supabase
      .from('weekly_menus')
      .select(`
        *,
        items:weekly_menu_items(count)
      `)
      .order('week_start_date', { ascending: false })

    if (menusError) {
      console.error('Error fetching menus:', menusError)
      return NextResponse.json(
        { error: 'Error fetching menus' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      menus: menus || []
    })

  } catch (error: any) {
    console.error('❌ Error in GET /api/admin/weekly-menu:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/weekly-menu
 * Tworzy nowe menu tygodniowe (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()

    const {
      week_start_date,
      week_end_date,
      label,
      is_active = false,
      is_published = false,
      product_ids = [], // array of product IDs to add to menu
      copy_from_menu_id = null // optional: copy from existing menu
    } = body

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

    // Validate
    if (!week_start_date || !week_end_date || !label) {
      return NextResponse.json(
        { error: 'Missing required fields: week_start_date, week_end_date, label' },
        { status: 400 }
      )
    }

    // If setting as active, deactivate other menus
    if (is_active) {
      await supabase
        .from('weekly_menus')
        .update({ is_active: false })
        .eq('is_active', true)
    }

    // Create menu
    const { data: newMenu, error: menuError } = await supabase
      .from('weekly_menus')
      .insert({
        week_start_date,
        week_end_date,
        label,
        is_active,
        is_published,
        created_by: user.id
      })
      .select()
      .single()

    if (menuError) {
      console.error('Error creating menu:', menuError)
      return NextResponse.json(
        { error: 'Error creating menu' },
        { status: 500 }
      )
    }

    // Add products to menu
    let productsToAdd = product_ids

    // If copying from existing menu
    if (copy_from_menu_id) {
      const { data: existingItems } = await supabase
        .from('weekly_menu_items')
        .select('*')
        .eq('weekly_menu_id', copy_from_menu_id)
        .order('position', { ascending: true })

      if (existingItems && existingItems.length > 0) {
        productsToAdd = existingItems.map(item => item.product_id)
      }
    }

    // Insert products
    if (productsToAdd.length > 0) {
      const itemsToInsert = productsToAdd.map((productId: number, index: number) => ({
        weekly_menu_id: newMenu.id,
        product_id: productId,
        position: index,
        is_featured: false
      }))

      const { error: itemsError } = await supabase
        .from('weekly_menu_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('Error adding products to menu:', itemsError)
        // Don't fail - menu is created, just products failed
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly menu created successfully',
      menu: newMenu
    })

  } catch (error: any) {
    console.error('❌ Error in POST /api/admin/weekly-menu:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/weekly-menu
 * Aktualizuje menu tygodniowe (admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()

    const {
      menu_id,
      week_start_date,
      week_end_date,
      label,
      is_active,
      is_published,
      product_ids
    } = body

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

    if (!menu_id) {
      return NextResponse.json(
        { error: 'Missing menu_id' },
        { status: 400 }
      )
    }

    // If setting as active, deactivate other menus
    if (is_active) {
      await supabase
        .from('weekly_menus')
        .update({ is_active: false })
        .eq('is_active', true)
        .neq('id', menu_id)
    }

    // Update menu
    const updateData: any = {}
    if (week_start_date) updateData.week_start_date = week_start_date
    if (week_end_date) updateData.week_end_date = week_end_date
    if (label) updateData.label = label
    if (typeof is_active !== 'undefined') updateData.is_active = is_active
    if (typeof is_published !== 'undefined') updateData.is_published = is_published

    const { data: updatedMenu, error: updateError } = await supabase
      .from('weekly_menus')
      .update(updateData)
      .eq('id', menu_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating menu:', updateError)
      return NextResponse.json(
        { error: 'Error updating menu' },
        { status: 500 }
      )
    }

    // Update products if provided
    if (product_ids && Array.isArray(product_ids)) {
      // Delete existing items
      await supabase
        .from('weekly_menu_items')
        .delete()
        .eq('weekly_menu_id', menu_id)

      // Insert new items
      if (product_ids.length > 0) {
        const itemsToInsert = product_ids.map((productId: number, index: number) => ({
          weekly_menu_id: menu_id,
          product_id: productId,
          position: index,
          is_featured: false
        }))

        await supabase
          .from('weekly_menu_items')
          .insert(itemsToInsert)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly menu updated successfully',
      menu: updatedMenu
    })

  } catch (error: any) {
    console.error('❌ Error in PUT /api/admin/weekly-menu:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/weekly-menu
 * Usuwa menu tygodniowe (admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(req.url)
    const menuId = searchParams.get('id')

    if (!menuId) {
      return NextResponse.json(
        { error: 'Missing menu id' },
        { status: 400 }
      )
    }

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

    // Check if menu has orders
    const { data: orders } = await supabase
      .from('subscription_weekly_orders')
      .select('id')
      .eq('weekly_menu_id', menuId)
      .limit(1)

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete menu with existing orders' },
        { status: 400 }
      )
    }

    // Delete menu (cascade will delete items)
    const { error: deleteError } = await supabase
      .from('weekly_menus')
      .delete()
      .eq('id', menuId)

    if (deleteError) {
      console.error('Error deleting menu:', deleteError)
      return NextResponse.json(
        { error: 'Error deleting menu' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly menu deleted successfully'
    })

  } catch (error: any) {
    console.error('❌ Error in DELETE /api/admin/weekly-menu:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
