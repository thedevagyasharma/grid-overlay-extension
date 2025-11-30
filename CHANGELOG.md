# Changelog

All notable changes to Grid Overlay Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-01-30

### 🎉 Initial Release

The first stable release of Grid Overlay - a professional layout grid extension for Chrome.

### ✨ Features

#### Core Grid System
- **Full-document height grids** - Columns extend across entire document, not just viewport
- **HTML5 Canvas rendering** - High-performance, minimal CPU usage
- **Real-time updates** - Grid adjusts instantly as you modify settings
- **Customizable parameters**:
  - Columns: 1-24
  - Column Gutter: 0-100px
  - Row Gap: 0-100px (horizontal rhythm guidelines)
  - Margin: 0-200px
  - Max Width: 0-2000px with auto-centering
  - Color: Full color picker
  - Opacity: 0-100%

#### Responsive Breakpoint System
- **Pre-configured breakpoints**: Mobile (0px), Tablet (768px), Desktop (1024px), Wide (1440px)
- **Custom breakpoints** - Add unlimited custom breakpoints with unique settings
- **Per-breakpoint settings** - Each breakpoint stores its own columns, gutter, margin, and row gap
- **Visual breakpoint selector** - Chip-based UI showing all breakpoints
- **Breakpoint indicators**:
  - Blue highlight for currently editing breakpoint
  - Green diamond (◆) for viewport-matching breakpoint
- **Automatic sorting** - Breakpoints auto-sort by min-width value

#### Viewing & Editing Modes
- **Viewing Mode (Default)** 🟢
  - Grid automatically matches viewport width
  - Perfect for responsive testing
  - Resizing browser auto-selects appropriate breakpoint
  - Indicator shows viewport-matching breakpoint

- **Editing Mode** 🟠
  - Manually select which breakpoint to edit
  - Make changes without resizing browser
  - Clicking any breakpoint chip activates Editing Mode
  - Indicator shows editing breakpoint

#### Advanced UI Controls
- **Viewport Indicator** (top-center):
  - Current viewport width (16px, prominent)
  - Breakpoint name (12px, blue, uppercase)
  - Breakpoint range (11px, gray)
  - Mode status badge (Viewing/Editing with semantic colors)
  - Linear horizontal layout
  - Toggle visibility independently from grid

- **Resizable Control Panel**:
  - Left-edge drag handle for resizing (280px-600px)
  - Visual grip indicator
  - Smooth resize interaction
  - Separate from scrollable content (no scroll issues)

- **Modern Scrollbar**:
  - Custom styled for dark theme
  - 8px width, themed colors
  - Hidden scroll buttons/arrows
  - Smooth transitions

- **UI Scaling** (50-200%):
  - Zoom control panel for comfortable viewing
  - Independent from browser zoom
  - Persistent across sessions

- **Toggle Controls**:
  - Show/Hide Grid overlay
  - Show/Hide Viewport indicator
  - Viewing/Editing mode switch
  - Visual toggle switches with smooth animations

#### Settings Management
- **Import/Export**:
  - Export settings as JSON file
  - Import settings from JSON file
  - Date-stamped filenames
  - Version information included

- **Presets System**:
  - Save unlimited presets
  - Quick switching between configurations
  - Delete unwanted presets
  - Named presets for organization

- **Persistent Storage**:
  - All settings save automatically
  - Chrome Storage API integration
  - Backwards compatible with legacy settings
  - Automatic migration for old data

#### User Experience
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+G` - Toggle grid visibility
  - Keyboard hint displayed in UI

- **Figma-Style Inputs**:
  - Unified input fields with integrated units
  - Right-aligned numeric values
  - Unit labels (px, %) inside input boundary
  - No spinner arrows
  - Clean, professional appearance

- **Color Picker**:
  - Layered transparent input approach
  - Click swatch to open native color picker
  - Visual feedback on hover
  - Instant color updates

- **Responsive UI**:
  - Works on narrow and wide screens
  - Breakpoint chips wrap gracefully
  - 2-column form layout (label | value)
  - Optimized for 250-300px minimum width

### 🔧 Technical Improvements

#### Performance
- Canvas-based rendering (no DOM manipulation for grid)
- ResizeObserver for efficient viewport tracking
- MutationObserver for document height changes
- Debounced resize handling
- Minimal redraw operations

#### Architecture
- Manifest V3 compliance
- Content script injection
- Separated concerns:
  - `content.js` - Main grid logic
  - `overlay.css` - All styling
  - `popup.js` - Extension popup
  - `popup.html` - Popup UI

#### Code Quality
- Strict mode enabled
- IIFE pattern for isolation
- Event delegation for dynamic elements
- Null checks and error handling
- Backwards compatibility for old settings
- Default value fallbacks for rowGap

### 🎨 Design

- **Dark theme** with semi-transparent backgrounds
- **Semantic colors**:
  - Blue (#0066ff) - Primary actions, editing state
  - Green (#00ff88) - Viewing mode, viewport matching
  - Orange (#ff9500) - Editing mode
  - Gray scales for hierarchy
- **Smooth transitions** and hover states
- **Accessible contrast** (WCAG AA compliant)
- **Modern UI** inspired by Figma and professional design tools

### 📦 Included Files

- `manifest.json` - Extension configuration (Manifest V3)
- `content.js` - Core functionality (753 lines)
- `overlay.css` - Complete styling (690+ lines)
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons
- `README.md` - Comprehensive documentation
- `PUBLISHING_GUIDE.md` - Chrome Web Store publishing instructions
- `PRE_PUBLISH_CHECKLIST.md` - Quality assurance checklist
- `build.ps1` - PowerShell build script
- `CHANGELOG.md` - This file

### 🔒 Privacy & Security

- **Zero telemetry** - No data collection
- **Offline-first** - No internet connection required
- **Local storage only** - No cloud sync
- **Minimal permissions**:
  - `activeTab` - Display overlay on current page
  - `storage` - Save user preferences
- **No external dependencies** - Vanilla JavaScript
- **No external requests** - Completely self-contained

### 📊 Browser Compatibility

- Chrome 88+
- Edge 88+ (Chromium)
- Brave (Chromium)
- Opera (Chromium)
- Vivaldi (Chromium)

### 🐛 Known Issues

None reported in this release.

### 📝 Notes

- This is the first stable release ready for Chrome Web Store submission
- All features tested across multiple websites and viewport sizes
- Documentation complete and comprehensive
- Build process automated with PowerShell script

---

## Future Releases

See [README.md](README.md) roadmap section for planned features.

---

**Full Changelog**: https://github.com/yourusername/grid-overlay-extension/commits/v1.0.0
