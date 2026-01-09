# Design Guide

## Typography

### Font Faces

*   Sans Serif: Inter  
    Use for UI elements.
*   Mono: Geist Mono  
    Use for Keyboard Shortcuts only. (Example: Ctrl + Shift + G)

### Weights To Use

*   Regular - 400

NOTE: DO NOT USE ANY OTHER FONT-WEIGHTS.

### Sizes \[Name: Size Weight (Usage)\]

*   Heading 1: 24px Regular (Use for Extension Title 'Grid Overlay Pro' only)
*   Heading 2: 20px Regular (Use for Breakpoints screen title only. The title is the Preset name.)
*   Heading 3: 18px Regular (Use for Breakpoint Editing screen title. The title is the Breakpoint name.)
*   Body: 14px Regular (Use for Preset Name in Preset Card, Breakpoint Name in Breakpoint Item, Add Preset button, Add Breakpoint button)
*   Small: 12px Regular (Use for Privacy Policy text, Breakpoint Meta in Breakpoint Item, Input Field Label)
*   Label: 11px Regular (Use for group titles such as "PRESETS", "BREAKPOINTS", "COLORS". Input Field Hint Text. Input Field Unit.)

## Colors

\--neutral-300: For all text 14px or above  
\--neutral-400: For 12px and 11px text and icons. "Add Breakpoint" and "New Preset" button text are exceptions to previous rule and will use neutral-400. Active states do not affect small text color but do affect icon colors.  
\--neutral-900: Base background color (panel bg)  
\--neutral-800: Level 1 background color (card and item bg. actions placed directly on panel. dividers.)  
\--neutral-700: Level 2 background color (buttons on Level 1 items)  
\--neutral-600: Level 3 background color (button group divider, and button group border inside Breakpoint Item)  
\--slate-900: Background for Active state items -> Active Breakpoint, Grid Button (Enabled), Indicator Button (Enabled)  
\--blue-500: Border, Text and Icon for Active state items ->  Active Breakpoint, Grid Button (Enabled), Indicator Button (Enabled).

## Components

### Icon Buttons

*   Icon size: 16px by 16px
*   Padding: 6px on all sides
*   Border Radius: 6px

### Icon Button Group

*   Left most button has rounded corners on left side
*   Right most button has rounded corners on right side
*   Center buttons do not have any rounded corners
*   1px divider between buttons (neutral-600 color)
*   Group has a 1px border (neutral-600 color)

### Breakpoint Item & Preset Card

*   Horizontal Padding: 10px
*   Vertical Padding: 12px

### Add Breakpoint Button

*   Icon + Text aligns center
*   Padding is same as above

### New Preset Button

*   Text aligns center
*   Item takes the height of neighbor if availble. If the item is alone in the row, continue using the normal padding as noted above.

### Input Field

*   Height: 32px
*   Horizontal Padding: 10px
*   Label and Hint Text align left
*   Unit aligns right
*   Value aligns right

### Dividers

*   1px divider after header on every screen
*   1px divider after groups (After BREAKPOINTS group or before COLORS group on Breakpoints screen. After "Grid Overlay Pro" title on Presets screen. After Breakpoint Name on Breakpoint Edit screen. Before footer on all screens.)

### Main Panel

*   Total Width: 360px
*   Padding: 16px on all sides

### Breakpoint Edit Popup and Keyboard Shortcuts Popup

*   Total Width: 240px
*   Padding: 16px on all sides