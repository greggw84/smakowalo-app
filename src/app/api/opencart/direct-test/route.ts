import { NextResponse } from 'next/server'

export async function GET() {
  const OPENCART_URL = process.env.OPENCART_URL || ''
  const OPENCART_API_USERNAME = process.env.OPENCART_API_USERNAME || ''
  const OPENCART_API_PASSWORD = process.env.OPENCART_API_PASSWORD || ''

  console.log('🧪 Direct OpenCart API Test')
  console.log('URL:', OPENCART_URL)
  console.log('Has Username:', !!OPENCART_API_USERNAME)
  console.log('Has Password:', !!OPENCART_API_PASSWORD)

  if (!OPENCART_URL || !OPENCART_API_USERNAME || !OPENCART_API_PASSWORD) {
    return NextResponse.json({
      success: false,
      error: 'Missing OpenCart credentials',
      config: {
        url: !!OPENCART_URL,
        username: !!OPENCART_API_USERNAME,
        password: !!OPENCART_API_PASSWORD
      }
    }, { status: 500 })
  }

  try {
    // Step 1: Login
    console.log('📡 Logging in to OpenCart...')
    const loginUrl = `${OPENCART_URL}/index.php?route=api/login`

    const formData = new URLSearchParams()
    formData.append('username', OPENCART_API_USERNAME)
    formData.append('key', OPENCART_API_PASSWORD)

    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    })

    const loginData = await loginResponse.json()
    console.log('📥 Login response:', JSON.stringify(loginData, null, 2))

    if (!loginData.success || !loginData.api_token) {
      return NextResponse.json({
        success: false,
        error: 'Login failed',
        response: loginData
      }, { status: 500 })
    }

    const token = loginData.api_token
    console.log('✅ Got token:', token.substring(0, 20) + '...')

    // Step 2: Fetch products
    console.log('📡 Fetching products...')
    const productsUrl = `${OPENCART_URL}/index.php?route=api/product&api_token=${token}`

    const productsResponse = await fetch(productsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })

    const productsData = await productsResponse.json()
    console.log('📥 Products response structure:', Object.keys(productsData))

    // Extract products array
    let productsList = productsData.products || productsData.data || []
    if (typeof productsList === 'object' && !Array.isArray(productsList)) {
      productsList = Object.values(productsList)
    }

    console.log(`✅ Found ${productsList.length} products`)

    // Show first product details
    const firstProduct = productsList[0]
    console.log('📦 First product:', JSON.stringify(firstProduct, null, 2))

    return NextResponse.json({
      success: true,
      login: {
        status: loginData.success,
        has_token: !!token
      },
      products: {
        count: productsList.length,
        sample: productsList.slice(0, 3).map((p: any) => ({
          id: p.product_id || p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          thumb: p.thumb,
          image_fields: Object.keys(p).filter(k => k.toLowerCase().includes('image'))
        }))
      },
      raw_first_product: firstProduct
    })

  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
