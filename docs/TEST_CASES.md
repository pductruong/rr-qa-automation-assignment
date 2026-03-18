# Test Cases — TMDB Discover

**Site under test:** https://tmdb-discover.surge.sh/

---

## UI Tests

### Module 1 — Category Filter

**TC-CAT-01 · Default category loads Popular content**
Open the site. Verify the "Popular" tab is active and the content grid is populated.

**TC-CAT-02 · Switch to Trend category**
Click "Trend". Verify the tab becomes active and the grid updates with different content.

**TC-CAT-03 · Switch to Newest category**
Click "Newest". Verify the grid updates to show recently released titles.

**TC-CAT-04 · Switch to Top rated category**
Click "Top rated". Verify the grid updates to show high-rated titles.

**TC-CAT-05 · Category tabs show distinct content**
Cycle through all four tabs. Verify each tab shows different content from the others.

---

### Module 2 — Title Search

**TC-TTL-01 · Search by keyword returns matching results**
Type "Batman" in the search input. Verify the grid shows titles related to "Batman".

**TC-TTL-02 · Partial title search returns relevant results**
Type "bat" in the search input. Verify the grid is not empty and results are relevant.

**TC-TTL-03 · No-match search shows empty state**
Type a nonsense string (e.g. "zzznonexistent99999"). Verify the grid is empty or shows a no-results message.

**TC-TTL-04 · Clearing the search restores the full result set**
Type a keyword, then clear the input. Verify the grid returns to the unfiltered state.

---

### Module 3 — Type Filter

**TC-TYP-01 · Filter by Movie shows movie entries**
Select "Movie" in the Type dropdown. Verify the grid shows movies.

**TC-TYP-02 · Filter by TV Show shows TV show entries**
Select "TV Show" in the Type dropdown. Verify the grid updates to show TV shows.

**TC-TYP-03 · Toggling type updates content**
Switch from Movie → TV Show → Movie. Verify the grid updates on each toggle and returns to the original content.

---

### Module 4 — Year Filter

**TC-YR-01 · Filter by a mid-range year returns content**
Select year "2020". Verify the grid is populated.

**TC-YR-02 · Filter by the most recent available year returns content**
Select the highest available year. Verify the grid is populated without error.

**TC-YR-03 · Filter by the earliest available year returns content**
Select the lowest available year. Verify the grid is populated without error.

---

### Module 5 — Rating Filter

**TC-RAT-01 · 3-star rating filter returns content**
Set rating to 3 stars. Verify the grid is populated.

**TC-RAT-02 · 5-star rating filter returns limited content**
Set rating to 5 stars. Verify the grid shows fewer results or an empty state (high bar).

**TC-RAT-03 · 1-star rating filter returns full result set**
Set rating to 1 star. Verify the grid shows content as if unfiltered.

---

### Module 6 — Genre Filter

**TC-GEN-01 · Filter by Action genre**
Select "Action" from the Genre dropdown. Verify the grid updates to show Action titles.

**TC-GEN-02 · Filter by Drama genre**
Select "Drama". Verify the grid updates to show Drama titles.

**TC-GEN-03 · Switching genre replaces previous selection**
Select "Action", then select "Comedy". Verify the grid shows Comedy titles, not Action.

---

### Module 7 — Pagination

**TC-PAG-01 · Navigate to page 2 shows different content**
Click "Next". Verify the grid updates with different titles and the page indicator shows "2".

**TC-PAG-02 · Navigate back to page 1**
From page 2, click "Previous". Verify the grid returns to page 1 content and the indicator shows "1".

**TC-PAG-03 · Previous button is disabled on page 1**
On page 1, verify the "Previous" button is disabled or absent.

**TC-PAG-04 · Page indicator updates as user navigates**
Navigate to page 2 then page 3. Verify the indicator shows "2" then "3" correctly.

---

### Module 8 — Negative / Known Issues

**TC-NEG-01 · [BUG-01] Direct URL slug navigation breaks the page**
Navigate directly to `https://tmdb-discover.surge.sh/popular`. Verify the page is blank or broken (known issue — only root `/` loads reliably).

**TC-NEG-02 · [BUG-02] Last pagination pages return no content**
Advance through pages until the last few. Verify the grid is empty or shows an error (known issue — last 2–3 pages do not render).

**TC-NEG-03 · [BUG-01] Refreshing a filtered URL loses state**
Apply a filter, copy the URL, open it in a new tab. Verify the filter state is lost and the page may appear broken.

---

## API Tests

### Module 9 — Browser API Interception

> These tests verify that the UI fires the correct TMDB API request when a filter or navigation action is taken.
>
> TMDB API base: `https://api.themoviedb.org/3`

**TC-API-01 · Popular category fires GET /movie/popular**
Open the site. Verify the browser sends `GET /movie/popular` and receives HTTP 200.

