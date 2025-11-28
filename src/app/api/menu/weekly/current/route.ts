import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Supabase error code for "no rows returned"
const SUPABASE_NO_ROWS_ERROR = 'PGRST116'

/**
 * GET /api/menu/weekly/current
 * Returns the current active weekly menu with all products
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the current active weekly menu
    const { data: weeklyMenu, error: menuError } = await supabase
      .from('weekly_menus')
      .select(`
        id,
        week_start_date,
        week_end_date,
        label,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single()

    if (menuError) {
      // If no active menu found, try to get the most recent one
      if (menuError.code === SUPABASE_NO_ROWS_ERROR) {
        const { data: recentMenu, error: recentError } = await supabase
          .from('weekly_menus')
          .select(`
            id,
            week_start_date,
            week_end_date,
            label,
            is_active,
            created_at
          `)
          .order('week_start_date', { ascending: false })
          .limit(1)
          .single()

        if (recentError || !recentMenu) {
          return NextResponse.json({
            success: false,
            error: 'No weekly menu available',
            menu: null
          })
        }

        // Get items for this menu
        const { data: menuItems, error: itemsError } = await supabase
          .from('weekly_menu_items')
          .select(`
            id,
            product_id,
            day_of_week,
            meal_type,
            products:product_id (
              id,
              name,
              description,
              image_url,
              price,
              calories,
              prep_time,
              allergens,
              category_id,
              categories:category_id (
                name
              )
            )
          `)
          .eq('weekly_menu_id', recentMenu.id)

        const formattedItems = (menuItems || []).map((item: any) => ({
          id: item.id,
          day_of_week: item.day_of_week,
          meal_type: item.meal_type,
          product: item.products ? {
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            image: item.products.image_url || '/placeholder.jpg',
            price: item.products.price,
            calories: item.products.calories || 0,
            cook_time: item.products.prep_time || 30,
            allergens: item.products.allergens || [],
            diets: item.products.categories?.name ? [item.products.categories.name] : [],
          } : null
        }))

        return NextResponse.json({
          success: true,
          menu: {
            ...recentMenu,
            items: formattedItems
          }
        })
      }
      
      console.error('Error fetching weekly menu:', menuError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch weekly menu',
        menu: null
      })
    }

    // Get all items for this weekly menu
    const { data: menuItems, error: itemsError } = await supabase
      .from('weekly_menu_items')
      .select(`
        id,
        product_id,
        day_of_week,
        meal_type,
        products:product_id (
          id,
          name,
          description,
          image_url,
          price,
          calories,
          prep_time,
          allergens,
          category_id,
          categories:category_id (
            name
          )
        )
      `)
      .eq('weekly_menu_id', weeklyMenu.id)

    if (itemsError) {
      console.error('Error fetching menu items:', itemsError)
    }

    // Format the response with products
    const formattedItems = (menuItems || []).map((item: any) => ({
      id: item.id,
      day_of_week: item.day_of_week,
      meal_type: item.meal_type,
      product: item.products ? {
        id: item.products.id,
        name: item.products.name,
        description: item.products.description,
        image: item.products.image_url || '/placeholder.jpg',
        price: item.products.price,
        calories: item.products.calories || 0,
        cook_time: item.products.prep_time || 30,
        allergens: item.products.allergens || [],
        diets: item.products.categories?.name ? [item.products.categories.name] : [],
      } : null
    }))

    return NextResponse.json({
      success: true,
      menu: {
        ...weeklyMenu,
        items: formattedItems
      }
    })

  } catch (error: any) {
    console.error('❌ Error in GET /api/menu/weekly/current:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        menu: null
      },
      { status: 500 }
    )
  }
}
