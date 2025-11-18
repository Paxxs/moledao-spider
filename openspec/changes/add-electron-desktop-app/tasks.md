## 1. Planning & Specs
- [ ] 1.1 Validate existing specs/changes, select `add-electron-desktop-app`, and run `openspec validate add-electron-desktop-app --strict`
- [ ] 1.2 Finalize design for Electron architecture (main/preload/renderer, data layer, localization, storage)

## 2. Implementation
- [ ] 2.1 Scaffold `electron_app` with pnpm, Electron 30+, React 19, Vite/TypeScript, Shadcn UI, Tailwind, and lint/test tooling
- [ ] 2.2 Implement localization system (zh-CN, zh-TW, en-US) with system-language detect + manual override persisted in config
- [ ] 2.3 Build UI flows: landing, settings (folder picker + drag-sort/hide ordering UI + JD-per-doc input), about (metadata read from package.json), navigation, theming, Siri-style animation during scraping, logs, completion CTA
- [ ] 2.4 Implement scraping + word export service (HAR playback, HTTP client, field mapping, configurable batching, docx formatting, `[Company][Role]-[Preference]` logging)
- [ ] 2.5 Wire renderer actions to background scraping/export, ensure UI state updates, folder open button, graceful cancellation/exit
- [ ] 2.6 Add automated tests (unit + integration) for mapping, ordering, localization detection, docx generator, and CLI/electron IPC boundaries as feasible

## 3. Verification & Docs
- [ ] 3.1 Document how to install deps, run dev/build, configure settings, trigger scraping
- [ ] 3.2 Run lint/tests/build for the Electron app and attach evidence/logs
- [ ] 3.3 Update changelog/readme if needed and ensure `openspec validate add-electron-desktop-app --strict` passes
