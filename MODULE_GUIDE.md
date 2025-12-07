# Module Quick Reference Guide

## Import Examples

### Using Constants
```javascript
import { CONSTANTS } from './constants.js';

console.log(CONSTANTS.ZOOM_MIN); // 50
console.log(CONSTANTS.DEBOUNCE_DELAY); // 300
```

### Using Utilities
```javascript
import { debounce, sanitizeHTML, createElement } from './utils.js';

// Debounce a function
const debouncedSave = debounce(() => {
  saveSettings();
}, 300);

// Sanitize user input
const safe = sanitizeHTML(userInput);

// Create elements
const button = createElement('button', {
  className: 'my-btn',
  textContent: 'Click me'
});
```

### Using State (The Star Feature! ⭐)
```javascript
import { gridState } from './state.js';

// Read state
console.log(gridState.enabled);
console.log(gridState.gridVisible);

// Update state (automatically notifies subscribers)
gridState.gridVisible = true;

// Subscribe to changes (reactive programming!)
gridState.subscribe('gridVisible', (visible) => {
  console.log('Grid visibility changed:', visible);
  updateUI(visible);
});

// Subscribe to all changes
gridState.subscribe('*', (value, key) => {
  console.log(`${key} changed to:`, value);
});

// Update config
gridState.updateConfig('columns', 12);

// Work with breakpoints
const currentBp = gridState.currentBreakpoint;
gridState.addBreakpoint({ name: 'test', minWidth: 800, ... });
gridState.removeBreakpoint(2);
```

### Using Storage
```javascript
import { saveGridConfig, loadGridConfig, savePreset } from './storage.js';

// Save configuration
await saveGridConfig(config, breakpointIndex);

// Load configuration
const result = await loadGridConfig();
console.log(result.gridConfig);

// Save a preset
await savePreset('My Preset', config);
```

### Using UI Components
```javascript
import {
  createViewportIndicator,
  createToggleButton,
  updateViewportWidthDisplay
} from './ui.js';

// Create UI elements
const indicator = createViewportIndicator();
document.body.appendChild(indicator);

// Update displays
updateViewportWidthDisplay(1920);
```

## Common Patterns

### Pattern 1: Update State and Auto-Save
```javascript
// State updates automatically trigger saves via subscribers
gridState.gridVisible = true;
// ↓ Automatically triggers subscriber
// ↓ Which calls updateGridVisibilityUI()
// ↓ Which calls saveGridVisibility()
```

### Pattern 2: Listen to State Changes
```javascript
function setupListeners() {
  // Listen to grid visibility changes
  gridState.subscribe('gridVisible', (visible) => {
    updateGridVisibilityUI();
    saveGridVisibility(visible);
  });

  // Listen to config changes
  gridState.subscribe('config', () => {
    drawGrid();
    updateInputValues();
  });
}
```

### Pattern 3: Debounced Updates
```javascript
import { debounce } from './utils.js';
import { CONSTANTS } from './constants.js';

const debouncedSave = debounce(() => {
  saveGridConfig(gridState.config, gridState.currentBreakpointIndex);
}, CONSTANTS.DEBOUNCE_DELAY);

// Subscribe with debouncing
gridState.subscribe('config', debouncedSave);
```

### Pattern 4: Safe Storage Operations
```javascript
import { loadGridConfig } from './storage.js';

// Promise-based
loadGridConfig().then((result) => {
  if (result.gridConfig) {
    gridState.config = result.gridConfig;
  }
});

// Async/await
async function loadSettings() {
  try {
    const result = await loadGridConfig();
    if (result.gridConfig) {
      gridState.config = result.gridConfig;
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
}
```

## State Management Cheat Sheet

### Reading State
```javascript
// Direct getters
const enabled = gridState.enabled;
const visible = gridState.gridVisible;
const config = gridState.config;
const currentBp = gridState.currentBreakpoint;
```

### Updating State
```javascript
// Direct setters (triggers notifications)
gridState.enabled = true;
gridState.gridVisible = false;
gridState.uiZoom = 120;
gridState.currentBreakpointIndex = 2;

// Update config properties
gridState.updateConfig('columns', 12);
gridState.updateConfig('gutter', 16);

// Update current breakpoint
gridState.updateCurrentBreakpoint('name', 'Desktop');
gridState.updateCurrentBreakpoint('minWidth', 1024);
```