**TC-API-02 · Trend category fires GET /trending/movie/week**
Click "Trend". Verify the browser sends `GET /trending/movie/week` and receives HTTP 200.

**TC-API-03 · Newest category fires GET /movie/now_playing**
Click "Newest". Verify the browser sends `GET /movie/now_playing` and receives HTTP 200.

**TC-API-04 · Top rated category fires GET /movie/top_rated**
Click "Top rated". Verify the browser sends `GET /movie/top_rated` and receives HTTP 200.

**TC-API-05 · TV Show type fires /tv/popular**
Select "TV Show". Verify the browser sends `GET /tv/popular` instead of `/movie/popular`.

**TC-API-06 · Genre filter sends with_genres param in /discover/movie**
Select "Action" genre. Verify the browser sends `GET /discover/movie` with a non-empty `with_genres` query parameter.

**TC-API-07 · Year filter sends release_date.gte and release_date.lte params**
Select year "2020". Verify the request includes `release_date.gte` and `release_date.lte` both starting with "2020".

**TC-API-08 · Rating filter sends vote_average.gte param**
Set rating to 3 stars. Verify the request includes `vote_average.gte` greater than 0.

**TC-API-09 · Discover response body contains results and total_pages**
Apply a genre filter. Verify the response body has a `results` array and numeric `total_pages` and `total_results` fields.

**TC-API-10 · Next page navigation sends page=2**
Click "Next". Verify the API request includes `page=2`.

**TC-API-11 · Previous page navigation sends page=1**
From page 2, click "Previous". Verify the API request includes `page=1`.

---

### Module 10 — Direct API (No Browser)

> These tests call TMDB endpoints directly using `TmdbApiClient` and validate the response against Zod schemas.

**TC-DIR-01 · GET /genre/movie/list — valid schema and non-empty list**
Call the endpoint. Verify HTTP 200, response matches `GenreListResponseSchema`, genres list is non-empty, and common genres (Action, Comedy, Drama) are present.

**TC-DIR-02 · GET /genre/tv/list — valid schema and unique IDs**
Call the endpoint. Verify HTTP 200, response matches `GenreListResponseSchema`, and all genre IDs are unique integers.

**TC-DIR-03 · GET /movie/popular — valid schema and pagination fields**
Call the endpoint. Verify HTTP 200, response matches `PagedMovieResponseSchema`, all result items pass `MovieResultSchema`.

**TC-DIR-04 · GET /movie/popular — page 2 differs from page 1**
Call page 1 and page 2. Verify the result IDs are different and `page` field equals 2.

**TC-DIR-05 · GET /movie/now_playing — valid schema**
Call the endpoint. Verify HTTP 200 and all items match `MovieResultSchema`.

**TC-DIR-06 · GET /movie/top_rated — vote_average above 0**
Call the endpoint. Verify HTTP 200 and all results have `vote_average > 0`.

**TC-DIR-07 · GET /trending/movie/week — media_type is "movie"**
Call the endpoint. Verify HTTP 200 and all results match `TrendingMovieResultSchema` with `media_type = "movie"`.

**TC-DIR-08 · GET /tv/popular — valid schema**
Call the endpoint. Verify HTTP 200 and all items match `TvResultSchema`.

**TC-DIR-09 · GET /tv/on_the_air — valid schema**
Call the endpoint. Verify HTTP 200 and all items match `TvResultSchema`.

**TC-DIR-10 · GET /trending/tv/week — media_type is "tv"**
Call the endpoint. Verify HTTP 200 and all results have `media_type = "tv"`.

**TC-DIR-11 · GET /search/movie — results match query**
Search for "Batman". Verify HTTP 200 and at least one result title contains "batman".

**TC-DIR-12 · GET /search/movie — no match returns empty results**
Search for "zzznonexistent99999". Verify HTTP 200, `results` is empty, `total_results = 0`.

**TC-DIR-13 · GET /discover/movie — with_genres filters correctly**
Call with `with_genres=28` (Action). Verify all results contain genre ID 28.

**TC-DIR-14 · GET /discover/movie — year range filters release_date**
Call with `release_date.gte=2020-01-01` and `release_date.lte=2020-12-31`. Verify all results have `release_date` starting with "2020".

**TC-DIR-15 · GET /discover/movie — vote_average.gte filters low-rated results**
Call with `vote_average.gte=7`. Verify all results have `vote_average ≥ 7`.

**TC-DIR-16 · GET /discover/movie — sort_by popularity.desc returns sorted results**
Call with `sort_by=popularity.desc`. Verify each result has a lower or equal popularity than the previous.

**TC-DIR-17 · GET /discover/tv — valid schema**
Call the endpoint. Verify HTTP 200 and all items match `TvResultSchema`.

**TC-DIR-18 · GET /discover/tv — with_genres filters correctly**
Call with `with_genres=10759` (Action & Adventure TV). Verify all results contain genre ID 10759.
