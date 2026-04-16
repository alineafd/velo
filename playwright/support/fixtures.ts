import { test as base } from '@playwright/test'

import { createHeaderNavActions } from './actions/headerNavActions'
import { createHomeActions } from './actions/homeActions'
import { createOrderLookupActions } from './actions/orderLookupActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createCheckoutActions } from './actions/checkoutActions'

type App = {
  home: ReturnType<typeof createHomeActions>
  headerNav: ReturnType<typeof createHeaderNavActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  checkout: ReturnType<typeof createCheckoutActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      home: createHomeActions(page),
      headerNav: createHeaderNavActions(page),
      orderLookup: createOrderLookupActions(page),
      configurator: createConfiguratorActions(page),
      checkout: createCheckoutActions(page),
    }
    await use(app)
  },
})

export { expect } from '@playwright/test'
