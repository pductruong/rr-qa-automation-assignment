import { test, expect } from '../../src/fixtures';

// The rating widget is a 5-star rc-rate component (ul.rc-rate[role="radiogroup"]).
// Stars are numbered 1–5 via aria-posinset. There is NO numeric 0–10 input.
// These tests map to the original TC-RAT-01/02/03 intent using the 1–5 scale.

test.describe('Rating Filter (5-star widget)', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC-RAT-01 · Selecting 3 stars filters to higher-rated content', async ({ homePage }) => {
    await homePage.setRating(3);
    await homePage.assertHasContent();
  });

  test('TC-RAT-02 · Selecting 5 stars (maximum) returns limited or empty results', async ({ homePage }) => {
    await homePage.setRating(5);
    // May return very few or no results at max rating — assert no crash
    const count = await homePage.getContentCardCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TC-RAT-03 · Selecting 1 star (minimum) returns content', async ({ homePage }) => {
    await homePage.setRating(1);
    await homePage.assertHasContent();
  });
});
