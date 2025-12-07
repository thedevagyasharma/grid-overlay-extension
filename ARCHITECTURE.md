# Grid Overlay Extension - Architecture Documentation

## Overview

The Grid Overlay extension has been refactored to use a modular, stateful architecture with proper separation of concerns. This improves maintainability, testability, and code organization.

## Architecture Principles

1. **Separation of Concerns** - Each module has a single, well-defined responsibility
2. **Stateful Design** - Centralized state management with reactive updates via observer pattern
3. **Modular Structure** - Code split into reusable, independent modules
4. **Type Safety** - Clear interfaces and documentation for all functions
5. **Performance** - Debouncing, lazy loading, and optimized rendering

## Module Structure

```
grid-overlay-extension/
├── constants.js       # Configuration constants and defaults
├── utils.js          # Utility functions
├── state.js          # State management with observer pattern
├── storage.js        # Chrome storage API wrappers
├── ui.js             # DOM creation and manipulation
├── content.js        # Main content script (orchestrates all modules)
├── popup.js          # Extension popup script
└── overlay.css       # Styles
```

## Module Descriptions

### `constants.js`
**Purpose**: Centralized configuration values and defaults

**Exports**:
- `CONSTANTS` - Application-wide constants (resize limits, zoom settings, debounce delays, z-index values)
- `DEFAULT_GRID_CONFIG` - Default grid configuration with breakpoints
- `DEFAULT_GRID_STATE` - Default UI state

**Why**: Prevents magic numbers throughout codebase, makes configuration changes easier

---

### `utils.js`
**Purpose**: Reusable utility functions

**Exports**:
- `debounce(func, wait)` - Rate limiting for function calls
- `sanitizeHTML(str)` - XSS protection for user input
- `createElement(tag, properties, children)` - Declarative DOM creation
- `isExtensionContextValid()` - Extension context validation
- `sanitizePresetName(name, maxLength)` - Preset name validation
- `ensureRowGapCompatibility(config, defaultRowGap)` - Backward compatibility

**Why**: DRY principle, reusable across modules, easier to test in isolation

---

### `state.js`
**Purpose**: Centralized state management with observer pattern

**Architecture**:
```javascript
class GridState {
  _state          // Private state object
  _listeners      // Map of property -> Set<callback>

  // Getters/Setters with automatic notifications
  get/set enabled
  get/set gridVisible
  get/set indicatorVisible
  get/set uiZoom
  get/set editingMode
  get/set currentBreakpointIndex
  get/set config

  // Methods
  subscribe(key, callback)  // Observer pattern
  updateConfig(key, value)
  updateCurrentBreakpoint(key, value)
  addBreakpoint(breakpoint)
  removeBreakpoint(index)
  getViewportMatchingBreakpoint()
  saveCurrentBreakpointSettings()
  loadCurrentBreakpointSettings()
}
```

**Exports**:
- `gridState` - Singleton instance

**Key Features**:
1. **Observer Pattern** - Subscribe to state changes for reactive updates
2. **Encapsulation** - Private state with controlled access
3. **Automatic Notifications** - Setters automatically notify subscribers
4. **Wildcard Listeners** - Subscribe to all changes with `subscribe('*', callback)`

**Why**:
- Eliminates scattered state management
- Makes state flow predictable
- Enables reactive UI updates
- Easier debugging (single source of truth)

**Example Usage**:
```javascript
import { gridState } from './state.js';

// Subscribe to changes
gridState.subscribe('gridVisible', (visible) => {
  console.log('Grid visibility changed:', visible);
});

// Update state (automatically notifies subscribers)
gridState.gridVisible = true;

// Subscribe to all changes
gridState.subscribe('*', (value, key) => {
  console.log(`${key} changed to:`, value);
});
```

---

### `storage.js`
**Purpose**: Safe wrappers for Chrome storage API

**Exports**:
- `safeStorageSet(data, callback)` - Safe set with error handling
- `safeStorageGet(keys, callback)` - Safe get with error handling
- `saveGridConfig(config, currentBreakpointIndex)` - Save grid config
- `loadGridConfig()` - Load grid config
- `saveGridEnabled(enabled)` - Save enabled state
- `loadGridEnabled()` - Load enabled state
- `saveGridVisibility(visible)` - Save visibility
- `loadGridVisibility()` - Load visibility
- `saveIndicatorVisibility(visible)` - Save indicator visibility
- `loadIndicatorVisibility()` - Load indicator visibility
- `saveEditingMode(editingMode)` - Save editing mode
- `loadEditingMode()` - Load editing mode
- `saveUIZoom(zoom)` - Save UI zoom
- `loadUIZoom()` - Load UI zoom
- `savePreset(name, config)` - Save preset
- `loadPresets()` - Load all presets
- `deletePreset(index)` - Delete preset

**Why**:
- Centralized error handling for extension context invalidation
- Promise-based API (easier async/await usage)
- Consistent error messages
- Single place to modify storage logic

