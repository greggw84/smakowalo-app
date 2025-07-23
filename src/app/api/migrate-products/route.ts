import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

// Sample OpenCart products data - in production this would come from OpenCart API/database
const openCartProducts = [
  {
    id: 61,
    name: "Kurczak Tikka Masala z Curry z ryżem z kalafiora i kolendrą",
    description: "Soczyste kawałki kurczaka w aromatycznym sosie tikka masala z ryżem z kalafiora i świeżą kolendrą",
    image: "https://ext.same-assets.com/3234956792/2143887936.png",
    price: 35.00,
    category: "Kurczak",
    cook_time: 30,
    servings: 2,
    difficulty: "Średni",
    calories: 398,
    protein: 19,
    carbs: 12,
    fat: 6,
    fiber: 3,
    ingredients: [
      "Kurczak", "Pasta tikka", "Kalafior", "Kolendra", "Pomidory",
      "Cebula czerwona", "Śmietana kwaszona", "Czosnek", "Imbir"
    ],
    allergens: [],
    equipment: ["Patelnia", "Nóż", "Deska do krojenia"],
    instructions: [
      { step: 1, title: "Przygotowanie składników", description: "Pokrój kurczaka na kawałki i przygotuj wszystkie składniki." },
      { step: 2, title: "Marinata", description: "Zamarynuj kurczaka w paście tikka na 15 minut." },
      { step: 3, title: "Smażenie", description: "Usmaż kurczaka na patelni do złotego koloru." },
      { step: 4, title: "Sos", description: "Dodaj sos pomidorowy i śmietanę, gotuj 10 minut." },
      { step: 5, title: "Podawanie", description: "Podawaj z ryżem z kalafiora i kolendrą." }
    ],
    nutrition_per_100g: {
      energy: "97.7 kcal",
      fat: "3.2 g",
      saturated_fat: "1.5 g",
      carbs: "6 g",
      sugar: "1.2 g",
      protein: "9.5 g",
      salt: "0.6 g"
    },
    tags: ["Kurczak", "Indyjskie", "Keto"],
    diets: ["Keto", "Niskowęglowodanowa"],
    featured: true,
    stock_quantity: 50
  },
  {
    id: 58,
    name: "Krewetki z Harissą i Miodem z Ryżem z Kalafiora i Greckim Jogurtem",
    description: "Pikantne krewetki w sosie harissa z miodem, podawane z ryżem z kalafiora i chłodzącym greckim jogurtem",
    image: "https://ext.same-assets.com/3234956792/1990706172.png",
    price: 35.00,
    category: "Krewetki",
    cook_time: 25,
    servings: 2,
    difficulty: "Średni",
    calories: 420,
    protein: 25,
    carbs: 16,
    fat: 8,
    fiber: 4,
    ingredients: [
      "Krewetki", "Harissa", "Miód", "Kalafior", "Jogurt grecki",
      "Czosnek", "Oliwa z oliwek", "Cytryna", "Pietruszka"
    ],
    allergens: ["Skorupiaki"],
    equipment: ["Patelnia", "Nóż", "Deska do krojenia"],
    instructions: [
      { step: 1, title: "Przygotowanie", description: "Oczyść krewetki i przygotuj kalafior." },
      { step: 2, title: "Sos harissa", description: "Wymieszaj harissę z miodem i oliwą." },
      { step: 3, title: "Smażenie krewetek", description: "Smaż krewetki w sosie harissa 3-4 minuty." },
      { step: 4, title: "Ryż z kalafiora", description: "Przygotuj ryż z kalafiora na parze." },
      { step: 5, title: "Podawanie", description: "Podawaj z jogurtem greckim i pietruszką." }
    ],
    nutrition_per_100g: {
      energy: "105 kcal",
      fat: "4.2 g",
      saturated_fat: "1.1 g",
      carbs: "8 g",
      sugar: "6.2 g",
      protein: "12.5 g",
      salt: "0.8 g"
    },
    tags: ["Krewetki", "Morska", "Keto"],
    diets: ["Keto", "Niskowęglowodanowa"],
    featured: true,
    stock_quantity: 30
  },
  {
    id: 70,
    name: "Świeży łosoś na łóżku cytrynowego risotto z dodatkiem tenderstem i groszku",
    description: "Pieczony łosoś na kremowym cytrynowym risotto z tenderstem broccoli i świeżym groszkiem",
    image: "https://ext.same-assets.com/3234956792/2644930272.png",
    price: 42.00,
    category: "Ryby",
    cook_time: 35,
    servings: 2,
    difficulty: "Trudny",
    calories: 520,
    protein: 30,
    carbs: 24,
    fat: 17,
    fiber: 5,
    ingredients: [
      "Łosoś", "Ryż risotto", "Cytryna", "Tenderstem broccoli",
      "Groszek", "Parmezan", "Białe wino", "Cebula", "Czosnek"
    ],
    allergens: ["Ryby", "Produkty mleczne"],
    equipment: ["Patelnia", "Rondelek", "Nóż", "Deska do krojenia"],
    instructions: [
      { step: 1, title: "Przygotowanie łososia", description: "Przypraw łososia i odstaw na 10 minut." },
      { step: 2, title: "Risotto", description: "Przygotuj risotto dodając bulion po trochu." },
      { step: 3, title: "Pieczenie łososia", description: "Piecz łososia na patelni 4-5 minut z każdej strony." },
      { step: 4, title: "Warzywa", description: "Blanszuj tenderstem i groszek." },
      { step: 5, title: "Finalizacja", description: "Dodaj cytrynę do risotto i podawaj z łososiem." }
    ],
    nutrition_per_100g: {
      energy: "160 kcal",
      fat: "8.5 g",
      saturated_fat: "2.8 g",
      carbs: "12 g",
      sugar: "2.1 g",
      protein: "15.2 g",
      salt: "0.9 g"
    },
    tags: ["Łosoś", "Risotto", "Zdrowa"],
    diets: ["Zdrowa"],
    featured: false,
    stock_quantity: 25
  }
]

