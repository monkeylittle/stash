// Local-only test suite (see tests/README.md). Not wired into CI or git hooks.
const { defineConfig, devices } = require('@playwright/test');
const PORT = 4173;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  // Builds the site into .test-site/ (gitignored) and serves it.
  webServer: {
    command: `node tests/serve.js ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    timeout: 300_000,
    reuseExistingServer: false,
  },
  projects: [
    // WebKit with iPhone viewport, touch and user agent: closest to Safari on iPhone.
    { name: 'iphone', use: { ...devices['iPhone 14'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
