import { describe, it, expect } from 'vitest';
import { determineCreditStatus } from './creditDecision';

/**
 * Testes unitários das regras de aprovação de crédito.
 * Cobre todos os limites e a ordem de prioridade das regras de negócio.
 */
describe('Lógica de Aprovação de Crédito', () => {
  const TOTAL = 40000;

  // ─── Regra 2: Score Alto ──────────────────────────────────────────────────

  it('CT-06: Score > 700 sem entrada deve resultar em APROVADO', () => {
    const status = determineCreditStatus(750, TOTAL, 0);
    expect(status).toBe('APROVADO');
  });

  it('CT-11: Score exatamente 701 deve resultar em APROVADO (limite inferior da regra 2)', () => {
    const status = determineCreditStatus(701, TOTAL, 0);
    expect(status).toBe('APROVADO');
  });

  // ─── Regra 4: Score Baixo ─────────────────────────────────────────────────

  it('CT-07: Score <= 500 sem entrada suficiente deve resultar em REPROVADO', () => {
    const status = determineCreditStatus(450, TOTAL, 0.3 * TOTAL);
    expect(status).toBe('REPROVADO');
  });

  it('CT-10: Score exatamente 500 deve resultar em REPROVADO (limite máximo da regra 4)', () => {
    const status = determineCreditStatus(500, TOTAL, 0);
    expect(status).toBe('REPROVADO');
  });

  // ─── Regra 3: Score Médio ─────────────────────────────────────────────────

  it('CT-08: Score entre 501 e 700 sem entrada alta deve resultar em EM_ANALISE', () => {
    const status = determineCreditStatus(600, TOTAL, 0);
    expect(status).toBe('EM_ANALISE');
  });

  // ─── Regra 1: Entrada Alta (prioridade máxima) ───────────────────────────

  it('CT-09: Entrada >= 50% com score médio deve resultar em APROVADO (regra da entrada sobrescreve)', () => {
    const status = determineCreditStatus(600, TOTAL, 0.55 * TOTAL);
    expect(status).toBe('APROVADO');
  });
});
