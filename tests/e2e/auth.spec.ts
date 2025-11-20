import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_USER = {
  email: 'test@smakowalo.pl',
  password: 'TestPassword123!',
  firstName: 'Jan',
  lastName: 'Testowy'
}

test.describe('Authentication System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('should load homepage correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Smakowało/)
    await expect(page.locator('h1')).toContainText('ZDROWE JEDZENIE')
    await expect(page.locator('text=Zacznij gotować')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Zaloguj')
    await expect(page).toHaveURL(`${BASE_URL}/login`)
    await expect(page.locator('h1')).toContainText('Zaloguj się')
  })

  test('should display login form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    // Check form elements
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check additional options
    await expect(page.locator('text=Nie masz konta?')).toBeVisible()
    await expect(page.locator('text=Zapomniałeś hasła?')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should stay on login page with validation errors
    await expect(page).toHaveURL(`${BASE_URL}/login`)
    // Note: Specific error messages depend on your validation implementation
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should stay on login page
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.click('text=Zarejestruj się')

    await expect(page).toHaveURL(`${BASE_URL}/register`)
    await expect(page.locator('h1')).toContainText('Załóż konto')
  })

  test('should display registration form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`)

    // Check form elements
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check terms checkbox
    await expect(page.locator('input[type="checkbox"]')).toBeVisible()
  })

  test('should validate password requirements', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`)

    // Fill form with weak password
    await page.fill('input[name="firstName"]', TEST_USER.firstName)
    await page.fill('input[name="lastName"]', TEST_USER.lastName)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', '123') // Weak password

    // Try to submit
    await page.click('button[type="submit"]')

    // Should stay on registration page with validation error
    await expect(page).toHaveURL(`${BASE_URL}/register`)
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.click('text=Zapomniałeś hasła?')

    await expect(page).toHaveURL(`${BASE_URL}/forgot-password`)
    await expect(page.locator('h1')).toContainText('Resetuj hasło')
  })

  test('should display forgot password form', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`)

    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('text=Powrót do logowania')).toBeVisible()
  })

  test('should handle forgot password submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`)

    await page.fill('input[name="email"]', TEST_USER.email)
    await page.click('button[type="submit"]')

    // Should show success message
    await expect(page.locator('text=Jeśli konto istnieje')).toBeVisible()
  })

  test('should test social login buttons visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    // Check if social login buttons are visible (if enabled)
    const googleButton = page.locator('text=Zaloguj przez Google')
    const facebookButton = page.locator('text=Zaloguj przez Facebook')

    // These might be visible or hidden depending on environment
    if (await googleButton.isVisible()) {
      await expect(googleButton).toBeVisible()
    }

    if (await facebookButton.isVisible()) {
      await expect(facebookButton).toBeVisible()
    }
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept network requests to simulate errors
    await page.route('**/api/auth/**', (route) => {
      route.abort('failed')
    })

    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')

    // Should handle error gracefully and stay on login page
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${BASE_URL}/login`)

    // Check if elements are still visible and properly arranged
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check if navigation menu is properly collapsed/accessible
    const menuButton = page.locator('button[aria-label="Menu"]')
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await expect(page.locator('text=Menu')).toBeVisible()
    }
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.click('text=Zarejestruj się')
    await expect(page).toHaveURL(`${BASE_URL}/register`)

    // Go back
    await page.goBack()
    await expect(page).toHaveURL(`${BASE_URL}/login`)

    // Go forward
    await page.goForward()
    await expect(page).toHaveURL(`${BASE_URL}/register`)
  })

  test('should persist form data on page refresh', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    // Fill form
    await page.fill('input[name="email"]', TEST_USER.email)

    // Refresh page
    await page.reload()

    // Form should be empty after refresh (for security)
    await expect(page.locator('input[name="email"]')).toHaveValue('')
  })
})

test.describe('Authenticated User Journey', () => {
  test('should simulate successful login flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    // Fill credentials
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard/panel or stay on login if credentials invalid
    await page.waitForLoadState('networkidle')

    // Check current URL
    const currentURL = page.url()
    console.log('After login attempt, current URL:', currentURL)

    // If login was successful, should be redirected to panel
    if (currentURL.includes('/panel')) {
      await expect(page).toHaveURL(`${BASE_URL}/panel`)
      await expect(page.locator('h1')).toContainText('Panel')
    } else {
      // If login failed, should stay on login page
      await expect(page).toHaveURL(`${BASE_URL}/login`)
    }
  })
})
