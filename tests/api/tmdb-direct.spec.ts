import { test, expect } from '../../src/fixtures';
import {
  GenreListResponseSchema,
  PagedMovieResponseSchema,
  PagedTvResponseSchema,
  TrendingMovieResponseSchema,
  TrendingTvResponseSchema,
} from '../../src/api/schemas';

/**
 * Direct TMDB API Tests
 *
 * These tests call the TMDB API directly (no browser) using Playwright's
 * APIRequestContext via the `apiClient` fixture.
 *
 * Focus: verify HTTP status, required fields, and field types/values
 * on every endpoint the site uses.
 *
 * Structural validation is performed via Zod schema `.parse()` calls, which
 * throw a descriptive ZodError if the response shape does not match.
 */

// ── Genre Lists ───────────────────────────────────────────────────────────────

test.describe('Genre Lists', () => {
  test('GET /genre/movie/list — status 200 and genre fields are valid', async ({ apiClient }) => {
    const { response, body } = await apiClient.getMovieGenres();

    expect(response.status()).toBe(200);
    const parsed = GenreListResponseSchema.parse(body);
    expect(parsed.genres.length).toBeGreaterThan(0);
  });

  test('GET /genre/movie/list — contains expected common genres', async ({ apiClient }) => {
    const { body } = await apiClient.getMovieGenres();

    const parsed = GenreListResponseSchema.parse(body);
    const names = parsed.genres.map(g => g.name);
    expect(names).toContain('Action');
    expect(names).toContain('Comedy');
    expect(names).toContain('Drama');
    expect(names).toContain('Horror');
  });

  test('GET /genre/tv/list — status 200 and genre fields are valid', async ({ apiClient }) => {
    const { response, body } = await apiClient.getTvGenres();

    expect(response.status()).toBe(200);
    const parsed = GenreListResponseSchema.parse(body);
    expect(parsed.genres.length).toBeGreaterThan(0);
  });

  test('GET /genre/tv/list — genre IDs are unique numbers', async ({ apiClient }) => {
    const { body } = await apiClient.getTvGenres();

    const parsed = GenreListResponseSchema.parse(body);
    const ids = parsed.genres.map(g => g.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    ids.forEach(id => expect(Number.isInteger(id)).toBe(true));
  });
});

// ── Movie Category Listings ───────────────────────────────────────────────────

test.describe('Movie Listings', () => {
  test('GET /movie/popular — status 200, paged response, valid movie fields', async ({ apiClient }) => {
    const { response, body } = await apiClient.getPopularMovies();

    expect(response.status()).toBe(200);
    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.page).toBeGreaterThanOrEqual(1);
    expect(parsed.results.length).toBeGreaterThan(0);
    expect(parsed.total_pages).toBeGreaterThan(0);
    expect(parsed.total_results).toBeGreaterThan(0);
  });

  test('GET /movie/popular — page 2 returns different results than page 1', async ({ apiClient }) => {
    const { body: page1 } = await apiClient.getPopularMovies(1);
    const { body: page2 } = await apiClient.getPopularMovies(2);

    const parsed1 = PagedMovieResponseSchema.parse(page1);
    const parsed2 = PagedMovieResponseSchema.parse(page2);
    const ids1 = parsed1.results.map(m => m.id);
    const ids2 = parsed2.results.map(m => m.id);
    expect(ids1).not.toEqual(ids2);
    expect(parsed2.page).toBe(2);
  });

  test('GET /movie/now_playing — status 200 and valid movie fields', async ({ apiClient }) => {
    const { response, body } = await apiClient.getNowPlayingMovies();

    expect(response.status()).toBe(200);
    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
  });

  test('GET /movie/top_rated — vote_average of results is above threshold', async ({ apiClient }) => {
    const { response, body } = await apiClient.getTopRatedMovies();

    expect(response.status()).toBe(200);
    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    parsed.results.forEach(movie => {
      expect(movie.vote_average).toBeGreaterThan(0);
    });
  });

  test('GET /trending/movie/week — status 200 and media_type is "movie"', async ({ apiClient }) => {
    const { response, body } = await apiClient.getTrendingMovies();

    expect(response.status()).toBe(200);
    // TrendingMovieResponseSchema validates media_type: 'movie' on every result
    const parsed = TrendingMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    parsed.results.forEach(movie => {
      expect(movie.media_type).toBe('movie');
    });
  });
});

// ── TV Show Category Listings ─────────────────────────────────────────────────

