/**
 * DOM/UI module for element creation and manipulation
 */

import { createElement, sanitizeHTML } from './utils.js';

/**
 * Create viewport indicator element
 * @returns {HTMLElement} Viewport indicator element
 */
export function createViewportIndicator() {
  const viewportIndicator = createElement('div', {
    className: 'grid-viewport-indicator',
    id: 'grid-viewport-indicator'
  });

  viewportIndicator.appendChild(createElement('span', {
    className: 'viewport-width',
    id: 'viewport-width',
    textContent: '0px'
  }));

  viewportIndicator.appendChild(createElement('span', {
    className: 'indicator-separator',
    textContent: '•'
  }));

  viewportIndicator.appendChild(createElement('span', {
    className: 'breakpoint-name',
    id: 'breakpoint-name',
    textContent: '—'
  }));

  viewportIndicator.appendChild(createElement('span', {
    className: 'breakpoint-range',
    id: 'breakpoint-range',
    textContent: '—'
  }));

  viewportIndicator.appendChild(createElement('span', {
    className: 'indicator-separator',
    textContent: '•'
  }));

  viewportIndicator.appendChild(createElement('span', {
    className: 'mode-status',
    id: 'mode-status',
    textContent: 'Viewing'
  }));

  return viewportIndicator;
}

/**
 * Create toggle button element
 * @returns {HTMLElement} Toggle button element
 */
export function createToggleButton() {
  return createElement('button', {
    className: 'grid-toggle-btn',
    textContent: '×',
    title: 'Toggle grid controls'
  });
}

/**
 * Create controls wrapper with resize handle
 * @returns {HTMLElement} Controls wrapper element
 */
export function createControlsWrapper() {
  const wrapper = document.createElement('div');
  wrapper.className = 'grid-controls-wrapper';

  const resizeHandle = createElement('div', {
    className: 'grid-resize-handle'
  });
  resizeHandle.appendChild(createElement('div', {
    className: 'resize-handle-grip'
  }));

  const contentDiv = document.createElement('div');
  contentDiv.className = 'grid-overlay-controls';
  contentDiv.innerHTML = `
    <div class="grid-zoom-section">
      <label for="grid-zoom-label" class="zoom-section-label">UI Scaling Factor</label>
      <div class="grid-zoom-controls">
        <button class="grid-zoom-btn" id="grid-zoom-out" title="Zoom Out" aria-label="Decrease UI scale">-</button>
        <span class="grid-zoom-label" id="grid-zoom-label" role="status" aria-live="polite">100%</span>
        <button class="grid-zoom-btn" id="grid-zoom-in" title="Zoom In" aria-label="Increase UI scale">+</button>
      </div>
    </div>

    <div class="grid-visibility-toggle">
      <label for="grid-visibility-toggle">
        Show Grid
        <span class="keyboard-hint">Ctrl+Shift+G</span>
      </label>
      <div class="toggle-switch active" id="grid-visibility-toggle">
        <div class="toggle-slider"></div>
      </div>
    </div>

    <div class="grid-visibility-toggle">
      <label for="grid-indicator-toggle">Show Indicator</label>
      <div class="toggle-switch active" id="grid-indicator-toggle">
        <div class="toggle-slider"></div>
      </div>
    </div>

    <div class="grid-mode-toggle">
      <label for="grid-mode-toggle">Edit Mode</label>
      <div class="toggle-switch" id="grid-mode-toggle">
        <div class="toggle-slider"></div>
      </div>
    </div>

    <div class="section-divider"></div>

    <h3 style="margin: 0 0 10px 0;">Breakpoints</h3>
    <div id="breakpoint-selector" class="breakpoint-selector"></div>
    <button class="grid-btn" id="grid-add-breakpoint" style="width: 100%; margin-bottom: 16px;">+ Add Breakpoint</button>

    <div class="section-divider"></div>

    <h3 style="margin: 0 0 15px 0;">Breakpoint Settings</h3>

    <div class="grid-control-row">
      <label for="breakpoint-name-input">Name</label>
      <div class="figma-input-wrapper">
        <input type="text" id="breakpoint-name-input" value="Mobile" class="figma-input">
      </div>
    </div>

    <div class="grid-control-row">
      <label for="breakpoint-min-width-input">Min Width</label>
      <div class="figma-input-wrapper">
        <input type="number" id="breakpoint-min-width-input" min="0" max="5000" value="0" class="figma-input">
        <span class="input-unit">px</span>
      </div>
    </div>

    <div class="section-divider"></div>

    <h3 style="margin: 0 0 15px 0;">Grid Settings</h3>

    <div class="grid-control-row">
      <label for="grid-cols-input">Columns</label>
      <div class="figma-input-wrapper">
        <input type="number" id="grid-cols-input" min="1" max="24" value="12" class="figma-input">
      </div>
    </div>

    <div class="grid-control-row">
      <label for="grid-gutter-input">Column Gutter</label>
      <div class="figma-input-wrapper">
        <input type="number" id="grid-gutter-input" min="0" max="100" value="24" class="figma-input">
        <span class="input-unit">px</span>
      </div>
    </div>

    <div class="grid-control-row">
      <label for="grid-row-gap-input">Row Gap</label>
      <div class="figma-input-wrapper">
        <input type="number" id="grid-row-gap-input" min="0" max="100" value="8" class="figma-input">
        <span class="input-unit">px</span>
      </div>
    </div>

    <div class="grid-control-row">
      <label for="grid-margin-input">Margin</label>
      <div class="figma-input-wrapper">
        <input type="number" id="grid-margin-input" min="0" max="200" value="40" class="figma-input">
        <span class="input-unit">px</span>
      </div>
    </div>

    <div class="grid-control-row">
      <label for="grid-max-width-input">Max Width</label>
      <div class="figma-input-wrapper">
        <input type="number" id="grid-max-width-input" min="0" max="2000" step="50" value="1200" class="figma-input">
        <span class="input-unit">px</span>
      </div>
    </div>

    <div class="grid-control-row">
      <label for="grid-color">Grid Color</label>
      <div class="color-input-container">
        <input type="color" id="grid-color" value="#ff00ff" class="color-input-hidden">
        <div class="color-swatch" id="grid-color-swatch" title="Click to change color"></div>
      </div>
    </div>

    <div class="grid-control-row">
      <label for="grid-opacity-input">Opacity</label>
      <div class="figma-input-wrapper">
        <input type="number" id="grid-opacity-input" min="0" max="100" value="15" class="figma-input">
        <span class="input-unit">%</span>
      </div>
    </div>

    <div class="section-divider"></div>

    <div class="grid-control-buttons">
      <button class="grid-btn grid-btn-primary" id="grid-save-preset">Save Preset</button>
    </div>

    <div class="grid-control-buttons" style="margin-top: 10px;">
      <button class="grid-btn" id="grid-export-settings">Export Settings</button>
      <button class="grid-btn" id="grid-import-settings">Import Settings</button>
    </div>
    <input type="file" id="grid-import-file" accept=".json" style="display: none;">

    <div style="margin-top: 20px;">
      <h3>Presets</h3>
      <div id="grid-presets-list"></div>
    </div>
  `;

  wrapper.appendChild(resizeHandle);
  wrapper.appendChild(contentDiv);

  return wrapper;
}

