const { test, expect } = require('@playwright/test');
const { pages } = require('./pages');

for (const url of pages) {
  test.describe(url, () => {
    test('loads without errors, broken images or horizontal scroll', async ({ page }) => {
      const problems = [];
      page.on('pageerror', e => problems.push('JS error: ' + e.message));
      page.on('console', m => m.type() === 'error' && problems.push('console: ' + m.text()));
      page.on('response', r => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));

      const res = await page.goto(url, { waitUntil: 'load' });
      expect(res.status()).toBe(200);
      await expect(page.locator('h1').first()).toBeVisible();

      // Scroll through so lazy images load, then check none are broken.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);
      const broken = await page.$$eval('img', imgs => imgs.filter(i => i.complete && i.naturalWidth === 0 && i.src).map(i => i.src));
      expect(broken, 'broken images').toEqual([]);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(1);
      expect(problems).toEqual([]);
    });

    test('internal links resolve', async ({ page, request }) => {
      await page.goto(url);
      const hrefs = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/') && !h.startsWith('//')));
      for (const h of new Set(hrefs)) {
        const r = await request.get(h);
        expect(r.status(), h).toBeLessThan(400);
      }
    });
  });
}

test('sponsor links open in a new tab', async ({ page }) => {
  await page.goto('/sponsors/');
  const links = page.locator('a.sponsor');
  expect(await links.count()).toBeGreaterThan(0);
  for (const a of await links.all()) {
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

test('contact form posts to FormSubmit with a honeypot', async ({ page }) => {
  await page.goto('/contact/');
  const form = page.locator('form');
  await expect(form).toHaveAttribute('action', /formsubmit\.co\//);
  await expect(form).toHaveAttribute('method', /post/i);
  await expect(form.locator('input[name="_honey"]')).toHaveCount(1);
});
