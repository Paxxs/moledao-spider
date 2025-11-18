## ADDED Requirements

### Requirement: Theme Preference Selector
The desktop app MUST let users force light/dark mode or follow the OS from Settings while still defaulting to system detection on first launch.

#### Scenario: Theme override persists
- **GIVEN** the Settings view is open
- **THEN** it SHALL display a localized selector with options `System`, `Light`, and `Dark` and default to `System` on fresh installs
- **WHEN** the user selects `Light` or `Dark`
- **THEN** the renderer SHALL immediately swap the root theme class (without reload) and persist the choice so future launches honor the override even if the OS theme differs
- **AND** choosing `System` later returns to automatic `prefers-color-scheme` detection

### Requirement: Animated Tab Transitions
Switching between Main, Settings, and About tabs MUST include a subtle animation consistent with the rest of the UI motion.

#### Scenario: Tabs fade between panes
- **GIVEN** the user clicks a different top-level tab
- **THEN** the corresponding panel SHALL animate (e.g., fade/slide) into view while the previous one animates out, taking <=300 ms and not blocking interactions inside the active pane
- **AND** the animation SHALL respect the drag regions and not reflow the layout; keyboard navigation between tabs MUST still work with the same motion cues
