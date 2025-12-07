/**
 * State management module with observer pattern for reactive updates
 */

import { DEFAULT_GRID_CONFIG, DEFAULT_GRID_STATE } from './constants.js';

class GridState {
  constructor() {
    this._state = {
      ...DEFAULT_GRID_STATE,
      config: JSON.parse(JSON.stringify(DEFAULT_GRID_CONFIG))
    };
    this._listeners = new Map();
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State property to watch
   * @param {Function} callback - Callback function when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    this._listeners.get(key).add(callback);

    return () => {
      const listeners = this._listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Notify listeners of state change
   * @param {string} key - State property that changed
   * @param {*} value - New value
   */
  _notify(key, value) {
    const listeners = this._listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => callback(value, key));
    }
    // Notify wildcard listeners
    const wildcardListeners = this._listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => callback(value, key));
    }
  }

  // Getters
  get enabled() {
    return this._state.enabled;
  }

  get gridVisible() {
    return this._state.gridVisible;
  }

  get indicatorVisible() {
    return this._state.indicatorVisible;
  }

  get uiZoom() {
    return this._state.uiZoom;
  }

  get editingMode() {
    return this._state.editingMode;
  }

  get currentBreakpointIndex() {
    return this._state.currentBreakpointIndex;
  }

  get config() {
    return this._state.config;
  }

  get currentBreakpoint() {
    return this._state.config.breakpoints[this._state.currentBreakpointIndex];
  }

  // Setters with notifications
  set enabled(value) {
    if (this._state.enabled !== value) {
      this._state.enabled = value;
      this._notify('enabled', value);
    }
  }

  set gridVisible(value) {
    if (this._state.gridVisible !== value) {
      this._state.gridVisible = value;
      this._notify('gridVisible', value);
    }
  }

  set indicatorVisible(value) {
    if (this._state.indicatorVisible !== value) {
      this._state.indicatorVisible = value;
      this._notify('indicatorVisible', value);
    }
  }

  set uiZoom(value) {
    if (this._state.uiZoom !== value) {
      this._state.uiZoom = value;
      this._notify('uiZoom', value);
    }
  }

  set editingMode(value) {
    if (this._state.editingMode !== value) {
      this._state.editingMode = value;
      this._notify('editingMode', value);
    }
  }

  set currentBreakpointIndex(value) {
    if (this._state.currentBreakpointIndex !== value) {
      this._state.currentBreakpointIndex = value;
      this._notify('currentBreakpointIndex', value);
    }
  }

  set config(value) {
    this._state.config = value;
    this._notify('config', value);
  }

  /**
   * Update config property
   * @param {string} key - Config property key
   * @param {*} value - New value
   */
  updateConfig(key, value) {
    if (this._state.config[key] !== value) {
      this._state.config[key] = value;
      this._notify('config', this._state.config);
      this._notify(`config.${key}`, value);
    }
  }

  /**
   * Update current breakpoint property
   * @param {string} key - Breakpoint property key
   * @param {*} value - New value
   */
  updateCurrentBreakpoint(key, value) {
    const bp = this.currentBreakpoint;
    if (bp && bp[key] !== value) {
      bp[key] = value;
      this._notify('currentBreakpoint', bp);
      this._notify(`currentBreakpoint.${key}`, value);
    }
  }

  /**
   * Add a new breakpoint
   * @param {Object} breakpoint - Breakpoint configuration
   */
  addBreakpoint(breakpoint) {
    this._state.config.breakpoints.push(breakpoint);
    this._state.config.breakpoints.sort((a, b) => a.minWidth - b.minWidth);
    this._notify('config', this._state.config);
    this._notify('breakpoints', this._state.config.breakpoints);
  }

  /**
   * Remove a breakpoint
   * @param {number} index - Breakpoint index to remove
   */
  removeBreakpoint(index) {
    if (this._state.config.breakpoints.length > 1) {
      this._state.config.breakpoints.splice(index, 1);
      if (this._state.currentBreakpointIndex >= this._state.config.breakpoints.length) {
        this._state.currentBreakpointIndex = this._state.config.breakpoints.length - 1;
      }
      this._notify('config', this._state.config);
      this._notify('breakpoints', this._state.config.breakpoints);
    }
  }

  /**
   * Get viewport-matching breakpoint index
   * @returns {number} Matching breakpoint index
   */
  getViewportMatchingBreakpoint() {
    const width = window.innerWidth;
    let matchingIndex = 0;

    for (let i = this._state.config.breakpoints.length - 1; i >= 0; i--) {
      const bp = this._state.config.breakpoints[i];
      if (width >= bp.minWidth) {
        matchingIndex = i;
        break;
      }
    }

    return matchingIndex;
  }

  /**
   * Save current breakpoint settings to the breakpoint
   */
  saveCurrentBreakpointSettings() {
    const currentBp = this.currentBreakpoint;
    if (currentBp) {
      currentBp.columns = this._state.config.columns;
      currentBp.gutter = this._state.config.gutter;
      currentBp.margin = this._state.config.margin;
      currentBp.rowGap = this._state.config.rowGap;
      this._notify('currentBreakpoint', currentBp);
    }
  }

  /**
   * Load breakpoint settings into current config
   */
  loadCurrentBreakpointSettings() {
    const currentBp = this.currentBreakpoint;
    if (currentBp) {
      this._state.config.columns = currentBp.columns;
      this._state.config.gutter = currentBp.gutter;
      this._state.config.margin = currentBp.margin;
      this._state.config.rowGap = currentBp.rowGap !== undefined ? currentBp.rowGap : 8;
      this._notify('config', this._state.config);
    }
  }

  /**
   * Get the complete state object
   * @returns {Object} Complete state
   */
  getState() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Set the complete state object
   * @param {Object} state - New state
   */
  setState(state) {
    this._state = { ...this._state, ...state };
    this._notify('*', this._state);
  }
}

// Export singleton instance
export const gridState = new GridState();
