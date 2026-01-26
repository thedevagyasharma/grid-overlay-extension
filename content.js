/**
 * Grid Overlay Extension - Main Entry Point (Redesigned)
 * This is the new modular version
 */

(function() {
  'use strict';

  // ===== Extension Context Validation =====
  function isExtensionContextValid() {
    try {
      return chrome.runtime && chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  function safeStorageSet(data, callback) {
    if (!isExtensionContextValid()) {
      console.warn('Grid Overlay: Cannot save settings - extension context invalidated.');
      return;
    }
    try {
      chrome.storage.local.set(data, callback);
    } catch (e) {
      console.warn('Grid Overlay: Error saving settings:', e.message);
    }
  }

  function safeStorageGet(keys, callback) {
    if (!isExtensionContextValid()) {
      console.warn('Grid Overlay: Cannot load settings - extension context invalidated.');
      return;
    }
    try {
      chrome.storage.local.get(keys, callback);
    } catch (e) {
      console.warn('Grid Overlay: Error loading settings:', e.message);
    }
  }

  // ===== Main Application Class =====
  class GridOverlayApp {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.controls = null;
      this.viewportIndicator = null;
      this.gridRenderer = null;
      this.initialized = false;
    }

    init() {
      // All scripts are now loaded via manifest, so we can initialize directly
      this.createElements();
      this.loadSettings();
      this.setupEventListeners();

      // Mark as initialized
      this.initialized = true;

      // Auto-enable if was previously enabled
      StorageManager.loadGridEnabled(() => {
        if (appState.gridEnabled) {
          this.enable();
        }
      });
    }

    createElements() {
      // Main container
      this.container = document.createElement('div');
      this.container.className = 'go-ext-container';

      // Canvas for grid
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'go-ext-canvas';
      this.container.appendChild(this.canvas);

      // Viewport indicator
      this.viewportIndicator = this.createViewportIndicator();
      this.container.appendChild(this.viewportIndicator);

      // Controls panel
      this.controls = document.createElement('div');
      this.controls.className = 'go-ext-controls-wrapper';

      // Minimize button
      this.minimizeBtn = document.createElement('button');
      this.minimizeBtn.className = 'go-ext-minimize-btn';
      this.minimizeBtn.type = 'button';
      this.minimizeBtn.title = 'Minimize Controls';
      this.minimizeBtn.appendChild(Icons.minimize());
      this.controls.appendChild(this.minimizeBtn);

      const controlsContent = document.createElement('div');
      controlsContent.className = 'go-ext-controls';
      this.controls.appendChild(controlsContent);

      this.container.appendChild(this.controls);

      document.body.appendChild(this.container);

      // Initialize renderer
      this.gridRenderer = new GridRenderer(this.canvas);
      window.gridRenderer = this.gridRenderer; // Expose globally for components

      // Initialize view router
      ViewRouter.init(controlsContent);
      ViewRouter.render();

      // Setup minimize button
      this.setupMinimizeButton();
    }

    setupMinimizeButton() {
      this.minimizeBtn.addEventListener('click', () => {
        this.toggleMinimize();
      });
    }

    toggleMinimize() {
      const isMinimized = this.controls.classList.toggle('go-ext-controls-minimized');
      this.minimizeBtn.innerHTML = '';
      this.minimizeBtn.appendChild(isMinimized ? Icons.maximize() : Icons.minimize());
      this.minimizeBtn.title = isMinimized ? 'Expand Controls' : 'Minimize Controls';
    }

    createViewportIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'go-ext-viewport-indicator';
      indicator.id = 'go-ext-viewport-indicator';

      const width = document.createElement('span');
      width.className = 'go-ext-viewport-width';
      width.id = 'go-ext-viewport-width';
      width.textContent = '0px';

      const sep1 = document.createElement('span');
      sep1.className = 'go-ext-indicator-separator';
      sep1.textContent = '•';

      const name = document.createElement('span');
      name.className = 'go-ext-indicator-breakpoint-name';
      name.id = 'go-ext-breakpoint-name';
      name.textContent = '—';

      const range = document.createElement('span');
      range.className = 'go-ext-breakpoint-range';
      range.id = 'go-ext-breakpoint-range';
      range.textContent = '—';

      indicator.appendChild(width);
      indicator.appendChild(sep1);
      indicator.appendChild(name);
      indicator.appendChild(range);

      return indicator;
    }

    loadSettings() {
      StorageManager.loadAll(() => {
        ViewRouter.render();
        this.updateViewportIndicator();
      });
    }

    setupEventListeners() {
      // Window resize
      const debouncedResize = debounce(() => {
        this.gridRenderer.updateDimensions(this.container);
        this.updateViewportIndicator();
        ViewRouter.updateCurrentScreen();
      }, 100);

      window.addEventListener('resize', debouncedResize);

      // Window scroll
      window.addEventListener('scroll', () => {
        this.gridRenderer.updateDimensions(this.container);
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+G - Toggle grid
        if (e.ctrlKey && e.shiftKey && e.key === 'G') {
          e.preventDefault();
          appState.gridVisible = !appState.gridVisible;
          StorageManager.saveGridVisibility();
          this.updateGridVisibility();
          ViewRouter.updateCurrentScreen();
        }

        // Ctrl+Shift+H - Toggle indicator
        if (e.ctrlKey && e.shiftKey && e.key === 'H') {
          e.preventDefault();
          appState.indicatorVisible = !appState.indicatorVisible;
          StorageManager.saveIndicatorVisibility();
          this.updateIndicatorVisibility();
          ViewRouter.updateCurrentScreen();
        }
      });

      // Resize observer for DOM changes
      const resizeObserver = new ResizeObserver(() => {
        this.gridRenderer.updateDimensions(this.container);
      });
      resizeObserver.observe(document.body);

      // Mutation observer for height changes
      const mutationObserver = new MutationObserver(debounce(() => {
        this.gridRenderer.updateDimensions(this.container);
      }, 100));

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: false,
        attributes: true,
        attributeFilter: ['style']
      });
    }

    updateViewportIndicator() {
      const widthEl = document.getElementById('go-ext-viewport-width');
      const nameEl = document.getElementById('go-ext-breakpoint-name');
      const rangeEl = document.getElementById('go-ext-breakpoint-range');

      if (!widthEl || !nameEl || !rangeEl) return;

      const width = window.innerWidth;
      widthEl.textContent = `${width}px`;

      const breakpoint = appState.getViewportMatchingBreakpoint();
      if (breakpoint) {
        const preset = appState.getCurrentPreset();
        nameEl.textContent = breakpoint.name;

        const index = preset.breakpoints.indexOf(breakpoint);
        const nextBreakpoint = preset.breakpoints[index + 1];
        const minWidth = breakpoint.minWidth;
        const maxWidth = nextBreakpoint ? nextBreakpoint.minWidth - 1 : '∞';

        rangeEl.textContent = maxWidth === '∞' ? `${minWidth}px+` : `${minWidth}px – ${maxWidth}px`;
      } else {
        nameEl.textContent = '—';
        rangeEl.textContent = '—';
      }
    }

    updateGridVisibility() {
      if (appState.gridVisible) {
        this.canvas.style.display = 'block';
        this.gridRenderer.draw();
      } else {
        this.canvas.style.display = 'none';
      }
    }

    updateIndicatorVisibility() {
      if (appState.indicatorVisible) {
        this.viewportIndicator.style.display = 'flex';
      } else {
        this.viewportIndicator.style.display = 'none';
      }
    }

    enable() {
      appState.gridEnabled = true;
      this.container.classList.add('go-ext-active');
      this.gridRenderer.updateDimensions(this.container);
      this.gridRenderer.draw();
      StorageManager.saveGridEnabled();
    }

    disable() {
      appState.gridEnabled = false;
      this.container.classList.remove('go-ext-active');
      StorageManager.saveGridEnabled();
    }

    toggle() {
      if (!this.initialized || typeof appState === 'undefined') {
        console.warn('Grid Overlay: Cannot toggle - not yet initialized');
        return false;
      }
      if (appState.gridEnabled) {
        this.disable();
      } else {
        this.enable();
      }
      return appState.gridEnabled;
    }
  }

  // ===== Initialize =====
  const app = new GridOverlayApp();

  // Expose globally for test environment
  if (typeof window !== 'undefined') {
    window.gridOverlayApp = app;
  }

  // Chrome extension message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleGrid') {
      const enabled = app.toggle();
      sendResponse({ enabled: enabled });
    }
  });

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    // Cleanup if needed
  });
})();
