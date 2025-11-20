import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/subscription/auto-generate-orders
 * Auto-generuje zamówienia dla użytkowników, którzy nic nie wybrali
 *
 * CRON: Uruchamiać w niedzielę wieczorem (23:00)
 *
 * Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🤖 Starting auto-generation of weekly orders...')

    // 1. Get active weekly menu
    const { data: activeMenu, error: menuError } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('is_active', true)
      .single()

    if (menuError || !activeMenu) {
      console.log('❌ No active weekly menu found')
      return NextResponse.json(
        { error: 'No active weekly menu found' },
        { status: 404 }
      )
    }

    console.log(`✅ Active menu: ${activeMenu.label}`)

    // 2. Get all active subscriptions
    const { data: activeSubscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')

    if (subsError) {
      console.error('❌ Error fetching subscriptions:', subsError)
      return NextResponse.json(
        { error: 'Error fetching subscriptions' },
        { status: 500 }
      )
    }

    console.log(`📦 Found ${activeSubscriptions?.length || 0} active subscriptions`)

    // 3. Get menu items for random selection
    const { data: menuItems, error: itemsError } = await supabase
      .from('weekly_menu_items')
      .select('*')
      .eq('weekly_menu_id', activeMenu.id)

    if (itemsError || !menuItems || menuItems.length === 0) {
      console.error('❌ No menu items found')
      return NextResponse.json(
        { error: 'No menu items available' },
        { status: 500 }
      )
    }

    console.log(`🍽️  Available menu items: ${menuItems.length}`)

    let generatedCount = 0
    let skippedCount = 0
    const results = []

    // 4. For each subscription, check if user has order
    for (const subscription of activeSubscriptions || []) {
      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('subscription_weekly_orders')
        .select('*')
        .eq('user_id', subscription.user_id)
        .eq('weekly_menu_id', activeMenu.id)
        .single()

      if (existingOrder) {
        console.log(`⏭️  User ${subscription.user_id} already has order - skipping`)
        skippedCount++
        continue
      }

      // User doesn't have order - generate one
      console.log(`🎲 Generating order for user ${subscription.user_id}...`)

      try {
        // Get user preferences (diets, allergies)
        const userDiets = subscription.diets || []
        const userAllergies = subscription.allergies || []

        // Filter menu items based on preferences
        // TODO: Implement filtering based on product diets/allergens
        const availableProducts = menuItems.map(item => item.product_id)

        // Random selection
        const requiredMeals = subscription.people * subscription.days
        const selectedProductIds = selectRandomMeals(
          availableProducts,
          requiredMeals
        )

        if (selectedProductIds.length < requiredMeals) {
          console.log(`⚠️  Not enough products for user ${subscription.user_id}`)
          results.push({
            user_id: subscription.user_id,
            status: 'failed',
            error: 'Not enough products available'
          })
          continue
        }

        // Calculate delivery date
        const { data: nextDeliveryDate } = await supabase.rpc(
          'calculate_next_delivery_date',
          {
            p_delivery_day: subscription.delivery_day || 'tuesday',
            p_from_date: new Date().toISOString().split('T')[0]
          }
        )

        // Create order
        const { data: newOrder, error: orderError } = await supabase
          .from('subscription_weekly_orders')
          .insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            weekly_menu_id: activeMenu.id,
            delivery_date: nextDeliveryDate,
            delivery_day: subscription.delivery_day || 'tuesday',
            status: 'pending',
            is_auto_generated: true,
            total_meals: requiredMeals
          })
          .select()
          .single()

        if (orderError) {
          console.error(`❌ Error creating order for user ${subscription.user_id}:`, orderError)
          results.push({
            user_id: subscription.user_id,
            status: 'failed',
            error: orderError.message
          })
          continue
        }

        // Insert items
        const itemsToInsert = selectedProductIds.map(productId => ({
          weekly_order_id: newOrder.id,
          product_id: productId,
          quantity: 1
        }))

        const { error: itemsInsertError } = await supabase
          .from('subscription_weekly_order_items')
          .insert(itemsToInsert)

        if (itemsInsertError) {
          console.error(`❌ Error inserting items for user ${subscription.user_id}:`, itemsInsertError)
          results.push({
            user_id: subscription.user_id,
            status: 'failed',
            error: itemsInsertError.message
          })
          continue
        }

        console.log(`✅ Order created for user ${subscription.user_id}`)
        generatedCount++
        results.push({
          user_id: subscription.user_id,
          status: 'success',
          order_id: newOrder.id
        })

        // TODO: Send email notification
        // await sendAutoGeneratedOrderEmail(subscription.user_id, newOrder, selectedProducts)

      } catch (error: any) {
        console.error(`❌ Error processing user ${subscription.user_id}:`, error)
        results.push({
          user_id: subscription.user_id,
          status: 'failed',
          error: error.message
        })
      }
    }

    console.log(`✅ Auto-generation complete:`)
    console.log(`   - Generated: ${generatedCount}`)
    console.log(`   - Skipped: ${skippedCount}`)
    console.log(`   - Failed: ${results.filter(r => r.status === 'failed').length}`)

    return NextResponse.json({
      success: true,
      message: 'Auto-generation completed',
      stats: {
        total_subscriptions: activeSubscriptions?.length || 0,
        generated: generatedCount,
        skipped: skippedCount,
        failed: results.filter(r => r.status === 'failed').length
      },
      results
    })

  } catch (error: any) {
    console.error('❌ Error in auto-generate-orders:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Select random meals from available products
 */
function selectRandomMeals(products: number[], count: number): number[] {
  const shuffled = [...products].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
