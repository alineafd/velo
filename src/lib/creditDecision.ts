/**
 * Módulo de decisão de crédito.
 * Contém a lógica pura de negócio para determinar o status de aprovação
 * de pedidos com financiamento, sem dependência de UI ou estado externo.
 */

export type CreditStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE';

/**
 * Determina o status de crédito com base no score e no percentual de entrada.
 *
 * Regras (avaliadas em ordem de prioridade):
 * 1. Entrada Alta: entrada >= 50% do total E score < 700 → APROVADO
 * 2. Score Alto: score > 700 → APROVADO
 * 3. Score Médio: score entre 501 e 700 → EM_ANALISE
 * 4. Score Baixo: score <= 500 → REPROVADO
 *
 * @param score        Score de crédito do cliente (0–1000)
 * @param totalPrice   Valor total do veículo
 * @param entryValue   Valor de entrada informado pelo cliente
 */
export function determineCreditStatus(
  score: number,
  totalPrice: number,
  entryValue: number
): CreditStatus {
  const entryPercentage = totalPrice > 0 ? entryValue / totalPrice : 0;

  // 1️⃣ Regra da Entrada Alta: entrada >= 50% sobrescreve score médio/baixo
  if (entryPercentage >= 0.5 && score < 700) return 'APROVADO';

  // 2️⃣ Score Alto
  if (score > 700) return 'APROVADO';

  // 3️⃣ Score Médio
  if (score >= 501 && score <= 700) return 'EM_ANALISE';

  // 4️⃣ Score Baixo (score <= 500)
  return 'REPROVADO';
}
