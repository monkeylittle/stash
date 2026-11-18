const { test, expect } = require('@playwright/test');

// Regression test: the gallery must not download every photo on page load (slow on mobile data).
test('gallery fetches photos as you scroll, not all up front', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'on desktop the whole gallery is within the lazy-load margin');
  const loaded = new Set();
  page.on('response', r => /\.(webp|jpe?g|png)(\?|$)/.test(r.url()) && loaded.add(r.url()));

  await page.goto('/gallery/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const total = await page.locator('.masonry img').count();
  expect(total).toBeGreaterThan(15);
  const initial = loaded.size;
  expect(initial, `${initial} of ${total} photos fetched before scrolling`).toBeLessThan(total * 0.6);

  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  });
  await page.waitForTimeout(1000);
  expect(loaded.size).toBeGreaterThan(initial);
});

test('opening the viewer loads small thumbnails, not full photos', async ({ page, isMobile }) => {
  await page.goto('/gallery/');
  const tile = page.locator('.masonry a').first();
  await (isMobile ? tile.tap() : tile.click());
  const thumb = page.locator('.lb-thumb img').first();
  await expect(thumb).toBeVisible();
  expect(await thumb.getAttribute('src')).toBe(await tile.getAttribute('data-thumb'));
});
