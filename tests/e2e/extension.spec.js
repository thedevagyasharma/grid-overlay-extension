const { test, expect } = require('@playwright/test');
const {
  launchWithExtension,
  resetState,
  setupPresetWithBreakpoint,
  openEditPopup,
  extEval,
} = require('../fixtures/browser');

let context, page;

// Allow extra time for browser launch + extension init in beforeAll
test.setTimeout(60000);

test.beforeAll(async () => {
  ({ context, page } = await launchWithExtension());
});

test.afterAll(async () => {
  if (context) await context.close();
});

test.beforeEach(async () => {
  await resetState(page);
});

// ---------------------------------------------------------------------------
// Smoke
// ---------------------------------------------------------------------------

test.describe('Smoke', () => {
  test('extension panel is visible on page load', async () => {
    await expect(page.locator('.go-ext-controls-wrapper')).toBeVisible();
  });

  test('test bridge responds to ping', async () => {
    const result = await extEval(page, 'ping');
    expect(result).toBe('pong');
  });

  test('grid toggles on and off', async () => {
    await extEval(page, 'enable');
    expect(await extEval(page, 'isGridActive')).toBe(true);

    await extEval(page, 'disable');
    expect(await extEval(page, 'isGridActive')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Preset + Breakpoint CRUD
// ---------------------------------------------------------------------------

test.describe('Preset + Breakpoint CRUD', () => {
  test('create preset and navigate to breakpoints screen', async () => {
    await setupPresetWithBreakpoint(page);
    await expect(page.locator('.go-ext-breakpoints-label-row')).toBeVisible();
  });

  test('new preset starts with one breakpoint', async () => {
    await setupPresetWithBreakpoint(page);
    expect(await extEval(page, 'getBreakpointsCount')).toBe(1);
  });

  test('add breakpoint increases count and appears in list', async () => {
    await setupPresetWithBreakpoint(page);
    await extEval(page, 'addBreakpoint');
    expect(await extEval(page, 'getBreakpointsCount')).toBe(2);
    await expect(page.locator('.go-ext-breakpoint-item')).toHaveCount(2);
  });

  test('breakpoints are sorted by minWidth after update', async () => {
    await setupPresetWithBreakpoint(page);
    await extEval(page, 'addBreakpoint');
    const bps = await extEval(page, 'getBreakpoints');
    // Set them out of order and let updateBreakpoint re-sort
    await extEval(page, 'updateBreakpoint', { id: bps[0].id, updates: { minWidth: '900px' } });
    await extEval(page, 'updateBreakpoint', { id: bps[1].id, updates: { minWidth: '200px' } });

    const sorted = await extEval(page, 'getBreakpoints');
    const widths = sorted.map(b => parseFloat(b.minWidth));
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
  });

  test('delete breakpoint removes it from state and list', async () => {
    await setupPresetWithBreakpoint(page);
    await extEval(page, 'addBreakpoint');

    const bps = await extEval(page, 'getBreakpoints');
    await extEval(page, 'deleteBreakpoint', { id: bps[0].id });

    expect(await extEval(page, 'getBreakpointsCount')).toBe(1);
    await expect(page.locator('.go-ext-breakpoint-item')).toHaveCount(1);
  });

  test('delete preset removes it from state', async () => {
    await extEval(page, 'createPreset', { name: 'Preset A' });
    await extEval(page, 'createPreset', { name: 'Preset B' });
    const before = await extEval(page, 'getPresetsCount');

    const presets = await extEval(page, 'getPresets');
    await extEval(page, 'deletePreset', { id: presets[0].id });

    expect(await extEval(page, 'getPresetsCount')).toBe(before - 1);
  });
});

// ---------------------------------------------------------------------------
// CSS Length Fields
// ---------------------------------------------------------------------------

test.describe('CSS Length Fields', () => {
  test.beforeEach(async () => {
    await setupPresetWithBreakpoint(page, '0px');
    await openEditPopup(page);
  });

  test('unit badge does not change while typing', async () => {
    const unitEl = page.locator('.go-ext-form-group', { hasText: 'Gutter' })
                       .locator('.go-ext-input-unit');
    const before = await unitEl.textContent();

    await page.locator('#go-ext-edit-gutter').fill('1abcd');

    // Badge must stay frozen — it only updates after a valid save
    expect(await unitEl.textContent()).toBe(before);
  });

  test('invalid value shows error on blur and does not save', async () => {
    const savedBefore = await extEval(page, 'getBreakpointField', { index: 0, field: 'gutter' });

    const input = page.locator('#go-ext-edit-gutter');
    await input.fill('1abcd');
    await input.blur();

    const wrapper = page.locator('.go-ext-form-group', { hasText: 'Gutter' })
                        .locator('.go-ext-input-wrapper');
    await expect(wrapper).toHaveClass(/invalid/);

    // State unchanged
    expect(await extEval(page, 'getBreakpointField', { index: 0, field: 'gutter' }))
      .toBe(savedBefore);
  });

  test('valid px value saves and updates badge', async () => {
    await page.locator('#go-ext-edit-gutter').fill('24px');
    await page.locator('#go-ext-edit-gutter').press('Enter');

    expect(await extEval(page, 'getBreakpointField', { index: 0, field: 'gutter' }))
      .toBe('24px');

    const unit = page.locator('.go-ext-form-group', { hasText: 'Gutter' })
                     .locator('.go-ext-input-unit');
    await expect(unit).toHaveText('px');
  });

  test('bare number inherits badge unit on save', async () => {
    // Set gutter to rem so badge shows rem, then re-open
    await extEval(page, 'updateBreakpoint', {
      id: (await extEval(page, 'getBreakpoints'))[0].id,
      updates: { gutter: '1rem' },
    });
    await openEditPopup(page);

    await page.locator('#go-ext-edit-gutter').fill('2');
    await page.locator('#go-ext-edit-gutter').press('Enter');

    expect(await extEval(page, 'getBreakpointField', { index: 0, field: 'gutter' }))
      .toBe('2rem');
  });

  test('arithmetic expression with unit evaluates on save', async () => {
    await page.locator('#go-ext-edit-gutter').fill('540/16rem');
    await page.locator('#go-ext-edit-gutter').press('Enter');

    expect(await extEval(page, 'getBreakpointField', { index: 0, field: 'gutter' }))
      .toBe('33.75rem');
  });

  test('arithmetic without unit inherits badge unit', async () => {
    await extEval(page, 'updateBreakpoint', {
      id: (await extEval(page, 'getBreakpoints'))[0].id,
      updates: { gutter: '1rem' },
    });
    await openEditPopup(page);

    await page.locator('#go-ext-edit-gutter').fill('540/16');
    await page.locator('#go-ext-edit-gutter').press('Enter');

    expect(await extEval(page, 'getBreakpointField', { index: 0, field: 'gutter' }))
      .toBe('33.75rem');
  });

  test('Enter key saves (same behavior as blur)', async () => {
    await page.locator('#go-ext-edit-gutter').fill('32px');
    await page.locator('#go-ext-edit-gutter').press('Enter');

    expect(await extEval(page, 'getBreakpointField', { index: 0, field: 'gutter' }))
      .toBe('32px');
  });

  test('minWidth rejects CSS functions and viewport units', async () => {
    const input = page.locator('#go-ext-edit-minWidth');
    const wrapper = page.locator('.go-ext-form-group', { hasText: 'Min Width' })
                        .locator('.go-ext-input-wrapper');

    // CSS function — not valid in media queries
    await input.fill('calc(100% - 2rem)');
    await input.blur();
    await expect(wrapper).toHaveClass(/invalid/);

    // Restore to valid value so the next check starts clean
    await input.fill('768px');
    await input.press('Enter');

    // Viewport unit — not valid in media queries
    await input.fill('48vw');
    await input.blur();
    await expect(wrapper).toHaveClass(/invalid/);
  });

  test('minWidth accepts px, em, and rem', async () => {
    const input = page.locator('#go-ext-edit-minWidth');
    const wrapper = page.locator('.go-ext-form-group', { hasText: 'Min Width' })
                        .locator('.go-ext-input-wrapper');

    for (const value of ['768px', '48rem', '48em']) {
      await input.fill(value);
      await input.press('Enter');
      await expect(wrapper).not.toHaveClass(/invalid/);
    }
  });
});

// ---------------------------------------------------------------------------
// Range Display
// ---------------------------------------------------------------------------

test.describe('Range Display', () => {
  test.beforeEach(async () => {
    await setupPresetWithBreakpoint(page, '0px');
  });

  test('px–px same unit: range subtracts 1 from next threshold', async () => {
    await extEval(page, 'setBreakpoints', {
      breakpoints: [
        { name: 'Mobile', minWidth: '0px' },
        { name: 'Tablet', minWidth: '768px' },
      ],
    });
    const meta = page.locator('.go-ext-breakpoint-item').first().locator('.go-ext-breakpoint-meta');
    await expect(meta).toContainText('0px – 767px');
  });

  test('rem–rem same unit: range shows next threshold directly', async () => {
    await extEval(page, 'setBreakpoints', {
      breakpoints: [
        { name: 'Mobile', minWidth: '0rem' },
        { name: 'Tablet', minWidth: '48rem' },
      ],
    });
    const meta = page.locator('.go-ext-breakpoint-item').first().locator('.go-ext-breakpoint-meta');
    await expect(meta).toContainText('0rem – 48rem');
  });

  test('mixed units: range converts upper bound to px and subtracts 1', async () => {
    // 48rem at browser default 16px = 768px → upper bound 767px
    await extEval(page, 'setBreakpoints', {
      breakpoints: [
        { name: 'Mobile', minWidth: '0px' },
        { name: 'Tablet', minWidth: '48rem' },
      ],
    });
    const meta = page.locator('.go-ext-breakpoint-item').first().locator('.go-ext-breakpoint-meta');
    await expect(meta).toContainText('0px – 767px');
  });

  test('last breakpoint shows open-ended range with +', async () => {
    await extEval(page, 'setBreakpoints', {
      breakpoints: [
        { name: 'Mobile', minWidth: '0px' },
        { name: 'Desktop', minWidth: '1024px' },
      ],
    });
    const lastMeta = page.locator('.go-ext-breakpoint-item').last().locator('.go-ext-breakpoint-meta');
    await expect(lastMeta).toContainText('1024px+');
  });
});
