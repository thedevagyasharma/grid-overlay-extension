/**
 * Grid Overlay Extension - Main Content Script
 * This file is auto-generated from modular sources in the modules/ directory
 * DO NOT EDIT DIRECTLY - Edit the source modules instead and run: node build-modular.js
 */
(function() {
  'use strict';


  // ===== MODULE: constants =====
/**
 * Application constants and configuration
 */
const CONSTANTS = {
  RESIZE_MIN_WIDTH: 280,
  RESIZE_MAX_WIDTH: 600,
  ZOOM_MIN: 50,
  ZOOM_MAX: 200,
  ZOOM_STEP: 10,
  DEBOUNCE_DELAY: 300,
  MUTATION_DEBOUNCE_DELAY: 100,
  MAX_PRESET_NAME_LENGTH: 50,
  DEFAULT_ROW_GAP: 8,
  Z_INDEX_CONTAINER: 2147483647,
  Z_INDEX_INDICATOR: 2147483646
};

const DEFAULT_CONFIG = {
  columns: 3,
  gutter: 8,
  margin: 16,
  rowGap: 8,
  color: '#ff0000',
  opacity: 0.15,
  paddingColor: '#0000ff',
  breakpoints: [
    { name: 'xxs', minWidth: 0, columns: 3, gutter: 8, margin: 16, rowGap: 8, maxWidth: 0, padding: 0 },
    { name: 'xs', minWidth: 360, columns: 4, gutter: 12, margin: 16, rowGap: 8, maxWidth: 0, padding: 0 },
    { name: 'sm', minWidth: 550, columns: 6, gutter: 16, margin: 24, rowGap: 8, maxWidth: 0, padding: 0 },
    { name: 'md', minWidth: 768, columns: 8, gutter: 16, margin: 32, rowGap: 8, maxWidth: 0, padding: 0 },
    { name: 'lg', minWidth: 992, columns: 12, gutter: 16, margin: 48, rowGap: 8, maxWidth: 0, padding: 0 },
    { name: 'xl', minWidth: 1200, columns: 12, gutter: 20, margin: 48, rowGap: 8, maxWidth: 1200, padding: 0 },
    { name: 'xxl', minWidth: 1440, columns: 12, gutter: 24, margin: 64, rowGap: 8, maxWidth: 1440, padding: 0 }
  ]
};


  // ===== MODULE: utils =====
/**
 * Utility functions
 */

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize HTML string to prevent XSS
 */
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Create element with properties and children
 */
function createElement(tag, properties = {}, children = []) {
  const element = document.createElement(tag);

  Object.entries(properties).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child) {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * Validate and sanitize preset name
 */
function sanitizePresetName(name) {
  if (!name || typeof name !== 'string') return null;
  const sanitized = sanitizeHTML(name.trim()).substring(0, CONSTANTS.MAX_PRESET_NAME_LENGTH);
  return sanitized.replace(/[^a-zA-Z0-9\s\-_]/g, '');
}

/**
 * Ensure backwards compatibility for rowGap
 */
function ensureRowGapCompatibility(config) {
  if (config.rowGap === undefined) {
    config.rowGap = CONSTANTS.DEFAULT_ROW_GAP;
  }
  if (config.breakpoints) {
    config.breakpoints.forEach(bp => {
      if (bp.rowGap === undefined) {
        bp.rowGap = CONSTANTS.DEFAULT_ROW_GAP;
      }
    });
  }
  return config;
}

/**
 * Migrate old global maxWidth to per-breakpoint maxWidth
 */
function migrateMaxWidth(config) {
  // If config has old global maxWidth, migrate it to breakpoints
  if (config.maxWidth !== undefined && config.breakpoints) {
    const globalMaxWidth = config.maxWidth;
    config.breakpoints.forEach(bp => {
      if (bp.maxWidth === undefined) {
        bp.maxWidth = globalMaxWidth;
      }
    });
    // Remove old global maxWidth property
    delete config.maxWidth;
  }
  // Ensure all breakpoints have maxWidth and padding properties
  if (config.breakpoints) {
    config.breakpoints.forEach(bp => {
      if (bp.maxWidth === undefined) {
        bp.maxWidth = 0;
      }
      if (bp.padding === undefined) {
        bp.padding = 0;
      }
    });
  }
  // Ensure paddingColor exists
  if (config.paddingColor === undefined) {
    config.paddingColor = '#0000ff';
  }
  return config;
}


  // ===== MODULE: extension-context =====
/**
 * Extension context validation and safe Chrome API wrappers
 */

/**
 * Check if extension context is valid
 */
function isExtensionContextValid() {
  try {
    return chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

/**
 * Safe wrapper for Chrome Storage API set operation
 */
function safeStorageSet(data, callback) {
  if (!isExtensionContextValid()) {
    console.warn('Grid Overlay: Cannot save settings - extension context invalidated. Please refresh the page.');
    return;
  }
  try {
    chrome.storage.local.set(data, callback);
  } catch (e) {
    console.warn('Grid Overlay: Error saving settings:', e.message);
    if (e.message && e.message.includes('Extension context invalidated')) {
      console.warn('Grid Overlay: Please refresh the page to restore functionality.');
    }
  }
}

/**
 * Safe wrapper for Chrome Storage API get operation
 */
function safeStorageGet(keys, callback) {
  if (!isExtensionContextValid()) {
    console.warn('Grid Overlay: Cannot load settings - extension context invalidated. Please refresh the page.');
    return;
  }
  try {
    chrome.storage.local.get(keys, callback);
  } catch (e) {
    console.warn('Grid Overlay: Error loading settings:', e.message);
    if (e.message && e.message.includes('Extension context invalidated')) {
      console.warn('Grid Overlay: Please refresh the page to restore functionality.');
    }
  }
}

/**
 * Setup global error handler for extension context invalidation
 */
function setupErrorHandler() {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('Extension context invalidated')) {
      console.warn('Grid Overlay: Extension was reloaded. Please refresh this page to restore grid overlay functionality.');
      event.preventDefault();
      return true;
    }
  });
}


  // ===== MODULE: icons =====
/**
 * Lucide Icons as inline SVG
 * Using inline SVG to avoid external dependencies
 */

const Icons = {
  menu: () => createSVGIcon(`
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  `),

  eye: () => createSVGIcon(`
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  `),

  pencil: () => createSVGIcon(`
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  `),

  plus: () => createSVGIcon(`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  `),

  minus: () => createSVGIcon(`
    <line x1="5" y1="12" x2="19" y2="12"></line>
  `),

  x: () => createSVGIcon(`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  `),

  ruler: () => createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M10 15v-3"/><path d="M14 15v-3"/><path d="M18 15v-3"/><path d="M2 8V4"/><path d="M22 6H2"/><path d="M22 8V4"/><path d="M6 15v-3"/><rect x="2" y="12" width="20" height="8" rx="2"/></svg>
  `),

  download: () => createSVGIcon(`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  `),

  upload: () => createSVGIcon(`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  `),

  save: () => createSVGIcon(`
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  `),

  trash: () => createSVGIcon(`
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  `)
};

/**
 * Create SVG icon element
 */
function createSVGIcon(pathContent) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.classList.add('go-ext-icon');
  svg.innerHTML = pathContent;
  return svg;
}


  // ===== MODULE: state =====
/**
 * Application state management
 */

class GridState {
  constructor() {
    this.enabled = false;
    this.gridVisible = true;
    this.indicatorVisible = true;
    this.controlsVisible = true;
    this.uiZoom = 100;
    this.editingMode = false;
    this.currentBreakpointIndex = 0;
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  /**
   * Get viewport matching breakpoint index
   */
  getViewportMatchingBreakpoint() {
    const width = window.innerWidth;
    let matchingIndex = 0;

    for (let i = this.config.breakpoints.length - 1; i >= 0; i--) {
      const bp = this.config.breakpoints[i];
      if (width >= bp.minWidth) {
        matchingIndex = i;
        break;
      }
    }

    return matchingIndex;
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint() {
    return this.config.breakpoints[this.currentBreakpointIndex];
  }

  /**
   * Load breakpoint settings into main config
   */
  loadBreakpointSettings() {
    const currentBp = this.getCurrentBreakpoint();
    if (currentBp) {
      this.config.columns = currentBp.columns;
      this.config.gutter = currentBp.gutter;
      this.config.margin = currentBp.margin;
      this.config.rowGap = currentBp.rowGap !== undefined ? currentBp.rowGap : 8;
    }
  }

  /**
   * Save current settings to breakpoint
   */
  saveCurrentBreakpoint() {
    const currentBp = this.getCurrentBreakpoint();
    if (currentBp) {
      currentBp.columns = this.config.columns;
      currentBp.gutter = this.config.gutter;
      currentBp.margin = this.config.margin;
      currentBp.rowGap = this.config.rowGap;
    }
  }

  /**
   * Auto-select breakpoint based on viewport
   */
  autoSelectBreakpoint() {
    const viewportIndex = this.getViewportMatchingBreakpoint();
    this.currentBreakpointIndex = viewportIndex;
    this.loadBreakpointSettings();
  }

  /**
   * Select breakpoint by index
   */
  selectBreakpoint(index) {
    this.saveCurrentBreakpoint();
    this.currentBreakpointIndex = index;
    this.loadBreakpointSettings();
  }
}

const gridState = new GridState();


  // ===== MODULE: storage =====
/**
 * Storage operations for grid settings
 */



class StorageManager {
  /**
   * Save grid configuration
   */
  static saveSettings() {
    safeStorageSet({
      gridConfig: gridState.config,
      currentBreakpointIndex: gridState.currentBreakpointIndex
    });
  }

  /**
   * Load grid configuration
   */
  static loadSettings(callback) {
    safeStorageGet(['gridConfig', 'currentBreakpointIndex', 'editingMode'], (result) => {
      // Load editing mode first
      if (result.editingMode !== undefined) {
        gridState.editingMode = result.editingMode;
      }

      // Load config
      if (result.gridConfig) {
        gridState.config = result.gridConfig;
        ensureRowGapCompatibility(gridState.config);
        migrateMaxWidth(gridState.config);
      }

      // Load breakpoint index based on mode
      if (gridState.editingMode) {
        if (result.currentBreakpointIndex !== undefined) {
          gridState.currentBreakpointIndex = result.currentBreakpointIndex;
        }
      } else {
        gridState.currentBreakpointIndex = gridState.getViewportMatchingBreakpoint();
      }

      gridState.loadBreakpointSettings();
      if (callback) callback();
    });
  }

  /**
   * Save grid visibility state
   */
  static saveGridVisibility() {
    safeStorageSet({ gridVisible: gridState.gridVisible });
  }

  /**
   * Load grid visibility state
   */
  static loadGridVisibility(callback) {
    safeStorageGet(['gridVisible'], (result) => {
      if (result.gridVisible !== undefined) {
        gridState.gridVisible = result.gridVisible;
      }
      if (callback) callback();
    });
  }

  /**
   * Save indicator visibility state
   */
  static saveIndicatorVisibility() {
    safeStorageSet({ indicatorVisible: gridState.indicatorVisible });
  }

  /**
   * Load indicator visibility state
   */
  static loadIndicatorVisibility(callback) {
    safeStorageGet(['indicatorVisible'], (result) => {
      if (result.indicatorVisible !== undefined) {
        gridState.indicatorVisible = result.indicatorVisible;
      }
      if (callback) callback();
    });
  }

  /**
   * Save editing mode state
   */
  static saveModeState() {
    safeStorageSet({ editingMode: gridState.editingMode });
  }

  /**
   * Load editing mode state
   */
  static loadModeState(callback) {
    safeStorageGet(['editingMode'], (result) => {
      if (result.editingMode !== undefined) {
        gridState.editingMode = result.editingMode;
      }
      if (callback) callback();
    });
  }

  /**
   * Save controls visibility state
   */
  static saveControlsVisibility() {
    safeStorageSet({ controlsVisible: gridState.controlsVisible });
  }

  /**
   * Load controls visibility state
   */
  static loadControlsVisibility(callback) {
    safeStorageGet(['controlsVisible'], (result) => {
      if (result.controlsVisible !== undefined) {
        gridState.controlsVisible = result.controlsVisible;
      }
      if (callback) callback();
    });
  }

  /**
   * Save UI zoom level
   */
  static saveUIZoom() {
    safeStorageSet({ gridUIZoom: gridState.uiZoom });
  }

  /**
   * Load UI zoom level
   */
  static loadUIZoom(callback) {
    safeStorageGet(['gridUIZoom'], (result) => {
      if (result.gridUIZoom) {
        gridState.uiZoom = result.gridUIZoom;
      }
      if (callback) callback();
    });
  }

  /**
   * Save grid enabled state
   */
  static saveGridEnabled() {
    safeStorageSet({ gridEnabled: gridState.enabled });
  }

  /**
   * Load grid enabled state
   */
  static loadGridEnabled(callback) {
    safeStorageGet(['gridEnabled'], (result) => {
      if (callback) callback(result.gridEnabled || false);
    });
  }

  /**
   * Load presets
   */
  static loadPresets(callback) {
    safeStorageGet(['gridPresets'], (result) => {
      const presets = result.gridPresets || [];
      if (callback) callback(presets);
    });
  }

  /**
   * Save presets
   */
  static savePresets(presets, callback) {
    safeStorageSet({ gridPresets: presets }, callback);
  }
}


  // ===== MODULE: grid-renderer =====
/**
 * Grid rendering on canvas
 */

class GridRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Draw grid on canvas
   */
  draw() {
    if (!this.ctx || !gridState.enabled || !gridState.gridVisible) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const viewportWidth = window.innerWidth;

    // Get maxWidth and padding from current breakpoint (0 means no limit)
    const currentBp = gridState.getCurrentBreakpoint();
    const bpMaxWidth = currentBp && currentBp.maxWidth !== undefined ? currentBp.maxWidth : 0;
    const bpPadding = currentBp && currentBp.padding !== undefined ? currentBp.padding : 0;

    // Calculate container max width (includes padding)
    const containerMaxWidth = bpMaxWidth > 0 ?
      Math.min(bpMaxWidth, viewportWidth - gridState.config.margin * 2) :
      viewportWidth - gridState.config.margin * 2;

    // Grid width is container minus padding on both sides
    const gridWidth = containerMaxWidth - bpPadding * 2;

    const containerLeft = (viewportWidth - containerMaxWidth) / 2;
    const gridLeft = containerLeft + bpPadding;

    const totalGutterWidth = (gridState.config.columns - 1) * gridState.config.gutter;
    const colWidth = (gridWidth - totalGutterWidth) / gridState.config.columns;

    const startY = 0;
    const endY = this.canvas.height;

    // Draw padding strips if padding exists
    if (bpPadding > 0 && bpMaxWidth > 0) {
      this.ctx.fillStyle = gridState.config.paddingColor || '#0000ff';
      this.ctx.globalAlpha = gridState.config.opacity;

      // Left padding strip
      this.ctx.fillRect(containerLeft, startY, bpPadding, endY - startY);

      // Right padding strip
      this.ctx.fillRect(containerLeft + containerMaxWidth - bpPadding, startY, bpPadding, endY - startY);
    }

    // Draw grid columns
    this.ctx.fillStyle = gridState.config.color;
    this.ctx.globalAlpha = gridState.config.opacity;

    for (let i = 0; i < gridState.config.columns; i++) {
      const x = gridLeft + i * (colWidth + gridState.config.gutter);
      this.ctx.fillRect(x, startY, colWidth, endY - startY);
    }

    // Draw row gaps
    if (gridState.config.rowGap > 0) {
      this.ctx.globalAlpha = gridState.config.opacity * 0.5;
      for (let y = startY; y < endY; y += gridState.config.rowGap) {
        this.ctx.fillRect(gridLeft, y, gridWidth, 1);
      }
    }
  }

  /**
   * Update canvas dimensions
   */
  updateDimensions(container) {
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    container.style.height = docHeight + 'px';
    this.canvas.width = window.innerWidth;
    this.canvas.height = docHeight;

    this.draw();
  }
}


  // ===== MODULE: ui-builder =====
/**
 * UI Builder - creates all DOM elements for the grid overlay
 */


class UIBuilder {
  /**
   * Create main container
   */
  static createContainer() {
    return createElement('div', {
      className: 'go-ext-container'
    });
  }

  /**
   * Create canvas element
   */
  static createCanvas() {
    return createElement('canvas', {
      className: 'go-ext-canvas'
    });
  }

  /**
   * Create viewport indicator
   */
  static createViewportIndicator() {
    const indicator = createElement('div', {
      className: 'go-ext-viewport-indicator',
      id: 'go-ext-viewport-indicator'
    });

    indicator.appendChild(createElement('span', {
      className: 'go-ext-viewport-width',
      id: 'go-ext-viewport-width',
      textContent: '0px'
    }));

    indicator.appendChild(createElement('span', {
      className: 'go-ext-indicator-separator',
      textContent: '•'
    }));

    indicator.appendChild(createElement('span', {
      className: 'go-ext-breakpoint-name',
      id: 'go-ext-breakpoint-name',
      textContent: '—'
    }));

    indicator.appendChild(createElement('span', {
      className: 'go-ext-breakpoint-range',
      id: 'go-ext-breakpoint-range',
      textContent: '—'
    }));

    indicator.appendChild(createElement('span', {
      className: 'go-ext-indicator-separator',
      textContent: '•'
    }));

    indicator.appendChild(createElement('span', {
      className: 'go-ext-mode-status',
      id: 'go-ext-mode-status',
      textContent: 'Viewing'
    }));

    return indicator;
  }

  /**
   * Create toggle button
   */
  static createToggleButton() {
    const button = createElement('button', {
      className: 'go-ext-toggle-btn',
      title: 'Toggle grid controls'
    });
    button.appendChild(Icons.menu());
    return button;
  }

  /**
   * Create controls wrapper
   */
  static createControls() {
    const wrapper = createElement('div', {
      className: 'go-ext-controls-wrapper'
    });

    const resizeHandle = createElement('div', {
      className: 'go-ext-resize-handle'
    });
    resizeHandle.appendChild(createElement('div', {
      className: 'go-ext-resize-handle-grip'
    }));

    const contentDiv = createElement('div', {
      className: 'go-ext-controls'
    });

    contentDiv.innerHTML = `
      <div class="go-ext-zoom-section">
        <label for="go-ext-zoom-label" class="go-ext-zoom-section-label">UI Scaling Factor</label>
        <div class="go-ext-zoom-controls">
          <button class="go-ext-zoom-btn" id="go-ext-zoom-out" title="Zoom Out" aria-label="Decrease UI scale"></button>
          <span class="go-ext-zoom-label" id="go-ext-zoom-label" role="status" aria-live="polite">100%</span>
          <button class="go-ext-zoom-btn" id="go-ext-zoom-in" title="Zoom In" aria-label="Increase UI scale"></button>
        </div>
      </div>

      <div class="go-ext-visibility-toggle">
        <label for="go-ext-visibility-toggle">
          Show Grid
          <span class="go-ext-keyboard-hint">Ctrl+Shift+G</span>
        </label>
        <div class="go-ext-toggle-switch go-ext-active" id="go-ext-visibility-toggle">
          <div class="go-ext-toggle-slider"></div>
        </div>
      </div>

      <div class="go-ext-visibility-toggle">
        <label for="go-ext-indicator-toggle">
          Show Indicator
          <span class="go-ext-keyboard-hint">Ctrl+Shift+H</span>
        </label>
        <div class="go-ext-toggle-switch go-ext-active" id="go-ext-indicator-toggle">
          <div class="go-ext-toggle-slider"></div>
        </div>
      </div>

      <div class="go-ext-mode-toggle">
        <label for="go-ext-mode-toggle">Edit Mode</label>
        <div class="go-ext-toggle-switch" id="go-ext-mode-toggle">
          <div class="go-ext-toggle-slider"></div>
        </div>
      </div>

      <div class="go-ext-section-divider"></div>

      <h3>Breakpoints</h3>
      <div id="go-ext-breakpoint-selector" class="go-ext-breakpoint-selector"></div>
      <button class="go-ext-btn" id="go-ext-add-breakpoint"></button>

      <div class="go-ext-section-divider"></div>

      <h3>
        Breakpoint Settings
        <span class="go-ext-autosaving-indicator" id="go-ext-autosaving-indicator">
          <span class="go-ext-autosaving-dot"></span>
          Saved
        </span>
      </h3>

      <div class="go-ext-control-row">
        <label for="go-ext-breakpoint-name-input">Name</label>
        <div class="go-ext-input-wrapper">
          <input type="text" id="go-ext-breakpoint-name-input" value="Mobile" class="go-ext-input">
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-breakpoint-min-width-input">Min Width</label>
        <div class="go-ext-input-wrapper">
          <input type="number" id="go-ext-breakpoint-min-width-input" min="0" max="5000" value="0" class="go-ext-input">
          <span class="go-ext-input-unit">px</span>
        </div>
      </div>

      <div class="go-ext-section-divider"></div>

      <h3>Grid Settings</h3>

      <div class="go-ext-control-row">
        <label for="go-ext-cols-input">Columns</label>
        <div class="go-ext-input-wrapper">
          <input type="number" id="go-ext-cols-input" min="1" max="24" value="12" class="go-ext-input">
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-gutter-input">Column Gutter</label>
        <div class="go-ext-input-wrapper">
          <input type="number" id="go-ext-gutter-input" min="0" max="100" value="24" class="go-ext-input">
          <span class="go-ext-input-unit">px</span>
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-row-gap-input">Row Gap</label>
        <div class="go-ext-input-wrapper">
          <input type="number" id="go-ext-row-gap-input" min="0" max="100" value="8" class="go-ext-input">
          <span class="go-ext-input-unit">px</span>
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-margin-input">Margin</label>
        <div class="go-ext-input-wrapper">
          <input type="number" id="go-ext-margin-input" min="0" max="200" value="40" class="go-ext-input">
          <span class="go-ext-input-unit">px</span>
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-max-width-input">Max Width</label>
        <div class="go-ext-input-wrapper">
          <input type="number" id="go-ext-max-width-input" min="0" max="2000" step="1" value="1200" class="go-ext-input">
          <span class="go-ext-input-unit">px</span>
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-padding-input">Padding</label>
        <div class="go-ext-input-wrapper">
          <input type="number" id="go-ext-padding-input" min="0" max="500" step="1" value="0" class="go-ext-input">
          <span class="go-ext-input-unit">px</span>
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-color">Grid Color</label>
        <div class="go-ext-color-input-container">
          <input type="color" id="go-ext-color" value="#ff00ff" class="go-ext-color-input-hidden">
          <div class="go-ext-color-swatch" id="go-ext-color-swatch" title="Click to change color"></div>
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-padding-color">Padding Color</label>
        <div class="go-ext-color-input-container">
          <input type="color" id="go-ext-padding-color" value="#0000ff" class="go-ext-color-input-hidden">
          <div class="go-ext-color-swatch" id="go-ext-padding-color-swatch" title="Click to change padding color"></div>
        </div>
      </div>

      <div class="go-ext-control-row">
        <label for="go-ext-opacity-input">Opacity</label>
        <div class="go-ext-input-wrapper">
          <input type="number" id="go-ext-opacity-input" min="0" max="100" value="15" class="go-ext-input">
          <span class="go-ext-input-unit">%</span>
        </div>
      </div>

      <div class="go-ext-section-divider"></div>

      <div class="go-ext-control-buttons">
        <button class="go-ext-btn go-ext-btn-primary" id="go-ext-save-preset"></button>
      </div>

      <div class="go-ext-control-buttons">
        <button class="go-ext-btn" id="go-ext-export-settings"></button>
        <button class="go-ext-btn" id="go-ext-import-settings"></button>
      </div>
      <input type="file" id="go-ext-import-file" accept=".json" style="display: none;">

      <div style="margin-top: 20px;">
        <h3>Presets</h3>
        <div id="go-ext-presets-list"></div>
      </div>
    `;

    // Add icons to buttons after HTML is set
    setTimeout(() => {
      const zoomOutBtn = contentDiv.querySelector('#go-ext-zoom-out');
      const zoomInBtn = contentDiv.querySelector('#go-ext-zoom-in');
      const addBreakpointBtn = contentDiv.querySelector('#go-ext-add-breakpoint');
      const savePresetBtn = contentDiv.querySelector('#go-ext-save-preset');
      const exportBtn = contentDiv.querySelector('#go-ext-export-settings');
      const importBtn = contentDiv.querySelector('#go-ext-import-settings');

      if (zoomOutBtn) {
        zoomOutBtn.appendChild(Icons.minus());
      }
      if (zoomInBtn) {
        zoomInBtn.appendChild(Icons.plus());
      }
      if (addBreakpointBtn) {
        addBreakpointBtn.appendChild(Icons.plus());
        addBreakpointBtn.appendChild(document.createTextNode(' Add Breakpoint'));
      }
      if (savePresetBtn) {
        savePresetBtn.appendChild(Icons.save());
        savePresetBtn.appendChild(document.createTextNode(' Save Preset'));
      }
      if (exportBtn) {
        exportBtn.appendChild(Icons.download());
        exportBtn.appendChild(document.createTextNode(' Export'));
      }
      if (importBtn) {
        importBtn.appendChild(Icons.upload());
        importBtn.appendChild(document.createTextNode(' Import'));
      }
    }, 0);

    wrapper.appendChild(resizeHandle);
    wrapper.appendChild(contentDiv);

    return wrapper;
  }
}


  // ===== MODULE: ui-updater =====
/**
 * UI Updater - handles updating UI elements based on state
 */




class UIUpdater {
  /**
   * Update viewport width display
   */
  static updateViewportWidth() {
    const width = window.innerWidth;
    const viewportWidthEl = document.getElementById('go-ext-viewport-width');
    if (viewportWidthEl) {
      viewportWidthEl.textContent = `${width}px`;
    }
    this.updateBreakpointName();
  }

  /**
   * Update breakpoint name and range in indicator
   */
  static updateBreakpointName() {
    const nameEl = document.getElementById('go-ext-breakpoint-name');
    const rangeEl = document.getElementById('go-ext-breakpoint-range');

    if (nameEl && rangeEl) {
      const displayIndex = gridState.editingMode ?
        gridState.currentBreakpointIndex :
        gridState.getViewportMatchingBreakpoint();
      const displayBp = gridState.config.breakpoints[displayIndex];

      if (displayBp) {
        nameEl.textContent = displayBp.name;

        const nextBp = gridState.config.breakpoints[displayIndex + 1];
        const minWidth = displayBp.minWidth;
        const maxWidth = nextBp ? nextBp.minWidth - 1 : '∞';

        rangeEl.textContent = maxWidth === '∞' ? `${minWidth}px+` : `${minWidth}px – ${maxWidth}px`;
      } else {
        nameEl.textContent = '—';
        rangeEl.textContent = '—';
      }
    }
  }

  /**
   * Update grid visibility UI
   */
  static updateGridVisibility() {
    const toggle = document.getElementById('go-ext-visibility-toggle');
    const canvas = document.querySelector('.go-ext-canvas');
    if (gridState.gridVisible) {
      toggle?.classList.add('go-ext-active');
      if (canvas) canvas.style.display = 'block';
    } else {
      toggle?.classList.remove('go-ext-active');
      if (canvas) canvas.style.display = 'none';
    }
  }

  /**
   * Update indicator visibility
   */
  static updateIndicatorVisibility() {
    const toggle = document.getElementById('go-ext-indicator-toggle');
    const indicator = document.getElementById('go-ext-viewport-indicator');
    if (gridState.indicatorVisible) {
      toggle?.classList.add('go-ext-active');
      if (indicator) indicator.style.display = 'flex';
    } else {
      toggle?.classList.remove('go-ext-active');
      if (indicator) indicator.style.display = 'none';
    }
  }

  /**
   * Update controls visibility
   */
  static updateControlsVisibility(toggleBtn) {
    const controls = document.querySelector('.go-ext-controls-wrapper');
    if (controls) {
      controls.style.display = gridState.controlsVisible ? 'flex' : 'none';
    }

    // Update toggle button icon
    if (toggleBtn) {
      toggleBtn.innerHTML = '';
      if (gridState.controlsVisible) {
        toggleBtn.appendChild(Icons.x());
        toggleBtn.title = 'Close controls';
      } else {
        toggleBtn.appendChild(Icons.menu());
        toggleBtn.title = 'Open controls';
      }
    }
  }

  /**
   * Update mode toggle UI
   */
  static updateModeToggle() {
    const toggle = document.getElementById('go-ext-mode-toggle');
    const modeStatus = document.getElementById('go-ext-mode-status');
    if (gridState.editingMode) {
      toggle?.classList.add('go-ext-active');
      if (modeStatus) {
        modeStatus.textContent = 'Editing';
        modeStatus.classList.add('go-ext-editing');
        modeStatus.classList.remove('go-ext-viewing');
      }
    } else {
      toggle?.classList.remove('go-ext-active');
      if (modeStatus) {
        modeStatus.textContent = 'Viewing';
        modeStatus.classList.add('go-ext-viewing');
        modeStatus.classList.remove('go-ext-editing');
      }
    }
  }

  /**
   * Apply UI zoom
   */
  static applyUIZoom() {
    const controls = document.querySelector('.go-ext-controls-wrapper');
    const zoomPercent = gridState.uiZoom / 100;
    if (controls) {
      controls.style.transform = `scale(${zoomPercent})`;
      controls.style.transformOrigin = 'top right';
    }
    const label = document.getElementById('go-ext-zoom-label');
    if (label) {
      label.textContent = `${gridState.uiZoom}%`;
    }
  }

  /**
   * Update all input values from state
   */
  static updateInputValues() {
    const currentBp = gridState.getCurrentBreakpoint();
    if (currentBp) {
      const nameInput = document.getElementById('go-ext-breakpoint-name-input');
      const minWidthInput = document.getElementById('go-ext-breakpoint-min-width-input');
      if (nameInput) nameInput.value = currentBp.name;
      if (minWidthInput) minWidthInput.value = currentBp.minWidth;
    }

    const inputs = {
      'go-ext-cols-input': gridState.config.columns,
      'go-ext-gutter-input': gridState.config.gutter,
      'go-ext-margin-input': gridState.config.margin,
      'go-ext-row-gap-input': gridState.config.rowGap !== undefined ? gridState.config.rowGap : CONSTANTS.DEFAULT_ROW_GAP,
      'go-ext-max-width-input': currentBp && currentBp.maxWidth !== undefined ? currentBp.maxWidth : 0,
      'go-ext-padding-input': currentBp && currentBp.padding !== undefined ? currentBp.padding : 0,
      'go-ext-color': gridState.config.color,
      'go-ext-padding-color': gridState.config.paddingColor || '#0000ff',
      'go-ext-opacity-input': Math.round(gridState.config.opacity * 100)
    };

    Object.entries(inputs).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.value = value;
    });

    const colorSwatch = document.getElementById('go-ext-color-swatch');
    const paddingColorSwatch = document.getElementById('go-ext-padding-color-swatch');
    if (colorSwatch) {
      colorSwatch.style.backgroundColor = gridState.config.color;
    }
    if (paddingColorSwatch) {
      paddingColorSwatch.style.backgroundColor = gridState.config.paddingColor || '#0000ff';
    }

    this.updateViewportWidth();
  }

  /**
   * Render breakpoint chips
   */
  static renderBreakpoints() {
    const selector = document.getElementById('go-ext-breakpoint-selector');
    if (!selector) return;

    const viewportMatchingIndex = gridState.getViewportMatchingBreakpoint();
    selector.innerHTML = '';

    gridState.config.breakpoints.forEach((bp, index) => {
      const isActive = index === gridState.currentBreakpointIndex;
      const isViewportMatch = index === viewportMatchingIndex;

      // Determine chip classes based on mode
      let chipClasses = 'go-ext-breakpoint-chip';
      if (isActive) {
        if (gridState.editingMode) {
          chipClasses += ' go-ext-editing-active';
        } else {
          chipClasses += ' go-ext-viewing-active';
        }
      }
      if (isViewportMatch && !isActive) {
        chipClasses += ' go-ext-viewport-match';
      }

      const chip = createElement('div', {
        className: chipClasses,
        'data-index': index
      });

      // Add mode icon
      if (isActive) {
        const iconWrapper = createElement('span', {
          className: 'go-ext-breakpoint-mode-icon'
        });
        iconWrapper.appendChild(gridState.editingMode ? Icons.pencil() : Icons.eye());
        chip.appendChild(iconWrapper);
      } else if (isViewportMatch) {
        const iconWrapper = createElement('span', {
          className: 'go-ext-breakpoint-mode-icon go-ext-viewport-icon'
        });
        iconWrapper.appendChild(Icons.ruler());
        chip.appendChild(iconWrapper);
      }

      // Add breakpoint name
      const nameSpan = createElement('span', {
        className: 'go-ext-breakpoint-chip-name',
        textContent: sanitizeHTML(bp.name)
      });
      chip.appendChild(nameSpan);

      // Add breakpoint width
      const widthSpan = createElement('span', {
        className: 'go-ext-breakpoint-chip-width',
        textContent: `${bp.minWidth}px`
      });
      chip.appendChild(widthSpan);

      // Add delete button if more than one breakpoint exists
      if (gridState.config.breakpoints.length > 1) {
        const deleteBtn = createElement('button', {
          className: 'go-ext-breakpoint-chip-delete',
          'data-index': index,
          title: 'Delete breakpoint'
        });
        deleteBtn.appendChild(Icons.x());
        chip.appendChild(deleteBtn);
      }

      selector.appendChild(chip);
    });
  }

  /**
   * Render presets list
   */
  static renderPresets(presets) {
    const list = document.getElementById('go-ext-presets-list');
    if (!list) return;

    list.innerHTML = '';

    presets.forEach((preset, index) => {
      const item = createElement('div', {
        className: 'go-ext-preset-item'
      });

      const nameSpan = createElement('span', {
        'data-index': index,
        textContent: sanitizeHTML(preset.name)
      });
      item.appendChild(nameSpan);

      const deleteBtn = createElement('button', {
        className: 'go-ext-preset-delete',
        'data-index': index
      });
      deleteBtn.appendChild(Icons.trash());
      deleteBtn.appendChild(document.createTextNode(' Delete'));
      item.appendChild(deleteBtn);

      list.appendChild(item);
    });
  }

  /**
   * Show autosaving indicator temporarily
   */
  static showAutosaving() {
    const indicator = document.getElementById('go-ext-autosaving-indicator');
    if (!indicator) return;

    // Show the indicator
    indicator.classList.add('go-ext-visible');

    // Hide after 2 seconds
    setTimeout(() => {
      indicator.classList.remove('go-ext-visible');
    }, 2000);
  }
}


  // ===== MODULE: event-handlers =====
/**
 * Event Handlers - manages all user interactions
 */






class EventHandlers {
  constructor(gridRenderer) {
    this.gridRenderer = gridRenderer;
    this.resizeObserver = null;
    this.mutationObserver = null;
    this.blobUrls = [];
  }

  /**
   * Setup all event listeners
   */
  setupListeners(container, controls, toggleBtn) {
    this.container = container;
    this.controls = controls;
    this.toggleBtn = toggleBtn;

    // Toggle button
    toggleBtn.addEventListener('click', () => {
      gridState.controlsVisible = !gridState.controlsVisible;
      controls.style.display = gridState.controlsVisible ? 'flex' : 'none';

      // Update button icon
      this.updateToggleButtonIcon(gridState.controlsVisible);

      // Save state
      StorageManager.saveControlsVisibility();
    });

    // Resize handle
    this.setupResizeHandle();

    // Visibility toggles
    this.setupVisibilityToggles();

    // Mode toggle
    this.setupModeToggle();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Zoom controls
    this.setupZoomControls();

    // Input fields
    this.setupInputFields();

    // Buttons
    this.setupButtons();

    // Color picker
    this.setupColorPicker();

    // Window events
    this.setupWindowEvents();

    UIUpdater.updateViewportWidth();
  }

  /**
   * Setup resize handle
   */
  setupResizeHandle() {
    const resizeHandle = this.controls.querySelector('.go-ext-resize-handle');
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = this.controls.offsetWidth;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const deltaX = startX - e.clientX;
      const newWidth = Math.max(CONSTANTS.RESIZE_MIN_WIDTH, Math.min(CONSTANTS.RESIZE_MAX_WIDTH, startWidth + deltaX));
      this.controls.style.width = newWidth + 'px';
    };

    const handleMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    resizeHandle.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * Setup visibility toggles
   */
  setupVisibilityToggles() {
    document.getElementById('go-ext-visibility-toggle')?.addEventListener('click', () => {
      gridState.gridVisible = !gridState.gridVisible;
      UIUpdater.updateGridVisibility();
      StorageManager.saveGridVisibility();
    });

    document.getElementById('go-ext-indicator-toggle')?.addEventListener('click', () => {
      gridState.indicatorVisible = !gridState.indicatorVisible;
      UIUpdater.updateIndicatorVisibility();
      StorageManager.saveIndicatorVisibility();
    });
  }

  /**
   * Setup mode toggle
   */
  setupModeToggle() {
    document.getElementById('go-ext-mode-toggle')?.addEventListener('click', () => {
      gridState.editingMode = !gridState.editingMode;
      UIUpdater.updateModeToggle();
      if (!gridState.editingMode) {
        // Switching to viewing mode - auto-select viewport breakpoint
        gridState.autoSelectBreakpoint();
        UIUpdater.renderBreakpoints();
        UIUpdater.updateInputValues();
        this.gridRenderer.draw();
      } else {
        // Switching to editing mode - just update the chip display
        UIUpdater.renderBreakpoints();
      }
      StorageManager.saveModeState();
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+G - Toggle grid
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        gridState.gridVisible = !gridState.gridVisible;
        UIUpdater.updateGridVisibility();
        StorageManager.saveGridVisibility();
      }

      // Ctrl+Shift+H - Toggle indicator
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        gridState.indicatorVisible = !gridState.indicatorVisible;
        UIUpdater.updateIndicatorVisibility();
        StorageManager.saveIndicatorVisibility();
      }
    });
  }

  /**
   * Setup zoom controls
   */
  setupZoomControls() {
    document.getElementById('go-ext-zoom-in')?.addEventListener('click', () => {
      gridState.uiZoom = Math.min(CONSTANTS.ZOOM_MAX, gridState.uiZoom + CONSTANTS.ZOOM_STEP);
      UIUpdater.applyUIZoom();
      StorageManager.saveUIZoom();
    });

    document.getElementById('go-ext-zoom-out')?.addEventListener('click', () => {
      gridState.uiZoom = Math.max(CONSTANTS.ZOOM_MIN, gridState.uiZoom - CONSTANTS.ZOOM_STEP);
      UIUpdater.applyUIZoom();
      StorageManager.saveUIZoom();
    });
  }

  /**
   * Setup input fields
   */
  setupInputFields() {
    const debouncedSaveSettings = debounce(() => {
      StorageManager.saveSettings();
      UIUpdater.showAutosaving();
    }, CONSTANTS.DEBOUNCE_DELAY);

    const debouncedSaveCurrentBreakpoint = debounce(() => {
      gridState.saveCurrentBreakpoint();
      StorageManager.saveSettings();
      UIUpdater.showAutosaving();
    }, CONSTANTS.DEBOUNCE_DELAY);

    const setupInput = (inputId, configKey, isOpacity = false) => {
      const input = document.getElementById(inputId);
      if (!input) return;

      input.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) || 0;
        gridState.config[configKey] = isOpacity ? value / 100 : value;
        this.gridRenderer.draw();

        if (['columns', 'gutter', 'rowGap', 'margin'].includes(configKey)) {
          debouncedSaveCurrentBreakpoint();
        }
        debouncedSaveSettings();
      });
    };

    // Breakpoint-specific inputs
    const breakpointNameInput = document.getElementById('go-ext-breakpoint-name-input');
    if (breakpointNameInput) {
      breakpointNameInput.addEventListener('input', (e) => {
        const currentBp = gridState.getCurrentBreakpoint();
        if (currentBp) {
          currentBp.name = sanitizeHTML(e.target.value);
          UIUpdater.renderBreakpoints();
          UIUpdater.updateBreakpointName();
          debouncedSaveSettings();
        }
      });
    }

    const breakpointMinWidthInput = document.getElementById('go-ext-breakpoint-min-width-input');
    if (breakpointMinWidthInput) {
      breakpointMinWidthInput.addEventListener('input', (e) => {
        const currentBp = gridState.getCurrentBreakpoint();
        if (currentBp) {
          const value = parseInt(e.target.value) || 0;
          currentBp.minWidth = value;

          gridState.config.breakpoints.sort((a, b) => a.minWidth - b.minWidth);
          gridState.currentBreakpointIndex = gridState.config.breakpoints.indexOf(currentBp);

          UIUpdater.renderBreakpoints();
          UIUpdater.updateBreakpointName();
          debouncedSaveSettings();
        }
      });
    }

    setupInput('go-ext-cols-input', 'columns');
    setupInput('go-ext-gutter-input', 'gutter');
    setupInput('go-ext-row-gap-input', 'rowGap');
    setupInput('go-ext-margin-input', 'margin');
    setupInput('go-ext-opacity-input', 'opacity', true);

    // Max-width is now per-breakpoint
    const maxWidthInput = document.getElementById('go-ext-max-width-input');
    if (maxWidthInput) {
      maxWidthInput.addEventListener('input', (e) => {
        const currentBp = gridState.getCurrentBreakpoint();
        if (currentBp) {
          const value = parseInt(e.target.value) || 0;
          currentBp.maxWidth = value;
          this.gridRenderer.draw();
          debouncedSaveCurrentBreakpoint();
          debouncedSaveSettings();
        }
      });
    }

    // Padding is now per-breakpoint
    const paddingInput = document.getElementById('go-ext-padding-input');
    if (paddingInput) {
      paddingInput.addEventListener('input', (e) => {
        const currentBp = gridState.getCurrentBreakpoint();
        if (currentBp) {
          const value = parseInt(e.target.value) || 0;
          currentBp.padding = value;
          this.gridRenderer.draw();
          debouncedSaveCurrentBreakpoint();
          debouncedSaveSettings();
        }
      });
    }
  }

  /**
   * Setup color picker
   */
  setupColorPicker() {
    // Grid color picker
    const colorSwatch = document.getElementById('go-ext-color-swatch');
    const colorInput = document.getElementById('go-ext-color');

    if (colorSwatch && colorInput) {
      colorSwatch.style.backgroundColor = gridState.config.color;

      const updateColor = (e) => {
        gridState.config.color = e.target.value;
        colorSwatch.style.backgroundColor = e.target.value;
        this.gridRenderer.draw();
        StorageManager.saveSettings();
      };

      colorInput.addEventListener('change', updateColor);
      colorInput.addEventListener('input', updateColor);
    }

    // Padding color picker
    const paddingColorSwatch = document.getElementById('go-ext-padding-color-swatch');
    const paddingColorInput = document.getElementById('go-ext-padding-color');

    if (paddingColorSwatch && paddingColorInput) {
      paddingColorSwatch.style.backgroundColor = gridState.config.paddingColor || '#0000ff';

      const updatePaddingColor = (e) => {
        gridState.config.paddingColor = e.target.value;
        paddingColorSwatch.style.backgroundColor = e.target.value;
        this.gridRenderer.draw();
        StorageManager.saveSettings();
      };

      paddingColorInput.addEventListener('change', updatePaddingColor);
      paddingColorInput.addEventListener('input', updatePaddingColor);
    }
  }

  /**
   * Setup button event handlers
   */
  setupButtons() {
    // Add breakpoint
    document.getElementById('go-ext-add-breakpoint')?.addEventListener('click', () => {
      this.addBreakpoint();
    });

    // Save preset
    document.getElementById('go-ext-save-preset')?.addEventListener('click', () => {
      this.savePreset();
    });

    // Export settings
    document.getElementById('go-ext-export-settings')?.addEventListener('click', () => {
      this.exportSettings();
    });

    // Import settings
    document.getElementById('go-ext-import-settings')?.addEventListener('click', () => {
      document.getElementById('go-ext-import-file')?.click();
    });

    document.getElementById('go-ext-import-file')?.addEventListener('change', (e) => {
      this.importSettings(e);
    });

    // Breakpoint selector - delegate events
    this.setupBreakpointSelector();

    // Presets list - delegate events
    this.setupPresetsList();
  }

  /**
   * Setup breakpoint selector events
   */
  setupBreakpointSelector() {
    const selector = document.getElementById('go-ext-breakpoint-selector');
    if (!selector) return;

    selector.addEventListener('click', (e) => {
      const chip = e.target.closest('.go-ext-breakpoint-chip');
      const deleteBtn = e.target.closest('.go-ext-breakpoint-chip-delete');

      if (deleteBtn) {
        e.stopPropagation();
        const index = parseInt(deleteBtn.dataset.index);
        if (gridState.config.breakpoints.length > 1) {
          gridState.config.breakpoints.splice(index, 1);
          if (gridState.currentBreakpointIndex >= gridState.config.breakpoints.length) {
            gridState.currentBreakpointIndex = gridState.config.breakpoints.length - 1;
          }
          UIUpdater.renderBreakpoints();
          gridState.loadBreakpointSettings();
          UIUpdater.updateInputValues();
          this.gridRenderer.draw();
          StorageManager.saveSettings();
        }
      } else if (chip) {
        const index = parseInt(chip.dataset.index);
        if (!gridState.editingMode) {
          gridState.editingMode = true;
          UIUpdater.updateModeToggle();
          StorageManager.saveModeState();
        }
        gridState.selectBreakpoint(index);
        UIUpdater.renderBreakpoints();
        UIUpdater.updateInputValues();
        this.gridRenderer.draw();
      }
    });
  }

  /**
   * Setup presets list events
   */
  setupPresetsList() {
    const list = document.getElementById('go-ext-presets-list');
    if (!list) return;

    list.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.go-ext-preset-delete');
      const nameSpan = e.target.closest('span[data-index]');

      if (deleteBtn) {
        const index = parseInt(deleteBtn.dataset.index);
        StorageManager.loadPresets((presets) => {
          presets.splice(index, 1);
          StorageManager.savePresets(presets, () => {
            StorageManager.loadPresets((updatedPresets) => {
              UIUpdater.renderPresets(updatedPresets);
            });
          });
        });
      } else if (nameSpan) {
        const index = parseInt(nameSpan.dataset.index);
        StorageManager.loadPresets((presets) => {
          const preset = presets[index];
          if (preset) {
            gridState.config = JSON.parse(JSON.stringify(preset.config));
            ensureRowGapCompatibility(gridState.config);

            if (gridState.editingMode) {
              if (gridState.currentBreakpointIndex >= gridState.config.breakpoints.length) {
                gridState.currentBreakpointIndex = gridState.getViewportMatchingBreakpoint();
              }
            } else {
              gridState.currentBreakpointIndex = gridState.getViewportMatchingBreakpoint();
            }

            gridState.loadBreakpointSettings();
            UIUpdater.renderBreakpoints();
            UIUpdater.updateInputValues();
            this.gridRenderer.draw();
            StorageManager.saveSettings();
          }
        });
      }
    });
  }

  /**
   * Add breakpoint
   */
  addBreakpoint() {
    gridState.saveCurrentBreakpoint();

    const currentWidth = window.innerWidth;
    const breakpointCount = gridState.config.breakpoints.length + 1;
    const name = `Breakpoint ${breakpointCount}`;

    gridState.config.breakpoints.push({
      name: name,
      minWidth: currentWidth,
      columns: gridState.config.columns,
      gutter: gridState.config.gutter,
      margin: gridState.config.margin,
      rowGap: gridState.config.rowGap !== undefined ? gridState.config.rowGap : 8,
      maxWidth: 0,
      padding: 0
    });
    gridState.config.breakpoints.sort((a, b) => a.minWidth - b.minWidth);

    const newIndex = gridState.config.breakpoints.findIndex(bp => bp.name === name && bp.minWidth === currentWidth);
    gridState.currentBreakpointIndex = newIndex >= 0 ? newIndex : gridState.config.breakpoints.length - 1;

    if (!gridState.editingMode) {
      gridState.editingMode = true;
      UIUpdater.updateModeToggle();
      StorageManager.saveModeState();
    }

    UIUpdater.renderBreakpoints();
    gridState.loadBreakpointSettings();
    UIUpdater.updateInputValues();
    this.gridRenderer.draw();
    StorageManager.saveSettings();
  }

  /**
   * Save preset
   */
  savePreset() {
    const name = prompt('Preset name:');
    if (!name) return;

    const sanitizedName = sanitizePresetName(name);
    if (!sanitizedName) {
      alert('Invalid preset name. Please use only letters, numbers, spaces, dashes, and underscores.');
      return;
    }

    StorageManager.loadPresets((presets) => {
      presets.push({ name: sanitizedName, config: JSON.parse(JSON.stringify(gridState.config)) });
      StorageManager.savePresets(presets, () => {
        StorageManager.loadPresets((updatedPresets) => {
          UIUpdater.renderPresets(updatedPresets);
        });
      });
    });
  }

  /**
   * Export settings
   */
  exportSettings() {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(gridState.config))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    this.blobUrls.push(url);

    const link = document.createElement('a');
    link.href = url;
    link.download = `grid-overlay-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.blobUrls = this.blobUrls.filter(u => u !== url);
    }, 100);
  }

  /**
   * Import settings
   */
  importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        if (!importData.config) {
          alert('Invalid settings file: missing configuration data');
          return;
        }

        gridState.config = JSON.parse(JSON.stringify(importData.config));
        ensureRowGapCompatibility(gridState.config);

        if (gridState.editingMode) {
          if (gridState.currentBreakpointIndex >= gridState.config.breakpoints.length) {
            gridState.currentBreakpointIndex = gridState.getViewportMatchingBreakpoint();
          }
        } else {
          gridState.currentBreakpointIndex = gridState.getViewportMatchingBreakpoint();
        }

        gridState.loadBreakpointSettings();
        UIUpdater.renderBreakpoints();
        UIUpdater.updateInputValues();
        this.gridRenderer.draw();
        StorageManager.saveSettings();

        alert('Settings imported successfully!');
      } catch (error) {
        alert('Error importing settings: ' + error.message);
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  }

  /**
   * Setup window events
   */
  setupWindowEvents() {
    const debouncedUpdateCanvas = debounce(() => {
      this.gridRenderer.updateDimensions(this.container);
    }, CONSTANTS.MUTATION_DEBOUNCE_DELAY);

    window.addEventListener('resize', () => {
      this.gridRenderer.updateDimensions(this.container);
      UIUpdater.updateViewportWidth();
      if (!gridState.editingMode) {
        gridState.autoSelectBreakpoint();
        UIUpdater.renderBreakpoints();
      }
    });

    window.addEventListener('scroll', () => {
      this.gridRenderer.updateDimensions(this.container);
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.gridRenderer.updateDimensions(this.container);
    });
    this.resizeObserver.observe(document.body);

    this.mutationObserver = new MutationObserver(debouncedUpdateCanvas);
    this.mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ['style']
    });
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ['style']
    });
  }

  /**
   * Update toggle button icon based on state
   */
  updateToggleButtonIcon(isOpen) {
    if (!this.toggleBtn) return;

    // Clear existing icon
    this.toggleBtn.innerHTML = '';

    // Add appropriate icon
    if (isOpen) {
      this.toggleBtn.appendChild(Icons.x());
      this.toggleBtn.title = 'Close controls';
    } else {
      this.toggleBtn.appendChild(Icons.menu());
      this.toggleBtn.title = 'Open controls';
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls = [];
  }
}


  // ===== MAIN APPLICATION =====
  class GridOverlayApp {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.controls = null;
      this.toggleBtn = null;
      this.gridRenderer = null;
      this.eventHandlers = null;
    }

    init() {
      this.createElements();
      this.loadSettings();
      this.setupListeners();

      safeStorageGet(['gridEnabled'], (result) => {
        if (result.gridEnabled) {
          this.toggleGrid(true);
        }
      });
    }

    createElements() {
      this.container = UIBuilder.createContainer();
      this.canvas = UIBuilder.createCanvas();
      this.container.appendChild(this.canvas);

      const viewportIndicator = UIBuilder.createViewportIndicator();
      this.container.appendChild(viewportIndicator);

      this.controls = UIBuilder.createControls();
      this.container.appendChild(this.controls);

      this.toggleBtn = UIBuilder.createToggleButton();
      this.container.appendChild(this.toggleBtn);

      document.body.appendChild(this.container);

      this.gridRenderer = new GridRenderer(this.canvas);
    }

    loadSettings() {
      StorageManager.loadSettings(() => {
        UIUpdater.renderBreakpoints();
        UIUpdater.updateInputValues();
        StorageManager.loadPresets((presets) => {
          UIUpdater.renderPresets(presets);
        });
      });

      StorageManager.loadUIZoom(() => {
        UIUpdater.applyUIZoom();
      });

      StorageManager.loadGridVisibility(() => {
        UIUpdater.updateGridVisibility();
      });

      StorageManager.loadIndicatorVisibility(() => {
        UIUpdater.updateIndicatorVisibility();
      });

      StorageManager.loadModeState(() => {
        UIUpdater.updateModeToggle();
      });
    }

    setupListeners() {
      this.eventHandlers = new EventHandlers(this.gridRenderer);
      this.eventHandlers.setupListeners(this.container, this.controls, this.toggleBtn);
    }

    toggleGrid(enabled) {
      gridState.enabled = enabled;

      if (enabled) {
        this.container.classList.add('go-ext-active');
        this.gridRenderer.updateDimensions(this.container);
        this.gridRenderer.draw();

        if (this.eventHandlers && this.eventHandlers.mutationObserver) {
          this.eventHandlers.setupWindowEvents();
        }
      } else {
        this.container.classList.remove('go-ext-active');

        if (this.eventHandlers && this.eventHandlers.mutationObserver) {
          this.eventHandlers.mutationObserver.disconnect();
        }
      }

      StorageManager.saveGridEnabled();
    }

    cleanup() {
      if (this.eventHandlers) {
        this.eventHandlers.cleanup();
      }
    }
  }

  // Initialize
  const app = new GridOverlayApp();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleGrid') {
      app.toggleGrid(!gridState.enabled);
      sendResponse({ enabled: gridState.enabled });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }

  window.addEventListener('beforeunload', () => {
    app.cleanup();
  });
})();
