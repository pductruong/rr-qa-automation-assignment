import { test, expect } from '../../src/fixtures';

test.describe('Title Filter', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC-TTL-01 · Searching a known title returns matching results', async ({ homePage }) => {
    await homePage.searchByTitle('Batman');
    await homePage.assertHasContent();
    const titles = await homePage.getContentCardTitles();
    const allMatch = titles.every(t => t.toLowerCase().includes('batman'));
    expect(allMatch).toBe(true);
  });

  test('TC-TTL-02 · Partial title search returns relevant results', async ({ homePage }) => {
    await homePage.searchByTitle('Mar');
    const count = await homePage.getContentCardCount();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-TTL-03 · Non-existent title shows empty state', async ({ homePage }) => {
    await homePage.searchByTitle('zzznonexistent99999');
    await homePage.assertNoContent();
  });

  test('TC-TTL-04 · Clearing title filter restores results', async ({ homePage }) => {
    await homePage.searchByTitle('Batman');
    await homePage.clearTitleSearch();
    await homePage.assertHasContent();
  });
});
