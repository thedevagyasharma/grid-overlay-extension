(function() {
  'use strict';

  // Constants
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

  // Utility: Debounce function
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

  // Utility: Sanitize HTML string
  function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Utility: Create element with properties
  function createElement(tag, properties = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(properties).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
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

  // Check if extension context is valid
  function isExtensionContextValid() {
    try {
      return chrome.runtime && chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  // Gracefully handle extension context invalidation
  if (!isExtensionContextValid()) {
    console.warn('Grid Overlay: Extension context invalidated. Please refresh the page.');
    return;
  }

  // Safe wrapper for Chrome Storage API calls
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

  // Utility: Ensure backwards compatibility for rowGap
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

  // Utility: Validate and sanitize preset name
  function sanitizePresetName(name) {
    if (!name || typeof name !== 'string') return null;
    // Remove HTML entities and limit length
    const sanitized = sanitizeHTML(name.trim()).substring(0, CONSTANTS.MAX_PRESET_NAME_LENGTH);
    // Only allow alphanumeric, spaces, dashes, underscores
    return sanitized.replace(/[^a-zA-Z0-9\s\-_]/g, '');
  }

  // Global error handler to catch any uncaught errors related to extension context
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('Extension context invalidated')) {
      console.warn('Grid Overlay: Extension was reloaded. Please refresh this page to restore grid overlay functionality.');
      event.preventDefault(); // Prevent the error from being logged to console as uncaught
      return true;
    }
  });

  let gridState = {
    enabled: false,
    gridVisible: true,
    indicatorVisible: true,
    uiZoom: 100,
    editingMode: false, // false = viewing (auto-select), true = editing (manual selection)
    currentBreakpointIndex: 0,
    config: {
      columns: 3,
      gutter: 8,
      margin: 16,
      rowGap: 8,
      color: '#ff0000',
      opacity: 0.15,
      maxWidth: 1200,
      breakpoints: [
        { name: 'xxs', minWidth: 0, columns: 3, gutter: 8, margin: 16, rowGap: 8 },
        { name: 'xs', minWidth: 360, columns: 4, gutter: 12, margin: 16, rowGap: 8 },
        { name: 'sm', minWidth: 550, columns: 6, gutter: 16, margin: 24, rowGap: 8 },
        { name: 'md', minWidth: 768, columns: 8, gutter: 16, margin: 32, rowGap: 8 },
        { name: 'lg', minWidth: 992, columns: 12, gutter: 16, margin: 48, rowGap: 8 },
        { name: 'xl', minWidth: 1200, columns: 12, gutter: 20, margin: 48, rowGap: 8 },
        { name: 'xxl', minWidth: 1440, columns: 12, gutter: 24, margin: 64, rowGap: 8 }
      ]
    }
  };

  let container, canvas, ctx, controls, toggleBtn;
  let resizeObserver, mutationObserver;
  let eventListeners = []; // Track listeners for cleanup
  let blobUrls = []; // Track blob URLs for cleanup

  function init() {
    createElements();
    loadSettings();
    setupListeners();

    safeStorageGet(['gridEnabled'], (result) => {
      if (result.gridEnabled) {
        toggleGrid(true);
      }
    });
  }

  function createElements() {
    container = document.createElement('div');
    container.className = 'grid-overlay-container';

    canvas = document.createElement('canvas');
    canvas.className = 'grid-overlay-canvas';
    container.appendChild(canvas);

    ctx = canvas.getContext('2d');

    document.body.appendChild(container);

    // Create viewport indicator using DOM methods (separate from container)
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

    document.body.appendChild(viewportIndicator);

    controls = createControls();
    document.body.appendChild(controls);

    toggleBtn = createElement('button', {
      className: 'grid-toggle-btn',
      textContent: '☰',
      title: 'Toggle grid controls'
    });
    document.body.appendChild(toggleBtn);
  }

  function createControls() {
    // Create parent wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-controls-wrapper';

    // Create resize handle
    const resizeHandle = createElement('div', {
      className: 'grid-resize-handle'
    });
    resizeHandle.appendChild(createElement('div', {
      className: 'resize-handle-grip'
    }));

    // Create scrollable content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'grid-overlay-controls';
    // Note: innerHTML used here is safe as it contains only static HTML with no user input
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

    // Assemble the structure
    wrapper.appendChild(resizeHandle);
    wrapper.appendChild(contentDiv);

    return wrapper;
  }

  function setupListeners() {
    toggleBtn.addEventListener('click', () => {
      controls.classList.toggle('minimized');
    });

    // Left-edge resize functionality
    const resizeHandle = controls.querySelector('.grid-resize-handle');
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = controls.offsetWidth;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const deltaX = startX - e.clientX;
      const newWidth = Math.max(CONSTANTS.RESIZE_MIN_WIDTH, Math.min(CONSTANTS.RESIZE_MAX_WIDTH, startWidth + deltaX));
      controls.style.width = newWidth + 'px';
      controls.style.setProperty('--controls-width', newWidth + 'px');
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

    // Grid visibility toggle
    document.getElementById('grid-visibility-toggle').addEventListener('click', () => {
      gridState.gridVisible = !gridState.gridVisible;
      updateGridVisibility();
      saveGridVisibility();
    });

    // Indicator visibility toggle
    document.getElementById('grid-indicator-toggle').addEventListener('click', () => {
      gridState.indicatorVisible = !gridState.indicatorVisible;
      updateIndicatorVisibility();
      saveIndicatorVisibility();
    });

    // Mode toggle (viewing/editing)
    document.getElementById('grid-mode-toggle').addEventListener('click', () => {
      gridState.editingMode = !gridState.editingMode;
      updateModeToggle();
      if (!gridState.editingMode) {
        // Switching to viewing mode - auto-select breakpoint
        autoSelectBreakpoint();
      }
      saveModeState();
    });

    // Keyboard shortcut: Ctrl+Shift+G to toggle grid
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        gridState.gridVisible = !gridState.gridVisible;
        updateGridVisibility();
        saveGridVisibility();
      }
    });

    // Zoom controls
    document.getElementById('grid-zoom-in').addEventListener('click', () => {
      gridState.uiZoom = Math.min(CONSTANTS.ZOOM_MAX, gridState.uiZoom + CONSTANTS.ZOOM_STEP);
      applyUIZoom();
      saveUIZoom();
    });

    document.getElementById('grid-zoom-out').addEventListener('click', () => {
      gridState.uiZoom = Math.max(CONSTANTS.ZOOM_MIN, gridState.uiZoom - CONSTANTS.ZOOM_STEP);
      applyUIZoom();
      saveUIZoom();
    });

    // Debounced save functions for better performance
    const debouncedSaveSettings = debounce(saveSettings, CONSTANTS.DEBOUNCE_DELAY);
    const debouncedSaveCurrentBreakpoint = debounce(saveCurrentBreakpoint, CONSTANTS.DEBOUNCE_DELAY);

    // Setup unified input fields with autosave to current breakpoint
    const setupInput = (inputId, configKey, isOpacity = false) => {
      const input = document.getElementById(inputId);

      input.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) || 0;
        gridState.config[configKey] = isOpacity ? value / 100 : value;

        // Immediate visual feedback
        drawGrid();

        // Autosave to current breakpoint for breakpoint-specific settings (debounced)
        if (['columns', 'gutter', 'rowGap', 'margin'].includes(configKey)) {
          debouncedSaveCurrentBreakpoint();
        }

        // Debounced save to prevent excessive storage writes
        debouncedSaveSettings();
      });
    };

    // Breakpoint-specific inputs with debounced saving
    const breakpointNameInput = document.getElementById('breakpoint-name-input');
    breakpointNameInput.addEventListener('input', (e) => {
      const currentBp = gridState.config.breakpoints[gridState.currentBreakpointIndex];
      if (currentBp) {
        // Sanitize input
        const sanitized = sanitizeHTML(e.target.value);
        currentBp.name = sanitized;
        renderBreakpoints();
        updateBreakpointName();
        debouncedSaveSettings();
      }
    });

    const breakpointMinWidthInput = document.getElementById('breakpoint-min-width-input');
    breakpointMinWidthInput.addEventListener('input', (e) => {
      const currentBp = gridState.config.breakpoints[gridState.currentBreakpointIndex];
      if (currentBp) {
        const value = parseInt(e.target.value) || 0;
        currentBp.minWidth = value;

        // Re-sort breakpoints after changing min-width
        gridState.config.breakpoints.sort((a, b) => a.minWidth - b.minWidth);

        // Find new index after sorting
        gridState.currentBreakpointIndex = gridState.config.breakpoints.indexOf(currentBp);

        renderBreakpoints();
        updateBreakpointName();
        debouncedSaveSettings();
      }
    });

    setupInput('grid-cols-input', 'columns');
    setupInput('grid-gutter-input', 'gutter');
    setupInput('grid-row-gap-input', 'rowGap');
    setupInput('grid-margin-input', 'margin');
    setupInput('grid-max-width-input', 'maxWidth');
    setupInput('grid-opacity-input', 'opacity', true);

    // Color picker functionality - input is directly clickable
    const colorSwatch = document.getElementById('grid-color-swatch');
    const colorInput = document.getElementById('grid-color');

    if (colorSwatch && colorInput) {
      // Initialize swatch with current color
      colorSwatch.style.backgroundColor = gridState.config.color;

      // Update color when user picks from color picker
      const updateColor = (e) => {
        gridState.config.color = e.target.value;
        colorSwatch.style.backgroundColor = e.target.value;
        drawGrid();
        saveSettings();
      };

      colorInput.addEventListener('change', updateColor);
      colorInput.addEventListener('input', updateColor);
    } else {
      console.error('Color picker elements not found:', { colorSwatch, colorInput });
    }

    document.getElementById('grid-save-preset').addEventListener('click', savePreset);
    document.getElementById('grid-add-breakpoint').addEventListener('click', addBreakpoint);
    document.getElementById('grid-export-settings').addEventListener('click', exportSettings);
    document.getElementById('grid-import-settings').addEventListener('click', () => {
      document.getElementById('grid-import-file').click();
    });
    document.getElementById('grid-import-file').addEventListener('change', importSettings);

    // Debounced handlers for better performance
    const debouncedUpdateCanvas = debounce(updateCanvasPosition, CONSTANTS.MUTATION_DEBOUNCE_DELAY);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateCanvasPosition);

    resizeObserver = new ResizeObserver(() => {
      updateCanvasPosition();
      // drawGrid() is already called by updateCanvasPosition()
    });
    resizeObserver.observe(document.body);

    // Optimized MutationObserver with debouncing and limited scope
    mutationObserver = new MutationObserver(debouncedUpdateCanvas);
    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: false, // Only watch direct children of documentElement
      attributes: true,
      attributeFilter: ['style'] // Only watch style changes
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: false, // Only watch direct children of body
      attributes: true,
      attributeFilter: ['style'] // Only watch style changes
    });
    
    updateViewportWidth();
  }

  function handleResize() {
    updateCanvasPosition(); // This already calls drawGrid()
    updateViewportWidth();
    if (!gridState.editingMode) {
      // In viewing mode, auto-select breakpoint based on viewport
      autoSelectBreakpoint();
    }
    applyResponsiveBreakpoint();
    // Note: drawGrid() is called by updateCanvasPosition(), no need to call again
  }

  function updateViewportWidth() {
    const width = window.innerWidth;
    const viewportWidthEl = document.getElementById('viewport-width');
    if (viewportWidthEl) {
      viewportWidthEl.textContent = `${width}px`;
    }
    updateBreakpointName();
    renderBreakpoints(); // Update viewport-matching icon
  }

  function updateGridVisibility() {
    const toggle = document.getElementById('grid-visibility-toggle');
    if (gridState.gridVisible) {
      toggle.classList.add('active');
      container.classList.add('active');
    } else {
      toggle.classList.remove('active');
      container.classList.remove('active');
    }
  }

  function saveGridVisibility() {
    safeStorageSet({ gridVisible: gridState.gridVisible });
  }

  function loadGridVisibility() {
    safeStorageGet(['gridVisible'], (result) => {
      if (result.gridVisible !== undefined) {
        gridState.gridVisible = result.gridVisible;
        updateGridVisibility();
      }
    });
  }

  function updateIndicatorVisibility() {
    const toggle = document.getElementById('grid-indicator-toggle');
    const indicator = document.getElementById('grid-viewport-indicator');
    if (gridState.indicatorVisible) {
      toggle.classList.add('active');
      if (indicator) {
        indicator.classList.remove('hidden');
      }
    } else {
      toggle.classList.remove('active');
      if (indicator) {
        indicator.classList.add('hidden');
      }
    }
  }

  function saveIndicatorVisibility() {
    safeStorageSet({ indicatorVisible: gridState.indicatorVisible });
  }

  function loadIndicatorVisibility() {
    safeStorageGet(['indicatorVisible'], (result) => {
      if (result.indicatorVisible !== undefined) {
        gridState.indicatorVisible = result.indicatorVisible;
        updateIndicatorVisibility();
      }
    });
  }

  function updateModeToggle() {
    const toggle = document.getElementById('grid-mode-toggle');
    const modeStatus = document.getElementById('mode-status');
    if (gridState.editingMode) {
      toggle.classList.add('active');
      if (modeStatus) {
        modeStatus.textContent = 'Editing';
        modeStatus.classList.add('editing');
        modeStatus.classList.remove('viewing');
      }
    } else {
      toggle.classList.remove('active');
      if (modeStatus) {
        modeStatus.textContent = 'Viewing';
        modeStatus.classList.add('viewing');
        modeStatus.classList.remove('editing');
      }
    }
  }

  function saveModeState() {
    safeStorageSet({ editingMode: gridState.editingMode });
  }

  function loadModeState() {
    safeStorageGet(['editingMode'], (result) => {
      if (result.editingMode !== undefined) {
        gridState.editingMode = result.editingMode;
        updateModeToggle();
      }
    });
  }

  function autoSelectBreakpoint() {
    const viewportIndex = getViewportMatchingBreakpoint();
    gridState.currentBreakpointIndex = viewportIndex;
    loadBreakpointSettings();
    renderBreakpoints();
  }

  function applyUIZoom() {
    const zoomPercent = gridState.uiZoom / 100;
    controls.style.transform = `scale(${zoomPercent})`;
    controls.style.transformOrigin = 'top right';
    document.getElementById('grid-zoom-label').textContent = `${gridState.uiZoom}%`;
  }

  function saveUIZoom() {
    safeStorageSet({ gridUIZoom: gridState.uiZoom });
  }

  function loadUIZoom() {
    safeStorageGet(['gridUIZoom'], (result) => {
      if (result.gridUIZoom) {
        gridState.uiZoom = result.gridUIZoom;
        applyUIZoom();
      }
    });
  }

  function updateCanvasPosition() {
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    container.style.height = docHeight + 'px';
    canvas.width = window.innerWidth;
    canvas.height = docHeight;
    
    drawGrid();
  }

  function applyResponsiveBreakpoint() {
    // This function is no longer used for automatic switching
    // Breakpoints are now manually selected by the user
  }

  function updateInputValues() {
    // Update breakpoint-specific fields
    const currentBp = gridState.config.breakpoints[gridState.currentBreakpointIndex];
    if (currentBp) {
      const nameInput = document.getElementById('breakpoint-name-input');
      const minWidthInput = document.getElementById('breakpoint-min-width-input');
      if (nameInput) nameInput.value = currentBp.name;
      if (minWidthInput) minWidthInput.value = currentBp.minWidth;
    }

    // Update grid settings with guard clauses
    const colsInput = document.getElementById('grid-cols-input');
    const gutterInput = document.getElementById('grid-gutter-input');
    const marginInput = document.getElementById('grid-margin-input');
    const rowGapInput = document.getElementById('grid-row-gap-input');
    const maxWidthInput = document.getElementById('grid-max-width-input');
    const colorInput = document.getElementById('grid-color');
    const opacityInput = document.getElementById('grid-opacity-input');

    if (colsInput) colsInput.value = gridState.config.columns;
    if (gutterInput) gutterInput.value = gridState.config.gutter;
    if (marginInput) marginInput.value = gridState.config.margin;
    if (rowGapInput) rowGapInput.value = gridState.config.rowGap !== undefined ? gridState.config.rowGap : CONSTANTS.DEFAULT_ROW_GAP;
    if (maxWidthInput) maxWidthInput.value = gridState.config.maxWidth;
    if (colorInput) colorInput.value = gridState.config.color;

    const colorSwatch = document.getElementById('grid-color-swatch');
    if (colorSwatch) {
      colorSwatch.style.backgroundColor = gridState.config.color;
    }

    if (opacityInput) {
      const opacityPercent = Math.round(gridState.config.opacity * 100);
      opacityInput.value = opacityPercent;
    }

    updateViewportWidth();
  }

  function drawGrid() {
    if (!ctx || !gridState.enabled || !gridState.gridVisible) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const viewportWidth = window.innerWidth;
    const maxWidth = gridState.config.maxWidth > 0 ? 
      Math.min(gridState.config.maxWidth, viewportWidth - gridState.config.margin * 2) : 
      viewportWidth - gridState.config.margin * 2;
    
    const left = (viewportWidth - maxWidth) / 2;
    const totalGutterWidth = (gridState.config.columns - 1) * gridState.config.gutter;
    const colWidth = (maxWidth - totalGutterWidth) / gridState.config.columns;
    
    ctx.fillStyle = gridState.config.color;
    ctx.globalAlpha = gridState.config.opacity;
    
    const startY = 0;
    const endY = canvas.height;
    
    for (let i = 0; i < gridState.config.columns; i++) {
      const x = left + i * (colWidth + gridState.config.gutter);
      ctx.fillRect(x, startY, colWidth, endY - startY);
    }
    
    if (gridState.config.rowGap > 0) {
      ctx.globalAlpha = gridState.config.opacity * 0.5;
      for (let y = startY; y < endY; y += gridState.config.rowGap) {
        ctx.fillRect(left, y, maxWidth, 1);
      }
    }
  }

  function renderBreakpoints() {
    const selector = document.getElementById('breakpoint-selector');
    if (!selector) return;

    const viewportMatchingIndex = getViewportMatchingBreakpoint();

    // Clear existing content
    selector.innerHTML = '';

    // Create breakpoint chips using DOM methods
    gridState.config.breakpoints.forEach((bp, index) => {
      const chip = createElement('div', {
        className: `breakpoint-chip ${index === gridState.currentBreakpointIndex ? 'editing' : ''} ${index === viewportMatchingIndex ? 'viewport-match' : ''}`,
        'data-index': index
      });

      // Add viewport match icon if applicable
      if (index === viewportMatchingIndex) {
        const icon = createElement('span', {
          className: 'viewport-match-icon',
          textContent: '◆'
        });
        chip.appendChild(icon);
      }

      // Add breakpoint name (sanitized)
      const nameSpan = createElement('span', {
        className: 'breakpoint-chip-name',
        textContent: sanitizeHTML(bp.name)
      });
      chip.appendChild(nameSpan);

      // Add breakpoint width
      const widthSpan = createElement('span', {
        className: 'breakpoint-chip-width',
        textContent: `${bp.minWidth}px`
      });
      chip.appendChild(widthSpan);

      // Add delete button if more than one breakpoint exists
      if (gridState.config.breakpoints.length > 1) {
        const deleteBtn = createElement('button', {
          className: 'breakpoint-chip-delete',
          'data-index': index,
          textContent: '×'
        });
        chip.appendChild(deleteBtn);
      }

      selector.appendChild(chip);
    });

    // Add click handlers for selecting breakpoints
    selector.querySelectorAll('.breakpoint-chip').forEach((chip, index) => {
      chip.addEventListener('click', (e) => {
        if (!e.target.classList.contains('breakpoint-chip-delete')) {
          selectBreakpoint(index);
        }
      });
    });

    // Add click handlers for delete buttons
    selector.querySelectorAll('.breakpoint-chip-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        if (gridState.config.breakpoints.length > 1) {
          gridState.config.breakpoints.splice(index, 1);
          if (gridState.currentBreakpointIndex >= gridState.config.breakpoints.length) {
            gridState.currentBreakpointIndex = gridState.config.breakpoints.length - 1;
          }
          renderBreakpoints();
          loadBreakpointSettings();
          saveSettings();
        }
      });
    });
  }

  function selectBreakpoint(index) {
    saveCurrentBreakpoint();
    gridState.currentBreakpointIndex = index;
    // Switch to editing mode when manually selecting a breakpoint
    if (!gridState.editingMode) {
      gridState.editingMode = true;
      updateModeToggle();
      saveModeState();
    }
    loadBreakpointSettings();
    renderBreakpoints();
  }

  function saveCurrentBreakpoint() {
    const currentBp = gridState.config.breakpoints[gridState.currentBreakpointIndex];
    if (currentBp) {
      currentBp.columns = gridState.config.columns;
      currentBp.gutter = gridState.config.gutter;
      currentBp.margin = gridState.config.margin;
      currentBp.rowGap = gridState.config.rowGap;
      saveSettings();
    }
  }

  function loadBreakpointSettings() {
    const currentBp = gridState.config.breakpoints[gridState.currentBreakpointIndex];
    if (currentBp) {
      gridState.config.columns = currentBp.columns;
      gridState.config.gutter = currentBp.gutter;
      gridState.config.margin = currentBp.margin;
      gridState.config.rowGap = currentBp.rowGap !== undefined ? currentBp.rowGap : 8;
      updateInputValues();
      updateBreakpointName();
      drawGrid();
    }
  }

  function getViewportMatchingBreakpoint() {
    const width = window.innerWidth;
    let matchingIndex = 0;

    for (let i = gridState.config.breakpoints.length - 1; i >= 0; i--) {
      const bp = gridState.config.breakpoints[i];
      if (width >= bp.minWidth) {
        matchingIndex = i;
        break;
      }
    }

    return matchingIndex;
  }

  function updateBreakpointName() {
    const nameEl = document.getElementById('breakpoint-name');
    const rangeEl = document.getElementById('breakpoint-range');

    if (nameEl && rangeEl) {
      // In editing mode, show the editing breakpoint
      // In viewing mode, show the viewport-matching breakpoint
      const displayIndex = gridState.editingMode ? gridState.currentBreakpointIndex : getViewportMatchingBreakpoint();
      const displayBp = gridState.config.breakpoints[displayIndex];

      if (displayBp) {
        nameEl.textContent = displayBp.name;

        // Calculate range
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

  function addBreakpoint() {
    saveCurrentBreakpoint();

    // Use current viewport width as default min-width
    const currentWidth = window.innerWidth;

    // Generate a name based on the breakpoint count
    const breakpointCount = gridState.config.breakpoints.length + 1;
    const name = `Breakpoint ${breakpointCount}`;

    gridState.config.breakpoints.push({
      name: name,
      minWidth: currentWidth,
      columns: gridState.config.columns,
      gutter: gridState.config.gutter,
      margin: gridState.config.margin,
      rowGap: gridState.config.rowGap !== undefined ? gridState.config.rowGap : 8
    });
    gridState.config.breakpoints.sort((a, b) => a.minWidth - b.minWidth);

    // Find the index of the newly added breakpoint
    const newIndex = gridState.config.breakpoints.findIndex(bp => bp.name === name && bp.minWidth === currentWidth);
    gridState.currentBreakpointIndex = newIndex >= 0 ? newIndex : gridState.config.breakpoints.length - 1;

    // Switch to editing mode
    if (!gridState.editingMode) {
      gridState.editingMode = true;
      updateModeToggle();
      saveModeState();
    }

    renderBreakpoints();
    loadBreakpointSettings();
    saveSettings();
  }

  function savePreset() {
    const name = prompt('Preset name:');
    if (!name) return;

    // Sanitize and validate preset name
    const sanitizedName = sanitizePresetName(name);
    if (!sanitizedName) {
      alert('Invalid preset name. Please use only letters, numbers, spaces, dashes, and underscores.');
      return;
    }

    safeStorageGet(['gridPresets'], (result) => {
      const presets = result.gridPresets || [];
      presets.push({ name: sanitizedName, config: JSON.parse(JSON.stringify(gridState.config)) });
      safeStorageSet({ gridPresets: presets }, () => {
        renderPresets();
      });
    });
  }

  function exportSettings() {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(gridState.config))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    // Track blob URL for cleanup
    blobUrls.push(url);

    const link = document.createElement('a');
    link.href = url;
    link.download = `grid-overlay-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup blob URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
      blobUrls = blobUrls.filter(u => u !== url);
    }, 100);
  }

  function importSettings(event) {
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

        // Ensure backwards compatibility
        ensureRowGapCompatibility(gridState.config);

        // Set active breakpoint based on viewport width
        if (gridState.editingMode) {
          // In editing mode, keep current index if valid, otherwise use viewport-matching
          if (gridState.currentBreakpointIndex >= gridState.config.breakpoints.length) {
            gridState.currentBreakpointIndex = getViewportMatchingBreakpoint();
          }
        } else {
          // In viewing mode, always use viewport-matching
          gridState.currentBreakpointIndex = getViewportMatchingBreakpoint();
        }

        loadBreakpointSettings();
        renderBreakpoints();
        applyResponsiveBreakpoint();
        drawGrid();
        saveSettings();

        alert('Settings imported successfully!');
      } catch (error) {
        alert('Error importing settings: ' + error.message);
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  }

  function renderPresets() {
    safeStorageGet(['gridPresets'], (result) => {
      const presets = result.gridPresets || [];
      const list = document.getElementById('grid-presets-list');
      if (!list) return;

      // Clear existing content
      list.innerHTML = '';

      // Create preset items using DOM methods
      presets.forEach((preset, index) => {
        const item = createElement('div', {
          className: 'grid-preset-item'
        });

        // Create preset name span (sanitized)
        const nameSpan = createElement('span', {
          'data-index': index,
          textContent: sanitizeHTML(preset.name)
        });
        item.appendChild(nameSpan);

        // Create delete button
        const deleteBtn = createElement('button', {
          className: 'grid-preset-delete',
          'data-index': index,
          textContent: 'Delete'
        });
        item.appendChild(deleteBtn);

        list.appendChild(item);
      });

      list.querySelectorAll('span').forEach(el => {
        el.addEventListener('click', () => {
          const preset = presets[el.dataset.index];
          gridState.config = JSON.parse(JSON.stringify(preset.config));

          // Ensure backwards compatibility
          ensureRowGapCompatibility(gridState.config);

          // Set active breakpoint based on viewport width
          if (gridState.editingMode) {
            // In editing mode, keep current index if valid, otherwise use viewport-matching
            if (gridState.currentBreakpointIndex >= gridState.config.breakpoints.length) {
              gridState.currentBreakpointIndex = getViewportMatchingBreakpoint();
            }
          } else {
            // In viewing mode, always use viewport-matching
            gridState.currentBreakpointIndex = getViewportMatchingBreakpoint();
          }

          loadBreakpointSettings();
          renderBreakpoints();
          applyResponsiveBreakpoint();
          drawGrid();
          saveSettings();
        });
      });

      list.querySelectorAll('.grid-preset-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          presets.splice(btn.dataset.index, 1);
          safeStorageSet({ gridPresets: presets }, () => {
            renderPresets();
          });
        });
      });
    });
  }

  function saveSettings() {
    safeStorageSet({
      gridConfig: gridState.config,
      currentBreakpointIndex: gridState.currentBreakpointIndex
    });
  }

  function loadSettings() {
    safeStorageGet(['gridConfig', 'currentBreakpointIndex'], (result) => {
      if (result.gridConfig) {
        gridState.config = result.gridConfig;

        // Ensure backwards compatibility
        ensureRowGapCompatibility(gridState.config);
      }

      // In viewing mode, always use viewport-matching breakpoint
      // In editing mode, use saved index if available
      if (gridState.editingMode) {
        if (result.currentBreakpointIndex !== undefined) {
          gridState.currentBreakpointIndex = result.currentBreakpointIndex;
        }
      } else {
        // Viewing mode: auto-select based on viewport
        gridState.currentBreakpointIndex = getViewportMatchingBreakpoint();
      }

      renderBreakpoints();
      loadBreakpointSettings();
      renderPresets();
    });
    loadUIZoom();
    loadGridVisibility();
    loadIndicatorVisibility();
    loadModeState();
  }

  function cleanup() {
    // Disconnect observers
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (mutationObserver) {
      mutationObserver.disconnect();
    }

    // Cleanup blob URLs
    blobUrls.forEach(url => URL.revokeObjectURL(url));
    blobUrls = [];

    // Note: Event listeners are automatically cleaned up when elements are removed from DOM
  }

  function toggleGrid(enabled) {
    gridState.enabled = enabled;
    if (enabled) {
      container.classList.add('active');
      updateCanvasPosition();
      applyResponsiveBreakpoint();
      drawGrid();

      // Reconnect mutation observer when re-enabling
      if (mutationObserver) {
        const debouncedUpdateCanvas = debounce(updateCanvasPosition, CONSTANTS.MUTATION_DEBOUNCE_DELAY);
        mutationObserver.disconnect();
        mutationObserver = new MutationObserver(debouncedUpdateCanvas);
        mutationObserver.observe(document.documentElement, {
          childList: true,
          subtree: false,
          attributes: true,
          attributeFilter: ['style']
        });
        mutationObserver.observe(document.body, {
          childList: true,
          subtree: false,
          attributes: true,
          attributeFilter: ['style']
        });
      }
    } else {
      container.classList.remove('active');
      // Disconnect observers when grid is hidden to save resources
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    }
    safeStorageSet({ gridEnabled: enabled });
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleGrid') {
      toggleGrid(!gridState.enabled);
      sendResponse({ enabled: gridState.enabled });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
