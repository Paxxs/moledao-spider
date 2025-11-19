## ADDED Requirements

### Requirement: Plausible analytics instrumentation
The Electron desktop client MUST integrate Plausible via `@plausible-analytics/tracker` configured with domain `ai-grab.nb.gl` and endpoint `https://ap.apppro.dev/api/event`, emitting the standard events without blocking rendering even when the tracker fails.

#### Scenario: Track app launch
- **WHEN** the renderer finishes booting (initial navigation + localization/theme setup is complete)
- **THEN** the app initializes the tracker once per process and immediately emits an `app-launch` event to the Plausible endpoint using domain `ai-grab.nb.gl`
- **AND** failures to reach the endpoint are swallowed so the UI continues loading

#### Scenario: Track scraping start
- **WHEN** the user activates the Start Scraping control (mouse, keyboard, or equivalent automation)
- **THEN** the app emits a `start-scraping` event before jobs queue so Plausible reflects every run
- **AND** repeated runs emit additional events while a single run never double counts (button debounce or disabled state)

#### Scenario: Track About view entry
- **WHEN** the About screen gains focus (via navbar button, menu, or settings link)
- **THEN** the app emits an `open-about` event through the Plausible tracker exactly once per navigation
- **AND** the event includes metadata tying it to the About view (e.g., `props: { screen: 'about' }`)

#### Scenario: Track About link clicks
- **WHEN** the user clicks the `https://i.nb.gl` link rendered on the About screen
- **THEN** the app emits an `about-link-click` event with metadata `target: 'i.nb.gl'` before opening the external link
- **AND** the event still fires even if the default browser is blocked or the external navigation fails
