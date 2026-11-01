import { expect, test } from '@playwright/test';
import { collectErrors, expectNoSidewaysScroll, shoot } from './helpers';

// Needs a running stack: `make up`, or `make prod` with E2E_BASE_URL set.

test('every section renders without errors or sideways scroll', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Gabriel Diem' })).toBeAttached();
  await expect(page.getByRole('switch')).toHaveCount(3);
  await expectNoSidewaysScroll(page);
  await page.waitForTimeout(800);
  await shoot(page, 'board', testInfo);

  for (const [name, title] of [
    ['recorder', 'Thirteen years on one roll of paper'],
    ['orders', 'I like AI the way I like any machine'],
    ['tuner', 'Tune in to 45 models hunting concurrency bugs'],
    ['plates', 'Other equipment on site'],
    ['phone', 'Call the control room'],
  ] as const) {
    const heading = page.getByRole('heading', { level: 2, name: title });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    await page.waitForTimeout(150);
    await shoot(page, name, testInfo);
  }
  expect(errors).toEqual([]);
});

test('nothing overflows across the widths people use', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The sweep sets its own viewports, one project is enough');
  for (const width of [320, 360, 390, 600, 768, 1024, 1179, 1180, 1280, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.waitForTimeout(150);
    await expectNoSidewaysScroll(page);
    const card = page.locator('button[aria-label="Line: to.mu.Lock()"]').locator('..');
    const overflow = await card.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow, `code card at ${width}`).toBeLessThanOrEqual(1);
  }
});

test('the wide layout keeps the intro off the bus below it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Only the wide layout places the intro inside the name');
  for (const width of [1180, 1280, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.waitForTimeout(150);
    const gap = await page.evaluate(() => {
      const name = document.querySelector('svg[role="img"]')?.getBoundingClientRect();
      const intro = [...document.querySelectorAll('p')].find((p) =>
        p.textContent?.startsWith('Three replicas'),
      );
      if (!name || !intro) return -999;
      const unit = name.width / 32;
      return name.top + (15.2 - 0.36) * unit - intro.getBoundingClientRect().bottom;
    });
    expect(gap, `gap at ${width}`).toBeGreaterThan(0);
  }
});

test('no personal email and the old easter egg URL still works', async ({ page, request }) => {
  await page.goto('/');
  const html = await page.content();
  expect(html).not.toMatch(/mailto:|[\w.+-]+@gmail\.com/);
  const bear = await request.get('/%F0%9F%90%BB.html');
  expect(bear.status()).toBe(200);
  expect(await bear.text()).toContain('🐻');
});

test('the timeline opens with the current job', async ({ page }) => {
  await page.goto('/');
  const list = page.locator('ol').first();
  await expect(list.getByRole('heading', { level: 3 }).first()).toHaveText(
    'Principal Data & AI Architect at Salesforce',
  );
  await expect(list.getByRole('heading', { level: 3 }).last()).toHaveText(
    'Technician in electromechanical equipment',
  );
});

test('the pen draws as the paper scrolls past', async ({ page }) => {
  await page.goto('/');
  const ink = page.locator('#written rect');
  await expect(ink).toBeAttached();
  const before = Number(await ink.getAttribute('height'));
  await page.locator('ol').first().locator('li').nth(5).scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  expect(Number(await ink.getAttribute('height'))).toBeGreaterThan(before);
});
