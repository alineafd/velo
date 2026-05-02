import type { Generated } from 'kysely'

// Reflects the current schema after all migrations:
// - exterior_color renamed to color
// - interior_color dropped
// - optionals (TEXT[]) added
export interface OrdersTable {
  id: Generated<string>
  order_number: string
  color: string
  wheel_type: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string
  payment_method: string
  total_price: number
  status: string
  optionals: string[] | null
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface Database {
  orders: OrdersTable
}