test.describe('TV Show Listings', () => {
  test('GET /tv/popular — status 200, paged response, valid TV fields', async ({ apiClient }) => {
    const { response, body } = await apiClient.getPopularTv();

    expect(response.status()).toBe(200);
    const parsed = PagedTvResponseSchema.parse(body);
    expect(parsed.page).toBeGreaterThanOrEqual(1);
    expect(parsed.results.length).toBeGreaterThan(0);
    expect(parsed.total_pages).toBeGreaterThan(0);
    expect(parsed.total_results).toBeGreaterThan(0);
  });

  test('GET /tv/on_the_air — status 200 and valid TV fields', async ({ apiClient }) => {
    const { response, body } = await apiClient.getOnAirTv();

    expect(response.status()).toBe(200);
    const parsed = PagedTvResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
  });

  test('GET /tv/top_rated — vote_average of results is above threshold', async ({ apiClient }) => {
    const { response, body } = await apiClient.getTopRatedTv();

    expect(response.status()).toBe(200);
    const parsed = PagedTvResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    parsed.results.forEach(tv => {
      expect(tv.vote_average).toBeGreaterThan(0);
    });
  });

  test('GET /trending/tv/week — status 200 and media_type is "tv"', async ({ apiClient }) => {
    const { response, body } = await apiClient.getTrendingTv();

    expect(response.status()).toBe(200);
    // TrendingTvResponseSchema validates media_type: 'tv' on every result
    const parsed = TrendingTvResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    parsed.results.forEach(tv => {
      expect(tv.media_type).toBe('tv');
    });
  });
});

// ── Title Search ──────────────────────────────────────────────────────────────

test.describe('Title Search', () => {
  test('GET /search/movie — returns results matching the query', async ({ apiClient }) => {
    const { response, body } = await apiClient.searchMovies('Batman');

    expect(response.status()).toBe(200);
    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    // At least one result should contain "batman" in its title
    const titles = parsed.results.map(m => m.title.toLowerCase());
    expect(titles.some(t => t.includes('batman'))).toBe(true);
  });

  test('GET /search/movie — empty query string returns results (no crash)', async ({ apiClient }) => {
    const { response, body } = await apiClient.searchMovies('');

    // TMDB returns 200 with empty results for blank query
    expect(response.status()).toBe(200);
    expect(Array.isArray(body.results)).toBe(true);
  });

  test('GET /search/movie — non-existent title returns empty results', async ({ apiClient }) => {
    const { response, body } = await apiClient.searchMovies('zzznonexistent99999');

    expect(response.status()).toBe(200);
    expect(body.results).toHaveLength(0);
    expect(body.total_results).toBe(0);
  });
});

// ── Discover ──────────────────────────────────────────────────────────────────

test.describe('Discover — Movies', () => {
  test('GET /discover/movie — default params returns status 200 and results', async ({ apiClient }) => {
    const { response, body } = await apiClient.discoverMovies();

    expect(response.status()).toBe(200);
    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
  });

  test('GET /discover/movie — with_genres filters to matching genre IDs', async ({ apiClient }) => {
    // Genre 28 = Action
    const { body } = await apiClient.discoverMovies({ with_genres: '28' });

    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    parsed.results.forEach(movie => {
      expect(movie.genre_ids).toContain(28);
    });
  });

  test('GET /discover/movie — year filter scopes release_date to the year', async ({ apiClient }) => {
    const { body } = await apiClient.discoverMovies({
      'release_date.gte': '2020-01-01',
      'release_date.lte': '2020-12-31',
    });

    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    parsed.results.forEach(movie => {
      if (movie.release_date) {
        expect(movie.release_date.startsWith('2020')).toBe(true);
      }
    });
  });

  test('GET /discover/movie — vote_average.gte filters out low-rated results', async ({ apiClient }) => {
    const minRating = 7;
    const { body } = await apiClient.discoverMovies({ 'vote_average.gte': minRating });

    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    parsed.results.forEach(movie => {
      expect(movie.vote_average).toBeGreaterThanOrEqual(minRating);
    });
  });

  test('GET /discover/movie — sort_by popularity.desc returns sorted results', async ({ apiClient }) => {
    const { body } = await apiClient.discoverMovies({ sort_by: 'popularity.desc' });

    const parsed = PagedMovieResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    const popularities = parsed.results.map(m => m.popularity);
    // Each item should have a lower or equal popularity than the previous
    for (let i = 1; i < popularities.length; i++) {
      expect(popularities[i]).toBeLessThanOrEqual(popularities[i - 1]);
    }
  });
});

test.describe('Discover — TV Shows', () => {
  test('GET /discover/tv — default params returns status 200 and results', async ({ apiClient }) => {
    const { response, body } = await apiClient.discoverTv();

    expect(response.status()).toBe(200);
    const parsed = PagedTvResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
  });

  test('GET /discover/tv — with_genres filters to matching genre IDs', async ({ apiClient }) => {
    // Genre 10759 = Action & Adventure (TV)
    const { body } = await apiClient.discoverTv({ with_genres: '10759' });

    const parsed = PagedTvResponseSchema.parse(body);
    expect(parsed.results.length).toBeGreaterThan(0);
    parsed.results.forEach(tv => {
      expect(tv.genre_ids).toContain(10759);
    });
  });
});
