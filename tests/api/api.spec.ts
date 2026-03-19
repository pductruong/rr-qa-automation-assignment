import { test, expect } from '../../src/fixtures';

/**
 * API Interception Tests — TMDB Discover
 *
 * These tests use Playwright's page.waitForResponse() (via homePage.interceptApiCall)
 * to assert that the browser sends the correct TMDB API requests when the user
 * interacts with filters and pagination.
 *
 * TMDB API base: https://api.themoviedb.org/3
 *
 * Category → endpoint mapping (Movies):
 *   Popular    → GET /movie/popular
 *   Trend      → GET /trending/movie/week
 *   Newest     → GET /movie/now_playing
 *   Top rated  → GET /movie/top_rated
 *
 * Discover endpoint (used when genre / year / rating filters are applied):
 *   GET /discover/movie  (or /discover/tv for TV Shows)
 *   Params: sort_by, with_genres, release_date.gte, release_date.lte,
 *           vote_average.gte, vote_average.lte, page, api_key
 */

const TMDB_BASE = 'api.themoviedb.org/3';

test.describe('Browser API Calls — Category Endpoints', () => {
  test('TC-API-01 · Popular category calls /movie/popular', async ({ homePage, page }) => {
    // Intercept must be set up BEFORE the action that triggers the request
    const capture = homePage.interceptApiCall(/movie\/popular/);

    await homePage.open(); // navigates to root which defaults to Popular

    const { status, url } = await capture;

    expect(status).toBe(200);
    expect(url).toContain(`${TMDB_BASE}/movie/popular`);
  });

  test('TC-API-02 · Trend category calls /trending/movie/week', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/trending\/movie\/week/);
    await homePage.selectCategory('Trend');

    const { status, url } = await capture;

    expect(status).toBe(200);
    expect(url).toContain(`${TMDB_BASE}/trending/movie/week`);
  });

  test('TC-API-03 · Newest category calls /movie/now_playing', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/movie\/now_playing/);
    await homePage.selectCategory('Newest');

    const { status, url } = await capture;

    expect(status).toBe(200);
    expect(url).toContain(`${TMDB_BASE}/movie/now_playing`);
  });

  test('TC-API-04 · Top rated category calls /movie/top_rated', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/movie\/top_rated/);
    await homePage.selectCategory('Top rated');

    const { status, url } = await capture;

    expect(status).toBe(200);
    expect(url).toContain(`${TMDB_BASE}/movie/top_rated`);
  });

  test('TC-API-05 · TV Show type selection calls /tv/popular endpoint', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/tv\/popular/);
    await homePage.selectType('TV Show');

    const { status, url } = await capture;

    expect(status).toBe(200);
    expect(url).toContain(`${TMDB_BASE}/tv/popular`);
  });
});

test.describe('Browser API Calls — Discover Filter Parameters', () => {
  test('TC-API-06 · Genre filter sends with_genres param in /discover/movie', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/discover\/movie/);
    await homePage.selectGenre('Action');

    const { status, url, params } = await capture;

    expect(status).toBe(200);
    expect(url).toContain(`${TMDB_BASE}/discover/movie`);
    // with_genres should be a numeric TMDB genre ID (e.g. 28 for Action)
    expect(params['with_genres']).toBeTruthy();
  });

  test('TC-API-07 · Year filter sends release_date.gte and release_date.lte params', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/discover\/movie/);
    await homePage.selectStartYear('2020');

    const { status, params } = await capture;

    expect(status).toBe(200);
    expect(params['release_date.gte']).toMatch(/^2020/);
    expect(params['release_date.lte']).toMatch(/^2020/);
  });

  test('TC-API-08 · Rating filter sends vote_average.gte param', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/discover\/movie/);
    await homePage.setRating(3);

    const { status, params } = await capture;

    expect(status).toBe(200);
    expect(params['vote_average.gte']).toBeTruthy();
    // The 3-star widget maps to some minimum vote_average value
    const voteMin = parseFloat(params['vote_average.gte']);
    expect(voteMin).toBeGreaterThan(0);
  });

  test('TC-API-09 · Discover response body contains results array and total_pages', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/discover\/movie/);
    await homePage.selectGenre('Action');

    const { body } = await capture;

    const data = body as Record<string, unknown>;
    expect(Array.isArray(data['results'])).toBe(true);
    expect(typeof data['total_pages']).toBe('number');
    expect(typeof data['total_results']).toBe('number');
  });
});

test.describe('Browser API Calls — Pagination', () => {
  test('TC-API-10 · Navigating to page 2 sends page=2 in the API request', async ({ homePage }) => {
    await homePage.open();

    const capture = homePage.interceptApiCall(/movie\/popular/);
    await homePage.goToNextPage();

    const { status, params } = await capture;

    expect(status).toBe(200);
    expect(params['page']).toBe('2');
  });

  test('TC-API-11 · Returning to page 1 sends page=1 in the API request', async ({ homePage }) => {
    await homePage.open();
    await homePage.goToNextPage(); // advance to page 2 first

    const capture = homePage.interceptApiCall(/movie\/popular/);
    await homePage.goToPreviousPage();

    const { status, params } = await capture;

    expect(status).toBe(200);
    expect(params['page']).toBe('1');
  });
});
