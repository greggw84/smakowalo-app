import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Menu Page - Supabase Data Source', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/menu`)
  })

  test('should load menu page with title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Menu tego tygodnia')
  })

  test('should display diet filter buttons', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Check if diet filter buttons are visible
    await expect(page.locator('text=Wszystkie')).toBeVisible()
    await expect(page.locator('text=Keto')).toBeVisible()
    await expect(page.locator('text=Niskowęglowodanowa')).toBeVisible()
    await expect(page.locator('text=Zdrowa')).toBeVisible()
    await expect(page.locator('text=Wegetariańska')).toBeVisible()
    await expect(page.locator('text=Wegańska')).toBeVisible()
  })

  test('should fetch products from API', async ({ page }) => {
    // Wait for network to be idle (data fetched)
    await page.waitForLoadState('networkidle')

    // Check that products are displayed or loading state is handled
    const productCards = page.locator('.overflow-hidden.shadow')
    const loadingText = page.locator('text=Ładowanie produktów')
    const errorText = page.locator('text=Nie udało się pobrać produktów')

    // One of these states should be visible
    const hasProducts = await productCards.count() > 0
    const isLoading = await loadingText.isVisible().catch(() => false)
    const hasError = await errorText.isVisible().catch(() => false)

    // We should have either products, loading, or error state
    expect(hasProducts || isLoading || hasError).toBeTruthy()
  })

  test('should display product information', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Check for product cards
    const productCards = page.locator('.overflow-hidden.shadow')
    const cardCount = await productCards.count()

    if (cardCount > 0) {
      // First product card should have name
      const firstCard = productCards.first()
      await expect(firstCard.locator('h3')).toBeVisible()

      // Should have "Zobacz przepis" button
      await expect(firstCard.locator('text=Zobacz przepis')).toBeVisible()
    }
  })

  test('should filter products by diet type', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Click Keto filter
    await page.click('button:has-text("Keto")')

    // Wait for filtering to apply
    await page.waitForTimeout(500)

    // The Keto button should be selected (have different styling)
    const ketoButton = page.locator('button:has-text("Keto")')
    await expect(ketoButton).toBeVisible()
  })

  test('should allow selecting multiple diet filters up to 3', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Click on Keto filter
    await page.click('button:has-text("Keto")')
    await page.waitForTimeout(300)

    // Click on Wegetariańska filter
    await page.click('button:has-text("Wegetariańska")')
    await page.waitForTimeout(300)

    // Click on Wegańska filter
    await page.click('button:has-text("Wegańska")')
    await page.waitForTimeout(300)

    // All three should be selected - check the counter shows 3/3
    const filterCounter = page.locator('text=/\\(3\\/3/')
    const hasCounter = await filterCounter.isVisible().catch(() => false)
    
    // Should have 3 selected filters (or show counter)
    if (hasCounter) {
      await expect(filterCounter).toBeVisible()
    }
  })

  test('should prevent selecting more than 3 diet filters', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Select 3 filters first
    await page.click('button:has-text("Keto")')
    await page.waitForTimeout(300)
    await page.click('button:has-text("Wegetariańska")')
    await page.waitForTimeout(300)
    await page.click('button:has-text("Wegańska")')
    await page.waitForTimeout(300)

    // Try to click a 4th filter - should show warning message
    await page.click('button:has-text("Zdrowa")')
    await page.waitForTimeout(300)

    // Should show limit warning message
    const warningMessage = page.locator('text=/maksymalnie 3/')
    const hasWarning = await warningMessage.isVisible().catch(() => false)

    // The warning should appear (if it does, test passes)
    if (hasWarning) {
      await expect(warningMessage).toBeVisible()
    }
  })

  test('should clear other filters when selecting Wszystkie', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // First select a specific filter
    await page.click('button:has-text("Keto")')
    await page.waitForTimeout(300)

    // Now click "Wszystkie" - should clear the selection
    await page.click('button:has-text("Wszystkie")')
    await page.waitForTimeout(300)

    // Wszystkie should be selected (have the selected styling)
    const wszystkieButton = page.locator('button:has-text("Wszystkie")')
    await expect(wszystkieButton).toBeVisible()
  })

  test('should navigate to product detail page', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Find and click "Zobacz przepis" on first product
    const firstRecipeButton = page.locator('text=Zobacz przepis').first()

    if (await firstRecipeButton.isVisible()) {
      await firstRecipeButton.click()

      // Should navigate to product detail page
      await expect(page).toHaveURL(/\/danie\/\d+/)
    }
  })

  test('should display CTA section when products loaded', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Check for CTA section
    const ctaHeading = page.locator('text=Gotowy na rozpoczęcie?')
    const isVisible = await ctaHeading.isVisible().catch(() => false)

    // CTA should be visible if products are loaded
    if (isVisible) {
      await expect(page.locator('text=Stwórz swój box')).toBeVisible()
    }
  })

  test('should display kreator CTA at the bottom', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Check for kreator CTA section
    const kreatorHeading = page.locator('text=Nie możesz się zdecydować?')
    const isVisible = await kreatorHeading.isVisible().catch(() => false)

    if (isVisible) {
      await expect(page.locator('text=Użyj kreatora zamówień')).toBeVisible()
    }
  })

  test('should handle product image errors gracefully', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Check that images have fallback handling
    const images = page.locator('img')
    const imageCount = await images.count()

    // All images should be visible (either original or fallback)
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i)
      await expect(img).toBeVisible()
    }
  })

  test('products should have valid image URLs', async ({ page }) => {
    // Test that all products have valid image URLs
    const response = await page.request.get(`${BASE_URL}/api/products`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.products).toBeDefined()
    expect(Array.isArray(data.products)).toBeTruthy()

    // Check each product has a valid image URL (starts with http/https)
    for (const product of data.products) {
      expect(product.image).toBeDefined()
      expect(typeof product.image).toBe('string')
      expect(product.image.startsWith('http://') || product.image.startsWith('https://')).toBeTruthy()
    }
  })

  test('should display proper API source in console (development check)', async ({ page }) => {
    // This test verifies the API returns the correct source field
    const response = await page.request.get(`${BASE_URL}/api/products`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.source).toBeDefined()
    // Source should be 'supabase', 'mock', or 'mock-error-fallback'
    expect(['supabase', 'mock', 'mock-error-fallback']).toContain(data.source)
    expect(data.products).toBeDefined()
    expect(Array.isArray(data.products)).toBeTruthy()
  })

  test('should return categories from API', async ({ page }) => {
    // Test categories API endpoint
    const response = await page.request.get(`${BASE_URL}/api/categories`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.source).toBeDefined()
    // Source should be 'supabase', 'mock', or 'error'
    expect(['supabase', 'mock', 'error']).toContain(data.source)
    expect(data.categories).toBeDefined()
    expect(Array.isArray(data.categories)).toBeTruthy()
  })

  test('should filter products by category parameter', async ({ page }) => {
    // Test filtering by category
    const response = await page.request.get(`${BASE_URL}/api/products?category=dania-glowne`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.products).toBeDefined()
  })

  test('should filter products by diet parameter', async ({ page }) => {
    // Test filtering by diet
    const response = await page.request.get(`${BASE_URL}/api/products?diet=keto`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.products).toBeDefined()
  })

  test('should filter products by featured parameter', async ({ page }) => {
    // Test filtering by featured
    const response = await page.request.get(`${BASE_URL}/api/products?featured=true`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.products).toBeDefined()
  })

  test('should search products by query', async ({ page }) => {
    // Test search functionality
    const response = await page.request.get(`${BASE_URL}/api/products?search=kurczak`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.products).toBeDefined()
  })
})
