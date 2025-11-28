import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/menu/weekly/current
 * Pobiera aktualnie aktywne menu tygodniowe z produktami
 */
export async function GET(req: NextRequest) {
  try {
    // Initialize Supabase client (only if credentials are available)
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current active weekly menu
    const { data: currentMenu, error: menuError } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('is_active', true)
      .single()

    if (menuError) {
      // If no active menu found, try to get the most recent one
      if (menuError.code === 'PGRST116') {
        const { data: latestMenu, error: latestError } = await supabase
          .from('weekly_menus')
          .select('*')
          .order('week_start_date', { ascending: false })
          .limit(1)
          .single()

        if (latestError || !latestMenu) {
          return NextResponse.json({
            success: false,
            error: 'No weekly menu available',
            menu: null
          })
        }

        // Use latest menu if no active one
        const { data: latestItems, error: itemsError } = await supabase
          .from('weekly_menu_items')
          .select(`
            id,
            weekly_menu_id,
            product_id,
            day_of_week,
            product:products(*)
          `)
          .eq('weekly_menu_id', latestMenu.id)

        if (itemsError) {
          console.error('Error fetching menu items:', itemsError)
        }

        return NextResponse.json({
          success: true,
          menu: {
            ...latestMenu,
            items: latestItems || []
          },
          note: 'Using latest menu (no active menu found)'
        })
      }

      console.error('Error fetching weekly menu:', menuError)
      return NextResponse.json(
        { error: 'Error fetching weekly menu', details: menuError.message },
        { status: 500 }
      )
    }

    // Get menu items with product details
    const { data: menuItems, error: itemsError } = await supabase
      .from('weekly_menu_items')
      .select(`
        id,
        weekly_menu_id,
        product_id,
        day_of_week,
        product:products(*)
      `)
      .eq('weekly_menu_id', currentMenu.id)

    if (itemsError) {
      console.error('Error fetching menu items:', itemsError)
      // Return menu without items if items fetch fails
      return NextResponse.json({
        success: true,
        menu: {
          ...currentMenu,
          items: []
        },
        warning: 'Could not load menu items'
      })
    }

    return NextResponse.json({
      success: true,
      menu: {
        ...currentMenu,
        items: menuItems || []
      }
    })

  } catch (error: any) {
    console.error('❌ Error in GET /api/menu/weekly/current:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
