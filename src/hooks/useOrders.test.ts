import { describe, it, expect, vi } from 'vitest';

// Mock do cliente Supabase para isolar os testes de qualquer conexão real ao banco
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}));

import { dbOrderToOrder, DbOrder } from './useOrders';


/**
 * Testes unitários do mapeamento banco → domínio.
 * Garante que os dados do Supabase são convertidos corretamente
 * para o modelo Order utilizado pela aplicação.
 */

/** Pedido base válido para ser reutilizado e sobrescrito nos testes */
const baseMockDbOrder: DbOrder = {
  id: 'uuid-abc-123',
  order_number: 'VLO-ABC123',
  color: 'glacier-blue',
  wheel_type: 'aero',
  optionals: ['precision-park'],
  customer_name: 'Maria Aparecida Lima',
  customer_email: 'maria@email.com',
  customer_phone: '(11) 99999-9999',
  customer_cpf: '123.456.789-00',
  payment_method: 'avista',
  total_price: 45500,
  status: 'APROVADO',
  created_at: '2026-06-07T00:00:00Z',
  updated_at: '2026-06-07T00:00:00Z',
};

describe('dbOrderToOrder — Mapeamento Banco → Domínio', () => {

  // ─── CT-12: Mapeamento completo ───────────────────────────────────────────

  it('CT-12: Deve mapear todos os campos essenciais de um pedido válido', () => {
    const order = dbOrderToOrder(baseMockDbOrder);

    expect(order.id).toBe('VLO-ABC123');
    expect(order.customer.email).toBe('maria@email.com');
    expect(order.customer.phone).toBe('(11) 99999-9999');
    expect(order.customer.cpf).toBe('123.456.789-00');
    expect(order.status).toBe('APROVADO');
    expect(order.paymentMethod).toBe('avista');
    expect(order.configuration.exteriorColor).toBe('glacier-blue');
    expect(order.configuration.wheelType).toBe('aero');
    expect(order.configuration.optionals).toEqual(['precision-park']);
  });

  // ─── CT-13: Nome composto ─────────────────────────────────────────────────

  it('CT-13: Deve separar corretamente nome e sobrenome em nomes compostos', () => {
    const order = dbOrderToOrder(baseMockDbOrder);

    // "Maria Aparecida Lima" → name: "Maria", surname: "Aparecida Lima"
    expect(order.customer.name).toBe('Maria');
    expect(order.customer.surname).toBe('Aparecida Lima');
  });

  // ─── CT-14: Opcionais nulos ───────────────────────────────────────────────

  it('CT-14: Deve mapear optionals null para array vazio (sem crashar)', () => {
    const order = dbOrderToOrder({ ...baseMockDbOrder, optionals: null });

    expect(order.configuration.optionals).toEqual([]);
  });

  // ─── CT-15: order_number como ID ─────────────────────────────────────────

  it('CT-15: order_number do banco deve ser o id do pedido no domínio', () => {
    const order = dbOrderToOrder(baseMockDbOrder);

    expect(order.id).toBe(baseMockDbOrder.order_number);
  });

  // ─── CT-16: Coerção de tipo do preço ─────────────────────────────────────

  it('CT-16: total_price deve ser convertido para Number mesmo se vier como string do banco', () => {
    // Simula retorno de banco que pode vir como string (comportamento do driver)
    const order = dbOrderToOrder({ ...baseMockDbOrder, total_price: '45500' as unknown as number });

    expect(typeof order.totalPrice).toBe('number');
    expect(order.totalPrice).toBe(45500);
  });
});
