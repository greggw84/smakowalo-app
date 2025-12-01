import { createSupabaseClient } from './supabase'

// Product type matching Supabase schema
export interface SupabaseProduct {
  id: number
  name: string
  slug: string
  description: string
  image: string
  price: number
  old_price: number | null
  category_id: number
  cook_time: number
  servings: number
  difficulty: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  rating: number
  reviews_count: number
  ingredients: string[]
  allergens: string[]
  equipment: string[] | null
  instructions: Array<{
    step: number
    title?: string
    description: string
  }>
  nutrition_per_100g: {
    energy: string
    fat: string
    saturated_fat: string
    carbs: string
    sugar: string
    protein: string
    salt: string
  } | null
  tags: string[]
  diets: string[]
  active: boolean
  featured: boolean
  stock_quantity: number
  sku: string | null
  created_at: string
  updated_at: string
}

// Category type matching Supabase schema
export interface SupabaseCategory {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  active: boolean
  created_at: string
  updated_at: string
}

// Menu product type for frontend (includes category info)
export interface MenuProduct extends SupabaseProduct {
  categories?: {
    name: string
    slug: string
  }
}

// Filter options for fetching products
export interface ProductFilterOptions {
  category?: string
  diet?: string
  search?: string
  featured?: boolean
}

/**
 * Fetch products from Supabase database
 */
export async function fetchSupabaseProducts(
  filters?: ProductFilterOptions
): Promise<MenuProduct[]> {
  const supabase = createSupabaseClient()

  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  try {
    console.log('[supabase-menu] fetching products with filters:', filters)

    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)

    if (filters?.featured) {
      query = query.eq('featured', true)
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('[supabase-menu] ❌ Supabase products fetch error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log('[supabase-menu] ⚠️ No products found in Supabase')
      return []
    }

    console.log(
      `[supabase-menu] ✅ Fetched ${data.length} products from Supabase`
    )

    let products = data as MenuProduct[]

    if (filters?.category) {
      products = products.filter(
        (p) =>
          p.categories?.slug === filters.category ||
          String(p.category_id) === filters.category
      )
    }

    if (filters?.diet && filters.diet !== 'all') {
      products = products.filter((p) => p.diets?.includes(filters.diet as string))
    }

    return products
  } catch (error) {
    console.error(
      '[supabase-menu] ❌ Error fetching products from Supabase:',
      error
    )
    throw error
  }
}

/**
 * Fetch a single product by ID from Supabase
 */
export async function fetchSupabaseProductById(
  id: number
): Promise<MenuProduct | null> {
  const supabase = createSupabaseClient()

  if (!supabase) {
    throw new Error('Supabase client not configured')
  }

  try {
    const { data, error } = await supabase
      .from('products')
     .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('❌ Supabase product fetch error:', error)
      throw error
    }

    return data as MenuProduct
  } catch (error) {
    console.error(`❌ Error fetching product ${id} from Supabase:`, error)
    throw error
  }
}

/**
 * Fetch categories from Supabase database
 */


/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return (
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey.length > 50 &&
    !supabaseAnonKey.includes('placeholder')
  )
}
