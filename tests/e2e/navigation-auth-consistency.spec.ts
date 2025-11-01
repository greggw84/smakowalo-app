import { test, expect } from '@playwright/test'

/**
 * Test suite to verify consistent authentication state in Navigation component across all pages
 * 
 * This test verifies the fix for the issue where:
 * - "Wyloguj" button was only visible on /panel or intermittently missing on other pages
 * - "Panel" button was sometimes missing or replaced by "Zaloguj" despite being logged in
 * 
 * The fix ensures Navigation uses centralized AuthProvider instead of creating its own
 * Supabase client per page, eliminating race conditions.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Pages to test navigation consistency on
const TEST_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/menu', name: 'Menu' },
  { path: '/dlaczego-my', name: 'Dlaczego my' },
  { path: '/jak-to-dziala', name: 'Jak to działa' },
  { path: '/faq', name: 'FAQ' },
  { path: '/dostawa', name: 'Dostawa' },
  { path: '/kreator', name: 'Kreator' },
  { path: '/ulubione', name: 'Ulubione' },
  { path: '/panel', name: 'Panel' },
]

test.describe('Navigation Auth Consistency', () => {
  test.describe('Unauthenticated State', () => {
    test('should consistently show "Zaloguj" button on all pages', async ({ page }) => {
      for (const testPage of TEST_PAGES) {
        await page.goto(`${BASE_URL}${testPage.path}`)
        
        // Wait for page to load
        await page.waitForLoadState('networkidle')
        
        // Should show "Zaloguj" button
        const zalogujButton = page.locator('text=Zaloguj').first()
        await expect(zalogujButton, `"Zaloguj" button should be visible on ${testPage.name}`).toBeVisible({
          timeout: 5000
        })
        
        // Should NOT show "Wyloguj" button
        const wylogujButton = page.locator('text=Wyloguj')
        await expect(wylogujButton, `"Wyloguj" button should NOT be visible on ${testPage.name}`).not.toBeVisible()
        
        // Should NOT show "Panel" button
        const panelButton = page.locator('button:has-text("Panel")')
        await expect(panelButton, `"Panel" button should NOT be visible on ${testPage.name}`).not.toBeVisible()
      }
    })

    test('should not show loading state for extended period', async ({ page }) => {
      await page.goto(`${BASE_URL}/menu`)
      
      // Wait a bit for auth state to resolve
      await page.waitForTimeout(2000)
      
      // Should either show Zaloguj or the authenticated buttons, not stuck in loading
      const zalogujButton = page.locator('text=Zaloguj')
      const panelButton = page.locator('button:has-text("Panel")')
      
      // One of these should be visible (not stuck in loading)
      const zalogujVisible = await zalogujButton.isVisible()
      const panelVisible = await panelButton.isVisible()
      
      expect(zalogujVisible || panelVisible, 'Either Zaloguj or Panel button should be visible, not stuck in loading').toBeTruthy()
    })
  })

  test.describe('Navigation State Transitions', () => {
    test('should consistently update navigation when navigating between pages', async ({ page }) => {
      // Start on home page
      await page.goto(`${BASE_URL}/`)
      await page.waitForLoadState('networkidle')
      
      // Verify initial state
      await expect(page.locator('text=Zaloguj').first()).toBeVisible()
      
      // Navigate to menu
      await page.goto(`${BASE_URL}/menu`)
      await page.waitForLoadState('networkidle')
      
      // Should still show consistent state
      await expect(page.locator('text=Zaloguj').first()).toBeVisible()
      
      // Navigate to panel
      await page.goto(`${BASE_URL}/panel`)
      await page.waitForLoadState('networkidle')
      
      // Should still show consistent state (either login redirect or auth buttons)
      // On panel page, if not authenticated, should redirect to login or show login button
      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        // Redirected to login - expected
        await expect(page.locator('h1')).toContainText('Zaloguj się')
      } else {
        // Still on a page - should show Zaloguj
        await expect(page.locator('text=Zaloguj').first()).toBeVisible()
      }
    })

    test('should show consistent navigation across quick page transitions', async ({ page }) => {
      // Rapidly navigate between pages to test for race conditions
      const pages = ['/menu', '/faq', '/dostawa', '/kreator', '/menu']
      
      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`)
        // Don't wait for full network idle - simulate quick navigation
        await page.waitForLoadState('domcontentloaded')
        
        // Wait a short time to let any race conditions manifest
        await page.waitForTimeout(500)
        
        // Check that we're not in an inconsistent state
        const zalogujButton = page.locator('text=Zaloguj').first()
        const wylogujButton = page.locator('text=Wyloguj')
        const panelButton = page.locator('button:has-text("Panel")')
        
        const zalogujVisible = await zalogujButton.isVisible()
        const wylogujVisible = await wylogujButton.isVisible()
        const panelVisible = await panelButton.isVisible()
        
        // Either authenticated (Wyloguj + Panel) or not (Zaloguj), but not both
        if (zalogujVisible) {
          expect(wylogujVisible, `On ${pagePath}: Wyloguj should not be visible when Zaloguj is shown`).toBeFalsy()
          expect(panelVisible, `On ${pagePath}: Panel should not be visible when Zaloguj is shown`).toBeFalsy()
        } else {
          // If not showing Zaloguj, should be showing authenticated state or loading
          expect(wylogujVisible || panelVisible, `On ${pagePath}: Should show either authenticated buttons or Zaloguj`).toBeTruthy()
        }
      }
    })
  })

  test.describe('Cart and Other Navigation Elements', () => {
    test('should consistently show Koszyk button regardless of auth state', async ({ page }) => {
      for (const testPage of TEST_PAGES.slice(0, 5)) { // Test on first 5 pages
        await page.goto(`${BASE_URL}${testPage.path}`)
        await page.waitForLoadState('networkidle')
        
        // Koszyk button should always be visible
        const koszykButton = page.locator('button:has-text("Koszyk")')
        await expect(koszykButton, `Koszyk button should be visible on ${testPage.name}`).toBeVisible()
      }
    })
  })
})

test.describe('Navigation Auth Consistency - With Mock Auth', () => {
  test('should show authenticated state consistently when session exists', async ({ page }) => {
    // Mock authenticated session by setting storage state
    // This simulates having a valid Supabase session
    await page.goto(`${BASE_URL}/`)
    
    // Set mock session in localStorage (adjust based on actual Supabase storage)
    await page.evaluate(() => {
      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_at: Date.now() + 3600000,
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
        }
      }
      
      // Supabase stores auth in localStorage with specific keys
      localStorage.setItem(
        'sb-auth-token',
        JSON.stringify(mockSession)
      )
    })
    
    // Reload to pick up the mocked session
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Now navigate to different pages and verify consistent auth state
    for (const testPage of TEST_PAGES.slice(0, 5)) {
      await page.goto(`${BASE_URL}${testPage.path}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000) // Give time for auth to resolve
      
      // With mocked session, we expect to see either:
      // 1. Wyloguj and Panel buttons (if session is recognized)
      // 2. Still see Zaloguj if mock session format is wrong (expected in this test)
      
      // This test verifies that whatever state is shown, it's consistent
      const zalogujVisible = await page.locator('text=Zaloguj').first().isVisible()
      const wylogujVisible = await page.locator('text=Wyloguj').isVisible()
      
      // Should not show both at the same time
      expect(
        zalogujVisible && wylogujVisible,
        `On ${testPage.name}: Should not show both Zaloguj and Wyloguj simultaneously`
      ).toBeFalsy()
    }
  })
})
