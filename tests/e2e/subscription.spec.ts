import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('should navigate to kreator page', async ({ page }) => {
    await page.goto(`${BASE_URL}/kreator`)
    
    // Should show the step indicator
    await expect(page.locator('text=Krok 1')).toBeVisible()
    
    // Should show the box selection step
    await expect(page.locator('text=Stwórz Swoje Pierwsze Pudełko')).toBeVisible()
    await expect(page.locator('text=Wybierz Rozmiar Pudełka')).toBeVisible()
  })

  test('should allow selecting meal plan options', async ({ page }) => {
    await page.goto(`${BASE_URL}/kreator`)
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Select number of people - click on "3" button
    const peopleButton = page.locator('button:has-text("3")').first()
    await peopleButton.click()
    
    // Select number of days - click on "4" button
    const daysButton = page.locator('button:has-text("4")').first()
    await daysButton.click()
    
    // Verify the summary shows the correct info
    await expect(page.locator('text=4 posiłki dla 3 osób tygodniowo')).toBeVisible()
  })

  test('should show delivery day selection on step 2', async ({ page }) => {
    await page.goto(`${BASE_URL}/kreator`)
    
    // Complete step 1
    const nextButton = page.locator('button:has-text("Dalej")').first()
    await nextButton.click()
    
    // Should show delivery day selection
    await expect(page.locator('text=Wybierz Dzień Dostawy')).toBeVisible()
    await expect(page.locator('text=Wtorek')).toBeVisible()
    await expect(page.locator('text=Czwartek')).toBeVisible()
  })

  test('should show preferences selection on step 3', async ({ page }) => {
    await page.goto(`${BASE_URL}/kreator`)
    
    // Complete step 1
    await page.locator('button:has-text("Dalej")').first().click()
    
    // Complete step 2
    await page.locator('button:has-text("Dalej")').first().click()
    
    // Should show preferences step
    await expect(page.locator('text=Wybierz swoje preferencje')).toBeVisible()
    
    // Check that diet options are visible
    await expect(page.locator('text=Wysokobiałkowa')).toBeVisible()
    await expect(page.locator('text=Wegetariańska')).toBeVisible()
  })

  test('should validate login requirement for checkout', async ({ page }) => {
    await page.goto(`${BASE_URL}/kreator`)
    
    // Navigate through steps
    await page.locator('button:has-text("Dalej")').first().click() // Step 1 -> 2
    await page.waitForLoadState('networkidle')
    
    await page.locator('button:has-text("Dalej")').first().click() // Step 2 -> 3
    await page.waitForLoadState('networkidle')
    
    // Select a diet on step 3
    await page.locator('text=Elastyczna').click()
    await page.locator('button:has-text("Dalej")').first().click() // Step 3 -> 4/5
    
    // Should eventually reach registration/login step for unauthenticated users
    // (The exact flow depends on whether the user is logged in)
    await page.waitForLoadState('networkidle')
    
    // Either see register step or be redirected to login
    const hasRegisterStep = await page.locator('text=Zaczynajmy!').isVisible().catch(() => false)
    const hasLoginRedirect = page.url().includes('/login')
    
    expect(hasRegisterStep || hasLoginRedirect).toBeTruthy()
  })

  test('should display subscriptions in client panel', async ({ page }) => {
    await page.goto(`${BASE_URL}/panel`)
    
    // Should redirect to login if not authenticated
    await page.waitForLoadState('networkidle')
    
    // If redirected to login, we can't test the subscription display without credentials
    if (page.url().includes('/login')) {
      // Just verify the login page loads correctly
      await expect(page.locator('h1:has-text("Zaloguj się")')).toBeVisible()
    } else {
      // If we're on the panel, check for subscription tab
      const subsTab = page.locator('button:has-text("Subskrypcje")')
      if (await subsTab.isVisible()) {
        await subsTab.click()
        
        // Should show either active subscription or "no subscription" message
        const hasSubscription = await page.locator('text=Twoja Subskrypcja').isVisible().catch(() => false)
        const noSubscription = await page.locator('text=Brak aktywnej subskrypcji').isVisible().catch(() => false)
        
        expect(hasSubscription || noSubscription).toBeTruthy()
      }
    }
  })

  test('should have proper subscription overview component', async ({ page }) => {
    // This test requires a logged-in user with an active subscription
    // In a real test environment, you would set up test authentication
    
    await page.goto(`${BASE_URL}/panel`)
    await page.waitForLoadState('networkidle')
    
    if (page.url().includes('/panel')) {
      // Navigate to subscriptions tab
      const subsTab = page.locator('button:has-text("Subskrypcje")')
      if (await subsTab.isVisible()) {
        await subsTab.click()
        await page.waitForLoadState('networkidle')
        
        // Check for subscription status text as more reliable selectors
        // Should show either active subscription status or "no subscription" message
        const statusVisible = await page.locator('text=Aktywna').isVisible().catch(() => false) ||
                             await page.locator('text=Wstrzymana').isVisible().catch(() => false) ||
                             await page.locator('text=Twoja Subskrypcja').isVisible().catch(() => false) ||
                             await page.locator('text=Brak aktywnej subskrypcji').isVisible().catch(() => false)
        expect(statusVisible).toBeTruthy()
      }
    }
  })
})

test.describe('Webhook Integration', () => {
  // These tests would typically run against a test environment with Stripe test mode
  
  test('webhook endpoint should be accessible', async ({ request }) => {
    // Note: The actual webhook requires Stripe signature, so we can only test that the endpoint exists
    const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {}
    })
    
    // Should return 400 (no signature) rather than 404 (not found)
    expect(response.status()).toBe(400)
  })

  test('subscription API should require authentication', async ({ request }) => {
    // Test that subscription management APIs are protected
    const pauseResponse = await request.post(`${BASE_URL}/api/subscriptions/pause`, {
      data: { subscription_id: 1 }
    })
    
    // Should return 401 or redirect to login
    expect([401, 403]).toContain(pauseResponse.status())
  })
})
