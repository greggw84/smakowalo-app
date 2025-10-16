import type { NextRequest } from 'next/server'

interface OpenCartProductApi {
  product_id: string
  name: string
  description: string
  image: string
  price: string | number
  quantity?: number
  category_id?: number
}

export interface OpenCartProduct {
  id: number
  name: string
  description: string
  image: string
  price: number
  stock?: number
  category_id?: number
}

const OPENCART_URL = process.env.OPENCART_URL || ''
const OPENCART_API_USERNAME = process.env.OPENCART_API_USERNAME || ''
const OPENCART_API_PASSWORD = process.env.OPENCART_API_PASSWORD || ''
const OPENCART_API_TOKEN = process.env.OPENCART_API_TOKEN || ''

// Cache for session token
let sessionToken: string | null = null
let sessionExpiry = 0

// Login to OpenCart and get session token
async function login(): Promise<string | null> {
  // If we already have a valid session token, return it
  if (sessionToken && Date.now() < sessionExpiry) {
    return sessionToken
  }

  if (!OPENCART_URL || !OPENCART_API_USERNAME || !OPENCART_API_PASSWORD) {
    console.error('OpenCart credentials not configured')
    return null
  }

  try {
    // Try to login via OpenCart API
    const loginUrl = `${OPENCART_URL}/index.php?route=api/login`

    const formData = new URLSearchParams()
    formData.append('username', OPENCART_API_USERNAME)
    formData.append('key', OPENCART_API_PASSWORD)

    console.log('🔐 Attempting OpenCart login to:', loginUrl)

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    })

    const responseText = await response.text()
    console.log('📥 OpenCart login response:', responseText)

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('❌ Failed to parse OpenCart response as JSON:', responseText)
      return null
    }

    // Check different response formats
    if (data.success && data.api_token) {
      sessionToken = data.api_token
      sessionExpiry = Date.now() + (60 * 60 * 1000)
      console.log('✅ OpenCart login successful (token method)')
      return sessionToken
    }

    // OpenCart might return session ID differently
    if (data.token || data.session_id) {
      sessionToken = data.token || data.session_id
      sessionExpiry = Date.now() + (60 * 60 * 1000)
      console.log('✅ OpenCart login successful (session method)')
      return sessionToken
    }

    // Empty array [] means auth failed or endpoint doesn't exist
    console.error('❌ OpenCart login failed. Response:', data)
    console.error('   This might mean:')
    console.error('   1. API is disabled in OpenCart settings')
    console.error('   2. Wrong username/password')
    console.error('   3. OpenCart API endpoint format is different')
    return null
  } catch (error) {
    console.error('❌ OpenCart login error:', error)
    return null
  }
}

function buildApiUrl(route: string, token?: string): string {
  const base = OPENCART_URL.endsWith('/') ? OPENCART_URL.slice(0, -1) : OPENCART_URL
  const separator = route.includes('?') ? '&' : '?'
  const tokenParam = token ? `${separator}api_token=${token}` : ''
  return `${base}/index.php?route=${route}${tokenParam}`
}

async function apiGet<T>(route: string): Promise<T> {
  if (!OPENCART_URL) {
    throw new Error('OpenCart URL is not configured')
  }

  // Get session token
  const token = await login()
  if (!token) {
    throw new Error('Failed to authenticate with OpenCart')
  }

  const url = buildApiUrl(route, token)
  console.log('📡 Fetching from OpenCart:', route)

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('❌ OpenCart API error:', res.status, text)
    throw new Error(`OpenCart API error: ${res.status}`)
  }

  const data = await res.json()
  return data as T
}

function toImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  const base = OPENCART_URL.endsWith('/') ? OPENCART_URL.slice(0, -1) : OPENCART_URL
  // Remove leading slash if present
  const cleanPath = imagePath.replace(/^\//, '')
  return `${base}/image/${cleanPath}`
}

export async function fetchOpenCartProducts(): Promise<OpenCartProduct[]> {
  // Try different product list endpoints
  const endpoints = [
    'api/product', // Default OpenCart REST API
    'rest/products',
    'api/rest/product',
  ]

  let lastError: any

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Trying OpenCart endpoint: ${endpoint}`)
      const data = await apiGet<any>(endpoint)

      // Handle different response formats
      let productsList = data.products || data.data || []

      // If response is an object with product objects as values
      if (typeof productsList === 'object' && !Array.isArray(productsList)) {
        productsList = Object.values(productsList)
      }

      if (!Array.isArray(productsList) || productsList.length === 0) {
        console.warn(`⚠️ No products found at ${endpoint}`)
        continue
      }

      console.log(`✅ Found ${productsList.length} products from ${endpoint}`)

      // Map to our product format
      return productsList.map((p: any) => {
        const imagePath = p.thumb || p.image || ''
        const imageUrl = toImageUrl(imagePath)

        console.log(`📷 Product ${p.product_id}: ${p.name}`)
        console.log(`   Image path: ${imagePath}`)
        console.log(`   Image URL: ${imageUrl}`)

        return {
          id: Number(p.product_id || p.id),
          name: p.name || '',
          description: p.description || '',
          image: imageUrl,
          price: typeof p.price === 'string' ? Number.parseFloat(p.price.replace(/[^0-9.]/g, '')) : (Number(p.price) || 0),
          stock: p.quantity || p.stock_quantity || 0,
          category_id: p.category_id ? Number(p.category_id) : undefined,
        }
      })
    } catch (e) {
      console.error(`❌ Error fetching from ${endpoint}:`, e)
      lastError = e
      continue
    }
  }

  throw lastError || new Error('No products endpoint available')
}

export async function fetchOpenCartProductById(id: number): Promise<OpenCartProduct | null> {
  const endpoints = [
    `api/product&product_id=${id}`,
    `api/product/${id}`,
    `rest/product/${id}`,
  ]

  for (const endpoint of endpoints) {
    try {
      const data = await apiGet<any>(endpoint)
      const p = data.product || data.data || data

      if (!p || !p.product_id) {
        continue
      }

      return {
        id: Number(p.product_id || p.id),
        name: p.name || '',
        description: p.description || '',
        image: toImageUrl(p.image || p.thumb || ''),
        price: typeof p.price === 'string' ? Number.parseFloat(p.price.replace(/[^0-9.]/g, '')) : (Number(p.price) || 0),
        stock: p.quantity || p.stock_quantity || 0,
        category_id: p.category_id ? Number(p.category_id) : undefined,
      }
    } catch (e) {
      console.error(`❌ Error fetching product ${id} from ${endpoint}:`, e)
      continue
    }
  }

  return null
}

export async function fetchOpenCartCategories() {
  const endpoints = [
    'api/category',
    'rest/categories',
  ]

  for (const endpoint of endpoints) {
    try {
      const data = await apiGet<any>(endpoint)
      let categoriesList = data.categories || data.data || []

      // If response is an object with category objects as values
      if (typeof categoriesList === 'object' && !Array.isArray(categoriesList)) {
        categoriesList = Object.values(categoriesList)
      }

      if (!Array.isArray(categoriesList) || categoriesList.length === 0) {
        continue
      }

      return categoriesList.map((c: any) => ({
        id: Number(c.category_id || c.id),
        name: c.name || '',
        slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-') || '',
        description: c.description || null,
        image: c.image ? toImageUrl(c.image) : null,
        active: c.status !== 0,
      }))
    } catch (e) {
      console.error(`❌ Error fetching categories from ${endpoint}:`, e)
      continue
    }
  }

  return []
}

export async function fetchOpenCartStockMap(): Promise<Record<number, number>> {
  // For now, return empty map as stock is included in product data
  return {}
}
