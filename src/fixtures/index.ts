import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { TmdbApiClient } from '../api/TmdbApiClient';
import { Logger } from '../utils/logger';

type Fixtures = {
  logger: Logger;
  homePage: HomePage;
  apiClient: TmdbApiClient;
};

export const test = base.extend<Fixtures>({
  logger: async ({}, use, testInfo) => {
    const logger = new Logger(testInfo.title);
    await use(logger);
  },

  homePage: async ({ page }, use, testInfo) => {
    const logger = new Logger(testInfo.title);
    await use(new HomePage(page, logger));
  },

  /**
   * Direct TMDB API client using Playwright's APIRequestContext.
   * Available in any test via: async ({ apiClient }) => { ... }
   */
  apiClient: async ({ request }, use, testInfo) => {
    const logger = new Logger(testInfo.title);
    await use(new TmdbApiClient(request, logger));
  },
});

export { expect } from '@playwright/test';
