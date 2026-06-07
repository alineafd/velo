import { describe, it, expect } from 'vitest';
import { 
  calculateTotalPrice, 
  calculateInstallment, 
  formatPrice 
} from './configuratorStore';

describe('Configurator Store & Business Rules', () => {

  describe('Pure Functions', () => {
    it('CT-01: Deve calcular o preço base sem opcionais', () => {
      const config = {
        exteriorColor: 'glacier-blue' as const,
        interiorColor: 'carbon-black' as const,
        wheelType: 'aero' as const,
        optionals: [],
      };
      const total = calculateTotalPrice(config);
      // Preço base = 40000
      expect(total).toBe(40000);
    });

    it('CT-02: Deve adicionar preço de rodas esportivas (Sport Wheels)', () => {
      const config = {
        exteriorColor: 'glacier-blue' as const,
        interiorColor: 'carbon-black' as const,
        wheelType: 'sport' as const, // Custa 2000
        optionals: [],
      };
      const total = calculateTotalPrice(config);
      expect(total).toBe(42000);
    });

    it('CT-03: Deve somar o valor de um opcional específico (Flux Capacitor)', () => {
      const config = {
        exteriorColor: 'glacier-blue' as const,
        interiorColor: 'carbon-black' as const,
        wheelType: 'aero' as const,
        optionals: ['flux-capacitor' as const], // Custa 5000
      };
      const total = calculateTotalPrice(config);
      expect(total).toBe(45000);
    });

    it('CT-04: Deve calcular corretamente o valor da parcela mensal com juros compostos', () => {
      const total = 40000;
      const installment = calculateInstallment(total);
      
      // Juros compostos de 2% a.m em 12x
      // (40000 * 0.02 * (1.02)^12) / ((1.02)^12 - 1)
      const expectedInstallment = 3782.38;
      
      expect(installment).toBe(expectedInstallment);
    });

    it('CT-05: Deve formatar o valor numérico para o padrão de moeda Brasileira (BRL)', () => {
      const formatted = formatPrice(40000);
      
      // Dependendo da implementação do Node, o espaço de separação do R$ pode ser um non-breaking space.
      // Substituindo NBSP por espaço normal para facilitar a comparação, ou usando toMatch
      expect(formatted).toMatch(/R\$\s?40\.000,00/);
    });
  });

});
