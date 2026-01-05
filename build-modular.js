/**
 * Build script to create a bundled content.js from modular sources
 * Run this with: node build-modular.js
 */

const fs = require('fs');
const path = require('path');

const modules = [
  'modules/constants.js',
  'modules/utils.js',
  'modules/extension-context.js',
  'modules/icons.js',
  'modules/state.js',
  'modules/storage.js',
  'modules/grid-renderer.js',
  'modules/ui-builder.js',
  'modules/ui-updater.js',
  'modules/event-handlers.js'
];

let bundledCode = `/**
 * Grid Overlay Extension - Main Content Script
 * This file is auto-generated from modular sources in the modules/ directory
 * DO NOT EDIT DIRECTLY - Edit the source modules instead and run: node build-modular.js
 */
(function() {
  'use strict';

`;

// Read each module and strip import/export statements
modules.forEach(modulePath => {
  const fullPath = path.join(__dirname, modulePath);
  let code = fs.readFileSync(fullPath, 'utf8');

  // Remove import statements
  code = code.replace(/^import\s+.*from\s+['"].*['"];?\s*$/gm, '');

  // Remove export keyword but keep the declaration
  code = code.replace(/^export\s+(const|class|function)/gm, '$1');
  code = code.replace(/^export\s+{[^}]+};?\s*$/gm, '');

  bundledCode += `\n  // ===== MODULE: ${path.basename(modulePath, '.js')} =====\n`;
  bundledCode += code + '\n';
});

// Add main application code
bundledCode += `
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
`;

// Write the bundled file
fs.writeFileSync(path.join(__dirname, 'content.js'), bundledCode, 'utf8');

console.log('✅ Build complete! Files updated:');
console.log('   - content.js (bundled from modules)');
console.log('   Note: overlay.css is manually maintained');
