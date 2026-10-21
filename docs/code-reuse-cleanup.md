# Code cleanup and component reuse audit

Checked on 2026-10-18 against the current checkout, preserving the existing uncommitted navigation and popular-times changes.

## Findings

Shared UI is already used across the app. The problem was a mix of retired code and a few repeated implementations, rather than a new copy of every component for every screen. This pass checked 212 TS/TSX/JS modules across mobile, admin, backend function entrypoints, tests and scripts. Counts below describe distinct runtime-reachable source files using a component in JSX; they are not call counts or a guarantee that every possible duplicate was found.

| Existing component | Runtime consumer files |
| --- | ---: |
| `LeftIcon` | 17 |
| `PrimaryButton` | 9 |
| `SelectChip` | 7 |
| `LeftLogoMark` | 7 |
| `GlassSurface` | 7 |
| `ScreenHeader` | 7 |
| `GhostButton` | 6 |
| `BackNavButton` | 4 |
| `LeftAvatar` | 3 |
| `LeftLoadingAnimation` | 3 |
| `SafetyActionButton` | 3 |

## Consolidated

- **Native glass:** `GlassMaterial` in the existing `components/glass/LeftGlass.tsx` now owns native availability, native material and blur/opaque fallback rendering. Both the established `LeftGlass` cards and `LiquidGlassTabBar` consume it. Card tint, rounded scrim, content styles and navigation appearance were retained. The obsolete dark-navigation branch in `LeftGlass` was removed.
- **Accessibility preferences:** one shared hook implementation in `use-navigation-accessibility.ts` now serves transparency for both glass wrappers and motion for navigation, loading, auth/onboarding animation and ambient scribbles. It handles safe defaults, live updates, cleanup and delayed-query races. It does not start motion or expose transparent content before a supported preference has been read.
- **UUID validation:** `src/lib/validation.ts` replaces ten duplicated validators, including gathering-link validation, with one tested string type guard. The existing UUID v1–v5 policy, case handling and rejection of whitespace/invalid variants are preserved. Database RPC bodies, authentication and authorization were not redesigned.
- **Venue artwork:** Home and venue details share the image registry and artwork selection function in `venue-illustrations.ts`. Their existing name-inference differences (including Oodi in venue details) and distance copy remain unchanged.
- **Local SQL checks:** the popular-times runner now includes the approved indefinite-cache migration. Older SQL assertions now expect ready-cache reuse indefinitely while still checking failed retries, lease recovery and budgets. All checks run in isolated PGlite; no migration or SQL change was applied remotely during this cleanup.

New shared helpers were introduced only to replace repeated implementations with existing consumers. Screen-specific compositions stay local; a different layout is not automatically a duplicate. `GlassSurface` retains its existing token-based blur treatment, while `LeftGlass` wraps native glass. They serve different visual contracts and share preference handling. The two LeftLogoMark paths point to one implementation; the forwarding file is not a second logo component.

## Removed code inside existing files

- Unused `StatusPill` and `EnergyPill` components.
- Unreferenced `AvatarScreen` and `CompleteScreen` exports. The active profile/consent/location onboarding remains; legacy persisted `avatar` and `complete` draft steps still map to their supported replacement screens.
- The unused `legal` and `onboarding-avatar` literals from the local screen union. Draft-storage compatibility types were retained.
- The unused tile/preview sizing branches in the onboarding avatar helper.
- Four old navigation color tokens and the unused `glassRadii.navigation` entry.
- The public export of `UtilityIconButton`, which remains an internal implementation reused by `SafetyActionButton`.
- 207 top-level unreferenced style definitions across 13 existing files:

| Style module | Definitions removed |
| --- | ---: |
| `src/components/styles/ui.ts` | 5 |
| `src/components/styles/layout.ts` | 3 |
| `src/components/styles/forms.ts` | 4 |
| `src/components/styles/live.ts` | 6 |
| `src/components/styles/features/auth.ts` | 11 |
| `src/components/styles/features/loading.ts` | 4 |
| `src/components/styles/features/home.ts` | 84 |
| `src/components/styles/features/venue.ts` | 4 |
| `src/components/styles/features/onboarding.ts` | 72 |
| `src/components/styles/features/profile.ts` | 7 |
| `src/components/styles/features/activation.ts` | 2 |
| `src/components/styles/features/venue-detail.ts` | 4 |
| `src/components/styles/features/settings.ts` | 1 |

Styles were checked as top-level definitions against source property accesses, literal keys and destructuring; dynamic access was inspected. Nested React Native style properties such as `shadowOffset` are not dead classes and were retained. TypeScript then checked all mobile consumers after pruning. The three reviewed unused files were subsequently removed after explicit user approval.

## Approved whole-file removals

| File | Evidence and impact |
| --- | --- |
| `src/screens/left/LegalScreen.tsx` | No source importer, runtime renderer or dynamic route reference. Legal links currently open the approved website from `LeftApp`. Removed this retired reader without removing legal config, consent records or acceptance checks. |
| `src/screens/left/home-presence.ts` | Only imported by its test. The current Home screen does not call this former count helper. |
| `src/screens/left/home-presence.test.ts` | Only tested that retired helper; removed together with it. |

The user approved these removals on 2026-10-18. All three files have now been removed; active legal links, consent handling and presence behavior remain in place.

## False positives and retained code

- `auth-storage.native.ts` is selected by Metro's platform resolution; it is not unused just because TypeScript's default resolver sees `auth-storage.ts`.
- `secure-session-storage.ts` is used by the native storage adapter and its tests; retain both.
- `location-task.ts` is a side-effect import from App.tsx and registers background location.
- App.tsx, admin/src/main.tsx, scripts and deployed Edge Function index files are independent entrypoints.
- Declaration files, native resources, images/SVGs, migration history, operational scripts, provider rollback options and the admin app were retained. Native module dependencies were not removed based solely on JS imports.
- Legal content/config/types remain in use by onboarding/settings/account services. Removing the retired reader would not justify deleting those modules.

## Validation and limits

- TypeScript: passed with existing no-unused-locals/no-unused-parameters checks.
- Vitest: 311 tests across 51 files passed after approved removal (three tests exclusively covered the retired helper), including shared identifier validation, glass selection/fallbacks, card styling and preference races.
- Focused changed-code coverage: 95.08% statements, 93.75% branches, 90% functions, 98.14% lines.
- Admin production build: passed (`tsc -b` and Vite).
- Isolated PostgreSQL: all three popular-times SQL suites plus authenticated read/write/RPC permission assertions passed. PGlite was installed only under /tmp; no dependency was added to the app for this check.
- Native build: BUILD SUCCEEDED on iPhone 18 Pro / iOS 27.0. Restored the existing session, selected Home, Map, Venues and Profile, and checked Home cards/tab glass and the Reduce Transparency fallback. Simulator setting restored; Home left open.
- No lint configuration is present; diff whitespace checks passed. Android, older iOS, physical-device behavior and every onboarding interaction were not exhaustively re-exercised.
- Local cleanup only: no deployment, TestFlight/OTA publication, remote data change, commit or push was performed for this cleanup.

## Reuse rule for subsequent changes

Before adding UI, check the existing button, glass, icon/avatar, header and ui.tsx primitives. Prefer a supported variant of an existing component. Extract shared behavior when two concrete consumers need it, and keep one implementation. Reserve new screen components for distinct screen responsibilities; do not create a parallel design system or copy a service validator into another file. Check platform/side-effect/test entrypoints before labeling a file unused.
