const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    headless: true,
  },
  webServer: {
    command: 'npx http-server . -p 3001 -c-1 --silent',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
  },
});
