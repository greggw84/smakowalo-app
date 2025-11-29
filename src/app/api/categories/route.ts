import { type NextRequest, NextResponse } from 'next/server'
import { fetchSupabaseCategories, isSupabaseConfigured } from '@/lib/supabase-menu'

const hasSupabase = isSupabaseConfigured()

// Fallback categories (used when Supabase is not configured or fails)
const fallbackCategories = [
  { id: 1, name: 'Dania główne', slug: 'dania-glowne', description: null, image: null, active: true },
  { id: 2, name: 'Sałatki', slug: 'salatki', description: null, image: null, active: true },
  { id: 3, name: 'Dania wegańskie', slug: 'dania-weganskie', description: null, image: null, active: true },
  { id: 4, name: 'Wrapy', slug: 'wrapy', description: null, image: null, active: true },
  { id: 5, name: 'Zupy', slug: 'zupy', description: null, image: null, active: true },
  { id: 6, name: 'Desery', slug: 'desery', description: null, image: null, active: true },
]

export async function GET(request: NextRequest) {
  try {
    // Try Supabase first if configured
    if (hasSupabase) {
      try {
        console.log('🔍 Fetching categories from Supabase...')
        const categories = await fetchSupabaseCategories()

        if (categories.length > 0) {
          console.log(`✅ Returning ${categories.length} categories from Supabase`)
          return NextResponse.json({ success: true, categories, source: 'supabase' })
        }

        console.log('⚠️ No categories found in Supabase, falling back to mock data')
      } catch (supabaseError) {
        console.error('❌ Supabase categories fetch failed:', supabaseError)
        // Fall through to mock data
      }
    }

    // Fallback to mock categories
    return NextResponse.json({ success: true, categories: fallbackCategories, source: 'mock' })
  } catch (e) {
    console.error('Categories API error', e)
    return NextResponse.json({ success: true, categories: fallbackCategories, source: 'error' })
  }
}
