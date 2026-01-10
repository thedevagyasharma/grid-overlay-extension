# Privacy Policy for Grid Overlay Pro Chrome Extension

**Last Updated:** January 7, 2026

## Introduction

Grid Overlay Pro ("the Extension") is a browser extension that provides a professional grid overlay tool with responsive breakpoints for web design and development. This privacy policy explains how the Extension handles user data.

## Summary

**Grid Overlay Pro does not collect, transmit, or share any personal or sensitive user data.** All settings and preferences are stored locally on your device and never leave your browser.

## Data Collection and Storage

### What Data is Stored

The Extension stores the following configuration data locally on your device using Chrome's storage API (`chrome.storage.local`):

- **Grid Configuration Settings:** Column count, gutter width, margin size, row gap, grid color, padding color, and opacity settings
- **Breakpoint Settings:** Custom breakpoint configurations including name, minimum width, and associated grid settings
- **UI Preferences:** UI zoom level, controls visibility state, grid visibility state, indicator visibility state, and editing mode state
- **Saved Presets:** User-created preset configurations for quick access

### How Data is Stored

All data is stored locally on your device using Chrome's built-in storage API. This data:

- **Never leaves your device**
- **Is not transmitted to any external servers**
- **Is not shared with any third parties**
- **Is not accessible to the Extension developer**

### Data Retention

Your settings persist locally until you:

- Uninstall the Extension
- Clear your browser's extension data
- Manually reset the Extension settings

## Data We Do NOT Collect

Grid Overlay Pro does **not** collect:

- Personal information (name, email, address, phone number)
- Authentication credentials or login information
- Financial or payment information
- Health information
- Web browsing history or activity
- Website content you visit
- Cookies or tracking data
- Location data
- Device identifiers
- Any form of analytics or usage statistics

## Permissions Explained

The Extension requests the following permissions:

### `activeTab`
This permission allows the Extension to inject the grid overlay on the currently active tab when you activate the Extension. It does not grant access to your browsing history or other tabs.

### `storage`
This permission allows the Extension to save your grid configuration settings locally on your device. No data is transmitted externally.

### Content Script Access
The Extension injects a content script to render the grid overlay on web pages. This script:

- Only draws a visual grid overlay on the page
- Does not read, collect, or transmit any page content
- Does not interact with or modify website data
- Does not track which websites you visit

## Export and Import Features

The Extension includes export and import functionality for your grid settings:

- **Export:** Creates a JSON file containing your grid configuration that downloads to your device. This file is generated locally and is not transmitted anywhere.
- **Import:** Reads a JSON configuration file from your device to restore settings. The file is processed locally and its contents are not transmitted anywhere.

## Third-Party Services

Grid Overlay Pro does **not** use any third-party services, analytics, or tracking tools. The Extension operates entirely offline and locally on your device.

## Data Security

Since all data is stored locally on your device and never transmitted externally, your data is protected by your device's security measures and Chrome's built-in extension security model.

## Children's Privacy

Grid Overlay Pro does not collect any personal information from anyone, including children under 13 years of age.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this policy. Continued use of the Extension after any changes constitutes acceptance of the updated policy.

## Your Rights

Since we do not collect any personal data, there is no personal data to access, modify, or delete. Your local settings can be cleared by uninstalling the Extension or clearing your browser's extension data.

## Open Source

Grid Overlay Pro is developed as an open-source project. You can review the source code to verify our privacy practices.

## Contact

If you have any questions about this Privacy Policy or the Extension's data practices, please contact us through the Chrome Web Store developer contact information or by opening an issue in our project repository.

## Compliance

This Extension complies with:

- Chrome Web Store Developer Program Policies
- Chrome Web Store User Data Policy
- Limited Use Requirements for Chrome Extensions

---

**In Plain Terms:** Grid Overlay Pro is a simple tool that helps you overlay a design grid on web pages. Everything you configure stays on your computer. We do not see, collect, or have access to any of your data.
