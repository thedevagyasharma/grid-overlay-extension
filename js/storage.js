/**
 * Storage Manager - Handles persistence with preset-based structure
 */

// Safe storage wrappers
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

class StorageManager {
  /**
   * Save all presets
   */
  static savePresets() {
    safeStorageSet({
      presets: appState.presets,
      currentPresetId: appState.currentPresetId
    });
  }

  /**
   * Load presets
   */
  static loadPresets(callback) {
    safeStorageGet(['presets', 'currentPresetId'], (result) => {
      if (result.presets && result.presets.length > 0) {
        appState.presets = result.presets;
        appState.currentPresetId = result.currentPresetId || result.presets[0].id;
      } else {
        // No data - create default preset
        const defaultPreset = this.createDefaultPreset();
        appState.presets = [defaultPreset];
        appState.currentPresetId = defaultPreset.id;
        this.savePresets();
      }

      if (callback) callback();
    });
  }

  /**
   * Create default preset with standard breakpoints
   */
  static createDefaultPreset() {
    return {
      id: appState.generateId(),
      name: 'Default',
      breakpoints: [
        { id: appState.generateId(), name: 'Mobile', minWidth: 0, columns: 4, gutter: 16, rowGap: 8, margin: 16, maxWidth: 0, padding: 0 },
        { id: appState.generateId(), name: 'Tablet', minWidth: 768, columns: 8, gutter: 16, rowGap: 8, margin: 32, maxWidth: 0, padding: 0 },
        { id: appState.generateId(), name: 'Desktop', minWidth: 1024, columns: 12, gutter: 24, rowGap: 8, margin: 48, maxWidth: 1200, padding: 0 }
      ],
      colors: {
        grid: '#ff0000',
        gridOpacity: 0.15,
        padding: '#0000ff',
        paddingOpacity: 0.15
      }
    };
  }

  /**
   * Save grid enabled state
   */
  static saveGridEnabled() {
    safeStorageSet({ gridEnabled: appState.gridEnabled });
  }

  /**
   * Load grid enabled state
   */
  static loadGridEnabled(callback) {
    safeStorageGet(['gridEnabled'], (result) => {
      appState.gridEnabled = result.gridEnabled || false;
      if (callback) callback();
    });
  }

  /**
   * Save grid visibility
   */
  static saveGridVisibility() {
    safeStorageSet({ gridVisible: appState.gridVisible });
  }

  /**
   * Load grid visibility
   */
  static loadGridVisibility(callback) {
    safeStorageGet(['gridVisible'], (result) => {
      if (result.gridVisible !== undefined) {
        appState.gridVisible = result.gridVisible;
      }
      if (callback) callback();
    });
  }

  /**
   * Save indicator visibility
   */
  static saveIndicatorVisibility() {
    safeStorageSet({ indicatorVisible: appState.indicatorVisible });
  }

  /**
   * Load indicator visibility
   */
  static loadIndicatorVisibility(callback) {
    safeStorageGet(['indicatorVisible'], (result) => {
      if (result.indicatorVisible !== undefined) {
        appState.indicatorVisible = result.indicatorVisible;
      }
      if (callback) callback();
    });
  }

  /**
   * Load all settings
   */
  static loadAll(callback) {
    this.loadPresets(() => {
      this.loadGridEnabled(() => {
        this.loadGridVisibility(() => {
          this.loadIndicatorVisibility(() => {
            if (callback) callback();
          });
        });
      });
    });
  }
}
