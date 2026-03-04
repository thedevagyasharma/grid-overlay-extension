# Changelog

All notable changes to Grid Overlay Pro are documented here.

---

## [2.5.2] — 2026-03-03

### Fixed
- Popups (breakpoint editor, color picker, shortcuts) now hide when the controls panel is minimized, and reappear when expanded
- Viewport indicator range display correctly handles non-px breakpoint units — no more `48rempx` or `NaNpx`
- Grid canvas and viewport indicator now update live whenever a breakpoint field is edited, without needing to close and reopen the editor

---

## [2.5.1] — 2026-03-03

### Fixed
- Columns field is validated before saving — non-integer input is rejected
- CSS functions (`clamp()`, `calc()`, `min()`, `max()`) are now correctly accepted in length fields without a unit being appended

---

## [2.5.0] — 2026-03-03

### Added
- CSS length fields — gutter, row gap, margin, and padding now accept any valid CSS length: `px`, `rem`, `em`, `vw`, `%`, `calc()`, `clamp()`, and more
- Unit inheritance — new breakpoints inherit the unit from existing breakpoint fields
- Enter key saves a field value in the breakpoint editor
- Range display in the breakpoint list shows the effective viewport range each breakpoint covers (e.g. `768px – 1279px`)
- Duplicate min-width warning — icon and tooltip appear when two breakpoints share the same min-width, identifying which will be unreachable

---

## [2.4.5] — 2026-03-01

### Fixed
- Breakpoint editor popup now closes automatically when its breakpoint is deleted

---

## [2.4.4] — 2026-03-01

### Fixed
- UI polish: consistent font sizes, spacing, and component alignment throughout
- Breakpoint name field rewritten as an inline editable header for a cleaner editing flow

---

## [2.4.3] — 2026-02-10

### Fixed
- Grid and viewport indicator now update immediately when switching between presets
- Single-popup system: opening one popup closes any other already open; clicking the same trigger again toggles it off
- Corrected popup and controls panel positioning after the minimize button was introduced

---

## [2.3.0] — 2026-01-25

### Added
- Minimize button — collapse the controls panel to a small handle to keep it out of the way while inspecting the page
- Inter font used consistently throughout the UI

---

## [2.2.2] — 2026-01-09

### Changed
- Extension rebranded to **Grid Overlay Pro**

---

## [2.2.0] — 2026-01-09

### Added
- Color picker moved to a floating popup panel — pick grid color and padding color without leaving the breakpoint screen
- Privacy policy added

---

## [2.1.1] — 2026-01-09

### Fixed
- Several UI inconsistencies corrected
- Initialization bug fixed that could prevent the grid from rendering on first load

---

## [2.0.0] — 2026-01-08

### Changed
- Complete UI overhaul with a new modular architecture
- Breakpoints and presets managed through a structured panel with dedicated screens
- Grid settings (columns, gutter, margin, padding) are now per-breakpoint rather than global

---

## [1.1.0] — 2026-01-07

### Changed
- Performance, security, and code quality improvements throughout

### Fixed
- Viewport indicator no longer wraps on narrow screens
- Toggle button interactions corrected
- Grid visibility toggle no longer hides the controls panel

---

## [1.0.0] — 2025-11-30

### Added
- Initial release
- CSS grid overlay rendered on any webpage via a fixed canvas
- Configurable columns, gutter, and margin
- Toggle grid visibility with a keyboard shortcut
- Viewport width indicator
- Preset management
