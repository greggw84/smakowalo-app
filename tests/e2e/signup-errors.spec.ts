import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Signup Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    // Switch to signup tab
    await page.click('button[role="tab"]:has-text("Rejestracja")')
    await page.waitForSelector('#firstName')
  })

  test('should show success message and switch to Sign In tab after successful signup', async ({ page }) => {
    // This test simulates the production flow where signup returns VerificationRequired error
    // which should be treated as success
    
    // Mock the NextAuth API to return VerificationRequired error
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: `${BASE_URL}/login?error=VerificationRequired` }),
        headers: { 'Content-Type': 'application/json' }
      })
    })

    // Fill signup form
    await page.fill('#firstName', 'Jan')
    await page.fill('#lastName', 'Kowalski')
    await page.fill('#signup-email', 'test@example.com')
    await page.fill('#phone', '123456789')
    await page.fill('#signup-password', 'TestPassword123')
    await page.fill('#confirmPassword', 'TestPassword123')

    // Submit form
    await page.click('button:has-text("Utwórz konto")')

    // Wait for success message to appear
    await page.waitForSelector('text=Konto zostało utworzone', { timeout: 5000 })

    // Should show success message
    await expect(page.locator('text=Konto zostało utworzone')).toBeVisible()
    await expect(page.locator('text=Sprawdź swoją skrzynkę email')).toBeVisible()

    // Should show resend verification button
    await expect(page.locator('button:has-text("Wyślij ponownie link weryfikacyjny")')).toBeVisible()

    // Should switch to Sign In tab
    const signInTab = page.locator('button[role="tab"][value="signin"]')
    await expect(signInTab).toHaveAttribute('data-state', 'active')

    // Password fields should be cleared
    await expect(page.locator('#signin-password')).toHaveValue('')
  })

  test('should show error for existing email', async ({ page }) => {
    // Mock the NextAuth API to return EmailAlreadyExists error
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: `${BASE_URL}/login?error=EmailAlreadyExists` }),
        headers: { 'Content-Type': 'application/json' }
      })
    })

    // Fill signup form
    await page.fill('#firstName', 'Jan')
    await page.fill('#lastName', 'Kowalski')
    await page.fill('#signup-email', 'existing@example.com')
    await page.fill('#phone', '123456789')
    await page.fill('#signup-password', 'TestPassword123')
    await page.fill('#confirmPassword', 'TestPassword123')

    // Submit form
    await page.click('button:has-text("Utwórz konto")')

    // Wait for error message to appear
    await page.waitForSelector('text=Konto z tym adresem email już istnieje', { timeout: 5000 })

    // Should show error message
    await expect(page.locator('text=Konto z tym adresem email już istnieje')).toBeVisible()

    // Should stay on signup tab
    const signUpTab = page.locator('button[role="tab"][value="signup"]')
    await expect(signUpTab).toHaveAttribute('data-state', 'active')
  })

  test('should handle demo mode signup success', async ({ page }) => {
    // Mock the NextAuth API to return DEMO_SIGNUP_SUCCESS error
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: `${BASE_URL}/login?error=DEMO_SIGNUP_SUCCESS` }),
        headers: { 'Content-Type': 'application/json' }
      })
    })

    // Fill signup form
    await page.fill('#firstName', 'Jan')
    await page.fill('#lastName', 'Kowalski')
    await page.fill('#signup-email', 'demo@example.com')
    await page.fill('#phone', '123456789')
    await page.fill('#signup-password', 'TestPassword123')
    await page.fill('#confirmPassword', 'TestPassword123')

    // Submit form
    await page.click('button:has-text("Utwórz konto")')

    // Wait for demo mode success message to appear
    await page.waitForSelector('text=DEMO MODE', { timeout: 5000 })

    // Should show demo mode success message
    await expect(page.locator('text=DEMO MODE')).toBeVisible()
    await expect(page.locator('text=Konto zostało utworzone')).toBeVisible()

    // Should switch to Sign In tab
    const signInTab = page.locator('button[role="tab"][value="signin"]')
    await expect(signInTab).toHaveAttribute('data-state', 'active')

    // Password fields should be cleared
    await expect(page.locator('#signin-password')).toHaveValue('')
  })

  test('should treat CredentialsSignin error as verification required (fallback)', async ({ page }) => {
    // Mock the NextAuth API to return CredentialsSignin error (fallback case for null return)
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: `${BASE_URL}/login?error=CredentialsSignin` }),
        headers: { 'Content-Type': 'application/json' }
      })
    })

    // Fill signup form
    await page.fill('#firstName', 'Jan')
    await page.fill('#lastName', 'Kowalski')
    await page.fill('#signup-email', 'test@example.com')
    await page.fill('#phone', '123456789')
    await page.fill('#signup-password', 'TestPassword123')
    await page.fill('#confirmPassword', 'TestPassword123')

    // Submit form
    await page.click('button:has-text("Utwórz konto")')

    // Wait for success message to appear (treating CredentialsSignin as success during signup)
    await page.waitForSelector('text=Konto zostało utworzone', { timeout: 5000 })

    // Should show success message (treating CredentialsSignin as success during signup)
    await expect(page.locator('text=Konto zostało utworzone')).toBeVisible()
    await expect(page.locator('text=Sprawdź swoją skrzynkę email')).toBeVisible()

    // Should show resend verification button
    await expect(page.locator('button:has-text("Wyślij ponownie link weryfikacyjny")')).toBeVisible()

    // Should switch to Sign In tab
    const signInTab = page.locator('button[role="tab"][value="signin"]')
    await expect(signInTab).toHaveAttribute('data-state', 'active')
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("Utwórz konto")')

    // Should show validation error
    await expect(page.locator('text=Imię i nazwisko są wymagane')).toBeVisible()
  })

  test('should validate password match', async ({ page }) => {
    // Fill form with mismatched passwords
    await page.fill('#firstName', 'Jan')
    await page.fill('#lastName', 'Kowalski')
    await page.fill('#signup-email', 'test@example.com')
    await page.fill('#phone', '123456789')
    await page.fill('#signup-password', 'TestPassword123')
    await page.fill('#confirmPassword', 'DifferentPassword123')

    // Submit form
    await page.click('button:has-text("Utwórz konto")')

    // Should show validation error
    await expect(page.locator('text=Hasła nie są identyczne')).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    // Fill form with invalid phone number
    await page.fill('#firstName', 'Jan')
    await page.fill('#lastName', 'Kowalski')
    await page.fill('#signup-email', 'test@example.com')
    await page.fill('#phone', '123') // Too short
    await page.fill('#signup-password', 'TestPassword123')
    await page.fill('#confirmPassword', 'TestPassword123')

    // Submit form
    await page.click('button:has-text("Utwórz konto")')

    // Should show validation error
    await expect(page.locator('text=Podaj prawidłowy numer telefonu')).toBeVisible()
  })
})

