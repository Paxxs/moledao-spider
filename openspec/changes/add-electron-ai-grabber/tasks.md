## Implementation Tasks
- [ ] Confirm package metadata (app name, author, contact) and expose it to both Electron main process and renderer localization layers.
- [ ] Scaffold/update the `electron-vite-project` with Electron + React + TypeScript + shadcn/ui, theme tokens, and routing for Main, Settings, About views.
- [ ] Build the Main screen idle/running/completed states with Siri-like Gaussian blur orb animation, floating job ticker, structured logs, and CTA buttons (start, settings, about, exit/open folder).
- [ ] Implement the Settings screen with folder picker, drag-and-drop ordering + visibility toggles for Location/Type/Preferences/Exp/Tag fields, jobs-per-doc slider/input, and language override (auto, zh-CN, zh-TW, en); persist preferences.
- [ ] Implement the About screen that renders localized copy plus author/contact metadata with clickable link previews.
- [ ] Implement the scraping service (list + detail fetch, lookup mapping, logging `[Company][Role]-[Preference]`) and throttle batches so each animation cycle handles 3–4 jobs.
- [ ] Generate DOCX files using the configured fields/order (company + role always first, content/time last), convert HTML content safely, batch jobs per configured count, and name files sequentially; surface “退出并打开保存的文件夹” once complete.
- [ ] Localize all user-facing strings (zh-CN, zh-TW, en) with system-locale detection and manual override; ensure typography adjusts with theme.
- [ ] Add automated tests or integration checks covering settings persistence, language fallback, scraping/logging, export batching, and animation gating logic.