// POST /api/migrate-products - Migrate products from OpenCart to Supabase
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { adminKey } = body

    // Simple admin key check - in production use proper authentication
    if (adminKey !== 'smakowalo-migration-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Starting product migration...')

    const results = {
      success: [] as Array<{product: string, id: number}>,
      errors: [] as Array<{product: string, error: string}>,
      total: openCartProducts.length
    }

    // Get categories for mapping
    console.log('📁 Fetching categories from database...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    console.log('✅ Found categories:', categories?.map(c => `${c.name} (ID: ${c.id})`))

    const categoryMap = new Map()
    if (categories) {
      for (const cat of categories) {
        categoryMap.set(cat.name, cat.id)
      }
    }

    console.log('🗺️ Category mapping:', Object.fromEntries(categoryMap))

    // Migrate each product
    console.log(`📦 Migrating ${openCartProducts.length} products...`)

    for (const openCartProduct of openCartProducts) {
      try {
        console.log(`\n🔄 Processing: ${openCartProduct.name}`)
        console.log(`   Category: ${openCartProduct.category}`)

        // Map category name to ID
        const categoryId = categoryMap.get(openCartProduct.category)
        if (!categoryId) {
          console.log(`❌ Category '${openCartProduct.category}' not found in database`)
          results.errors.push({
            product: openCartProduct.name,
            error: `Category '${openCartProduct.category}' not found`
          })
          continue
        }

        console.log(`✅ Mapped to category ID: ${categoryId}`)

        // Generate slug
        const slug = openCartProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        console.log(`   Generated slug: ${slug}`)

        // Check if product already exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('slug', slug)
          .single()

        if (existingProduct) {
          console.log(`⚠️ Product already exists with slug: ${slug}`)
          results.errors.push({
            product: openCartProduct.name,
            error: 'Product already exists'
          })
          continue
        }

        // Prepare product data
        const productData = {
          name: openCartProduct.name,
          slug,
          description: openCartProduct.description,
          image: openCartProduct.image,
          price: openCartProduct.price,
          category_id: categoryId,
          cook_time: openCartProduct.cook_time,
          servings: openCartProduct.servings,
          difficulty: openCartProduct.difficulty,
          calories: openCartProduct.calories,
          protein: openCartProduct.protein,
          carbs: openCartProduct.carbs,
          fat: openCartProduct.fat,
          fiber: openCartProduct.fiber,
          rating: 4.5, // Default rating
          reviews_count: 0,
          ingredients: openCartProduct.ingredients,
          allergens: openCartProduct.allergens,
          equipment: openCartProduct.equipment,
          instructions: openCartProduct.instructions,
          nutrition_per_100g: openCartProduct.nutrition_per_100g,
          tags: openCartProduct.tags,
          diets: openCartProduct.diets,
          featured: openCartProduct.featured,
          stock_quantity: openCartProduct.stock_quantity,
          sku: `SMAKOWALO-${openCartProduct.id}`,
          active: true
        }

        console.log(`   Inserting product...`)

        // Insert product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) {
          console.error(`❌ Error inserting product:`, error)
          results.errors.push({
            product: openCartProduct.name,
            error: error.message
          })
        } else {
          console.log(`✅ Successfully inserted product ID: ${newProduct.id}`)
          results.success.push({
            product: openCartProduct.name,
            id: newProduct.id
          })
        }

      } catch (error) {
        console.error(`❌ Error processing product ${openCartProduct.name}:`, error)
        results.errors.push({
          product: openCartProduct.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log('\n🎉 Migration completed!')
    console.log(`✅ Successful: ${results.success.length}`)
    console.log(`❌ Errors: ${results.errors.length}`)

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${results.success.length} products migrated successfully, ${results.errors.length} errors.`,
      results
    })

  } catch (error) {
    console.error('❌ Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
