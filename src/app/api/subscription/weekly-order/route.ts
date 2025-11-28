import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/subscription/weekly-order
 * Pobiera zamówienie tygodniowe użytkownika
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth
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

    // Get query params
    const { searchParams } = new URL(req.url)
    const weeklyMenuId = searchParams.get('weekly_menu_id')

    if (!weeklyMenuId) {
      // Get current week's order
      const { data: currentMenu } = await supabase
        .from('weekly_menus')
        .select('*')
        .eq('is_active', true)
        .single()

      if (!currentMenu) {
        return NextResponse.json(
          { error: 'No active weekly menu' },
          { status: 404 }
        )
      }

      // Get user's order for current week
      const { data: order, error: orderError } = await supabase
        .from('subscription_weekly_orders')
        .select(`
          *,
          items:subscription_weekly_order_items(*)
        `)
        .eq('user_id', user.id)
        .eq('weekly_menu_id', currentMenu.id)
        .single()

      if (orderError && orderError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching order:', orderError)
        return NextResponse.json(
          { error: 'Error fetching order' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        order: order || null,
        weekly_menu: currentMenu
      })
    }

    // Get specific week's order
    const { data: order, error: orderError } = await supabase
      .from('subscription_weekly_orders')
      .select(`
        *,
        items:subscription_weekly_order_items(*)
      `)
      .eq('user_id', user.id)
      .eq('weekly_menu_id', weeklyMenuId)
      .single()

    if (orderError && orderError.code !== 'PGRST116') {
      console.error('Error fetching order:', orderError)
      return NextResponse.json(
        { error: 'Error fetching order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: order || null
    })

  } catch (error: any) {
    console.error('❌ Error in GET /api/subscription/weekly-order:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscription/weekly-order
 * Zapisuje wybór dań użytkownika na dany tydzień
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()

    const {
      weekly_menu_id,
      selected_product_ids, // array of product IDs
      delivery_date,
      delivery_day
    } = body

    // Validate
    if (!weekly_menu_id || !selected_product_ids || !Array.isArray(selected_product_ids)) {
      return NextResponse.json(
        { error: 'Missing required fields: weekly_menu_id, selected_product_ids' },
        { status: 400 }
      )
    }

    // Get user from session/auth
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

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Validate number of meals
    // Business rule: User selects Y unique meals (days), each meal is for X people
    // So requiredMeals = days (number of unique meal selections)
    const requiredMeals = subscription.days || 3
    const peopleCount = subscription.people || 2
    
    if (selected_product_ids.length !== requiredMeals) {
      return NextResponse.json(
        {
          error: `Musisz wybrać dokładnie ${requiredMeals} dań. Twój plan: ${peopleCount} osób × ${requiredMeals} dni wymaga ${requiredMeals} różnych dań (każde danie dla ${peopleCount} osób).`,
          required: requiredMeals,
          provided: selected_product_ids.length
        },
        { status: 400 }
      )
    }

    // Check if weekly menu exists and is available
    const { data: weeklyMenu, error: menuError } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('id', weekly_menu_id)
      .single()

    if (menuError || !weeklyMenu) {
      return NextResponse.json(
        { error: 'Weekly menu not found' },
        { status: 404 }
      )
    }

    // Calculate delivery date if not provided
    let finalDeliveryDate = delivery_date
    const finalDeliveryDay = delivery_day || subscription.delivery_day || 'tuesday'

    if (!finalDeliveryDate) {
      // Calculate next delivery date based on subscription
      const { data: nextDate } = await supabase.rpc('calculate_next_delivery_date', {
        p_delivery_day: finalDeliveryDay,
        p_from_date: new Date().toISOString().split('T')[0]
      })
      finalDeliveryDate = nextDate
    }

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('subscription_weekly_orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('weekly_menu_id', weekly_menu_id)
      .single()

    // Calculate total meals for delivery (unique meals × people = actual meal count)
    const totalMealsDelivered = requiredMeals * peopleCount

    if (existingOrder) {
      // Update existing order

      // Delete old items
      await supabase
        .from('subscription_weekly_order_items')
        .delete()
        .eq('weekly_order_id', existingOrder.id)

      // Update order
      const { data: updatedOrder, error: updateError } = await supabase
        .from('subscription_weekly_orders')
        .update({
          delivery_date: finalDeliveryDate,
          delivery_day: finalDeliveryDay,
          total_meals: totalMealsDelivered,
          is_auto_generated: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingOrder.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating order:', updateError)
        return NextResponse.json(
          { error: 'Error updating order', details: updateError.message },
          { status: 500 }
        )
      }

      // Insert new items with quantity = peopleCount (each meal is for X people)
      const itemsToInsert = selected_product_ids.map(productId => ({
        weekly_order_id: existingOrder.id,
        product_id: productId,
        quantity: peopleCount
      }))

      const { error: itemsError } = await supabase
        .from('subscription_weekly_order_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('Error inserting items:', itemsError)
        return NextResponse.json(
          { error: 'Error saving meal selections', details: itemsError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Meal selection updated successfully',
        order: updatedOrder
      })

    } else {
      // Create new order
      const { data: newOrder, error: orderError } = await supabase
        .from('subscription_weekly_orders')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          weekly_menu_id,
          delivery_date: finalDeliveryDate,
          delivery_day: finalDeliveryDay,
          status: 'pending',
          is_auto_generated: false,
          total_meals: totalMealsDelivered
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        return NextResponse.json(
          { error: 'Error creating order', details: orderError.message },
          { status: 500 }
        )
      }

      // Insert items with quantity = peopleCount (each meal is for X people)
      const itemsToInsert = selected_product_ids.map(productId => ({
        weekly_order_id: newOrder.id,
        product_id: productId,
        quantity: peopleCount
      }))

      const { error: itemsError } = await supabase
        .from('subscription_weekly_order_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('Error inserting items:', itemsError)
        return NextResponse.json(
          { error: 'Error saving meal selections', details: itemsError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Meal selection saved successfully',
        order: newOrder
      })
    }

  } catch (error: any) {
    console.error('❌ Error in POST /api/subscription/weekly-order:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
