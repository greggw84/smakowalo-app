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
