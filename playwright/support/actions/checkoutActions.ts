import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  return {
    async fillDadosPessoais(data: {
      name?: string
      surname?: string
      email?: string
      phone?: string
      cpf?: string
      store?: string
    }) {
      // Exact: true evita que getByLabel('Nome') também resolva 'Sobrenome'
      if (data.name !== undefined)
        await page.getByLabel('Nome', { exact: true }).fill(data.name)
      if (data.surname !== undefined)
        await page.getByLabel('Sobrenome', { exact: true }).fill(data.surname)
      if (data.email !== undefined)
        await page.getByLabel('Email', { exact: true }).fill(data.email)
      if (data.phone !== undefined)
        await page.getByLabel('Telefone', { exact: true }).fill(data.phone)
      if (data.cpf !== undefined)
        await page.getByLabel('CPF', { exact: true }).fill(data.cpf)
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
          page.locator('p.text-destructive').filter({ hasText: msg }).first()
        ).toBeVisible()
      }
    },
  }
}
