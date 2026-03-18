# TMDB API Reference — Endpoints & Response Fields

**Base URL:** `https://api.themoviedb.org/3`
**Auth:** `api_key` query parameter appended to every request

All endpoints return JSON. Paged endpoints share a common wrapper. Individual item schemas are reused across endpoints.

---

## Shared Schemas

### PagedResponse (wrapper for all list endpoints)

| Field | Type | Notes |
|-------|------|-------|
| `page` | `number` | Current page number (≥ 1) |
| `results` | `array` | Array of items (MovieResult or TvResult) |
| `total_pages` | `number` | Total number of pages available |
| `total_results` | `number` | Total number of matching items |

### Genre

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | TMDB genre ID (e.g. 28 = Action) |
| `name` | `string` | Genre display name (e.g. "Action") |

### MovieResult

Used in: `/movie/popular`, `/trending/movie/week`, `/movie/now_playing` (Newest), `/movie/top_rated`, `/search/movie`, `/discover/movie`

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `adult` | `boolean` | No | Adult content flag |
| `backdrop_path` | `string \| null` | Yes | Wide image path |
| `genre_ids` | `number[]` | No | List of TMDB genre IDs |
| `id` | `number` | No | TMDB movie ID |
| `original_language` | `string` | No | ISO 639-1 language code (e.g. `"en"`) |
| `original_title` | `string` | No | Title in original language |
| `overview` | `string` | No | Plot summary |
| `popularity` | `number` | No | TMDB popularity score |
| `poster_path` | `string \| null` | Yes | Image path, relative to TMDB image base URL |
| `release_date` | `string` | No | Format: `"YYYY-MM-DD"` or `""` |
| `title` | `string` | No | Display title |
| `video` | `boolean` | No | Has associated video |
| `vote_average` | `number` | No | Rating 0.0 – 10.0 |
| `vote_count` | `number` | No | Number of votes |

### TvResult

Used in: `/tv/popular`, `/trending/tv/week`, `/tv/on_the_air` (Newest), `/tv/top_rated`, `/discover/tv`

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `adult` | `boolean` | No | Adult content flag |
| `backdrop_path` | `string \| null` | Yes | Wide image path |
| `first_air_date` | `string` | No | Format: `"YYYY-MM-DD"` |
| `genre_ids` | `number[]` | No | List of TMDB genre IDs |
| `id` | `number` | No | TMDB TV show ID |
| `name` | `string` | No | Display name |
| `origin_country` | `string[]` | No | ISO 3166-1 country codes (e.g. `["US"]`) |
| `original_language` | `string` | No | ISO 639-1 language code |
| `original_name` | `string` | No | Name in original language |
| `overview` | `string` | No | Show summary |
| `popularity` | `number` | No | TMDB popularity score |
| `poster_path` | `string \| null` | Yes | Image path |
| `vote_average` | `number` | No | Rating 0.0 – 10.0 |
| `vote_count` | `number` | No | Number of votes |

### TrendingMovieResult

Extends `MovieResult` with one additional field:

| Field | Type | Notes |
|-------|------|-------|
| `media_type` | `"movie"` (literal) | Discriminant field, always `"movie"` |

### TrendingTvResult

Extends `TvResult` with one additional field:

| Field | Type | Notes |
|-------|------|-------|
| `media_type` | `"tv"` (literal) | Discriminant field, always `"tv"` |

---

## Genre Endpoints

### GET /genre/movie/list

Fetches the list of official movie genres. Called once on page load to populate the Genre dropdown.

**Query params:** `api_key`

**Response schema:** `GenreListResponseSchema`

```json
{
  "genres": [
    { "id": 28, "name": "Action" },
    { "id": 35, "name": "Comedy" }
  ]
}
```

---

### GET /genre/tv/list

Same as above for TV show genres.

**Response schema:** `GenreListResponseSchema`

---

## Movie Category Endpoints

All return `PagedMovieResponseSchema`. Called when a category tab is clicked with Type = Movie.

### GET /movie/popular

| Query param | Type | Notes |
|-------------|------|-------|
| `api_key` | `string` | Required |
| `page` | `number` | Page number (default: 1) |

**Response schema:** `PagedMovieResponseSchema`

---

### GET /movie/now_playing

Returns movies currently in theatres. Triggered by "Newest" tab.

**Query params:** `api_key`, `page`

**Response schema:** `PagedMovieResponseSchema`

---

### GET /movie/top_rated

**Query params:** `api_key`, `page`

**Response schema:** `PagedMovieResponseSchema`

---

### GET /trending/movie/week

Returns trending movies for the current week. Triggered by "Trend" tab.

**Query params:** `api_key`, `page`

**Response schema:** `TrendingMovieResponseSchema`

> Results include `media_type: "movie"` on each item.

---

## TV Show Category Endpoints

All return `PagedTvResponseSchema`. Called when a category tab is clicked with Type = TV Show.

### GET /tv/popular

**Query params:** `api_key`, `page`

**Response schema:** `PagedTvResponseSchema`

---

### GET /tv/on_the_air

Returns TV shows currently airing. Triggered by "Newest" tab.

**Query params:** `api_key`, `page`

**Response schema:** `PagedTvResponseSchema`

---

### GET /tv/top_rated

**Query params:** `api_key`, `page`

**Response schema:** `PagedTvResponseSchema`

---

### GET /trending/tv/week

**Query params:** `api_key`, `page`

**Response schema:** `TrendingTvResponseSchema`

> Results include `media_type: "tv"` on each item.

---

## Search Endpoint

### GET /search/movie

Triggered when the user types in the title search input.

| Query param | Type | Notes |
|-------------|------|-------|
| `api_key` | `string` | Required |
| `query` | `string` | Search text (empty string returns empty results) |
| `page` | `number` | Page number |

---

## Discover Endpoints

Called when any of Genre / Year / Rating filters are active. Replaces the category listing endpoints.

### GET /discover/movie

| Query param | Type | Notes |
|-------------|------|-------|
| `api_key` | `string` | Required |
| `page` | `number` | Page number |
| `sort_by` | `string` | See sort values below |
| `with_genres` | `string` | Comma-separated TMDB genre IDs (e.g. `"28"`) |
| `release_date.gte` | `string` | Lower bound date, format `"YYYY-MM-DD"` |
| `release_date.lte` | `string` | Upper bound date, format `"YYYY-MM-DD"` |
| `vote_average.gte` | `number` | Minimum vote average |
| `vote_average.lte` | `number` | Maximum vote average |
---

### GET /discover/tv
Same query parameters as `/discover/movie`.

---