import { test, expect } from '../../src/fixtures';

test.describe('Category Filter', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC-CAT-01 · Default state shows Popular content', async ({ homePage }) => {
    await homePage.assertHasContent();
  });

  test('TC-CAT-02 · Switch to Trend loads new content', async ({ homePage }) => {
    // Nav label is "Trend" (not "Trending") per actual HTML
    await homePage.selectCategory('Trend');
    await homePage.assertHasContent();
    const after = await homePage.getContentCardTitles();
    expect(after.length).toBeGreaterThan(0);
  });

  test('TC-CAT-03 · Switch to Newest loads content', async ({ homePage }) => {
    await homePage.selectCategory('Newest');
    await homePage.assertHasContent();
  });

  test('TC-CAT-04 · Switch to Top rated loads content', async ({ homePage }) => {
    // Nav label is "Top rated" (not "Top Rated") per actual HTML
    await homePage.selectCategory('Top rated');
    await homePage.assertHasContent();
  });

  test('TC-CAT-05 · Only one category tab is active at a time', async ({ homePage, page }) => {
    await homePage.selectCategory('Trend');
    // Active tabs have class "text-white"; inactive tabs have "text-blue-500"
    const activeTabs = await page.locator('nav ul.list-none li.text-white').count();
    expect(activeTabs).toBe(1);
  });
});
