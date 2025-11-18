## ADDED Requirements
### Requirement: Electron Desktop Shell
The project MUST include a pnpm-managed Electron + React 19 + TypeScript application under `electron_app/` that renders UI with Shadcn UI components, uses Tailwind-based dark/light auto-theming, and sources the software name, author, and contact values from `package.json` metadata instead of hardcoding strings.

#### Scenario: Project scaffolding
- **GIVEN** a fresh clone
- **WHEN** developers run `pnpm install` inside `electron_app`
- **THEN** it installs Electron (latest stable), React 19, Shadcn UI, Tailwind, and tooling to build renderer/main/preload bundles with TypeScript.

#### Scenario: About view metadata
- **WHEN** the About screen renders
- **THEN** it displays the localized app description plus author/contact info read dynamically from `package.json` fields so changes in metadata propagate without code edits.

### Requirement: Primary UI Flow & Animations
The desktop app MUST expose a navigation system with at least Main, Settings, and About views, present a branded logo + action buttons before scraping starts, and during scraping play a Siri-like multi-colored Gaussian blur orb animation that fades in, shows 3–4 floating job title/company badges that get “pulled” into the orb, and ends with a success checkmark plus “Exit & Open Saved Folder” CTA after completion.

#### Scenario: Idle state actions
- **GIVEN** no scraping session is active
- **THEN** the main screen shows the logo and buttons for Start Scrape, Settings, and About using modern styling.

#### Scenario: Active scrape animation
- **WHEN** scraping is running
- **THEN** the orb animation plays, job badges fade in/out beside the orb in groups of 3–4 with slight delay, log lines stream beneath the animation, and upon completion the animation transitions to a checkmark plus the exit/open-folder button.

### Requirement: Settings & Customization
The Settings view MUST let users (a) pick the output folder, (b) configure how many jobs (JD) go into a Word file (default 10, min 1), and (c) reorder/hide metadata fields between the job H2 title and content/time blocks while keeping company, role, content, and update time fixed.

#### Scenario: Folder picker
- **WHEN** users open Settings
- **THEN** they can launch a native folder selector whose result persists to app config and is used for the next scrape.

#### Scenario: Field ordering and visibility
- **WHEN** users drag/reorder or toggle fields like Location, Type, Preferences, Experience, Tag
- **THEN** the chosen order/visibility is saved and reflected in subsequent DOCX exports while company/role/content/time remain fixed.

### Requirement: Localization & Theme
The UI MUST support Simplified Chinese (zh-CN), Traditional Chinese (zh-TW), and English (en), default to the OS locale, allow manual overrides via UI, persist the selection, and switch light/dark themes automatically while applying the same palette to all screens.

#### Scenario: Auto detect language
- **WHEN** the app launches for the first time
- **THEN** it detects the system locale and loads the matching translations if available, falling back to English otherwise.

#### Scenario: Manual override
- **WHEN** the user selects another language from the language switcher
- **THEN** the choice persists (even after restarts) and immediately updates all view texts.

### Requirement: Scraping, Logging, and Word Export
The app MUST replay the provided HAR fixtures (`har/moledao.io_api_career_list.har` plus details files) to build job batches (optionally hitting live APIs later), map preference/type/experience via the lookup tables, log every record as `[Company][Role]-[Preference]`, and emit sequential DOCX files (default 10 jobs per file, adjustable) whose internal layout matches the mandated format with location reduced to country and sanitized HTML content.

#### Scenario: Harvest & export pipeline
- **GIVEN** HAR fixtures exist
- **WHEN** the user starts scraping
- **THEN** the app parses the list -> details payloads, builds groups sized per settings, and writes `jobs-001.docx`, `jobs-002.docx`, … into the chosen folder while streaming logs to the UI.

#### Scenario: DOCX formatting rules
- **WHEN** each DOCX entry is written
- **THEN** it renders `Company` as H1, `Role (Type)` as H2, followed by `Location`, `Type`, `Preferences`, `Exp`, `Tag`, `content` (converted HTML), the relative age string, and `time` (updateDate), respecting the configurable mid-field ordering/hiding and sanitized HTML.

#### Scenario: Completion CTA
- **WHEN** exports finish without errors
- **THEN** the UI shows a success state and clicking “Exit & Open Saved Folder” terminates the app after opening the output directory in the OS file browser.
