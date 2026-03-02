const { chromium } = require('@playwright/test');
const path = require('path');
const os = require('os');

const EXTENSION_PATH = path.resolve(__dirname, '../..');
const TEST_URL = 'http://localhost:3001/test-ui.html';
// Persistent profile dir — keeps extension prefs between runs without
// re-downloading extension on every test. Lives outside the repo.
const USER_DATA_DIR = path.join(os.tmpdir(), 'go-ext-playwright-profile');

/**
 * Launch Chrome with the extension loaded.
 * Returns { context, page } — page is already at TEST_URL with the
 * extension controls visible.
 */
async function launchWithExtension() {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
    ],
  });
  const page = await context.newPage();
  await page.goto(TEST_URL);
  // Wait for the extension to inject its panel (DOM is shared across worlds)
  await page.waitForSelector('.go-ext-controls-wrapper', { timeout: 15000 });
  // Confirm the test bridge is responding before proceeding
  await extEval(page, 'ping');
  return { context, page };
}

// ---------------------------------------------------------------------------
// postMessage bridge
// ---------------------------------------------------------------------------
// Content scripts run in an isolated JS world; page.evaluate() runs in the
// main world. Both worlds share the DOM event system, so postMessage lets
// the test drive the extension's internal state.

/**
 * Send a command to the extension's content script and return its result.
 * Throws if the extension returns an error or if no response arrives in 5 s.
 */
async function extEval(page, cmd, args = {}) {
  return await page.evaluate(({ cmd, args }) => {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}-${Math.random()}`;

      const handler = (event) => {
        if (event.data?.__goExtSource__ === 'extension' && event.data.id === id) {
          window.removeEventListener('message', handler);
          clearTimeout(timer);
          if (event.data.error) reject(new Error(event.data.error));
          else resolve(event.data.result);
        }
      };

      const timer = setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error(`extEval timeout waiting for response to: ${cmd}`));
      }, 5000);

      window.addEventListener('message', handler);
      window.postMessage({ __goExtSource__: 'playwright-test', id, cmd, args }, '*');
    });
  }, { cmd, args });
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Clear all extension state without reloading the page. */
async function resetState(page) {
  await extEval(page, 'resetState');
}

/**
 * Create a preset with one breakpoint and navigate to the breakpoints screen.
 * @param {string} minWidth  Initial minWidth for the default breakpoint.
 */
async function setupPresetWithBreakpoint(page, minWidth = '0px') {
  const presetId = await extEval(page, 'createPreset', { name: 'Test Preset' });
  const bps = await extEval(page, 'getBreakpoints');
  await extEval(page, 'updateBreakpoint', { id: bps[0].id, updates: { minWidth } });
  await extEval(page, 'navigateTo', { view: 'breakpoints' });
}

/**
 * Open the breakpoint edit popup for the breakpoint at bpIndex.
 * Waits for the form to be visible before returning.
 */
async function openEditPopup(page, bpIndex = 0) {
  const bps = await extEval(page, 'getBreakpoints');
  await extEval(page, 'openEditPopup', { breakpointId: bps[bpIndex].id });
  await page.waitForSelector('#go-ext-edit-minWidth');
}

module.exports = {
  launchWithExtension,
  resetState,
  setupPresetWithBreakpoint,
  openEditPopup,
  extEval,
  TEST_URL,
};
