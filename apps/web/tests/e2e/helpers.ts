import { expect, type Page, type TestInfo } from '@playwright/test';

const SCREENS = 'test-results/screens';

export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

export async function expectNoSidewaysScroll(page: Page) {
  const width = page.viewportSize()?.width ?? 0;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
}

export async function shoot(page: Page, name: string, testInfo: TestInfo) {
  await page.screenshot({ path: `${SCREENS}/${name}-${testInfo.project.name}.png` });
}

export const breaker = (page: Page, replica: 1 | 2 | 3) =>
  page.getByRole('switch', { name: `Replica G${replica} breaker` });

export const section = (page: Page, number: 1 | 2 | 3) =>
  page.locator(`svg[role="img"] [data-section="${number}"]`);

export const tape = (page: Page) => page.getByRole('log');
