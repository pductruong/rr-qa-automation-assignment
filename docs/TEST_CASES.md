# Test Cases — TMDB Discover

**Site under test:** https://tmdb-discover.surge.sh/

**Technique legend:**
- **EP** — Equivalence Partitioning
- **BVA** — Boundary Value Analysis
- **ST** — State Transition
- **ET** — Exploratory Testing
- **BA** — Browser API Assertion
- **SV** — Schema Validation

---

## UI Tests

### Module 1 — Category Filter

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-CAT-01 | Default category loads Popular content | Open the site. | "Popular" tab is active and the content grid is populated. | EP |
| TC-CAT-02 | Switch to Trend category | Click "Trend". | Tab becomes active and the grid updates with different content. | EP |
| TC-CAT-03 | Switch to Newest category | Click "Newest". | Grid updates to show recently released titles. | EP |
| TC-CAT-04 | Switch to Top rated category | Click "Top rated". | Grid updates to show high-rated titles. | EP |
| TC-CAT-05 | Category tabs show distinct content | Cycle through all four tabs. | Each tab shows different content from the others. | EP |

---

### Module 2 — Title Search

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-TTL-01 | Search by keyword returns matching results | Type "Batman" in the search input. | Grid shows titles related to "Batman". | EP |
| TC-TTL-02 | Partial title search returns relevant results | Type "bat" in the search input. | Grid is not empty and results are relevant. | EP |
| TC-TTL-03 | No-match search shows empty state | Type "zzznonexistent99999" in the search input. | Grid is empty or shows a no-results message. | EP |
| TC-TTL-04 | Clearing the search restores the full result set | Type a keyword, then clear the input. | Grid returns to the unfiltered state. | ST |

---

### Module 3 — Type Filter

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-TYP-01 | Filter by Movie shows movie entries | Select "Movie" in the Type dropdown. | Grid shows movies. | EP |
| TC-TYP-02 | Filter by TV Show shows TV show entries | Select "TV Show" in the Type dropdown. | Grid updates to show TV shows. | EP |
| TC-TYP-03 | Toggling type updates content | Switch Movie → TV Show → Movie. | Grid updates on each toggle and returns to original content. | ST |

---

### Module 4 — Year Filter

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-YR-01 | Filter by a mid-range year returns content | Select year "2020". | Grid is populated. | EP |
| TC-YR-02 | Filter by the most recent available year | Select the highest available year. | Grid is populated without error. | BVA |
| TC-YR-03 | Filter by the earliest available year | Select the lowest available year. | Grid is populated without error. | BVA |

---

### Module 5 — Rating Filter

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-RAT-01 | 3-star rating filter returns content | Set rating to 3 stars. | Grid is populated. | EP |
| TC-RAT-02 | 5-star rating filter returns limited content | Set rating to 5 stars. | Grid shows fewer results or an empty state. | BVA |
| TC-RAT-03 | 1-star rating filter returns full result set | Set rating to 1 star. | Grid shows content as if unfiltered. | BVA |

---

### Module 6 — Genre Filter

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-GEN-01 | Filter by Action genre | Select "Action" from the Genre dropdown. | Grid updates to show Action titles. | EP |
| TC-GEN-02 | Filter by Drama genre | Select "Drama" from the Genre dropdown. | Grid updates to show Drama titles. | EP |
| TC-GEN-03 | Switching genre replaces previous selection | Select "Action", then select "Comedy". | Grid shows Comedy titles, not Action. | ST |

---

### Module 7 — Pagination

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-PAG-01 | Navigate to page 2 shows different content | Click "Next". | Grid updates with different titles and page indicator shows "2". | EP |
| TC-PAG-02 | Navigate back to page 1 | From page 2, click "Previous". | Grid returns to page 1 content and indicator shows "1". | ST |
| TC-PAG-03 | Previous button is disabled on page 1 | On page 1, check the "Previous" button state. | "Previous" button is disabled or absent. | BVA |
| TC-PAG-04 | Page indicator updates as user navigates | Navigate to page 2 then page 3. | Indicator shows "2" then "3" correctly. | EP |

---

### Module 8 — Negative / Known Issues

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-NEG-01 | [BUG-01] Direct URL slug navigation breaks the page | Navigate directly to `https://tmdb-discover.surge.sh/popular`. | Page is blank or broken — only root `/` loads reliably. | ET |
| TC-NEG-02 | [BUG-02] Last pagination pages return no content | Advance through pages until the last few. | Grid is empty or shows an error state. | BVA · ET |
| TC-NEG-03 | [BUG-01] Refreshing a filtered URL loses state | Apply a filter, copy the URL, open in a new tab. | Filter state is lost and page may appear broken. | ET |

---

## API Tests

### Module 9 — Browser API Interception

