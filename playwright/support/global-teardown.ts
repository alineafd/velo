import { db } from './database/client'

async function globalTeardown() {
  console.log('\n[Global Teardown] Removendo massa de dados do banco de dados...')
  try {
    await db.deleteFrom('orders').execute()
    console.log('[Global Teardown] Massa de dados deletada com sucesso.\n')
  } catch (error) {
    console.error('[Global Teardown] Erro ao deletar dados:', error)
  } finally {
    // We destroy the connection to prevent Playwright from hanging
    await db.destroy()
  }
}

export default globalTeardown
