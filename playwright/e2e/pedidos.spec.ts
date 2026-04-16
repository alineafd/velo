import { expect, test } from '../support/fixtures'

import type { OrderDetails } from '../support/types/orderDetails'

/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.home.goto()

    await app.headerNav.goToConsultarPedido()

    await app.orderLookup.expectLoaded()
  })

  test('CT10 - Consulta de Pedidos - Consultar um Pedido Existente com Sucesso (APROVADO)', async ({ app }) => {
    // Test Data
    const order: OrderDetails = {
      number: 'VLO-LRG3MN',
      status: 'APROVADO',
      color: 'Glacier Blue',
      wheels: 'sport Wheels',
      customer: {
        name: 'Aline Dias',
        email: 'alineafd.dias@gmail.com',
      },
      payment: 'À Vista',
    }

    // Act
    await app.orderLookup.searchOrder(order.number)

    // Assert
    await app.orderLookup.assertOrderSearchResult(order)
  })

  test('CT10 - Consulta de Pedidos - Consultar um Pedido Existente com Sucesso (REPROVADO)', async ({ app }) => {
    // Test Data
    const order: OrderDetails = {
      number: 'VLO-OPUZ21',
      status: 'REPROVADO',
      color: 'Glacier Blue',
      wheels: 'sport Wheels',
      customer: {
        name: 'Steve Jobs',
        email: 'jobs@apple.com',
      },
      payment: 'À Vista',
    }

    await app.orderLookup.searchOrder(order.number)

    // Assert
    await app.orderLookup.assertOrderSearchResult(order)
  })

  test('CT10 - Consulta de Pedidos - Consultar um Pedido Existente com Sucesso (EM_ANALISE)', async ({ app }) => {
    // Test Data
    const order: OrderDetails = {
      number: 'VLO-GWY4NM',
      status: 'EM_ANALISE',
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'Vera Andreia Larissa da Paz',
        email: 'vera_dapaz@isbt.com.br',
      },
      payment: 'À Vista',
    }

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
    const orderInput = page.getByRole('textbox', { name: 'Número do Pedido' })
    await app.orderLookup.elements.orderInput.fill('       ')
    await expect(button).toBeDisabled()
  })

})
