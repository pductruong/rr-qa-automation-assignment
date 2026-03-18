# Test Strategy — TMDB Discover

Application under test: https://tmdb-discover.surge.sh/

Stack: TypeScript + Playwright

Scope: UI functional testing + TMDB API testing

---

## 1. Objectives

- Verify that all UI filters (category, type, genre, year, rating, title) produce correct results
- Verify that the correct TMDB API requests are fired with the correct parameters when the user interacts with the UI
- Verify that TMDB API responses conform to expected schemas and contain valid data

---

## 2. Test Layers

### Layer 1 — UI Testing

Tests the application's user interface end-to-end using a real browser (Chromium).

What we verify:
- Filter controls render and respond to user interaction
- Selecting a filter updates the content grid with matching results
- Pagination navigates correctly between pages

### Layer 2 — API Testing

Split into two sub-layers:

| Sub-layer | What it tests |
|-----------| --------------|
| Browser API Interception | Asserts the UI fires the *correct* TMDB endpoint with the *correct* query parameters when a filter is applied|
| Direct API |  Calls TMDB endpoints directly (no browser) and validates HTTP status codes, response schemas, field types, value ranges, and filter correctness. |

---

## 3. Scope

### In-Scope

| Area | UI Tests | API Interception | Direct API |
|------|----------|-----------------|------------|
| Category filter (Popular, Trend, Newest, Top rated) | Yes | Yes | Yes |
| Type filter (Movie / TV Show) | Yes | Yes | Yes |
| Genre filter | Yes | Yes | Yes |
| Year filter (start / end) | Yes | Yes | Yes |
| Rating filter (1–5 stars) | Yes | Yes | Yes |
| Title search | Yes | — | Yes |
| Pagination (next, previous, page indicator) | Yes | Yes | — |
| Negative / known bugs | Yes | — | — |
| Response schema validation | — | — | Yes (Zod) |
| Sort order validation | — | — | Yes |

### Out-of-Scope

- Combined multi-filter scenarios (time constraint)
- Cross-browser testing
- Performance, mobile, ...
---

## 4. Test Design Techniques

| Technique | Applied to |
|-----------|-----------|
| Equivalence Partitioning | Filter inputs — one valid representative per partition (e.g. Action genre, 2020 year, 3-star rating) |
| Boundary Value Analysis | Year (first/last available), rating (1-star min / 5-star max), pagination (first page / last page) |
| State Transition | Toggle type Movie → TV Show, clear title search, navigate Next → Previous |
| Schema Validation | All direct API responses validated with schemas |
| Exploratory Testing | Negative test discovery |

---

## 5. API Test Strategy Detail

### Browser API Interception

The UI calls the TMDB API in the browser. We assert these calls at the network level by registering a response listener before triggering a UI action

This gives us confidence that the UI is actually talking to the correct backend endpoint — not just rendering cached or static data.

### Direct API Testing

Bypasses the browser entirely to call TMDB endpoints directly. Each test asserts:

1. HTTP status — expect 200
2. Schema
3. Field values
4. Filter correctness
5. Sort order

### Schema Validation with Zod

All response schemas are defined using Zod. TypeScript types are inferred from these schemas — the schema is the single source of truth.
---

## 6. Architecture

| Decision | Rationale |
|----------|-----------|
| Page Object Model (`src/pages/`) | All locators defined once; spec files have zero raw selectors |
| Custom Playwright fixtures (`src/fixtures/`) | `homePage`, `apiClient`, `logger` injected per test |
| `TmdbApiClient` (`src/api/`) | Typed HTTP client wrapping `APIRequestContext`; all 13 endpoints covered |
| Zod schemas (`src/api/schemas.ts`) | Runtime schema validation + TypeScript type inference from a single definition |
| Structured Logger (`src/utils/logger.ts`) | Timestamped, levelled lines visible in HTML report trace viewer |
| `interceptApiCall()` on `BasePage` | Returns `{ status, url, params, body }` for structured network assertions |

---

## 7. Defects Found

| ID | Severity | Area | Description |
|----|----------|------|-------------|
| BUG-01 | High | Navigation | Direct URL access to `/popular`, `/trend`, `/new`, `/top` returns a blank/broken page. Only the root `/` loads content reliably. Covered by TC-NEG-01, TC-NEG-03. |
| BUG-02 | Medium | Pagination | Last 2–3 pages render an empty grid or an error state. Only early pages (~1–5) work reliably. Covered by TC-NEG-02. |
| BUG-03 | Low | Pagination | Page count label may show an incorrect total when multiple filters are combined. Observed during exploratory testing. |

---

## 8. Entry & Exit Criteria

**Entry:**
- Site reachable at `https://tmdb-discover.surge.sh/`
- Node.js ≥ 18 installed
- Playwright browsers installed (`npx playwright install --with-deps`)

**Exit:**
- All UI and API tests executed
- HTML report generated with pass/fail per test
- All defects documented with reproduction steps

---

## 9. Tools & Stack

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | 5.x | Type safety across all layers |
| Playwright | `^1.44` | Browser automation, test runner, `APIRequestContext`, reporters |
| Zod | `^3.23` | Runtime API response schema validation |
| Node.js | ≥ 18 | Runtime |

---

## 10. Reporting

| Reporter | Output | Purpose |
|----------|--------|---------|
| `list` | Console (live) | Real-time pass/fail during test run |
| `html` | `playwright-report/index.html` | Interactive report with screenshots, video, and traces on failure |
| `junit` | `results.xml` | CI-parseable XML for GitHub Actions / Jenkins |

---

## 11. CI Approach

Not implemented — documented in `README.md`.

Recommended setup: GitHub Actions, `npm ci` → `npx playwright install --with-deps` → `npm test` → upload `playwright-report/` as artifact. Set `retries: 2` on CI to handle demo site flakiness without masking real failures.
