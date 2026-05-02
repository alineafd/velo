import { Page, expect } from '@playwright/test'

import type { OrderDetails, OrderStatus } from '../types/orderDetails'

const DEFAULT_MODEL_NAME = 'Velô Sprint'
const DEFAULT_INTERIOR = 'cream'
const DEFAULT_MODEL_IMAGE_ALT = 'Velô Sprint'

type ResolvedOrderDetails = Required<OrderDetails>

function resolveOrderDetails(order: OrderDetails): ResolvedOrderDetails {
  return {
    ...order,
    modelName: order.modelName ?? DEFAULT_MODEL_NAME,
    interior: order.interior ?? DEFAULT_INTERIOR,
    modelImageAlt: order.modelImageAlt ?? DEFAULT_MODEL_IMAGE_ALT,
  }
}

function buildOrderDetailsAriaSnapshot(order: ResolvedOrderDetails): string {
  return `
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - status:
              - img
              - text: ${order.status}
            - img "${order.modelImageAlt}"
            - paragraph: Modelo
            - paragraph: ${order.modelName}
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: ${order.interior}
            - paragraph: Rodas
            - paragraph: ${order.wheels}
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name}
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d{2}\\/\\d{2}\\/\\d{4}/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ (\\d+\\.)?\\d+,\\d{2}/
            `
}

export function createOrderLookupActions(page: Page) {
  async function assertOrderDetailsSnapshot(order: ResolvedOrderDetails) {
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(
      buildOrderDetailsAriaSnapshot(order)
    )
  }

  async function assertStatusBadge(status: OrderStatus) {
    const statusClasses = {
      APROVADO: ['bg-green-100', 'text-green-700', 'lucide-circle-check-big'],
      REPROVADO: ['bg-red-100', 'text-red-700', 'lucide-circle-x'],
      EM_ANALISE: ['bg-amber-100', 'text-amber-700', 'lucide-clock'],
    } as const

    const [bgClass, textClass, iconClass] = statusClasses[status]
    const statusBadge = page.getByRole('status').filter({ hasText: status })

    await expect(statusBadge).toHaveClass(new RegExp(bgClass))
    await expect(statusBadge).toHaveClass(new RegExp(textClass))
    await expect(statusBadge.locator('svg')).toHaveClass(new RegExp(iconClass))
  }

  return {

    elements:{
      orderInput: page.getByRole('textbox', { name: 'Número do Pedido' }),
      searchButton: page.getByRole('button', { name: 'Buscar Pedido' }),
    },

    async expectLoaded() {
      await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
    },

    async searchOrder(code: string) {
      await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(code)
      await page.getByRole('button', { name: 'Buscar Pedido' }).click()
    },

    async assertOrderSearchResult(order: OrderDetails) {
      const resolved = resolveOrderDetails(order)
      await assertOrderDetailsSnapshot(resolved)
      await assertStatusBadge(resolved.status)
    },

    async validateOrderNotFound() {
      await expect(page.getByTestId('error-order-not-found')).toBeVisible()
      await expect(page.getByTestId('error-order-not-found')).toHaveText('Pedido não encontrado')
      await expect(page.getByTestId('error-order-not-found-description')).toContainText('Verifique o número do pedido e tente novamente')
    },
  }
}
