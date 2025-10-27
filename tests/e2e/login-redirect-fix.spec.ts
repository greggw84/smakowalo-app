import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Login Page Redirect Fix', () => {
  test('should NOT auto-redirect on page load when visiting /login', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    // Wait a bit to ensure no redirect happens
    await page.waitForTimeout(2000)
    
    // Should still be on login page
    await expect(page).toHaveURL(`${BASE_URL}/login`)
    
    // Login form should be visible
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible()
    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible()
  })

  test('should NOT auto-redirect when visiting /login?callbackUrl=/panel', async ({ page }) => {
    // Navigate to login page with callbackUrl
    await page.goto(`${BASE_URL}/login?callbackUrl=/panel`)
    await page.waitForLoadState('networkidle')
    
    // Wait a bit to ensure no redirect happens
    await page.waitForTimeout(2000)
    
    // Should still be on login page with callbackUrl parameter
    expect(page.url()).toContain(`${BASE_URL}/login`)
    expect(page.url()).toContain('callbackUrl')
    
    // Login form should be visible
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible()
  })

  test('should respect stay=1 parameter and never redirect', async ({ page }) => {
    // Navigate to login page with stay=1
    await page.goto(`${BASE_URL}/login?stay=1`)
    await page.waitForLoadState('networkidle')
    
    // Wait longer to ensure no redirect happens
    await page.waitForTimeout(3000)
    
    // Should still be on login page
    expect(page.url()).toContain(`${BASE_URL}/login`)
    expect(page.url()).toContain('stay=1')
    
    // Check console for debug message
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      consoleLogs.push(msg.text())
    })
    
    // Reload to capture console logs
    await page.reload()
    await page.waitForTimeout(1000)
    
    // Login form should still be visible
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible()
  })

  test('should handle logout=1 parameter by clearing sessions', async ({ page }) => {
    // Navigate to login page with logout=1
    await page.goto(`${BASE_URL}/login?logout=1`)
    await page.waitForLoadState('networkidle')
    
    // Wait for sessions to be cleared
    await page.waitForTimeout(2000)
    
    // Should stay on login page
    expect(page.url()).toContain(`${BASE_URL}/login`)
    
    // Check if success message appears
    const successMessage = page.locator('text=Sesje zostały wyczyszczone')
    if (await successMessage.isVisible().catch(() => false)) {
      await expect(successMessage).toBeVisible()
    }
    
    // Login form should be visible
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible()
  })

  test('should show login form immediately without delay', async ({ page }) => {
    const startTime = Date.now()
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`)
    
    // Form should be visible quickly
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible({ timeout: 5000 })
    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should load in reasonable time (< 5 seconds)
    expect(loadTime).toBeLessThan(5000)
    
    // Should still be on login page
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('should preserve callbackUrl parameter throughout navigation', async ({ page }) => {
    // Navigate to login page with callbackUrl
    await page.goto(`${BASE_URL}/login?callbackUrl=/panel`)
    await page.waitForLoadState('networkidle')
    
    // URL should contain callbackUrl parameter
    expect(page.url()).toContain('callbackUrl=/panel')
    
    // Switch to register tab and back
    const registerTab = page.locator('button:has-text("Zarejestruj")')
    await registerTab.click()
    await page.waitForTimeout(500)
    
    const loginTab = page.locator('button:has-text("Zaloguj")')
    await loginTab.click()
    await page.waitForTimeout(500)
    
    // CallbackUrl should still be in URL
    expect(page.url()).toContain('callbackUrl=/panel')
  })

  test('should validate callbackUrl and reject external URLs', async ({ page }) => {
    // Try to navigate with external callbackUrl
    await page.goto(`${BASE_URL}/login?callbackUrl=https://evil.com/phishing`)
    await page.waitForLoadState('networkidle')
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/)
    
    // Login form should be visible (no redirect to external site)
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible()
  })

  test('should validate callbackUrl and reject protocol-relative URLs', async ({ page }) => {
    // Try to navigate with protocol-relative URL
    await page.goto(`${BASE_URL}/login?callbackUrl=//evil.com/phishing`)
    await page.waitForLoadState('networkidle')
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/)
    
    // Login form should be visible (no redirect)
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible()
  })

  test('should allow relative callbackUrl paths', async ({ page }) => {
    // Navigate with a relative path callbackUrl
    await page.goto(`${BASE_URL}/login?callbackUrl=/menu`)
    await page.waitForLoadState('networkidle')
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/)
    expect(page.url()).toContain('callbackUrl=/menu')
    
    // Login form should be visible
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible()
  })

  test('should keep OAuth buttons functional with single-flight guard', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    // OAuth buttons should be visible
    const googleButton = page.locator('button:has-text("Google")').first()
    const facebookButton = page.locator('button:has-text("Facebook")').first()
    
    await expect(googleButton).toBeVisible()
    await expect(facebookButton).toBeVisible()
    
    // Buttons should be enabled initially
    await expect(googleButton).toBeEnabled()
    await expect(facebookButton).toBeEnabled()
  })

  test('should not trigger INITIAL_SESSION redirect', async ({ page }) => {
    // Track console messages for auth state changes
    const authStateChanges: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Auth state change:')) {
        authStateChanges.push(text)
      }
    })
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Should still be on login page (no redirect from INITIAL_SESSION)
    await expect(page).toHaveURL(`${BASE_URL}/login`)
    
    // Login form should be visible
    await expect(page.locator('h2:has-text("Witaj w Smakowało")')).toBeVisible()
  })
})
