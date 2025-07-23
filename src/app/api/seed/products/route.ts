import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const hasSupabase = supabaseUrl.startsWith('https://') &&
                   !supabaseUrl.includes('placeholder') &&
                   supabaseServiceKey.length > 50 &&
                   !supabaseServiceKey.includes('placeholder')

const supabase = hasSupabase ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 500 })
    }

    // First check categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')

    if (catError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: catError.message
      }, { status: 500 })
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No categories found. Please run database seed first.',
        categories: []
      }, { status: 400 })
    }

    // Get the "Główne dania" category ID
    const mainDishCategory = categories.find(cat => cat.slug === 'glowne-dania' || cat.name === 'Główne dania')

    if (!mainDishCategory) {
      return NextResponse.json({
        success: false,
        error: 'Main dishes category not found',
        availableCategories: categories
      }, { status: 400 })
    }

    // Seed products data using the correct category ID
    const seedProducts = [
      {
        name: 'Kurczak Tikka Masala',
        slug: 'kurczak-tikka-masala',
        description: 'Aromatyczny kurczak w kremowym sosie curry z pomidorami i tradycyjnymi indyjskimi przyprawami. Podawany z ryżem basmati i świeżą kolendrą.',
        image: 'https://ext.same-assets.com/3234956792/tikka-masala.jpg',
        price: 35.00,
        old_price: 42.00,
        category_id: mainDishCategory.id,
        cook_time: 25,
        servings: 2,
        difficulty: 'Średni',
        calories: 520,
        protein: 35,
        carbs: 45,
        fat: 18,
        fiber: 4,
        ingredients: [
          'Pierś z kurczaka (300g)',
          'Ryż basmati (150g)',
          'Pomidory w puszce (200g)',
          'Śmietanka 18% (100ml)',
          'Cebula (100g)',
          'Czosnek (15g)',
          'Imbir świeży (10g)',
          'Masala garam (5g)',
          'Kurkuma (3g)',
          'Kolendra świeża (20g)'
        ],
        allergens: ['Lakto'],
        equipment: ['Patelnia', 'Garnek'],
        instructions: [
          { step: 1, title: 'Przygotowanie', description: 'Pokrój kurczaka w kostkę, cebulę w półksiężyce. Posiekaj czosnek i imbir.' },
          { step: 2, title: 'Gotowanie ryżu', description: 'Ugotuj ryż basmati według instrukcji na opakowaniu.' },
          { step: 3, title: 'Smażenie kurczaka', description: 'Podsmaż kurczaka na patelni do złotego koloru.' },
          { step: 4, title: 'Sos curry', description: 'Dodaj cebulę, czosnek, przyprawy. Dusić 3 minuty.' },
          { step: 5, title: 'Finalizacja', description: 'Dodaj pomidory i śmietankę. Gotuj 10 minut. Podawaj z ryżem.' }
        ],
        nutrition_per_100g: {
          energy: '208 kJ',
          fat: '7.2g',
          saturated_fat: '2.1g',
          carbs: '18g',
          sugar: '4.2g',
          protein: '14g',
          salt: '0.8g'
        },
        tags: ['curry', 'indyjskie', 'kremowe'],
        diets: ['bezglutenowa'],
        active: true,
        featured: true,
        stock_quantity: 50,
        sku: 'SMK-TM-001'
      },
      {
        name: 'Krewetki z Harissą',
        slug: 'krewetki-z-harissa',
        description: 'Soczyste krewetki w pikantnym sosie harissa z kuskusem cytrynowym i grillowanymi warzywami. Inspirowane kuchnią północnoafrykańską.',
        image: 'https://ext.same-assets.com/3234956792/harissa-shrimp.jpg',
        price: 39.00,
        old_price: null,
        category_id: mainDishCategory.id,
        cook_time: 20,
        servings: 2,
        difficulty: 'Łatwy',
        calories: 450,
        protein: 28,
        carbs: 42,
        fat: 15,
        fiber: 6,
        ingredients: [
          'Krewetki królewskie (250g)',
          'Kuskus (120g)',
          'Pasta harissa (30g)',
          'Cukinia (150g)',
          'Papryka czerwona (100g)',
          'Cytryna (60g)',
          'Oliwa z oliwek (20ml)',
          'Czosnek (10g)',
          'Kolendra świeża (15g)',
          'Mięta świeża (10g)'
        ],
        allergens: ['Skorupiaki'],
        equipment: ['Patelnia', 'Garnek'],
        instructions: [
          { step: 1, description: 'Przygotuj kuskus według instrukcji. Dodaj sok z cytryny.' },
          { step: 2, description: 'Pokrój warzywa w paski. Podsmaż na patelni.' },
          { step: 3, description: 'Dodaj krewetki i harissę. Smaż 3-4 minuty.' },
          { step: 4, description: 'Podawaj z kuskusem, posyp ziołami.' }
        ],
        tags: ['pikantne', 'afrykańskie', 'morskie'],
        diets: ['bezglutenowa', 'pescetariańska'],
        active: true,
        featured: true,
        stock_quantity: 35,
        sku: 'SMK-KH-002'
      },
      {
        name: 'Łosoś na Risotto',
        slug: 'losos-na-risotto',
        description: 'Pieczony łosoś na kremowym risotto ze szparagami i parmezanem. Eleganckie danie główne idealne na kolację.',
        image: 'https://ext.same-assets.com/3234956792/salmon-risotto.jpg',
        price: 42.00,
        category_id: mainDishCategory.id,
        cook_time: 35,
        servings: 2,
        difficulty: 'Trudny',
        calories: 580,
        protein: 32,
        carbs: 38,
        fat: 25,
        fiber: 3,
        ingredients: [
          'Filet z łososia (300g)',
          'Ryż arborio (150g)',
          'Szparagi (200g)',
          'Parmezan tarty (50g)',
          'Bulion warzywny (500ml)',
          'Białe wino (100ml)',
          'Cebula szalotka (80g)',
          'Masło (30g)',
          'Oliwa (15ml)'
        ],
        allergens: ['Ryby', 'Lakto'],
        equipment: ['Patelnia', 'Garnek', 'Piekarnik'],
        instructions: [
          { step: 1, description: 'Podgrzej piekarnik do 200°C.' },
          { step: 2, description: 'Przygotuj risotto - smaż cebulę, dodaj ryż.' },
          { step: 3, description: 'Stopniowo dodawaj bulion, mieszając.' },
          { step: 4, description: 'Piecz łososia 12-15 minut.' },
          { step: 5, description: 'Podawaj łososia na risotto z parmezanem.' }
        ],
        tags: ['premium', 'włoskie', 'ryby'],
        diets: ['bezglutenowa', 'pescetariańska'],
        active: true,
        featured: false,
        stock_quantity: 25,
        sku: 'SMK-LR-003'
      }
    ]

    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5)

    if (checkError) {
      console.error('Check products error:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing products',
        details: checkError.message
      }, { status: 500 })
    }

    if (existingProducts && existingProducts.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Products already exist. Delete existing products first.',
        existing: existingProducts.length,
        products: existingProducts
      }, { status: 400 })
    }

    // Insert seed products
    const { data: products, error: insertError } = await supabase
      .from('products')
      .insert(seedProducts)
      .select()

    if (insertError) {
      console.error('Insert products error:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert products',
        details: insertError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Products seeded successfully',
      count: products?.length || 0,
      products: products?.map(p => ({ id: p.id, name: p.name, price: p.price })),
      usedCategory: mainDishCategory
    })

  } catch (error) {
    console.error('Seed products error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check current products and categories
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      })
    }

    const [
      { data: products, error: prodError },
      { data: categories, error: catError }
    ] = await Promise.all([
      supabase.from('products').select('id, name, price, category_id, active').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, slug').eq('active', true)
    ])

    if (prodError || catError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch data',
        details: { prodError, catError }
      })
    }

    return NextResponse.json({
      success: true,
      productsCount: products?.length || 0,
      categoriesCount: categories?.length || 0,
      products: products || [],
      categories: categories || []
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
}
