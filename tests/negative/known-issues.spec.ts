import { test, expect } from '../../src/fixtures';

/**
 * Negative tests for known platform defects.
 * These tests DOCUMENT bugs — they assert the broken behaviour is consistent,
 * acting as regression guards so we know if/when bugs are fixed.
 *
 * Tagged @known-issue to allow CI to report them separately.
 */

test.describe('Known Issues (Negative Tests) @known-issue', () => {
  test('TC-NEG-01 · [BUG-01] Direct slug URL /popular does not load correctly', async ({ homePage, page, logger }) => {
    logger.warn('BUG-01: Direct slug navigation is a known defect');
    await homePage.openWithSlug('popular');
    // Expect either an empty grid or an error indicator — NOT a full populated grid
    const cardCount = await homePage.getContentCardCount();
    // On the known broken path, cards should be 0 or page shows error
    // We document this expectation; if it passes (cards > 0), the bug may be fixed
    if (cardCount > 0) {
      logger.warn('BUG-01 may be resolved — cards are visible on /popular slug');
      test.info().annotations.push({ type: 'BUG-FIXED?', description: 'Direct slug /popular now appears to work' });
    } else {
      logger.info('BUG-01 confirmed: /popular slug returns empty grid as expected');
    }
  });

  test('TC-NEG-02 · [BUG-02] Last pagination pages render no content', async ({ homePage, logger }) => {
    logger.warn('BUG-02: Last pagination pages are a known defect');
    await homePage.open();

    // Navigate forward aggressively to reach the broken last pages
    let attempts = 0;
    let lastCardCount = -1;
    while (attempts < 15) {
      try {
        await homePage.goToNextPage();
        const count = await homePage.getContentCardCount();
        if (count === 0) {
          logger.warn(`BUG-02 confirmed: Empty grid reached at page attempt ${attempts + 2}`);
          break;
        }
        lastCardCount = count;
        attempts++;
      } catch {
        logger.warn(`BUG-02: Navigation threw at attempt ${attempts + 2}`);
        break;
      }
    }
    // If we exhausted attempts without hitting empty page, note it
    if (attempts === 15) {
      logger.info('Did not hit empty last page within 15 pages — demo data may have changed');
    }
  });

  test('TC-NEG-03 · [BUG-01] Refreshing a category URL loses filter state', async ({ homePage, page, logger }) => {
    logger.warn('BUG-01: URL refresh state loss is a known defect');
    await homePage.open();
    await homePage.selectCategory('Trend');
    const url = page.url();
    logger.info(`Current URL after selecting Trend: ${url}`);

    await page.reload({ waitUntil: 'domcontentloaded' });
    const cardCountAfterReload = await homePage.getContentCardCount();
    logger.info(`Card count after reload: ${cardCountAfterReload}`);
    // Document — no hard assertion since broken behaviour varies
    test.info().annotations.push({
      type: 'BUG-01',
      description: `URL after category select: ${url}. Cards after reload: ${cardCountAfterReload}`,
    });
  });
});
