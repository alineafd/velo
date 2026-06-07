import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['node_modules', 'playwright/**'], // Evitar rodar testes do Playwright no Vitest
  },
});
