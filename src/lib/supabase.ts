import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Debug logging
console.log('Supabase Config Debug:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValid: supabaseUrl.startsWith('https://') && !supabaseUrl.includes('placeholder'),
  keyValid: supabaseAnonKey.length > 50 && !supabaseAnonKey.includes('placeholder'),
  url: supabaseUrl.substring(0, 30) + '...',
  keyLength: supabaseAnonKey.length
})

// Client-side Supabase client
export const createSupabaseClient = () => {
  // Simplified validation
  if (supabaseUrl.startsWith('https://') &&
      !supabaseUrl.includes('placeholder') &&
      supabaseAnonKey.length > 50 &&
      !supabaseAnonKey.includes('placeholder')) {
    try {
      console.log('✅ Creating Supabase client with valid config')
      return createClient(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error('❌ Supabase client creation failed:', error)
      return null
    }
  }

  console.log('❌ Supabase not configured properly:', {
    urlOk: supabaseUrl.startsWith('https://') && !supabaseUrl.includes('placeholder'),
    keyOk: supabaseAnonKey.length > 50 && !supabaseAnonKey.includes('placeholder')
  })
  return null
}

// Component client (for client components)
export const createSupabaseComponentClient = () => {
  if (supabaseUrl.startsWith('https://') &&
      !supabaseUrl.includes('placeholder') &&
      supabaseAnonKey.length > 50 &&
      !supabaseAnonKey.includes('placeholder')) {
    try {
      console.log('✅ Creating Supabase component client')
      return createClientComponentClient()
    } catch (error) {
      console.error('❌ Supabase component client creation failed:', error)
      return null
    }
  }

  console.log('❌ Supabase not configured properly for components')
  return null
}

// Main client instance
export const supabase = createSupabaseClient()

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          newsletter_subscribed: boolean
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          newsletter_subscribed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          newsletter_subscribed?: boolean
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          image: string | null
          created_at: string
          updated_at: string
          active: boolean
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
          active?: boolean
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
          active?: boolean
        }
      }
      products: {
        Row: {
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
        Insert: {
          id?: number
          name: string
          slug: string
          description: string
          image: string
          price: number
          old_price?: number | null
          category_id: number
          cook_time: number
          servings: number
          difficulty: string
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber: number
          rating?: number
          reviews_count?: number
          ingredients: string[]
          allergens: string[]
          equipment?: string[] | null
          instructions: Array<{
            step: number
            title?: string
            description: string
          }>
          nutrition_per_100g?: {
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
          active?: boolean
          featured?: boolean
          stock_quantity?: number
          sku?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string
          image?: string
          price?: number
          old_price?: number | null
          category_id?: number
          cook_time?: number
          servings?: number
          difficulty?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number
          rating?: number
          reviews_count?: number
          ingredients?: string[]
          allergens?: string[]
          equipment?: string[] | null
          instructions?: Array<{
            step: number
            title?: string
            description: string
          }>
          nutrition_per_100g?: {
            energy: string
            fat: string
            saturated_fat: string
            carbs: string
            sugar: string
            protein: string
            salt: string
          } | null
          tags?: string[]
          diets?: string[]
          active?: boolean
          featured?: boolean
          stock_quantity?: number
          sku?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          user_id: string
          status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          currency: string
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          payment_intent_id: string | null
          delivery_date: string | null
          delivery_address: {
            name: string
            street: string
            city: string
            postal_code: string
            phone: string
            notes?: string
          }
          billing_address: {
            name: string
            street: string
            city: string
            postal_code: string
            phone: string
          } | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          currency?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          payment_intent_id?: string | null
          delivery_date?: string | null
          delivery_address: {
            name: string
            street: string
            city: string
            postal_code: string
            phone: string
            notes?: string
          }
          billing_address?: {
            name: string
            street: string
            city: string
            postal_code: string
            phone: string
          } | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          currency?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          payment_intent_id?: string | null
          delivery_date?: string | null
          delivery_address?: {
            name: string
            street: string
            city: string
            postal_code: string
            phone: string
            notes?: string
          }
          billing_address?: {
            name: string
            street: string
            city: string
            postal_code: string
            phone: string
          } | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number
          quantity: number
          unit_price: number
          total_price: number
          selected_meals: string[]
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          product_id: number
          quantity: number
          unit_price: number
          total_price: number
          selected_meals: string[]
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number
          quantity?: number
          unit_price?: number
          total_price?: number
          selected_meals?: string[]
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          product_id: number
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          verified_purchase: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          product_id: number
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          verified_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          user_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          verified_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: number
          user_id: string
          product_id: number
          quantity: number
          selected_meals: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          quantity: number
          selected_meals: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          quantity?: number
          selected_meals?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
