import { test, expect } from '../support/fixtures'

test.describe('Landing Page', () => {
  test('CT01 - Acesso e Navegação na Landing Page', async ({ app, page }) => {
    // Arrange / Act
    await app.home.goto()

    // Assert: Landing Page carregada, heading principal visível (Hero)
    await expect(page.getByRole('heading', { name: 'Velô Sprint', level: 1 })).toBeVisible()

    // Assert: Seções principais visíveis
    await expect(page.getByTestId('hero-section')).toBeVisible()
    await expect(page.getByTestId('specs-section')).toBeVisible()
    await expect(page.getByTestId('faq-section')).toBeVisible()

    // Act: Clicar no botão de CTA para o Configurador
    await page.getByRole('link', { name: 'Configure Agora' }).click()

    // Assert: Permanece na mesma página (sem /configure) com heading correto
    await expect(page).toHaveURL("/configure")
    await expect(page.getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()
  })
})
