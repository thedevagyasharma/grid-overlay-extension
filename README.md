# Grid Overlay - Professional Layout Grid Extension

> Transform any website into a design playground with professional grid overlays and responsive breakpoint management.

A powerful Chrome extension that brings Figma-style layout grids to the web. Perfect for designers and developers who need pixel-perfect precision and responsive design verification.

---

## ✨ Key Features

### 🎨 Professional Grid System
- **Full-height columns** that extend across the entire document (not just viewport)
- **Customizable row gaps** for horizontal rhythm guidelines
- **Figma-style controls** with unified input fields and modern UI
- **Canvas-based rendering** for optimal performance
- **Real-time updates** as you adjust settings

### 📱 Responsive Breakpoints
- **Two powerful modes:**
  - **Viewing Mode** 🟢 Grid automatically matches your viewport width
  - **Editing Mode** 🟠 Manually select and edit specific breakpoints
- **Pre-configured breakpoints** (Mobile, Tablet, Desktop, Wide)
- **Custom breakpoints** with unique column/gutter/margin settings per breakpoint
- **Auto-save** - changes to grid settings save to the current breakpoint
- **Visual breakpoint selector** with chips showing active and viewport-matching states

### 🎯 Advanced Controls
- **Viewport indicator** (top-center) showing:
  - Current viewport width
  - Active breakpoint name and range
  - Current mode (Viewing/Editing) with semantic colors
- **Resizable control panel** with left-edge drag handle
- **UI scaling** (50-200%) for comfortable viewing on any display
- **Toggle visibility** for both grid overlay and viewport indicator
- **Keyboard shortcut**: `Ctrl+Shift+G` to toggle grid visibility

### ⚙️ Complete Customization
- **Columns**: 1-24 columns
- **Column Gutter**: Precise spacing control (px)
- **Row Gap**: Horizontal guidelines for vertical rhythm
- **Margin**: Outer spacing from viewport edges
- **Max Width**: Container width with auto-centering
- **Color & Opacity**: Full color picker with transparency control

### 💾 Settings Management
- **Import/Export** settings as JSON files
- **Save presets** for quick switching between configurations
- **Persistent storage** - all settings saved across browser sessions
- **Backwards compatible** - gracefully handles old settings

---

## 🚀 Installation

### Option 1: Download from GitHub Releases (Recommended)

