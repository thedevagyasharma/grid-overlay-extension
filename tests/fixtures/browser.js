const { chromium } = require('@playwright/test');

// tests/test-page.html loads all extension scripts via <script> tags in manifest order.
// They all run in the main page JS world, making appState, ViewRouter, etc. directly
// accessible via page.evaluate() — no postMessage bridge needed.
const TEST_URL = 'http://localhost:3001/tests/test-page.html';

/**
 * Launch a standard Chromium browser and navigate to the test page.
 */
async function launchBrowser() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  // waitUntil: 'domcontentloaded' avoids blocking on external resources (Google Fonts)
  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.go-ext-controls-wrapper', { timeout: 15000 });
  return { browser, page };
}

/**
 * Reset all extension state without reloading the page.
 * Clears localStorage, resets appState fields, removes any open popups, re-renders.
 */
async function resetState(page) {
  await page.evaluate(() => {
    localStorage.clear();
    appState.presets = [];
    appState.currentPresetId = null;
    appState.currentView = 'presets';
    appState.activePopup = null;
    appState.editingBreakpointId = null;
    appState.colorPickerType = null;
    appState.gridEnabled = false;
    appState.gridVisible = true;
    appState.indicatorVisible = true;
    appState.confirmDialog = null;
    document.querySelectorAll('.go-ext-popup-frame').forEach(el => el.remove());
    // Reset minimize state
    const wrapper = document.querySelector('.go-ext-controls-wrapper');
    if (wrapper) wrapper.classList.remove('go-ext-controls-minimized');
    ViewRouter.render();
  });
}

/**
 * Create a preset with one breakpoint and navigate to the breakpoints screen.
 * @param {string} minWidth  Initial minWidth for the default breakpoint.
 */
async function setupPresetWithBreakpoint(page, minWidth = '0px') {
  await page.evaluate((minWidth) => {
    const preset = appState.createPreset('Test Preset');
    appState.currentPresetId = preset.id;
    appState.updateBreakpoint(preset.breakpoints[0].id, { minWidth });
    appState.navigateTo('breakpoints');
    ViewRouter.render();
  }, minWidth);
}

/**
 * Open the breakpoint edit popup for the breakpoint at bpIndex.
 * Waits for the form to be visible before returning.
 */
async function openEditPopup(page, bpIndex = 0) {
  await page.evaluate((bpIndex) => {
    const bp = appState.getCurrentPreset().breakpoints[bpIndex];
    appState.openPopup('breakpoint-edit', { breakpointId: bp.id });
    ViewRouter.renderPopup();
  }, bpIndex);
  await page.waitForSelector('#go-ext-edit-minWidth');
}

/**
 * Set breakpoints on the current preset from a plain array of { name, minWidth } objects.
 * Existing breakpoints are replaced. Re-renders after.
 */
async function setBreakpoints(page, breakpoints) {
  await page.evaluate((bps) => {
    const preset = appState.getCurrentPreset();
    preset.breakpoints = bps.map(bp => ({
      id: appState.generateId(),
      name: bp.name,
      minWidth: bp.minWidth,
      columns: bp.columns !== undefined ? bp.columns : 12,
      gutter: '16px',
      rowGap: '8px',
      margin: '32px',
      maxWidth: 0,
      padding: 0,
    }));
    ViewRouter.render();
  }, breakpoints);
}

module.exports = {
  launchBrowser,
  resetState,
  setupPresetWithBreakpoint,
  openEditPopup,
  setBreakpoints,
  TEST_URL,
};
