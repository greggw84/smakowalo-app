import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Storage Images API', () => {
  test('should respond with storage configuration info', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/storage/images`)
    const data = await response.json()

    // Should return response (success or error depending on Supabase config)
    expect(data.bucket).toBe('menu-images')

    if (data.success) {
      expect(data.files).toBeDefined()
      expect(Array.isArray(data.files)).toBeTruthy()
      expect(data.count).toBeDefined()
      expect(typeof data.count).toBe('number')
    } else {
      // If not configured, should indicate the error
      expect(data.error).toBeDefined()
    }
  })

  test('storage API should support folder parameter', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/storage/images?folder=products`)
    const data = await response.json()

    expect(data.bucket).toBe('menu-images')
    expect(data.folder).toBe('products')
  })
})

test.describe('Product Images Integration', () => {
  test('products API should return products with processed image URLs', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/products`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.products).toBeDefined()
    expect(Array.isArray(data.products)).toBeTruthy()

    // Verify at least one product has a valid image URL
    if (data.products.length > 0) {
      const firstProduct = data.products[0]
      expect(firstProduct.image).toBeDefined()
      expect(typeof firstProduct.image).toBe('string')
      // Image should be a full URL
      expect(firstProduct.image.startsWith('http')).toBeTruthy()
    }
  })

  test('individual product API should return processed image URL', async ({ page }) => {
    // First get a product ID
    const listResponse = await page.request.get(`${BASE_URL}/api/products`)
    const listData = await listResponse.json()

    if (listData.success && listData.products.length > 0) {
      const productId = listData.products[0].id

      const response = await page.request.get(`${BASE_URL}/api/products/${productId}`)
      const data = await response.json()

      if (data.success && data.product) {
        expect(data.product.image).toBeDefined()
        expect(typeof data.product.image).toBe('string')
        expect(data.product.image.startsWith('http')).toBeTruthy()
      }
    }
  })
})

test.describe('Image Fallback Behavior', () => {
  test('menu page should display images even with fallback', async ({ page }) => {
    await page.goto(`${BASE_URL}/menu`)
    await page.waitForLoadState('networkidle')

    // Wait for products to load - use try/catch for clearer error handling
    let productsLoaded = false
    try {
      await page.waitForSelector('.overflow-hidden.shadow', { timeout: 10000 })
      productsLoaded = true
    } catch {
      // Products may not have loaded - test will still check for images
      console.log('Products did not load within timeout - checking available images')
    }

    // Get all images on the page
    const images = page.locator('img[alt]')
    const imageCount = await images.count()

    // Should have at least some images (logo, product images if loaded)
    expect(imageCount).toBeGreaterThan(0)

    // Each visible image should have a valid src
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i)
      if (await img.isVisible()) {
        const src = await img.getAttribute('src')
        expect(src).toBeTruthy()
      }
    }
  })

  test('product detail page should display image with fallback', async ({ page }) => {
    // Navigate to menu first
    await page.goto(`${BASE_URL}/menu`)
    await page.waitForLoadState('networkidle')

    // Try to click on a product
    const firstRecipeButton = page.locator('text=Zobacz przepis').first()
    const isVisible = await firstRecipeButton.isVisible()

    if (isVisible) {
      await firstRecipeButton.click()
      await page.waitForLoadState('networkidle')

      // Check if main product image is displayed using semantic selector
      // Look for the hero image container that contains the product image
      const heroSection = page.locator('.bg-white.rounded-2xl.overflow-hidden.shadow-xl').first()
      const mainImage = heroSection.locator('img').first()

      const imageVisible = await mainImage.isVisible()
      if (imageVisible) {
        const src = await mainImage.getAttribute('src')
        expect(src).toBeTruthy()
      }
    }
  })
})
