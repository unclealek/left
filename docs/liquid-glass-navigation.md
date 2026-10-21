# Liquid Glass bottom navigation

## Implementation

Left uses Expo 54.0.37, React Native 0.81.5 and `expo/AppEntry`. There is no installed Expo Router or file-based tabs layout. The existing `LeftApp` screen state and `getFooterDestination` continue to own navigation; no second navigator was introduced.

| Label | Existing destination | Existing screen behavior | SF Symbol |
| --- | --- | --- | --- |
| Home | `home` | Home | `house` / `house.fill` |
| Map | `nearby` | Feed while visible; existing venue radar while private | `map` / `map.fill` |
| Venues | `session` | Venue radar | `building.2` / `building.2.fill` |
| Profile | `account` | Me/profile hub | `person.crop.circle` / `person.crop.circle.fill` |

`LiquidGlassTabBar.tsx` is a presentation component using these existing callbacks. Its selected item comes from the existing route resolution. Tab keys and the bar remain stable across selection changes. Existing screen mounting and return-to-top behavior are preserved; this change does not add screen caching or alter deep links, auth, location, discovery, presence, or Supabase.

The floating capsule and selection surface use actual `expo-glass-effect` 0.1.10 `GlassView` instances on supported iOS builds. No opaque scrim is drawn over native glass. The selected pill moves with a native-driver spring and uses a subtle moss tint. `expo-symbols` 1.0.8 supplies native SF Symbols on iOS; other platforms retain Left's icons. Colors are scoped semantic tokens in `src/components/theme/navigation.ts`, using the requested palette without changing screen colors.

This is a custom tab control with genuine native Apple glass material, not `UITabBar` or Expo Router `NativeTabs`. SDK 54 exposes native tabs through `expo-router/unstable-native-tabs`, but adopting it here would require migrating this app's navigation. The custom control does not reproduce every system tab-bar gesture, morph or minimize-on-scroll behavior. No reference image was attached; the written visual brief guided the layout.

## Compatibility and accessibility

- iOS 26+: native glass requires both compiled and runtime availability checks to pass. This local build uses Xcode 27.0, iOS SDK 27 and Swift with `UIGlassEffect` support; the minimum deployment target remains iOS 15.1.
- Older iOS: system material blur, with a solid selection surface. This is explicitly a blur fallback, not simulated refraction.
- Android/web: solid platform-safe surfaces, existing Left icons and functional callbacks; no iOS glass probes. Android retains native press ripple.
- Reduce Transparency: solid, opaque surfaces immediately when enabled. Preferences default to the safe opaque state until read.
- Reduce Motion: no selection spring. Settings subscriptions update live and are cleaned up on unmount; delayed queries cannot overwrite newer settings.
- Appearance: app configuration and Info.plist now follow the system instead of forcing dark. Navigation has light/dark palettes; the existing app content retains its ivory design.
- Labels scale up to 1.5x and fit their full tab width. Bar height grows with font scale; full accessibility labels and selected tab roles remain available. Touch targets exceed 44 points on supported phone widths.
- The footer sits above the home-indicator inset. Scroll content reserves the actual measured footer height plus breathing room, including the existing privacy badge. Content can pass visually behind glass during scrolling and the final item can clear the bar.

## Validation

The iPhone 18 Pro simulator on iOS 27.0 built and launched successfully with the native Symbols module. Home, Map, Venues and Profile were selected through the real UI; the correct selection followed each destination. Map/Venues retained their shared private venue screen behavior. Profile was scrolled to its last content, visibly above the bar. Light and dark glass, the Reduce Transparency opaque fallback, tab selection with Reduce Motion, and larger text were checked. A larger-text clipping issue in the new tab labels was corrected with full-width labels and font fitting. Simulator accessibility/appearance/text-size settings were restored, and Home was left open.

Unit/component tests cover route callbacks, selected state, native glass vs blur/opaque surfaces, Android icon fallback, dark material, native-driver/reduced motion behavior, RTL geometry, safe-area reserve, larger text, listener cleanup and accessibility races. Changed navigation/glass compatibility code coverage exceeds 90 percent statements, branches and functions. No lint script or ESLint/Biome configuration exists; TypeScript, tests and diff whitespace checks are used. No physical iPhone, Android device or older-iOS runtime was exercised.

The simulator currently has no location configured. Venue-activity HTTP errors also occurred during launch; these do not establish live venue/provider behavior and were not changed in this navigation task.

## Run locally and on TestFlight

1. Run `npm install` and `npm run ios:simulator` (optionally pass a simulator name after `--`). The script installs pods, builds the app, starts Metro and opens it. Hot reload alone is insufficient for a binary that lacks `ExpoSymbols`.
2. Switch among all four tabs. While private, verify Map and Venues select independently on the shared venue radar. Check profile and safety return paths, and an existing gathering deep link.
3. Scroll Home and Profile to the end; check safe-area clearance and background imagery behind the bar. Test light/dark appearance, larger text, Reduce Transparency and Reduce Motion; verify VoiceOver tab labels and selection on device.
4. For TestFlight, prepare a new EAS iOS binary containing ExpoSymbols and the appearance configuration. Assign a new compatible runtime before any OTA publication: existing runtime `1.0.0` binaries may lack ExpoSymbols. Do not send this JS update to those binaries. Marketing version, build number and runtime were not bumped as part of this task; choose them during release preparation.
5. Upload the new binary and repeat navigation/accessibility/scrolling checks on a physical iPhone. No EAS build, OTA update or TestFlight upload was performed here.

Official references: [Expo SDK 54 glass effect](https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/), [Expo native tabs](https://docs.expo.dev/router/advanced/native-tabs/). SDK compatibility is also checked against the installed `expo/bundledNativeModules.json` and the installed Symbols and glass package source/types.
