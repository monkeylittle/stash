const { test, expect } = require('@playwright/test');
const { pages } = require('./pages');

// Mobile menu: runs in the iPhone project (WebKit). Regression test for the menu
// being painted underneath the page header photo on inner pages.
test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'iPhone project only');

  for (const url of pages) {
    test(`opens, is tappable and closes on ${url}`, async ({ page }) => {
      await page.goto(url);
      const toggle = page.locator('.nav-toggle');
      const nav = page.locator('.nav');
      await expect(toggle).toBeVisible();
      await expect(nav).toBeHidden();

      await toggle.tap();
      await expect(nav).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      // Every menu item must be the topmost element at its centre, i.e. not covered by the page.
      for (const link of await nav.locator('a').all()) {
        await expect(link).toBeVisible();
        const text = await link.innerText();
        const covered = await link.evaluate(el => {
          const r = el.getBoundingClientRect();
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return !(top === el || el.contains(top));
        });
        expect(covered, `"${text}" is covered by another element`).toBe(false);
      }

      await toggle.tap();
      await expect(nav).toBeHidden();
    });
  }

  test('tapping a menu item navigates', async ({ page }) => {
    await page.goto('/about/');
    await page.locator('.nav-toggle').tap();
    await page.locator('.nav a', { hasText: 'Gallery' }).tap();
    await expect(page).toHaveURL(/\/gallery\/$/);
  });
});

test.describe('desktop menu', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop project only');
  test('shows the links inline without the toggle', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('.nav-toggle')).toBeHidden();
    await expect(page.locator('.nav a').first()).toBeVisible();
  });
});
