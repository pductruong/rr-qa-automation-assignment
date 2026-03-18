import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';

export interface ApiCapture {
  status: number;
  url: string;
  /** Parsed query parameters from the request URL */
  params: Record<string, string>;
  /** Parsed JSON response body, or null if non-JSON */
  body: unknown;
}

/**
 * BasePage provides common utilities shared across all page objects.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger: Logger;

  constructor(page: Page, logger: Logger) {
    this.page = page;
    this.logger = logger;
  }

  async navigate(url: string): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async waitForNetworkIdle(): Promise<void> {
    this.logger.debug('Waiting for network idle');
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    this.logger.debug(`Taking screenshot: ${name}`);
    return this.page.screenshot({ fullPage: true });
  }

  /**
   * Waits for a TMDB API response matching the given URL pattern.
   * Returns a structured object with status, parsed URL params, and body.
   *
   * Usage:
   *   const { status, url, params, body } = await homePage.interceptApiCall(/movie\/popular/);
   */
  async interceptApiCall(urlPattern: string | RegExp): Promise<ApiCapture> {
    this.logger.info(`Intercepting API call matching: ${urlPattern}`);
    const response = await this.page.waitForResponse(
      res => {
        const url = res.url();
        return typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);
      },
      { timeout: 30_000 },
    );

    const status  = response.status();
    const url     = response.url();
    const params  = Object.fromEntries(new URL(url).searchParams.entries());
    const body    = await response.json().catch(() => null);

    this.logger.info(`API response — status: ${status} | url: ${url}`);
    this.logger.debug('API params', params);

    return { status, url, params, body };
  }
}
