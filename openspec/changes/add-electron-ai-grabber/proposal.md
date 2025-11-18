## Why
- Non-technical recruiters need a polished desktop experience instead of a CLI spider so they can kick off scraping jobs without touching Python tooling.
- Leadership requested a modern Electron UI with Siri-like animations plus localized copy that can present Simplified/Traditional Chinese and English.
- The new workflow must keep the Word output + logging guarantees from the existing spider while adding configurable Word field ordering and folder selection.

## What Changes
- Introduce a TypeScript/Electron app under `electron-vite-project` using React + shadcn/ui that follows system light/dark themes, reads app metadata (name, author, contact) from `package.json`, and provides navigation for Main, Settings, and About screens.
- Implement the animated scraping experience: idle view with logo + CTA buttons, running state with Gaussian blur orb animation, floating job ticker, structured logs, and a completion state that surfaces “退出并打开保存的文件夹”.
- Build a Settings screen that lets users pick the Word output directory, reorder/hide middle metadata fields (Location/Type/Preferences/Exp/Tag), choose how many jobs per DOCX bundle, and override the UI language (auto, zh-CN, zh-TW, en) with persistence.
- Build an About screen that surfaces localized product copy, author information, and contact link sourced from metadata.
- Add a Node-side scraper that replays the moledao career APIs (per HAR references), logs `[Company][Role]-[Preference]`, throttles fetch cadence to sync with the animation, maps lookup tables, and exports sequentially numbered DOCX files respecting the configured field order.

## Impact
- New Electron + React + shadcn/ui dependencies plus localization tooling (`i18next` or equivalent) bundled through electron-vite.
- Adds a docx generation library and file-system access from the Electron main process; we must harden HTML sanitization and ensure sandboxing is respected.
- Requires UX validation on macOS/Windows for light/dark themes, animation performance, localization coverage, scraping accuracy, and the “open folder” workflow after exports finish.
