import { expect, test } from '@playwright/test';
import { breaker, collectErrors, section, shoot, tape } from './helpers';

test('a tripped replica fails over and comes back', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await breaker(page, 2).click();
  await expect(breaker(page, 2)).toHaveAttribute('aria-checked', 'false');
  await expect(section(page, 2)).toHaveAttribute('data-owner', '1');
  await expect(tape(page)).toContainText('G1 read the checkpoint');
  await shoot(page, 'failover', testInfo);

  await breaker(page, 2).click();
  await expect(section(page, 2)).toHaveAttribute('data-owner', '2');
  expect(errors).toEqual([]);
});

test('the last replica blacks out the page, the knife switch brings it back', async ({
  page,
}, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/');
  for (const replica of [2, 1, 3] as const) {
    await breaker(page, replica).click();
    if (replica !== 3) await expect(section(page, replica)).not.toHaveAttribute('data-owner', '0');
  }
  const dialog = page.getByRole('dialog', { name: 'That was the last replica' });
  await expect(dialog).toBeVisible();
  const knife = dialog.getByRole('button', { name: 'Black start' });
  await expect(knife).toBeFocused();
  await shoot(page, 'blackout', testInfo);

  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden({ timeout: 8000 });
  await expect(breaker(page, 3)).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });
  await expect(section(page, 3)).toHaveAttribute('data-owner', '3');
  await expect(tape(page)).toContainText('Nothing lost', { timeout: 5000 });
  await expect(breaker(page, 1)).toBeFocused();
  expect(errors).toEqual([]);
});

test('Escape also starts the plant from the blackout', async ({ page }) => {
  await page.goto('/');
  for (const replica of [1, 2, 3] as const) await breaker(page, replica).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden({ timeout: 8000 });
});

test('a single window never reports another one', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(5000);
  await expect(tape(page)).not.toContainText('Another window');
  await expect(tape(page)).not.toContainText('Lost the heartbeat');
});

test('the session survives a reload', async ({ page }) => {
  await page.goto('/');
  await breaker(page, 1).click();
  await expect(page.getByTestId('trips')).toHaveText('0001');
  await page.reload();
  await expect(page.getByTestId('trips')).toHaveText('0001');
  await expect(tape(page)).toContainText('restored from checkpoint');
});

test('two windows share one cluster, and closing one is a failure', async ({ context }) => {
  const left = await context.newPage();
  await left.goto('/');
  const right = await context.newPage();
  await right.goto('/');
  await expect(left.getByRole('log')).toContainText('Another window joined');

  await breaker(left, 2).click();
  await expect(breaker(right, 2)).toHaveAttribute('aria-checked', 'false');
  await expect(section(right, 2)).toHaveAttribute('data-owner', '1');

  await breaker(left, 1).click();
  await breaker(left, 3).click();
  await expect(right.getByRole('dialog')).toBeVisible();
  await left.getByRole('button', { name: 'Black start' }).click();
  await expect(right.getByRole('dialog')).toBeHidden({ timeout: 8000 });

  await right.close();
  await expect(left.getByRole('log')).toContainText(/A window left|Lost the heartbeat/, {
    timeout: 8000,
  });
});