test.describe('Sign In Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    // Should be on sign in tab by default
    await page.waitForSelector('#signin-email')
  })

  test('should show appropriate error for CredentialsSignin during sign-in', async ({ page }) => {
    // Mock the NextAuth API to return CredentialsSignin error during sign-in
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: `${BASE_URL}/login?error=CredentialsSignin` }),
        headers: { 'Content-Type': 'application/json' }
      })
    })

    // Fill sign in form
    await page.fill('#signin-email', 'test@example.com')
    await page.fill('#signin-password', 'WrongPassword')

    // Submit form
    await page.click('button:has-text("Zaloguj się")')

    // Wait for error message to appear
    await page.waitForSelector('text=Nieprawidłowy email lub hasło', { timeout: 5000 })

    // Should show error message for sign-in (different from signup)
    await expect(page.locator('text=Nieprawidłowy email lub hasło')).toBeVisible()

    // Should stay on sign in tab
    const signInTab = page.locator('button[role="tab"][value="signin"]')
    await expect(signInTab).toHaveAttribute('data-state', 'active')
  })

  test('should show error for unverified email during sign-in', async ({ page }) => {
    // Mock the NextAuth API to return VerificationRequired error during sign-in
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: `${BASE_URL}/login?error=VerificationRequired` }),
        headers: { 'Content-Type': 'application/json' }
      })
    })

    // Fill sign in form
    await page.fill('#signin-email', 'unverified@example.com')
    await page.fill('#signin-password', 'TestPassword123')

    // Submit form
    await page.click('button:has-text("Zaloguj się")')

    // Wait for verification error message to appear
    await page.waitForSelector('text=Twój email nie został jeszcze zweryfikowany', { timeout: 5000 })

    // Should show error message about verification
    await expect(page.locator('text=Twój email nie został jeszcze zweryfikowany')).toBeVisible()

    // Should show resend verification button
    await expect(page.locator('button:has-text("Wyślij ponownie link weryfikacyjny")')).toBeVisible()
  })
})
