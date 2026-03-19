# rr-qa-automation-assignment

Automated UI and API test suite for [https://tmdb-discover.surge.sh/](https://tmdb-discover.surge.sh/) — a demo movie and TV show listing platform.

Built with **TypeScript** + **Playwright** + **Zod**.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Test Strategy](#test-strategy)
3. [Test Cases](#test-cases)
4. [API Reference](#api-reference)
5. [Framework Overview](#framework-overview)
6. [Getting Started](#getting-started)
7. [Running Tests](#running-tests)
8. [Reports](#reports)
9. [Test Design Techniques](#test-design-techniques)
10. [Patterns Used](#patterns-used)
11. [Defects Found](#defects-found)
12. [CI Integration](#ci-integration)

---

## Project Structure

```
.
├── docs/
│   ├── TEST_STRATEGY.md       ← Full test strategy document
│   ├── TEST_CASES.md          ← Step-by-step test case descriptions
│   ├── API_REFERENCE.md       ← All 13 TMDB endpoints, query params, and response field tables
│   └── RR_QA_Process.md       ← End-to-end QA process walkthrough
├── src/
│   ├── pages/
│   │   ├── BasePage.ts        ← Shared POM base class (navigate, screenshot, API intercept)
│   │   └── HomePage.ts        ← All locators and interactions for the TMDB page
│   ├── api/
│   │   ├── TmdbApiClient.ts   ← Direct HTTP client for all 13 TMDB endpoints
│   │   ├── schemas.ts         ← Zod schemas for all API response shapes (source of truth)
│   │   └── types.ts           ← TypeScript types inferred from Zod schemas
│   ├── fixtures/
│   │   └── index.ts           ← Custom Playwright fixtures (homePage, apiClient, logger)
│   └── utils/
│       └── logger.ts          ← Structured logger (timestamps, levels, context)
├── tests/
│   ├── filtering/
│   │   ├── category.spec.ts   ← TC-CAT-01 to TC-CAT-05
│   │   ├── title.spec.ts      ← TC-TTL-01 to TC-TTL-04
│   │   ├── type.spec.ts       ← TC-TYP-01 to TC-TYP-03
│   │   ├── year.spec.ts       ← TC-YR-01  to TC-YR-03
│   │   ├── rating.spec.ts     ← TC-RAT-01 to TC-RAT-03
│   │   └── genre.spec.ts      ← TC-GEN-01 to TC-GEN-03
│   ├── pagination/
│   │   └── pagination.spec.ts ← TC-PAG-01 to TC-PAG-04
│   ├── negative/
│   │   └── known-issues.spec.ts ← TC-NEG-01 to TC-NEG-03 (BUG-01, BUG-02)
│   └── api/
│       ├── api.spec.ts        ← TC-API-01 to TC-API-11 (browser interception)
│       └── tmdb-direct.spec.ts ← Direct API tests — field/schema validation
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

---

## Test Strategy

See [`docs/TEST_STRATEGY.md`](docs/TEST_STRATEGY.md) for the full strategy document covering:

- Objectives and scope
- Test layers (UI, browser API interception, direct API)
- Test design techniques
- Architecture decisions
- Entry/exit criteria
- Defects found
- Reporting and CI

---

## Test Cases

See [`docs/TEST_CASES.md`](docs/TEST_CASES.md) for all 56 test cases across 10 modules:

**UI Tests**

| Module | Cases | IDs |
|--------|-------|-----|
| Category Filter | 5 | TC-CAT-01 → 05 |
| Title Search | 4 | TC-TTL-01 → 04 |
| Type Filter | 3 | TC-TYP-01 → 03 |
| Year Filter | 3 | TC-YR-01 → 03 |
| Rating Filter | 3 | TC-RAT-01 → 03 |
| Genre Filter | 3 | TC-GEN-01 → 03 |
| Pagination | 4 | TC-PAG-01 → 04 |
| Negative / Known Issues | 3 | TC-NEG-01 → 03 |

**API Tests**

| Module | Cases | IDs |
|--------|-------|-----|
| Browser API Interception | 11 | TC-API-01 → 11 |
| Direct API | 18 | TC-DIR-01 → 18 |

---

## API Reference

The site calls the [TMDB API v3](https://developer.themoviedb.org/docs) (`https://api.themoviedb.org/3`). All 13 endpoints were reverse-engineered from the minified JS bundle (`Discover_files/main.35f21c82.chunk.js`).

### Startup — Genre Lists

Called once on page load to populate the Genre dropdown.

| Endpoint | Purpose |
|----------|---------|
| `GET /genre/movie/list` | Fetch genre list for Movies |
| `GET /genre/tv/list` | Fetch genre list for TV Shows |

### Category Listing — Movies

Called when a category tab is clicked with `Type = Movie`.

| Category tab | Endpoint |
|---|---|
| Popular | `GET /movie/popular?page=N` |
| Trend | `GET /trending/movie/week?page=N` |
| Newest | `GET /movie/now_playing?page=N` |
| Top rated | `GET /movie/top_rated?page=N` |

### Category Listing — TV Shows

Called when a category tab is clicked with `Type = TV Show`.

| Category tab | Endpoint |
|---|---|
| Popular | `GET /tv/popular?page=N` |
| Trend | `GET /trending/tv/week?page=N` |
| Newest | `GET /tv/on_the_air?page=N` |
| Top rated | `GET /tv/top_rated?page=N` |

### Title Search

Called when the user types in the search input.

| Endpoint | Params |
|----------|--------|
| `GET /search/movie` | `query=TEXT`, `page=N` |

### Discover — Filters Applied

Called when any of Genre / Year / Rating filters are active. Replaces the category listing endpoints.

| Endpoint | Query Params |
|----------|-------------|
| `GET /discover/movie` | `sort_by`, `release_date.gte`, `release_date.lte`, `vote_average.gte`, `vote_average.lte`, `with_genres`, `page` |
| `GET /discover/tv` | same as above |

`sort_by` values per category:

| Category | `sort_by` value |
|---|---|
| Popular | `popularity.desc` |
| Trend | `vote_count.desc` |
| Newest | `release_date.desc` |
| Top rated | `vote_average.desc` |

---

## Framework Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | TypeScript 5.x | Type safety, IDE support |
| Test runner | `@playwright/test` 1.44+ | Test orchestration, assertions, parallelism |
| Browser automation | Playwright | Chromium & Firefox |
| Page layer | Page Object Model | Encapsulate locators/interactions (`src/pages/`) |
| API client layer | `TmdbApiClient` | Direct HTTP calls with typed responses (`src/api/`) |
| Fixture layer | Playwright custom fixtures | Inject `homePage`, `apiClient`, `logger` per test |
| Logging | Custom `Logger` utility | Timestamped, levelled log lines in console and trace |
| Browser API interception | `page.waitForResponse` | Assert correct network requests fired by the UI |
| Direct API testing | `APIRequestContext` | Validate response fields and schema independently of the UI |
| Schema validation | Zod 3.x | Runtime schema validation of all TMDB API response shapes (`src/api/schemas.ts`) |
| Reporting | HTML + JUnit XML | Visual report + CI-parseable XML |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install

```bash
npm install
npx playwright install --with-deps
```

---

## Running Tests

```bash
# Run all tests (headless, single worker)
npm test

# Run with visible browser
npm run test:headed

# Interactive Playwright UI mode
npm run test:ui

# Run only filter tests
npm run test:filter

# Run only pagination tests
npm run test:pagination

# Run only negative / known-issue tests
npm run test:negative

# Run all API tests (browser interception + direct)
npm run test:api

# Run direct API tests only (no browser needed)
npm run test:api:direct

# Run browser API interception tests only
npm run test:api:browser

# Debug a single test interactively
npm run test:debug -- tests/filtering/category.spec.ts

# Run with debug logging
LOG_LEVEL=debug npm test
```

---

## Reports

After a test run, two reports are generated:

### HTML Report (interactive)
```bash
npm run test:report
# Opens playwright-report/index.html in your browser
```

The HTML report includes:
- Pass/fail summary per test
- Screenshots on failure
- Video recordings on failure
- Playwright traces (step-by-step actions, network, console)
- Structured log output from the `Logger` utility

### JUnit XML Report
`results.xml` — consumed by CI systems (GitHub Actions, Jenkins, GitLab CI).

### Console Output
The `list` reporter streams live pass/fail lines during execution.

---

## Test Design Techniques

| Technique | Applied In |
|-----------|-----------|
| **Equivalence Partitioning** | Category, Title, Type, Rating, Genre filters |
| **Boundary Value Analysis** | Year (first/last), Rating (min/max star), Pagination (first/last page) |
| **State Transition** | Toggle type, clear title search, navigate Next → Previous |
| **Schema Validation** | All direct API responses validated with Zod schemas |
| **Exploratory Testing** | Negative test discovery — identified BUG-01 through BUG-07 |

---

## Patterns Used

- **Page Object Model (POM)** — `src/pages/BasePage.ts` + `src/pages/HomePage.ts`. One class per page/component; locators defined once, reused everywhere.
- **Fixture Injection** — `src/fixtures/index.ts` extends Playwright's `test` with pre-built `homePage` and `logger`. Tests declare dependencies via destructuring — zero setup boilerplate in spec files.
- **Structured Logging** — `src/utils/logger.ts` wraps `console` with ISO timestamps, log levels, and test context. Every action and assertion emits a log line visible in the HTML report trace.
- **Network Interception** — `BasePage.interceptApiCall()` uses `page.waitForResponse` to assert the correct API calls are dispatched when filters change, returning `{ status, url, params, body }` for structured assertions.
- **Direct API Client** — `TmdbApiClient` (`src/api/`) makes typed HTTP calls via Playwright's `APIRequestContext`. Each method returns `{ response, body }` so tests assert both status and response fields. Injected via the `apiClient` fixture.
- **Zod Schema Validation** — `src/api/schemas.ts` defines Zod schemas for every TMDB response shape. TypeScript types are inferred from these schemas (`z.infer<>`), making the schemas the single source of truth for both compile-time types and runtime validation. Tests call `Schema.parse(body)` which throws a `ZodError` with a precise field path if the API returns an unexpected shape.
- **Semantic Selectors** — `getByRole`, `getByText`, and `aria-*` attributes are preferred over brittle CSS class selectors.

---

## Defects Found

| ID | Severity | Area | Description | Test |
|----|----------|------|-------------|------|
| **BUG-01** | High | Navigation | Accessing `/popular`, `/trending`, etc. directly by URL results in a blank or broken page. Only the root `/` works reliably. | TC-NEG-01, TC-NEG-03 |
| **BUG-02** | Medium | Pagination | The last 2–3 pagination pages render an empty grid or an error state. Only early pages (1–~5) function correctly. | TC-NEG-02 |
| **BUG-03** | Low | Pagination | Page count label may display an incorrect total when filter combinations are applied. | Observed during TC-CMB-03 |
| **BUG-04** | High | API | Search feature using wrong API, it uses movie search API and return only movies. |  |
| **BUG-05** | Medium | Genre Filter | Genre filter only sends the most recently selected genre. Selecting a second genre replaces the first — multiple genre filtering is not supported. | — |
| **BUG-06** | High | TV Show | Card titles are not displayed when Type is set to TV Show. All cards appear with a blank title. | — |
| **BUG-07** | Medium | Navigation | Clicking the Discover logo refreshes the page but does not reset filter state — the last API request is re-sent instead of returning to the default Popular results. | — |

---

## CI Integration

> We are **not** implementing CI here, but this section describes the recommended approach.

### Recommended: GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'   # Daily smoke run at 06:00 UTC

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium firefox

      - name: Run Playwright tests
        run: npm test

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload JUnit results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: junit-results
          path: results.xml

      - name: Publish test results
        if: always()
        uses: dorny/test-reporter@v1
        with:
          name: Playwright Results
          path: results.xml
          reporter: java-junit
```

### Key CI Decisions

| Decision | Rationale |
|----------|-----------|
| `retries: 2` on CI | Demo site can be flaky; retries reduce false failures without hiding real bugs |
| `workers: 1` | Avoid overloading the demo server; also prevents race conditions in filter state |
| Daily scheduled run | Detect regressions introduced by demo site changes without waiting for a PR |
| Known-issue tests always run | They act as regression guards — if they start passing, a bug may have been fixed |
| Artifacts retained 30 days | Allows async review of failures; HTML report + traces provide full context |
| Separate `@known-issue` tag | CI can report them in a dedicated section without failing the build |

### Branch Strategy

- `main` → full suite on every push + daily
- Feature branches → full suite on PR
- Known-issue tests → always run, result published as informational (non-blocking)
