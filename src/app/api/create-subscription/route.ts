import { type NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Stripe Price IDs mapping - Real production Price IDs
const PRICE_IDS: Record<string, string> = {
  '2-2': process.env.STRIPE_PRICE_2_2 || 'price_1SVD45ChaDkFJkJI2DkNEpkK',
  '2-3': process.env.STRIPE_PRICE_2_3 || 'price_1SVWHUChaDkFJkJIAEZbXXei',
  '2-4': process.env.STRIPE_PRICE_2_4 || 'price_1SVD45ChaDkFJkJI8OP7MDB3',
  '2-5': process.env.STRIPE_PRICE_2_5 || 'price_1SVD45ChaDkFJkJIzdO9CUAI',
  '3-2': process.env.STRIPE_PRICE_3_2 || 'price_1SVD45ChaDkFJkJIwhAc79kF',
  '3-3': process.env.STRIPE_PRICE_3_3 || 'price_1SVD45ChaDkFJkJIavPtADkM',
  '3-4': process.env.STRIPE_PRICE_3_4 || 'price_1SVD45ChaDkFJkJIQD8WJShG',
  '3-5': process.env.STRIPE_PRICE_3_5 || 'price_1SVD45ChaDkFJkJIdMvMGP4O',
  '4-2': process.env.STRIPE_PRICE_4_2 || 'price_1SVD45ChaDkFJkJIKS1x4fwL',
  '4-3': process.env.STRIPE_PRICE_4_3 || 'price_1SVD45ChaDkFJkJIsmkCYQvL',
  '4-4': process.env.STRIPE_PRICE_4_4 || 'price_1SVD45ChaDkFJkJIgwyRP3da',
  '4-5': process.env.STRIPE_PRICE_4_5 || 'price_1SVD45ChaDkFJkJIH0Rw81fj',
};

// Helper function to get Stripe Price ID for a combination
const getPriceId = (people: number, days: number): string | null => {
  const key = `${people}-${days}`;
  const priceId = PRICE_IDS[key];

  // Log for debugging
  console.log(`🔍 Looking up price for ${people} people, ${days} days:`, {
    key,
    priceId,
    envVar: `STRIPE_PRICE_${people}_${days}`,
    allKeys: Object.keys(PRICE_IDS),
  });

  return priceId || null;
};

/**
 * Create Stripe Checkout Session for Subscription
 * POST /api/create-subscription
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      numberOfPeople,
      numberOfDays,
      deliveryDay = 'tuesday',
      planType,
      selectedDiets,
      selectedAllergies,
      selectedMeals,
      userId,
      userEmail,
      shippingAddress,
    } = body

    // Validate required fields
    if (!numberOfPeople || !numberOfDays || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: numberOfPeople, numberOfDays, userId, userEmail' },
        { status: 400 }
      )
    }

    // Get Stripe price ID from mapping
    const priceId = getPriceId(numberOfPeople, numberOfDays);

    if (!priceId) {
      console.error('❌ Missing Stripe price ID for combination:', { numberOfPeople, numberOfDays })
      return NextResponse.json(
        { error: `Stripe price configuration missing for ${numberOfPeople} people, ${numberOfDays} days. Please contact support.` },
        { status: 500 }
      )
    }

    console.log('📦 Creating subscription checkout for:', {
      numberOfPeople,
      numberOfDays,
      priceId,
      userId,
      email: userEmail,
    })

    // Create or retrieve Stripe customer
    let customerId: string | null = null

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    if (customers.data.length > 0) {
      customerId = customers.data[0].id
      console.log('✅ Found existing Stripe customer:', customerId)
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          user_id: userId,
        },
      })
      customerId = customer.id
      console.log('✅ Created new Stripe customer:', customerId)
    }

    // Prepare meal plan configuration
    const mealPlanConfig = {
      plan_type: planType || 'weekly',
      number_of_people: numberOfPeople,
      number_of_days: numberOfDays,
      delivery_day: deliveryDay,
      selected_diets: selectedDiets || [],
      selected_allergies: selectedAllergies || [],
      selected_meals: selectedMeals || [],
      shipping_address: shippingAddress || null,
      created_at: new Date().toISOString(),
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_type: planType || 'weekly',
          number_of_people: String(numberOfPeople),
          number_of_days: String(numberOfDays),
          delivery_day: deliveryDay,
          meal_plan_config: JSON.stringify(mealPlanConfig),
        },
        // No trial - charge immediately
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
    })

    console.log('✅ Stripe Checkout Session created:', session.id)

    // Save meal plan config to Supabase temporarily (will be synced by webhook)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: configError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        status: 'incomplete', // Will be updated by webhook
        plan_type: planType || 'weekly',
        people: numberOfPeople,
        days: numberOfDays,
        delivery_day: deliveryDay,
        meal_plan_config: mealPlanConfig,
        diets: selectedDiets || [],
        allergies: selectedAllergies || [],
        selected_meals: selectedMeals || [],
        delivery_frequency: 'weekly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })

    if (configError) {
      console.error('❌ Error saving meal plan config:', configError)
      // Don't fail the checkout, webhook will sync it
    } else {
      console.log('✅ Meal plan config saved to Supabase')
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })

  } catch (error: any) {
    console.error('❌ Error creating subscription checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