---

### `ui.js`
**Purpose**: DOM element creation and manipulation

**Exports**:
- `createViewportIndicator()` - Create viewport indicator element
- `createToggleButton()` - Create toggle button
- `createControlsWrapper()` - Create controls panel
- `createBreakpointChip(bp, index, isEditing, isViewportMatch, canDelete)` - Create breakpoint chip
- `createPresetItem(preset, index)` - Create preset list item
- `updateViewportWidthDisplay(width)` - Update viewport width
- `updateBreakpointNameDisplay(breakpoint, nextBreakpoint)` - Update breakpoint name
- `updateModeStatusDisplay(editingMode)` - Update mode status

**Why**:
- Separates UI creation from business logic
- Declarative component creation
- Reusable UI components
- Easier to test and modify UI

---

### `content.js`
**Purpose**: Main orchestration layer

**Responsibilities**:
1. Initialize all modules
2. Create DOM elements
3. Setup event listeners
4. Coordinate between modules
5. Handle browser events (resize, scroll, etc.)

**Architecture Pattern**: Thin orchestration layer that delegates to specialized modules

**Why**: Main file stays clean and focused on coordination rather than implementation details

---

## State Flow

```
User Interaction
    ↓
Event Handler (content.js)
    ↓
State Update (state.js)
    ↓
Notification to Subscribers
    ↓
UI Update (content.js listeners)
    ↓
Storage Sync (storage.js)
```

## Key Improvements Over Original

### 1. **Stateful Architecture**
**Before**: Global object with direct mutations
```javascript
let gridState = { enabled: false, gridVisible: true, ... };
gridState.enabled = true; // No notifications, manual UI updates
```

**After**: Reactive state with observer pattern
```javascript
gridState.enabled = true; // Automatic notifications, reactive UI updates
```

### 2. **Modular Organization**
**Before**: Single 1322-line file with mixed concerns

**After**: 9 focused modules with clear responsibilities
- `constants.js` - 60 lines
- `utils.js` - 95 lines
- `state.js` - 234 lines
- `storage.js` - 205 lines
- `ui.js` - 352 lines
- `content.js` - 750 lines

### 3. **Reusability**
**Before**: Functions tightly coupled to global state

**After**: Pure functions and dependency injection
```javascript
// Can be used anywhere, testable
import { debounce, sanitizeHTML } from './utils.js';
```

### 4. **Maintainability**
**Before**: Need to search entire file to understand state changes

**After**: State changes in one place, easy to track
```javascript
// Find all state mutations
grep "gridState\." state.js
```

### 5. **Testing**
**Before**: Hard to test (needs DOM, extension context)

**After**: Modules can be tested in isolation
```javascript
// Test utils without DOM
import { debounce, sanitizeHTML } from './utils.js';
// Test state without Chrome APIs
import { GridState } from './state.js';
```

## Best Practices

### Adding New Features

1. **Add constants** to `constants.js` if needed
2. **Add utilities** to `utils.js` if reusable
3. **Add state properties** to `state.js` with getters/setters
4. **Add storage functions** to `storage.js` for persistence
5. **Add UI components** to `ui.js` if new elements needed
6. **Wire up in content.js** - event handlers, state subscriptions

### State Management

```javascript
// ✅ Good: Use state setters
gridState.gridVisible = true;

// ❌ Bad: Direct state mutation
gridState._state.gridVisible = true;

// ✅ Good: Subscribe to changes
gridState.subscribe('gridVisible', (visible) => {
  updateUI(visible);
});

// ❌ Bad: Poll for changes
setInterval(() => {
  if (gridState.gridVisible !== lastVisible) {
    updateUI(gridState.gridVisible);
  }
}, 100);
```

### Storage Operations

```javascript
// ✅ Good: Use async/await with storage functions
async function loadSettings() {
  const result = await loadGridConfig();
  gridState.config = result.gridConfig;
}

// ✅ Good: Handle errors
try {
  await saveGridConfig(config, index);
} catch (error) {
  console.error('Save failed:', error);
}
```

## Performance Considerations

1. **Debouncing** - Input handlers debounced (300ms) to reduce storage writes
2. **Mutation Observer** - Limited scope, debounced updates (100ms)
3. **Canvas Updates** - Only redraw when necessary
4. **Lazy Loading** - Presets loaded on demand
5. **Blob Cleanup** - URLs revoked after use

## Browser Compatibility

- Chrome/Edge: Manifest v3, ES6 modules supported
- Requires `storage` permission
- Uses `chrome.runtime`, `chrome.storage` APIs

## Migration Guide

If you have the old version installed:

1. Settings are automatically migrated
2. `rowGap` property added if missing (backward compatibility)
3. All existing presets preserved

## Future Enhancements

Possible improvements:
1. TypeScript for type safety
2. Unit tests for each module
3. Integration tests for workflows
4. State persistence in localStorage as backup
5. Undo/redo functionality using state history
6. Performance monitoring and metrics
