import { Page } from '@playwright/test'

/** Navegação do header global (`src/components/landing/Header.tsx`). */
export function createHeaderNavActions(page: Page) {
  function consultarPedidoDesktop() {
    return page.getByTestId('header-nav').getByRole('link', { name: 'Consultar Pedido' })
  }

  function consultarPedidoMobile() {
    return page.getByTestId('header-mobile-nav').getByRole('link', { name: 'Consultar Pedido' })
  }

  return {
    async goToConsultarPedido() {
      const desktop = consultarPedidoDesktop()
      if (await desktop.isVisible()) {
        await desktop.click()
        return
      }

      await page.getByTestId('header-menu-toggle').click()
      await consultarPedidoMobile().click()
    },
  }
}
