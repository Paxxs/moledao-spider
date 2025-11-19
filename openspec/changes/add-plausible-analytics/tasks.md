## Implementation Tasks
- [x] Add `@plausible-analytics/tracker` to the renderer bundle plus a shared analytics helper that reads the custom `ai-grab.nb.gl` domain and `https://ap.apppro.dev/api/event` endpoint from config.
- [x] Fire an `app-launch` event exactly once per renderer boot after localization/theme setup completes.
- [x] Instrument the Start Scraping CTA so every run dispatches a `start-scraping` event before jobs queue, even if the button is triggered from keyboard shortcuts.
- [x] Emit an `open-about` event whenever navigation enters the About screen (button press or settings link) and a separate `about-link-click` event tagged with `target: i.nb.gl` when the https://i.nb.gl link is clicked.
- [x] Add automated tests/mocks proving that events are called with the right names and payloads during boot, Start CTA, About navigation, and link clicks without making live network calls.
