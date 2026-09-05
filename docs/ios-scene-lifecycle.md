# iOS scene lifecycle and simulator setup

Left's native iOS project supports a single UIWindowScene. This fixes the launch
assertion when the app is built with the iOS 27 SDK. The minimum application iOS
version remains 15.1; adopting scenes does not require users to run iOS 27.

## Launch locally

```bash
npm run ios:simulator
# Optional exact simulator name or UUID:
npm run ios:simulator -- "iPhone 17 Pro"
```

Install full Xcode, an iOS simulator runtime, Node/npm, and CocoaPods first. The
launcher uses DEVELOPER_DIR when provided, otherwise checks the selected Xcode
and the standard Xcode/Xcode-beta locations. It recognizes both Simulator.app
and Xcode 27's DeviceHub.app without changing the system-wide Xcode selection.
It installs pods, starts its own Metro server on an available local port, builds
with simulator ad-hoc signing, and opens the development-client URL. Accept
Open if iOS displays a confirmation. Keep the command running while developing;
Ctrl+C stops its Metro session. Build output is in
`.expo/ios-simulator-build.log`, and derived data stays under `.expo/`.

`npm run ios` still uses the existing Expo native launcher. Expo SDK 54's
launcher expects Simulator.app, so use `ios:simulator` with Xcode 27.
Physical-device builds still require appropriate Apple signing/provisioning.

## Native integration

- Info.plist declares the single application scene and SceneDelegate.
- SceneDelegate attaches the Expo-created window to its UIWindowScene, sizes it
  to the scene, and makes it visible. AppDelegate retains the window reference
  because Expo SDK 54's development launcher accesses it during application
  startup. Starting Expo before its app-delegate subscribers is required by
  that SDK; this compatibility bridge preserves their initialization order.
- Scene URL contexts and universal-link activities are forwarded to the existing
  Expo/React Native app-delegate handlers, including scene connection events.
- Scene foreground/background/active transitions are forwarded to Expo's
  app-delegate subscribers. Process-level and background launch handling stays
  in AppDelegate. Multiple simultaneous scenes are intentionally disabled.
- The Podfile raises only dependency deployment targets below the app minimum.
  It never lowers a dependency's higher minimum version.

The native iOS project is checked in. Preserve these changes during future
Expo prebuild or SDK upgrades; do not regenerate ios/ without reviewing its diff.
This change does not upgrade Expo SDK 54 or claim complete Xcode 27 compatibility
for every feature. Replace the compatibility bridge with Expo's supported scene
integration when upgrading the SDK, and retain the lifecycle regression checks.

## Verification

Verified during this change on Xcode 27.0 (27A5252f), iPhone 17 Pro / iOS 27.0:

- Native Debug and Release simulator builds succeed without a command-line deployment-target override.
- The app renders the Left welcome screen instead of terminating at launch.
- Simulator launch command completes and Metro loads the JavaScript bundle.
- Ad-hoc signed simulator build no longer logs the missing-keychain-entitlement
  error seen in the earlier unsigned build.
- TypeScript check and all 35 existing unit tests pass.

The final interactive resume check was blocked when the host Mac locked.

Before release, verify on a signed physical-device build: Google OAuth and its
callback, session restore, background location, notifications, session expiry,
and background/foreground transitions. Also verify the minimum supported iOS
version and launch the signed Release build on a physical device; simulator builds alone do not establish
production readiness or hosted Supabase configuration.

Apple reference: https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle
