## Why
- Hiding the native title bar on macOS causes the current renderer layout to feel like a scrolled web page with selectable text, undesired scrolling, and mispositioned window controls.
- Users expect a native desktop feel: dedicated drag regions, sticky footer, limited text selection, and explicit control of scrollable areas so the frame does not feel like a document.
- Light-mode styling bugs (invisible inactive tab labels, pure-white active tab) plus the orb animation/log presentation need refinements to match the "breathing" aesthetic and capture log expectations.

## What Changes
- Restrict text selection to interactive elements (inputs, log output, lists) and disable selection on structural typography; remove global scrolling by pinning the shell height and delegating overflow to internal panels (e.g., logs, lists, settings sections).
- Make the footer sticky/floating near the bottom of the viewport, ensuring author/version metadata is always visible regardless of inner scroll state.
- Restyle Tabs so inactive labels remain visible in both light/dark themes and the active tab uses the accent/highlight background to show focus; adjust orb animation to display multiple rotating blurred circles with floating job nodes distributed around the orb.
- Designate drag regions across header/blank areas (using `-webkit-app-region`) so the frameless window can be dragged anywhere that is not interactive, matching macOS conventions.
- Constrain the capture log panel to a fixed height with its own scrollbar, preventing it from pushing the shell layout while still providing scrollback.
- Keep HAR fallback but ensure the new UI polish aligns with the existing Siri-inspired animation and log streaming interactions.

## Impact
- Renderer layout, CSS, and animation logic will be updated; may require tweaks to shadcn components and introduction of drag-region utility classes.
- Need regression testing for light/dark themes, localization, and window interactions on macOS + other platforms.
- No backend/API changes beyond styling/behavioral updates, but animation/render loops must be profiled for performance after the heavier gradient animation.
