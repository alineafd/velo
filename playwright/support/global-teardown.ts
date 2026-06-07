import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env manually since dotenv is not used
function loadEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env')
  ]
  
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=')
        if (key && !key.trim().startsWith('#') && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
          process.env[key.trim()] = value
        }
      })
      break
    }
  }
}

async function globalTeardown() {
  console.log('\n[Global Teardown] Removendo massa de dados do banco de dados...')
  loadEnv()
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Global Teardown] Credenciais do Supabase não encontradas. Pulando teardown.')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Para usar o REST API, tentamos deletar usando um filtro largo, por exemplo id não nulo
    const { error } = await supabase.from('orders').delete().not('id', 'is', null)
    if (error) throw error
    console.log('[Global Teardown] Massa de dados deletada com sucesso.\n')
  } catch (error) {
    console.error('[Global Teardown] Erro ao deletar dados via REST:', error)
  }
}

export default globalTeardown
