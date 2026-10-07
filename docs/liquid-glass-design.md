# LEFT Liquid Glass implementation

## Design plan and revision

The navigation bar is the single prominent glass surface: regular Liquid Glass, theme ink tint (`T.glassDark`), 24pt corners and a restrained light border (`T.glassBorderDark`). The solid moss active bubble (`T.primary`) and white icon (`T.navActiveContent`) keep selection legible as poster content moves behind it. Existing spring tension 170, friction 18 and the lifted-bubble positioning are unchanged.

Home's tappable person, venue, gathering and safety cards use quieter clear glass with `T.glassLight`, plus a `T.glassLightMedium` backing to preserve ink contrast. Card radii remain 22/24pt; inline visibility controls retain 14/15pt corners. Illustrated artwork remains opaque and crisp. Typography remains Manrope. All colors come from the existing `T` export in `leftTheme.ts`; no new palette values were introduced.

Revision against the risograph brief: rejected a generic all-clear pill and removed the previous synthetic specular gradient. The ink-tinted bar sits over the illustration like a translucent overlay on a printed poster. The cards are deliberately lower contrast in treatment, leaving the tab bar as the memorable glass moment. No GlassContainer is needed: the tab bar is one glass surface, and the solid active bubble should not merge with neighboring controls.

## Implementation

- `LeftGlass` centralizes style, tint, radius, interactive behavior, theme backing and platform fallback.
- Both `isLiquidGlassAvailable()` and `isGlassEffectAPIAvailable()` must pass on iOS. Missing native modules are caught during probing.
- Reduce Transparency is read conservatively before enabling glass and monitored for changes. Other platforms and unsupported runtimes use solid ink/white theme surfaces.
- Home card Pressables remain responsible for actions and accessibility. Their native glass has `isInteractive` enabled. The wrapper keys this native view when interactive mode changes, matching the package's mount-time constraint.
- The footer uses a background glass layer with content outside its clipping area, preserving the lifted active bubble. Tab order, destinations, navigation callbacks and spring settings are unchanged.
- Touch targets are at least 44pt. The existing bottom inset is retained. Main content extends behind the footer, with equivalent additional bottom content padding so the final controls can scroll clear of it.

## Packages and native builds

Installed `expo-glass-effect ~0.1.10`, selected for Expo SDK 54 with:

```sh
npx expo install expo-glass-effect
pod install --project-directory=ios
```

Existing LEFT development clients need a native rebuild to include this module; a Metro reload is not sufficient. Expo Go includes the library, but it is not a replacement for validating LEFT's custom native client. Liquid Glass requires supported iOS hardware/runtime and a compatible native build (iOS 26+ and Xcode 26+); the wrapper handles unavailable effects.

The local iOS simulator development build was rebuilt successfully and installed on the iPhone 17 Pro simulator. No production app, backend or remote deployment was changed. For another local development build, the existing project command is:

```sh
npm run ios:simulator
```

Reference: https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/

## Potential clashes

- Opaque backgrounds inside glass hide the effect. Home's former card fills/shadows are overridden by `homeGlassContent`; image areas intentionally remain opaque. Visibility controls inside the existing white presence card will look especially subtle because they sample a plain surface.
- Applying opacity below 1 to GlassView or an ancestor breaks native rendering. Glass-card pressed styles use translation instead. Plain non-glass links retain their previous feedback.
- Ancestor clipping can crop the lifted tab bubble. The footer's native glass is a separate background layer, and its outer layout remains unclipped.
- A scroll view ending above the footer leaves nothing interesting to refract. Its bottom margin was replaced with content padding to allow the existing imagery behind the bar.
- Readability backing intentionally softens the transparency. Clear glass without that backing would be unreliable over dark/high-detail illustrations.
- This is not a new application-wide dark theme. The light/dark fixture checks cover the glass surfaces and their content, not every surrounding screen heading.

## Validation

- `npm run typecheck`: passes.
- `npm test`: 136 tests across 25 files pass.
- Five compatibility tests cover Android/web, Reduce Transparency, compiled/runtime availability and missing-module exceptions. Compatibility helper coverage is 100% for statements, branches, functions and lines.
- Production bundle exports for web, iOS and Android pass.
- CocoaPods installed ExpoGlassEffect 0.1.10; native Xcode simulator build succeeds.
- iPhone 17 Pro/iOS 27 fixture: native availability confirmed; Home/Map/Venues/Profile selection checked; active indicator visible; person-card callback checked; glass controls visually checked over light and dark backdrops.
- Web fixture: solid fallback rendered; four tab controls exercised and their 44pt height measured.
- Tests use isolated synthetic data; no paid actor calls or real presence changes. Older-iOS/Android device rendering and an actual Reduce Transparency settings toggle were not tested on devices; their branch selection is covered by unit tests.

## Scope note

The workspace already contained auth/security and dependency changes. Those have not been committed or folded into this task. The full package files in the handoff reflect the current workspace, including those earlier edits; the glass-specific dependency addition is only expo-glass-effect. The Podfile.lock diff adds only ExpoGlassEffect.
