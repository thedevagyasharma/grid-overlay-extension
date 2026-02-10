# Grid Overlay Pro

> Professional grid overlay extension for responsive web design and pixel-perfect layouts

A Chrome extension that overlays customizable grid systems on any webpage. Perfect for designers and developers who need to verify layouts, check responsive breakpoints, and ensure pixel-perfect precision.

---

## ✨ Features

### 🎨 Preset-Based Grid System
- **Multiple presets** - Create unlimited presets, each with its own set of breakpoints
- **Automatic viewport matching** - Grid automatically selects the appropriate breakpoint based on viewport width
- **Full-height columns** - Grid columns extend across the entire document height
- **Canvas-based rendering** - Smooth, high-performance overlay
- **Auto-save** - All changes save automatically, no save buttons needed

### 📱 Responsive Breakpoints
- **Unlimited breakpoints** - Define as many breakpoints as needed per preset
- **Per-breakpoint grid settings**:
  - Columns (1-24)
  - Column gutter (spacing between columns)
  - Row gap (horizontal guidelines for vertical rhythm)
  - Margin (outer spacing from viewport edges)
  - Max width (container maximum width with auto-centering, 0 = full width)
  - Padding (inner spacing within the container, visualized separately)

### 🎨 Visual Customization
- **Grid color & opacity** - Customize the color and transparency of column areas (per preset)
- **Padding color & opacity** - Customize the color and transparency of padding areas (per preset)
- **Padding visualization** - When padding is set, colored strips appear within the container to show the padding zones
- **Adjustable opacity** - Fine-tune transparency for both grid and padding overlays

### 🎯 Modern Interface
- **Two-screen navigation**:
  - **Presets Screen** - View all presets, create new ones, delete existing ones
  - **Breakpoints Screen** - Manage breakpoints and colors for the selected preset
- **Popup-based controls** - Clean, minimal interface with smooth transitions
- **Editable headers** - Click preset or breakpoint names to rename them inline
- **Minimizable panel** - Click the minimize button at the top-right to hide/show the entire control panel
- **Viewport indicator** - Top-center indicator showing current viewport width and active breakpoint
- **Toggle visibility** - Show/hide grid and viewport indicator independently
- **Keyboard shortcuts** - Quick access to toggle grid and indicator

---

## 🚀 Installation

### From Chrome Web Store

