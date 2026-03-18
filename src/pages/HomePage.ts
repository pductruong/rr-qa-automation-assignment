import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/logger';

const BASE_URL = 'https://tmdb-discover.surge.sh/';

export type Category = 'Popular' | 'Trend' | 'Newest' | 'Top rated';

export type MediaType = 'Movie' | 'TV Show';

/**
 * HomePage encapsulates all interactions with the TMDB Discover landing page.
*/
export class HomePage extends BasePage {
  readonly categoryTabs: Locator;
  readonly titleInput: Locator;

  readonly typeSelectControl: Locator;
  readonly genreSelectControl: Locator;
  readonly startYearSelectControl: Locator;
  readonly endYearSelectControl: Locator;
  readonly ratingWidget: Locator;

  readonly contentGrid: Locator;
  readonly contentCards: Locator;

  readonly paginationContainer: Locator;
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;
  readonly currentPageIndicator: Locator;

  constructor(page: Page, logger: Logger) {
    super(page, logger);

    // Category tabs
    this.categoryTabs = page.locator('//ul[contains(@class, "list-none")]');

    // Title search (header)
    this.titleInput = page.locator('input[name="search"]');

    // Sidebar react-select controls (aside contains all three, in DOM order)
    this.typeSelectControl  = page.locator('aside .css-yk16xz-control').nth(0);
    this.genreSelectControl = page.locator('aside .css-yk16xz-control').nth(1);
    this.startYearSelectControl  = page.locator('aside .css-yk16xz-control').nth(2);
    this.endYearSelectControl  = page.locator('aside .css-yk16xz-control').nth(3);

    // Star rating widget
    this.ratingWidget = page.locator('ul.rc-rate');

    // Content grid
    this.contentGrid  = page.locator('div.grid.grid-cols-3.gap-4');
    this.contentCards = page.locator('div.grid.grid-cols-3.gap-4 > div.flex.flex-col.items-center');

    // Pagination
    this.paginationContainer  = page.locator('div#react-paginate');
    this.nextPageButton       = page.locator('#react-paginate li.next a[aria-label="Next page"]');
    this.prevPageButton       = page.locator('#react-paginate li.previous a[aria-label="Previous page"]');
    this.currentPageIndicator = page.locator('#react-paginate li.selected a[aria-current="page"]');
  }

  async open(): Promise<void> {
    await this.navigate(BASE_URL);
    await this.waitForContentGrid();
  }

  async openWithSlug(slug: string): Promise<void> {
    await this.navigate(`${BASE_URL}${slug}`);
  }


  /**
   * Click a category tab by its visible label.
   * Labels are exactly: 'Popular' | 'Trend' | 'Newest' | 'Top rated'
   */
  async selectCategory(name: Category): Promise<void> {
    this.logger.info(`Selecting category: ${name}`);
    await this.page.locator('nav ul.list-none a').filter({ hasText: name }).click();
    await this.waitForContentGrid();
  }

  /**
   * Returns the text of the currently active category tab.
   * Active tab is identified by its parent <li> having the class "text-white"
   * (inactive tabs have "text-blue-500").
   */
  async getActiveCategory(): Promise<string> {
    const activeLink = this.page.locator('nav ul.list-none li.text-white a').first();
    const text = await activeLink.innerText();
    this.logger.debug(`Active category: ${text}`);
    return text.trim();
  }

  // ── Filters ─────────────────────────────────────────────────────────────────

  async searchByTitle(title: string): Promise<void> {
    this.logger.info(`Searching by title: "${title}"`);
    await this.titleInput.fill(title);
    await this.waitForContentGrid();
  }

  async clearTitleSearch(): Promise<void> {
    this.logger.info('Clearing title search');
    await this.titleInput.clear();
    await this.waitForContentGrid();
  }

  /**
   * Select the media type using the react-select Type dropdown.
   * Known values: 'Movie' | 'TV Show'
   */
  async selectType(type: MediaType | string): Promise<void> {
    this.logger.info(`Selecting type: ${type}`);
    await this.openReactSelect(this.typeSelectControl);
    await this.page.getByRole('option', { name: type }).click();
    await this.waitForContentGrid();
  }

  /**
   * Select a genre using the react-select Genre dropdown.
   * e.g. 'Action', 'Drama', 'Comedy'
   */
  async selectGenre(genre: string): Promise<void> {
    this.logger.info(`Selecting genre: ${genre}`);
    await this.openReactSelect(this.genreSelectControl);
    await this.page.getByRole('option', { name: genre }).click();
    await this.waitForContentGrid();
  }

  /**
   * Select a year using the react-select Year dropdown.
   * Pass the year as a string, e.g. '2020'.
   */
  async selectStartYear(year: string): Promise<void> {
    this.logger.info(`Selecting start year: ${year}`);
    await this.openReactSelect(this.startYearSelectControl);
    await this.page.getByRole('option', { name: year, exact: true }).click();
    await this.waitForContentGrid();
  }

