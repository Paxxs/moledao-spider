## Why
- Users now want to force the UI into dark/light mode instead of always following the OS so they can grab content in lighting-constrained demo rooms.
- The existing tabs swap instantly with no animation, which feels abrupt compared to the rest of the Siri-inspired motion system.
- Settings already exposes language/output controls, making it the natural place to surface theme overrides.

## What Changes
- Extend application settings (renderer + Electron store) with a `theme` preference that supports `system`, `light`, and `dark`, defaulting to system detection while allowing instant overrides in the UI.
- Update the Settings screen with a localized selector for theme mode and wire it to the renderer so switching modes immediately re-themes the shell using the existing CSS token classes.
- Enhance the tabs component/layout with a subtle transition (e.g., fade/slide) so content panes animate when switching between Main/Settings/About without regressing drag regions.

## Impact
- Changes touch shared settings types, preload IPC payloads, the renderer store, and the `useSystemTheme` hook to respect manual overrides; localization files gain new strings.
- Tab animation may require lightweight CSS or a `framer-motion` helper but no new dependencies; verify performance since panes include complex components.
- Need regression testing across OSes to ensure the stored theme persists, still defaults to system on first launch, and tab animations don’t interfere with existing keyboard navigation.
