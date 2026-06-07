import { test, expect } from '../support/fixtures'
import type { Page } from '@playwright/test'
import {
  checkoutCustomers,
  checkoutStores,
  creditDecisionCases,
  creditBoundaryCases,
} from '../support/fixtures/checkoutData'
import { deleteAllOrders } from '../support/database/orderFactory'

type CreditRouteMode = 'score' | 'http-500' | 'network-error'

// ─── Fixture: garante que o checkout está pronto antes de cada teste ──────────
const testWithCheckout = test.extend<{ checkoutReady: void }>({
  checkoutReady: async ({ app, page }, use) => {
    await app.configurator.goto()
    await app.configurator.checkout()
    await expect(page).toHaveURL(/.*\/order/)
    await use()
  },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function mockCreditAnalysis(
  page: Page,
  mode: CreditRouteMode,
  score?: number
) {
  await page.route('**/functions/v1/credit-analysis', async (route) => {
    if (mode === 'score') {
      await route.fulfill({ status: 200, json: { score } })
      return
    }
    if (mode === 'http-500') {
      await route.fulfill({ status: 500, json: { message: 'internal error' } })
      return
    }
    await route.abort('failed')
  })
}

async function runFinancingCheckoutFlow({
  app,
  page,
  entryValue,
  customer = checkoutCustomers.financiamentoBase,
}: {
  app: { checkout: ReturnType<typeof import('../support/actions/checkoutActions').createCheckoutActions> }
  page: Page
  entryValue: string
  customer?: {
    name: string
    lastname: string
    email: string
    phone: string
    store: string
  }
}) {
  await expect(page).toHaveURL(/.*\/order/)
  await app.checkout.fillDadosPessoais(customer)
  await app.checkout.selectPaymentMethod('financiamento')
  await app.checkout.setEntryValue(entryValue)
  await app.checkout.checkTerms()
  await app.checkout.submit()
}

// ─── Suite: testes unitários de checkout (mock de navegação via fixture) ──────

testWithCheckout.describe('Checkout', () => {
  testWithCheckout.beforeEach(async ({ checkoutReady }) => {
    void checkoutReady
  })

  testWithCheckout.afterEach(async ({ page }) => {
    if (!page) return
    await page.unroute('**/functions/v1/credit-analysis').catch(() => { })
    await deleteAllOrders()
  })

  testWithCheckout.describe('Validações de campos obrigatórios', () => {
    testWithCheckout('CT04.1 - Exibe erros para formulário em branco', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await expect(page).toHaveURL(/.*\/order/)
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

      await app.checkout.submit()
      await app.checkout.assertErrorMessages([
        'Nome deve ter pelo menos 2 caracteres',
        'Sobrenome deve ter pelo menos 2 caracteres',
        'Email inválido',
        'Telefone inválido',
        'Documento inválido',
        'Selecione uma loja',
        'Aceite os termos',
      ])
      await app.checkout.assertErrorCount(7)
      await app.checkout.assertFieldInvalid('name')
      await expect(page).toHaveURL(/.*\/order/)
    })

    testWithCheckout('CT04.2 - Valida mínimo de caracteres no Nome', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await expect(page).toHaveURL(/.*\/order/)
      await app.checkout.fillDadosPessoais({ name: 'A' })
      await app.checkout.submit()
      await app.checkout.assertErrorMessages(['Nome deve ter pelo menos 2 caracteres'])
      await app.checkout.assertFieldInvalid('name')
      await expect(page).toHaveURL(/.*\/order/)
    })

    testWithCheckout('CT04.3 - Valida mínimo de caracteres no Sobrenome', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await expect(page).toHaveURL(/.*\/order/)
      await app.checkout.fillDadosPessoais({ lastname: 'B' })
      await app.checkout.submit()
      await app.checkout.assertErrorMessages(['Sobrenome deve ter pelo menos 2 caracteres'])
      await app.checkout.assertFieldInvalid('lastname')
      await expect(page).toHaveURL(/.*\/order/)
    })

    testWithCheckout('CT04.4 - Valida formato de e-mail inválido', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await expect(page).toHaveURL(/.*\/order/)
      await app.checkout.fillDadosPessoais({ email: 'cliente@.com' })
      await app.checkout.submit()
      await app.checkout.assertErrorMessages(['Email inválido'])
      await app.checkout.assertFieldInvalid('email')
      await expect(page).toHaveURL(/.*\/order/)
    })

    testWithCheckout('CT04.5 - Valida telefone inválido', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await expect(page).toHaveURL(/.*\/order/)
      await app.checkout.fillDadosPessoais({ phone: '119' })
      await app.checkout.submit()
      await app.checkout.assertErrorMessages(['Telefone inválido'])
      await app.checkout.assertFieldInvalid('phone')
      await expect(page).toHaveURL(/.*\/order/)
    })

    testWithCheckout('CT04.6 - Exige seleção de loja', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await expect(page).toHaveURL(/.*\/order/)
      await app.checkout.fillDadosPessoais({
        name: 'João',
        lastname: 'Silva',
        email: 'joao.silva@email.com',
        phone: '11999999999',
      })
      await app.checkout.submit()
      await app.checkout.assertErrorMessages(['Selecione uma loja'])
      await app.checkout.assertFieldInvalid('store')
      await expect(page).toHaveURL(/.*\/order/)
    })

    testWithCheckout('CT04.7 - Exige aceite dos termos para concluir pedido', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await expect(page).toHaveURL(/.*\/order/)
      await app.checkout.fillDadosPessoais({ ...checkoutCustomers.joao })
      await app.checkout.submit()
      await app.checkout.assertErrorMessages(['Aceite os termos'])
      await app.checkout.assertFieldInvalid('terms')
      await expect(page).toHaveURL(/.*\/order/)
    })
  })

  testWithCheckout.describe('Financiamento - decisão de crédito', () => {
    for (const scenario of creditDecisionCases) {
      testWithCheckout(`${scenario.id} - ${scenario.title}`, async ({ app, page, checkoutReady }) => {
        void checkoutReady
        await app.mock.creditAnalysis(scenario.score)
        await runFinancingCheckoutFlow({ app, page, entryValue: scenario.entryValue })
        await app.checkout.assertSuccessPage({
          heading: scenario.expectedHeading,
          customer: checkoutCustomers.financiamentoBase,
        })
      })
    }
  })

  testWithCheckout.describe('Financiamento - cenários de fronteira', () => {
    for (const scenario of creditBoundaryCases) {
      testWithCheckout(`${scenario.id} - ${scenario.title}`, async ({ app, page, checkoutReady }) => {
        void checkoutReady
        await app.mock.creditAnalysis(scenario.score)
        await runFinancingCheckoutFlow({ app, page, entryValue: scenario.entryValue })
        await app.checkout.assertSuccessPage({
          heading: scenario.expectedHeading,
          customer: checkoutCustomers.financiamentoBase,
        })
      })
    }
  })

  testWithCheckout.describe('Financiamento - falhas da API de crédito', () => {
    testWithCheckout('CT18 - Exibe feedback quando a API retorna 500', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await mockCreditAnalysis(page, 'http-500')
      await runFinancingCheckoutFlow({ app, page, entryValue: '0' })
      await expect(page).toHaveURL(/.*\/order/)
      await app.checkout.assertCreditErrorToast()
    })

    testWithCheckout('CT19 - Exibe feedback quando há falha de rede na API', async ({ app, page, checkoutReady }) => {
      void checkoutReady
      await mockCreditAnalysis(page, 'network-error')
      await runFinancingCheckoutFlow({ app, page, entryValue: '0' })
      await expect(page).toHaveURL(/.*\/order/)
      await app.checkout.assertCreditErrorToast()
    })
  })
})