  /**
   * Select a year using the react-select Year dropdown.
   * Pass the year as a string, e.g. '2020'.
   */
  async selectEndYear(year: string): Promise<void> {
    this.logger.info(`Selecting end year: ${year}`);
    await this.openReactSelect(this.endYearSelectControl);
    await this.page.getByRole('option', { name: year, exact: true }).click();
    await this.waitForContentGrid();
  }



  /**
   * Get all year options available in the Year react-select dropdown.
   * Opens the dropdown, reads options, then closes it with Escape.
   */
  async getAvailableYears(): Promise<string[]> {
    await this.openReactSelect(this.startYearSelectControl);
    const options = await this.page.getByRole('option').allInnerTexts();
    await this.page.keyboard.press('Escape');
    this.logger.debug(`Available years: ${options.slice(0, 5).join(', ')}...`);
    return options;
  }

  /**
   * Click the N-th star (1–5) in the rc-rate rating widget.
   * Star 1 = lowest, star 5 = highest.
   */
  async setRating(stars: 1 | 2 | 3 | 4 | 5): Promise<void> {
    this.logger.info(`Setting rating: ${stars} star(s)`);
    // aria-posinset="1" … "5" on the div[role="radio"] inside each star li
    await this.ratingWidget
      .locator(`li div[role="radio"][aria-posinset="${stars}"]`)
      .click();
    await this.waitForContentGrid();
  }

  // ── Content ──────────────────────────────────────────────────────────────────

  async getContentCardCount(): Promise<number> {
    const count = await this.contentCards.count();
    this.logger.debug(`Content card count: ${count}`);
    return count;
  }

  /**
   * Returns the title text of every visible content card.
   * Card titles live in <p.text-blue-500.font-bold.py-1>.
   */
  async getContentCardTitles(): Promise<string[]> {
    const count = await this.contentCards.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const title = await this.contentCards
        .nth(i)
        .locator('p.text-blue-500.font-bold.py-1')
        .innerText()
        .catch(() => '');
      titles.push(title.trim());
    }
    this.logger.debug(`Card titles (first 3): ${titles.slice(0, 3).join(', ')}`);
    return titles;
  }

  /**
   * Returns the subtitle text (genre + year) of every visible card.
   * e.g. "Action, 2026"
   */
  async getContentCardSubtitles(): Promise<string[]> {
    const count = await this.contentCards.count();
    const subtitles: string[] = [];
    for (let i = 0; i < count; i++) {
      const sub = await this.contentCards
        .nth(i)
        .locator('p.text-gray-500.font-light.text-sm')
        .innerText()
        .catch(() => '');
      subtitles.push(sub.trim());
    }
    return subtitles;
  }

  async assertHasContent(): Promise<void> {
    this.logger.info('Asserting content grid is not empty');
    await expect(this.contentCards.first()).toBeVisible();
  }

  async assertNoContent(): Promise<void> {
    this.logger.info('Asserting content grid is empty');
    await expect(this.contentCards).toHaveCount(0);
  }

  async goToNextPage(): Promise<void> {
    this.logger.info('Clicking Next page');
    await this.nextPageButton.click();
    await this.waitForContentGrid();
  }

  async goToPreviousPage(): Promise<void> {
    this.logger.info('Clicking Previous page');
    await this.prevPageButton.click();
    await this.waitForContentGrid();
  }

  /**
   * Navigate directly to a page number by clicking its pagination link.
   * Uses the aria-label="Page N" attribute for reliable targeting.
   */
  async goToPage(pageNumber: number): Promise<void> {
    this.logger.info(`Navigating to page ${pageNumber}`);
    await this.page
      .locator(`#react-paginate a[aria-label="Page ${pageNumber}"]`)
      .click();
    await this.waitForContentGrid();
  }

  async getCurrentPage(): Promise<string> {
    const text = await this.currentPageIndicator.innerText().catch(() => '1');
    this.logger.debug(`Current page: ${text}`);
    return text.trim();
  }

  /**
   * Returns true when the Previous button's parent <li> has class "disabled"
   * or the anchor carries aria-disabled="true".
   */
  async isPreviousPageDisabled(): Promise<boolean> {
    const prevLi = this.page.locator('#react-paginate li.previous');
    const classes    = await prevLi.getAttribute('class') ?? '';
    const ariaValue  = await this.prevPageButton.getAttribute('aria-disabled') ?? 'false';
    const isDisabled = classes.includes('disabled') || ariaValue === 'true';
    this.logger.debug(`Previous page disabled: ${isDisabled}`);
    return isDisabled;
  }


  /** Opens a react-select dropdown by clicking its visible control div. */
  private async openReactSelect(control: Locator): Promise<void> {
    await control.click();
    // Wait for at least one option to appear before returning
    await this.page.getByRole('option').first().waitFor({ state: 'visible', timeout: 5_000 });
  }

  private async waitForContentGrid(): Promise<void> {
    await Promise.race([
      this.contentCards.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}),
      this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {}),
    ]);
  }
}
