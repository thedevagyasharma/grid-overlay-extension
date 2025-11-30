(function() {
  'use strict';
  
  let gridState = {
    enabled: false,
    gridVisible: true,
    indicatorVisible: true,
    uiZoom: 100,
    editingMode: false, // false = viewing (auto-select), true = editing (manual selection)
    currentBreakpointIndex: 0,
    config: {
      columns: 12,
      gutter: 24,
      margin: 40,
      rowGap: 8,
      color: '#ff00ff',
      opacity: 0.15,
      maxWidth: 1200,
      breakpoints: [
        { name: 'Mobile', minWidth: 0, columns: 4, gutter: 16, margin: 16, rowGap: 8 },
        { name: 'Tablet', minWidth: 768, columns: 8, gutter: 20, margin: 24, rowGap: 8 },
        { name: 'Desktop', minWidth: 1024, columns: 12, gutter: 24, margin: 40, rowGap: 8 },
        { name: 'Wide', minWidth: 1440, columns: 12, gutter: 32, margin: 80, rowGap: 8 }
      ]
    }
  };

  let container, canvas, ctx, controls, toggleBtn;
  let resizeObserver, mutationObserver;

  function init() {
    createElements();
    loadSettings();
    setupListeners();
    
    chrome.storage.local.get(['gridEnabled'], (result) => {
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
    
    // Create viewport indicator
    const viewportIndicator = document.createElement('div');
    viewportIndicator.className = 'grid-viewport-indicator';
    viewportIndicator.id = 'grid-viewport-indicator';
    viewportIndicator.innerHTML = `
      <span class="viewport-width" id="viewport-width">0px</span>
      <span class="indicator-separator">•</span>
      <span class="breakpoint-name" id="breakpoint-name">—</span>
      <span class="breakpoint-range" id="breakpoint-range">—</span>
      <span class="indicator-separator">•</span>
      <span class="mode-status" id="mode-status">Viewing</span>
    `;
    container.appendChild(viewportIndicator);
    
    controls = createControls();
    container.appendChild(controls);
    
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'grid-toggle-btn';
    toggleBtn.innerHTML = '☰';
    toggleBtn.title = 'Toggle grid controls';
    container.appendChild(toggleBtn);
    
    document.body.appendChild(container);
  }

  function createControls() {
    // Create parent wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-controls-wrapper';

    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'grid-resize-handle';
    resizeHandle.innerHTML = '<div class="resize-handle-grip"></div>';

    // Create scrollable content container
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
      controls.style.display = controls.style.display === 'none' ? 'flex' : 'none';
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
      const newWidth = Math.max(280, Math.min(600, startWidth + deltaX));
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
      gridState.uiZoom = Math.min(200, gridState.uiZoom + 10);
      applyUIZoom();
      saveUIZoom();
    });

    document.getElementById('grid-zoom-out').addEventListener('click', () => {
      gridState.uiZoom = Math.max(50, gridState.uiZoom - 10);
      applyUIZoom();
      saveUIZoom();
    });

    // Setup unified input fields with autosave to current breakpoint
    const setupInput = (inputId, configKey, isOpacity = false) => {
      const input = document.getElementById(inputId);

      input.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) || 0;
        gridState.config[configKey] = isOpacity ? value / 100 : value;

        // Autosave to current breakpoint for breakpoint-specific settings
        if (['columns', 'gutter', 'rowGap', 'margin'].includes(configKey)) {
          saveCurrentBreakpoint();
        }

        drawGrid();
        saveSettings();
      });
    };

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

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateCanvasPosition);
    
    resizeObserver = new ResizeObserver(() => {
      updateCanvasPosition();
      drawGrid();
    });
    resizeObserver.observe(document.body);
    
    mutationObserver = new MutationObserver(() => {
      updateCanvasPosition();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    updateViewportWidth();
  }

  function handleResize() {
    updateCanvasPosition();
    updateViewportWidth();
    if (!gridState.editingMode) {
      // In viewing mode, auto-select breakpoint based on viewport
      autoSelectBreakpoint();
    }
    applyResponsiveBreakpoint();
    drawGrid();
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
      canvas.style.display = 'block';
    } else {
      toggle.classList.remove('active');
      canvas.style.display = 'none';
    }
  }

  function saveGridVisibility() {
    chrome.storage.local.set({ gridVisible: gridState.gridVisible });
  }

  function loadGridVisibility() {
    chrome.storage.local.get(['gridVisible'], (result) => {
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
        indicator.style.display = 'flex';
      }
    } else {
      toggle.classList.remove('active');
      if (indicator) {
        indicator.style.display = 'none';
      }
    }
  }

  function saveIndicatorVisibility() {
    chrome.storage.local.set({ indicatorVisible: gridState.indicatorVisible });
  }

  function loadIndicatorVisibility() {
    chrome.storage.local.get(['indicatorVisible'], (result) => {
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
    chrome.storage.local.set({ editingMode: gridState.editingMode });
  }

  function loadModeState() {
    chrome.storage.local.get(['editingMode'], (result) => {
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
    chrome.storage.local.set({ gridUIZoom: gridState.uiZoom });
  }

  function loadUIZoom() {
    chrome.storage.local.get(['gridUIZoom'], (result) => {
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
    document.getElementById('grid-cols-input').value = gridState.config.columns;
    document.getElementById('grid-gutter-input').value = gridState.config.gutter;
    document.getElementById('grid-margin-input').value = gridState.config.margin;
    document.getElementById('grid-row-gap-input').value = gridState.config.rowGap !== undefined ? gridState.config.rowGap : 8;
    document.getElementById('grid-max-width-input').value = gridState.config.maxWidth;
    document.getElementById('grid-color').value = gridState.config.color;

    const colorSwatch = document.getElementById('grid-color-swatch');
    if (colorSwatch) {
      colorSwatch.style.backgroundColor = gridState.config.color;
    }

    const opacityPercent = Math.round(gridState.config.opacity * 100);
    document.getElementById('grid-opacity-input').value = opacityPercent;

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
    const viewportMatchingIndex = getViewportMatchingBreakpoint();

    selector.innerHTML = gridState.config.breakpoints.map((bp, index) => `
      <div class="breakpoint-chip ${index === gridState.currentBreakpointIndex ? 'editing' : ''} ${index === viewportMatchingIndex ? 'viewport-match' : ''}" data-index="${index}">
        ${index === viewportMatchingIndex ? '<span class="viewport-match-icon">◆</span>' : ''}
        <span class="breakpoint-chip-name">${bp.name}</span>
        <span class="breakpoint-chip-width">${bp.minWidth}px</span>
        ${gridState.config.breakpoints.length > 1 ? `<button class="breakpoint-chip-delete" data-index="${index}">×</button>` : ''}
      </div>
    `).join('');

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
    const name = prompt('Breakpoint name:', 'Custom');
    if (!name) return;

    const minWidth = parseInt(prompt('Min width (px):', '1024'));
    if (isNaN(minWidth)) return;

    saveCurrentBreakpoint();

    gridState.config.breakpoints.push({
      name: name,
      minWidth: minWidth,
      columns: gridState.config.columns,
      gutter: gridState.config.gutter,
      margin: gridState.config.margin,
      rowGap: gridState.config.rowGap !== undefined ? gridState.config.rowGap : 8
    });
    gridState.config.breakpoints.sort((a, b) => a.minWidth - b.minWidth);

    // Find the index of the newly added breakpoint
    const newIndex = gridState.config.breakpoints.findIndex(bp => bp.name === name && bp.minWidth === minWidth);
    gridState.currentBreakpointIndex = newIndex >= 0 ? newIndex : gridState.config.breakpoints.length - 1;

    renderBreakpoints();
    loadBreakpointSettings();
    saveSettings();
  }

  function savePreset() {
    const name = prompt('Preset name:');
    if (!name) return;

    chrome.storage.local.get(['gridPresets'], (result) => {
      const presets = result.gridPresets || [];
      presets.push({ name, config: JSON.parse(JSON.stringify(gridState.config)) });
      chrome.storage.local.set({ gridPresets: presets }, () => {
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
    const link = document.createElement('a');
    link.href = url;
    link.download = `grid-overlay-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        updateInputValues();
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
    chrome.storage.local.get(['gridPresets'], (result) => {
      const presets = result.gridPresets || [];
      const list = document.getElementById('grid-presets-list');
      list.innerHTML = presets.map((preset, index) => `
        <div class="grid-preset-item">
          <span data-index="${index}">${preset.name}</span>
          <button class="grid-preset-delete" data-index="${index}">Delete</button>
        </div>
      `).join('');
      
      list.querySelectorAll('span').forEach(el => {
        el.addEventListener('click', () => {
          const preset = presets[el.dataset.index];
          gridState.config = JSON.parse(JSON.stringify(preset.config));
          updateInputValues();
          renderBreakpoints();
          applyResponsiveBreakpoint();
          drawGrid();
          saveSettings();
        });
      });
      
      list.querySelectorAll('.grid-preset-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          presets.splice(btn.dataset.index, 1);
          chrome.storage.local.set({ gridPresets: presets }, () => {
            renderPresets();
          });
        });
      });
    });
  }

  function saveSettings() {
    chrome.storage.local.set({
      gridConfig: gridState.config,
      currentBreakpointIndex: gridState.currentBreakpointIndex
    });
  }

  function loadSettings() {
    chrome.storage.local.get(['gridConfig', 'currentBreakpointIndex'], (result) => {
      if (result.gridConfig) {
        gridState.config = result.gridConfig;

        // Ensure rowGap exists (for backwards compatibility)
        if (gridState.config.rowGap === undefined) {
          gridState.config.rowGap = 8;
        }

        // Ensure each breakpoint has rowGap
        gridState.config.breakpoints.forEach(bp => {
          if (bp.rowGap === undefined) {
            bp.rowGap = 8;
          }
        });
      }
      if (result.currentBreakpointIndex !== undefined) {
        gridState.currentBreakpointIndex = result.currentBreakpointIndex;
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

  function toggleGrid(enabled) {
    gridState.enabled = enabled;
    if (enabled) {
      container.classList.add('active');
      updateCanvasPosition();
      applyResponsiveBreakpoint();
      drawGrid();
    } else {
      container.classList.remove('active');
    }
    chrome.storage.local.set({ gridEnabled: enabled });
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
