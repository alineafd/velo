import { Page } from '@playwright/test'

/** Navegação do header global (`src/components/landing/Header.tsx`). */
export class AppHeaderNav {
    constructor(private page: Page) { }

    private consultarPedidoDesktop() {
        return this.page.getByTestId('header-nav').getByRole('link', { name: 'Consultar Pedido' })
    }

    private consultarPedidoMobile() {
        return this.page.getByTestId('header-mobile-nav').getByRole('link', { name: 'Consultar Pedido' })
    }

    async goToConsultarPedido() {
        const desktop = this.consultarPedidoDesktop()
        if (await desktop.isVisible()) {
            await desktop.click()
            return
        }

        await this.page.getByTestId('header-menu-toggle').click()
        await this.consultarPedidoMobile().click()
    }
}
