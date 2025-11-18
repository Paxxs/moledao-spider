## ADDED Requirements

### Requirement: Native Shell Polish
The frameless Electron window MUST feel like a native desktop app rather than a scrolling web page.

#### Scenario: Sticky frame with selective interaction
- **GIVEN** the user opens the desktop app with the native title bar hidden
- **THEN** the root body occupies the full viewport height without showing a global scrollbar; only designated panels (e.g., jobs list, logs, settings panes) scroll internally
- **AND** structural text (headers, hero copy, labels) is not text-selectable, while interactive controls (inputs, logs, lists) still support selection/copy
- **AND** the author/version footer stays pinned/sticky at the bottom of the visible area regardless of inner scroll state
- **AND** inactive tabs remain legible in light/dark themes, while the active tab uses the accent/highlight color (not pure white) to signal focus
- **AND** blank/header regions near the top carry `-webkit-app-region: drag` so the frameless window can be dragged anywhere outside interactive controls

### Requirement: Orb Animation & Capture Log Panel
The Siri-inspired animation and log monitor MUST reinforce progress without distorting layout.

#### Scenario: Breathing animation and bounded logs
- **GIVEN** a scrape is running
- **THEN** the AnimatedOrb renders multiple blurred circles with distinct colors that slowly rotate/scale and blend for a “breathing” gradient effect
- **AND** job capsules appear in varying positions around the orb (not stacked) and float/rotate before being absorbed, matching the animation cadence
- **AND** the capture log section maintains a fixed panel size with its own scrollbar, so append-only logs never push the overall layout taller than the shell
