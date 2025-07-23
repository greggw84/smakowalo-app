import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Category = Database['public']['Tables']['categories']['Row']

// OpenCart category interface
interface OpenCartCategory {
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: number;
}

// Mock data for when Supabase is not configured
const mockCategories = [
  {
    id: 1,
    name: "Kurczak",
    slug: "kurczak",
    description: "Dania z kurczakiem",
    image: "https://ext.same-assets.com/817389662/206723592.jpeg",
    active: true,
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z"
  },
  {
    id: 2,
    name: "Krewetki",
    slug: "krewetki",
    description: "Dania z krewetkami",
    image: "https://ext.same-assets.com/817389662/2623479817.jpeg",
    active: true,
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z"
  },
  {
    id: 3,
    name: "Ryby",
    slug: "ryby",
    description: "Dania z rybami",
    image: "https://ext.same-assets.com/290874832/189435024.jpeg",
    active: true,
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z"
  },
  {
    id: 4,
    name: "Wegetariańskie",
    slug: "wegetarianskie",
    description: "Dania wegetariańskie",
    image: "https://ext.same-assets.com/290874832/1351291427.jpeg",
    active: true,
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z"
  },
  {
    id: 5,
    name: "Wegańskie",
    slug: "weganskie",
    description: "Dania wegańskie",
    image: "https://ext.same-assets.com/290874832/189435024.jpeg",
    active: true,
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z"
  }
]

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const opencartUrl = process.env.OPENCART_URL
    if (opencartUrl) {
      const ocRes = await fetch(`${opencartUrl}/api/categories`)
      if (ocRes.ok) {
        const ocData = await ocRes.json()
        const categories = ocData.categories.map((c: OpenCartCategory) => ({
          id: c.category_id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image || null,
          active: c.status === 1
        }))
        return NextResponse.json({ success: true, categories, total: categories.length, source: 'opencart' })
      }
    }

    const supabase = createSupabaseClient()

    if (!supabase) {
      console.log('❌ Supabase not configured, returning mock categories')

      return NextResponse.json({
        success: true,
        categories: mockCategories,
        total: mockCategories.length,
        source: 'mock'
      })
    }

    console.log('✅ Using Supabase for categories data')

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Supabase categories query error:', error)
      throw error
    }

    console.log(`✅ Retrieved ${categories?.length || 0} categories from Supabase`)

    return NextResponse.json({ success: true, categories: categories || [], total: categories?.length || 0 })

  } catch (error) {
    console.error('❌ Categories API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
