# Proposal: add-electron-desktop-app

## Why
Partners now need a polished desktop UI that bundles the scraper, interactive controls for sorting fields, and rich feedback (animations, localization, settings). The existing Python CLI is insufficient for non-technical recruiters, and the brand guidelines call for an Electron-based experience with Siri-like capture animations plus multi-language support.

## What
- Build a new Electron + React 19 + TypeScript app under `electron_app/` managed by pnpm and Shadcn UI.
- Main view idles with logo/actions, animates a Siri-style capture visualization during scraping, streams logs, surfaces floating job cards, and exposes an "Exit & Open Folder" button once exports finish.
- Settings view allows selecting an output folder, customizing JD-per-Word batch size (default 10), and drag-and-drop ordering + visibility toggles for all metadata fields except company/title/content/time.
- About view renders descriptions using metadata stored in `package.json` (software name, author name, author contact) rather than hardcoding strings.
- Implement localization (Simplified Chinese default, Traditional Chinese, English) and auto-follow system language with user override persisted in config.
- Scraping engine replays the provided HAR files (list + details), optionally hits the live endpoints later, converts payloads via the lookup tables, logs `[Company][Role]-[Preference]`, and produces DOCX bundles (10 jobs each by default, configurable) with the mandated formatting.
- Word exports honor field ordering, sanitize HTML content, respect tag+location requirements, and save sequential filenames; completion state triggers UI success and folder shortcut.

## Impact
- Adds a full desktop UI stack plus build scripts.
- Introduces a Node/Electron-based scraping/export pipeline separate from the Python CLI.
- Requires documenting build/run steps, localization files, and configuration storage for settings + language.
