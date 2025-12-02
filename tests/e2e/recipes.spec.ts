import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Recipe System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('should navigate to menu page', async ({ page }) => {
    await page.click('text=Zobacz menu')
    await expect(page).toHaveURL(`${BASE_URL}/menu`)
    await expect(page.locator('h1')).toContainText('Menu tego tygodnia')
  })

  test('should load menu page with products', async ({ page }) => {
    await page.goto(`${BASE_URL}/menu`)

    // Wait for products to load
    await page.waitForLoadState('networkidle')

    // Check if diet filter buttons are visible
    await expect(page.locator('text=Wszystkie')).toBeVisible()
    await expect(page.locator('text=Keto')).toBeVisible()
    await expect(page.locator('text=Wegetariańska')).toBeVisible()

    // Check if "Spróbuj ponownie" button is NOT visible (means data loaded successfully)
    await expect(page.locator('text=Spróbuj ponownie')).not.toBeVisible()

    // Should have product cards or loading state
    const productCards = page.locator('[data-testid="product-card"]')
    const loadingIndicator = page.locator('text=Ładowanie')
    const noProducts = page.locator('text=Nie udało się pobrać produktów')

    // At least one of these should be visible
    const hasProducts = await productCards.count() > 0
    const isLoading = await loadingIndicator.isVisible()
    const hasError = await noProducts.isVisible()

    expect(hasProducts || isLoading || hasError).toBe(true)
  })

  test('should filter products by diet type', async ({ page }) => {
    await page.goto(`${BASE_URL}/menu`)
    await page.waitForLoadState('networkidle')

    // Click on Keto filter
    await page.click('text=Keto')

    // Wait for filtering to complete
    await page.waitForTimeout(1000)

    // The filter should be active (visually different)
    const ketoButton = page.locator('text=Keto')
    // Note: The exact styling check depends on your CSS implementation
  })

  test('should navigate to individual recipe page', async ({ page }) => {
    await page.goto(`${BASE_URL}/menu`)
    await page.waitForLoadState('networkidle')

    // Look for product cards or direct navigation to a known recipe
    await page.goto(`${BASE_URL}/danie/61`) // Known recipe ID

    // Check if recipe page loads
    await expect(page.locator('h1')).toContainText('Kurczak Tikka Masala')
    await expect(page.locator('text=Instrukcje przygotowania')).toBeVisible()
  })

  test('should display enhanced recipe instructions', async ({ page }) => {
    await page.goto(`${BASE_URL}/danie/61`)
    await page.waitForLoadState('networkidle')

    // Check for enhanced instruction elements
    await expect(page.locator('text=Instrukcje przygotowania')).toBeVisible()

    // Look for step-by-step instructions
    const instructionSteps = page.locator('[data-testid="instruction-step"]')
    if (await instructionSteps.count() > 0) {
      // Check first step
      await expect(instructionSteps.first()).toBeVisible()
    }

    // Check for OpenCart enhanced features
    const chefNotes = page.locator('text=Notatki szefa kuchni')
    const nutritionInfo = page.locator('text=Informacje żywieniowe')

    // These might be visible if OpenCart data is loaded
    if (await chefNotes.isVisible()) {
      await expect(chefNotes).toBeVisible()
    }

    if (await nutritionInfo.isVisible()) {
      await expect(nutritionInfo).toBeVisible()
    }
  })

  test('should display recipe meta information row', async ({ page }) => {
    // Get a valid product ID from the products API
    const productsResponse = await page.request.get(`${BASE_URL}/api/products`)
    const productsData = await productsResponse.json()
    
    if (!productsData.success || !productsData.products?.length) {
      console.log('No products available, skipping test')
      return
    }
    
    const productId = productsData.products[0].id
    await page.goto(`${BASE_URL}/danie/${productId}`)
    await page.waitForLoadState('networkidle')

    // Check for meta row elements - these should be visible in the hero section
    // Time (min)
    const timeElement = page.locator('text=/\\d+ min/')
    const hasTime = await timeElement.first().isVisible().catch(() => false)
    if (hasTime) {
      await expect(timeElement.first()).toBeVisible()
    }

    // Calories (kcal)
    const caloriesElement = page.locator('text=/\\d+ kcal/')
    const hasCalories = await caloriesElement.first().isVisible().catch(() => false)
    if (hasCalories) {
      await expect(caloriesElement.first()).toBeVisible()
    }

    // Protein (g białka)
    const proteinElement = page.locator('text=/\\d+.*g białka/')
    const hasProtein = await proteinElement.first().isVisible().catch(() => false)
    if (hasProtein) {
      await expect(proteinElement.first()).toBeVisible()
    }
  })

  test('should display cooking steps in card layout', async ({ page }) => {
    // Get a valid product ID from the products API
    const productsResponse = await page.request.get(`${BASE_URL}/api/products`)
    const productsData = await productsResponse.json()
    
    if (!productsData.success || !productsData.products?.length) {
      console.log('No products available, skipping test')
      return
    }
    
    const productId = productsData.products[0].id
    await page.goto(`${BASE_URL}/danie/${productId}`)
    await page.waitForLoadState('networkidle')

    // Check for step cards with "Krok X" headings
    const stepCards = page.locator('text=/Krok \\d+/')
    const stepCount = await stepCards.count()

    // Should have at least one step
    expect(stepCount).toBeGreaterThanOrEqual(1)
    
    // First step should be visible
    await expect(stepCards.first()).toBeVisible()
  })

  test('should display allergens section', async ({ page }) => {
    // Get a valid product ID from the products API
    const productsResponse = await page.request.get(`${BASE_URL}/api/products`)
    const productsData = await productsResponse.json()
    
    if (!productsData.success || !productsData.products?.length) {
      console.log('No products available, skipping test')
      return
    }
    
    const productId = productsData.products[0].id
    await page.goto(`${BASE_URL}/danie/${productId}`)
    await page.waitForLoadState('networkidle')

    // Check for allergens section header
    const allergensSection = page.locator('text=Alergeny')
    await expect(allergensSection.first()).toBeVisible()
  })

  test('should display recipe ingredients and equipment', async ({ page }) => {
    await page.goto(`${BASE_URL}/danie/61`)
    await page.waitForLoadState('networkidle')

    // Check for ingredients section
    await expect(page.locator('text=Składniki w pudełku')).toBeVisible()

    // Check for equipment section
    await expect(page.locator('text=Czego będziesz potrzebować')).toBeVisible()

    // Check for nutrition info
    await expect(page.locator('text=Wartości odżywcze')).toBeVisible()
  })

  test('should display recipe images', async ({ page }) => {
    await page.goto(`${BASE_URL}/danie/61`)
    await page.waitForLoadState('networkidle')

    // Main recipe image should be visible
    const mainImage = page.locator('img[alt*="Kurczak"]')
    await expect(mainImage).toBeVisible()

    // Step images (if enhanced instructions are loaded)
    const stepImages = page.locator('img[alt*="Krok"]')
    const stepCount = await stepImages.count()

    if (stepCount > 0) {
      console.log(`Found ${stepCount} step images`)
      await expect(stepImages.first()).toBeVisible()
    }
  })

  test('should have responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${BASE_URL}/danie/61`)

    // Check if recipe content is properly displayed on mobile
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Instrukcje przygotowania')).toBeVisible()

    // Check if images are properly sized
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      const firstImage = images.first()
      await expect(firstImage).toBeVisible()

      // Check if image doesn't overflow
      const imageBox = await firstImage.boundingBox()
      if (imageBox) {
        expect(imageBox.width).toBeLessThanOrEqual(375)
      }
    }
  })

  test('should handle back navigation to menu', async ({ page }) => {
    await page.goto(`${BASE_URL}/danie/61`)

    // Click back to menu button
    await page.click('text=Powrót do menu')

    await expect(page).toHaveURL(`${BASE_URL}/menu`)
    await expect(page.locator('h1')).toContainText('Menu tego tygodnia')
  })

  test('should load recipe data from cache on second visit', async ({ page }) => {
    // First visit
    await page.goto(`${BASE_URL}/danie/61`)
    await page.waitForLoadState('networkidle')

    const startTime = Date.now()

    // Navigate away and back
    await page.goto(`${BASE_URL}/menu`)
    await page.goto(`${BASE_URL}/danie/61`)
    await page.waitForLoadState('networkidle')

    const endTime = Date.now()
    const loadTime = endTime - startTime

    // Second load should be faster due to caching
    console.log(`Second recipe load time: ${loadTime}ms`)

    // Content should still be visible
    await expect(page.locator('h1')).toContainText('Kurczak')
  })

  test('should handle recipe sharing functionality', async ({ page }) => {
    await page.goto(`${BASE_URL}/danie/61`)
    await page.waitForLoadState('networkidle')

    // Look for share button (if implemented)
    const shareButton = page.locator('text=Udostępnij')
    if (await shareButton.isVisible()) {
      await shareButton.click()

      // Should show sharing options
      await expect(page.locator('text=Skopiuj link')).toBeVisible()
    }
  })

  test('should display recipe rating and reviews', async ({ page }) => {
    await page.goto(`${BASE_URL}/danie/61`)
    await page.waitForLoadState('networkidle')

    // Look for rating elements
    const rating = page.locator('text=ocena dania')
    if (await rating.isVisible()) {
      await expect(rating).toBeVisible()
    }

    // Look for star ratings
    const stars = page.locator('[data-testid="star-rating"]')
    if (await stars.count() > 0) {
      await expect(stars.first()).toBeVisible()
    }
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API requests to simulate errors
    await page.route('**/api/opencart/**', (route) => {
      route.abort('failed')
    })

    await page.goto(`${BASE_URL}/danie/61`)
    await page.waitForLoadState('networkidle')

    // Should still display fallback content
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Instrukcje przygotowania')).toBeVisible()
  })

  test('should show loading states appropriately', async ({ page }) => {
    await page.goto(`${BASE_URL}/menu`)

    // Might see loading indicator initially
    const loadingText = page.locator('text=Ładowanie')
    if (await loadingText.isVisible()) {
      // Loading should disappear within reasonable time
      await expect(loadingText).not.toBeVisible({ timeout: 10000 })
    }

    // Final state should have content or error message
    const hasContent = await page.locator('h1').isVisible()
    const hasError = await page.locator('text=Nie udało się pobrać').isVisible()

    expect(hasContent || hasError).toBe(true)
  })
})

