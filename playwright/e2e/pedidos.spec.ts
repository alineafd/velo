import { expect, test } from '../support/fixtures'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { OrderDetails } from '../support/types/orderDetails'
import { resetAllTestOrders, cleanupAllTestOrders } from '../support/database/orderFactory'

/// AAA - Arrange, Act, Assert

type OrdersFixture = Record<'APROVADO' | 'REPROVADO' | 'EM_ANALISE', OrderDetails>
const currentFilePath = fileURLToPath(import.meta.url)
const currentDirPath = dirname(currentFilePath)
const ordersFixture: OrdersFixture = JSON.parse(
  readFileSync(resolve(currentDirPath, '../support/fixtures/orders.json'), 'utf-8')
) as OrdersFixture

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await resetAllTestOrders()
    await app.home.goto()
    await app.headerNav.goToConsultarPedido()
    await app.orderLookup.expectLoaded()
  })

  test.afterEach(async () => {
    await cleanupAllTestOrders()
  })

  test('CT10 - Consulta de Pedidos - Consultar um Pedido Existente com Sucesso (APROVADO)', async ({ app }) => {
    const order = ordersFixture.APROVADO

    // Act
    await app.orderLookup.searchOrder(order.number)

    // Assert
    await app.orderLookup.assertOrderSearchResult(order)
  })

  test('CT10 - Consulta de Pedidos - Consultar um Pedido Existente com Sucesso (REPROVADO)', async ({ app }) => {
    const order = ordersFixture.REPROVADO

    await app.orderLookup.searchOrder(order.number)

    // Assert
    await app.orderLookup.assertOrderSearchResult(order)
  })

  test('CT10 - Consulta de Pedidos - Consultar um Pedido Existente com Sucesso (EM_ANALISE)', async ({ app }) => {
    const order = ordersFixture.EM_ANALISE

    // Act
    await app.orderLookup.searchOrder(order.number)

    // Assert
    await app.orderLookup.assertOrderSearchResult(order)
  })

  test('CT11 - Consulta de Pedidos - Número de Pedido Não Encontrado (Inválido)', async ({ app }) => {
    await app.orderLookup.searchOrder('VLO-NOTEX1')
    await app.orderLookup.validateOrderNotFound()
  })

  test('CT11 - Consulta de Pedidos - Número de Pedido Não Encontrado (Formato Inválido)', async ({ app }) => {
    await app.orderLookup.searchOrder('12345-sem-formato')
    await app.orderLookup.validateOrderNotFound()
  })

  test('CT11 - Consulta de Pedidos - Proteger Busca Vazia', async ({ app, page }) => {
    const button = page.getByRole('button', { name: 'Buscar Pedido' })
    await expect(app.orderLookup.elements.searchButton).toBeDisabled()
    await app.orderLookup.elements.orderInput.fill('       ')
    await expect(button).toBeDisabled()
  })
})
