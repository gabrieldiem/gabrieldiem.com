import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { breaker, section } from './helpers';

// Audits the page against WCAG 2.1 A/AA with axe-core. Reduced motion: audits see settled screens,
// and the reduced-motion paths get exercised.
test.use({ reducedMotion: 'reduce' });

async function audit(page: Page, name: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${name}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`);
  expect(serious, serious.join('\n')).toEqual([]);
}

test('the whole page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('switch')).toHaveCount(3);
  await audit(page, 'page');
});

test('during a failover and after the bug test', async ({ page }) => {
  await page.goto('/');
  await breaker(page, 2).click();
  await expect(section(page, 2)).toHaveAttribute('data-owner', '1');
  await page.getByRole('button', { name: 'Line: to.mu.Lock()', exact: true }).click();
  await audit(page, 'failover and verdict');
});

test('the blackout dialog', async ({ page }) => {
  await page.goto('/');
  for (const replica of [1, 2, 3] as const) await breaker(page, replica).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await audit(page, 'blackout');
});

test('reduced motion turns off the current but keeps the failover', async ({ page }) => {
  await page.goto('/');
  await breaker(page, 1).click();
  await expect(section(page, 1)).toHaveAttribute('data-owner', '2');
  const flow = section(page, 2).locator('path').nth(1);
  expect(await flow.evaluate((el) => getComputedStyle(el).display)).toBe('none');
});