### Subscribing to Changes
```javascript
// Subscribe to specific property
const unsubscribe = gridState.subscribe('gridVisible', (visible) => {
  console.log('Visibility:', visible);
});

// Unsubscribe when done
unsubscribe();

// Subscribe to all changes
gridState.subscribe('*', (value, key) => {
  console.log(`${key} = ${value}`);
});

// Subscribe to nested changes
gridState.subscribe('config.columns', (columns) => {
  console.log('Columns changed:', columns);
});
```

### Working with Breakpoints
```javascript
// Get viewport-matching breakpoint
const index = gridState.getViewportMatchingBreakpoint();

// Add breakpoint
gridState.addBreakpoint({
  name: 'tablet',
  minWidth: 768,
  columns: 8,
  gutter: 16,
  margin: 32,
  rowGap: 8
});

// Remove breakpoint
gridState.removeBreakpoint(2);

// Save/load breakpoint settings
gridState.saveCurrentBreakpointSettings();
gridState.loadCurrentBreakpointSettings();
```

## Best Practices

### ✅ DO
```javascript
// Use state setters
gridState.gridVisible = true;

// Subscribe to changes for reactive updates
gridState.subscribe('gridVisible', updateUI);

// Use debouncing for frequent updates
const debouncedSave = debounce(save, 300);

// Use constants instead of magic numbers
const zoom = CONSTANTS.ZOOM_MAX;

// Sanitize user input
const safe = sanitizeHTML(userInput);
```

### ❌ DON'T
```javascript
// Don't mutate private state directly
gridState._state.gridVisible = true; // BAD!

// Don't poll for changes
setInterval(() => checkState(), 100); // BAD!

// Don't use magic numbers
const maxZoom = 200; // BAD! Use CONSTANTS.ZOOM_MAX

// Don't trust user input
element.innerHTML = userInput; // BAD! Use sanitizeHTML()
```

## Module Responsibilities

| Module | Responsibility | Exports |
|--------|---------------|---------|
| `constants.js` | Configuration values | `CONSTANTS`, `DEFAULT_GRID_CONFIG`, `DEFAULT_GRID_STATE` |
| `utils.js` | Helper functions | `debounce`, `sanitizeHTML`, `createElement`, etc. |
| `state.js` | State management ⭐ | `gridState` (singleton) |
| `storage.js` | Chrome storage | `saveGridConfig`, `loadGridConfig`, `savePreset`, etc. |
| `ui.js` | DOM/UI components | `createViewportIndicator`, `createToggleButton`, etc. |
| `content.js` | Orchestration | Main initialization and event handling |

## Quick Start

### Adding a New Feature

1. **Add constants** (if needed)
   ```javascript
   // constants.js
   export const CONSTANTS = {
     NEW_FEATURE_DELAY: 500,
     // ...
   };
   ```

2. **Add state properties** (if needed)
   ```javascript
   // state.js
   get newFeature() {
     return this._state.newFeature;
   }

   set newFeature(value) {
     if (this._state.newFeature !== value) {
       this._state.newFeature = value;
       this._notify('newFeature', value);
     }
   }
   ```

3. **Add storage functions** (if needed)
   ```javascript
   // storage.js
   export function saveNewFeature(value) {
     return safeStorageSet({ newFeature: value });
   }
   ```

4. **Wire up in content.js**
   ```javascript
   // Setup listener
   gridState.subscribe('newFeature', (value) => {
     updateNewFeatureUI(value);
     saveNewFeature(value);
   });

   // Handle user interaction
   button.addEventListener('click', () => {
     gridState.newFeature = true;
   });
   ```

## Testing Tips

### Test State Management
```javascript
// Subscribe to verify notifications
let called = false;
gridState.subscribe('gridVisible', () => {
  called = true;
});

gridState.gridVisible = true;
console.assert(called === true, 'Subscriber should be called');
```

### Test Storage
```javascript
// Save and load
await saveGridConfig(testConfig, 0);
const result = await loadGridConfig();
console.assert(result.gridConfig.columns === testConfig.columns);
```

### Test UI Components
```javascript
const button = createToggleButton();
console.assert(button.className === 'grid-toggle-btn');
console.assert(button.textContent === '×');
```

## Debugging

### View Current State
```javascript
console.log(gridState.getState()); // Get complete state snapshot
```

### Monitor All Changes
```javascript
gridState.subscribe('*', (value, key) => {
  console.log(`[STATE] ${key} changed to:`, value);
});
```

### Check Storage
```javascript
chrome.storage.local.get(null, (items) => {
  console.log('All storage:', items);
});
```

---

**For more details, see `ARCHITECTURE.md`**
