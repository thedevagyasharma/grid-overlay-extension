(function() {
  'use strict';
  
  let gridState = {
    enabled: false,
    gridVisible: true,
    uiZoom: 100,
    config: {
      columns: 12,
      gutter: 24,
      margin: 40,
      rowGap: 8,
      color: '#ff00ff',
      opacity: 0.15,
      maxWidth: 1200,
      breakpoints: [
        { name: 'Mobile', minWidth: 0, columns: 4, gutter: 16, margin: 16 },
        { name: 'Tablet', minWidth: 768, columns: 8, gutter: 20, margin: 24 },
        { name: 'Desktop', minWidth: 1024, columns: 12, gutter: 24, margin: 40 },
        { name: 'Wide', minWidth: 1440, columns: 12, gutter: 32, margin: 80 }
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
    viewportIndicator.textContent = '0px';
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
    const div = document.createElement('div');
    div.className = 'grid-overlay-controls';
    div.innerHTML = `
      <div class="grid-zoom-controls">
        <button class="grid-zoom-btn" id="grid-zoom-out" title="Zoom Out">-</button>
        <span class="grid-zoom-label" id="grid-zoom-label">100%</span>
        <button class="grid-zoom-btn" id="grid-zoom-in" title="Zoom In">+</button>
      </div>
      
      <div class="grid-visibility-toggle">
        <label for="grid-visibility-toggle">Show Grid</label>
        <div class="toggle-switch active" id="grid-visibility-toggle">
          <div class="toggle-slider"></div>
        </div>
      </div>
      
      <h3 style="margin: 0 0 15px 0;">Grid Overlay</h3>
      
      <div class="grid-control-group">
        <label>
          <span>Columns</span>
          <span class="value-display" id="cols-value">12</span>
        </label>
        <input type="range" id="grid-cols" min="1" max="24" value="12">
        <input type="number" id="grid-cols-input" min="1" max="24" value="12" style="margin-top: 6px;">
      </div>
      
      <div class="grid-control-group">
        <label>
          <span>Column Gutter</span>
          <span class="value-display" id="gutter-value">24px</span>
        </label>
        <input type="range" id="grid-gutter" min="0" max="100" value="24">
        <input type="number" id="grid-gutter-input" min="0" max="100" value="24" style="margin-top: 6px;">
      </div>
      
      <div class="grid-control-group">
        <label>
          <span>Row Gap</span>
          <span class="value-display" id="row-gap-value">8px</span>
        </label>
        <input type="range" id="grid-row-gap" min="0" max="100" value="8">
        <input type="number" id="grid-row-gap-input" min="0" max="100" value="8" style="margin-top: 6px;">
        <div class="info-text">Spacing between horizontal guidelines</div>
      </div>
      
      <div class="grid-control-group">
        <label>
          <span>Margin</span>
          <span class="value-display" id="margin-value">40px</span>
        </label>
        <input type="range" id="grid-margin" min="0" max="200" value="40">
        <input type="number" id="grid-margin-input" min="0" max="200" value="40" style="margin-top: 6px;">
      </div>
      
      <div class="grid-control-group">
        <label>
          <span>Max Width</span>
          <span class="value-display" id="max-width-value">1200px</span>
        </label>
        <input type="range" id="grid-max-width" min="0" max="2000" step="50" value="1200">
        <input type="number" id="grid-max-width-input" min="0" max="2000" step="50" value="1200" style="margin-top: 6px;">
        <div class="info-text">0 = full width</div>
      </div>
      
      <div class="grid-control-group">
        <label>Grid Color</label>
        <input type="color" id="grid-color" value="#ff00ff">
      </div>
      
      <div class="grid-control-group">
        <label>
          <span>Opacity</span>
          <span class="value-display" id="opacity-value">15%</span>
        </label>
        <input type="range" id="grid-opacity" min="0" max="100" value="15">
        <input type="number" id="grid-opacity-input" min="0" max="100" value="15" style="margin-top: 6px;">
      </div>
      
      <div class="section-divider"></div>
      
      <h3>Responsive Breakpoints</h3>
      <div class="breakpoint-header">
        <span>Name</span>
        <span>Min Width</span>
        <span>Cols</span>
        <span>Gutter</span>
        <span>Margin</span>
        <span></span>
      </div>
      <div id="breakpoint-list" class="breakpoint-list"></div>
      
      <div class="grid-control-buttons">
        <button class="grid-btn" id="grid-add-breakpoint">Add Breakpoint</button>
      </div>
      
      <div class="section-divider"></div>
      
      <div class="grid-control-buttons">
        <button class="grid-btn grid-btn-primary" id="grid-save-preset">Save Preset</button>
      </div>
      
      <div style="margin-top: 20px;">
        <h3>Presets</h3>
        <div id="grid-presets-list"></div>
      </div>
    `;
    return div;
  }

  function setupListeners() {
    toggleBtn.addEventListener('click', () => {
      controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
    });

    // Grid visibility toggle
    document.getElementById('grid-visibility-toggle').addEventListener('click', () => {
      gridState.gridVisible = !gridState.gridVisible;
      updateGridVisibility();
      saveGridVisibility();
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

    // Columns
    const setupDualInput = (rangeId, inputId, configKey, displayId, suffix = '') => {
      const range = document.getElementById(rangeId);
      const input = document.getElementById(inputId);
      const display = document.getElementById(displayId);
      
      range.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) || 0;
        gridState.config[configKey] = value;
        input.value = value;
        display.textContent = suffix === '' && value === 0 && configKey === 'maxWidth' ? 'Full' : value + suffix;
        drawGrid();
        saveSettings();
      });
      
      input.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) || 0;
        gridState.config[configKey] = value;
        range.value = value;
        display.textContent = suffix === '' && value === 0 && configKey === 'maxWidth' ? 'Full' : value + suffix;
        drawGrid();
        saveSettings();
      });
    };

    setupDualInput('grid-cols', 'grid-cols-input', 'columns', 'cols-value', '');
    setupDualInput('grid-gutter', 'grid-gutter-input', 'gutter', 'gutter-value', 'px');
    setupDualInput('grid-row-gap', 'grid-row-gap-input', 'rowGap', 'row-gap-value', 'px');
    setupDualInput('grid-margin', 'grid-margin-input', 'margin', 'margin-value', 'px');
    setupDualInput('grid-max-width', 'grid-max-width-input', 'maxWidth', 'max-width-value', 'px');
    setupDualInput('grid-opacity', 'grid-opacity-input', 'opacity', 'opacity-value', '%', true);

    // Opacity needs special handling for percentage
    document.getElementById('grid-opacity').addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      gridState.config.opacity = value / 100;
      document.getElementById('grid-opacity-input').value = value;
      document.getElementById('opacity-value').textContent = value + '%';
      drawGrid();
      saveSettings();
    });
    
    document.getElementById('grid-opacity-input').addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      gridState.config.opacity = value / 100;
      document.getElementById('grid-opacity').value = value;
      document.getElementById('opacity-value').textContent = value + '%';
      drawGrid();
      saveSettings();
    });

    document.getElementById('grid-color').addEventListener('input', (e) => {
      gridState.config.color = e.target.value;
      drawGrid();
      saveSettings();
    });

    document.getElementById('grid-save-preset').addEventListener('click', savePreset);
    document.getElementById('grid-add-breakpoint').addEventListener('click', addBreakpoint);

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
    applyResponsiveBreakpoint();
    drawGrid();
  }

  function updateViewportWidth() {
    const width = window.innerWidth;
    const viewportDisplay = document.getElementById('grid-viewport-indicator');
    if (viewportDisplay) {
      viewportDisplay.textContent = `${width}px`;
    }
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
    const width = window.innerWidth;
    let activeBreakpoint = null;
    
    for (let i = gridState.config.breakpoints.length - 1; i >= 0; i--) {
      const bp = gridState.config.breakpoints[i];
      if (width >= bp.minWidth) {
        activeBreakpoint = bp;
        break;
      }
    }
    
    if (activeBreakpoint) {
      gridState.config.columns = activeBreakpoint.columns;
      gridState.config.gutter = activeBreakpoint.gutter;
      gridState.config.margin = activeBreakpoint.margin;
      updateInputValues();
      highlightActiveBreakpoint(activeBreakpoint);
    }
  }

  function updateInputValues() {
    document.getElementById('grid-cols').value = gridState.config.columns;
    document.getElementById('grid-cols-input').value = gridState.config.columns;
    document.getElementById('cols-value').textContent = gridState.config.columns;
    
    document.getElementById('grid-gutter').value = gridState.config.gutter;
    document.getElementById('grid-gutter-input').value = gridState.config.gutter;
    document.getElementById('gutter-value').textContent = gridState.config.gutter + 'px';
    
    document.getElementById('grid-margin').value = gridState.config.margin;
    document.getElementById('grid-margin-input').value = gridState.config.margin;
    document.getElementById('margin-value').textContent = gridState.config.margin + 'px';
    
    document.getElementById('grid-row-gap').value = gridState.config.rowGap;
    document.getElementById('grid-row-gap-input').value = gridState.config.rowGap;
    document.getElementById('row-gap-value').textContent = gridState.config.rowGap + 'px';
    
    document.getElementById('grid-max-width').value = gridState.config.maxWidth;
    document.getElementById('grid-max-width-input').value = gridState.config.maxWidth;
    document.getElementById('max-width-value').textContent = gridState.config.maxWidth === 0 ? 'Full' : gridState.config.maxWidth + 'px';
    
    document.getElementById('grid-color').value = gridState.config.color;
    
    const opacityPercent = Math.round(gridState.config.opacity * 100);
    document.getElementById('grid-opacity').value = opacityPercent;
    document.getElementById('grid-opacity-input').value = opacityPercent;
    document.getElementById('opacity-value').textContent = opacityPercent + '%';
    
    updateViewportWidth();
  }

  function highlightActiveBreakpoint(activeBreakpoint) {
    const items = document.querySelectorAll('.breakpoint-item');
    items.forEach((item, index) => {
      if (gridState.config.breakpoints[index] === activeBreakpoint) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
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
    const list = document.getElementById('breakpoint-list');
    list.innerHTML = gridState.config.breakpoints.map((bp, index) => `
      <div class="breakpoint-item" data-index="${index}">
        <input type="text" value="${bp.name}" data-field="name" placeholder="Name">
        <input type="number" value="${bp.minWidth}" data-field="minWidth" placeholder="Min">
        <input type="number" value="${bp.columns}" data-field="columns" placeholder="Cols">
        <input type="number" value="${bp.gutter}" data-field="gutter" placeholder="Gut">
        <input type="number" value="${bp.margin}" data-field="margin" placeholder="Mar">
        <button class="breakpoint-delete">×</button>
      </div>
    `).join('');
    
    list.querySelectorAll('.breakpoint-item input').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.closest('.breakpoint-item').dataset.index);
        const field = e.target.dataset.field;
        const value = field === 'name' ? e.target.value : parseInt(e.target.value) || 0;
        gridState.config.breakpoints[index][field] = value;
        saveSettings();
        applyResponsiveBreakpoint();
      });
    });
    
    list.querySelectorAll('.breakpoint-delete').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        gridState.config.breakpoints.splice(index, 1);
        renderBreakpoints();
        saveSettings();
        applyResponsiveBreakpoint();
      });
    });
  }

  function addBreakpoint() {
    gridState.config.breakpoints.push({
      name: 'Custom',
      minWidth: 1024,
      columns: 12,
      gutter: 24,
      margin: 40
    });
    gridState.config.breakpoints.sort((a, b) => a.minWidth - b.minWidth);
    renderBreakpoints();
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
    chrome.storage.local.set({ gridConfig: gridState.config });
  }

  function loadSettings() {
    chrome.storage.local.get(['gridConfig'], (result) => {
      if (result.gridConfig) {
        gridState.config = result.gridConfig;
        updateInputValues();
      }
      renderBreakpoints();
      renderPresets();
      applyResponsiveBreakpoint();
    });
    loadUIZoom();
    loadGridVisibility();
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
