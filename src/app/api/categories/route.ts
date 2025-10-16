import { type NextRequest, NextResponse } from 'next/server'
import { fetchOpenCartCategories } from '@/lib/opencart'

const hasOpenCart = !!(process.env.OPENCART_URL && process.env.OPENCART_API_TOKEN)

export async function GET(request: NextRequest) {
  try {
    if (hasOpenCart) {
      const categories = await fetchOpenCartCategories()
      return NextResponse.json({ success: true, categories, source: 'opencart' })
    }

    // Fallback mock categories
    const categories = [
      { id: 1, name: 'Dania główne', slug: 'dania-glowne', description: null, image: null, active: true },
      { id: 2, name: 'Sałatki', slug: 'salatki', description: null, image: null, active: true },
      { id: 3, name: 'Dania wegańskie', slug: 'dania-weganskie', description: null, image: null, active: true },
      { id: 4, name: 'Wrapy', slug: 'wrapy', description: null, image: null, active: true },
      { id: 5, name: 'Zupy', slug: 'zupy', description: null, image: null, active: true },
      { id: 6, name: 'Desery', slug: 'desery', description: null, image: null, active: true },
    ]

    return NextResponse.json({ success: true, categories, source: 'mock' })
  } catch (e) {
    console.error('Categories API error', e)
    return NextResponse.json({ success: true, categories: [], source: 'error' })
  }
}
