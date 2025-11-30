# Grid Overlay Chrome Extension

A professional grid overlay tool for web developers and designers - like Figma's layout grids, but for any webpage.

## Features

✨ **Figma-Style Grid System**
- Columns run from top to bottom across the entire document
- Grid height matches document height, not just viewport
- Customizable row gaps for horizontal guidelines

🎯 **Responsive Breakpoints**
- Auto-switching grids based on viewport width
- Pre-configured breakpoints (Mobile, Tablet, Desktop, Wide)
- Add custom breakpoints with unique column/gutter/margin settings

⚙️ **Full Customization**
- Columns: 1-24
- Column gutter spacing
- Row gap for horizontal guidelines
- Outer margins
- Max width with auto-centering
- Vertical offset
- Stretch to fit option
- Color and opacity controls

💾 **Preset System**
- Save your favorite grid configurations
- Quick switching between presets
- Persistent across browser sessions

## Installation

### Option 1: Install from Chrome Web Store
*(Coming soon)*

### Option 2: Install Manually (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `grid-extension` folder
6. The Grid Overlay extension is now installed!

## Usage

### Quick Start

1. Click the Grid Overlay icon in your Chrome toolbar
2. Click "Enable Grid" in the popup
3. The grid will appear on your current page
4. Look for the **☰ button** in the bottom-right corner to access settings

### Controls

**Basic Settings:**
- **Columns**: Number of vertical columns (1-24)
- **Column Gutter**: Spacing between columns in pixels
- **Row Gap**: Spacing between horizontal guidelines (0 = no horizontal lines)
- **Margin**: Outer spacing from viewport edges
- **Max Width**: Maximum grid width (0 = full width, auto-centered)
- **Offset Y**: Vertical offset to shift the entire grid up or down
- **Stretch to fit**: When enabled, columns expand to fill available width

**Visual Settings:**
- **Grid Color**: Choose your grid color
- **Opacity**: Adjust transparency (0-100%)

**Responsive Breakpoints:**
- View current breakpoints and their settings
- Active breakpoint is highlighted based on current viewport width
- Add custom breakpoints with the "Add Breakpoint" button
- Edit breakpoint values inline (name, min width, columns, gutter, margin)
- Delete unwanted breakpoints with the × button

**Presets:**
- Click "Save Preset" to save your current configuration
- Click a preset name to load it
- Delete presets you no longer need

### Keyboard Shortcuts

Currently, there are no keyboard shortcuts. Toggle the grid using the extension popup.

### Toggle Controls

Click the **☰ button** in the bottom-right to hide/show the settings panel while keeping the grid visible.

## Default Breakpoints

The extension comes with sensible defaults:

| Name    | Min Width | Columns | Gutter | Margin |
|---------|-----------|---------|--------|--------|
| Mobile  | 0px       | 4       | 16px   | 16px   |
| Tablet  | 768px     | 8       | 20px   | 24px   |
| Desktop | 1024px    | 12      | 24px   | 40px   |
| Wide    | 1440px    | 12      | 32px   | 80px   |

## Common Use Cases

### Bootstrap Grid (Desktop)
- Columns: 12
- Gutter: 30
- Margin: 15
- Max Width: 1140

### Material Design
- Columns: 12
- Gutter: 16
- Margin: 16
- Max Width: 1280

### 8-Point Grid System
- Row Gap: 8
- Column Gutter: 8
- Margin: 8

### Full-Width Design
- Max Width: 0
- Margin: 0
- Stretch: Enabled

## Technical Details

- Grid is rendered using HTML5 Canvas for performance
- Height automatically adjusts to match document height
- ResizeObserver and MutationObserver ensure grid stays in sync with page changes
- All settings persist using Chrome's storage API
- Minimal performance impact - grid only redraws when necessary

## Tips

1. **Responsive Testing**: Resize your browser window to see breakpoints switch automatically
2. **Vertical Rhythm**: Use the Row Gap setting to establish vertical spacing guidelines
3. **Overlay Visibility**: Adjust opacity based on your background - lighter for dark sites, darker for light sites
4. **Offset for Fixed Headers**: Use Offset Y to account for sticky navigation bars
5. **Document Height**: The grid extends to the full document height, perfect for checking alignment on long pages

## Troubleshooting

**Grid not showing?**
- Make sure you clicked "Enable Grid" in the popup
- Try refreshing the page after installing the extension
- Check that the opacity isn't set to 0%

**Controls not visible?**
- Look for the ☰ button in the bottom-right corner
- It may be hidden behind other page elements - try scrolling

**Breakpoints not switching?**
- Verify your breakpoint min-width values are in ascending order
- The extension automatically sorts them, but manual edits might conflict

**Grid not matching document height?**
- The grid uses JavaScript to detect document height
- On dynamically loaded content, it should auto-adjust
- If it doesn't, try toggling the grid off and on again

## Future Enhancements

- [ ] Keyboard shortcuts for quick toggle
- [ ] Export/import preset configurations
- [ ] Baseline grid option
- [ ] Multiple grid layers
- [ ] Screenshot with grid overlay
- [ ] Grid templates library

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Made with ❤️ for designers and developers who care about pixel-perfect layouts**
