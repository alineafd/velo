import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  const formErrors = page.getByTestId('form-message')

  return {
    async fillDadosPessoais(data: {
      name?: string
      lastname?: string
      email?: string
      phone?: string
      document?: string
      store?: string
    }) {
      // Exact: true evita que getByLabel('Nome') também resolva 'Sobrenome'
      if (data.name !== undefined)
        await page.getByLabel('Nome', { exact: true }).fill(data.name)
      if (data.lastname !== undefined)
        await page.getByLabel('Sobrenome', { exact: true }).fill(data.lastname)
      if (data.email !== undefined)
        await page.getByLabel('Email', { exact: true }).fill(data.email)
      if (data.phone !== undefined)
        await page.getByLabel('Telefone', { exact: true }).fill(data.phone)
      if (data.document !== undefined)
        await page.getByLabel('CPF', { exact: true }).fill(data.document)
      if (data.store) {
        // O Select é um combobox; abrimos pelo botão de trigger e clicamos na opção
        await page.getByTestId('checkout-store').click()
        await page.getByRole('option', { name: data.store }).click()
      }
    },

    async checkTerms() {
      // O checkbox está dentro de uma label com o texto "Li e aceito os..."
      await page.getByLabel(/Li e aceito os/).click()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async selectPaymentMethod(method: 'avista' | 'financiamento') {
      if (method === 'avista') {
        await page.getByRole('button', { name: /À Vista/ }).click()
      } else {
        await page.getByRole('button', { name: /Financiamento/ }).click()
      }
    },

    async setEntryValue(value: string) {
      await page.getByLabel('Valor da Entrada', { exact: true }).fill(value)
    },

    async assertErrorMessages(messages: string[]) {
      for (const msg of messages) {
        await expect(
          page.getByTestId('form-message').filter({ hasText: msg }).first()
        ).toBeVisible()
      }
    },

    async assertErrorCount(expected: number) {
      await expect(formErrors).toHaveCount(expected)
    },

    async assertFieldInvalid(field: 'name' | 'lastname' | 'email' | 'phone' | 'document' | 'store' | 'terms') {
      const targets = {
        name: page.getByTestId('checkout-name'),
        lastname: page.getByTestId('checkout-lastname'),
        email: page.getByTestId('checkout-email'),
        phone: page.getByTestId('checkout-phone'),
        document: page.getByTestId('checkout-document'),
        store: page.getByTestId('checkout-store'),
        terms: page.getByTestId('checkout-terms'),
      } as const

      await expect(targets[field]).toHaveClass(/border-destructive/)
    },

    async assertCreditErrorToast() {
      const toastError = page.getByTestId('toast-error')
      await expect(toastError).toBeVisible()
      await expect(toastError).toContainText('Falha ao consultar análise de crédito')
    },

    async assertSuccessPage({
      heading,
      customer,
    }: {
      heading: string
      customer: { name: string; lastname: string; store: string }
    }) {
      await expect(page).toHaveURL(/.*\/success/)
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
      await expect(page.getByText(`${customer.name} ${customer.lastname}`)).toBeVisible()
      await expect(page.getByText(customer.store)).toBeVisible()
    },
  }
}
