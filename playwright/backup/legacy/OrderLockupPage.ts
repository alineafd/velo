import { Page, expect } from '@playwright/test'

import type { OrderDetails, OrderStatus } from '../../support/types/orderDetails'

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

export class OrderLockupPage {


    constructor(private page: Page) { }

    async expectLoaded() {
        await expect(this.page.getByRole('heading')).toContainText('Consultar Pedido')
    }

    async searchOrder(code: string) {
        await this.page.getByRole('textbox', { name: 'Número do Pedido' }).fill(code)
        await this.page.getByRole('button', { name: 'Buscar Pedido' }).click()
    }

    async assertOrderSearchResult(order: OrderDetails) {
        const resolved = resolveOrderDetails(order)
        await this.assertOrderDetailsSnapshot(resolved)
        await this.assertStatusBadge(resolved.status)
    }

    private buildOrderDetailsAriaSnapshot(order: ResolvedOrderDetails): string {
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
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `
    }

    private async assertOrderDetailsSnapshot(order: ResolvedOrderDetails) {
        await expect(this.page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(
            this.buildOrderDetailsAriaSnapshot(order)
        )
    }

    private async assertStatusBadge(status: OrderStatus) {
        const statusClasses = {
            APROVADO: ['bg-green-100', 'text-green-700', 'lucide-circle-check-big'],
            REPROVADO: ['bg-red-100', 'text-red-700', 'lucide-circle-x'],
            EM_ANALISE: ['bg-amber-100', 'text-amber-700', 'lucide-clock']
        } as const

        const [bgClass, textClass, iconClass] = statusClasses[status]
        const statusBadge = this.page.getByRole('status').filter({ hasText: status })

        await expect(statusBadge).toHaveClass(new RegExp(bgClass))
        await expect(statusBadge).toHaveClass(new RegExp(textClass))
        await expect(statusBadge.locator('svg')).toHaveClass(new RegExp(iconClass))
    }

    async validateOrderNotFound() {
        await expect(this.page.locator('#root')).toMatchAriaSnapshot(`
            - img
            - heading "Pedido não encontrado" [level=3]
            - paragraph: Verifique o número do pedido e tente novamente
            `)
    }
}
