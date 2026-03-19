import { test, expect } from '../../src/fixtures';

// Year is a react-select dropdown (id="react-select-4-input").
// Options are discovered at runtime via homePage.getAvailableYears().

test.describe('Year of Release Filter', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC-YR-01 · Filtering by year 2020 returns content', async ({ homePage }) => {
    await homePage.selectStartYear('2020');
    await homePage.assertHasContent();
  });

  test('TC-YR-02 · Filtering by most recent available year returns content', async ({ homePage }) => {
    const years = await homePage.getAvailableYears();
    const numericYears = years
      .map(y => parseInt(y, 10))
      .filter(y => !isNaN(y))
      .sort((a, b) => b - a);

    if (numericYears.length === 0) {
      test.skip();
      return;
    }

    await homePage.selectStartYear(String(numericYears[0]));
    await homePage.assertHasContent();
  });

  test('TC-YR-03 · Filtering by earliest available year returns content', async ({ homePage }) => {
    const years = await homePage.getAvailableYears();
    const numericYears = years
      .map(y => parseInt(y, 10))
      .filter(y => !isNaN(y))
      .sort((a, b) => a - b);

    if (numericYears.length === 0) {
      test.skip();
      return;
    }

    await homePage.selectStartYear(String(numericYears[0]));
    await homePage.assertHasContent();
  });
});
