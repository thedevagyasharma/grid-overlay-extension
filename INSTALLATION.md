# Installation Guide

This guide will walk you through installing the Grid Overlay Extension manually from GitHub releases.

## Prerequisites

- Google Chrome (version 88 or later recommended)
- Basic understanding of file extraction (unzipping files)

## Installation Steps

### 1. Download the Extension

1. Go to the [Releases page](https://github.com/thedevagyasharma/grid-overlay-extension/releases)
2. Find the latest release
3. Download the `.zip` file (e.g., `grid-overlay-extension-v1.1.0.zip`)
4. Optionally download the `.sha256` file to verify integrity

### 2. Verify Download Integrity (Optional but Recommended)

**On Windows (PowerShell):**
```powershell
Get-FileHash grid-overlay-extension-v1.1.0.zip -Algorithm SHA256
```

**On macOS/Linux:**
```bash
sha256sum grid-overlay-extension-v1.1.0.zip
```

Compare the output with the contents of the `.sha256` file. They should match exactly.

### 3. Extract the ZIP File

1. Locate the downloaded `.zip` file in your Downloads folder
2. Right-click the file and select "Extract All..." (Windows) or double-click (macOS)
3. Choose a permanent location for the extension folder
   - **Important**: Do not delete this folder after installation
   - Recommended locations:
     - Windows: `C:\Users\YourName\ChromeExtensions\grid-overlay`
     - macOS: `~/ChromeExtensions/grid-overlay`
     - Linux: `~/chrome-extensions/grid-overlay`

### 4. Enable Developer Mode in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions` (copy and paste into address bar)
3. In the top-right corner, toggle **Developer mode** to ON
   - The toggle should turn blue/enabled

### 5. Load the Extension

1. Click the **Load unpacked** button (appears after enabling Developer mode)
2. Navigate to the folder where you extracted the extension
3. Select the `dist` folder (or the root folder containing `manifest.json`)
4. Click **Select Folder** (or **Open** on macOS)

### 6. Verify Installation

1. The extension should now appear in your extensions list
2. You should see the Grid Overlay icon in your Chrome toolbar
   - If not visible, click the puzzle piece icon and pin the extension
3. The extension card should show:
   - Name: Grid Overlay Extension
   - Version: (e.g., 1.1.0)
   - Status: Enabled

## First Run

1. Navigate to any webpage
2. Click the Grid Overlay extension icon in the toolbar
3. Click the toggle button to enable the grid
4. The grid overlay will appear on the page
5. Adjust settings using the control panel

## Updating the Extension

When a new version is released:

1. Download the new `.zip` file from the Releases page
2. Extract to a **new folder** (or replace the old one)
3. Go to `chrome://extensions`
4. Click the **Reload** button (circular arrow icon) on the Grid Overlay Extension card
5. If you extracted to a new folder:
   - Remove the old extension
   - Click **Load unpacked** and select the new folder

**Note**: Your settings are stored in Chrome's sync storage and will persist across updates.

## Troubleshooting

### Extension Not Loading

**Problem**: "Manifest file is missing or unreadable"

**Solution**:
- Ensure you selected the correct folder containing `manifest.json`
- Check that all files were extracted properly
- Re-extract the ZIP file

### Extension Not Appearing in Toolbar

**Problem**: Extension icon not visible

**Solution**:
- Click the puzzle piece icon in Chrome's toolbar
- Find "Grid Overlay Extension" in the list
- Click the pin icon to keep it visible

### Grid Not Displaying

**Problem**: Clicking the extension icon does nothing

**Solution**:
- Check that you clicked the toggle button in the popup
- Verify the page allows content scripts (some Chrome internal pages block extensions)
- Try refreshing the webpage
- Check the browser console (F12) for errors

### Permission Errors

**Problem**: "Package is invalid" or permission errors

**Solution**:
- Ensure Developer mode is enabled in `chrome://extensions`
- Check that the folder is not in a restricted location (like Program Files)
- Move the extension folder to your user directory

### Extension Disabled After Chrome Restart

**Problem**: Chrome disables the extension on restart

**Solution**:
- This is normal for unpacked extensions
- Chrome shows a warning banner to re-enable
- Click "Re-enable" or toggle it back on in `chrome://extensions`
- To avoid this, publish to Chrome Web Store (coming soon)

## Uninstalling

1. Go to `chrome://extensions`
2. Find "Grid Overlay Extension"
3. Click **Remove**
4. Confirm removal
5. Delete the extension folder from your computer (optional)

## Browser Compatibility

- **Chrome**: Fully supported (v88+)
- **Edge (Chromium)**: Supported (install same way via `edge://extensions`)
- **Brave**: Supported (install same way via `brave://extensions`)
- **Opera**: Supported (install same way via `opera://extensions`)
- **Firefox**: Not supported (uses different extension manifest)

## Privacy & Permissions

This extension requires:
- **activeTab**: Access to the current tab for grid overlay injection
- **storage**: Save your preferences and settings

The extension:
- Does not collect any data
- Does not make network requests
- Runs entirely locally in your browser
- Does not access or modify page content beyond adding the grid overlay

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review the [README](README.md) for usage instructions
3. Report issues on [GitHub Issues](https://github.com/thedevagyasharma/grid-overlay-extension/issues)

## Version History

See [CHANGELOG.md](CHANGELOG.md) for a complete version history and release notes.
