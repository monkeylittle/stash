const { test, expect } = require('@playwright/test');

test('gallery photo viewer opens, navigates and closes', async ({ page, isMobile }) => {
  await page.goto('/gallery/');
  const tiles = page.locator('.masonry a');
  expect(await tiles.count()).toBeGreaterThan(2);
  const lb = page.locator('.lightbox');
  await expect(lb).toBeHidden();

  const open = async () => (isMobile ? tiles.first().tap() : tiles.first().click());
  await open();
  await expect(lb).toBeVisible();
  await expect(lb.locator('.lb-thumb')).toHaveCount(await tiles.count());
  const first = await lb.locator('.lb-stage img').getAttribute('src');

  await lb.locator('.lb-next').click();
  await expect.poll(() => lb.locator('.lb-stage img').getAttribute('src')).not.toBe(first);
  await lb.locator('.lb-prev').click();
  await expect.poll(() => lb.locator('.lb-stage img').getAttribute('src')).toBe(first);

  await lb.locator('.lb-thumb').nth(2).click();
  await expect(lb.locator('.lb-thumb.on')).toHaveCount(1);

  await lb.locator('.lb-close').click();
  await expect(lb).toBeHidden();
});

test('news report photo strip opens the viewer', async ({ page, isMobile }) => {
  await page.goto('/news/2026-08-23-youth-nationals/');
  const tile = page.locator('.masonry a').first();
  await (isMobile ? tile.tap() : tile.click());
  await expect(page.locator('.lightbox')).toBeVisible();
  if (!isMobile) { await page.keyboard.press('Escape'); await expect(page.locator('.lightbox')).toBeHidden(); }
});

test('photo credit shows on its own line under the caption', async ({ page, isMobile }) => {
  await page.goto('/gallery/');
  const credited = page.locator('.masonry a[data-credit]:not([data-credit=""])').first();
  expect(await page.locator('.masonry a[data-credit]:not([data-credit=""])').count()).toBeGreaterThan(0);
  await (isMobile ? credited.tap() : credited.click());
  const cap = page.locator('.lb-cap');
  const credit = cap.locator('.lb-credit');
  await expect(credit).toContainText('Photo:');
  const [c, k] = await Promise.all([cap.boundingBox(), credit.boundingBox()]);
  // the credit sits below the first line of caption text
  expect(k.y).toBeGreaterThan(c.y + 10);
  const text = await cap.evaluate(el => el.firstChild.textContent);
  expect(text).not.toContain('Photo:');
});
