/**
 * Chrome storage wrapper module for safe storage operations
 */

import { isExtensionContextValid } from './utils.js';

/**
 * Safe wrapper for Chrome Storage API set operation
 * @param {Object} data - Data to save
 * @param {Function} callback - Optional callback
 * @returns {Promise<void>}
 */
export function safeStorageSet(data, callback) {
  if (!isExtensionContextValid()) {
    console.warn('Grid Overlay: Cannot save settings - extension context invalidated. Please refresh the page.');
    return Promise.reject(new Error('Extension context invalidated'));
  }

  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          console.warn('Grid Overlay: Error saving settings:', chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError);
        } else {
          if (callback) callback();
          resolve();
        }
      });
    } catch (e) {
      console.warn('Grid Overlay: Error saving settings:', e.message);
      if (e.message && e.message.includes('Extension context invalidated')) {
        console.warn('Grid Overlay: Please refresh the page to restore functionality.');
      }
      reject(e);
    }
  });
}

/**
 * Safe wrapper for Chrome Storage API get operation
 * @param {string|string[]|Object} keys - Keys to retrieve
 * @param {Function} callback - Optional callback
 * @returns {Promise<Object>}
 */
export function safeStorageGet(keys, callback) {
  if (!isExtensionContextValid()) {
    console.warn('Grid Overlay: Cannot load settings - extension context invalidated. Please refresh the page.');
    return Promise.reject(new Error('Extension context invalidated'));
  }

  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.warn('Grid Overlay: Error loading settings:', chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError);
        } else {
          if (callback) callback(result);
          resolve(result);
        }
      });
    } catch (e) {
      console.warn('Grid Overlay: Error loading settings:', e.message);
      if (e.message && e.message.includes('Extension context invalidated')) {
        console.warn('Grid Overlay: Please refresh the page to restore functionality.');
      }
      reject(e);
    }
  });
}

/**
 * Save grid configuration to storage
 * @param {Object} config - Grid configuration
 * @param {number} currentBreakpointIndex - Current breakpoint index
 * @returns {Promise<void>}
 */
export function saveGridConfig(config, currentBreakpointIndex) {
  return safeStorageSet({
    gridConfig: config,
    currentBreakpointIndex: currentBreakpointIndex
  });
}

/**
 * Load grid configuration from storage
 * @returns {Promise<Object>}
 */
export function loadGridConfig() {
  return safeStorageGet(['gridConfig', 'currentBreakpointIndex']);
}

/**
 * Save grid enabled state
 * @param {boolean} enabled - Grid enabled state
 * @returns {Promise<void>}
 */
export function saveGridEnabled(enabled) {
  return safeStorageSet({ gridEnabled: enabled });
}

/**
 * Load grid enabled state
 * @returns {Promise<Object>}
 */
export function loadGridEnabled() {
  return safeStorageGet(['gridEnabled']);
}

/**
 * Save grid visibility state
 * @param {boolean} visible - Grid visibility state
 * @returns {Promise<void>}
 */
export function saveGridVisibility(visible) {
  return safeStorageSet({ gridVisible: visible });
}

/**
 * Load grid visibility state
 * @returns {Promise<Object>}
 */
export function loadGridVisibility() {
  return safeStorageGet(['gridVisible']);
}

/**
 * Save indicator visibility state
 * @param {boolean} visible - Indicator visibility state
 * @returns {Promise<void>}
 */
export function saveIndicatorVisibility(visible) {
  return safeStorageSet({ indicatorVisible: visible });
}

/**
 * Load indicator visibility state
 * @returns {Promise<Object>}
 */
export function loadIndicatorVisibility() {
  return safeStorageGet(['indicatorVisible']);
}

/**
 * Save editing mode state
 * @param {boolean} editingMode - Editing mode state
 * @returns {Promise<void>}
 */
export function saveEditingMode(editingMode) {
  return safeStorageSet({ editingMode: editingMode });
}

/**
 * Load editing mode state
 * @returns {Promise<Object>}
 */
export function loadEditingMode() {
  return safeStorageGet(['editingMode']);
}

/**
 * Save UI zoom level
 * @param {number} zoom - Zoom level
 * @returns {Promise<void>}
 */
export function saveUIZoom(zoom) {
  return safeStorageSet({ gridUIZoom: zoom });
}

/**
 * Load UI zoom level
 * @returns {Promise<Object>}
 */
export function loadUIZoom() {
  return safeStorageGet(['gridUIZoom']);
}

/**
 * Save preset to storage
 * @param {string} name - Preset name
 * @param {Object} config - Grid configuration
 * @returns {Promise<void>}
 */
export async function savePreset(name, config) {
  const result = await safeStorageGet(['gridPresets']);
  const presets = result.gridPresets || [];
  presets.push({ name, config: JSON.parse(JSON.stringify(config)) });
  return safeStorageSet({ gridPresets: presets });
}

/**
 * Load presets from storage
 * @returns {Promise<Array>}
 */
export async function loadPresets() {
  const result = await safeStorageGet(['gridPresets']);
  return result.gridPresets || [];
}

/**
 * Delete preset from storage
 * @param {number} index - Preset index to delete
 * @returns {Promise<void>}
 */
export async function deletePreset(index) {
  const result = await safeStorageGet(['gridPresets']);
  const presets = result.gridPresets || [];
  presets.splice(index, 1);
  return safeStorageSet({ gridPresets: presets });
}
