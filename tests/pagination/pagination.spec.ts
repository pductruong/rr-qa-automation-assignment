import { test, expect } from '../../src/fixtures';

test.describe('Pagination', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC-PAG-01 · Navigating to page 2 changes content', async ({ homePage }) => {
    const page1Titles = await homePage.getContentCardTitles();
    await homePage.goToNextPage();
    await homePage.assertHasContent();
    const page2Titles = await homePage.getContentCardTitles();
    // Pages should differ
    expect(page1Titles).not.toEqual(page2Titles);
  });

  test('TC-PAG-02 · Navigating back restores page 1 content', async ({ homePage }) => {
    const page1Titles = await homePage.getContentCardTitles();
    await homePage.goToNextPage();
    await homePage.goToPreviousPage();
    const restoredTitles = await homePage.getContentCardTitles();
    expect(restoredTitles).toEqual(page1Titles);
  });

  test('TC-PAG-03 · Previous button is disabled on page 1', async ({ homePage }) => {
    const disabled = await homePage.isPreviousPageDisabled();
    expect(disabled).toBe(true);
  });

  test('TC-PAG-04 · Page indicator updates correctly navigating to page 3', async ({ homePage }) => {
    await homePage.goToNextPage(); // → page 2
    await homePage.goToNextPage(); // → page 3
    const currentPage = await homePage.getCurrentPage();
    expect(currentPage).toContain('3');
  });
});
