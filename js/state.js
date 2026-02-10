/**
 * Centralized State Management & View Router
 */

class AppState {
  constructor() {
    // View state
    this.currentView = 'presets'; // presets, breakpoints
    this.activePopup = null; // breakpoint-edit, shortcuts, color-picker
    this.editingBreakpointId = null;
    this.colorPickerType = null; // 'grid' or 'padding'

    // Presets
    this.presets = [];
    this.currentPresetId = null;

    // Grid state
    this.gridEnabled = false;
    this.gridVisible = true;
    this.indicatorVisible = true;

    // Confirmation dialog
    this.confirmDialog = null;
  }

  /**
   * Get current preset
   */
  getCurrentPreset() {
    return this.presets.find(p => p.id === this.currentPresetId) || null;
  }

  /**
   * Get viewport matching breakpoint for current preset
   */
  getViewportMatchingBreakpoint() {
    const preset = this.getCurrentPreset();
    if (!preset || !preset.breakpoints.length) return null;

    const width = window.innerWidth;
    let matchingIndex = 0;

    for (let i = preset.breakpoints.length - 1; i >= 0; i--) {
      const bp = preset.breakpoints[i];
      if (width >= bp.minWidth) {
        matchingIndex = i;
        break;
      }
    }

    return preset.breakpoints[matchingIndex];
  }

  /**
   * Get breakpoint by ID
   */
  getBreakpointById(id) {
    const preset = this.getCurrentPreset();
    if (!preset) return null;
    return preset.breakpoints.find(bp => bp.id === id) || null;
  }

  /**
   * Create new preset
   */
  createPreset(name = null) {
    const uniqueName = name || this.generateUniquePresetName();
    const preset = {
      id: this.generateId(),
      name: uniqueName,
      breakpoints: [],
      colors: {
        grid: '#ff0000',
        gridOpacity: 0.15,
        padding: '#0000ff',
        paddingOpacity: 0.15
      }
    };
    this.presets.push(preset);
    return preset;
  }

  /**
   * Generate unique preset name
   */
  generateUniquePresetName() {
    let counter = 1;
    let name = 'New Preset';

    while (this.presets.some(p => p.name === name)) {
      counter++;
      name = `New Preset ${counter}`;
    }

    return name;
  }

  /**
   * Delete preset
   */
  deletePreset(id) {
    const index = this.presets.findIndex(p => p.id === id);
    if (index > -1) {
      this.presets.splice(index, 1);
    }
  }

  /**
   * Add breakpoint to current preset
   */
  addBreakpoint() {
    const preset = this.getCurrentPreset();
    if (!preset) return null;

    const currentWidth = window.innerWidth;
    const breakpointCount = preset.breakpoints.length + 1;

    const breakpoint = {
      id: this.generateId(),
      name: `Breakpoint ${breakpointCount}`,
      minWidth: currentWidth,
      columns: 12,
      gutter: 16,
      rowGap: 8,
      margin: 32,
      maxWidth: 0,
      padding: 0
    };

    preset.breakpoints.push(breakpoint);
    preset.breakpoints.sort((a, b) => a.minWidth - b.minWidth);

    return breakpoint;
  }

  /**
   * Delete breakpoint from current preset
   */
  deleteBreakpoint(id) {
    const preset = this.getCurrentPreset();
    if (!preset) return;

    const index = preset.breakpoints.findIndex(bp => bp.id === id);
    if (index > -1) {
      preset.breakpoints.splice(index, 1);
    }
  }

  /**
   * Update breakpoint
   */
  updateBreakpoint(id, updates) {
    const breakpoint = this.getBreakpointById(id);
    if (breakpoint) {
      Object.assign(breakpoint, updates);

      // Re-sort if minWidth changed
      if (updates.minWidth !== undefined) {
        const preset = this.getCurrentPreset();
        preset.breakpoints.sort((a, b) => a.minWidth - b.minWidth);
      }
    }
  }

  /**
   * Update preset colors
   */
  updateColors(colorUpdates) {
    const preset = this.getCurrentPreset();
    if (preset) {
      Object.assign(preset.colors, colorUpdates);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Navigate to view
   */
  navigateTo(view) {
    this.currentView = view;
  }

  /**
   * Open popup with toggle logic
   * - If same popup is already open, close it (toggle off)
   * - If different popup is open, close it and open new one (replace)
   * - If no popup is open, open the new one
   */
  openPopup(popup, data = {}) {
    // Check if we're trying to open the same popup
    const isSamePopup = this.activePopup === popup && this._isSamePopupData(popup, data);

    if (isSamePopup) {
      // Toggle off - close the current popup
      this.closePopup();
      return false; // Indicate popup was closed
    }

    // Different popup or no popup - set new popup
    this.activePopup = popup;

    if (popup === 'breakpoint-edit') {
      this.editingBreakpointId = data.breakpointId || null;
    } else if (popup === 'color-picker') {
      this.colorPickerType = data.type || null; // 'grid' or 'padding'
    }

    return true; // Indicate popup was opened
  }

  /**
   * Check if popup data represents the same popup instance
   */
  _isSamePopupData(popup, data) {
    if (popup === 'breakpoint-edit') {
      return this.editingBreakpointId === (data.breakpointId || null);
    } else if (popup === 'color-picker') {
      return this.colorPickerType === (data.type || null);
    } else if (popup === 'shortcuts') {
      return true; // Shortcuts popup has no data variants
    }
    return false;
  }

  /**
   * Close popup
   */
  closePopup() {
    this.activePopup = null;
    this.editingBreakpointId = null;
    this.colorPickerType = null;
  }

  /**
   * Show confirmation dialog
   */
  showConfirmDialog(config) {
    this.confirmDialog = {
      title: config.title || 'Confirm',
      message: config.message || 'Are you sure?',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      isDangerous: config.isDangerous || false,
      onConfirm: config.onConfirm || (() => {}),
      onCancel: config.onCancel || (() => {})
    };
  }

  /**
   * Hide confirmation dialog
   */
  hideConfirmDialog() {
    this.confirmDialog = null;
  }
}

// Global state instance
const appState = new AppState();
