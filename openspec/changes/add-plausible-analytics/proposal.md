## Why
- Product wants visibility into how often the new Electron app is opened and how users move between Start/About before investing more UI polish.
- Plausible Analytics is already approved for this org with endpoint https://ap.apppro.dev/api/event and domain ai-grab.nb.gl, so wiring it in gives immediate dashboards without hosting new infra.
- Tracking the About CTA down to the outbound link helps confirm whether recruiters reach the i.nb.gl landing page.

## What Changes
- Add the `@plausible-analytics/tracker` dependency to the renderer bundle and initialize it with custom domain `ai-grab.nb.gl` plus API endpoint `https://ap.apppro.dev/api/event`.
- Fire analytics events for app boot, "Start Scraping" CTA, About navigation, and clicks on the https://i.nb.gl link, ensuring repeat taps only emit once per action occurrence.
- Thread the tracker through existing UI components so instrumentation remains centralized/testable and does not regress when future screens are added.

## Impact
- Introduces Plausible's client library and the associated outbound HTTPS calls; we must make sure initialization happens after the renderer is ready and failures do not block the UI.
- Requires light refactors to Main/About navigation handlers plus a shared instrumentation module; Event names and payload formats will need tests/mocks for deterministic coverage.
- QA will need to verify events in Plausible (or via mocked endpoint) on macOS and Windows to ensure the custom endpoint and domain wiring are correct.
