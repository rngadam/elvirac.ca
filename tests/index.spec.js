const { test, expect } = require('@playwright/test');

test.describe('Elvira Carhuallanqui - Parc-Extension Project', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  const languages = ['fr', 'en', 'es', 'gr', 'pa', 'bn', 'ur', 'hi'];

  languages.forEach((lang) => {
    test(`Language section ${lang} should meet requirements`, async ({ page }) => {
      // First click the tab to make it visible
      if (lang !== 'fr') {
        await page.evaluate(`switchLang('${lang}')`);
      } else {
        await page.evaluate(`switchLang('fr')`);
      }

      const section = page.locator(`#lang-${lang}`);
      await expect(section).toBeVisible();

      // Check for the 5 emojis
      const emojis = ['🗑️', '🚧', '💡', '❄️', '🛑'];
      for (const emoji of emojis) {
        await expect(section.locator(`text="${emoji}"`).first()).toBeVisible();
      }

      // Check if action h3 elements have 'flex items-center' class
      const h3App = section.locator('h3:has-text("📱")');
      const h3Call = section.locator('h3:has-text("📞")');
      if (await h3App.count() > 0) {
        await expect(h3App.first()).toHaveClass(/flex items-center/);
      }
      if (await h3Call.count() > 0) {
        await expect(h3Call.first()).toHaveClass(/flex items-center/);
      }

      // Check 311 highlights
      const highlights = section.locator('.highlight-311');
      const count = await highlights.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test('Urdu section should be RTL', async ({ page }) => {
    await page.evaluate(`switchLang('ur')`);
    const urduList = page.locator('#lang-ur ul');
    await expect(urduList).toHaveAttribute('dir', 'rtl');
  });

  test('Bengali section should not be RTL', async ({ page }) => {
    await page.evaluate(`switchLang('bn')`);
    const bnList = page.locator('#lang-bn ul');
    await expect(bnList).not.toHaveAttribute('dir', 'rtl');

    const bnTitle = page.locator('#lang-bn h2').first();
    await expect(bnTitle).toHaveClass(/text-3xl/);
  });

  test('Urdu language should contain correct translation "میں"', async ({ page }) => {
    await page.evaluate(`switchLang('ur')`);
    const urduSection = page.locator('#lang-ur');
    await expect(urduSection).toContainText('میں');
  });
});
