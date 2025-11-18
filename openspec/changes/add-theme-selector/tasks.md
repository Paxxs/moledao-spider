## 1. Implementation
- [ ] 1.1 Extend `AppSettings` + Electron settings store to include a `theme` preference (`system|light|dark`) with migrations/defaulting and ensure IPC payloads carry the new field.
- [ ] 1.2 Update `useSystemTheme`, the renderer settings store, and i18n resources plus Settings UI so users can choose/persist their preferred theme.
- [ ] 1.3 Add animated tab transitions (fade/slide) in the Tabs component/layout and validate they work for all three panes without breaking drag regions.
- [ ] 1.4 Run lint/tests (or manual verification) in light/dark/system modes to confirm theming + animations behave as expected.