/**
 * Create breakpoint chip element
 * @param {Object} breakpoint - Breakpoint configuration
 * @param {number} index - Breakpoint index
 * @param {boolean} isEditing - Is currently being edited
 * @param {boolean} isViewportMatch - Matches current viewport
 * @param {boolean} canDelete - Can be deleted (more than one breakpoint exists)
 * @returns {HTMLElement} Breakpoint chip element
 */
export function createBreakpointChip(breakpoint, index, isEditing, isViewportMatch, canDelete) {
  const chip = createElement('div', {
    className: `breakpoint-chip ${isEditing ? 'editing' : ''} ${isViewportMatch ? 'viewport-match' : ''}`,
    'data-index': index
  });

  if (isViewportMatch) {
    const icon = createElement('span', {
      className: 'viewport-match-icon',
      textContent: '◆'
    });
    chip.appendChild(icon);
  }

  const nameSpan = createElement('span', {
    className: 'breakpoint-chip-name',
    textContent: sanitizeHTML(breakpoint.name)
  });
  chip.appendChild(nameSpan);

  const widthSpan = createElement('span', {
    className: 'breakpoint-chip-width',
    textContent: `${breakpoint.minWidth}px`
  });
  chip.appendChild(widthSpan);

  if (canDelete) {
    const deleteBtn = createElement('button', {
      className: 'breakpoint-chip-delete',
      'data-index': index,
      textContent: '×'
    });
    chip.appendChild(deleteBtn);
  }

  return chip;
}

/**
 * Create preset item element
 * @param {Object} preset - Preset configuration
 * @param {number} index - Preset index
 * @returns {HTMLElement} Preset item element
 */
export function createPresetItem(preset, index) {
  const item = createElement('div', {
    className: 'grid-preset-item'
  });

  const nameSpan = createElement('span', {
    'data-index': index,
    textContent: sanitizeHTML(preset.name)
  });
  item.appendChild(nameSpan);

  const deleteBtn = createElement('button', {
    className: 'grid-preset-delete',
    'data-index': index,
    textContent: 'Delete'
  });
  item.appendChild(deleteBtn);

  return item;
}

/**
 * Update viewport width display
 * @param {number} width - Viewport width in pixels
 */
export function updateViewportWidthDisplay(width) {
  const viewportWidthEl = document.getElementById('viewport-width');
  if (viewportWidthEl) {
    viewportWidthEl.textContent = `${width}px`;
  }
}

/**
 * Update breakpoint name display
 * @param {Object} breakpoint - Breakpoint configuration
 */
export function updateBreakpointNameDisplay(breakpoint, nextBreakpoint) {
  const nameEl = document.getElementById('breakpoint-name');
  const rangeEl = document.getElementById('breakpoint-range');

  if (nameEl && rangeEl && breakpoint) {
    nameEl.textContent = breakpoint.name;

    const minWidth = breakpoint.minWidth;
    const maxWidth = nextBreakpoint ? nextBreakpoint.minWidth - 1 : '∞';

    rangeEl.textContent = maxWidth === '∞' ? `${minWidth}px+` : `${minWidth}px – ${maxWidth}px`;
  } else if (nameEl && rangeEl) {
    nameEl.textContent = '—';
    rangeEl.textContent = '—';
  }
}

/**
 * Update mode status display
 * @param {boolean} editingMode - Whether in editing mode
 */
export function updateModeStatusDisplay(editingMode) {
  const modeStatus = document.getElementById('mode-status');
  if (modeStatus) {
    modeStatus.textContent = editingMode ? 'Editing' : 'Viewing';
    if (editingMode) {
      modeStatus.classList.add('editing');
      modeStatus.classList.remove('viewing');
    } else {
      modeStatus.classList.add('viewing');
      modeStatus.classList.remove('editing');
    }
  }
}
