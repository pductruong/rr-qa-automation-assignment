import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: './tests',

  // Run all tests in parallel.
  fullyParallel: false, 

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,


  timeout: 60_000,
  expect: {
    timeout: 30_000,
  },

  // Report to use
  reporter: [
    ['list'],                                      // Console
    ['html', { outputFolder: 'playwright-report', open: 'never' }], // HTML report
    ['junit', { outputFile: 'results.xml' }],      // JUnit XML for CI
  ],

  use: {
    baseURL: 'https://tmdb-discover.surge.sh/',   // Base URL
    headless: false,                              // Open browser when 
    screenshot: 'only-on-failure',                // Screenshot when failed
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
