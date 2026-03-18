/**
 * TMDB API v3 — Response type definitions.
 */

export type {
  Genre,
  GenreListResponse,
  MovieResult,
  TvResult,
  TrendingMovieResult,
  TrendingTvResult,
  MovieListResponse,
  TvListResponse,
  TrendingMovieResponse,
  TrendingTvResponse,
} from './schemas';

// ── Paginated list wrapper (kept as a generic helper type) ────────────────────

export interface PagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// ── Discover params ───────────────────────────────────────────────────────────
// Input parameters for the /discover/* endpoints — not a response shape,
// so it stays as a hand-written interface rather than a Zod schema.

export interface DiscoverParams {
  sort_by?: string;
  'release_date.gte'?: string;
  'release_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  with_genres?: string;          // comma-separated genre IDs
  page?: number;
}
