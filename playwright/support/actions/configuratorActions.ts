import { Page, expect } from '@playwright/test'
import { createHomeActions } from './homeActions'

export function createConfiguratorActions(page: Page) {
  return {
    async goto() {
      await page.goto('/configure')

      await expect(page.getByText('Configure seu')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()
    },

    async selectColor(color: 'Glacier Blue' | 'Midnight Black' | 'Lunar White') {
      await page.getByRole('button', { name: color }).click()
    },

    async selectWheels(wheel: 'Aero Wheels' | 'Sport Wheels') {
      await page.getByRole('button', { name: wheel }).click()
    },

    async toggleOptional(optional: 'Precision Park' | 'Flux Capacitor') {
      await page.getByRole('checkbox', { name: optional }).click()
    },

    async assertTotalPrice(expectedPrice: string) {
      await expect(page.getByTestId('total-price')).toContainText(expectedPrice)
    },

    async checkout() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
    },

    async navigateToCheckout({
      color = 'Glacier Blue',
      wheels = 'Aero Wheels',
    }: {
      color?: 'Glacier Blue' | 'Midnight Black' | 'Lunar White'
      wheels?: 'Aero Wheels' | 'Sport Wheels'
    } = {}) {
      const home = createHomeActions(page)
      await home.goto()
      await home.clickConfigureCta()
      await page.getByRole('button', { name: color }).click()
      await page.getByRole('button', { name: wheels }).click()
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page).toHaveURL(/.*\/order/)
    },
  }
}
