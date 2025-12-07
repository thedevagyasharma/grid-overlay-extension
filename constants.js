/**
 * Constants and configuration values for the Grid Overlay extension
 */

window.GridOverlay = window.GridOverlay || {};

window.GridOverlay.CONSTANTS = {
  // UI Sizing constraints
  RESIZE_MIN_WIDTH: 280,
  RESIZE_MAX_WIDTH: 600,

  // Zoom settings
  ZOOM_MIN: 50,
  ZOOM_MAX: 200,
  ZOOM_STEP: 10,

  // Performance tuning
  DEBOUNCE_DELAY: 300,
  MUTATION_DEBOUNCE_DELAY: 100,

  // Validation limits
  MAX_PRESET_NAME_LENGTH: 50,

  // Default grid values
  DEFAULT_ROW_GAP: 8,

  // Z-index values for layering
  Z_INDEX_CONTAINER: 2147483647,
  Z_INDEX_INDICATOR: 2147483646
};

/**
 * Default grid configuration
 */
window.GridOverlay.DEFAULT_GRID_CONFIG = {
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
};

/**
 * Default grid state
 */
window.GridOverlay.DEFAULT_GRID_STATE = {
  enabled: false,
  gridVisible: true,
  indicatorVisible: true,
  uiZoom: 100,
  editingMode: false,
  currentBreakpointIndex: 0
};
