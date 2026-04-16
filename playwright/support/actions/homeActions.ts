import { Page, expect } from '@playwright/test'

export function createHomeActions(page: Page) {
  return {
    async goto() {
      await page.goto('/')
      const title = page.getByTestId('hero-section').getByRole('heading')
      await expect(title).toContainText('Velô Sprint')
    },
    async clickConfigureCta() {
      await page.getByTestId('hero-cta-primary').click()
      await expect(page).toHaveURL(/.*\/configure/)
    }
  }
}