// ─── Suite: E2E Fluxo Completo (navega do zero) ───────────────────────────────

test.describe('E2E Checkout - Fluxo Completo', () => {
  test.afterEach(async () => {
    await deleteAllOrders()
  })

  test('CT05 - E2E Pagamento à Vista (Fluxo Feliz)', async ({ app, page }) => {
    const customer = checkoutCustomers.ana

    await app.configurator.navigateToCheckout()
    await app.checkout.fillDadosPessoais(customer)
    await app.checkout.selectPaymentMethod('avista')
    await app.checkout.checkTerms()
    await app.checkout.submit()

    await app.checkout.assertSuccessPage({ heading: 'Pedido Aprovado!', customer })
  })

  test('CT06 - Checkout e Análise de Crédito - Financiamento com Score Alto (Aprovado)', async ({ app, page }) => {
    const customer = checkoutCustomers.steve

    await app.configurator.navigateToCheckout()
    await app.checkout.fillDadosPessoais(customer)
    await app.checkout.selectPaymentMethod('financiamento')
    await app.checkout.setEntryValue('0')
    await expect(page.getByText('12x de R$ 3.400,00')).toBeVisible()
    await app.checkout.checkTerms()
    await app.mock.creditAnalysis(710)
    await app.checkout.submit()

    await app.checkout.assertSuccessPage({ heading: 'Pedido Aprovado!', customer })
  })

  test('CT07 - Checkout e Análise de Crédito - Financiamento com Score Médio (Em análise)', async ({ app, page }) => {
    const customer = checkoutCustomers.bill

    await app.configurator.navigateToCheckout()
    await app.checkout.fillDadosPessoais(customer)
    await app.checkout.selectPaymentMethod('financiamento')
    await app.checkout.setEntryValue('0')
    await expect(page.getByText('12x de R$ 3.400,00')).toBeVisible()
    await app.checkout.checkTerms()
    await app.mock.creditAnalysis(600)
    await app.checkout.submit()

    await app.checkout.assertSuccessPage({ heading: 'Pedido em Análise', customer })
  })

  test('CT08-A - Checkout e Análise de Crédito - Score Baixo (Reprovado), entrada < 50%', async ({ app, page }) => {
    const customer = checkoutCustomers.elon

    await app.configurator.navigateToCheckout()
    await app.checkout.fillDadosPessoais(customer)
    await app.checkout.selectPaymentMethod('financiamento')
    await app.checkout.setEntryValue('0')
    await expect(page.getByText('12x de R$ 3.400,00')).toBeVisible()
    await app.checkout.checkTerms()
    await app.mock.creditAnalysis(450)
    await app.checkout.submit()

    await app.checkout.assertSuccessPage({ heading: 'Crédito Reprovado', customer })
  })

  test('CT08-B - Checkout e Análise de Crédito - Score Baixo (Aprovado), entrada >= 50%', async ({ app, page }) => {
    const customer = checkoutCustomers.elon

    await app.configurator.navigateToCheckout()
    await app.checkout.fillDadosPessoais(customer)
    await app.checkout.selectPaymentMethod('financiamento')
    // Valor da entrada maior que 50% (R$ 25.000 de R$ 40.000)
    await app.checkout.setEntryValue('25000')
    // Cálculo: (15000 / 12) * 1.02 = 1275.00
    await expect(page.getByText('12x de R$ 1.275,00')).toBeVisible()
    await app.checkout.checkTerms()
    await app.mock.creditAnalysis(450)
    await app.checkout.submit()

    // Regra CT09: Entrada >= 50% aprova o pedido independentemente do score baixo
    await app.checkout.assertSuccessPage({ heading: 'Pedido Aprovado!', customer })
  })
})
