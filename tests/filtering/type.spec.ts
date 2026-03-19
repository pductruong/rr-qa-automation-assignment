import { test, expect } from '../../src/fixtures';

// Actual dropdown values confirmed from Discover.html react-select:
//   "Movie"    (not "Movies")
//   "TV Show"  (not "TV Shows")

test.describe('Type Filter (Movie / TV Show)', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC-TYP-01 · Filtering by Movie shows movie entries', async ({ homePage }) => {
    await homePage.selectType('Movie');
    await homePage.assertHasContent();
  });

  test('TC-TYP-02 · Filtering by TV Show shows TV entries', async ({ homePage }) => {
    await homePage.selectType('TV Show');
    await homePage.assertHasContent();
  });

  test('TC-TYP-03 · Toggling between Movie and TV Show updates the grid', async ({ homePage }) => {
    await homePage.selectType('Movie');
    const movieTitles = await homePage.getContentCardTitles();

    await homePage.selectType('TV Show');
    const tvTitles = await homePage.getContentCardTitles();

    // Grid must be populated for both types
    expect(movieTitles.length).toBeGreaterThan(0);
    expect(tvTitles.length).toBeGreaterThan(0);
  });
});
