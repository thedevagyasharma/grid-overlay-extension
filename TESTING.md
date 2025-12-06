# Testing Guide for Grid Overlay Extension

## Overview

This document describes the testing strategy and procedures for the Grid Overlay extension.

## Test Files

- `test.html` - Manual testing page with comprehensive test cases
- Tests organized by category: Performance, Security, Styling, Breakpoints, Settings

## Manual Testing Procedure

### Setup

1. Load the extension in Chrome
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory
   - Verify no errors in console

2. Open the test page
   - Navigate to `test.html` in your browser
   - Open Chrome DevTools (F12)
   - Monitor console for errors

### Test Categories

#### 1. Performance Tests

**Objective**: Ensure the extension doesn't degrade page performance

**P1: Remove duplicate drawGrid() call**
- ✅ FIXED: Removed redundant `drawGrid()` call in `handleResize()`
- Test: Resize browser window rapidly
- Expected: Smooth resizing, no lag
- How to verify: Check DevTools Performance tab, ensure no excessive function calls

**P2: Optimize MutationObserver**
- ✅ FIXED: Added debouncing (100ms), reduced observation scope
- Test: Navigate to dynamic page (e.g., Twitter, Facebook)
- Expected: No performance degradation
- How to verify: Check DevTools Performance tab for MutationObserver callback frequency

**P3: Add cleanup function**
- ✅ FIXED: Created `cleanup()` function, disconnect observers when grid disabled
- Test: Enable/disable grid 10+ times
- Expected: No memory leaks
- How to verify: DevTools Memory tab, take heap snapshots before/after

**P4: Debounce storage writes**
- ✅ FIXED: Added debounced save (300ms delay)
- Test: Rapidly change input values (columns, gutter, etc.)
- Expected: Smooth UI updates, minimal storage writes
- How to verify: Check Network tab for storage API calls (should be throttled)

#### 2. Security Tests

**S1: Replace innerHTML with DOM methods**
- ✅ FIXED: Replaced innerHTML in `renderBreakpoints()`, `renderPresets()`, `createElements()`
- Test: Try XSS in preset name: `<script>alert('XSS')</script>`
- Expected: No script execution, name sanitized
- How to verify: Inspect rendered HTML, check for escaped entities

**S2: Validate and sanitize user input**
- ✅ FIXED: Added `sanitizePresetName()` and `sanitizeHTML()` functions
- Test: Enter special characters in preset name: `<>"'&`
- Expected: Characters escaped or removed
- How to verify: Check saved preset in storage

**S3: Proper resource cleanup**
- ✅ FIXED: Track and revoke blob URLs after download
- Test: Export settings multiple times
- Expected: No blob URL accumulation
- How to verify: Check `chrome://blob-internals/` (no orphaned blobs)

#### 3. CSS Conflict Prevention

**CSS1: Protect critical styles**
- ✅ FIXED: Added `!important` to positioning, z-index, display properties
- Test: Load `test.html` (has intentional conflicting CSS)
- Expected: Grid overlay displays correctly, not affected by page CSS
- How to verify: Grid should be visible and positioned correctly

**CSS2: Add CSS variables for z-index**
- ✅ FIXED: Added `:root` CSS variables
- Test: Verify z-index values in DevTools
- Expected: `z-index: var(--go-ext-z-index-container)`
- How to verify: Inspect element in DevTools

#### 4. Code Quality Improvements

**R1: Extract common storage patterns**
- ✅ FIXED: Created `ensureRowGapCompatibility()` helper
- Test: Import old settings file without `rowGap` property
- Expected: Defaults to 8px
- How to verify: Check imported settings have `rowGap: 8`

**R2: Define constants**
- ✅ FIXED: Created `CONSTANTS` object with all magic numbers
- Test: Change zoom limits
- Expected: All zoom controls respect constants
- How to verify: Review code for `CONSTANTS.ZOOM_MIN/MAX` usage

**R3: Consistent null/undefined checks**
- ✅ FIXED: Added guard clauses to `updateInputValues()`
- Test: Call function before DOM is ready
- Expected: No errors
- How to verify: Check console for errors

**R4: Debounce input handlers**
- ✅ FIXED: Added debounced save functions
- Test: Rapidly type in input fields
- Expected: Immediate visual updates, delayed saves
- How to verify: Monitor storage writes in DevTools

## Automated Testing (Future)

### Unit Tests (Jest)

```javascript
// Example test structure
describe('Grid Overlay Utils', () => {
  test('debounce function delays execution', () => {
    jest.useFakeTimers();
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('sanitizeHTML removes script tags', () => {
    const input = '<script>alert(1)</script>Hello';
    const output = sanitizeHTML(input);
    expect(output).not.toContain('<script>');
    expect(output).toContain('Hello');
  });

  test('sanitizePresetName validates input', () => {
    expect(sanitizePresetName('<script>test</script>')).toBe('scripttest');
    expect(sanitizePresetName('My Preset 123')).toBe('My Preset 123');
    expect(sanitizePresetName('Test_Preset-1')).toBe('Test_Preset-1');
  });
});
```

### Integration Tests (Puppeteer)

```javascript
// Example integration test
describe('Grid Overlay Extension', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [`--disable-extensions-except=./`, `--load-extension=./`]
    });
    page = await browser.newPage();
  });

  test('Extension loads without errors', async () => {
    await page.goto('file:///path/to/test.html');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    expect(errors).toHaveLength(0);
  });

  test('Grid toggles on and off', async () => {
    // Click popup button
    await page.click('#toggleGrid');

    // Verify grid appears
    const gridVisible = await page.$('.grid-overlay-container.active');
    expect(gridVisible).not.toBeNull();
  });
});
```

## Regression Testing

### Before Each Release

1. Run all manual tests on `test.html`
2. Test on at least 3 different websites:
   - Simple static site
   - Complex SPA (e.g., React app)
   - Dynamic content site (e.g., Twitter)
3. Test all breakpoint configurations
4. Test import/export functionality
5. Verify all keyboard shortcuts work
6. Check console for errors
7. Verify no memory leaks

### Cross-Browser Testing

While extension is Chrome-focused, test on:
- Chrome (latest)
- Edge (latest, Chromium-based)
- Brave (latest)

### Performance Benchmarks

Target metrics:
- Grid render time: < 16ms (60 FPS)
- Memory usage: < 50MB
- No memory leaks after 10 enable/disable cycles
- MutationObserver callbacks: < 10/sec on dynamic pages

## Bug Reporting Template

```
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Chrome Version:
- Extension Version:
- OS:
- Test Page URL:

**Console Errors**
Any errors from DevTools console

**Screenshots**
If applicable
```

## Test Coverage Goals

- ✅ Performance: All 4 issues fixed
- ✅ Security: All 3 issues fixed
- ✅ CSS Conflicts: Critical styles protected
- ✅ Code Quality: All 4 improvements implemented

## Known Issues

None at this time.

## Future Testing Enhancements

1. Set up automated unit tests with Jest
2. Set up automated integration tests with Puppeteer
3. Add visual regression tests with Percy or similar
4. Set up CI/CD pipeline for automated testing
5. Add E2E tests for real-world scenarios