> These tests verify that the UI fires the correct TMDB API request when a filter or navigation action is taken.
> TMDB API base: `https://api.themoviedb.org/3`

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-API-01 | Popular category fires GET /movie/popular | Open the site. | Browser sends `GET /movie/popular`, HTTP 200. | BA |
| TC-API-02 | Trend category fires GET /trending/movie/week | Click "Trend". | Browser sends `GET /trending/movie/week`, HTTP 200. | BA |
| TC-API-03 | Newest category fires GET /movie/now_playing | Click "Newest". | Browser sends `GET /movie/now_playing`, HTTP 200. | BA |
| TC-API-04 | Top rated category fires GET /movie/top_rated | Click "Top rated". | Browser sends `GET /movie/top_rated`, HTTP 200. | BA |
| TC-API-05 | TV Show type fires /tv/popular | Select "TV Show". | Browser sends `GET /tv/popular` instead of `/movie/popular`. | BA |
| TC-API-06 | Genre filter sends with_genres param | Select "Action" genre. | Request to `/discover/movie` includes non-empty `with_genres` param. | BA |
| TC-API-07 | Year filter sends release_date params | Select year "2020". | Request includes `release_date.gte` and `release_date.lte` starting with "2020". | BA |
| TC-API-08 | Rating filter sends vote_average.gte param | Set rating to 3 stars. | Request includes `vote_average.gte` greater than 0. | BA |
| TC-API-09 | Discover response body contains results and total_pages | Apply a genre filter. | Response body has `results` array and numeric `total_pages` and `total_results`. | BA · SV |
| TC-API-10 | Next page navigation sends page=2 | Click "Next". | API request includes `page=2`. | BA · BVA |
| TC-API-11 | Previous page navigation sends page=1 | From page 2, click "Previous". | API request includes `page=1`. | BA · BVA |

---

### Module 10 — Direct API (No Browser)

> These tests call TMDB endpoints directly using `TmdbApiClient` and validate responses against Zod schemas.

| ID | Title | Steps | Expected Result | Technique |
|----|-------|-------|-----------------|-----------|
| TC-DIR-01 | GET /genre/movie/list — valid schema and non-empty list | Call the endpoint. | HTTP 200, matches `GenreListResponseSchema`, common genres (Action, Comedy, Drama) present. | SV · EP |
| TC-DIR-02 | GET /genre/tv/list — valid schema and unique IDs | Call the endpoint. | HTTP 200, matches `GenreListResponseSchema`, all genre IDs are unique integers. | SV · EP |
| TC-DIR-03 | GET /movie/popular — valid schema and pagination fields | Call the endpoint. | HTTP 200, matches `PagedMovieResponseSchema`, all items pass `MovieResultSchema`. | SV · EP |
| TC-DIR-04 | GET /movie/popular — page 2 differs from page 1 | Call page 1 and page 2. | Result IDs are different and `page` field equals 2. | BVA |
| TC-DIR-05 | GET /movie/now_playing — valid schema | Call the endpoint. | HTTP 200, all items match `MovieResultSchema`. | SV · EP |
| TC-DIR-06 | GET /movie/top_rated — vote_average above 0 | Call the endpoint. | HTTP 200, all results have `vote_average > 0`. | SV · EP |
| TC-DIR-07 | GET /trending/movie/week — media_type is "movie" | Call the endpoint. | HTTP 200, all results match `TrendingMovieResultSchema` with `media_type = "movie"`. | SV · EP |
| TC-DIR-08 | GET /tv/popular — valid schema | Call the endpoint. | HTTP 200, all items match `TvResultSchema`. | SV · EP |
| TC-DIR-09 | GET /tv/on_the_air — valid schema | Call the endpoint. | HTTP 200, all items match `TvResultSchema`. | SV · EP |
| TC-DIR-10 | GET /trending/tv/week — media_type is "tv" | Call the endpoint. | HTTP 200, all results have `media_type = "tv"`. | SV · EP |
| TC-DIR-11 | GET /search/movie — results match query | Search for "Batman". | HTTP 200, at least one result title contains "batman". | EP |
| TC-DIR-12 | GET /search/movie — no match returns empty results | Search for "zzznonexistent99999". | HTTP 200, `results` is empty, `total_results = 0`. | EP |
| TC-DIR-13 | GET /discover/movie — with_genres filters correctly | Call with `with_genres=28`. | All results contain genre ID 28. | SV · EP |
| TC-DIR-14 | GET /discover/movie — year range filters release_date | Call with `release_date.gte=2020-01-01` and `release_date.lte=2020-12-31`. | All results have `release_date` starting with "2020". | SV · EP |
| TC-DIR-15 | GET /discover/movie — vote_average.gte filters low-rated results | Call with `vote_average.gte=7`. | All results have `vote_average ≥ 7`. | SV · BVA |
| TC-DIR-16 | GET /discover/movie — sort_by popularity.desc returns sorted results | Call with `sort_by=popularity.desc`. | Each result has lower or equal popularity than the previous. | SV · EP |
| TC-DIR-17 | GET /discover/tv — valid schema | Call the endpoint. | HTTP 200, all items match `TvResultSchema`. | SV · EP |
| TC-DIR-18 | GET /discover/tv — with_genres filters correctly | Call with `with_genres=10759`. | All results contain genre ID 10759. | SV · EP |
