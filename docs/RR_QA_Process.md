# QA Process — TMDB Discover Automation Assignment

---

## Step 1 · Understand the Requirements

1. Read the assignment brief and identify the system under test: https://tmdb-discover.surge.sh/
2. List all testable features: Category, Title, Type, Year, Rating, Genre, Pagination.
3. Identify the two testing layers needed: UI functional testing and API testing.
4. Note any known issues explicitly mentioned — these become negative test cases, not things to ignore.

---

## Step 2 · Exploratory Testing

1. Manually click through every filter, category tab, and pagination control.
2. Open **DevTools → Elements**, inspect actual tag names, class names, and ARIA attributes for every interactive component.
3. Open **DevTools → Network**, observe which API calls fire on each user action:
   - Which endpoint changes when a category tab is clicked
   - Which endpoint replaces the category endpoint when a filter is applied
   - What query parameters are sent with each request
4. Reverse-engineer the JS bundle (`main.35f21c82.chunk.js`) to confirm all 13 endpoints and their trigger conditions.
5. Document all findings in `docs/API_REFERENCE.md` — endpoints, query parameters, and response field tables.

**Defects found during exploration:**
- BUG-01: Direct URL slug navigation breaks the page
- BUG-02: Last pagination pages render empty
- BUG-03: Page count label incorrect under combined filters
- BUG-04: Search uses movie API only — returns movies even when Type is TV Show
- BUG-05: Genre filter only sends the most recently selected genre — selecting a second replaces the first
- BUG-06: Card titles are blank when Type is set to TV Show
- BUG-07: Clicking the Discover logo refreshes the page but re-sends the last API request instead of resetting to default

---

## Step 3 · Write the Test Strategy

Wrote a strategy covering objectives, scope, test layers, design techniques, and architecture decisions.

Focus areas:
- Separated UI testing and API testing into distinct layers
- Defined browser API interception as a bridge between the two layers
- Chose Zod for runtime schema validation of all API responses

**Output:** `docs/TEST_STRATEGY.md`

---

## Step 4 · Design Test Cases

Designed test cases across two layers:

| Module | Cases |
|--------|-------|
| Category Filter | TC-CAT-01 → 05 |
| Title Search | TC-TTL-01 → 04 |
| Type Filter | TC-TYP-01 → 03 |
| Year Filter | TC-YR-01 → 03 |
| Rating Filter | TC-RAT-01 → 03 |
| Genre Filter | TC-GEN-01 → 03 |
| Pagination | TC-PAG-01 → 04 |
| Negative / Known Issues | TC-NEG-01 → 03 |
| Browser API Interception | TC-API-01 → 11 |
| Direct API | TC-DIR-01 → 18 |

**Output:** `docs/TEST_CASES.md`

---

## Step 5 · Project Setup

```bash
npm init -y
npm install --save-dev @playwright/test typescript @types/node zod
npx playwright install --with-deps
```

Configured `playwright.config.ts`:
- Reporters: HTML, JUnit XML, console list
- Screenshot, video, and trace captured on failure
- Single worker to avoid overloading the demo server

---

## Step 6 · Define API Schemas

Before writing any test, defined Zod schemas for all TMDB response shapes in `src/api/schemas.ts`:

- `GenreSchema`, `GenreListResponseSchema`
- `MovieResultSchema`, `TvResultSchema`
- `TrendingMovieResultSchema`, `TrendingTvResultSchema`
- `PagedMovieResponseSchema`, `PagedTvResponseSchema`
- `TrendingMovieResponseSchema`, `TrendingTvResponseSchema`

TypeScript types are inferred directly from schemas — the schema is the single source of truth for both runtime validation and static types.

**Output:** `src/api/schemas.ts`, `src/api/types.ts`

---

## Step 7 · Implement the API Client

Built `TmdbApiClient` wrapping Playwright's `APIRequestContext` to call all 13 TMDB endpoints directly (no browser). Each method returns `{ response, body }` for asserting both HTTP status and response content.

**Output:** `src/api/TmdbApiClient.ts`

---

## Step 8 · Implement Page Objects

Translated DOM inspection findings into accurate locators and interaction methods:

- `BasePage.ts` — shared utilities: `navigate()`, `takeScreenshot()`, `interceptApiCall()`
- `HomePage.ts` — all locators and interactions for filters, content grid, and pagination

Key challenges solved:
- react-select interaction: click control div → `getByRole('option')`
- rc-rate star widget: locate by `aria-posinset` attribute
- `interceptApiCall()`: registers `waitForResponse` listener before the action, returns `{ status, url, params, body }`

**Output:** `src/pages/BasePage.ts`, `src/pages/HomePage.ts`

---

## Step 9 · Fixtures + Logger

- Custom Playwright fixtures inject `homePage`, `apiClient`, and `logger` per test — zero `beforeEach` boilerplate in spec files.
- `Logger` wraps console with ISO timestamps and log levels, visible in the HTML report trace viewer.

**Output:** `src/fixtures/index.ts`, `src/utils/logger.ts`

---

## Step 10 · Write UI Test Specs

Wrote specs in priority order:

1. `category.spec.ts` — core navigation, highest value
2. `pagination.spec.ts` — high-risk area adjacent to BUG-02
3. `title.spec.ts`, `type.spec.ts` — straightforward interactions
4. `genre.spec.ts`, `year.spec.ts`, `rating.spec.ts` — react-select pattern reuse
5. `negative/known-issues.spec.ts` — regression guards for BUG-01 and BUG-02

**Output:** `tests/filtering/`, `tests/pagination/`, `tests/negative/`

---

## Step 11 · Write API Test Specs

### Browser API Interception (`tests/api/api.spec.ts`)

Asserts that the UI fires the correct TMDB endpoint with the correct query parameters when a filter is applied. Pattern used in every test:

```typescript
const capture = homePage.interceptApiCall(/discover\/movie/);  // register listener first
await homePage.selectGenre('Action');                           // trigger UI action
const { status, url, params } = await capture;                 // assert response
```

Covers: all 4 category endpoints, type switch, genre/year/rating discover params, pagination page params.

### Direct API Tests (`tests/api/tmdb-direct.spec.ts`)

Calls all 13 TMDB endpoints directly without a browser. Each test asserts:

1. HTTP status — `expect(response.status()).toBe(200)`
2. Schema — `ResponseSchema.parse(body)` via Zod
3. Field values — vote ranges, date formats, genre ID types
4. Filter correctness — results match the applied filter
5. Sort order — results are in the expected order

**Output:** `tests/api/api.spec.ts`, `tests/api/tmdb-direct.spec.ts`

---

## Step 12 · Update Documentation

- `README.md` — project structure, framework overview, running tests, API reference, patterns used, defects found
- `docs/TEST_STRATEGY.md` — test layers, scope, design techniques, architecture decisions, full defects table
- `docs/TEST_CASES.md` — all test cases across UI and API modules
- `docs/API_REFERENCE.md` — all 13 endpoints with query params and response field tables; verified fields match `schemas.ts`