**[Install Grid Overlay Pro from Chrome Web Store](https://chromewebstore.google.com/detail/grid-overlay-pro/dffjjhlaagddjjjdjgihgjnhcmpbpcjl)**

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the extension directory
6. Click the extension icon in your toolbar to enable the grid

---

## 📖 How to Use

### Getting Started

1. Click the **Grid Overlay Pro** extension icon in your toolbar
2. Click **Enable Grid** in the popup
3. The grid overlay appears on the current page
4. Look for the **minimize/maximize button** in the top-right corner of the controls panel

### Understanding the Interface

**Presets Screen** (default view):
- Shows all your saved presets as cards
- Each card displays the preset name and number of breakpoints
- Click any preset card to select it and view its breakpoints
- Click **+ New Preset** to create a new preset
- Hover over a preset card to reveal the delete button (only visible when you have 2+ presets)

**Breakpoints Screen** (when a preset is selected):
- Click the preset name at the top to rename it
- Toggle grid visibility with the **eye icon**
- Toggle viewport indicator with the **ruler icon**
- View all breakpoints for the current preset as cards
- Click **+ Add Breakpoint** to create a new breakpoint
- Click any breakpoint card to edit its settings in a popup
- Scroll down to the **COLORS** section to customize grid and padding colors

### Working with Breakpoints

The grid automatically selects the appropriate breakpoint based on your current viewport width. When you resize the browser window, the grid updates to match the new breakpoint.

**Creating a Breakpoint**:
1. Click **+ Add Breakpoint**
2. A popup appears with fields for all settings
3. Edit the name, min-width, and grid parameters
4. Changes save automatically as you type

**Editing a Breakpoint**:
1. Click any breakpoint card
2. Edit settings in the popup
3. Changes save automatically
4. Click outside the popup or press Escape to close it

**Deleting a Breakpoint**:
1. Hover over a breakpoint card
2. Click the delete icon that appears

### Customizing Colors

In the **COLORS** section:
- **Grid Color** - Click to open the color picker popup
  - Choose a color with the color input
  - Adjust opacity with the slider
- **Padding Color** - Click to open the color picker popup
  - Choose a color with the color input
  - Adjust opacity with the slider

Color changes apply to all breakpoints in the current preset and save automatically.

### Understanding Grid Parameters

**Columns** - Number of vertical columns (1-24)

**Gutter** - Spacing between columns in pixels

**Row Gap** - Horizontal guidelines spacing in pixels (useful for baseline grids)

**Margin** - Outer spacing from viewport edges in pixels
- Always exists outside the container
- Not visualized separately (transparent)

**Max Width** - Container maximum width in pixels
- Set to 0 for full-width layouts (spans entire viewport minus margins)
- Non-zero values create a centered container

**Padding** - Inner spacing within the container in pixels
- Visualized as colored strips on the left and right edges of the container
- Only visible when Max Width is greater than 0
- Uses the "Padding Color" you set in the COLORS section

**Visual Layout**:
```
[Viewport Edge]
  [Margin - transparent]
    [Padding - colored if > 0] [Grid Columns] [Padding - colored if > 0]
  [Margin - transparent]
[Viewport Edge]
```

### Viewport Indicator

The viewport indicator appears at the top-center of the page and shows:
- Current viewport width (e.g., "1440px")
- Active breakpoint name (e.g., "Desktop")
- Breakpoint's min-width (e.g., "≥1024px")

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+G` | Toggle grid visibility |
| `Ctrl+Shift+H` | Toggle viewport indicator visibility |

---

## 🎯 Default Configuration

When you first install the extension, a **Default** preset is created with three breakpoints:

| Breakpoint | Min Width | Columns | Gutter | Row Gap | Margin | Max Width | Padding |
|------------|-----------|---------|--------|---------|--------|-----------|---------|
| Mobile     | 0px       | 4       | 16px   | 8px     | 16px   | 0px       | 0px     |
| Tablet     | 768px     | 8       | 16px   | 8px     | 32px   | 0px       | 0px     |
| Desktop    | 1024px    | 12      | 24px   | 8px     | 48px   | 1200px    | 0px     |

Default colors:
- Grid: Red (#ff0000) at 15% opacity
- Padding: Blue (#0000ff) at 15% opacity

---

## 🔧 Technical Details

### Architecture
- **Modular JavaScript** - Component-based architecture with clear separation of concerns
- **Preset-based system** - All grids organized into presets containing breakpoints
- **State management** - Centralized AppState class manages application state
- **View routing** - ViewRouter handles navigation between screens and popups
- **No dependencies** - Pure vanilla JavaScript, no frameworks or libraries

### Performance
- **Canvas rendering** - HTML5 Canvas for efficient grid drawing
- **Automatic height adjustment** - Grid canvas matches full document height
- **Smart updates** - Grid only redraws when necessary (resize, settings change)
- **Observers** - ResizeObserver and MutationObserver keep grid in sync with page changes

### Storage
- **Chrome Storage API** - All data stored locally in your browser
- **Auto-save** - Changes save immediately without user action
- **No cloud sync** - All data stays on your device
- **Persistent** - Settings preserved across browser sessions

### Permissions
- `activeTab` - Display grid overlay on current page
- `storage` - Save presets and settings locally

### Browser Compatibility
- Chrome 88+
- Edge 88+ (Chromium-based)
- Brave, Opera, Vivaldi (Chromium-based browsers)

---

## 🐛 Troubleshooting

### Grid not showing?
- Ensure you clicked "Enable Grid" in the extension popup
- Check that grid visibility is enabled (eye icon should be highlighted in Breakpoints screen)
- Verify opacity is not set to 0% in the COLORS section
- Refresh the page

### Controls not visible?
- Look for the minimize/maximize button in the top-right corner of the controls panel
- Click it to expand the controls if minimized

### Viewport indicator not visible?
- Ensure indicator visibility is enabled (ruler icon should be highlighted)
- It appears at the top-center of the page
- Use `Ctrl+Shift+H` to toggle it

### Breakpoint not switching automatically?
- Grid automatically selects breakpoints based on viewport width
- Resize your browser to see different breakpoints activate
- Ensure your breakpoints have correct min-width values
- Check that no two breakpoints have the same min-width

### Settings not saving?
- All settings save automatically - no save button needed
- If you're experiencing issues, try disabling and re-enabling the extension
- Check Chrome's extension permissions at `chrome://extensions/`

---

## 🔒 Privacy

This extension:
- ✅ Works **completely offline**
- ✅ Stores all data **locally** on your device
- ✅ Does **NOT collect** any personal data
- ✅ Does **NOT track** your browsing activity
- ✅ Does **NOT communicate** with external servers
- ✅ Privacy policy: https://gop.devagyasharma.com

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 💬 Support

- **Report bugs**: GitHub Issues
- **Source code**: https://github.com/thedevagyasharma/grid-overlay-extension

---

**Version**: 2.4.3
**Last Updated**: February 2025

Made with precision for designers and developers who care about pixel-perfect layouts.
