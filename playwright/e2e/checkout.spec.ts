import { test, expect } from '../support/fixtures'

test.describe('Checkout e Pedido', () => {
  test.beforeEach(async ({ app }) => {
    // Arrange: Navega e configura o carro base (R$ 40.000,00) antes de cada teste
    await app.configurator.goto()
    await app.configurator.checkout()
    // Checkpoint: Página de checkout carregada
    await expect(app.configurator['page'] ?? {}).toBeTruthy
  })

  test('CT04 - Checkout - Validação de Campos Obrigatórios e Dados Inválidos', async ({ app, page }) => {
    // Checkpoint: Página de checkout carregada
    await expect(page).toHaveURL(/.*\/order/)

    // 1 - Deixar todos os campos em branco e clicar "Confirmar Pedido"
    await app.checkout.submit()
    // Assert: Mensagens de erro exibidas sob campos obrigatórios
    await app.checkout.assertErrorMessages([
      'Nome deve ter pelo menos 2 caracteres',
      'Sobrenome deve ter pelo menos 2 caracteres',
      'Email inválido',
      'Telefone inválido',
      'Selecione uma loja',
      'Aceite os termos',
    ])

    // 2 - Inserir apenas 1 letra no "Nome" e "Sobrenome"
    await app.checkout.fillDadosPessoais({ name: 'A', surname: 'B' })
    await app.checkout.submit()
    await app.checkout.assertErrorMessages([
      'Nome deve ter pelo menos 2 caracteres',
      'Sobrenome deve ter pelo menos 2 caracteres',
    ])

    // 3 - Inserir e-mail sem formato válido
    await app.checkout.fillDadosPessoais({ email: 'cliente@.com' })
    await app.checkout.submit()
    await app.checkout.assertErrorMessages(['Email inválido'])

    // 4 - Preencher tudo corretamente, mas não marcar os Termos
    await app.checkout.fillDadosPessoais({
      name: 'João',
      surname: 'Silva',
      email: 'joao.silva@email.com',
      phone: '11999999999',
      store: 'Velô Paulista - Av. Paulista, 1000',
    })
    await app.checkout.submit()
    await app.checkout.assertErrorMessages(['Aceite os termos'])

    // Assert: O sistema não avança para /success
    await expect(page).toHaveURL(/.*\/order/)
  })

  test('CT05 - Checkout e Confirmação - Pagamento à Vista (Fluxo Feliz)', async ({ app, page }) => {
    // Checkpoint: Página de checkout carregada
    await expect(page).toHaveURL(/.*\/order/)

    // Arrange: Preencher dados válidos
    await app.checkout.fillDadosPessoais({
      name: 'Maria',
      surname: 'Souza',
      email: 'maria.souza@email.com',
      phone: '11988888888',
      store: 'Velô Paulista - Av. Paulista, 1000',
    })

    // 2 - Selecionar "À Vista" (já é o padrão, mas garantimos)
    await app.checkout.selectPaymentMethod('avista')

    // 3 - Aceitar os termos
    await app.checkout.checkTerms()

    // 4 - Confirmar pedido
    await app.checkout.submit()

    // Assert: Redirecionado para /success com "Pedido Aprovado!"
    await expect(page).toHaveURL(/.*\/success/)
    await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
    await expect(page.getByText('Maria Souza')).toBeVisible()
  })

  test('CT06 - Checkout e Análise de Crédito - Financiamento com Score Alto (Aprovado)', async ({ app, page }) => {
    // Mock: Score > 700 → Aprovado
    await page.route('**/functions/v1/credit-analysis', async (route) => {
      await route.fulfill({ status: 200, json: { score: 850 } })
    })

    // Checkpoint: Página de checkout carregada
    await expect(page).toHaveURL(/.*\/order/)

    await app.checkout.fillDadosPessoais({
      name: 'Carlos',
      surname: 'Silva',
      email: 'carlos@email.com',
      phone: '11977777777',
      store: 'Velô Faria Lima - Av. Faria Lima, 2500',
    })

    // Act: Selecionar Financiamento e entrada R$ 0
    await app.checkout.selectPaymentMethod('financiamento')
    await app.checkout.setEntryValue('0')

    await app.checkout.checkTerms()
    await app.checkout.submit()

    // Assert: Pedido aprovado
    await expect(page).toHaveURL(/.*\/success/)
    await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
  })

  test('CT07 - Checkout e Análise de Crédito - Financiamento com Score Médio (Em análise)', async ({ app, page }) => {
    // Mock: Score 501–700 → Em Análise
    await page.route('**/functions/v1/credit-analysis', async (route) => {
      await route.fulfill({ status: 200, json: { score: 600 } })
    })

    await expect(page).toHaveURL(/.*\/order/)

    await app.checkout.fillDadosPessoais({
      name: 'Ana',
      surname: 'Luiza',
      email: 'ana.luiza@email.com',
      phone: '11966666666',
      store: 'Velô Morumbi - Av. Morumbi, 1500',
    })

    await app.checkout.selectPaymentMethod('financiamento')
    await app.checkout.setEntryValue('0')
    await app.checkout.checkTerms()
    await app.checkout.submit()

    // Assert: Pedido em análise
    await expect(page).toHaveURL(/.*\/success/)
    await expect(page.getByRole('heading', { name: 'Pedido em Análise' })).toBeVisible()
  })

  test('CT08 - Checkout e Análise de Crédito - Financiamento com Score Baixo (Reprovado)', async ({ app, page }) => {
    // Mock: Score <= 500, entrada < 50% → Reprovado
    await page.route('**/functions/v1/credit-analysis', async (route) => {
      await route.fulfill({ status: 200, json: { score: 300 } })
    })

    await expect(page).toHaveURL(/.*\/order/)

    await app.checkout.fillDadosPessoais({
      name: 'Pedro',
      surname: 'Paulo',
      email: 'pedro@email.com',
      phone: '11955555555',
      store: 'Velô Ibirapuera - Av. Ibirapuera, 3000',
    })

    await app.checkout.selectPaymentMethod('financiamento')
    await app.checkout.setEntryValue('0') // < 50% do total
    await app.checkout.checkTerms()
    await app.checkout.submit()

    // Assert: Crédito reprovado
    await expect(page).toHaveURL(/.*\/success/)
    await expect(page.getByRole('heading', { name: 'Crédito Reprovado' })).toBeVisible()
  })

  test('CT09 - Checkout e Exceção de Crédito - Financiamento com Entrada >= 50% e Score Baixo (Aprovado)', async ({ app, page }) => {
    // Mock: Score <= 500, mas entrada >= 50% → Aprovado (regra da entrada prevalece)
    await page.route('**/functions/v1/credit-analysis', async (route) => {
      await route.fulfill({ status: 200, json: { score: 300 } })
    })

    await expect(page).toHaveURL(/.*\/order/)

    await app.checkout.fillDadosPessoais({
      name: 'Marcos',
      surname: 'Vinicius',
      email: 'marcos@email.com',
      phone: '11944444444',
      store: 'Velô Paulista - Av. Paulista, 1000',
    })

    await app.checkout.selectPaymentMethod('financiamento')
    // Preço base = R$ 40.000. 50% = R$ 20.000
    await app.checkout.setEntryValue('20000')
    await app.checkout.checkTerms()
    await app.checkout.submit()

    // Assert: Regra da entrada prevalece → Aprovado
    await expect(page).toHaveURL(/.*\/success/)
    await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
  })
})
