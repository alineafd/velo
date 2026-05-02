import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import type { Database } from './schema'
import fs from 'fs'
import path from 'path'

// ---------------------------------------------------------------------------
// Native .env loader
// ---------------------------------------------------------------------------
// Since 'dotenv' is not installed and we cannot install new packages,
// we use a simple native loader to get DATABASE_URL from .env.
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value
      }
    })
  }
}

loadEnv()

// ---------------------------------------------------------------------------
// Kysely Postgres Client
// ---------------------------------------------------------------------------
// Uses PostgresDialect with pg.Pool and the connection string from .env.
// ---------------------------------------------------------------------------

function createDb() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      '[Test DB] DATABASE_URL is not defined in .env.',
    )
  }

  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString,
        max: 10,
      }),
    }),
  })
}

export const db = createDb()
