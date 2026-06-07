import { db } from './client'
import type { OrderStatus } from '../types/orderDetails'
import { createClient } from '@supabase/supabase-js'

// Try to use Supabase REST API instead of direct PG connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://znwprdwniwtocmitjwjj.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-8tjIfgKS5v-gHau8QM-pw_NxZex6FY'
const supabase = createClient(supabaseUrl, supabaseKey)

// ---------------------------------------------------------------------------
// Order Seed Payloads
// ---------------------------------------------------------------------------
// Each status has a canonical test order with deterministic data so assertions
// in pedidos.spec.ts can rely on stable values.
// ---------------------------------------------------------------------------

export type SeedOrderInput = {
  order_number: string
  status: OrderStatus
  color: string
  wheel_type: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string
  payment_method: string
  total_price: number
  optionals: string[]
}

export const TEST_ORDERS = {
  APROVADO: {
    order_number: 'VLO-TEST01',
    status: 'APROVADO' as OrderStatus,
    color: 'glacier-blue',
    wheel_type: 'sport',
    customer_name: 'Aline Dias',
    customer_email: 'alineafd.dias@gmail.com',
    customer_phone: '(11) 99999-9999',
    customer_cpf: '082.455.340-30',
    payment_method: 'avista',
    total_price: 47500,
    optionals: ['precision-park'],
  },

  REPROVADO: {
    order_number: 'VLO-TEST02',
    status: 'REPROVADO' as OrderStatus,
    color: 'glacier-blue',
    wheel_type: 'aero',
    customer_name: 'Pedro Paulo',
    customer_email: 'pedro@email.com',
    customer_phone: '(11) 95555-5555',
    customer_cpf: '',
    payment_method: 'financiamento',
    total_price: 40800,
    optionals: [],
  },

  EM_ANALISE: {
    order_number: 'VLO-TEST03',
    status: 'EM_ANALISE' as OrderStatus,
    color: 'glacier-blue',
    wheel_type: 'aero',
    customer_name: 'Ana Luiza',
    customer_email: 'ana.luiza@email.com',
    customer_phone: '(11) 96666-6666',
    customer_cpf: '',
    payment_method: 'financiamento',
    total_price: 40800,
    optionals: [],
  },
} satisfies Record<OrderStatus, SeedOrderInput>

// ---------------------------------------------------------------------------
// Seed & Cleanup helpers
// ---------------------------------------------------------------------------

/**
 * Inserts a test order into the `orders` table.
 * Uses INSERT ... ON CONFLICT DO UPDATE so running the suite multiple times
 * is always idempotent.
 */
export async function seedOrder(order: SeedOrderInput): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .upsert({
        order_number: order.order_number,
        status: order.status,
        color: order.color,
        wheel_type: order.wheel_type,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        customer_cpf: order.customer_cpf,
        payment_method: order.payment_method,
        total_price: order.total_price,
        optionals: order.optionals,
      }, { onConflict: 'order_number' })

    if (error) {
      console.warn('[Test DB] Could not seed order with Supabase:', error.message)
    }
  } catch (error) {
    console.warn('[Test DB] Could not seed order:', error.message)
  }
}

/**
 * Removes a test order from the `orders` table by order_number.
 */
export async function cleanupOrder(orderNumber: string): Promise<void> {
  try {
    await supabase.from('orders').delete().eq('order_number', orderNumber)
  } catch (error) {
    console.warn('[Test DB] Could not cleanup order:', error.message)
  }
}

/**
 * Seeds all canonical test orders (APROVADO, REPROVADO, EM_ANALISE).
 * Call this in `test.beforeAll` to ensure data exists before the suite runs.
 */
export async function seedAllTestOrders(): Promise<void> {
  for (const order of Object.values(TEST_ORDERS)) {
    await seedOrder(order)
  }
}

/**
 * Removes all canonical test orders.
 * Call this in `test.afterAll` to clean up after the suite runs.
 */
export async function cleanupAllTestOrders(): Promise<void> {
  for (const order of Object.values(TEST_ORDERS)) {
    await cleanupOrder(order.order_number)
  }
}

/**
 * Removes all orders from the database.
 * Call this to clean up dynamically generated orders during tests.
 */
export async function deleteAllOrders(): Promise<void> {
  try {
    await supabase.from('orders').delete().neq('order_number', 'DO_NOT_DELETE')
  } catch (error) {
    console.warn('[Test DB] Could not delete orders:', error.message)
  }
}

/**
 * Resets canonical test orders by cleaning and seeding again.
 * Useful in `test.beforeEach` to guarantee deterministic state per scenario.
 */
export async function resetAllTestOrders(): Promise<void> {
  await cleanupAllTestOrders()
  await seedAllTestOrders()
}
