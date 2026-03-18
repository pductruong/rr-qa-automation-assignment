import { z } from 'zod';

export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const GenreListResponseSchema = z.object({
  genres: z.array(GenreSchema),
});

export function PagedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    page: z.number(),
    results: z.array(itemSchema),
    total_pages: z.number(),
    total_results: z.number(),
  });
}

export const MovieResultSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string(),       // "YYYY-MM-DD" or empty string
  vote_average: z.number(),       // 0.0 – 10.0
  vote_count: z.number(),
  popularity: z.number(),
  genre_ids: z.array(z.number()),
  adult: z.boolean(),
  video: z.boolean(),
  original_language: z.string(),
});

export const TvResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  first_air_date: z.string(),     // "YYYY-MM-DD"
  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),
  genre_ids: z.array(z.number()),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  adult: z.boolean(),
});

export const TrendingMovieResultSchema = MovieResultSchema.extend({
  media_type: z.literal('movie'),
});

export const TrendingTvResultSchema = TvResultSchema.extend({
  media_type: z.literal('tv'),
});

// ── Paged response schemas ────────────────────────────────────────────────────

export const PagedMovieResponseSchema = PagedResponseSchema(MovieResultSchema);
export const PagedTvResponseSchema = PagedResponseSchema(TvResultSchema);
export const TrendingMovieResponseSchema = PagedResponseSchema(TrendingMovieResultSchema);
export const TrendingTvResponseSchema = PagedResponseSchema(TrendingTvResultSchema);

// ── Inferred TypeScript types ─────────────────────────────────────────────────

export type Genre = z.infer<typeof GenreSchema>;
export type GenreListResponse = z.infer<typeof GenreListResponseSchema>;
export type MovieResult = z.infer<typeof MovieResultSchema>;
export type TvResult = z.infer<typeof TvResultSchema>;
export type TrendingMovieResult = z.infer<typeof TrendingMovieResultSchema>;
export type TrendingTvResult = z.infer<typeof TrendingTvResultSchema>;
export type MovieListResponse = z.infer<typeof PagedMovieResponseSchema>;
export type TvListResponse = z.infer<typeof PagedTvResponseSchema>;
export type TrendingMovieResponse = z.infer<typeof TrendingMovieResponseSchema>;
export type TrendingTvResponse = z.infer<typeof TrendingTvResponseSchema>;
