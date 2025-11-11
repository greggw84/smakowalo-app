import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_USER = {
  email: 'test@smakowalo.pl',
  password: 'TestPassword123!',
  firstName: 'Jan',
  lastName: 'Testowy'
}

test.describe('Kreator Login Loop Fix', () => {
  test('should not get stuck in login loop when returning from authentication', async ({ page }) => {
    // Navigate to kreator page in subscription mode
    await page.goto(`${BASE_URL}/kreator`)
    await expect(page).toHaveURL(`${BASE_URL}/kreator`)
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if we're on subscription mode (default)
    await expect(page.locator('text=Zapisz się na subskrypcję')).toBeVisible()
    
    // Select a plan (step 1)
    const basicPlan = page.locator('text=Podstawowy').first()
    if (await basicPlan.isVisible()) {
      await basicPlan.click()
      
      // Click "Dalej" to go to step 2
      const nextButton = page.locator('button', { hasText: 'Dalej' }).first()
      await nextButton.click()
      
      // Wait for step 2
      await page.waitForTimeout(500)
      
      // Select preferences and click next until we get to the login step
      // This simulates the user going through the kreator flow
      
      // Click "Dalej" on step 2 (preferences)
      const step2NextButton = page.locator('button', { hasText: 'Dalej' }).last()
      if (await step2NextButton.isVisible()) {
        await step2NextButton.click()
      }
      
      // Wait for step 3
      await page.waitForTimeout(500)
      
      // On step 3, we might need to select dishes
      // For this test, we'll just try to proceed to step 4
      const step3NextButton = page.locator('button', { hasText: 'Dalej' })
      if (await step3NextButton.isVisible()) {
        // Select some dishes if possible
        const dishCards = page.locator('div[class*="cursor-pointer"]')
        const dishCount = await dishCards.count()
        if (dishCount > 0) {
          // Click first few dishes
          for (let i = 0; i < Math.min(3, dishCount); i++) {
            await dishCards.nth(i).click()
            await page.waitForTimeout(100)
          }
        }
        
        // Try to proceed
        await step3NextButton.click()
      }
    }
    
    // Wait for login prompt
    await page.waitForTimeout(1000)
    
    // Check if we're at step 4 with login prompt
    const loginButton = page.locator('text=Przejdź do logowania')
    if (await loginButton.isVisible()) {
      // Click login button - this should save draft and redirect to /login?callbackUrl=/kreator?resume=1
      await loginButton.click()
      
      // Wait for navigation
      await page.waitForLoadState('networkidle')
      
      // Should be on login page
      await expect(page).toHaveURL(new RegExp('/login'))
      
      // Simulate successful login by navigating directly to kreator with resume=1
      // In a real test, we would log in properly, but for this test we're testing the resume logic
      await page.goto(`${BASE_URL}/kreator?resume=1`)
      
      // Wait for the session reload effect to trigger
      await page.waitForTimeout(2000)
      
      // The page should NOT show the login prompt again
      // Instead, it should either:
      // 1. Show authenticated content, or
      // 2. Redirect back to kreator without resume parameter after reloading
      
      const currentURL = page.url()
      console.log('After resume=1 redirect, current URL:', currentURL)
      
      // Should not still have resume=1 in URL after the effect runs
      // (the effect clears it after detecting session)
      if (currentURL.includes('resume=1')) {
        // Still has resume parameter - check if login prompt is shown (which would indicate loop)
        const loginPromptAgain = await page.locator('text=Przejdź do logowania').isVisible()
        
        // Should NOT show login prompt again if session is detected
        expect(loginPromptAgain).toBe(false)
      }
    }
  })
  
  test('should handle resume parameter correctly when session is available', async ({ page, context }) => {
    // Mock a session by setting the session token cookie
    // Note: This is a simplified test - in production you'd actually log in
    await context.addCookies([{
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
    }])
    
    // Navigate to kreator with resume=1
    await page.goto(`${BASE_URL}/kreator?resume=1`)
    
    // Wait for potential page reload triggered by the effect
    await page.waitForTimeout(3000)
    
    // After reload, the resume parameter should be cleared
    const finalURL = page.url()
    console.log('Final URL after session reload:', finalURL)
    
    // The URL should not contain resume=1 anymore
    expect(finalURL).not.toContain('resume=1')
    
    // Should be on kreator page
    expect(finalURL).toContain('/kreator')
  })
  
  test('should trigger session update when resume=1 is present but session is missing', async ({ page }) => {
    // Navigate directly to kreator with resume=1 (no session)
    await page.goto(`${BASE_URL}/kreator?resume=1`)
    
    // Set up console log listener to verify the effect is working
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      consoleLogs.push(msg.text())
    })
    
    // Wait for effects to run
    await page.waitForTimeout(2000)
    
    // Check if the resume parameter was detected
    const resumeDetected = consoleLogs.some(log => log.includes('Resume parameter detected'))
    console.log('Console logs:', consoleLogs)
    console.log('Resume detected:', resumeDetected)
    
    // Should have logged the resume detection
    expect(resumeDetected).toBe(true)
  })
})
