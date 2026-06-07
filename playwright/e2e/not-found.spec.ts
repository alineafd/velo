import { test, expect } from '../support/fixtures'

/**
 * Teste de Rota inválida / Não encontrada 
 * Exploração manual validada via MCP: heading 404, mensagem amigável, link "Return to Home".
 */
test.describe('NotFound (rota inválida)', () => {
  test('deve exibir 404 em rota inexistente e voltar à home pelo CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Velô Sprint', level: 1 })).toBeVisible()

    await page.goto('/caminho-falso')
    await expect(page).toHaveURL(/\/caminho-falso$/)
    await expect(page.getByText('404: NOT_FOUND')).toBeVisible()
  })
})
