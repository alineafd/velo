import { test, expect } from '../support/fixtures'

test.describe('Configurador de Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.goto()
  })

  test('CT02 - Configuração do Veículo (Cores e Rodas) e Cálculo do Preço Base', async ({ app }) => {
    await app.configurator.assertTotalPrice('40.000,00')

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.assertTotalPrice('40.000,00')

    await app.configurator.selectWheels('Sport Wheels')
    await app.configurator.assertTotalPrice('42.000,00')

    await app.configurator.selectWheels('Aero Wheels')
    await app.configurator.assertTotalPrice('40.000,00')
  })

  test('CT03 - Configuração do Veículo (Adição de Opcionais) e Cálculo de Preço', async ({ app, page }) => {
    await app.configurator.assertTotalPrice('40.000,00')

    await app.configurator.toggleOptional('Precision Park')
    await app.configurator.assertTotalPrice('45.500,00')

    await app.configurator.toggleOptional('Flux Capacitor')
    await app.configurator.assertTotalPrice('50.500,00')

    await app.configurator.toggleOptional('Precision Park')
    await app.configurator.toggleOptional('Flux Capacitor')
    await app.configurator.assertTotalPrice('40.000,00')

    await app.configurator.toggleOptional('Precision Park')
    await app.configurator.checkout()
    await expect(page).toHaveURL(/.*\/order/)
  })
})