1. Go to the [**Releases page**](https://github.com/thedevagyasharma/grid-overlay-extension/releases)
2. Download the latest `.zip` file (e.g., `grid-overlay-extension-v1.1.0.zip`)
3. Extract the ZIP file to a permanent location
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable **"Developer mode"** (toggle in top-right corner)
6. Click **"Load unpacked"**
7. Select the extracted folder (the one containing `manifest.json`)
8. The extension is now installed!

**See [INSTALLATION.md](INSTALLATION.md) for detailed step-by-step instructions with troubleshooting.**

### Option 2: From Chrome Web Store
*(Coming soon - in review)*

### Option 3: Clone from Source

1. Clone this repository: `git clone https://github.com/thedevagyasharma/grid-overlay-extension.git`
2. Run the build script: `node build-modular.js`
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable **"Developer mode"** (toggle in top-right corner)
5. Click **"Load unpacked"**
6. Select the extension directory
7. Click the extension icon to start using Grid Overlay!

---

## 📖 Usage Guide

### Quick Start

1. **Click** the Grid Overlay extension icon in your toolbar
2. The grid will appear with default settings
3. **Resize** your browser to see automatic breakpoint switching (Viewing Mode)
4. **Click** the floating toggle button (☰) to show/hide the control panel

### Understanding Modes

#### 🟢 Viewing Mode (Default)
- Grid **automatically** selects the breakpoint matching your viewport width
- Perfect for **responsive testing** and layout verification
- Resize browser to see different breakpoints activate
- Indicator shows the **viewport-matching** breakpoint

#### 🟠 Editing Mode
- **Manually select** which breakpoint to edit
- Clicking any breakpoint chip automatically switches to Editing Mode
- Make changes to grid settings for that specific breakpoint
- Indicator shows the **editing** breakpoint
- Toggle back to Viewing Mode to resume auto-selection

### Control Panel Overview

**Top Section:**
- **UI Scaling** - Zoom the control panel (50-200%)
- **Show Grid** - Toggle grid overlay visibility (Ctrl+Shift+G)
- **Show Indicator** - Toggle viewport indicator visibility
- **Edit Mode** - Switch between Viewing and Editing modes

**Breakpoints Section:**
- **Breakpoint chips** - Click to select and edit
  - Blue highlight = currently editing
  - Green diamond (◆) = matches current viewport
- **Add Breakpoint** - Create custom breakpoints

**Grid Settings:**
- **Columns** - Number of vertical columns
- **Column Gutter** - Spacing between columns (px)
- **Row Gap** - Horizontal guidelines spacing (px)
- **Margin** - Outer spacing from edges (px)
- **Max Width** - Container maximum width (px, 0 = full width)
- **Grid Color** - Click swatch to choose color
- **Opacity** - Transparency percentage

**Bottom Section:**
- **Save Preset** - Store current configuration
- **Export Settings** - Download settings as JSON
- **Import Settings** - Load settings from JSON file
- **Presets List** - Quick access to saved configurations

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+G` | Toggle grid visibility |

---

## 🎯 Default Breakpoints

| Name    | Min Width | Columns | Gutter | Margin | Row Gap |
|---------|-----------|---------|--------|--------|---------|
| Mobile  | 0px       | 4       | 16px   | 16px   | 8px     |
| Tablet  | 768px     | 8       | 20px   | 24px   | 8px     |
| Desktop | 1024px    | 12      | 24px   | 40px   | 8px     |
| Wide    | 1440px    | 12      | 32px   | 80px   | 8px     |

---

## 💡 Common Use Cases

### Bootstrap Grid (Desktop)
```
Columns: 12
Gutter: 30
Margin: 15
Max Width: 1140
```

### Material Design Grid
```
Columns: 12
Gutter: 16
Margin: 16
Max Width: 1280
```

### 8-Point Grid System
```
Row Gap: 8
Column Gutter: 8
Margin: 8
```

### Tailwind CSS Container
```
Columns: 12
Gutter: 16
Breakpoints match Tailwind (sm/md/lg/xl/2xl)
```

### Full-Width Fluid Design
```
Columns: 12
Max Width: 0
Margin: 0
Gutter: 24
```

---

## 🔧 Technical Details

### Performance
- **HTML5 Canvas** rendering for optimal performance
- **Automatic height adjustment** to match full document height
- **ResizeObserver** and **MutationObserver** for real-time page sync
- **Minimal CPU usage** - grid only redraws when necessary
- **No jQuery** or heavy dependencies

### Storage
- Uses **Chrome Storage API** for persistent settings
- Settings sync is **local only** (no cloud sync)
- Backwards compatible with old settings formats
- Automatic migration for legacy configurations

### Permissions
- `activeTab` - To display grid overlay on current page
- `storage` - To save your settings and preferences

### Browser Compatibility
- Chrome 88+
- Edge 88+ (Chromium-based)
- Brave, Opera, Vivaldi (Chromium-based browsers)

---

## 💪 Pro Tips

1. **Responsive Testing**: Keep in Viewing Mode and resize browser to verify layouts at different breakpoints

2. **Design Verification**: Use Editing Mode to check specific breakpoint layouts without resizing

3. **Vertical Rhythm**: Set Row Gap to your baseline (commonly 8px or 4px) for vertical spacing alignment

4. **Opacity Adjustment**:
   - Light backgrounds: Use darker colors with lower opacity (15-25%)
   - Dark backgrounds: Use lighter colors with higher opacity (20-30%)

5. **Team Collaboration**: Export settings and share JSON files with your team for consistent grids

6. **Multiple Projects**: Save presets for each project/framework you work with

7. **Keyboard Workflow**: Use `Ctrl+Shift+G` to quickly toggle grid on/off while working

---

## 🐛 Troubleshooting

### Grid not showing?
- Check that grid visibility is enabled (Show Grid toggle)
- Verify opacity is not set to 0%
- Try refreshing the page (`F5`)
- Check if extension is enabled at `chrome://extensions/`

### Controls not visible?
- Look for the ☰ button in the bottom-right corner
- Try scrolling - it's a fixed position element
- Check if it's behind other page elements (high z-index)

### Breakpoints not switching in Viewing Mode?
- Ensure you're in Viewing Mode (green), not Editing Mode (orange)
- Verify breakpoint min-width values are correct
- Check that breakpoints don't have duplicate min-width values

### Settings not saving?
- Check Chrome storage quota (unlikely to hit limit)
- Ensure you have storage permission enabled
- Try manually saving settings with Export

### Indicator not updating?
- Toggle indicator visibility off and on
- Refresh the page
- Check if element is hidden by page CSS

---

## 🔒 Privacy

This extension:
- ✅ Works **completely offline**
- ✅ Stores settings **locally** in your browser
- ✅ Does **NOT collect** any personal data
- ✅ Does **NOT track** your browsing
- ✅ Does **NOT require** internet connection
- ✅ Does **NOT communicate** with external servers

---

## 🗺️ Roadmap

- [x] Responsive breakpoint system
- [x] Import/Export settings
- [x] Viewing/Editing modes
- [x] Keyboard shortcuts
- [x] Viewport indicator
- [ ] Baseline grid overlay
- [ ] Multiple grid layers
- [ ] Grid templates library
- [ ] Screenshot with overlay
- [ ] Sync settings across devices

---

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Submit pull requests
- Report bugs via [GitHub Issues](https://github.com/yourusername/grid-overlay-extension/issues)
- Suggest features
- Improve documentation

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 💬 Support

- **Installation Help**: See [INSTALLATION.md](INSTALLATION.md) for detailed installation instructions
- **Issues**: Report bugs on [GitHub Issues](https://github.com/thedevagyasharma/grid-overlay-extension/issues)
- **Updates**: Check the [Releases page](https://github.com/thedevagyasharma/grid-overlay-extension/releases) for new versions
- **Changelog**: See [CHANGELOG.md](CHANGELOG.md) for version history

---

## 🏆 Credits

Made with ❤️ for designers and developers who care about pixel-perfect layouts.

**Version**: 1.0.0
**Last Updated**: 2025

---

## ⭐ If you find this useful, please star the repository!
