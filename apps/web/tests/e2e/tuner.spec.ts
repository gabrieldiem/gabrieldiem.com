import { expect, test } from '@playwright/test';
import { collectErrors, shoot } from './helpers';

test('the dial tunes by dragging and by keyboard', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  const station = page.getByTestId('station');
  await expect(station).toHaveText('gpt-5.4-nano');

  const dial = page.getByTestId('needle').locator('xpath=ancestor::div[1]');
  await dial.scrollIntoViewIfNeeded();
  const box = await dial.boundingBox();
  if (!box) throw new Error('dial has no box');
  const y = box.y + box.height * 0.85;
  await page.mouse.move(box.x + box.width * 0.1, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, y, { steps: 6 });
  await page.mouse.up();
  const dragged = await station.textContent();
  expect(dragged).not.toBe('gpt-5.4-nano');

  await page.getByRole('slider', { name: 'Tune to a model' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(station).not.toHaveText(dragged ?? '');
  expect(errors).toEqual([]);
});

test('the bug test puts the visitor on the dial and remembers them', async ({ page }, testInfo) => {
  await page.goto('/');
  const line = (text: string) => page.getByRole('button', { name: `Line: ${text}`, exact: true });

  await line('defer to.mu.Unlock()').click();
  await expect(page.getByText('3 out of 20', { exact: true })).toBeVisible();
  await expect(page.getByTestId('station')).toHaveText('You');

  await line('to.mu.Lock()').click();
  await expect(page.getByText('15 out of 20', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Always lock the two accounts/ }).click();
  await expect(page.getByText('20 out of 20', { exact: true })).toBeVisible();
  await expect(page.getByTestId('remark')).toContainText('Ahead of 45 of the 45');
  await page.waitForTimeout(800);
  await shoot(page, 'you-on-the-dial', testInfo);

  await page.reload();
  await expect(page.getByTestId('station')).toHaveText('You');
  await expect(page.getByTestId('remark')).toContainText('Your score from last time');
});
