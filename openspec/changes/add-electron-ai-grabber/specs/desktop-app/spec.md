## ADDED Requirements

### Requirement: Electron Desktop Shell
The desktop experience MUST live inside `electron-vite-project` using Electron + Vite + React + TypeScript with shadcn/ui components and system theme awareness.

#### Scenario: App metadata drives shell chrome
- **GIVEN** the Electron app launches on macOS or Windows
- **THEN** the window title and any “logo/name” text come from `electron-vite-project/package.json` fields (`productName`, `author`, `contact`), not hard-coded constants
- **AND** the renderer auto-detects the OS light/dark theme (via `prefers-color-scheme`) while still allowing shadcn/ui tokens to update in real time
- **AND** the app exposes navigation for Main, Settings, and About screens without restarting the process

### Requirement: Main Screen Orchestration
The main view MUST present idle, running, and completed states that align with the requested CTA flow.

#### Scenario: Idle → running → completed flow
- **GIVEN** the app is idle
- **THEN** the center panel shows a branded logo/mark, localized Start Scraping button, Settings button, and About button arranged in a modern composition
- **WHEN** a scrape starts
- **THEN** the top half fades into the Siri-like orb animation (see animation requirement) and the lower half becomes a scrollable log console
- **AND** Start becomes a Pause/Disabled state while Settings/About are replaced by inline status text
- **WHEN** scraping finishes
- **THEN** a check icon replaces the animation and a localized button labeled `退出并打开保存的文件夹` in zh-CN (with zh-TW/en translations) appears beneath the logs to both exit and open the output folder

### Requirement: Siri-like Animation and Floating Job Ticker
Scraping feedback MUST combine Gaussian blur orb animation with floating job cards that match the Siri inspiration.

#### Scenario: Animation cycles per 3–4 jobs
- **GIVEN** a scrape batch is running
- **THEN** at least three overlapping circles with different accent colors are blurred (CSS filter) and slowly pulsing/scaling while shifting opacity
- **AND** the animation fades in before the first network call fires (<=500 ms delay) and fades out once the check icon appears
- **AND** every animation cycle surfaces 3–4 job cards near the orb that display `{company} · {title}` plus job type/preference text; cards fade in, linger for ~1.5–2 s, then “suck” into the orb (scale down toward the center) to signal completion
- **AND** the scraper throttles detail fetches (configurable delay ~1–1.5 s) so jobs enter the animation pipeline sequentially until all jobs are displayed

### Requirement: Settings Control Panel
Users MUST be able to configure the export folder, Word field ordering/visibility, jobs-per-document, and language preferences.

#### Scenario: Persisted settings drive exports
- **GIVEN** the Settings view is open
- **THEN** it shows:
  - A folder picker that defaults to the previous choice (or app data dir on first run)
  - A drag-and-drop list for the metadata fields between the job heading block and the content/time block (Location, Type, Preferences, Exp, Tag) with eye toggles; Company, Position, Content, and Time rows are locked
  - A numeric slider/input for “jobs per Word file” (default 10, min 1, max 20) with validation
  - A language selector with `System Default`, `简体中文`, `繁體中文 (台灣)`, and `English`
- **AND** changes persist via Electron storage (JSON file or `electron-store`) and instantly update the renderer
- **AND** the drag order + visibility are honored when the exporter builds DOCX files

### Requirement: About Screen Metadata
The About view MUST surface localized copy, author, and contact details sourced from package metadata.

#### Scenario: Author info comes from metadata
- **GIVEN** the user opens About
- **THEN** the view shows a paragraph describing the scraper, a highlighted author block that renders the name from `package.json` author metadata (MorFans), and a clickable contact link built from the metadata URL (https://i.nb.gl)
- **AND** all text participates in localization and respects light/dark themes

### Requirement: Localization and Language Override
The renderer MUST ship translations for Simplified Chinese, Traditional Chinese (Taiwan), and English; the default should follow the OS locale yet allow manual override.

#### Scenario: Locale detection with manual override
- **GIVEN** the OS locale is `zh-TW`
- **THEN** the first launch renders Traditional Chinese copy automatically
- **WHEN** the user selects English inside Settings
- **THEN** the selection persists and all screens (including logs labels, buttons, About copy, success button text) swap to English immediately
- **AND** selecting `System Default` later restores the auto-detection behavior

### Requirement: Scraper Workflow and Logging
Scraping MUST replay the moledao career APIs (per the HAR captures) from the Electron main process, map lookup tables, and emit structured logs that show progress in the renderer.

#### Scenario: Sequential job batches with logs
- **GIVEN** the user starts a scrape
- **THEN** the Electron main process loads the job list endpoint defined in `har/moledao.io_api_career_list.har` (or the live API URL) and enqueues every job ID in posted order
- **AND** for each job ID it requests the detail endpoint (per the `career_details1/2` HAR payloads), sanitizes `career.content` HTML, maps the Preferences/Type/Experience IDs via the lookup tables in `openspec/project.md`, and reduces location to country only
- **AND** each processed job pushes a log line `[Company][Role]-[PreferenceText]` to both the renderer log console and a structured logger (INFO level)
- **AND** the job queue feeds the animation ticker in groups of 3–4 with a small delay so the UI never overruns the animation

### Requirement: Word Export and Post-Run Action
The desktop app MUST export DOCX files that mirror the CLI output conventions while honoring user settings and the new completion UX.

#### Scenario: Exporting 23 jobs to customized docs
- **GIVEN** the settings specify `/Users/me/Documents/Moledao`, field order `[Location, Preferences, Type, Exp]` (Tag hidden), and 10 jobs per file
- **WHEN** 23 jobs are scraped
- **THEN** the exporter batches them into `jobs-001.docx` (jobs 1–10), `jobs-002.docx` (jobs 11–20), and `jobs-003.docx` (jobs 21–23)
- **AND** every job entry follows:
  - H1: company
  - H2: `{role} ({type text})`
  - Body fields in the configured order, skipping hidden fields
  - `content:` block containing sanitized Word paragraphs converted from the detail HTML
  - Relative time text (e.g., `13 hours ago`) followed by `time: {updateDate}`
- **AND** the exporter writes to the chosen folder, overwrites duplicates, and upon completion triggers the localized “退出并打开保存的文件夹” action that opens the folder via `shell.openPath` and closes the app (after confirming there were no errors)