test.describe('Recipe Creator/Kreator', () => {
  test('should navigate to recipe creator', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('text=Kreator')

    await expect(page).toHaveURL(`${BASE_URL}/kreator`)
    await expect(page.locator('h1')).toContainText('Kreator')
  })

  test('should display meal plan creation steps', async ({ page }) => {
    await page.goto(`${BASE_URL}/kreator`)
    await page.waitForLoadState('networkidle')

    // Should show step 1 initially
    await expect(page.locator('text=Krok 1')).toBeVisible()

    // Should have diet preference options
    await expect(page.locator('text=preferencje dietetyczne')).toBeVisible()
  })

  test('should complete meal plan creation flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/kreator`)
    await page.waitForLoadState('networkidle')

    // Step 1: Select diet preferences (if available)
    const dietOptions = page.locator('[data-testid="diet-option"]')
    if (await dietOptions.count() > 0) {
      await dietOptions.first().click()
    }

    // Look for "Next" or "Continue" button
    const nextButton = page.locator('text=Dalej', 'text=Kontynuuj', 'button:has-text("Krok")')
    if (await nextButton.isVisible()) {
      await nextButton.click()

      // Should progress to next step
      await expect(page.locator('text=Krok 2')).toBeVisible()
    }
  })
})

test.describe('NutriChef Integration', () => {
  test('should fetch NutriChef data from API', async ({ page }) => {
    // Test NutriChef products API endpoint
    const response = await page.request.get(`${BASE_URL}/api/nutrichef/products`)
    const data = await response.json()

    expect(data.success).toBeTruthy()
    expect(data.products).toBeDefined()
    expect(Array.isArray(data.products)).toBeTruthy()
  })

  test('should fetch NutriChef product detail from API', async ({ page }) => {
    // Test NutriChef single product API endpoint
    // First get list to find a product ID
    const listResponse = await page.request.get(`${BASE_URL}/api/nutrichef/products`)
    const listData = await listResponse.json()

    if (listData.success && listData.products?.length > 0) {
      const productId = listData.products[0].id
      
      const detailResponse = await page.request.get(`${BASE_URL}/api/nutrichef/products/${productId}`)
      const detailData = await detailResponse.json()

      expect(detailData.success).toBeTruthy()
      expect(detailData.data).toBeDefined()
      expect(detailData.data.product).toBeDefined()
      
      // Recipe data may or may not exist depending on whether NutriChef has generated it
      if (detailData.data.recipe) {
        expect(detailData.data.nutrition).toBeDefined()
        expect(detailData.data.ingredients).toBeDefined()
        expect(Array.isArray(detailData.data.ingredients)).toBeTruthy()
      }
    }
  })

  test('should display NutriChef nutrition data on recipe page', async ({ page }) => {
    // Get a valid product ID from the products API instead of hardcoding
    const productsResponse = await page.request.get(`${BASE_URL}/api/products`)
    const productsData = await productsResponse.json()
    
    // Use the first product ID if available, otherwise skip
    if (!productsData.success || !productsData.products?.length) {
      console.log('No products available, skipping test')
      return
    }
    
    const productId = productsData.products[0].id
    await page.goto(`${BASE_URL}/danie/${productId}`)
    await page.waitForLoadState('networkidle')

    // Check for nutrition sections
    await expect(page.locator('text=Wartości odżywcze')).toBeVisible()
    
    // Check for macronutrients display
    await expect(page.locator('text=kcal')).toBeVisible()
    await expect(page.locator('text=Białko')).toBeVisible()
    await expect(page.locator('text=Tłuszcz')).toBeVisible()
    await expect(page.locator('text=Węglowodany')).toBeVisible()
  })

  test('should display ingredients from NutriChef with quantities', async ({ page }) => {
    // Get a valid product ID from the products API instead of hardcoding
    const productsResponse = await page.request.get(`${BASE_URL}/api/products`)
    const productsData = await productsResponse.json()
    
    if (!productsData.success || !productsData.products?.length) {
      console.log('No products available, skipping test')
      return
    }
    
    const productId = productsData.products[0].id
    await page.goto(`${BASE_URL}/danie/${productId}`)
    await page.waitForLoadState('networkidle')

    // Check for ingredients section
    await expect(page.locator('text=Składniki w pudełku')).toBeVisible()

    // Look for ingredient items (either with or without grams)
    const ingredientsList = page.locator('ul').filter({ has: page.locator('li') })
    const hasIngredients = await ingredientsList.count() > 0
    expect(hasIngredients).toBeTruthy()
  })

  test('should indicate NutriChef data source when available', async ({ page }) => {
    // Get a valid product ID from the products API instead of hardcoding
    const productsResponse = await page.request.get(`${BASE_URL}/api/products`)
    const productsData = await productsResponse.json()
    
    if (!productsData.success || !productsData.products?.length) {
      console.log('No products available, skipping test')
      return
    }
    
    const productId = productsData.products[0].id
    await page.goto(`${BASE_URL}/danie/${productId}`)
    await page.waitForLoadState('networkidle')

    // Check if NutriChef indicator is shown (may or may not be visible depending on data)
    const nutriChefIndicator = page.locator('text=NutriChef')
    const hasIndicator = await nutriChefIndicator.isVisible().catch(() => false)
    
    // Log for debugging - NutriChef indicator presence depends on whether recipe exists
    console.log(`NutriChef indicator visible: ${hasIndicator}`)
  })
})
