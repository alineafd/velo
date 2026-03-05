import { test, expect } from '@playwright/test';

test('deve consultar um pedido aprovado', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  await page.getByRole('textbox', { name: 'Número do Pedido' }).click();
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-LRG3MN');
  await page.getByRole('button', { name: 'Buscar Pedido' }).click();
  await page.getByText('VLO-LRG3MN');
  await page.getByText('APROVADO');
});