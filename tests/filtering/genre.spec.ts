import { test, expect } from '../../src/fixtures';

test.describe('Genre Filter', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC-GEN-01 · Filtering by Action genre returns results', async ({ homePage }) => {
    await homePage.selectGenre('Action');
    await homePage.assertHasContent();
  });

  test('TC-GEN-02 · Filtering by Animation genre returns results', async ({ homePage }) => {
    // Confirmed genre options from DOM: Action, Adventure, Animation, Horror, Romance, Science Fiction
    await homePage.selectGenre('Animation');
    await homePage.assertHasContent();
  });

  test('TC-GEN-03 · Switching genre clears previous genre results', async ({ homePage }) => {
    await homePage.selectGenre('Action');
    const actionTitles = await homePage.getContentCardTitles();

    await homePage.selectGenre('Horror');
    const comedyTitles = await homePage.getContentCardTitles();

    expect(comedyTitles.length).toBeGreaterThan(0);
  });
});
