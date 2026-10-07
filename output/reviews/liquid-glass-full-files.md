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


# Complete changed files

These are full current files, not excerpts. Package files retain pre-existing workspace edits as noted above.

## docs/liquid-glass-design.md

````markdown
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

````

## package.json

````json
{
  "name": "left-mobile",
  "version": "0.1.0",
  "private": true,
  "main": "expo/AppEntry",
  "expo": {
    "doctor": {
      "appConfigFieldsNotSyncedCheck": {
        "enabled": false
      }
    }
  },
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "web": "expo start --web",
    "admin:web": "npm --prefix admin run dev",
    "admin:build": "npm --prefix admin run build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:popular-times:live": "node scripts/test-popular-times-live.mjs",
    "ios:simulator": "node scripts/ios-simulator.mjs",
    "test:popular-times:coverage": "vitest run --coverage --coverage.include='src/features/activity/popular-times-{model,subscription}.ts' --coverage.include='supabase/functions/_shared/popular-times-{provider,job}.ts' --coverage.include='supabase/functions/_shared/bounded-json.ts' --coverage.include='supabase/functions/get-popular-times/index.ts' --coverage.thresholds.lines=80 --coverage.thresholds.statements=80 --coverage.thresholds.functions=80 --coverage.thresholds.branches=80 --coverage.reportsDirectory=/tmp/left-popular-times-coverage"
  },
  "dependencies": {
    "@expo-google-fonts/manrope": "^0.4.2",
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@rnmapbox/maps": "^10.3.2",
    "@supabase/supabase-js": "^2.106.2",
    "expo": "~54.0.37",
    "expo-apple-authentication": "~8.0.8",
    "expo-auth-session": "~7.0.11",
    "expo-blur": "~15.0.8",
    "expo-crypto": "~15.0.9",
    "expo-dev-client": "~6.0.21",
    "expo-font": "~14.0.12",
    "expo-glass-effect": "~0.1.10",
    "expo-image-manipulator": "~14.0.8",
    "expo-image-picker": "~17.0.11",
    "expo-linear-gradient": "~15.0.8",
    "expo-linking": "~8.0.12",
    "expo-location": "~19.0.8",
    "expo-notifications": "~0.32.17",
    "expo-status-bar": "~3.0.8",
    "expo-task-manager": "~14.0.9",
    "expo-web-browser": "~15.0.11",
    "mapbox-gl": "^2.15.0",
    "react": "19.1.0",
    "react-dom": "^19.1.0",
    "react-native": "0.81.5",
    "react-native-safe-area-context": "5.6.0",
    "react-native-svg": "15.12.1",
    "react-native-svg-transformer": "^1.5.3",
    "react-native-url-polyfill": "^3.0.0",
    "react-native-web": "^0.21.2"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.1.10",
    "@vitest/coverage-v8": "4.1.11",
    "babel-preset-expo": "~54.0.10",
    "typescript": "~5.9.2",
    "vitest": "4.1.11",
    "image-size": "file:tooling/metro-image-size"
  },
  "overrides": {
    "postcss": "8.5.28",
    "xcode": {
      "uuid": "11.1.1"
    },
    "image-size": "$image-size"
  }
}

````

## package-lock.json

````json
{
  "name": "left-mobile",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "left-mobile",
      "version": "0.1.0",
      "dependencies": {
        "@expo-google-fonts/manrope": "^0.4.2",
        "@expo/vector-icons": "^15.0.3",
        "@react-native-async-storage/async-storage": "2.2.0",
        "@rnmapbox/maps": "^10.3.2",
        "@supabase/supabase-js": "^2.106.2",
        "expo": "~54.0.37",
        "expo-apple-authentication": "~8.0.8",
        "expo-auth-session": "~7.0.11",
        "expo-blur": "~15.0.8",
        "expo-crypto": "~15.0.9",
        "expo-dev-client": "~6.0.21",
        "expo-font": "~14.0.12",
        "expo-glass-effect": "~0.1.10",
        "expo-image-manipulator": "~14.0.8",
        "expo-image-picker": "~17.0.11",
        "expo-linear-gradient": "~15.0.8",
        "expo-linking": "~8.0.12",
        "expo-location": "~19.0.8",
        "expo-notifications": "~0.32.17",
        "expo-status-bar": "~3.0.8",
        "expo-task-manager": "~14.0.9",
        "expo-web-browser": "~15.0.11",
        "mapbox-gl": "^2.15.0",
        "react": "19.1.0",
        "react-dom": "^19.1.0",
        "react-native": "0.81.5",
        "react-native-safe-area-context": "5.6.0",
        "react-native-svg": "15.12.1",
        "react-native-svg-transformer": "^1.5.3",
        "react-native-url-polyfill": "^3.0.0",
        "react-native-web": "^0.21.2"
      },
      "devDependencies": {
        "@babel/core": "^7.25.2",
        "@types/react": "~19.1.10",
        "@vitest/coverage-v8": "4.1.11",
        "babel-preset-expo": "~54.0.10",
        "image-size": "file:tooling/metro-image-size",
        "typescript": "~5.9.2",
        "vitest": "4.1.11"
      }
    },
    "node_modules/@0no-co/graphql.web": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@0no-co/graphql.web/-/graphql.web-1.3.4.tgz",
      "integrity": "sha512-imSwulOeDQodRy/olQmVEo2PiY6ntjkZ9eiGdw6lMYylh/tay9b7MusyJBmEnkL8GiKRKr6ltr+D42mY5bd8Bg==",
      "license": "MIT",
      "peerDependencies": {
        "graphql": "^14.0.0 || ^15.0.0 || ^16.0.0 || ^17.0.0"
      },
      "peerDependenciesMeta": {
        "graphql": {
          "optional": true
        }
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz",
      "integrity": "sha512-RgHBCvtjbOK2gXSNBNIkNoEc9qoVEtau3hj8gEqKQuL3HZAibKarWFEI3Lfm6EYKkLalOh8eSrj9b+ch9H/VBA==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.7",
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helpers": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.8.tgz",
      "integrity": "sha512-gZbepsdh3WDtgZKWL+vTPh71LSBrm/Y4/QDZBVCcYfmeTEEuoOYwlSy+G1StfJg+/Zy550u/3TATbm7qDbbMtg==",
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.8",
        "@babel/types": "^7.29.8",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-annotate-as-pure": {
      "version": "7.27.3",
      "resolved": "https://registry.npmjs.org/@babel/helper-annotate-as-pure/-/helper-annotate-as-pure-7.27.3.tgz",
      "integrity": "sha512-fXSwMQqitTGeHLBC08Eq5yXz2m37E4pJX1qAU1+2cNedz/ifv/bVXft90VeSav5nFO61EcNgwr0aJxbyPaWBPg==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.27.3"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz",
      "integrity": "sha512-wem6WaBj4NaVYVdNhLPPVacES6ZJ+KBBfSkTMD3YZxbP3rm3Di85tJU5ljaUNhaOynt+Aj0xruhYuzQBt8n71g==",
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-create-class-features-plugin": {
      "version": "7.29.3",
      "resolved": "https://registry.npmjs.org/@babel/helper-create-class-features-plugin/-/helper-create-class-features-plugin-7.29.3.tgz",
      "integrity": "sha512-RpLYy2sb51oNLjuu1iD3bwBqCBWUzjO0ocp+iaCP/lJtb2CPLcnC2Fftw+4sAzaMELGeWTgExSKADbdo0GFVzA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.27.3",
        "@babel/helper-member-expression-to-functions": "^7.28.5",
        "@babel/helper-optimise-call-expression": "^7.27.1",
        "@babel/helper-replace-supers": "^7.28.6",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.27.1",
        "@babel/traverse": "^7.29.0",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-create-regexp-features-plugin": {
      "version": "7.28.5",
      "resolved": "https://registry.npmjs.org/@babel/helper-create-regexp-features-plugin/-/helper-create-regexp-features-plugin-7.28.5.tgz",
      "integrity": "sha512-N1EhvLtHzOvj7QQOUCCS3NrPJP8c5W6ZXCHDn7Yialuy1iu4r5EmIYkXlKNqT99Ciw+W0mDqWoR6HWMZlFP3hw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.27.3",
        "regexpu-core": "^6.3.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-define-polyfill-provider": {
      "version": "0.6.8",
      "resolved": "https://registry.npmjs.org/@babel/helper-define-polyfill-provider/-/helper-define-polyfill-provider-0.6.8.tgz",
      "integrity": "sha512-47UwBLPpQi1NoWzLuHNjRoHlYXMwIJoBf7MFou6viC/sIHWYygpvr0B6IAyh5sBdA2nr2LPIRww8lfaUVQINBA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-compilation-targets": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6",
        "debug": "^4.4.3",
        "lodash.debounce": "^4.0.8",
        "resolve": "^1.22.11"
      },
      "peerDependencies": {
        "@babel/core": "^7.4.0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-member-expression-to-functions": {
      "version": "7.28.5",
      "resolved": "https://registry.npmjs.org/@babel/helper-member-expression-to-functions/-/helper-member-expression-to-functions-7.28.5.tgz",
      "integrity": "sha512-cwM7SBRZcPCLgl8a7cY0soT1SptSzAlMH39vwiRpOQkJlh53r5hdHwLSCZpQdVLT39sZt+CRpNwYG4Y2v77atg==",
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.28.5",
        "@babel/types": "^7.28.5"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz",
      "integrity": "sha512-UPUVSyXbOh627KiCIGQSgwWzGeBKLkaJ9PJEdrngIwMSzxLR4jS4+f1f1jb7VzBbg8nFLaYotvVPFCTqdrmTAg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-optimise-call-expression": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-optimise-call-expression/-/helper-optimise-call-expression-7.27.1.tgz",
      "integrity": "sha512-URMGH08NzYFhubNSGJrpUEphGKQwMQYBySzat5cAByY1/YgIRkULnIy3tAMeszlL/so2HbeilYloUmSpd7GdVw==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.28.6.tgz",
      "integrity": "sha512-S9gzZ/bz83GRysI7gAD4wPT/AI3uCnY+9xn+Mx/KPs2JwHJIz1W8PZkg2cqyt3RNOBM8ejcXhV6y8Og7ly/Dug==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-remap-async-to-generator": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-remap-async-to-generator/-/helper-remap-async-to-generator-7.27.1.tgz",
      "integrity": "sha512-7fiA521aVw8lSPeI4ZOD3vRFkoqkJcS+z4hFo82bFSH/2tNd6eJ5qCVMS5OzDmZh/kaHQeBaeyxK6wljcPtveA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.27.1",
        "@babel/helper-wrap-function": "^7.27.1",
        "@babel/traverse": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-replace-supers": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-replace-supers/-/helper-replace-supers-7.28.6.tgz",
      "integrity": "sha512-mq8e+laIk94/yFec3DxSjCRD2Z0TAjhVbEJY3UQrlwVo15Lmt7C2wAUbK4bjnTs4APkwsYLTahXRraQXhb1WCg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-member-expression-to-functions": "^7.28.5",
        "@babel/helper-optimise-call-expression": "^7.27.1",
        "@babel/traverse": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-skip-transparent-expression-wrappers": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-skip-transparent-expression-wrappers/-/helper-skip-transparent-expression-wrappers-7.27.1.tgz",
      "integrity": "sha512-Tub4ZKEXqbPjXgWLl2+3JpQAYBJ8+ikpQ2Ocj/q/r0LwE3UhENh7EUabyHjz2kCEsrRY83ew2DQdHluuiDQFzg==",
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.27.1",
        "@babel/types": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz",
      "integrity": "sha512-Pb5ijPrZ89GDH8223L4UP8i6QApWxs04RbPQJTeWDV0/keR2E36MeKnyr6LYmUUvqRRI+Iv87SuF1W6ErINzYw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-wrap-function": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-wrap-function/-/helper-wrap-function-7.28.6.tgz",
      "integrity": "sha512-z+PwLziMNBeSQJonizz2AGnndLsP2DeGHIxDAn+wdHOGuo4Fo1x1HBPPXeE9TAOPHNNWQKCSlA2VZyYyyibDnQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.28.6",
        "@babel/traverse": "^7.28.6",
        "@babel/types": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.7.tgz",
      "integrity": "sha512-1k2lAGRMfHTcwuNYcCNUmaUffmQv8KWMfh2iJUUeRlwlwH4FdNG7mfPI10NPfLHJFThE4Tyr4mv7kTNZOiPuBg==",
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/highlight": {
      "version": "7.25.9",
      "resolved": "https://registry.npmjs.org/@babel/highlight/-/highlight-7.25.9.tgz",
      "integrity": "sha512-llL88JShoCsth8fF8R4SJnIn+WLvR6ccFxu1H3FlMhDontdcmZWf2HgIZ7AIqV3Xcck1idlohrN4EUBQz6klbw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.25.9",
        "chalk": "^2.4.2",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.0.0"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/highlight/node_modules/ansi-styles": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-3.2.1.tgz",
      "integrity": "sha512-VT0ZI6kZRdTh8YyJw3SMbYm/u+NqfsAxEpWO0Pf9sq8/e94WxxOpPKx9FR1FlyCtOVDNOQ+8ntlqFxiRc+r5qA==",
      "license": "MIT",
      "dependencies": {
        "color-convert": "^1.9.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/@babel/highlight/node_modules/chalk": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-2.4.2.tgz",
      "integrity": "sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==",
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^3.2.1",
        "escape-string-regexp": "^1.0.5",
        "supports-color": "^5.3.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/@babel/highlight/node_modules/color-convert": {
      "version": "1.9.3",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-1.9.3.tgz",
      "integrity": "sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==",
      "license": "MIT",
      "dependencies": {
        "color-name": "1.1.3"
      }
    },
    "node_modules/@babel/highlight/node_modules/color-name": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.3.tgz",
      "integrity": "sha512-72fSenhMw2HZMTVHeCA9KCmpEIbzWiQsjN+BHcBbS9vr1mtt+vJjPdksIBNUmKAW8TFUDPJK5SUU3QhE9NEXDw==",
      "license": "MIT"
    },
    "node_modules/@babel/highlight/node_modules/escape-string-regexp": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz",
      "integrity": "sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.8.0"
      }
    },
    "node_modules/@babel/highlight/node_modules/has-flag": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-3.0.0.tgz",
      "integrity": "sha512-sKJf1+ceQBr4SMkvQnBDNDtf4TXpVhVGateu0t918bl30FnbE2m4vNLX+VWe/dpjlb+HugGYzW7uQXH98HPEYw==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/@babel/highlight/node_modules/supports-color": {
      "version": "5.5.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-5.5.0.tgz",
      "integrity": "sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==",
      "license": "MIT",
      "dependencies": {
        "has-flag": "^3.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.8.tgz",
      "integrity": "sha512-E8lTAYNB1KW+FH+VGJuZM1ioAx2E6oVlvQFRrf5P8ZZmsiJXYAD9vTFV7yyEURNzgh1dFqMZuO6tUwcARbqFCA==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.8"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-proposal-decorators": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/plugin-proposal-decorators/-/plugin-proposal-decorators-7.29.0.tgz",
      "integrity": "sha512-CVBVv3VY/XRMxRYq5dwr2DS7/MvqPm23cOCjbwNnVrfOqcWlnefua1uUs0sjdKOGjvPUG633o07uWzJq4oI6dA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-class-features-plugin": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/plugin-syntax-decorators": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-proposal-export-default-from": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-proposal-export-default-from/-/plugin-proposal-export-default-from-7.27.1.tgz",
      "integrity": "sha512-hjlsMBl1aJc5lp8MoCDEZCiYzlgdRAShOjAfRw6X+GlpLpUPU7c3XNLsKFZbQk/1cRzBlJ7CXg3xJAJMrFa1Uw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-async-generators": {
      "version": "7.8.4",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-async-generators/-/plugin-syntax-async-generators-7.8.4.tgz",
      "integrity": "sha512-tycmZxkGfZaxhMRbXlPXuVFpdWlXpir2W4AMhSJgRKzk/eDlIXOhb2LHWoLpDF7TEHylV5zNhykX6KAgHJmTNw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-bigint": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-bigint/-/plugin-syntax-bigint-7.8.3.tgz",
      "integrity": "sha512-wnTnFlG+YxQm3vDxpGE57Pj0srRU4sHE/mDkt1qv2YJJSeUAec2ma4WLUnUPeKjyrfntVwe/N6dCXpU+zL3Npg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-class-properties": {
      "version": "7.12.13",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-class-properties/-/plugin-syntax-class-properties-7.12.13.tgz",
      "integrity": "sha512-fm4idjKla0YahUNgFNLCB0qySdsoPiZP3iQE3rky0mBUtMZ23yDJ9SJdg6dXTSDnulOVqiF3Hgr9nbXvXTQZYA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.12.13"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-class-static-block": {
      "version": "7.14.5",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-class-static-block/-/plugin-syntax-class-static-block-7.14.5.tgz",
      "integrity": "sha512-b+YyPmr6ldyNnM6sqYeMWE+bgJcJpO6yS4QD7ymxgH34GBPNDM/THBh8iunyvKIZztiwLH4CJZ0RxTk9emgpjw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.14.5"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-decorators": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-decorators/-/plugin-syntax-decorators-7.28.6.tgz",
      "integrity": "sha512-71EYI0ONURHJBL4rSFXnITXqXrrY8q4P0q006DPfN+Rk+ASM+++IBXem/ruokgBZR8YNEWZ8R6B+rCb8VcUTqA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-dynamic-import": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-dynamic-import/-/plugin-syntax-dynamic-import-7.8.3.tgz",
      "integrity": "sha512-5gdGbFon+PszYzqs83S3E5mpi7/y/8M9eC90MRTZfduQOYW76ig6SOSPNe41IG5LoP3FGBn2N0RjVDSQiS94kQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-export-default-from": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-export-default-from/-/plugin-syntax-export-default-from-7.28.6.tgz",
      "integrity": "sha512-Svlx1fjJFnNz0LZeUaybRukSxZI3KkpApUmIRzEdXC5k8ErTOz0OD0kNrICi5Vc3GlpP5ZCeRyRO+mfWTSz+iQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-flow": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-flow/-/plugin-syntax-flow-7.28.6.tgz",
      "integrity": "sha512-D+OrJumc9McXNEBI/JmFnc/0uCM2/Y3PEBG3gfV3QIYkKv5pvnpzFrl1kYCrcHJP8nOeFB/SHi1IHz29pNGuew==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-import-attributes": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-import-attributes/-/plugin-syntax-import-attributes-7.28.6.tgz",
      "integrity": "sha512-jiLC0ma9XkQT3TKJ9uYvlakm66Pamywo+qwL+oL8HJOvc6TWdZXVfhqJr8CCzbSGUAbDOzlGHJC1U+vRfLQDvw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-import-meta": {
      "version": "7.10.4",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-import-meta/-/plugin-syntax-import-meta-7.10.4.tgz",
      "integrity": "sha512-Yqfm+XDx0+Prh3VSeEQCPU81yC+JWZ2pDPFSS4ZdpfZhp4MkFMaDC1UqseovEKwSUpnIL7+vK+Clp7bfh0iD7g==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.10.4"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-json-strings": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-json-strings/-/plugin-syntax-json-strings-7.8.3.tgz",
      "integrity": "sha512-lY6kdGpWHvjoe2vk4WrAapEuBR69EMxZl+RoGRhrFGNYVK8mOPAW8VfbT/ZgrFbXlDNiiaxQnAtgVCZ6jv30EA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-jsx": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-jsx/-/plugin-syntax-jsx-7.28.6.tgz",
      "integrity": "sha512-wgEmr06G6sIpqr8YDwA2dSRTE3bJ+V0IfpzfSY3Lfgd7YWOaAdlykvJi13ZKBt8cZHfgH1IXN+CL656W3uUa4w==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-logical-assignment-operators": {
      "version": "7.10.4",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-logical-assignment-operators/-/plugin-syntax-logical-assignment-operators-7.10.4.tgz",
      "integrity": "sha512-d8waShlpFDinQ5MtvGU9xDAOzKH47+FFoney2baFIoMr952hKOLp1HR7VszoZvOsV/4+RRszNY7D17ba0te0ig==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.10.4"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-nullish-coalescing-operator": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-nullish-coalescing-operator/-/plugin-syntax-nullish-coalescing-operator-7.8.3.tgz",
      "integrity": "sha512-aSff4zPII1u2QD7y+F8oDsz19ew4IGEJg9SVW+bqwpwtfFleiQDMdzA/R+UlWDzfnHFCxxleFT0PMIrR36XLNQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-numeric-separator": {
      "version": "7.10.4",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-numeric-separator/-/plugin-syntax-numeric-separator-7.10.4.tgz",
      "integrity": "sha512-9H6YdfkcK/uOnY/K7/aA2xpzaAgkQn37yzWUMRK7OaPOqOpGS1+n0H5hxT9AUw9EsSjPW8SVyMJwYRtWs3X3ug==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.10.4"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-object-rest-spread": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-object-rest-spread/-/plugin-syntax-object-rest-spread-7.8.3.tgz",
      "integrity": "sha512-XoqMijGZb9y3y2XskN+P1wUGiVwWZ5JmoDRwx5+3GmEplNyVM2s2Dg8ILFQm8rWM48orGy5YpI5Bl8U1y7ydlA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-optional-catch-binding": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-optional-catch-binding/-/plugin-syntax-optional-catch-binding-7.8.3.tgz",
      "integrity": "sha512-6VPD0Pc1lpTqw0aKoeRTMiB+kWhAoT24PA+ksWSBrFtl5SIRVpZlwN3NNPQjehA2E/91FV3RjLWoVTglWcSV3Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-optional-chaining": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-optional-chaining/-/plugin-syntax-optional-chaining-7.8.3.tgz",
      "integrity": "sha512-KoK9ErH1MBlCPxV0VANkXW2/dw4vlbGDrFgz8bmUsBGYkFRcbRwMh6cIJubdPrkxRwuGdtCk0v/wPTKbQgBjkg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-private-property-in-object": {
      "version": "7.14.5",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-private-property-in-object/-/plugin-syntax-private-property-in-object-7.14.5.tgz",
      "integrity": "sha512-0wVnp9dxJ72ZUJDV27ZfbSj6iHLoytYZmh3rFcxNnvsJF3ktkzLDZPy/mA17HGsaQT3/DQsWYX1f1QGWkCoVUg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.14.5"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-top-level-await": {
      "version": "7.14.5",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-top-level-await/-/plugin-syntax-top-level-await-7.14.5.tgz",
      "integrity": "sha512-hx++upLv5U1rgYfwe1xBQUhRmU41NEvpUvrp8jkrSCdvGSnM5/qdRMtylJ6PG5OFkBaHkbTAKTnd3/YyESRHFw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.14.5"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-typescript": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-typescript/-/plugin-syntax-typescript-7.28.6.tgz",
      "integrity": "sha512-+nDNmQye7nlnuuHDboPbGm00Vqg3oO8niRRL27/4LYHUsHYh0zJ1xWOz0uRwNFmM1Avzk8wZbc6rdiYhomzv/A==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-arrow-functions": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-arrow-functions/-/plugin-transform-arrow-functions-7.27.1.tgz",
      "integrity": "sha512-8Z4TGic6xW70FKThA5HYEKKyBpOOsucTOD1DjU3fZxDg+K3zBJcXMFnt/4yQiZnf5+MiOMSXQ9PaEK/Ilh1DeA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-async-generator-functions": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-async-generator-functions/-/plugin-transform-async-generator-functions-7.29.0.tgz",
      "integrity": "sha512-va0VdWro4zlBr2JsXC+ofCPB2iG12wPtVGTWFx2WLDOM3nYQZZIGP82qku2eW/JR83sD+k2k+CsNtyEbUqhU6w==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/helper-remap-async-to-generator": "^7.27.1",
        "@babel/traverse": "^7.29.0"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-async-to-generator": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-async-to-generator/-/plugin-transform-async-to-generator-7.28.6.tgz",
      "integrity": "sha512-ilTRcmbuXjsMmcZ3HASTe4caH5Tpo93PkTxF9oG2VZsSWsahydmcEHhix9Ik122RcTnZnUzPbmux4wh1swfv7g==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/helper-remap-async-to-generator": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-block-scoping": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-block-scoping/-/plugin-transform-block-scoping-7.28.6.tgz",
      "integrity": "sha512-tt/7wOtBmwHPNMPu7ax4pdPz6shjFrmHDghvNC+FG9Qvj7D6mJcoRQIF5dy4njmxR941l6rgtvfSB2zX3VlUIw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-class-properties": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-class-properties/-/plugin-transform-class-properties-7.28.6.tgz",
      "integrity": "sha512-dY2wS3I2G7D697VHndN91TJr8/AAfXQNt5ynCTI/MpxMsSzHp+52uNivYT5wCPax3whc47DR8Ba7cmlQMg24bw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-class-features-plugin": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-class-static-block": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-class-static-block/-/plugin-transform-class-static-block-7.28.6.tgz",
      "integrity": "sha512-rfQ++ghVwTWTqQ7w8qyDxL1XGihjBss4CmTgGRCTAC9RIbhVpyp4fOeZtta0Lbf+dTNIVJer6ych2ibHwkZqsQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-class-features-plugin": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.12.0"
      }
    },
    "node_modules/@babel/plugin-transform-classes": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-classes/-/plugin-transform-classes-7.28.6.tgz",
      "integrity": "sha512-EF5KONAqC5zAqT783iMGuM2ZtmEBy+mJMOKl2BCvPZ2lVrwvXnB6o+OBWCS+CoeCCpVRF2sA2RBKUxvT8tQT5Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.27.3",
        "@babel/helper-compilation-targets": "^7.28.6",
        "@babel/helper-globals": "^7.28.0",
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/helper-replace-supers": "^7.28.6",
        "@babel/traverse": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-computed-properties": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-computed-properties/-/plugin-transform-computed-properties-7.28.6.tgz",
      "integrity": "sha512-bcc3k0ijhHbc2lEfpFHgx7eYw9KNXqOerKWfzbxEHUGKnS3sz9C4CNL9OiFN1297bDNfUiSO7DaLzbvHQQQ1BQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/template": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-destructuring": {
      "version": "7.28.5",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-destructuring/-/plugin-transform-destructuring-7.28.5.tgz",
      "integrity": "sha512-Kl9Bc6D0zTUcFUvkNuQh4eGXPKKNDOJQXVyyM4ZAQPMveniJdxi8XMJwLo+xSoW3MIq81bD33lcUe9kZpl0MCw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1",
        "@babel/traverse": "^7.28.5"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-export-namespace-from": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-export-namespace-from/-/plugin-transform-export-namespace-from-7.27.1.tgz",
      "integrity": "sha512-tQvHWSZ3/jH2xuq/vZDy0jNn+ZdXJeM8gHvX4lnJmsc3+50yPlWdZXIc5ay+umX+2/tJIqHqiEqcJvxlmIvRvQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-flow-strip-types": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-flow-strip-types/-/plugin-transform-flow-strip-types-7.27.1.tgz",
      "integrity": "sha512-G5eDKsu50udECw7DL2AcsysXiQyB7Nfg521t2OAJ4tbfTJ27doHLeF/vlI1NZGlLdbb/v+ibvtL1YBQqYOwJGg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1",
        "@babel/plugin-syntax-flow": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-for-of": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-for-of/-/plugin-transform-for-of-7.27.1.tgz",
      "integrity": "sha512-BfbWFFEJFQzLCQ5N8VocnCtA8J1CLkNTe2Ms2wocj75dd6VpiqS5Z5quTYcUoo4Yq+DN0rtikODccuv7RU81sw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-function-name": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-function-name/-/plugin-transform-function-name-7.27.1.tgz",
      "integrity": "sha512-1bQeydJF9Nr1eBCMMbC+hdwmRlsv5XYOMu03YSWFwNs0HsAmtSxxF1fyuYPqemVldVyFmlCU7w8UE14LupUSZQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-compilation-targets": "^7.27.1",
        "@babel/helper-plugin-utils": "^7.27.1",
        "@babel/traverse": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-literals": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-literals/-/plugin-transform-literals-7.27.1.tgz",
      "integrity": "sha512-0HCFSepIpLTkLcsi86GG3mTUzxV5jpmbv97hTETW3yzrAij8aqlD36toB1D0daVFJM8NK6GvKO0gslVQmm+zZA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-logical-assignment-operators": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-logical-assignment-operators/-/plugin-transform-logical-assignment-operators-7.28.6.tgz",
      "integrity": "sha512-+anKKair6gpi8VsM/95kmomGNMD0eLz1NQ8+Pfw5sAwWH9fGYXT50E55ZpV0pHUHWf6IUTWPM+f/7AAff+wr9A==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-modules-commonjs": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-modules-commonjs/-/plugin-transform-modules-commonjs-7.28.6.tgz",
      "integrity": "sha512-jppVbf8IV9iWWwWTQIxJMAJCWBuuKx71475wHwYytrRGQ2CWiDvYlADQno3tcYpS/T2UUWFQp3nVtYfK/YBQrA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-transforms": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-named-capturing-groups-regex": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-named-capturing-groups-regex/-/plugin-transform-named-capturing-groups-regex-7.29.0.tgz",
      "integrity": "sha512-1CZQA5KNAD6ZYQLPw7oi5ewtDNxH/2vuCh+6SmvgDfhumForvs8a1o9n0UrEoBD8HU4djO2yWngTQlXl1NDVEQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.28.5",
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-nullish-coalescing-operator": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-nullish-coalescing-operator/-/plugin-transform-nullish-coalescing-operator-7.28.6.tgz",
      "integrity": "sha512-3wKbRgmzYbw24mDJXT7N+ADXw8BC/imU9yo9c9X9NKaLF1fW+e5H1U5QjMUBe4Qo4Ox/o++IyUkl1sVCLgevKg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-numeric-separator": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-numeric-separator/-/plugin-transform-numeric-separator-7.28.6.tgz",
      "integrity": "sha512-SJR8hPynj8outz+SlStQSwvziMN4+Bq99it4tMIf5/Caq+3iOc0JtKyse8puvyXkk3eFRIA5ID/XfunGgO5i6w==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-object-rest-spread": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-object-rest-spread/-/plugin-transform-object-rest-spread-7.28.6.tgz",
      "integrity": "sha512-5rh+JR4JBC4pGkXLAcYdLHZjXudVxWMXbB6u6+E9lRL5TrGVbHt1TjxGbZ8CkmYw9zjkB7jutzOROArsqtncEA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-compilation-targets": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/plugin-transform-destructuring": "^7.28.5",
        "@babel/plugin-transform-parameters": "^7.27.7",
        "@babel/traverse": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-optional-catch-binding": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-optional-catch-binding/-/plugin-transform-optional-catch-binding-7.28.6.tgz",
      "integrity": "sha512-R8ja/Pyrv0OGAvAXQhSTmWyPJPml+0TMqXlO5w+AsMEiwb2fg3WkOvob7UxFSL3OIttFSGSRFKQsOhJ/X6HQdQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-optional-chaining": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-optional-chaining/-/plugin-transform-optional-chaining-7.28.6.tgz",
      "integrity": "sha512-A4zobikRGJTsX9uqVFdafzGkqD30t26ck2LmOzAuLL8b2x6k3TIqRiT2xVvA9fNmFeTX484VpsdgmKNA0bS23w==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-parameters": {
      "version": "7.27.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-parameters/-/plugin-transform-parameters-7.27.7.tgz",
      "integrity": "sha512-qBkYTYCb76RRxUM6CcZA5KRu8K4SM8ajzVeUgVdMVO9NN9uI/GaVmBg/WKJJGnNokV9SY8FxNOVWGXzqzUidBg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-private-methods": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-private-methods/-/plugin-transform-private-methods-7.28.6.tgz",
      "integrity": "sha512-piiuapX9CRv7+0st8lmuUlRSmX6mBcVeNQ1b4AYzJxfCMuBfB0vBXDiGSmm03pKJw1v6cZ8KSeM+oUnM6yAExg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-class-features-plugin": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-private-property-in-object": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-private-property-in-object/-/plugin-transform-private-property-in-object-7.28.6.tgz",
      "integrity": "sha512-b97jvNSOb5+ehyQmBpmhOCiUC5oVK4PMnpRvO7+ymFBoqYjeDHIU9jnrNUuwHOiL9RpGDoKBpSViarV+BU+eVA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.27.3",
        "@babel/helper-create-class-features-plugin": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-display-name": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-display-name/-/plugin-transform-react-display-name-7.28.0.tgz",
      "integrity": "sha512-D6Eujc2zMxKjfa4Zxl4GHMsmhKKZ9VpcqIchJLvwTxad9zWIYulwYItBovpDOoNLISpcZSXoDJ5gaGbQUDqViA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx/-/plugin-transform-react-jsx-7.28.6.tgz",
      "integrity": "sha512-61bxqhiRfAACulXSLd/GxqmAedUSrRZIu/cbaT18T1CetkTmtDN15it7i80ru4DVqRK1WMxQhXs+Lf9kajm5Ow==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.27.3",
        "@babel/helper-module-imports": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/plugin-syntax-jsx": "^7.28.6",
        "@babel/types": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-development": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-development/-/plugin-transform-react-jsx-development-7.27.1.tgz",
      "integrity": "sha512-ykDdF5yI4f1WrAolLqeF3hmYU12j9ntLQl/AOG1HAS21jxyg1Q0/J/tpREuYLfatGdGmXp/3yS0ZA76kOlVq9Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/plugin-transform-react-jsx": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-self": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.27.1.tgz",
      "integrity": "sha512-6UzkCs+ejGdZ5mFFC/OCUrv028ab2fp1znZmCZjAOBKiBK2jXD1O+BPSfX8X2qjJ75fZBMSnQn3Rq2mrBJK2mw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-source": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.27.1.tgz",
      "integrity": "sha512-zbwoTsBruTeKB9hSq73ha66iFeJHuaFkUbwvqElnygoNbj/jHRsSeokowZFN3CZ64IvEqcmmkVe89OPXc7ldAw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-pure-annotations": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-pure-annotations/-/plugin-transform-react-pure-annotations-7.27.1.tgz",
      "integrity": "sha512-JfuinvDOsD9FVMTHpzA/pBLisxpv1aSf+OIV8lgH3MuWrks19R27e6a6DipIg4aX1Zm9Wpb04p8wljfKrVSnPA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.27.1",
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-regenerator": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-regenerator/-/plugin-transform-regenerator-7.29.0.tgz",
      "integrity": "sha512-FijqlqMA7DmRdg/aINBSs04y8XNTYw/lr1gJ2WsmBnnaNw1iS43EPkJW+zK7z65auG3AWRFXWj+NcTQwYptUog==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-runtime": {
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-runtime/-/plugin-transform-runtime-7.29.0.tgz",
      "integrity": "sha512-jlaRT5dJtMaMCV6fAuLbsQMSwz/QkvaHOHOSXRitGGwSpR1blCY4KUKoyP2tYO8vJcqYe8cEj96cqSztv3uF9w==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6",
        "babel-plugin-polyfill-corejs2": "^0.4.14",
        "babel-plugin-polyfill-corejs3": "^0.13.0",
        "babel-plugin-polyfill-regenerator": "^0.6.5",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-shorthand-properties": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-shorthand-properties/-/plugin-transform-shorthand-properties-7.27.1.tgz",
      "integrity": "sha512-N/wH1vcn4oYawbJ13Y/FxcQrWk63jhfNa7jef0ih7PHSIHX2LB7GWE1rkPrOnka9kwMxb6hMl19p7lidA+EHmQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-spread": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-spread/-/plugin-transform-spread-7.28.6.tgz",
      "integrity": "sha512-9U4QObUC0FtJl05AsUcodau/RWDytrU6uKgkxu09mLR9HLDAtUMoPuuskm5huQsoktmsYpI+bGmq+iapDcriKA==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-sticky-regex": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-sticky-regex/-/plugin-transform-sticky-regex-7.27.1.tgz",
      "integrity": "sha512-lhInBO5bi/Kowe2/aLdBAawijx+q1pQzicSgnkB6dUPc1+RC8QmJHKf2OjvU+NZWitguJHEaEmbV6VWEouT58g==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-typescript": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-typescript/-/plugin-transform-typescript-7.28.6.tgz",
      "integrity": "sha512-0YWL2RFxOqEm9Efk5PvreamxPME8OyY0wM5wh5lHjF+VtVhdneCWGzZeSqzOfiobVqQaNCd2z0tQvnI9DaPWPw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.27.3",
        "@babel/helper-create-class-features-plugin": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.27.1",
        "@babel/plugin-syntax-typescript": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-unicode-regex": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-unicode-regex/-/plugin-transform-unicode-regex-7.27.1.tgz",
      "integrity": "sha512-xvINq24TRojDuyt6JGtHmkVkrfVV3FPT16uytxImLeBZqW3/H52yN+kM1MGuyPkIQxrzKwPHs5U/MP3qKyzkGw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.27.1",
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/preset-react": {
      "version": "7.28.5",
      "resolved": "https://registry.npmjs.org/@babel/preset-react/-/preset-react-7.28.5.tgz",
      "integrity": "sha512-Z3J8vhRq7CeLjdC58jLv4lnZ5RKFUJWqH5emvxmv9Hv3BD1T9R/Im713R4MTKwvFaV74ejZ3sM01LyEKk4ugNQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1",
        "@babel/helper-validator-option": "^7.27.1",
        "@babel/plugin-transform-react-display-name": "^7.28.0",
        "@babel/plugin-transform-react-jsx": "^7.27.1",
        "@babel/plugin-transform-react-jsx-development": "^7.27.1",
        "@babel/plugin-transform-react-pure-annotations": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/preset-typescript": {
      "version": "7.28.5",
      "resolved": "https://registry.npmjs.org/@babel/preset-typescript/-/preset-typescript-7.28.5.tgz",
      "integrity": "sha512-+bQy5WOI2V6LJZpPVxY+yp66XdZ2yifu0Mc1aP5CQKgjn4QM5IN2i5fAZ4xKop47pr8rpVhiAeu+nDQa12C8+g==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1",
        "@babel/helper-validator-option": "^7.27.1",
        "@babel/plugin-syntax-jsx": "^7.27.1",
        "@babel/plugin-transform-modules-commonjs": "^7.27.1",
        "@babel/plugin-transform-typescript": "^7.28.5"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.29.2",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.2.tgz",
      "integrity": "sha512-JiDShH45zKHWyGe4ZNVRrCjBz8Nh9TMmZG1kh4QTK8hCBTWBi8Da+i7s1fJw7/lYpM4ccepSNfqzZ/QvABBi5g==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.8.tgz",
      "integrity": "sha512-I5z7H3bf/41ktsNVLtpN0wAa336HkqIHQ5BuPLEhTkt1jVSyZpeNKIzTgEWmlxjdg81R0IgUCcaE+Ok3NvrfZg==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.8",
        "@babel/helper-globals": "^7.29.7",
        "@babel/parser": "^7.29.8",
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.8",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse--for-generate-function-map": {
      "name": "@babel/traverse",
      "version": "7.29.0",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.0.tgz",
      "integrity": "sha512-4HPiQr0X7+waHfyXPZpWPfWL/J7dcN1mx9gL6WdQVMbPnF3+ZhSMs8tCxN7oHddJE9fhNE7+lxdnlyemKfJRuA==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.0",
        "@babel/generator": "^7.29.0",
        "@babel/helper-globals": "^7.28.0",
        "@babel/parser": "^7.29.0",
        "@babel/template": "^7.28.6",
        "@babel/types": "^7.29.0",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.8.tgz",
      "integrity": "sha512-Vj1jF3cPfxg7OAfoI7QnVKLoILlm2JF9pnVHrX8qx7AHMiYWT+NDAA7jChlNgRS4WTLc/fD1lXLmPixluj+3Gg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@bcoe/v8-coverage": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@bcoe/v8-coverage/-/v8-coverage-1.0.2.tgz",
      "integrity": "sha512-6zABk/ECA/QYSCQ1NGiVwwbQerUCZ+TQbp64Q3AgmfNvurHH0j8TtXa1qbShXA6qqkpAj4V5W8pP6mLe1mcMqA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@expo-google-fonts/manrope": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/@expo-google-fonts/manrope/-/manrope-0.4.2.tgz",
      "integrity": "sha512-BZsKe8d9BJrVnIQIZcTS7/Kac0TbXnqs/+8EBSiQxrmK6GoCO6eTkmr50D1weIk/EoF20pTmAkpWICnovATr/g==",
      "license": "MIT AND OFL-1.1"
    },
    "node_modules/@expo/code-signing-certificates": {
      "version": "0.0.6",
      "resolved": "https://registry.npmjs.org/@expo/code-signing-certificates/-/code-signing-certificates-0.0.6.tgz",
      "integrity": "sha512-iNe0puxwBNEcuua9gmTGzq+SuMDa0iATai1FlFTMHJ/vUmKvN/V//drXoLJkVb5i5H3iE/n/qIJxyoBnXouD0w==",
      "license": "MIT",
      "dependencies": {
        "node-forge": "^1.3.3"
      }
    },
    "node_modules/@expo/config": {
      "version": "12.0.14",
      "resolved": "https://registry.npmjs.org/@expo/config/-/config-12.0.14.tgz",
      "integrity": "sha512-3dfbBd9LnPDgyylhCgkOsaG8Adg52uOVOTQYH5lf23a/t8M5eQpXKCvzUarrf62B78057n2NnkiofK9TfPgvzw==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "~7.10.4",
        "@expo/config-plugins": "~54.0.5",
        "@expo/config-types": "^54.0.10",
        "@expo/json-file": "^10.0.16",
        "deepmerge": "^4.3.1",
        "getenv": "^2.0.0",
        "glob": "^13.0.0",
        "require-from-string": "^2.0.2",
        "resolve-from": "^5.0.0",
        "resolve-workspace-root": "^2.0.0",
        "semver": "^7.6.0",
        "slugify": "^1.3.4",
        "sucrase": "~3.35.1"
      }
    },
    "node_modules/@expo/config-plugins": {
      "version": "54.0.5",
      "resolved": "https://registry.npmjs.org/@expo/config-plugins/-/config-plugins-54.0.5.tgz",
      "integrity": "sha512-aWQ3sViNRoQWw6So4A2qhWCt24CuGBK6MrRHI1AG+V6/NQAjIZCHaSvcXK2gXKpmisRhTSUWaKPIgLJQFB+AeQ==",
      "license": "MIT",
      "dependencies": {
        "@expo/config-types": "^54.0.10",
        "@expo/json-file": "~10.0.16",
        "@expo/plist": "^0.4.9",
        "@expo/sdk-runtime-versions": "^1.0.0",
        "chalk": "^4.1.2",
        "debug": "^4.3.5",
        "getenv": "^2.0.0",
        "glob": "^13.0.0",
        "resolve-from": "^5.0.0",
        "semver": "^7.5.4",
        "slash": "^3.0.0",
        "slugify": "^1.6.6",
        "xcode": "^3.0.1",
        "xml2js": "0.6.0"
      }
    },
    "node_modules/@expo/config-plugins/node_modules/glob": {
      "version": "13.0.6",
      "resolved": "https://registry.npmjs.org/glob/-/glob-13.0.6.tgz",
      "integrity": "sha512-Wjlyrolmm8uDpm/ogGyXZXb1Z+Ca2B8NbJwqBVg0axK9GbBeoS7yGV6vjXnYdGm6X53iehEuxxbyiKp8QmN4Vw==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "minimatch": "^10.2.2",
        "minipass": "^7.1.3",
        "path-scurry": "^2.0.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@expo/config-plugins/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@expo/config-types": {
      "version": "54.0.10",
      "resolved": "https://registry.npmjs.org/@expo/config-types/-/config-types-54.0.10.tgz",
      "integrity": "sha512-/J16SC2an1LdtCZ67xhSkGXpALYUVUNyZws7v+PVsFZxClYehDSoKLqyRaGkpHlYrCc08bS0RF5E0JV6g50psA==",
      "license": "MIT"
    },
    "node_modules/@expo/config/node_modules/@babel/code-frame": {
      "version": "7.10.4",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.10.4.tgz",
      "integrity": "sha512-vG6SvB6oYEhvgisZNFRmRCUkLz11c7rp+tbNTynGqc6mS1d5ATd/sGyV6W0KZZnXRKMTzZDRgQT3Ou9jhpAfUg==",
      "license": "MIT",
      "dependencies": {
        "@babel/highlight": "^7.10.4"
      }
    },
    "node_modules/@expo/config/node_modules/glob": {
      "version": "13.0.6",
      "resolved": "https://registry.npmjs.org/glob/-/glob-13.0.6.tgz",
      "integrity": "sha512-Wjlyrolmm8uDpm/ogGyXZXb1Z+Ca2B8NbJwqBVg0axK9GbBeoS7yGV6vjXnYdGm6X53iehEuxxbyiKp8QmN4Vw==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "minimatch": "^10.2.2",
        "minipass": "^7.1.3",
        "path-scurry": "^2.0.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@expo/config/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@expo/devcert": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@expo/devcert/-/devcert-1.2.1.tgz",
      "integrity": "sha512-qC4eaxmKMTmJC2ahwyui6ud8f3W60Ss7pMkpBq40Hu3zyiAaugPXnZ24145U7K36qO9UHdZUVxsCvIpz2RYYCA==",
      "license": "MIT",
      "dependencies": {
        "@expo/sudo-prompt": "^9.3.1",
        "debug": "^3.1.0"
      }
    },
    "node_modules/@expo/devcert/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/@expo/devtools": {
      "version": "0.1.8",
      "resolved": "https://registry.npmjs.org/@expo/devtools/-/devtools-0.1.8.tgz",
      "integrity": "sha512-SVLxbuanDjJPgc0sy3EfXUMLb/tXzp6XIHkhtPVmTWJAp+FOr6+5SeiCfJrCzZFet0Ifyke2vX3sFcKwEvCXwQ==",
      "license": "MIT",
      "dependencies": {
        "chalk": "^4.1.2"
      },
      "peerDependencies": {
        "react": "*",
        "react-native": "*"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        },
        "react-native": {
          "optional": true
        }
      }
    },
    "node_modules/@expo/env": {
      "version": "2.0.12",
      "resolved": "https://registry.npmjs.org/@expo/env/-/env-2.0.12.tgz",
      "integrity": "sha512-wVfzeBGlUohZG5kS8QCqXurpuWZFJEkBB1wXCifai3EZ/Llcg/VMTiUCpAgHImD3lI7GIU3V1uI64c04XIo98Q==",
      "license": "MIT",
      "dependencies": {
        "chalk": "^4.0.0",
        "debug": "^4.3.4",
        "dotenv": "~16.4.5",
        "dotenv-expand": "~11.0.6",
        "getenv": "^2.0.0"
      }
    },
    "node_modules/@expo/fingerprint": {
      "version": "0.15.5",
      "resolved": "https://registry.npmjs.org/@expo/fingerprint/-/fingerprint-0.15.5.tgz",
      "integrity": "sha512-mdVoAMcux1WlM6kd1RoWiHRNqKqS+J6mKmWQ/BKgeh937S/fcW58EE68O6nc4KDXtWi3PBeNHskOFcgyIuD4hw==",
      "license": "MIT",
      "dependencies": {
        "@expo/spawn-async": "^1.7.2",
        "arg": "^5.0.2",
        "chalk": "^4.1.2",
        "debug": "^4.3.4",
        "getenv": "^2.0.0",
        "glob": "^13.0.0",
        "ignore": "^5.3.1",
        "minimatch": "^10.2.2",
        "p-limit": "^3.1.0",
        "resolve-from": "^5.0.0",
        "semver": "^7.6.0"
      },
      "bin": {
        "fingerprint": "bin/cli.js"
      }
    },
    "node_modules/@expo/fingerprint/node_modules/glob": {
      "version": "13.0.6",
      "resolved": "https://registry.npmjs.org/glob/-/glob-13.0.6.tgz",
      "integrity": "sha512-Wjlyrolmm8uDpm/ogGyXZXb1Z+Ca2B8NbJwqBVg0axK9GbBeoS7yGV6vjXnYdGm6X53iehEuxxbyiKp8QmN4Vw==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "minimatch": "^10.2.2",
        "minipass": "^7.1.3",
        "path-scurry": "^2.0.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@expo/fingerprint/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@expo/image-utils": {
      "version": "0.8.14",
      "resolved": "https://registry.npmjs.org/@expo/image-utils/-/image-utils-0.8.14.tgz",
      "integrity": "sha512-5Sn+jG4Cw+shC2wDMXoqSAJnvERbiwzHn05FpWtD5IBflfTIs5gUmjzwiGVyjOdlMSQhgRrw/AymPbmO9h9mpQ==",
      "license": "MIT",
      "dependencies": {
        "@expo/require-utils": "^55.0.5",
        "@expo/spawn-async": "^1.7.2",
        "chalk": "^4.0.0",
        "getenv": "^2.0.0",
        "jimp-compact": "0.16.1",
        "parse-png": "^2.1.0",
        "semver": "^7.6.0"
      }
    },
    "node_modules/@expo/image-utils/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@expo/json-file": {
      "version": "10.0.16",
      "resolved": "https://registry.npmjs.org/@expo/json-file/-/json-file-10.0.16.tgz",
      "integrity": "sha512-fcVkWEj+hLuP2yt5W0aw6LmDRqSPWDLUSxOMcmFeV+algmIF59sQVKCwB9btjQLd4V6x9N0pISkQEkBubUHrCw==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "~7.10.4",
        "json5": "^2.2.3"
      }
    },
    "node_modules/@expo/json-file/node_modules/@babel/code-frame": {
      "version": "7.10.4",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.10.4.tgz",
      "integrity": "sha512-vG6SvB6oYEhvgisZNFRmRCUkLz11c7rp+tbNTynGqc6mS1d5ATd/sGyV6W0KZZnXRKMTzZDRgQT3Ou9jhpAfUg==",
      "license": "MIT",
      "dependencies": {
        "@babel/highlight": "^7.10.4"
      }
    },
    "node_modules/@expo/metro": {
      "version": "54.2.0",
      "resolved": "https://registry.npmjs.org/@expo/metro/-/metro-54.2.0.tgz",
      "integrity": "sha512-h68TNZPGsk6swMmLm9nRSnE2UXm48rWwgcbtAHVMikXvbxdS41NDHHeqg1rcQ9AbznDRp6SQVC2MVpDnsRKU1w==",
      "license": "MIT",
      "dependencies": {
        "metro": "0.83.3",
        "metro-babel-transformer": "0.83.3",
        "metro-cache": "0.83.3",
        "metro-cache-key": "0.83.3",
        "metro-config": "0.83.3",
        "metro-core": "0.83.3",
        "metro-file-map": "0.83.3",
        "metro-minify-terser": "0.83.3",
        "metro-resolver": "0.83.3",
        "metro-runtime": "0.83.3",
        "metro-source-map": "0.83.3",
        "metro-symbolicate": "0.83.3",
        "metro-transform-plugins": "0.83.3",
        "metro-transform-worker": "0.83.3"
      }
    },
    "node_modules/@expo/osascript": {
      "version": "2.7.1",
      "resolved": "https://registry.npmjs.org/@expo/osascript/-/osascript-2.7.1.tgz",
      "integrity": "sha512-Zn03EX6In7ts2lPUW2ESUSkEhEWQN1qqsiXjadtZMJOuZRkMiAg1ZQHuvz9DjByDWNJ2pBwAGyrts9lj9k389g==",
      "license": "MIT",
      "dependencies": {
        "@expo/spawn-async": "^1.8.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@expo/package-manager": {
      "version": "1.13.1",
      "resolved": "https://registry.npmjs.org/@expo/package-manager/-/package-manager-1.13.1.tgz",
      "integrity": "sha512-y/K+CaYYpZpNGZhSX4HyLT/vyIunFjNfyoxNysPBCefeLKI/VCx6f9LNPzrxayr3rCYO5bl9O8H+HRQK265Nkg==",
      "license": "MIT",
      "dependencies": {
        "@expo/json-file": "^11.0.1",
        "@expo/spawn-async": "^1.8.0",
        "chalk": "^4.0.0",
        "npm-package-arg": "^11.0.0",
        "ora": "^3.4.0",
        "resolve-workspace-root": "^2.0.0"
      }
    },
    "node_modules/@expo/package-manager/node_modules/@expo/json-file": {
      "version": "11.0.1",
      "resolved": "https://registry.npmjs.org/@expo/json-file/-/json-file-11.0.1.tgz",
      "integrity": "sha512-zxHWj4MKKMAL29ZQSY/Fssx4Thluk40JmuGNaeS078wy/NhlFhnVi+rHHunulE3xJAJ0CM73m8VK2+GkF9eRwQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.20.0",
        "json5": "^2.2.3"
      }
    },
    "node_modules/@expo/plist": {
      "version": "0.4.9",
      "resolved": "https://registry.npmjs.org/@expo/plist/-/plist-0.4.9.tgz",
      "integrity": "sha512-MPVpmKGfnQEnrCzgxuXcmPP/y/t6AVm+DcSb2Myp21LKWv1N3l8uFxMggesfF4ixAxkRlGmMMx9GyDC9M+XklQ==",
      "license": "MIT",
      "dependencies": {
        "@xmldom/xmldom": "^0.8.8",
        "base64-js": "^1.2.3",
        "xmlbuilder": "^15.1.1"
      }
    },
    "node_modules/@expo/require-utils": {
      "version": "55.0.5",
      "resolved": "https://registry.npmjs.org/@expo/require-utils/-/require-utils-55.0.5.tgz",
      "integrity": "sha512-U4K/CQ2VpXuwfNGsN+daKmYOt15hCP8v/pXaYH6eut7kdYZo6SfJ1yr67BIcJ+1Gzzs+QzTxswAZChKpXmceyw==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.20.0",
        "@babel/core": "^7.25.2",
        "@babel/plugin-transform-modules-commonjs": "^7.24.8"
      },
      "peerDependencies": {
        "typescript": "^5.0.0 || ^5.0.0-0"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@expo/schema-utils": {
      "version": "0.1.9",
      "resolved": "https://registry.npmjs.org/@expo/schema-utils/-/schema-utils-0.1.9.tgz",
      "integrity": "sha512-t9bYwG4Z0yCVzHYJoDMci1OFq2FkBkhStlfUGSkspKYTwB/84+x6sY+CXCgdhkQNQtvWaugW5KUs9YZfAXq9Sg==",
      "license": "MIT"
    },
    "node_modules/@expo/sdk-runtime-versions": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@expo/sdk-runtime-versions/-/sdk-runtime-versions-1.0.0.tgz",
      "integrity": "sha512-Doz2bfiPndXYFPMRwPyGa1k5QaKDVpY806UJj570epIiMzWaYyCtobasyfC++qfIXVb5Ocy7r3tP9d62hAQ7IQ==",
      "license": "MIT"
    },
    "node_modules/@expo/spawn-async": {
      "version": "1.8.0",
      "resolved": "https://registry.npmjs.org/@expo/spawn-async/-/spawn-async-1.8.0.tgz",
      "integrity": "sha512-eb9xxd/LbuEGSdua4NumCu/McVB9EM+F/JxB9pWgnERw4HQ9XyTNH1KapG6oqLWR8TuRK2LQfzJlmNi94CVobw==",
      "license": "MIT",
      "dependencies": {
        "cross-spawn": "^7.0.6"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@expo/sudo-prompt": {
      "version": "9.3.2",
      "resolved": "https://registry.npmjs.org/@expo/sudo-prompt/-/sudo-prompt-9.3.2.tgz",
      "integrity": "sha512-HHQigo3rQWKMDzYDLkubN5WQOYXJJE2eNqIQC2axC2iO3mHdwnIR7FgZVvHWtBwAdzBgAP0ECp8KqS8TiMKvgw==",
      "license": "MIT"
    },
    "node_modules/@expo/vector-icons": {
      "version": "15.1.1",
      "resolved": "https://registry.npmjs.org/@expo/vector-icons/-/vector-icons-15.1.1.tgz",
      "integrity": "sha512-Iu2VkcoI5vygbtYngm7jb4ifxElNVXQYdDrYkT7UCEIiKLeWnQY0wf2ZhHZ+Wro6Sc5TaumpKUOqDRpLi5rkvw==",
      "license": "MIT",
      "peerDependencies": {
        "expo-font": ">=14.0.4",
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/@expo/ws-tunnel": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/@expo/ws-tunnel/-/ws-tunnel-1.0.6.tgz",
      "integrity": "sha512-nDRbLmSrJar7abvUjp3smDwH8HcbZcoOEa5jVPUv9/9CajgmWw20JNRwTuBRzWIWIkEJDkz20GoNA+tSwUqk0Q==",
      "license": "MIT"
    },
    "node_modules/@expo/xcpretty": {
      "version": "4.4.4",
      "resolved": "https://registry.npmjs.org/@expo/xcpretty/-/xcpretty-4.4.4.tgz",
      "integrity": "sha512-4aQzz9vgxcNXFfo/iyNgDDYfsU5XGKKxWxZopw0cVotHiW+U8IJbIxMaxsINs6bHhtkG3StKNPcOrn3eBuxKPw==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@babel/code-frame": "^7.20.0",
        "chalk": "^4.1.0",
        "js-yaml": "^4.1.0"
      },
      "bin": {
        "excpretty": "build/cli.js"
      }
    },
    "node_modules/@expo/xcpretty/node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "license": "Python-2.0"
    },
    "node_modules/@expo/xcpretty/node_modules/js-yaml": {
      "version": "4.3.2",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.3.2.tgz",
      "integrity": "sha512-SFNOvSJ+Dgf/9An904Yx+CgSlIPCkIpao4qo51lpee25TIRejdH3rhR4EZMGoNx3/TP3O+wzWuiTFl4sqbltzA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/puzrin"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/nodeca"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/@ide/backoff": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@ide/backoff/-/backoff-1.0.0.tgz",
      "integrity": "sha512-F0YfUDjvT+Mtt/R4xdl2X0EYCHMMiJqNLdxHD++jDT5ydEFIyqbCHh51Qx2E211dgZprPKhV7sHmnXKpLuvc5g==",
      "license": "MIT"
    },
    "node_modules/@isaacs/fs-minipass": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/@isaacs/fs-minipass/-/fs-minipass-4.0.1.tgz",
      "integrity": "sha512-wgm9Ehl2jpeqP3zw/7mo3kRHFp5MEDhqAdwy1fTGkHAwnkGOVsgpvQhL8B5n1qlb01jV3n/bI0ZfZp5lWA1k4w==",
      "license": "ISC",
      "dependencies": {
        "minipass": "^7.0.4"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@isaacs/ttlcache": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/@isaacs/ttlcache/-/ttlcache-1.4.1.tgz",
      "integrity": "sha512-RQgQ4uQ+pLbqXfOmieB91ejmLwvSgv9nLx6sT6sD83s7umBypgg+OIBOBbEUiJXrfpnp9j0mRhYYdzp9uqq3lA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@istanbuljs/load-nyc-config/-/load-nyc-config-1.1.0.tgz",
      "integrity": "sha512-VjeHSlIzpv/NyD3N0YuHfXOPDIixcA1q2ZV98wsMqcYlPmv2n3Yb2lYP9XMElnaFVXg5A7YLTeLu6V84uQDjmQ==",
      "license": "ISC",
      "dependencies": {
        "camelcase": "^5.3.1",
        "find-up": "^4.1.0",
        "get-package-type": "^0.1.0",
        "js-yaml": "^3.13.1",
        "resolve-from": "^5.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config/node_modules/camelcase": {
      "version": "5.3.1",
      "resolved": "https://registry.npmjs.org/camelcase/-/camelcase-5.3.1.tgz",
      "integrity": "sha512-L28STB170nwWS63UjtlEOE3dldQApaJXZkOI1uMFfzf3rRuPegHaHesyee+YxQ+W6SvRDQV6UrdOdRiR153wJg==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/@istanbuljs/schema": {
      "version": "0.1.6",
      "resolved": "https://registry.npmjs.org/@istanbuljs/schema/-/schema-0.1.6.tgz",
      "integrity": "sha512-+Sg6GCR/wy1oSmQDFq4LQDAhm3ETKnorxN+y5nbLULOR3P0c14f2Wurzj3/xqPXtasLFfHd5iRFQ7AJt4KH2cw==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@jest/create-cache-key-function": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/@jest/create-cache-key-function/-/create-cache-key-function-29.7.0.tgz",
      "integrity": "sha512-4QqS3LY5PBmTRHj9sAg1HLoPzqAI0uOX6wI/TRqHIcOxlFidy6YEmCQJk6FSZjNLGCeubDMfmkWL+qaLKhSGQA==",
      "license": "MIT",
      "dependencies": {
        "@jest/types": "^29.6.3"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/@jest/environment": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/@jest/environment/-/environment-29.7.0.tgz",
      "integrity": "sha512-aQIfHDq33ExsN4jP1NWGXhxgQ/wixs60gDiKO+XVMd8Mn0NWPWgc34ZQDTb2jKaUWQ7MuwoitXAsN2XVXNMpAw==",
      "license": "MIT",
      "dependencies": {
        "@jest/fake-timers": "^29.7.0",
        "@jest/types": "^29.6.3",
        "@types/node": "*",
        "jest-mock": "^29.7.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/@jest/fake-timers": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/@jest/fake-timers/-/fake-timers-29.7.0.tgz",
      "integrity": "sha512-q4DH1Ha4TTFPdxLsqDXK1d3+ioSL7yL5oCMJZgDYm6i+6CygW5E5xVr/D1HdsGxjt1ZWSfUAs9OxSB/BNelWrQ==",
      "license": "MIT",
      "dependencies": {
        "@jest/types": "^29.6.3",
        "@sinonjs/fake-timers": "^10.0.2",
        "@types/node": "*",
        "jest-message-util": "^29.7.0",
        "jest-mock": "^29.7.0",
        "jest-util": "^29.7.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/@jest/schemas": {
      "version": "29.6.3",
      "resolved": "https://registry.npmjs.org/@jest/schemas/-/schemas-29.6.3.tgz",
      "integrity": "sha512-mo5j5X+jIZmJQveBKeS/clAueipV7KgiX1vMgCxam1RNYiqE1w62n0/tJJnHtjW8ZHcQco5gY85jA3mi0L+nSA==",
      "license": "MIT",
      "dependencies": {
        "@sinclair/typebox": "^0.27.8"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/@jest/transform": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/@jest/transform/-/transform-29.7.0.tgz",
      "integrity": "sha512-ok/BTPFzFKVMwO5eOHRrvnBVHdRy9IrsrW1GpMaQ9MCnilNLXQKmAX8s1YXDFaai9xJpac2ySzV0YeRRECr2Vw==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.11.6",
        "@jest/types": "^29.6.3",
        "@jridgewell/trace-mapping": "^0.3.18",
        "babel-plugin-istanbul": "^6.1.1",
        "chalk": "^4.0.0",
        "convert-source-map": "^2.0.0",
        "fast-json-stable-stringify": "^2.1.0",
        "graceful-fs": "^4.2.9",
        "jest-haste-map": "^29.7.0",
        "jest-regex-util": "^29.6.3",
        "jest-util": "^29.7.0",
        "micromatch": "^4.0.4",
        "pirates": "^4.0.4",
        "slash": "^3.0.0",
        "write-file-atomic": "^4.0.2"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/@jest/types": {
      "version": "29.6.3",
      "resolved": "https://registry.npmjs.org/@jest/types/-/types-29.6.3.tgz",
      "integrity": "sha512-u3UPsIilWKOM3F9CXtrG8LEJmNxwoCQC/XVj4IKYXvvpx7QIi/Kg1LI5uDmDpKlac62NUtX7eLjRh+jVZcLOzw==",
      "license": "MIT",
      "dependencies": {
        "@jest/schemas": "^29.6.3",
        "@types/istanbul-lib-coverage": "^2.0.0",
        "@types/istanbul-reports": "^3.0.0",
        "@types/node": "*",
        "@types/yargs": "^17.0.8",
        "chalk": "^4.0.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/source-map": {
      "version": "0.3.11",
      "resolved": "https://registry.npmjs.org/@jridgewell/source-map/-/source-map-0.3.11.tgz",
      "integrity": "sha512-ZMp1V8ZFcPG5dIWnQLr3NSI1MiCU7UETdS/A0G8V/XWHvJv3ZsFqutJn1Y5RPmAPX6F3BiE397OqveU/9NCuIA==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.25"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@mapbox/geojson-rewind": {
      "version": "0.5.2",
      "resolved": "https://registry.npmjs.org/@mapbox/geojson-rewind/-/geojson-rewind-0.5.2.tgz",
      "integrity": "sha512-tJaT+RbYGJYStt7wI3cq4Nl4SXxG8W7JDG5DMJu97V25RnbNg3QtQtf+KD+VLjNpWKYsRvXDNmNrBgEETr1ifA==",
      "license": "ISC",
      "dependencies": {
        "get-stream": "^6.0.1",
        "minimist": "^1.2.6"
      },
      "bin": {
        "geojson-rewind": "geojson-rewind"
      }
    },
    "node_modules/@mapbox/jsonlint-lines-primitives": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/@mapbox/jsonlint-lines-primitives/-/jsonlint-lines-primitives-2.0.2.tgz",
      "integrity": "sha512-rY0o9A5ECsTQRVhv7tL/OyDpGAoUB4tTvLiW1DSzQGq4bvTPhNw1VpSNjDJc5GFZ2XuyOtSWSVN05qOtcD71qQ==",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/@mapbox/mapbox-gl-supported": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/@mapbox/mapbox-gl-supported/-/mapbox-gl-supported-2.0.1.tgz",
      "integrity": "sha512-HP6XvfNIzfoMVfyGjBckjiAOQK9WfX0ywdLubuPMPv+Vqf5fj0uCbgBQYpiqcWZT6cbyyRnTSXDheT1ugvF6UQ==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@mapbox/point-geometry": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/@mapbox/point-geometry/-/point-geometry-0.1.0.tgz",
      "integrity": "sha512-6j56HdLTwWGO0fJPlrZtdU/B13q8Uwmo18Ck2GnGgN9PCFyKTZ3UbXeEdRFh18i9XQ92eH2VdtpJHpBD3aripQ==",
      "license": "ISC"
    },
    "node_modules/@mapbox/tiny-sdf": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@mapbox/tiny-sdf/-/tiny-sdf-2.2.0.tgz",
      "integrity": "sha512-LVL4wgI9YAum5V+LNVQO6QgFBPw7/MIIY4XJPNsPDMrjEwcE+JfKk1LuIl8GnF197ejVdC9QdPaxrx5gfgdGXg==",
      "license": "BSD-2-Clause"
    },
    "node_modules/@mapbox/unitbezier": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/@mapbox/unitbezier/-/unitbezier-0.0.1.tgz",
      "integrity": "sha512-nMkuDXFv60aBr9soUG5q+GvZYL+2KZHVvsqFCzqnkGEf46U2fvmytHaEVc1/YZbiLn8X+eR3QzX1+dwDO1lxlw==",
      "license": "BSD-2-Clause"
    },
    "node_modules/@mapbox/vector-tile": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/@mapbox/vector-tile/-/vector-tile-1.3.1.tgz",
      "integrity": "sha512-MCEddb8u44/xfQ3oD+Srl/tNcQoqTw3goGk2oLsrFxOTc3dUp+kAnby3PvAeeBYSMSjSPD1nd1AJA6W49WnoUw==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@mapbox/point-geometry": "~0.1.0"
      }
    },
    "node_modules/@mapbox/whoots-js": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/@mapbox/whoots-js/-/whoots-js-3.1.0.tgz",
      "integrity": "sha512-Es6WcD0nO5l+2BOQS4uLfNPYQaNDfbot3X1XUoloz+x0mPDS3eeORZJl06HXjwBG1fOGwCRnzK88LMdxKRrd6Q==",
      "license": "ISC",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.152.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.152.0.tgz",
      "integrity": "sha512-oM/5rLBm2tPkg0iBgkH/FOeR3PCDpY19GTgAZjMFM8h9WI9VW7cLgzp6nwtarYKmovavIQZ+Fe/RKX/8C8O/Rw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@react-native-async-storage/async-storage": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@react-native-async-storage/async-storage/-/async-storage-2.2.0.tgz",
      "integrity": "sha512-gvRvjR5JAaUZF8tv2Kcq/Gbt3JHwbKFYfmb445rhOj6NUMx3qPLixmDx5pZAyb9at1bYvJ4/eTUipU5aki45xw==",
      "license": "MIT",
      "dependencies": {
        "merge-options": "^3.0.4"
      },
      "peerDependencies": {
        "react-native": "^0.0.0-0 || >=0.65 <1.0"
      }
    },
    "node_modules/@react-native/assets-registry": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/assets-registry/-/assets-registry-0.81.5.tgz",
      "integrity": "sha512-705B6x/5Kxm1RKRvSv0ADYWm5JOnoiQ1ufW7h8uu2E6G9Of/eE6hP/Ivw3U5jI16ERqZxiKQwk34VJbB0niX9w==",
      "license": "MIT",
      "engines": {
        "node": ">= 20.19.4"
      }
    },
    "node_modules/@react-native/babel-plugin-codegen": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/babel-plugin-codegen/-/babel-plugin-codegen-0.81.5.tgz",
      "integrity": "sha512-oF71cIH6je3fSLi6VPjjC3Sgyyn57JLHXs+mHWc9MoCiJJcM4nqsS5J38zv1XQ8d3zOW2JtHro+LF0tagj2bfQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.25.3",
        "@react-native/codegen": "0.81.5"
      },
      "engines": {
        "node": ">= 20.19.4"
      }
    },
    "node_modules/@react-native/babel-preset": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/babel-preset/-/babel-preset-0.81.5.tgz",
      "integrity": "sha512-UoI/x/5tCmi+pZ3c1+Ypr1DaRMDLI3y+Q70pVLLVgrnC3DHsHRIbHcCHIeG/IJvoeFqFM2sTdhSOLJrf8lOPrA==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.25.2",
        "@babel/plugin-proposal-export-default-from": "^7.24.7",
        "@babel/plugin-syntax-dynamic-import": "^7.8.3",
        "@babel/plugin-syntax-export-default-from": "^7.24.7",
        "@babel/plugin-syntax-nullish-coalescing-operator": "^7.8.3",
        "@babel/plugin-syntax-optional-chaining": "^7.8.3",
        "@babel/plugin-transform-arrow-functions": "^7.24.7",
        "@babel/plugin-transform-async-generator-functions": "^7.25.4",
        "@babel/plugin-transform-async-to-generator": "^7.24.7",
        "@babel/plugin-transform-block-scoping": "^7.25.0",
        "@babel/plugin-transform-class-properties": "^7.25.4",
        "@babel/plugin-transform-classes": "^7.25.4",
        "@babel/plugin-transform-computed-properties": "^7.24.7",
        "@babel/plugin-transform-destructuring": "^7.24.8",
        "@babel/plugin-transform-flow-strip-types": "^7.25.2",
        "@babel/plugin-transform-for-of": "^7.24.7",
        "@babel/plugin-transform-function-name": "^7.25.1",
        "@babel/plugin-transform-literals": "^7.25.2",
        "@babel/plugin-transform-logical-assignment-operators": "^7.24.7",
        "@babel/plugin-transform-modules-commonjs": "^7.24.8",
        "@babel/plugin-transform-named-capturing-groups-regex": "^7.24.7",
        "@babel/plugin-transform-nullish-coalescing-operator": "^7.24.7",
        "@babel/plugin-transform-numeric-separator": "^7.24.7",
        "@babel/plugin-transform-object-rest-spread": "^7.24.7",
        "@babel/plugin-transform-optional-catch-binding": "^7.24.7",
        "@babel/plugin-transform-optional-chaining": "^7.24.8",
        "@babel/plugin-transform-parameters": "^7.24.7",
        "@babel/plugin-transform-private-methods": "^7.24.7",
        "@babel/plugin-transform-private-property-in-object": "^7.24.7",
        "@babel/plugin-transform-react-display-name": "^7.24.7",
        "@babel/plugin-transform-react-jsx": "^7.25.2",
        "@babel/plugin-transform-react-jsx-self": "^7.24.7",
        "@babel/plugin-transform-react-jsx-source": "^7.24.7",
        "@babel/plugin-transform-regenerator": "^7.24.7",
        "@babel/plugin-transform-runtime": "^7.24.7",
        "@babel/plugin-transform-shorthand-properties": "^7.24.7",
        "@babel/plugin-transform-spread": "^7.24.7",
        "@babel/plugin-transform-sticky-regex": "^7.24.7",
        "@babel/plugin-transform-typescript": "^7.25.2",
        "@babel/plugin-transform-unicode-regex": "^7.24.7",
        "@babel/template": "^7.25.0",
        "@react-native/babel-plugin-codegen": "0.81.5",
        "babel-plugin-syntax-hermes-parser": "0.29.1",
        "babel-plugin-transform-flow-enums": "^0.0.2",
        "react-refresh": "^0.14.0"
      },
      "engines": {
        "node": ">= 20.19.4"
      },
      "peerDependencies": {
        "@babel/core": "*"
      }
    },
    "node_modules/@react-native/codegen": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/codegen/-/codegen-0.81.5.tgz",
      "integrity": "sha512-a2TDA03Up8lpSa9sh5VRGCQDXgCTOyDOFH+aqyinxp1HChG8uk89/G+nkJ9FPd0rqgi25eCTR16TWdS3b+fA6g==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.25.2",
        "@babel/parser": "^7.25.3",
        "glob": "^7.1.1",
        "hermes-parser": "0.29.1",
        "invariant": "^2.2.4",
        "nullthrows": "^1.1.1",
        "yargs": "^17.6.2"
      },
      "engines": {
        "node": ">= 20.19.4"
      },
      "peerDependencies": {
        "@babel/core": "*"
      }
    },
    "node_modules/@react-native/community-cli-plugin": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/community-cli-plugin/-/community-cli-plugin-0.81.5.tgz",
      "integrity": "sha512-yWRlmEOtcyvSZ4+OvqPabt+NS36vg0K/WADTQLhrYrm9qdZSuXmq8PmdJWz/68wAqKQ+4KTILiq2kjRQwnyhQw==",
      "license": "MIT",
      "dependencies": {
        "@react-native/dev-middleware": "0.81.5",
        "debug": "^4.4.0",
        "invariant": "^2.2.4",
        "metro": "^0.83.1",
        "metro-config": "^0.83.1",
        "metro-core": "^0.83.1",
        "semver": "^7.1.3"
      },
      "engines": {
        "node": ">= 20.19.4"
      },
      "peerDependencies": {
        "@react-native-community/cli": "*",
        "@react-native/metro-config": "*"
      },
      "peerDependenciesMeta": {
        "@react-native-community/cli": {
          "optional": true
        },
        "@react-native/metro-config": {
          "optional": true
        }
      }
    },
    "node_modules/@react-native/community-cli-plugin/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@react-native/debugger-frontend": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/debugger-frontend/-/debugger-frontend-0.81.5.tgz",
      "integrity": "sha512-bnd9FSdWKx2ncklOetCgrlwqSGhMHP2zOxObJbOWXoj7GHEmih4MKarBo5/a8gX8EfA1EwRATdfNBQ81DY+h+w==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">= 20.19.4"
      }
    },
    "node_modules/@react-native/dev-middleware": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/dev-middleware/-/dev-middleware-0.81.5.tgz",
      "integrity": "sha512-WfPfZzboYgo/TUtysuD5xyANzzfka8Ebni6RIb2wDxhb56ERi7qDrE4xGhtPsjCL4pQBXSVxyIlCy0d8I6EgGA==",
      "license": "MIT",
      "dependencies": {
        "@isaacs/ttlcache": "^1.4.1",
        "@react-native/debugger-frontend": "0.81.5",
        "chrome-launcher": "^0.15.2",
        "chromium-edge-launcher": "^0.2.0",
        "connect": "^3.6.5",
        "debug": "^4.4.0",
        "invariant": "^2.2.4",
        "nullthrows": "^1.1.1",
        "open": "^7.0.3",
        "serve-static": "^1.16.2",
        "ws": "^6.2.3"
      },
      "engines": {
        "node": ">= 20.19.4"
      }
    },
    "node_modules/@react-native/dev-middleware/node_modules/ws": {
      "version": "6.2.6",
      "resolved": "https://registry.npmjs.org/ws/-/ws-6.2.6.tgz",
      "integrity": "sha512-XTrf1gv7kXoVf1hbC3PAyAiPgR8Wz1blcrYIjEsUmr08BLksT41R8KbjmS9408C2ERx7v1JDLD/BkpLEttjfKA==",
      "license": "MIT",
      "dependencies": {
        "async-limiter": "~1.0.0"
      }
    },
    "node_modules/@react-native/gradle-plugin": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/gradle-plugin/-/gradle-plugin-0.81.5.tgz",
      "integrity": "sha512-hORRlNBj+ReNMLo9jme3yQ6JQf4GZpVEBLxmTXGGlIL78MAezDZr5/uq9dwElSbcGmLEgeiax6e174Fie6qPLg==",
      "license": "MIT",
      "engines": {
        "node": ">= 20.19.4"
      }
    },
    "node_modules/@react-native/js-polyfills": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/js-polyfills/-/js-polyfills-0.81.5.tgz",
      "integrity": "sha512-fB7M1CMOCIUudTRuj7kzxIBTVw2KXnsgbQ6+4cbqSxo8NmRRhA0Ul4ZUzZj3rFd3VznTL4Brmocv1oiN0bWZ8w==",
      "license": "MIT",
      "engines": {
        "node": ">= 20.19.4"
      }
    },
    "node_modules/@react-native/normalize-colors": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/normalize-colors/-/normalize-colors-0.81.5.tgz",
      "integrity": "sha512-0HuJ8YtqlTVRXGZuGeBejLE04wSQsibpTI+RGOyVqxZvgtlLLC/Ssw0UmbHhT4lYMp2fhdtvKZSs5emWB1zR/g==",
      "license": "MIT"
    },
    "node_modules/@rnmapbox/maps": {
      "version": "10.3.5",
      "resolved": "https://registry.npmjs.org/@rnmapbox/maps/-/maps-10.3.5.tgz",
      "integrity": "sha512-ShQppktl1H4HHPp/aninsEVK7+tsHmN48ULxpB1rfmx7W3WogB21Q1NAEw7CzxERnLZveijyutszJG2y3EBn2Q==",
      "license": "MIT",
      "workspaces": [
        "example"
      ],
      "dependencies": {
        "@turf/along": "6.5.0",
        "@turf/distance": "6.5.0",
        "@turf/helpers": "6.5.0",
        "@turf/length": "6.5.0",
        "@turf/nearest-point-on-line": "6.5.0",
        "@types/geojson": "^7946.0.7",
        "debounce": "^2.2.0"
      },
      "peerDependencies": {
        "expo": ">=47.0.0",
        "mapbox-gl": "^2.9.0",
        "react": ">=17.0.0",
        "react-dom": ">= 17.0.0",
        "react-native": ">=0.79"
      },
      "peerDependenciesMeta": {
        "expo": {
          "optional": true
        },
        "mapbox-gl": {
          "optional": true
        },
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.12.tgz",
      "integrity": "sha512-dB/a1214qKfHMXCpgqR4OZT+jS4kTyEXbQGJPqzobt5EwH5rX080pxE37alt3RzvR1bf1Yz/yGqRfrYAxuPw0A==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.12.tgz",
      "integrity": "sha512-7KHFgQ5VJxIHcLlrwrc3Xbds7oTNQT7Pgi9gQCJKrd2VGab/UksIOYp6VD8MzCstGxOKMgNamPwUCfxPdP1OHg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.12.tgz",
      "integrity": "sha512-3YIhqHD96nA5SaYNRBR16HnGv4oavZvXfD/ayHM+oYZ0WD/8lBAtf6zQua4kEyAvpqrluKXl0lnOBoiNby7x9w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.12.tgz",
      "integrity": "sha512-UuuJ35MFw4gmFOrE9pEqIV+K3syIKveph+Qc1/ljHZVdoDW4pz/JHR/eMVom+TZGl/5OOvGJOWaOCVt3ZfqhxA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.12.tgz",
      "integrity": "sha512-uMvssit0a4W+/7D8CbHUvG719mH3R2jwXAlh/XcPvuHTE0g++LymF88DCGNX0HM2rBOn0xrzgXktIB6fLSJBTQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.12.tgz",
      "integrity": "sha512-XcFu0R0xWnwzSf4IQgFH1rJIckPN1pLy2R+4r9IDB7Yfu/ys9cVqfa4pBrMHj7a3gl8mIR4nRNPg0e5IvEVs6g==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.12.tgz",
      "integrity": "sha512-260UrKgn8tz39ak+SMDOirKzr7V04M9dWPw5llW00SwBivCZoWcRBKV1d8cXnRkUmSZA3BdiUmBHWk7734Ulpw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.12.tgz",
      "integrity": "sha512-5YK1I9SqDkbPgc1IA8BgDl34suqUS2q0KWnBrirm0E51YjOs6eo6dV6jbQfNE/argHRSvd0QUGgtpIoYx+WWpw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.12.tgz",
      "integrity": "sha512-Rkcrmp7eFRg74yL5fXEU91JEWbdEPLevWwGtXpmhbjlD1StScbWTmO94Bhly+Mo+ketKYkdmM1vNUKeWSlx8cQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.12.tgz",
      "integrity": "sha512-qvK4DuAsQc2BSjlx+Xr+IzOIvvxbGZqxFwdWfG6F518Erj0GGISyQbJ6pIappnOxlNPzNHvo/L0BwB30GZ+zVw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.12.tgz",
      "integrity": "sha512-Q9uLBO53Xd4QIq1WOycVQyPP1O4HhraEV2qqb3uTrnVw6QZih9duY4vNXOivL1xoUS1/z+W8eF4NMfl2a8Sdjw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.12.tgz",
      "integrity": "sha512-3IBxWFMjbOZskDPKv8Lf9BCnahlKuHthWkYnyIxOH/QcJrFcS4EmcenthApkwr/5+nEqZlLzeYbxeMaX7A5u4g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.12.tgz",
      "integrity": "sha512-xtX61xg4LKPkPWilZU1ynKClz5Gj4bf74LML4r3eVLWumKnGjoEr1OSHQhMdbBDoYTi+yjrujvpZe2pUnqCrrA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.12.tgz",
      "integrity": "sha512-At7fPB6PCaIjzgIhEZFxuT+BBFqiQibJDT4d3PhiR3f4E7bbMZF4aKblbFfEM3sETRDd1YiQx/+U/g/B/ou5Ew==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.12.tgz",
      "integrity": "sha512-WIw2haVKwjuYdXkHaoC0mF8Le71TuCBxjrdKqLbJGctbBABj+ClfmNvtbOnzpq3RokNo5+V1qhtSzJyXorsklQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@sinclair/typebox": {
      "version": "0.27.10",
      "resolved": "https://registry.npmjs.org/@sinclair/typebox/-/typebox-0.27.10.tgz",
      "integrity": "sha512-MTBk/3jGLNB2tVxv6uLlFh1iu64iYOQ2PbdOSK3NW8JZsmlaOh2q6sdtKowBhfw8QFLmYNzTW4/oK4uATIi6ZA==",
      "license": "MIT"
    },
    "node_modules/@sinonjs/commons": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/@sinonjs/commons/-/commons-3.0.1.tgz",
      "integrity": "sha512-K3mCHKQ9sVh8o1C9cxkwxaOmXoAMlDxC1mYyHrjqOWEcBjYr76t96zL2zlj5dUGZ3HSw240X1qgH3Mjf1yJWpQ==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "type-detect": "4.0.8"
      }
    },
    "node_modules/@sinonjs/fake-timers": {
      "version": "10.3.0",
      "resolved": "https://registry.npmjs.org/@sinonjs/fake-timers/-/fake-timers-10.3.0.tgz",
      "integrity": "sha512-V4BG07kuYSUkTCSBHG8G8TNhM+F19jXFWnQtzj+we8DrkpSBCee9Z3Ms8yiGer/dlmhe35/Xdgyo3/0rQKg7YA==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@sinonjs/commons": "^3.0.0"
      }
    },
    "node_modules/@standard-schema/spec": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz",
      "integrity": "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@supabase/auth-js": {
      "version": "2.106.2",
      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.106.2.tgz",
      "integrity": "sha512-VcAjUErkHkhC5Jaf+g/G1qbkQrFh8edaCdHa7pxJmHUjkWKjT7UnYCtPA89XV0N0GIYRkEqJZw5V62CtOxTmBQ==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/functions-js": {
      "version": "2.106.2",
      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.106.2.tgz",
      "integrity": "sha512-oRnr0QrL8H+zTO1YyQ1QjiHZU/957jvubbxSJTUm2XLAgzoGGV9Tahfyd+uvLsBLRVmXLtpU3oyCjdQIvkGMOA==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/phoenix": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/@supabase/phoenix/-/phoenix-0.4.2.tgz",
      "integrity": "sha512-YSAGnmDAfuleFCVt3CeurQZAhxRfXWeZIIkwp7NhYzQ1UwW6ePSnzsFAiUm/mbCkfoCf70QQHKW/K6RKh52a4A==",
      "license": "MIT"
    },
    "node_modules/@supabase/postgrest-js": {
      "version": "2.106.2",
      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.106.2.tgz",
      "integrity": "sha512-tDOzyPgp9pIRMR2x6C9+uDSJrnXSzxLtt3d7nC+Lrsy3jnJDHYfdQC/xcRyhJE/TOBJ0heSqRKR3UmejDjZxsw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/realtime-js": {
      "version": "2.106.2",
      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.106.2.tgz",
      "integrity": "sha512-LdRGT7DNhyZkPjubUv5bSdAZ0jSEX8wTHvx7htj7+K59TOZRvz4TuQK7tL2RWxyIZVeFMRluL04SzWS61rKnUA==",
      "license": "MIT",
      "dependencies": {
        "@supabase/phoenix": "^0.4.2",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/storage-js": {
      "version": "2.106.2",
      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.106.2.tgz",
      "integrity": "sha512-xgKCSYuev1YarV+iVqr+zlfgSyremnJtn8T0NCT8L4XmMv1CLtESc0Q6kNp8+mKWdX/8ND0nzm7OMKx08kwNAw==",
      "license": "MIT",
      "dependencies": {
        "iceberg-js": "^0.8.1",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/supabase-js": {
      "version": "2.106.2",
      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.106.2.tgz",
      "integrity": "sha512-2/RZ/1fmJx/MRSEDG2Xk8+J4JVk5clM9V0uSI6kUTrcS32KA89DtqI5RUOC9r6mzY3WBC9qexLjssIHjbLyVJA==",
      "license": "MIT",
      "dependencies": {
        "@supabase/auth-js": "2.106.2",
        "@supabase/functions-js": "2.106.2",
        "@supabase/postgrest-js": "2.106.2",
        "@supabase/realtime-js": "2.106.2",
        "@supabase/storage-js": "2.106.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@svgr/babel-plugin-add-jsx-attribute": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-plugin-add-jsx-attribute/-/babel-plugin-add-jsx-attribute-8.0.0.tgz",
      "integrity": "sha512-b9MIk7yhdS1pMCZM8VeNfUlSKVRhsHZNMl5O9SfaX0l0t5wjdgu4IDzGB8bpnGBBOjGST3rRFVsaaEtI4W6f7g==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/babel-plugin-remove-jsx-attribute": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-plugin-remove-jsx-attribute/-/babel-plugin-remove-jsx-attribute-8.0.0.tgz",
      "integrity": "sha512-BcCkm/STipKvbCl6b7QFrMh/vx00vIP63k2eM66MfHJzPr6O2U0jYEViXkHJWqXqQYjdeA9cuCl5KWmlwjDvbA==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/babel-plugin-remove-jsx-empty-expression": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-plugin-remove-jsx-empty-expression/-/babel-plugin-remove-jsx-empty-expression-8.0.0.tgz",
      "integrity": "sha512-5BcGCBfBxB5+XSDSWnhTThfI9jcO5f0Ai2V24gZpG+wXF14BzwxxdDb4g6trdOux0rhibGs385BeFMSmxtS3uA==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/babel-plugin-replace-jsx-attribute-value": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-plugin-replace-jsx-attribute-value/-/babel-plugin-replace-jsx-attribute-value-8.0.0.tgz",
      "integrity": "sha512-KVQ+PtIjb1BuYT3ht8M5KbzWBhdAjjUPdlMtpuw/VjT8coTrItWX6Qafl9+ji831JaJcu6PJNKCV0bp01lBNzQ==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/babel-plugin-svg-dynamic-title": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-plugin-svg-dynamic-title/-/babel-plugin-svg-dynamic-title-8.0.0.tgz",
      "integrity": "sha512-omNiKqwjNmOQJ2v6ge4SErBbkooV2aAWwaPFs2vUY7p7GhVkzRkJ00kILXQvRhA6miHnNpXv7MRnnSjdRjK8og==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/babel-plugin-svg-em-dimensions": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-plugin-svg-em-dimensions/-/babel-plugin-svg-em-dimensions-8.0.0.tgz",
      "integrity": "sha512-mURHYnu6Iw3UBTbhGwE/vsngtCIbHE43xCRK7kCw4t01xyGqb2Pd+WXekRRoFOBIY29ZoOhUCTEweDMdrjfi9g==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/babel-plugin-transform-react-native-svg": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-plugin-transform-react-native-svg/-/babel-plugin-transform-react-native-svg-8.1.0.tgz",
      "integrity": "sha512-Tx8T58CHo+7nwJ+EhUwx3LfdNSG9R2OKfaIXXs5soiy5HtgoAEkDay9LIimLOcG8dJQH1wPZp/cnAv6S9CrR1Q==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/babel-plugin-transform-svg-component": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-plugin-transform-svg-component/-/babel-plugin-transform-svg-component-8.0.0.tgz",
      "integrity": "sha512-DFx8xa3cZXTdb/k3kfPeaixecQLgKh5NVBMwD0AQxOzcZawK4oo1Jh9LbrcACUivsCA7TLG8eeWgrDXjTMhRmw==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/babel-preset": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/@svgr/babel-preset/-/babel-preset-8.1.0.tgz",
      "integrity": "sha512-7EYDbHE7MxHpv4sxvnVPngw5fuR6pw79SkcrILHJ/iMpuKySNCl5W1qcwPEpU+LgyRXOaAFgH0KhwD18wwg6ug==",
      "license": "MIT",
      "dependencies": {
        "@svgr/babel-plugin-add-jsx-attribute": "8.0.0",
        "@svgr/babel-plugin-remove-jsx-attribute": "8.0.0",
        "@svgr/babel-plugin-remove-jsx-empty-expression": "8.0.0",
        "@svgr/babel-plugin-replace-jsx-attribute-value": "8.0.0",
        "@svgr/babel-plugin-svg-dynamic-title": "8.0.0",
        "@svgr/babel-plugin-svg-em-dimensions": "8.0.0",
        "@svgr/babel-plugin-transform-react-native-svg": "8.1.0",
        "@svgr/babel-plugin-transform-svg-component": "8.0.0"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@svgr/core": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/@svgr/core/-/core-8.1.0.tgz",
      "integrity": "sha512-8QqtOQT5ACVlmsvKOJNEaWmRPmcojMOzCz4Hs2BGG/toAp/K38LcsMRyLp349glq5AzJbCEeimEoxaX6v/fLrA==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.21.3",
        "@svgr/babel-preset": "8.1.0",
        "camelcase": "^6.2.0",
        "cosmiconfig": "^8.1.3",
        "snake-case": "^3.0.4"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      }
    },
    "node_modules/@svgr/hast-util-to-babel-ast": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/@svgr/hast-util-to-babel-ast/-/hast-util-to-babel-ast-8.0.0.tgz",
      "integrity": "sha512-EbDKwO9GpfWP4jN9sGdYwPBU0kdomaPIL2Eu4YwmgP+sJeXT+L7bMwJUBnhzfH8Q2qMBqZ4fJwpCyYsAN3mt2Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.21.3",
        "entities": "^4.4.0"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      }
    },
    "node_modules/@svgr/plugin-jsx": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/@svgr/plugin-jsx/-/plugin-jsx-8.1.0.tgz",
      "integrity": "sha512-0xiIyBsLlr8quN+WyuxooNW9RJ0Dpr8uOnH/xrCVO8GLUcwHISwj1AG0k+LFzteTkAA0GbX0kj9q6Dk70PTiPA==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.21.3",
        "@svgr/babel-preset": "8.1.0",
        "@svgr/hast-util-to-babel-ast": "8.0.0",
        "svg-parser": "^2.0.4"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@svgr/core": "*"
      }
    },
    "node_modules/@svgr/plugin-svgo": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/@svgr/plugin-svgo/-/plugin-svgo-8.1.0.tgz",
      "integrity": "sha512-Ywtl837OGO9pTLIN/onoWLmDQ4zFUycI1g76vuKGEz6evR/ZTJlJuz3G/fIkb6OVBJ2g0o6CGJzaEjfmEo3AHA==",
      "license": "MIT",
      "dependencies": {
        "cosmiconfig": "^8.1.3",
        "deepmerge": "^4.3.1",
        "svgo": "^3.0.2"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/gregberge"
      },
      "peerDependencies": {
        "@svgr/core": "*"
      }
    },
    "node_modules/@turf/along": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/along/-/along-6.5.0.tgz",
      "integrity": "sha512-LLyWQ0AARqJCmMcIEAXF4GEu8usmd4Kbz3qk1Oy5HoRNpZX47+i5exQtmIWKdqJ1MMhW26fCTXgpsEs5zgJ5gw==",
      "license": "MIT",
      "dependencies": {
        "@turf/bearing": "^6.5.0",
        "@turf/destination": "^6.5.0",
        "@turf/distance": "^6.5.0",
        "@turf/helpers": "^6.5.0",
        "@turf/invariant": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/bbox": {
      "version": "7.3.5",
      "resolved": "https://registry.npmjs.org/@turf/bbox/-/bbox-7.3.5.tgz",
      "integrity": "sha512-oG1ya/HtBjAIg4TimbWx+nOYPbY0bCvt82Bq8tm6sBw3qqtbOyRSfDz79Sq90TnH7DXJprJ1qnVGKNtZ6jemfw==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "7.3.5",
        "@turf/meta": "7.3.5",
        "@types/geojson": "^7946.0.10",
        "tslib": "^2.8.1"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/bbox/node_modules/@turf/helpers": {
      "version": "7.3.5",
      "resolved": "https://registry.npmjs.org/@turf/helpers/-/helpers-7.3.5.tgz",
      "integrity": "sha512-E/NMGV5MwbjjP7AJXBtsanC3yY8N2MQ87IGdIgkB2ji5AtBpwnH4L3gEqpYN4RlCJJWbLbzO91BbKv2waUd0eg==",
      "license": "MIT",
      "dependencies": {
        "@types/geojson": "^7946.0.10",
        "tslib": "^2.8.1"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/bbox/node_modules/@turf/meta": {
      "version": "7.3.5",
      "resolved": "https://registry.npmjs.org/@turf/meta/-/meta-7.3.5.tgz",
      "integrity": "sha512-r+ohqxoyqeigFB0oFrQx/YEHIkOKqcKpCjvZkvZs7Tkv+IFco5MezAd2zd4rzK+0DfFgDP3KpJc7HqrYjvEjhg==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "7.3.5",
        "@types/geojson": "^7946.0.10",
        "tslib": "^2.8.1"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/bearing": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/bearing/-/bearing-6.5.0.tgz",
      "integrity": "sha512-dxINYhIEMzgDOztyMZc20I7ssYVNEpSv04VbMo5YPQsqa80KO3TFvbuCahMsCAW5z8Tncc8dwBlEFrmRjJG33A==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "^6.5.0",
        "@turf/invariant": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/destination": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/destination/-/destination-6.5.0.tgz",
      "integrity": "sha512-4cnWQlNC8d1tItOz9B4pmJdWpXqS0vEvv65bI/Pj/genJnsL7evI0/Xw42RvEGROS481MPiU80xzvwxEvhQiMQ==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "^6.5.0",
        "@turf/invariant": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/distance": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/distance/-/distance-6.5.0.tgz",
      "integrity": "sha512-xzykSLfoURec5qvQJcfifw/1mJa+5UwByZZ5TZ8iaqjGYN0vomhV9aiSLeYdUGtYRESZ+DYC/OzY+4RclZYgMg==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "^6.5.0",
        "@turf/invariant": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/helpers": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/helpers/-/helpers-6.5.0.tgz",
      "integrity": "sha512-VbI1dV5bLFzohYYdgqwikdMVpe7pJ9X3E+dlr425wa2/sMJqYDhTO++ec38/pcPvPE6oD9WEEeU3Xu3gza+VPw==",
      "license": "MIT",
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/invariant": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/invariant/-/invariant-6.5.0.tgz",
      "integrity": "sha512-Wv8PRNCtPD31UVbdJE/KVAWKe7l6US+lJItRR/HOEW3eh+U/JwRCSUl/KZ7bmjM/C+zLNoreM2TU6OoLACs4eg==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/length": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/length/-/length-6.5.0.tgz",
      "integrity": "sha512-5pL5/pnw52fck3oRsHDcSGrj9HibvtlrZ0QNy2OcW8qBFDNgZ4jtl6U7eATVoyWPKBHszW3dWETW+iLV7UARig==",
      "license": "MIT",
      "dependencies": {
        "@turf/distance": "^6.5.0",
        "@turf/helpers": "^6.5.0",
        "@turf/meta": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/line-intersect": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/line-intersect/-/line-intersect-6.5.0.tgz",
      "integrity": "sha512-CS6R1tZvVQD390G9Ea4pmpM6mJGPWoL82jD46y0q1KSor9s6HupMIo1kY4Ny+AEYQl9jd21V3Scz20eldpbTVA==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "^6.5.0",
        "@turf/invariant": "^6.5.0",
        "@turf/line-segment": "^6.5.0",
        "@turf/meta": "^6.5.0",
        "geojson-rbush": "3.x"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/line-segment": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/line-segment/-/line-segment-6.5.0.tgz",
      "integrity": "sha512-jI625Ho4jSuJESNq66Mmi290ZJ5pPZiQZruPVpmHkUw257Pew0alMmb6YrqYNnLUuiVVONxAAKXUVeeUGtycfw==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "^6.5.0",
        "@turf/invariant": "^6.5.0",
        "@turf/meta": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/meta": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/meta/-/meta-6.5.0.tgz",
      "integrity": "sha512-RrArvtsV0vdsCBegoBtOalgdSOfkBrTJ07VkpiCnq/491W67hnMWmDu7e6Ztw0C3WldRYTXkg3SumfdzZxLBHA==",
      "license": "MIT",
      "dependencies": {
        "@turf/helpers": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@turf/nearest-point-on-line": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/@turf/nearest-point-on-line/-/nearest-point-on-line-6.5.0.tgz",
      "integrity": "sha512-WthrvddddvmymnC+Vf7BrkHGbDOUu6Z3/6bFYUGv1kxw8tiZ6n83/VG6kHz4poHOfS0RaNflzXSkmCi64fLBlg==",
      "license": "MIT",
      "dependencies": {
        "@turf/bearing": "^6.5.0",
        "@turf/destination": "^6.5.0",
        "@turf/distance": "^6.5.0",
        "@turf/helpers": "^6.5.0",
        "@turf/invariant": "^6.5.0",
        "@turf/line-intersect": "^6.5.0",
        "@turf/meta": "^6.5.0"
      },
      "funding": {
        "url": "https://opencollective.com/turf"
      }
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.27.0",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.28.2"
      }
    },
    "node_modules/@types/chai": {
      "version": "5.2.3",
      "resolved": "https://registry.npmjs.org/@types/chai/-/chai-5.2.3.tgz",
      "integrity": "sha512-Mw558oeA9fFbv65/y4mHtXDs9bPnFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/deep-eql": "*",
        "assertion-error": "^2.0.1"
      }
    },
    "node_modules/@types/deep-eql": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@types/deep-eql/-/deep-eql-4.0.2.tgz",
      "integrity": "sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/estree": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/geojson": {
      "version": "7946.0.16",
      "resolved": "https://registry.npmjs.org/@types/geojson/-/geojson-7946.0.16.tgz",
      "integrity": "sha512-6C8nqWur3j98U6+lXDfTUWIfgvZU+EumvpHKcYjujKH7woYyLj2sUmff0tRhrqM7BohUw7Pz3ZB1jj2gW9Fvmg==",
      "license": "MIT"
    },
    "node_modules/@types/graceful-fs": {
      "version": "4.1.9",
      "resolved": "https://registry.npmjs.org/@types/graceful-fs/-/graceful-fs-4.1.9.tgz",
      "integrity": "sha512-olP3sd1qOEe5dXTSaFvQG+02VdRXcdytWLAZsAq1PecU8uqQAhkrnbli7DagjtXKW/Bl7YJbUsa8MPcuc8LHEQ==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/istanbul-lib-coverage": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/@types/istanbul-lib-coverage/-/istanbul-lib-coverage-2.0.6.tgz",
      "integrity": "sha512-2QF/t/auWm0lsy8XtKVPG19v3sSOQlJe/YHZgfjb/KBBHOGSV+J2q/S671rcq9uTBrLAXmZpqJiaQbMT+zNU1w==",
      "license": "MIT"
    },
    "node_modules/@types/istanbul-lib-report": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/@types/istanbul-lib-report/-/istanbul-lib-report-3.0.3.tgz",
      "integrity": "sha512-NQn7AHQnk/RSLOxrBbGyJM/aVQ+pjj5HCgasFxc0K/KhoATfQ/47AyUl15I2yBUpihjmas+a+VJBOqecrFH+uA==",
      "license": "MIT",
      "dependencies": {
        "@types/istanbul-lib-coverage": "*"
      }
    },
    "node_modules/@types/istanbul-reports": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/istanbul-reports/-/istanbul-reports-3.0.4.tgz",
      "integrity": "sha512-pk2B1NWalF9toCRu6gjBzR69syFjP4Od8WRAX+0mmf9lAjCRicLOWc+ZrxZHx/0XRjotgkF9t6iaMJ+aXcOdZQ==",
      "license": "MIT",
      "dependencies": {
        "@types/istanbul-lib-report": "*"
      }
    },
    "node_modules/@types/node": {
      "version": "25.9.1",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-25.9.1.tgz",
      "integrity": "sha512-xfrlY7UD5rMJk3ZVJP8BNzS28J36YJg+xp+LPXV1TdWxr8uMH5A860QNxYDGQe/ylDSgjxE52Q9VnO7p75tJxg==",
      "license": "MIT",
      "dependencies": {
        "undici-types": ">=7.24.0 <7.24.7"
      }
    },
    "node_modules/@types/react": {
      "version": "19.1.17",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.1.17.tgz",
      "integrity": "sha512-Qec1E3mhALmaspIrhWt9jkQMNdw6bReVu64mjvhbhq2NFPftLPVr+l1SZgmw/66WwBNpDh7ao5AT6gF5v41PFA==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.0.2"
      }
    },
    "node_modules/@types/stack-utils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/@types/stack-utils/-/stack-utils-2.0.3.tgz",
      "integrity": "sha512-9aEbYZ3TbYMznPdcdr3SmIrLXwC/AKZXQeCf9Pgao5CKb8CyHuEX5jzWPTkvregvhRJHcpRO6BFoGW9ycaOkYw==",
      "license": "MIT"
    },
    "node_modules/@types/yargs": {
      "version": "17.0.35",
      "resolved": "https://registry.npmjs.org/@types/yargs/-/yargs-17.0.35.tgz",
      "integrity": "sha512-qUHkeCyQFxMXg79wQfTtfndEC+N9ZZg76HJftDJp+qH2tV7Gj4OJi7l+PiWwJ+pWtW8GwSmqsDj/oymhrTWXjg==",
      "license": "MIT",
      "dependencies": {
        "@types/yargs-parser": "*"
      }
    },
    "node_modules/@types/yargs-parser": {
      "version": "21.0.3",
      "resolved": "https://registry.npmjs.org/@types/yargs-parser/-/yargs-parser-21.0.3.tgz",
      "integrity": "sha512-I4q9QU9MQv4oEOz4tAHJtNz1cwuLxn2F3xcc2iV5WdqLPpUnj30aUuxt1mAxYTG+oe8CZMV/+6rU4S4gRDzqtQ==",
      "license": "MIT"
    },
    "node_modules/@ungap/structured-clone": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/@ungap/structured-clone/-/structured-clone-1.3.1.tgz",
      "integrity": "sha512-mUFwbeTqrVgDQxFveS+df2yfap6iuP20NAKAsBt5jDEoOTDew+zwLAOilHCeQJOVSvmgCX4ogqIrA0mnyr08yQ==",
      "license": "ISC"
    },
    "node_modules/@urql/core": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@urql/core/-/core-5.2.0.tgz",
      "integrity": "sha512-/n0ieD0mvvDnVAXEQgX/7qJiVcvYvNkOHeBvkwtylfjydar123caCXcl58PXFY11oU1oquJocVXHxLAbtv4x1A==",
      "license": "MIT",
      "dependencies": {
        "@0no-co/graphql.web": "^1.0.13",
        "wonka": "^6.3.2"
      }
    },
    "node_modules/@urql/exchange-retry": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@urql/exchange-retry/-/exchange-retry-1.3.2.tgz",
      "integrity": "sha512-TQMCz2pFJMfpNxmSfX1VSfTjwUIFx/mL+p1bnfM1xjjdla7Z+KnGMW/EhFbpckp3LyWAH4PgOsMwOMnIN+MBFg==",
      "license": "MIT",
      "dependencies": {
        "@urql/core": "^5.1.2",
        "wonka": "^6.3.2"
      },
      "peerDependencies": {
        "@urql/core": "^5.0.0"
      }
    },
    "node_modules/@vitest/coverage-v8": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/@vitest/coverage-v8/-/coverage-v8-4.1.11.tgz",
      "integrity": "sha512-8MVGEFnJIcdGjcbfKmeq8z0pZHH0JlVtoVZH9Q/qwUp6wyFnEJUBMrw9DCaj+ra3vShGmhavjalMIhPNxZAUcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@bcoe/v8-coverage": "^1.0.2",
        "@vitest/utils": "4.1.11",
        "ast-v8-to-istanbul": "^1.0.0",
        "istanbul-lib-coverage": "^3.2.2",
        "istanbul-lib-report": "^3.0.1",
        "istanbul-reports": "^3.2.0",
        "magicast": "^0.5.2",
        "obug": "^2.1.1",
        "std-env": "^4.0.0-rc.1",
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "@vitest/browser": "4.1.11",
        "vitest": "4.1.11"
      },
      "peerDependenciesMeta": {
        "@vitest/browser": {
          "optional": true
        }
      }
    },
    "node_modules/@vitest/expect": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-4.1.11.tgz",
      "integrity": "sha512-VX2x5vNJXET47KAFzwERI+KRMtTTCSWTfSMKsW7JsUsXV4psq++e3DvZpuTDOpHcxytiDs6p2nhVb2tVDiiUYw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.1.0",
        "@types/chai": "^5.2.2",
        "@vitest/spy": "4.1.11",
        "@vitest/utils": "4.1.11",
        "chai": "^6.2.2",
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/mocker": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-4.1.11.tgz",
      "integrity": "sha512-2XJVD55d1o5AZous5CCGKS74g/riOj9odEt2bQpCVZeblHyHdnMeFl4jl0XjU21stf4mbjUkew2eXQZt65g5CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/spy": "4.1.11",
        "estree-walker": "^3.0.3",
        "magic-string": "^0.30.21"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "msw": "^2.4.9",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "msw": {
          "optional": true
        },
        "vite": {
          "optional": true
        }
      }
    },
    "node_modules/@vitest/pretty-format": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-4.1.11.tgz",
      "integrity": "sha512-yiZzPbGTS9Sr/JpFl8zHrcIkAofNbFV6k21vIgQN/cY/oxZeXhJv5sc/MBJ5jFKWmWs+oJHw0UXLZjmf931+Vw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/runner": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-4.1.11.tgz",
      "integrity": "sha512-LztvUgdwMNJMIkj3hQnnxiC2Xy1zNxq928W/xhjCLaNCzqTZOudjwbQf6v9IntZGPw132i2Lq2rgTRZHD3JHNw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/utils": "4.1.11",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/snapshot": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-4.1.11.tgz",
      "integrity": "sha512-pN7ikn1ON7h8ee4gIAp4AzyK+zBtJPzVbqOgu5LCEh4VaJVbPQcgYQYJIMGQPXVeJJq1fnfazis7a5pFNPahog==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.1.11",
        "@vitest/utils": "4.1.11",
        "magic-string": "^0.30.21",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/spy": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-4.1.11.tgz",
      "integrity": "sha512-apNa/prQy2qCeywhnixOHPRCgGNhvg7T4Dapfl1GahLp/R+uhBm5cPyFoNVyqsNd2h1nJxL6BqqdIjiABL60YA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/utils": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-4.1.11.tgz",
      "integrity": "sha512-zTCVGpyFsGWBhllOyKlTw/vnr6D9qxsfSDyfbyZmTyjHw5N/VuvzHpHoQjm2ZJzn4RJgx5w4r7V0er69CmLgPQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.1.11",
        "convert-source-map": "^2.0.0",
        "tinyrainbow": "^3.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@xmldom/xmldom": {
      "version": "0.8.15",
      "resolved": "https://registry.npmjs.org/@xmldom/xmldom/-/xmldom-0.8.15.tgz",
      "integrity": "sha512-/5NV/vDALVFDXgLmfsy9TRCBlKwO2LNBFzpzvb9iIj+jR+eSc6DLYYvVOdivT/jm7MtU6TebYuRmzEOI7w40UA==",
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/abort-controller": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/abort-controller/-/abort-controller-3.0.0.tgz",
      "integrity": "sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==",
      "license": "MIT",
      "dependencies": {
        "event-target-shim": "^5.0.0"
      },
      "engines": {
        "node": ">=6.5"
      }
    },
    "node_modules/accepts": {
      "version": "1.3.8",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.8.tgz",
      "integrity": "sha512-PYAthTa2m2VKxuvSD3DPC/Gy+U+sOA1LAuT8mkmRuvw+NACSaeXEQ+NHcVF7rONl6qcaxV3Uuemwawk+7+SJLw==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "~2.1.34",
        "negotiator": "0.6.3"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/acorn": {
      "version": "8.16.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.16.0.tgz",
      "integrity": "sha512-UVJyE9MttOsBQIDKw1skb9nAwQuR5wuGD3+82K6JgJlm/Y+KI92oNsMNGZCYdDsVtRHSak0pcV5Dno5+4jh9sw==",
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/agent-cli-detector": {
      "version": "0.1.7",
      "resolved": "https://registry.npmjs.org/agent-cli-detector/-/agent-cli-detector-0.1.7.tgz",
      "integrity": "sha512-d8OWDVdZMgjhLUT9ZPgSv/BdFFF9pVuscC0JdUSz3bjwE15gcp6u/o0/JooM2yyAWC49KThFhXlgTXRa9B7yng==",
      "license": "MIT",
      "bin": {
        "agent-cli-detector": "dist/cli.js"
      },
      "engines": {
        "node": ">=18.18"
      }
    },
    "node_modules/ajv": {
      "version": "8.20.0",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-8.20.0.tgz",
      "integrity": "sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==",
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.3",
        "fast-uri": "^3.0.1",
        "json-schema-traverse": "^1.0.0",
        "require-from-string": "^2.0.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/anser": {
      "version": "1.4.10",
      "resolved": "https://registry.npmjs.org/anser/-/anser-1.4.10.tgz",
      "integrity": "sha512-hCv9AqTQ8ycjpSd3upOJd7vFwW1JaoYQ7tpham03GJ1ca8/65rqn0RpaWpItOAd6ylW9wAw6luXYPJIyPFVOww==",
      "license": "MIT"
    },
    "node_modules/ansi-escapes": {
      "version": "4.3.2",
      "resolved": "https://registry.npmjs.org/ansi-escapes/-/ansi-escapes-4.3.2.tgz",
      "integrity": "sha512-gKXj5ALrKWQLsYG9jlTRmR/xKluxHV+Z9QEwNIgCfM1/uwPMCuzVVnh5mwTd+OuBZcwSIMbqssNWRm1lE51QaQ==",
      "license": "MIT",
      "dependencies": {
        "type-fest": "^0.21.3"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/ansi-escapes/node_modules/type-fest": {
      "version": "0.21.3",
      "resolved": "https://registry.npmjs.org/type-fest/-/type-fest-0.21.3.tgz",
      "integrity": "sha512-t0rzBq87m3fVcduHDUFhKmyyX+9eo6WQjZvf51Ea/M0Q7+T374Jp1aUiyUl0GKxp8M/OETVHSDvmkyPgvX+X2w==",
      "license": "(MIT OR CC0-1.0)",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
      "license": "MIT"
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "license": "ISC",
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/arg": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
      "license": "MIT"
    },
    "node_modules/argparse": {
      "version": "1.0.10",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-1.0.10.tgz",
      "integrity": "sha512-o5Roy6tNG4SL/FOkCAN6RzjiakZS25RLYFrcMttJqbdd8BWrnA+fGz57iN5Pb06pvBGvl5gQ0B48dJlslXvoTg==",
      "license": "MIT",
      "dependencies": {
        "sprintf-js": "~1.0.2"
      }
    },
    "node_modules/asap": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/asap/-/asap-2.0.6.tgz",
      "integrity": "sha512-BSHWgDSAiKs50o2Re8ppvp3seVHXSRM44cdSsT9FfNEUUZLOGWVCsiWaRPWM1Znn+mqZ1OfVZ3z3DWEzSp7hRA==",
      "license": "MIT"
    },
    "node_modules/assert": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/assert/-/assert-2.1.0.tgz",
      "integrity": "sha512-eLHpSK/Y4nhMJ07gDaAzoX/XAKS8PSaojml3M0DM4JpV1LAi5JOJ/p6H/XWrl8L+DzVEvVCW1z3vWAaB9oTsQw==",
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.2",
        "is-nan": "^1.3.2",
        "object-is": "^1.1.5",
        "object.assign": "^4.1.4",
        "util": "^0.12.5"
      }
    },
    "node_modules/assertion-error": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",
      "integrity": "sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/ast-v8-to-istanbul": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/ast-v8-to-istanbul/-/ast-v8-to-istanbul-1.0.7.tgz",
      "integrity": "sha512-kFL68AG6ajd8fg248zwM9GQrUWEp79gsmjum34OEXjs4yHuUMZfYKwOLW9GMmB4oNvVrj+EAGxsP7ye2UR9UlA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/trace-mapping": "^0.3.31",
        "estree-walker": "^3.0.3",
        "js-tokens": "^10.0.0"
      }
    },
    "node_modules/ast-v8-to-istanbul/node_modules/js-tokens": {
      "version": "10.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-10.0.0.tgz",
      "integrity": "sha512-lM/UBzQmfJRo9ABXbPWemivdCW8V2G8FHaHdypQaIy523snUjog0W71ayWXTjiR+ixeMyVHN2XcpnTd/liPg/Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/async-limiter": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/async-limiter/-/async-limiter-1.0.1.tgz",
      "integrity": "sha512-csOlWGAcRFJaI6m+F2WKdnMKr4HhdhFVBk0H/QbJFMCr+uO2kwohwXQPxw/9OCxp05r5ghVBFSyioixx3gfkNQ==",
      "license": "MIT"
    },
    "node_modules/available-typed-arrays": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/available-typed-arrays/-/available-typed-arrays-1.0.7.tgz",
      "integrity": "sha512-wvUjBtSGN7+7SjNpq/9M2Tg350UZD3q62IFZLbRAR1bSMlCo1ZaeW+BJ+D090e4hIIZLBcTDWe4Mh4jvUDajzQ==",
      "license": "MIT",
      "dependencies": {
        "possible-typed-array-names": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/babel-jest": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/babel-jest/-/babel-jest-29.7.0.tgz",
      "integrity": "sha512-BrvGY3xZSwEcCzKvKsCi2GgHqDqsYkOP4/by5xCgIwGXQxIEh+8ew3gmrE1y7XRR6LHZIj6yLYnUi/mm2KXKBg==",
      "license": "MIT",
      "dependencies": {
        "@jest/transform": "^29.7.0",
        "@types/babel__core": "^7.1.14",
        "babel-plugin-istanbul": "^6.1.1",
        "babel-preset-jest": "^29.6.3",
        "chalk": "^4.0.0",
        "graceful-fs": "^4.2.9",
        "slash": "^3.0.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.8.0"
      }
    },
    "node_modules/babel-plugin-istanbul": {
      "version": "6.1.1",
      "resolved": "https://registry.npmjs.org/babel-plugin-istanbul/-/babel-plugin-istanbul-6.1.1.tgz",
      "integrity": "sha512-Y1IQok9821cC9onCx5otgFfRm7Lm+I+wwxOx738M/WLPZ9Q42m4IG5W0FNX8WLL2gYMZo3JkuXIH2DOpWM+qwA==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.0.0",
        "@istanbuljs/load-nyc-config": "^1.0.0",
        "@istanbuljs/schema": "^0.1.2",
        "istanbul-lib-instrument": "^5.0.4",
        "test-exclude": "^6.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/babel-plugin-jest-hoist": {
      "version": "29.6.3",
      "resolved": "https://registry.npmjs.org/babel-plugin-jest-hoist/-/babel-plugin-jest-hoist-29.6.3.tgz",
      "integrity": "sha512-ESAc/RJvGTFEzRwOTT4+lNDk/GNHMkKbNzsvT0qKRfDyyYTskxB5rnU2njIDYVxXCBHHEI1c0YwHob3WaYujOg==",
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.3.3",
        "@babel/types": "^7.3.3",
        "@types/babel__core": "^7.1.14",
        "@types/babel__traverse": "^7.0.6"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/babel-plugin-polyfill-corejs2": {
      "version": "0.4.17",
      "resolved": "https://registry.npmjs.org/babel-plugin-polyfill-corejs2/-/babel-plugin-polyfill-corejs2-0.4.17.tgz",
      "integrity": "sha512-aTyf30K/rqAsNwN76zYrdtx8obu0E4KoUME29B1xj+B3WxgvWkp943vYQ+z8Mv3lw9xHXMHpvSPOBxzAkIa94w==",
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.28.6",
        "@babel/helper-define-polyfill-provider": "^0.6.8",
        "semver": "^6.3.1"
      },
      "peerDependencies": {
        "@babel/core": "^7.4.0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/babel-plugin-polyfill-corejs3": {
      "version": "0.13.0",
      "resolved": "https://registry.npmjs.org/babel-plugin-polyfill-corejs3/-/babel-plugin-polyfill-corejs3-0.13.0.tgz",
      "integrity": "sha512-U+GNwMdSFgzVmfhNm8GJUX88AadB3uo9KpJqS3FaqNIPKgySuvMb+bHPsOmmuWyIcuqZj/pzt1RUIUZns4y2+A==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-define-polyfill-provider": "^0.6.5",
        "core-js-compat": "^3.43.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.4.0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/babel-plugin-polyfill-regenerator": {
      "version": "0.6.8",
      "resolved": "https://registry.npmjs.org/babel-plugin-polyfill-regenerator/-/babel-plugin-polyfill-regenerator-0.6.8.tgz",
      "integrity": "sha512-M762rNHfSF1EV3SLtnCJXFoQbbIIz0OyRwnCmV0KPC7qosSfCO0QLTSuJX3ayAebubhE6oYBAYPrBA5ljowaZg==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-define-polyfill-provider": "^0.6.8"
      },
      "peerDependencies": {
        "@babel/core": "^7.4.0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/babel-plugin-react-compiler": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/babel-plugin-react-compiler/-/babel-plugin-react-compiler-1.0.0.tgz",
      "integrity": "sha512-Ixm8tFfoKKIPYdCCKYTsqv+Fd4IJ0DQqMyEimo+pxUOMUR9cVPlwTrFt9Avu+3cb6Zp3mAzl+t1MrG2fxxKsxw==",
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.26.0"
      }
    },
    "node_modules/babel-plugin-react-native-web": {
      "version": "0.21.2",
      "resolved": "https://registry.npmjs.org/babel-plugin-react-native-web/-/babel-plugin-react-native-web-0.21.2.tgz",
      "integrity": "sha512-SPD0J6qjJn8231i0HZhlAGH6NORe+QvRSQM2mwQEzJ2Fb3E4ruWTiiicPlHjmeWShDXLcvoorOCXjeR7k/lyWA==",
      "license": "MIT"
    },
    "node_modules/babel-plugin-syntax-hermes-parser": {
      "version": "0.29.1",
      "resolved": "https://registry.npmjs.org/babel-plugin-syntax-hermes-parser/-/babel-plugin-syntax-hermes-parser-0.29.1.tgz",
      "integrity": "sha512-2WFYnoWGdmih1I1J5eIqxATOeycOqRwYxAQBu3cUu/rhwInwHUg7k60AFNbuGjSDL8tje5GDrAnxzRLcu2pYcA==",
      "license": "MIT",
      "dependencies": {
        "hermes-parser": "0.29.1"
      }
    },
    "node_modules/babel-plugin-transform-flow-enums": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/babel-plugin-transform-flow-enums/-/babel-plugin-transform-flow-enums-0.0.2.tgz",
      "integrity": "sha512-g4aaCrDDOsWjbm0PUUeVnkcVd6AKJsVc/MbnPhEotEpkeJQP6b8nzewohQi7+QS8UyPehOhGWn0nOwjvWpmMvQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/plugin-syntax-flow": "^7.12.1"
      }
    },
    "node_modules/babel-preset-current-node-syntax": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/babel-preset-current-node-syntax/-/babel-preset-current-node-syntax-1.2.0.tgz",
      "integrity": "sha512-E/VlAEzRrsLEb2+dv8yp3bo4scof3l9nR4lrld+Iy5NyVqgVYUJnDAmunkhPMisRI32Qc4iRiz425d8vM++2fg==",
      "license": "MIT",
      "dependencies": {
        "@babel/plugin-syntax-async-generators": "^7.8.4",
        "@babel/plugin-syntax-bigint": "^7.8.3",
        "@babel/plugin-syntax-class-properties": "^7.12.13",
        "@babel/plugin-syntax-class-static-block": "^7.14.5",
        "@babel/plugin-syntax-import-attributes": "^7.24.7",
        "@babel/plugin-syntax-import-meta": "^7.10.4",
        "@babel/plugin-syntax-json-strings": "^7.8.3",
        "@babel/plugin-syntax-logical-assignment-operators": "^7.10.4",
        "@babel/plugin-syntax-nullish-coalescing-operator": "^7.8.3",
        "@babel/plugin-syntax-numeric-separator": "^7.10.4",
        "@babel/plugin-syntax-object-rest-spread": "^7.8.3",
        "@babel/plugin-syntax-optional-catch-binding": "^7.8.3",
        "@babel/plugin-syntax-optional-chaining": "^7.8.3",
        "@babel/plugin-syntax-private-property-in-object": "^7.14.5",
        "@babel/plugin-syntax-top-level-await": "^7.14.5"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0 || ^8.0.0-0"
      }
    },
    "node_modules/babel-preset-expo": {
      "version": "54.0.12",
      "resolved": "https://registry.npmjs.org/babel-preset-expo/-/babel-preset-expo-54.0.12.tgz",
      "integrity": "sha512-6xeSkdaixmQhWSYL7tfLu0pOS0BY+8ftwmdNSHtpEFSizrXYZkCjk/B6Dxr+6nwNRihixMcS0aBlWS1wlDl3pw==",
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.25.9",
        "@babel/plugin-proposal-decorators": "^7.12.9",
        "@babel/plugin-proposal-export-default-from": "^7.24.7",
        "@babel/plugin-syntax-export-default-from": "^7.24.7",
        "@babel/plugin-transform-class-static-block": "^7.27.1",
        "@babel/plugin-transform-export-namespace-from": "^7.25.9",
        "@babel/plugin-transform-flow-strip-types": "^7.25.2",
        "@babel/plugin-transform-modules-commonjs": "^7.24.8",
        "@babel/plugin-transform-object-rest-spread": "^7.24.7",
        "@babel/plugin-transform-parameters": "^7.24.7",
        "@babel/plugin-transform-private-methods": "^7.24.7",
        "@babel/plugin-transform-private-property-in-object": "^7.24.7",
        "@babel/plugin-transform-runtime": "^7.24.7",
        "@babel/preset-react": "^7.22.15",
        "@babel/preset-typescript": "^7.23.0",
        "@react-native/babel-preset": "0.81.5",
        "babel-plugin-react-compiler": "^1.0.0",
        "babel-plugin-react-native-web": "~0.21.0",
        "babel-plugin-syntax-hermes-parser": "^0.29.1",
        "babel-plugin-transform-flow-enums": "^0.0.2",
        "debug": "^4.3.4",
        "resolve-from": "^5.0.0"
      },
      "peerDependencies": {
        "@babel/runtime": "^7.20.0",
        "expo": "*",
        "react-refresh": ">=0.14.0 <1.0.0"
      },
      "peerDependenciesMeta": {
        "@babel/runtime": {
          "optional": true
        },
        "expo": {
          "optional": true
        }
      }
    },
    "node_modules/babel-preset-jest": {
      "version": "29.6.3",
      "resolved": "https://registry.npmjs.org/babel-preset-jest/-/babel-preset-jest-29.6.3.tgz",
      "integrity": "sha512-0B3bhxR6snWXJZtR/RliHTDPRgn1sNHOR0yVtq/IiQFyuOVjFS+wuio/R4gSNkyYmKmJB4wGZv2NZanmKmTnNA==",
      "license": "MIT",
      "dependencies": {
        "babel-plugin-jest-hoist": "^29.6.3",
        "babel-preset-current-node-syntax": "^1.0.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/badgin": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/badgin/-/badgin-1.2.3.tgz",
      "integrity": "sha512-NQGA7LcfCpSzIbGRbkgjgdWkjy7HI+Th5VLxTJfW5EeaAf3fnS+xWQaQOCYiny+q6QSvxqoSO04vCx+4u++EJw==",
      "license": "MIT"
    },
    "node_modules/balanced-match": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz",
      "integrity": "sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==",
      "license": "MIT",
      "engines": {
        "node": "18 || 20 || >=22"
      }
    },
    "node_modules/base64-js": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",
      "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.27",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.27.tgz",
      "integrity": "sha512-ElY12DaROGuan+lMmZ8Cvo/ZUbXPe7Enc/9VU/b1T3Kp4dwytRcNdR8DoSJN5SNJT/CuvcCA0DHDVmMOCePdRQ==",
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/better-opn": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/better-opn/-/better-opn-3.0.2.tgz",
      "integrity": "sha512-aVNobHnJqLiUelTaHat9DZ1qM2w0C0Eym4LPI/3JxOnSokGVdsl1T1kN7TFvsEAD8G47A6VKQ0TVHqbBnYMJlQ==",
      "license": "MIT",
      "dependencies": {
        "open": "^8.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/better-opn/node_modules/open": {
      "version": "8.4.2",
      "resolved": "https://registry.npmjs.org/open/-/open-8.4.2.tgz",
      "integrity": "sha512-7x81NCL719oNbsq/3mh+hVrAWmFuEYUqrq/Iw3kUzH8ReypT9QQ0BLoJS7/G9k6N81XjW4qHWtjWwe/9eLy1EQ==",
      "license": "MIT",
      "dependencies": {
        "define-lazy-prop": "^2.0.0",
        "is-docker": "^2.1.1",
        "is-wsl": "^2.2.0"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/big-integer": {
      "version": "1.6.52",
      "resolved": "https://registry.npmjs.org/big-integer/-/big-integer-1.6.52.tgz",
      "integrity": "sha512-QxD8cf2eVqJOOz63z6JIN9BzvVs/dlySa5HGSBH5xtR8dPteIRQnBxxKqkNTiT6jbDTF6jAfrd4oMcND9RGbQg==",
      "license": "Unlicense",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/boolbase": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/boolbase/-/boolbase-1.0.0.tgz",
      "integrity": "sha512-JZOSA7Mo9sNGB8+UjSgzdLtokWAky1zbztM3WRLCbZ70/3cTANmQmOdR7y2g+J0e2WXywy1yS468tY+IruqEww==",
      "license": "ISC"
    },
    "node_modules/bplist-creator": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/bplist-creator/-/bplist-creator-0.1.0.tgz",
      "integrity": "sha512-sXaHZicyEEmY86WyueLTQesbeoH/mquvarJaQNbjuOQO+7gbFcDEWqKmcWA4cOTLzFlfgvkiVxolk1k5bBIpmg==",
      "license": "MIT",
      "dependencies": {
        "stream-buffers": "2.2.x"
      }
    },
    "node_modules/bplist-parser": {
      "version": "0.3.1",
      "resolved": "https://registry.npmjs.org/bplist-parser/-/bplist-parser-0.3.1.tgz",
      "integrity": "sha512-PyJxiNtA5T2PlLIeBot4lbp7rj4OadzjnMZD/G5zuBNt8ei/yCU7+wW0h2bag9vr8c+/WuRWmSxbqAl9hL1rBA==",
      "license": "MIT",
      "dependencies": {
        "big-integer": "1.6.x"
      },
      "engines": {
        "node": ">= 5.10.0"
      }
    },
    "node_modules/brace-expansion": {
      "version": "5.0.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.12.tgz",
      "integrity": "sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==",
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^4.0.2"
      },
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.29.3",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.29.3.tgz",
      "integrity": "sha512-1R4kiYKXGViqEN0CnoDrXc1StD9niAwu+j2dukWzrD4bJgsD4lDmEp0CRbc6E/vYJIfTHwPmwyaKtVSudICdPA==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.11.26",
        "caniuse-lite": "^1.0.30001813",
        "electron-to-chromium": "^1.5.439",
        "node-releases": "^2.0.57",
        "update-browserslist-db": "^1.3.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/bser": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/bser/-/bser-2.1.1.tgz",
      "integrity": "sha512-gQxTNE/GAfIIrmHLUE3oJyp5FO6HRBfhjnw4/wMmA63ZGDJnWBmgY/lyQBpnDUkGmAhbSe39tx2d/iTOAfglwQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "node-int64": "^0.4.0"
      }
    },
    "node_modules/buffer": {
      "version": "5.7.1",
      "resolved": "https://registry.npmjs.org/buffer/-/buffer-5.7.1.tgz",
      "integrity": "sha512-EHcyIPBQ4BSGlvjB16k5KgAJ27CIsHY/2JBmCRReo48y9rQ3MaUzWX3KVlBa4U7MyX02HdVj0K7C3WaB3ju7FQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "base64-js": "^1.3.1",
        "ieee754": "^1.1.13"
      }
    },
    "node_modules/buffer-from": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/buffer-from/-/buffer-from-1.1.2.tgz",
      "integrity": "sha512-E+XQCRwSbaaiChtv6k6Dwgc+bx+Bs6vuKJHHl5kox/BaKbhiXzqQOwK4cO22yElGp2OCmjwVhT3HmxgyPGnJfQ==",
      "license": "MIT"
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/call-bind/-/call-bind-1.0.9.tgz",
      "integrity": "sha512-a/hy+pNsFUTR+Iz8TCJvXudKVLAnz/DyeSUo10I5yvFDQJBFU2s9uqQpoSrJlroHUKoKqzg+epxyP9lqFdzfBQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "get-intrinsic": "^1.3.0",
        "set-function-length": "^1.2.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/camelcase": {
      "version": "6.3.0",
      "resolved": "https://registry.npmjs.org/camelcase/-/camelcase-6.3.0.tgz",
      "integrity": "sha512-Gmy6FhYlCY7uOElZUSbxo2UCDH8owEk996gkbrpsgGtrJLM3J7jGxl9Ic7Qwwj4ivOE5AWZWRMecDdF7hqGjFA==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001814",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001814.tgz",
      "integrity": "sha512-/Uaf1lAzr59XcMpW0o96WoEfr+VXK2OX4U9AgFoiSHsVJ4HppnIFUjtYzsyDH2+tgANaQb2/oxYGwCPapN1FpA==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chai": {
      "version": "6.3.0",
      "resolved": "https://registry.npmjs.org/chai/-/chai-6.3.0.tgz",
      "integrity": "sha512-XWAtwJ6OHO+tj0EKCs0Y2UamnyOxseZWltU4x2U2wh8g4AigdjwvtUjvLP2tqkA/avxHEtzxNaqGq/YGNwckKg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/chownr": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/chownr/-/chownr-3.0.0.tgz",
      "integrity": "sha512-+IxzY9BZOQd/XuYPRmrvEVjF/nqj5kgT4kEq7VofrDoM1MxoRjEWkrCC3EtLi59TVawxTAn+orJwFQcrqEN1+g==",
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/chrome-launcher": {
      "version": "0.15.2",
      "resolved": "https://registry.npmjs.org/chrome-launcher/-/chrome-launcher-0.15.2.tgz",
      "integrity": "sha512-zdLEwNo3aUVzIhKhTtXfxhdvZhUghrnmkvcAq2NoDd+LeOHKf03H5jwZ8T/STsAlzyALkBVK552iaG1fGf1xVQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "@types/node": "*",
        "escape-string-regexp": "^4.0.0",
        "is-wsl": "^2.2.0",
        "lighthouse-logger": "^1.0.0"
      },
      "bin": {
        "print-chrome-path": "bin/print-chrome-path.js"
      },
      "engines": {
        "node": ">=12.13.0"
      }
    },
    "node_modules/chromium-edge-launcher": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/chromium-edge-launcher/-/chromium-edge-launcher-0.2.0.tgz",
      "integrity": "sha512-JfJjUnq25y9yg4FABRRVPmBGWPZZi+AQXT4mxupb67766/0UlhG8PAZCz6xzEMXTbW3CsSoE8PcCWA49n35mKg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@types/node": "*",
        "escape-string-regexp": "^4.0.0",
        "is-wsl": "^2.2.0",
        "lighthouse-logger": "^1.0.0",
        "mkdirp": "^1.0.4",
        "rimraf": "^3.0.2"
      }
    },
    "node_modules/ci-info": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ci-info/-/ci-info-2.0.0.tgz",
      "integrity": "sha512-5tK7EtrZ0N+OLFMthtqOj4fI2Jeb88C4CAZPu25LDVUgXJ0A3Js4PMGqrn0JU1W0Mh1/Z8wZzYPxqUrXeBboCQ==",
      "license": "MIT"
    },
    "node_modules/cli-cursor": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/cli-cursor/-/cli-cursor-2.1.0.tgz",
      "integrity": "sha512-8lgKz8LmCRYZZQDpRyT2m5rKJ08TnU4tR9FFFW2rxpxR1FzWi4PQ/NfyODchAatHaUgnSPVcx/R5w6NuTBzFiw==",
      "license": "MIT",
      "dependencies": {
        "restore-cursor": "^2.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/cli-spinners": {
      "version": "2.9.2",
      "resolved": "https://registry.npmjs.org/cli-spinners/-/cli-spinners-2.9.2.tgz",
      "integrity": "sha512-ywqV+5MmyL4E7ybXgKys4DugZbX0FC6LnwrhjuykIjnK9k8OQacQ7axGKnjDXWNhns0xot3bZI5h55H8yo9cJg==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/cliui": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/cliui/-/cliui-8.0.1.tgz",
      "integrity": "sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==",
      "license": "ISC",
      "dependencies": {
        "string-width": "^4.2.0",
        "strip-ansi": "^6.0.1",
        "wrap-ansi": "^7.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/clone": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/clone/-/clone-1.0.4.tgz",
      "integrity": "sha512-JQHZ2QMW6l3aH/j6xCqQThY/9OH4D/9ls34cgkUBiEeocRTU04tHfKPBsUK1PqZCUQM7GiA0IIXJSuXHI64Kbg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "license": "MIT"
    },
    "node_modules/commander": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/commander/-/commander-7.2.0.tgz",
      "integrity": "sha512-QrWXB+ZQSVPmIWIhtEO9H+gwHaMGYiF5ChvoJ+K9ZGHG/sVsa6yiesAD1GC/x46sET00Xlwo1u49RVVVzvcSkw==",
      "license": "MIT",
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/compressible": {
      "version": "2.0.18",
      "resolved": "https://registry.npmjs.org/compressible/-/compressible-2.0.18.tgz",
      "integrity": "sha512-AF3r7P5dWxL8MxyITRMlORQNaOA2IkAFaTr4k7BUumjPtRpGDTZpl0Pb1XCO6JeDCBdp126Cgs9sMxqSjgYyRg==",
      "license": "MIT",
      "dependencies": {
        "mime-db": ">= 1.43.0 < 2"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/compression": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/compression/-/compression-1.8.1.tgz",
      "integrity": "sha512-9mAqGPHLakhCLeNyxPkK4xVo746zQ/czLH1Ky+vkitMnWfWZps8r0qXuwhwizagCRttsL4lfG4pIOvaWLpAP0w==",
      "license": "MIT",
      "dependencies": {
        "bytes": "3.1.2",
        "compressible": "~2.0.18",
        "debug": "2.6.9",
        "negotiator": "~0.6.4",
        "on-headers": "~1.1.0",
        "safe-buffer": "5.2.1",
        "vary": "~1.1.2"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/compression/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/compression/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/compression/node_modules/negotiator": {
      "version": "0.6.4",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.4.tgz",
      "integrity": "sha512-myRT3DiWPHqho5PrJaIRyaMv2kgYf0mUVgBNOYMuCH5Ki1yEiQaf/ZJuQ62nvpc44wL5WDbTX7yGJi1Neevw8w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "license": "MIT"
    },
    "node_modules/connect": {
      "version": "3.7.0",
      "resolved": "https://registry.npmjs.org/connect/-/connect-3.7.0.tgz",
      "integrity": "sha512-ZqRXc+tZukToSNmh5C2iWMSoV3X1YUcPbqEM4DkEG5tNQXrQUZCNVGGv3IuicnkMtPfGf3Xtp8WCXs295iQ1pQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "2.6.9",
        "finalhandler": "1.1.2",
        "parseurl": "~1.3.3",
        "utils-merge": "1.0.1"
      },
      "engines": {
        "node": ">= 0.10.0"
      }
    },
    "node_modules/connect/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/connect/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "license": "MIT"
    },
    "node_modules/core-js-compat": {
      "version": "3.49.0",
      "resolved": "https://registry.npmjs.org/core-js-compat/-/core-js-compat-3.49.0.tgz",
      "integrity": "sha512-VQXt1jr9cBz03b331DFDCCP90b3fanciLkgiOoy8SBHy06gNf+vQ1A3WFLqG7I8TipYIKeYK9wxd0tUrvHcOZA==",
      "license": "MIT",
      "dependencies": {
        "browserslist": "^4.28.1"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/core-js"
      }
    },
    "node_modules/cosmiconfig": {
      "version": "8.3.6",
      "resolved": "https://registry.npmjs.org/cosmiconfig/-/cosmiconfig-8.3.6.tgz",
      "integrity": "sha512-kcZ6+W5QzcJ3P1Mt+83OUv/oHFqZHIx8DuxG6eZ5RGMERoLqp4BuGjhHLYGK+Kf5XVkQvqBSmAy/nGWN3qDgEA==",
      "license": "MIT",
      "dependencies": {
        "import-fresh": "^3.3.0",
        "js-yaml": "^4.1.0",
        "parse-json": "^5.2.0",
        "path-type": "^4.0.0"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/d-fischer"
      },
      "peerDependencies": {
        "typescript": ">=4.9.5"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/cosmiconfig/node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "license": "Python-2.0"
    },
    "node_modules/cosmiconfig/node_modules/js-yaml": {
      "version": "4.3.2",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.3.2.tgz",
      "integrity": "sha512-SFNOvSJ+Dgf/9An904Yx+CgSlIPCkIpao4qo51lpee25TIRejdH3rhR4EZMGoNx3/TP3O+wzWuiTFl4sqbltzA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/puzrin"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/nodeca"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/cross-fetch": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/cross-fetch/-/cross-fetch-3.2.0.tgz",
      "integrity": "sha512-Q+xVJLoGOeIMXZmbUK4HYk+69cQH6LudR0Vu/pRm2YlU/hDV9CiS0gKUMaWY5f2NeUH9C1nV3bsTlCo0FsTV1Q==",
      "license": "MIT",
      "dependencies": {
        "node-fetch": "^2.7.0"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/css-in-js-utils": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/css-in-js-utils/-/css-in-js-utils-3.1.0.tgz",
      "integrity": "sha512-fJAcud6B3rRu+KHYk+Bwf+WFL2MDCJJ1XG9x137tJQ0xYxor7XziQtuGFbWNdqrvF4Tk26O3H73nfVqXt/fW1A==",
      "license": "MIT",
      "dependencies": {
        "hyphenate-style-name": "^1.0.3"
      }
    },
    "node_modules/css-select": {
      "version": "5.2.2",
      "resolved": "https://registry.npmjs.org/css-select/-/css-select-5.2.2.tgz",
      "integrity": "sha512-TizTzUddG/xYLA3NXodFM0fSbNizXjOKhqiQQwvhlspadZokn1KDy0NZFS0wuEubIYAV5/c1/lAr0TaaFXEXzw==",
      "license": "BSD-2-Clause",
      "dependencies": {
        "boolbase": "^1.0.0",
        "css-what": "^6.1.0",
        "domhandler": "^5.0.2",
        "domutils": "^3.0.1",
        "nth-check": "^2.0.1"
      },
      "funding": {
        "url": "https://github.com/sponsors/fb55"
      }
    },
    "node_modules/css-tree": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-1.1.3.tgz",
      "integrity": "sha512-tRpdppF7TRazZrjJ6v3stzv93qxRcSsFmW6cX0Zm2NVKpxE1WV1HblnghVv9TreireHkqI/VDEsfolRF1p6y7Q==",
      "license": "MIT",
      "dependencies": {
        "mdn-data": "2.0.14",
        "source-map": "^0.6.1"
      },
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/css-tree/node_modules/source-map": {
      "version": "0.6.1",
      "resolved": "https://registry.npmjs.org/source-map/-/source-map-0.6.1.tgz",
      "integrity": "sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/css-what": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/css-what/-/css-what-6.2.2.tgz",
      "integrity": "sha512-u/O3vwbptzhMs3L1fQE82ZSLHQQfto5gyZzwteVIEyeaY5Fc7R4dapF/BvRoSYFeqfBk4m0V1Vafq5Pjv25wvA==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">= 6"
      },
      "funding": {
        "url": "https://github.com/sponsors/fb55"
      }
    },
    "node_modules/csscolorparser": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/csscolorparser/-/csscolorparser-1.0.3.tgz",
      "integrity": "sha512-umPSgYwZkdFoUrH5hIq5kf0wPSXiro51nPw0j2K/c83KflkPSTBGMz6NJvMB+07VlL0y7VPo6QJcDjcgKTTm3w==",
      "license": "MIT"
    },
    "node_modules/csso": {
      "version": "5.0.5",
      "resolved": "https://registry.npmjs.org/csso/-/csso-5.0.5.tgz",
      "integrity": "sha512-0LrrStPOdJj+SPCCrGhzryycLjwcgUSHBtxNA8aIDxf0GLsRh1cKYhB00Gd1lDOS4yGH69+SNn13+TWbVHETFQ==",
      "license": "MIT",
      "dependencies": {
        "css-tree": "~2.2.0"
      },
      "engines": {
        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0",
        "npm": ">=7.0.0"
      }
    },
    "node_modules/csso/node_modules/css-tree": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-2.2.1.tgz",
      "integrity": "sha512-OA0mILzGc1kCOCSJerOeqDxDQ4HOh+G8NbOJFOTgOCzpw7fCBubk0fEyxp8AgOL/jvLgYA/uV0cMbe43ElF1JA==",
      "license": "MIT",
      "dependencies": {
        "mdn-data": "2.0.28",
        "source-map-js": "^1.0.1"
      },
      "engines": {
        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0",
        "npm": ">=7.0.0"
      }
    },
    "node_modules/csso/node_modules/mdn-data": {
      "version": "2.0.28",
      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.0.28.tgz",
      "integrity": "sha512-aylIc7Z9y4yzHYAJNuESG3hfhC+0Ibp/MAMiaOZgNv4pmEdFyfZhhhny4MNiAfWdBQ1RQ2mfDWmM1x8SvGyp8g==",
      "license": "CC0-1.0"
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/debounce": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/debounce/-/debounce-2.2.0.tgz",
      "integrity": "sha512-Xks6RUDLZFdz8LIdR6q0MTH44k7FikOmnh5xkSjMig6ch45afc8sjTjRQf3P6ax8dMgcQrYO/AR2RGWURrruqw==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/deep-extend": {
      "version": "0.6.0",
      "resolved": "https://registry.npmjs.org/deep-extend/-/deep-extend-0.6.0.tgz",
      "integrity": "sha512-LOHxIOaPYdHlJRtCQfDIVZtfw/ufM8+rVj649RIHzcm/vGwQRXFt6OPqIFWsm2XEMrNIEtWR64sY1LEKD2vAOA==",
      "license": "MIT",
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/deepmerge": {
      "version": "4.3.1",
      "resolved": "https://registry.npmjs.org/deepmerge/-/deepmerge-4.3.1.tgz",
      "integrity": "sha512-3sUqbMEc77XqpdNO7FRyRog+eW3ph+GYCbj+rK+uYyRMuwsVy0rMiVtPn+QJlKFvWP/1PYpapqYn0Me2knFn+A==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/defaults": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/defaults/-/defaults-1.0.4.tgz",
      "integrity": "sha512-eFuaLoy/Rxalv2kr+lqMlUnrDWV+3j4pljOIJgLIhI058IQfWJ7vXhyEIHu+HtC738klGALYxOKDO0bQP3tg8A==",
      "license": "MIT",
      "dependencies": {
        "clone": "^1.0.2"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/define-data-property": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/define-data-property/-/define-data-property-1.1.4.tgz",
      "integrity": "sha512-rBMvIzlpA8v6E+SJZoo++HAYqsLrkg7MSfIinMPFhmkorw7X+dOXVJQs+QT69zGkzMyfDnIMN2Wid1+NbL3T+A==",
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0",
        "es-errors": "^1.3.0",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/define-lazy-prop": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/define-lazy-prop/-/define-lazy-prop-2.0.0.tgz",
      "integrity": "sha512-Ds09qNh8yw3khSjiJjiUInaGX9xlqZDY7JVryGxdxV7NPeuqQfplOpQ66yJFZut3jLa5zOwkXw1g9EI2uKh4Og==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/define-properties": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/define-properties/-/define-properties-1.2.1.tgz",
      "integrity": "sha512-8QmQKqEASLd5nx0U1B1okLElbUuuttJ/AnYmRXbbbGDWh6uS208EjD4Xqq/I9wK7u0v6O08XhTWnt5XtEbR6Dg==",
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.0.1",
        "has-property-descriptors": "^1.0.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/destroy": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/destroy/-/destroy-1.2.0.tgz",
      "integrity": "sha512-2sJGJTaXIIaR1w4iJSNoN0hnMY7Gpc/n8D4qSCJw8QqFWXf7cuAgnEHxBpweaVcPevC2l3KpjYCx3NypQQgaJg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8",
        "npm": "1.2.8000 || >= 1.4.16"
      }
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/dom-serializer": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/dom-serializer/-/dom-serializer-2.0.0.tgz",
      "integrity": "sha512-wIkAryiqt/nV5EQKqQpo3SToSOV9J0DnbJqwK7Wv/Trc92zIAYZ4FlMu+JPFW1DfGFt81ZTCGgDEabffXeLyJg==",
      "license": "MIT",
      "dependencies": {
        "domelementtype": "^2.3.0",
        "domhandler": "^5.0.2",
        "entities": "^4.2.0"
      },
      "funding": {
        "url": "https://github.com/cheeriojs/dom-serializer?sponsor=1"
      }
    },
    "node_modules/domelementtype": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/domelementtype/-/domelementtype-2.3.0.tgz",
      "integrity": "sha512-OLETBj6w0OsagBwdXnPdN0cnMfF9opN69co+7ZrbfPGrdpPVNBUj02spi6B1N7wChLQiPn4CSH/zJvXw56gmHw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fb55"
        }
      ],
      "license": "BSD-2-Clause"
    },
    "node_modules/domhandler": {
      "version": "5.0.3",
      "resolved": "https://registry.npmjs.org/domhandler/-/domhandler-5.0.3.tgz",
      "integrity": "sha512-cgwlv/1iFQiFnU96XXgROh8xTeetsnJiDsTc7TYCLFd9+/WNkIqPTxiM/8pSd8VIrhXGTf1Ny1q1hquVqDJB5w==",
      "license": "BSD-2-Clause",
      "dependencies": {
        "domelementtype": "^2.3.0"
      },
      "engines": {
        "node": ">= 4"
      },
      "funding": {
        "url": "https://github.com/fb55/domhandler?sponsor=1"
      }
    },
    "node_modules/domutils": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/domutils/-/domutils-3.2.2.tgz",
      "integrity": "sha512-6kZKyUajlDuqlHKVX1w7gyslj9MPIXzIFiz/rGu35uC1wMi+kMhQwGhl4lt9unC9Vb9INnY9Z3/ZA3+FhASLaw==",
      "license": "BSD-2-Clause",
      "dependencies": {
        "dom-serializer": "^2.0.0",
        "domelementtype": "^2.3.0",
        "domhandler": "^5.0.3"
      },
      "funding": {
        "url": "https://github.com/fb55/domutils?sponsor=1"
      }
    },
    "node_modules/dot-case": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/dot-case/-/dot-case-3.0.4.tgz",
      "integrity": "sha512-Kv5nKlh6yRrdrGvxeJ2e5y2eRUpkUosIW4A2AS38zwSz27zu7ufDwQPi5Jhs3XAlGNetl3bmnGhQsMtkKJnj3w==",
      "license": "MIT",
      "dependencies": {
        "no-case": "^3.0.4",
        "tslib": "^2.0.3"
      }
    },
    "node_modules/dotenv": {
      "version": "16.4.7",
      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-16.4.7.tgz",
      "integrity": "sha512-47qPchRCykZC03FhkYAhrvwU4xDBFIj1QPqaarj6mdM/hgUzfPHcpkHJOn3mJAufFeeAxAzeGsr5X0M4k6fLZQ==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/dotenv-expand": {
      "version": "11.0.7",
      "resolved": "https://registry.npmjs.org/dotenv-expand/-/dotenv-expand-11.0.7.tgz",
      "integrity": "sha512-zIHwmZPRshsCdpMDyVsqGmgyP0yT8GAgXUnkdAoJisxvf33k7yO6OuoKmcTGuXPWSsm8Oh88nZicRLA9Y0rUeA==",
      "license": "BSD-2-Clause",
      "dependencies": {
        "dotenv": "^16.4.5"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/earcut": {
      "version": "2.2.4",
      "resolved": "https://registry.npmjs.org/earcut/-/earcut-2.2.4.tgz",
      "integrity": "sha512-/pjZsA1b4RPHbeWZQn66SWS8nZZWLQQ23oE3Eam7aroEFGEvwKAsJfZ9ytiEMycfzXWpca4FA9QIOehf7PocBQ==",
      "license": "ISC"
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.444",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.444.tgz",
      "integrity": "sha512-5ss/uJfoDYDHT0lfJzT6FbcskIzROIOPf0BbbFkGcvDzoJU7i//9GDrwwIHQVmIsrAGiF3ihpADBRIsrEFt1rQ==",
      "license": "ISC"
    },
    "node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "license": "MIT"
    },
    "node_modules/encodeurl": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-1.0.2.tgz",
      "integrity": "sha512-TPJXq8JqFaVYm2CWmPvnP2Iyo4ZSM7/QKcSmuMLDObfpH5fi7RUGmd/rTDf+rut/saiDiQEeVTNgAmJEdAOx0w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/entities": {
      "version": "4.5.0",
      "resolved": "https://registry.npmjs.org/entities/-/entities-4.5.0.tgz",
      "integrity": "sha512-V0hjH4dGPh9Ao5p0MoRY6BVqtwCjhz6vI5LT8AJ55H+4g9/4vbHx1I54fS0XuclLhDHArPQCiMjDxjaL8fPxhw==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.12"
      },
      "funding": {
        "url": "https://github.com/fb55/entities?sponsor=1"
      }
    },
    "node_modules/env-editor": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/env-editor/-/env-editor-0.4.2.tgz",
      "integrity": "sha512-ObFo8v4rQJAE59M69QzwloxPZtd33TpYEIjtKD1rrFDcM1Gd7IkDxEBU+HriziN6HSHQnBJi8Dmy+JWkav5HKA==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/error-ex": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/error-ex/-/error-ex-1.3.4.tgz",
      "integrity": "sha512-sqQamAnR14VgCr1A618A3sGrygcpK+HEbenA/HiEAkkUwcZIIB/tgWqHFxWgOyDh4nB4JCRimh79dR5Ywc9MDQ==",
      "license": "MIT",
      "dependencies": {
        "is-arrayish": "^0.2.1"
      }
    },
    "node_modules/error-stack-parser": {
      "version": "2.1.4",
      "resolved": "https://registry.npmjs.org/error-stack-parser/-/error-stack-parser-2.1.4.tgz",
      "integrity": "sha512-Sk5V6wVazPhq5MhpO+AUxJn5x7XSXGl1R93Vn7i+zS15KDVxQijejNCrz8340/2bgLBjR9GtEG8ZVKONDjcqGQ==",
      "license": "MIT",
      "dependencies": {
        "stackframe": "^1.3.4"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-module-lexer": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-2.3.2.tgz",
      "integrity": "sha512-poHGpORABojJJucnV9KbOavETW8lBVnphkW77ER5/BQ5Fz7oXSoCNek7IH3vR5nRjdsEz926ibFYX8KtLQmdyw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/esprima": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/esprima/-/esprima-4.0.1.tgz",
      "integrity": "sha512-eGuFFw7Upda+g4p+QHvnW0RyTX/SVeJBDM/gCtMARO0cLuT2HcEKnTPvhjV6aGeqrCB/sbNop0Kszm0jsaWU4A==",
      "license": "BSD-2-Clause",
      "bin": {
        "esparse": "bin/esparse.js",
        "esvalidate": "bin/esvalidate.js"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/estree-walker": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-3.0.3.tgz",
      "integrity": "sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "^1.0.0"
      }
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/event-target-shim": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/event-target-shim/-/event-target-shim-5.0.1.tgz",
      "integrity": "sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/expect-type": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/expect-type/-/expect-type-1.4.0.tgz",
      "integrity": "sha512-KfYbmpRm0VbLjEvVa9yGwCi9GI34xvi7A/HXYWQO65CSD2u3MczUJSuwXKFIxlGsgBQizV9q5J9NHj4VG0n+pA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/expo": {
      "version": "54.0.37",
      "resolved": "https://registry.npmjs.org/expo/-/expo-54.0.37.tgz",
      "integrity": "sha512-afzbtO4i/K9ZCrzyLgEOaXW56w/yuAK61JkCOMrw/S/VFCAp6YwKWA494X5mIcrVmRAmclv/ec7ga8ndTkzhxw==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.20.0",
        "@expo/cli": "54.0.27",
        "@expo/config": "~12.0.14",
        "@expo/config-plugins": "~54.0.5",
        "@expo/devtools": "0.1.8",
        "@expo/fingerprint": "0.15.5",
        "@expo/metro": "~54.2.0",
        "@expo/metro-config": "54.0.17",
        "@expo/vector-icons": "^15.0.3",
        "@ungap/structured-clone": "^1.3.0",
        "babel-preset-expo": "~54.0.12",
        "expo-asset": "~12.0.13",
        "expo-constants": "~18.0.14",
        "expo-file-system": "~19.0.24",
        "expo-font": "~14.0.12",
        "expo-keep-awake": "~15.0.8",
        "expo-modules-autolinking": "3.0.27",
        "expo-modules-core": "3.0.30",
        "pretty-format": "^29.7.0",
        "react-refresh": "^0.14.2",
        "whatwg-url-without-unicode": "8.0.0-3"
      },
      "bin": {
        "expo": "bin/cli",
        "expo-modules-autolinking": "bin/autolinking",
        "fingerprint": "bin/fingerprint"
      },
      "peerDependencies": {
        "@expo/dom-webview": "*",
        "@expo/metro-runtime": "*",
        "react": "*",
        "react-native": "*",
        "react-native-webview": "*"
      },
      "peerDependenciesMeta": {
        "@expo/dom-webview": {
          "optional": true
        },
        "@expo/metro-runtime": {
          "optional": true
        },
        "react-native-webview": {
          "optional": true
        }
      }
    },
    "node_modules/expo-apple-authentication": {
      "version": "8.0.8",
      "resolved": "https://registry.npmjs.org/expo-apple-authentication/-/expo-apple-authentication-8.0.8.tgz",
      "integrity": "sha512-TwCHWXYR1kS0zaeV7QZKLWYluxsvqL31LFJubzK30njZqeWoWO89HZ8nZVaeXbFV1LrArKsze4BmMb+94wS0AQ==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-application": {
      "version": "7.0.8",
      "resolved": "https://registry.npmjs.org/expo-application/-/expo-application-7.0.8.tgz",
      "integrity": "sha512-qFGyxk7VJbrNOQWBbE09XUuGuvkOgFS9QfToaK2FdagM2aQ+x3CvGV2DuVgl/l4ZxPgIf3b/MNh9xHpwSwn74Q==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-asset": {
      "version": "12.0.13",
      "resolved": "https://registry.npmjs.org/expo-asset/-/expo-asset-12.0.13.tgz",
      "integrity": "sha512-x/p7WvQUnkn6K43b9eL6SPeq5Vnf1E8BDe9bDrWrvMqzyUvJnUFvl+ctg3034s/+UHe7Ne2pAmc0+yzbl8CrDQ==",
      "license": "MIT",
      "dependencies": {
        "@expo/image-utils": "^0.8.8",
        "expo-constants": "~18.0.13"
      },
      "peerDependencies": {
        "expo": "*",
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-auth-session": {
      "version": "7.0.11",
      "resolved": "https://registry.npmjs.org/expo-auth-session/-/expo-auth-session-7.0.11.tgz",
      "integrity": "sha512-AhWtt/m9rb1Po77X/VBFbeE6UTgbm2vXP2iCblUSRsHCw2qD6lO0ulKUB8Xyxy9FtoI9yrNQ1iwCNgIIgo8VYQ==",
      "license": "MIT",
      "dependencies": {
        "expo-application": "~7.0.8",
        "expo-constants": "~18.0.13",
        "expo-crypto": "~15.0.9",
        "expo-linking": "~8.0.12",
        "expo-web-browser": "~15.0.11",
        "invariant": "^2.2.4"
      },
      "peerDependencies": {
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-blur": {
      "version": "15.0.8",
      "resolved": "https://registry.npmjs.org/expo-blur/-/expo-blur-15.0.8.tgz",
      "integrity": "sha512-rWyE1NBRZEu9WD+X+5l7gyPRszw7n12cW3IRNAb5i6KFzaBp8cxqT5oeaphJapqURvcqhkOZn2k5EtBSbsuU7w==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*",
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-constants": {
      "version": "18.0.14",
      "resolved": "https://registry.npmjs.org/expo-constants/-/expo-constants-18.0.14.tgz",
      "integrity": "sha512-BUZm9mkl/TX7zNaN0N4C83ws7mEnesCFiKhqK+rMZwTD2+Q4wWB2kBltqnC/LrCRaMyRi40XxhCRVwuKnJkxXQ==",
      "license": "MIT",
      "dependencies": {
        "@expo/config": "~12.0.14",
        "@expo/env": "~2.0.12"
      },
      "peerDependencies": {
        "expo": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-crypto": {
      "version": "15.0.9",
      "resolved": "https://registry.npmjs.org/expo-crypto/-/expo-crypto-15.0.9.tgz",
      "integrity": "sha512-SNWKa2fXx7v9gkp1h/7nqXY5XN7qgNDn3yRc2aO0gWGbeMbvob/haMxxsPFe9f51aqH5NjNCqHf2kvLhvAd8KQ==",
      "license": "MIT",
      "dependencies": {
        "base64-js": "^1.3.0"
      },
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-dev-client": {
      "version": "6.0.21",
      "resolved": "https://registry.npmjs.org/expo-dev-client/-/expo-dev-client-6.0.21.tgz",
      "integrity": "sha512-SWI6HD0pa4eJujkYFkvvpezUE1zmJXGLu+34azpu7+QJgO+FLutDYDj8BSTdeH/NYDEClDFjCGqVMcWETvmsCQ==",
      "license": "MIT",
      "dependencies": {
        "expo-dev-launcher": "6.0.21",
        "expo-dev-menu": "7.0.19",
        "expo-dev-menu-interface": "2.0.0",
        "expo-manifests": "~1.0.11",
        "expo-updates-interface": "~2.0.0"
      },
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-dev-launcher": {
      "version": "6.0.21",
      "resolved": "https://registry.npmjs.org/expo-dev-launcher/-/expo-dev-launcher-6.0.21.tgz",
      "integrity": "sha512-QZ9gcKMZbp6EsIhzS0QoGB8Cf4xeVJhjbNgWUwcoBIk8gshoFz8CkCQOnX+HNv2sSY3rdCaNpx3Xo0Rflyq7rA==",
      "license": "MIT",
      "dependencies": {
        "ajv": "^8.11.0",
        "expo-dev-menu": "7.0.19",
        "expo-manifests": "~1.0.11"
      },
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-dev-menu": {
      "version": "7.0.19",
      "resolved": "https://registry.npmjs.org/expo-dev-menu/-/expo-dev-menu-7.0.19.tgz",
      "integrity": "sha512-ju5MZiBCPhUKKvHy0ElZdnlhq01mkEEiR8jfrgQVvW26aWjzjLiOhppNAyXtvGbhk7WxJim3wYMiqFFrjGdfKA==",
      "license": "MIT",
      "dependencies": {
        "expo-dev-menu-interface": "2.0.0"
      },
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-dev-menu-interface": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/expo-dev-menu-interface/-/expo-dev-menu-interface-2.0.0.tgz",
      "integrity": "sha512-BvAMPt6x+vyXpThsyjjOYyjwfjREV4OOpQkZ0tNl+nGpsPfcY9mc6DRACoWnH9KpLzyIt3BOgh3cuy/h/OxQjw==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-font": {
      "version": "14.0.12",
      "resolved": "https://registry.npmjs.org/expo-font/-/expo-font-14.0.12.tgz",
      "integrity": "sha512-QQzunE2Mxk45AsCWm3tK7OpVljbtVnKD58q4/qliev+cbye1IOduUnRIdD+P7DyButw17G9MTX795kgaQiz5hQ==",
      "license": "MIT",
      "dependencies": {
        "fontfaceobserver": "^2.1.0"
      },
      "peerDependencies": {
        "expo": "*",
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-glass-effect": {
      "version": "0.1.10",
      "resolved": "https://registry.npmjs.org/expo-glass-effect/-/expo-glass-effect-0.1.10.tgz",
      "integrity": "sha512-R0OrsMbs2TxFQZp26rRDl1Wxu5PaBXM7qAxiT0Bfyb1bojr3eI90bMKry9lBM3aKbq7DOBXYT7ePrE3vUaf41g==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*",
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-image-loader": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/expo-image-loader/-/expo-image-loader-6.0.0.tgz",
      "integrity": "sha512-nKs/xnOGw6ACb4g26xceBD57FKLFkSwEUTDXEDF3Gtcu3MqF3ZIYd3YM+sSb1/z9AKV1dYT7rMSGVNgsveXLIQ==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-image-manipulator": {
      "version": "14.0.8",
      "resolved": "https://registry.npmjs.org/expo-image-manipulator/-/expo-image-manipulator-14.0.8.tgz",
      "integrity": "sha512-sXsXjm7rIxLWZe0j2A41J/Ph53PpFJRdyzJ3EQ/qetxLUvS2m3K1sP5xy37px43qCf0l79N/i6XgFgenFV36/Q==",
      "license": "MIT",
      "dependencies": {
        "expo-image-loader": "~6.0.0"
      },
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-image-picker": {
      "version": "17.0.11",
      "resolved": "https://registry.npmjs.org/expo-image-picker/-/expo-image-picker-17.0.11.tgz",
      "integrity": "sha512-/apkoyukDvsCHHb9fzP+F34A1uQqSzUtYH/2P/xJACNEwq+mwEXjXvVU8bzlJq6ih0Qo1+tpVivIa7B9kYSwOQ==",
      "license": "MIT",
      "dependencies": {
        "expo-image-loader": "~6.0.0"
      },
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-json-utils": {
      "version": "0.15.0",
      "resolved": "https://registry.npmjs.org/expo-json-utils/-/expo-json-utils-0.15.0.tgz",
      "integrity": "sha512-duRT6oGl80IDzH2LD2yEFWNwGIC2WkozsB6HF3cDYNoNNdUvFk6uN3YiwsTsqVM/D0z6LEAQ01/SlYvN+Fw0JQ==",
      "license": "MIT"
    },
    "node_modules/expo-linear-gradient": {
      "version": "15.0.8",
      "resolved": "https://registry.npmjs.org/expo-linear-gradient/-/expo-linear-gradient-15.0.8.tgz",
      "integrity": "sha512-V2d8Wjn0VzhPHO+rrSBtcl+Fo+jUUccdlmQ6OoL9/XQB7Qk3d9lYrqKDJyccwDxmQT10JdST3Tmf2K52NLc3kw==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*",
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-linking": {
      "version": "8.0.12",
      "resolved": "https://registry.npmjs.org/expo-linking/-/expo-linking-8.0.12.tgz",
      "integrity": "sha512-FpXeIpFgZuxihwT9lBo86YD3y6LphBuAhN680MMxm/Y7fmsc57vimn2d3vFu68VI0+Z9w457t494mu2wvlgWTQ==",
      "license": "MIT",
      "dependencies": {
        "expo-constants": "~18.0.13",
        "invariant": "^2.2.4"
      },
      "peerDependencies": {
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-location": {
      "version": "19.0.8",
      "resolved": "https://registry.npmjs.org/expo-location/-/expo-location-19.0.8.tgz",
      "integrity": "sha512-H/FI75VuJ1coodJbbMu82pf+Zjess8X8Xkiv9Bv58ZgPKS/2ztjC1YO1/XMcGz7+s9DrbLuMIw22dFuP4HqneA==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-manifests": {
      "version": "1.0.11",
      "resolved": "https://registry.npmjs.org/expo-manifests/-/expo-manifests-1.0.11.tgz",
      "integrity": "sha512-6zItytTewN37Cjhp3glUg0ozrgW2GwB8x9wtfzUNoJIMmxO38nnGdTLMaotYhRqdf5PP2Dzdmej1HDHXVNUpRw==",
      "license": "MIT",
      "dependencies": {
        "@expo/config": "~12.0.13",
        "expo-json-utils": "~0.15.0"
      },
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-modules-autolinking": {
      "version": "3.0.27",
      "resolved": "https://registry.npmjs.org/expo-modules-autolinking/-/expo-modules-autolinking-3.0.27.tgz",
      "integrity": "sha512-Ge216xmfXcba+aUQssfmUo9Hf92wXX3xcXJmOsC/wpuV5B5ozm4BTkRKpoCXEkdD8eJVmFy7ATS8yD3upFOPQA==",
      "license": "MIT",
      "dependencies": {
        "@expo/spawn-async": "^1.7.2",
        "chalk": "^4.1.0",
        "commander": "^7.2.0",
        "require-from-string": "^2.0.2",
        "resolve-from": "^5.0.0"
      },
      "bin": {
        "expo-modules-autolinking": "bin/expo-modules-autolinking.js"
      }
    },
    "node_modules/expo-modules-core": {
      "version": "3.0.30",
      "resolved": "https://registry.npmjs.org/expo-modules-core/-/expo-modules-core-3.0.30.tgz",
      "integrity": "sha512-a6IrpAn/Jbmwxi9L+hMmXKpNqnkUpoF7WHOpn02rVLyax2J0gB1vvCVE5rNydplEnt41Q6WxQwvcOjZaIkcSUg==",
      "license": "MIT",
      "dependencies": {
        "invariant": "^2.2.4"
      },
      "peerDependencies": {
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-notifications": {
      "version": "0.32.17",
      "resolved": "https://registry.npmjs.org/expo-notifications/-/expo-notifications-0.32.17.tgz",
      "integrity": "sha512-lwwzn7tImuzTzn9PAglZlS2VfZEvsfFGJTK9Eb8I4cqkGh2DI23YJFJH+WPEIu4QhDvk5JeBjklenJ8IZbmA4A==",
      "license": "MIT",
      "dependencies": {
        "@expo/image-utils": "^0.8.8",
        "@ide/backoff": "^1.0.0",
        "abort-controller": "^3.0.0",
        "assert": "^2.0.0",
        "badgin": "^1.1.5",
        "expo-application": "~7.0.8",
        "expo-constants": "~18.0.13"
      },
      "peerDependencies": {
        "expo": "*",
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-server": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/expo-server/-/expo-server-1.0.7.tgz",
      "integrity": "sha512-mcmyML3oXcqFUXUxtdtCL1O00ztNI2v76d+MdniXRUgHNxIcHZ05zo+DqBaOOT6LQnPk4vA4YHqQl7iGUfRb3g==",
      "license": "MIT",
      "engines": {
        "node": ">=20.16.0"
      }
    },
    "node_modules/expo-status-bar": {
      "version": "3.0.9",
      "resolved": "https://registry.npmjs.org/expo-status-bar/-/expo-status-bar-3.0.9.tgz",
      "integrity": "sha512-xyYyVg6V1/SSOZWh4Ni3U129XHCnFHBTcUo0dhWtFDrZbNp/duw5AGsQfb2sVeU0gxWHXSY1+5F0jnKYC7WuOw==",
      "license": "MIT",
      "dependencies": {
        "react-native-is-edge-to-edge": "^1.2.1"
      },
      "peerDependencies": {
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-task-manager": {
      "version": "14.0.9",
      "resolved": "https://registry.npmjs.org/expo-task-manager/-/expo-task-manager-14.0.9.tgz",
      "integrity": "sha512-GKWtXrkedr4XChHfTm5IyTcSfMtCPxzx89y4CMVqKfyfROATibrE/8UI5j7UC/pUOfFoYlQvulQEvECMreYuUA==",
      "license": "MIT",
      "dependencies": {
        "unimodules-app-loader": "~6.0.8"
      },
      "peerDependencies": {
        "expo": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo-updates-interface": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/expo-updates-interface/-/expo-updates-interface-2.0.0.tgz",
      "integrity": "sha512-pTzAIufEZdVPKql6iMi5ylVSPqV1qbEopz9G6TSECQmnNde2nwq42PxdFBaUEd8IZJ/fdJLQnOT3m6+XJ5s7jg==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo-web-browser": {
      "version": "15.0.11",
      "resolved": "https://registry.npmjs.org/expo-web-browser/-/expo-web-browser-15.0.11.tgz",
      "integrity": "sha512-r2LS4Ro6DgUPZkcaEfgt8mp9eJuoA93x11Jh7S6utFe0FEzvUNn2yFhxg8XVwESaaHGt2k5V8LuK36rsp0BeIw==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo/node_modules/@expo/cli": {
      "version": "54.0.27",
      "resolved": "https://registry.npmjs.org/@expo/cli/-/cli-54.0.27.tgz",
      "integrity": "sha512-BxKOr6e8wmUwhGSyEVKY+CHWgS3Cre9ibgx1QWcdCenKTVKAz62qGmYL51q0lCcKg6vQY+4Usw9RK5Il4ZFaIA==",
      "license": "MIT",
      "dependencies": {
        "@0no-co/graphql.web": "^1.0.8",
        "@expo/code-signing-certificates": "^0.0.6",
        "@expo/config": "~12.0.14",
        "@expo/config-plugins": "~54.0.5",
        "@expo/devcert": "^1.2.1",
        "@expo/env": "~2.0.12",
        "@expo/image-utils": "^0.8.8",
        "@expo/json-file": "^10.0.16",
        "@expo/metro": "~54.2.0",
        "@expo/metro-config": "~54.0.17",
        "@expo/osascript": "^2.3.8",
        "@expo/package-manager": "^1.9.11",
        "@expo/plist": "^0.4.9",
        "@expo/prebuild-config": "^54.0.9",
        "@expo/schema-utils": "^0.1.9",
        "@expo/spawn-async": "^1.7.2",
        "@expo/ws-tunnel": "^1.0.1",
        "@expo/xcpretty": "^4.3.0",
        "@react-native/dev-middleware": "0.81.5",
        "@urql/core": "^5.0.6",
        "@urql/exchange-retry": "^1.3.0",
        "accepts": "^1.3.8",
        "agent-cli-detector": "^0.1.2",
        "arg": "^5.0.2",
        "better-opn": "~3.0.2",
        "bplist-creator": "0.1.0",
        "bplist-parser": "^0.3.1",
        "chalk": "^4.0.0",
        "ci-info": "^3.3.0",
        "compression": "^1.7.4",
        "connect": "^3.7.0",
        "debug": "^4.3.4",
        "env-editor": "^0.4.1",
        "expo-server": "^1.0.7",
        "freeport-async": "^2.0.0",
        "getenv": "^2.0.0",
        "glob": "^13.0.0",
        "lan-network": "^0.2.1",
        "minimatch": "^9.0.0",
        "node-forge": "^1.3.3",
        "npm-package-arg": "^11.0.0",
        "ora": "^3.4.0",
        "picomatch": "^4.0.3",
        "pretty-bytes": "^5.6.0",
        "pretty-format": "^29.7.0",
        "progress": "^2.0.3",
        "prompts": "^2.3.2",
        "qrcode-terminal": "0.11.0",
        "require-from-string": "^2.0.2",
        "requireg": "^0.2.2",
        "resolve": "^1.22.2",
        "resolve-from": "^5.0.0",
        "resolve.exports": "^2.0.3",
        "semver": "^7.6.0",
        "send": "^0.19.0",
        "slugify": "^1.3.4",
        "source-map-support": "~0.5.21",
        "stacktrace-parser": "^0.1.10",
        "structured-headers": "^0.4.1",
        "tar": "^7.5.2",
        "terminal-link": "^2.1.1",
        "undici": "^6.18.2",
        "wrap-ansi": "^7.0.0",
        "ws": "^8.12.1"
      },
      "bin": {
        "expo-internal": "build/bin/cli"
      },
      "peerDependencies": {
        "expo": "*",
        "expo-router": "*",
        "react-native": "*"
      },
      "peerDependenciesMeta": {
        "expo-router": {
          "optional": true
        },
        "react-native": {
          "optional": true
        }
      }
    },
    "node_modules/expo/node_modules/@expo/cli/node_modules/@expo/prebuild-config": {
      "version": "54.0.9",
      "resolved": "https://registry.npmjs.org/@expo/prebuild-config/-/prebuild-config-54.0.9.tgz",
      "integrity": "sha512-3/Rmyzt8vduPjnSVHbnc0wYFrlhwLWn2g596rDyKcLGeqN2WTLJbzVeznsrUwyzhBNXgnTomZWO5HDzbZ/4E7g==",
      "license": "MIT",
      "dependencies": {
        "@expo/config": "~12.0.14",
        "@expo/config-plugins": "~54.0.5",
        "@expo/config-types": "^54.0.10",
        "@expo/image-utils": "^0.8.8",
        "@expo/json-file": "^10.0.16",
        "@react-native/normalize-colors": "0.81.5",
        "debug": "^4.3.1",
        "resolve-from": "^5.0.0",
        "semver": "^7.6.0",
        "xml2js": "0.6.0"
      },
      "peerDependencies": {
        "expo": "*"
      }
    },
    "node_modules/expo/node_modules/@expo/cli/node_modules/minimatch": {
      "version": "9.0.9",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.9.tgz",
      "integrity": "sha512-OBwBN9AL4dqmETlpS2zasx+vTeWclWzkblfZk7KTA5j3jeOONz/tRCnZomUyvNg83wL5Zv9Ss6HMJXAgL8R2Yg==",
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^2.0.2"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/expo/node_modules/@expo/metro-config": {
      "version": "54.0.17",
      "resolved": "https://registry.npmjs.org/@expo/metro-config/-/metro-config-54.0.17.tgz",
      "integrity": "sha512-PQFgQCZGY0DffZUvBzJttDPreZfHrQakaBlKjnvOUMNXbDna+TYmg1IFZuIDUYJezLcdp+TvVFTLjNi1+mqaVw==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.20.0",
        "@babel/core": "^7.20.0",
        "@babel/generator": "^7.20.5",
        "@expo/config": "~12.0.14",
        "@expo/env": "~2.0.12",
        "@expo/json-file": "~10.0.16",
        "@expo/metro": "~54.2.0",
        "@expo/spawn-async": "^1.7.2",
        "browserslist": "^4.25.0",
        "chalk": "^4.1.0",
        "debug": "^4.3.2",
        "dotenv": "~16.4.5",
        "dotenv-expand": "~11.0.6",
        "getenv": "^2.0.0",
        "glob": "^13.0.0",
        "hermes-parser": "^0.29.1",
        "jsc-safe-url": "^0.2.4",
        "lightningcss": "^1.30.1",
        "picomatch": "^4.0.3",
        "postcss": "~8.4.32",
        "resolve-from": "^5.0.0"
      },
      "peerDependencies": {
        "expo": "*"
      },
      "peerDependenciesMeta": {
        "expo": {
          "optional": true
        }
      }
    },
    "node_modules/expo/node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "license": "MIT"
    },
    "node_modules/expo/node_modules/brace-expansion": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.1.7.tgz",
      "integrity": "sha512-uZbew1NqdmPDTMJ8ah1y+b+9QEJrfkXFk3RcTQw3X0jW/xRUvFKsg1CfQdSYGdTbXZWExtU3J3ccxtnfw1Fi0g==",
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/expo/node_modules/ci-info": {
      "version": "3.9.0",
      "resolved": "https://registry.npmjs.org/ci-info/-/ci-info-3.9.0.tgz",
      "integrity": "sha512-NIxF55hv4nSqQswkAeiOi1r83xy8JldOFDTWiug55KBu9Jnblncd2U6ViHmYgHf01TPZS77NJBhBMKdWj9HQMQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/sibiraj-s"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/expo/node_modules/expo-file-system": {
      "version": "19.0.24",
      "resolved": "https://registry.npmjs.org/expo-file-system/-/expo-file-system-19.0.24.tgz",
      "integrity": "sha512-hZs0Ng+coNjx7YJ8MPwfJpoU1SRul6OZ9LZycFzozUeoR+denbyr944YrMP9NVn+Zf1tdC7p0K0zgah3ZySOYg==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*",
        "react-native": "*"
      }
    },
    "node_modules/expo/node_modules/expo-keep-awake": {
      "version": "15.0.8",
      "resolved": "https://registry.npmjs.org/expo-keep-awake/-/expo-keep-awake-15.0.8.tgz",
      "integrity": "sha512-YK9M1VrnoH1vLJiQzChZgzDvVimVoriibiDIFLbQMpjYBnvyfUeHJcin/Gx1a+XgupNXy92EQJLgI/9ZuXajYQ==",
      "license": "MIT",
      "peerDependencies": {
        "expo": "*",
        "react": "*"
      }
    },
    "node_modules/expo/node_modules/glob": {
      "version": "13.0.6",
      "resolved": "https://registry.npmjs.org/glob/-/glob-13.0.6.tgz",
      "integrity": "sha512-Wjlyrolmm8uDpm/ogGyXZXb1Z+Ca2B8NbJwqBVg0axK9GbBeoS7yGV6vjXnYdGm6X53iehEuxxbyiKp8QmN4Vw==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "minimatch": "^10.2.2",
        "minipass": "^7.1.3",
        "path-scurry": "^2.0.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/expo/node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/expo/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/expo/node_modules/ws": {
      "version": "8.21.3",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.21.3.tgz",
      "integrity": "sha512-201TZ/kPWxoPr/OKWjquZR1SWKXcvxdH+e1xrx89b3YbmzLMFCLfnaG1HFIgWzJOEWZ7MvpK++odZufgYR50Rw==",
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/exponential-backoff": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/exponential-backoff/-/exponential-backoff-3.1.3.tgz",
      "integrity": "sha512-ZgEeZXj30q+I0EN+CbSSpIyPaJ5HVQD18Z1m+u1FXbAeT94mr1zw50q4q6jiiC447Nl/YTcIYSAftiGqetwXCA==",
      "license": "Apache-2.0"
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "license": "MIT"
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "license": "MIT"
    },
    "node_modules/fast-uri": {
      "version": "3.1.8",
      "resolved": "https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz",
      "integrity": "sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/fb-watchman": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/fb-watchman/-/fb-watchman-2.0.2.tgz",
      "integrity": "sha512-p5161BqbuCaSnB8jIbzQHOlpgsPmK5rJVDfDKO91Axs5NC1uu3HRQm6wt9cd9/+GtQQIO53JdGXXoyDpTAsgYA==",
      "license": "Apache-2.0",
      "dependencies": {
        "bser": "2.1.1"
      }
    },
    "node_modules/fbjs": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/fbjs/-/fbjs-3.0.5.tgz",
      "integrity": "sha512-ztsSx77JBtkuMrEypfhgc3cI0+0h+svqeie7xHbh1k/IKdcydnvadp/mUaGgjAOXQmQSxsqgaRhS3q9fy+1kxg==",
      "license": "MIT",
      "dependencies": {
        "cross-fetch": "^3.1.5",
        "fbjs-css-vars": "^1.0.0",
        "loose-envify": "^1.0.0",
        "object-assign": "^4.1.0",
        "promise": "^7.1.1",
        "setimmediate": "^1.0.5",
        "ua-parser-js": "^1.0.35"
      }
    },
    "node_modules/fbjs-css-vars": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/fbjs-css-vars/-/fbjs-css-vars-1.0.2.tgz",
      "integrity": "sha512-b2XGFAFdWZWg0phtAWLHCk836A1Xann+I+Dgd3Gk64MHKZO44FfoD1KxyvbSh0qZsIoXQGGlVztIY+oitJPpRQ==",
      "license": "MIT"
    },
    "node_modules/fbjs/node_modules/promise": {
      "version": "7.3.1",
      "resolved": "https://registry.npmjs.org/promise/-/promise-7.3.1.tgz",
      "integrity": "sha512-nolQXZ/4L+bP/UGlkfaIujX9BKxGwmQ9OT4mOt5yvy8iK1h3wqTEJCijzGANTCCl9nWjY41juyAn2K3Q1hLLTg==",
      "license": "MIT",
      "dependencies": {
        "asap": "~2.0.3"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/finalhandler": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-1.1.2.tgz",
      "integrity": "sha512-aAWcW57uxVNrQZqFXjITpW3sIUQmHGG3qSb9mUah9MgMC4NeWhNOlNjXEYq3HjRAvL6arUviZGGJsBg6z0zsWA==",
      "license": "MIT",
      "dependencies": {
        "debug": "2.6.9",
        "encodeurl": "~1.0.2",
        "escape-html": "~1.0.3",
        "on-finished": "~2.3.0",
        "parseurl": "~1.3.3",
        "statuses": "~1.5.0",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/finalhandler/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/finalhandler/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/find-up": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-4.1.0.tgz",
      "integrity": "sha512-PpOwAdQ/YlXQ2vj8a3h8IipDuYRi3wceVQQGYWxNINccq40Anw7BlsEXCMbt1Zt+OLA6Fq9suIpIWD0OsnISlw==",
      "license": "MIT",
      "dependencies": {
        "locate-path": "^5.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/flow-enums-runtime": {
      "version": "0.0.6",
      "resolved": "https://registry.npmjs.org/flow-enums-runtime/-/flow-enums-runtime-0.0.6.tgz",
      "integrity": "sha512-3PYnM29RFXwvAN6Pc/scUfkI7RwhQ/xqyLUyPNlXUp9S40zI8nup9tUSrTLSVnWGBN38FNiGWbwZOB6uR4OGdw==",
      "license": "MIT"
    },
    "node_modules/fontfaceobserver": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/fontfaceobserver/-/fontfaceobserver-2.3.0.tgz",
      "integrity": "sha512-6FPvD/IVyT4ZlNe7Wcn5Fb/4ChigpucKYSvD6a+0iMoLn2inpo711eyIcKjmDtE5XNcgAkSH9uN/nfAeZzHEfg==",
      "license": "BSD-2-Clause"
    },
    "node_modules/for-each": {
      "version": "0.3.5",
      "resolved": "https://registry.npmjs.org/for-each/-/for-each-0.3.5.tgz",
      "integrity": "sha512-dKx12eRCVIzqCxFGplyFKJMPvLEWgmNtUrpTiJIR5u97zEhRG8ySrtboPHZXx7daLxQVrl643cTzbab2tkQjxg==",
      "license": "MIT",
      "dependencies": {
        "is-callable": "^1.2.7"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/freeport-async": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/freeport-async/-/freeport-async-2.0.0.tgz",
      "integrity": "sha512-K7od3Uw45AJg00XUmy15+Hae2hOcgKcmN3/EF6Y7i01O0gaqiRx8sUSpsb9+BRNL8RPBrhzPsVfy8q9ADlJuWQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/fresh": {
      "version": "0.5.2",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-0.5.2.tgz",
      "integrity": "sha512-zJ2mQYM18rEFOudeV4GShTGIQ7RbzA7ozbU9I/XBpm7kqgMywgmylMwXHxZJmkVoYkna9d2pVXVXPdYTP9ej8Q==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fs.realpath": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/fs.realpath/-/fs.realpath-1.0.0.tgz",
      "integrity": "sha512-OO0pH2lK6a0hZnAdau5ItzHPI6pUlvI7jMVnxUQRtw4owF2wk8lOSabtGDCTP4Ggrg2MbGnWO9X8K1t4+fGMDw==",
      "license": "ISC"
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/generator-function": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/generator-function/-/generator-function-2.0.1.tgz",
      "integrity": "sha512-SFdFmIJi+ybC0vjlHN0ZGVGHc3lgE0DxPAT0djjVg+kjOnSqclqmj0KQ7ykTOLP6YxoqOvuAODGdcHJn+43q3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/geojson-rbush": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/geojson-rbush/-/geojson-rbush-3.2.0.tgz",
      "integrity": "sha512-oVltQTXolxvsz1sZnutlSuLDEcQAKYC/uXt9zDzJJ6bu0W+baTI8LZBaTup5afzibEH4N3jlq2p+a152wlBJ7w==",
      "license": "MIT",
      "dependencies": {
        "@turf/bbox": "*",
        "@turf/helpers": "6.x",
        "@turf/meta": "6.x",
        "@types/geojson": "7946.0.8",
        "rbush": "^3.0.1"
      }
    },
    "node_modules/geojson-rbush/node_modules/@types/geojson": {
      "version": "7946.0.8",
      "resolved": "https://registry.npmjs.org/@types/geojson/-/geojson-7946.0.8.tgz",
      "integrity": "sha512-1rkryxURpr6aWP7R786/UQOkJ3PcpQiWkAXBmdWc7ryFWqN6a4xfK7BtjXvFBKO9LjQ+MWQSWxYeZX1OApnArA==",
      "license": "MIT"
    },
    "node_modules/geojson-vt": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/geojson-vt/-/geojson-vt-3.2.1.tgz",
      "integrity": "sha512-EvGQQi/zPrDA6zr6BnJD/YhwAkBP8nnJ9emh3EnHQKVMfg/MRVtPbMYdgVy/IaEmn4UfagD2a6fafPDL5hbtwg==",
      "license": "ISC"
    },
    "node_modules/get-caller-file": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz",
      "integrity": "sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==",
      "license": "ISC",
      "engines": {
        "node": "6.* || 8.* || >= 10.*"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-package-type": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/get-package-type/-/get-package-type-0.1.0.tgz",
      "integrity": "sha512-pjzuKtY64GYfWizNAJ0fr9VqttZkNiK2iS430LtIHzjBEr6bX8Am2zm4sW4Ro5wjWW5cAlRL1qAMTcXbjNAO2Q==",
      "license": "MIT",
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/get-stream": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/get-stream/-/get-stream-6.0.1.tgz",
      "integrity": "sha512-ts6Wi+2j3jQjqi70w5AlN8DFnkSwC+MqmxEzdEALB2qXZYV3X/b1CTfgPLGJNMeAWxdPfU8FO1ms3NUfaHCPYg==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/getenv": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/getenv/-/getenv-2.0.0.tgz",
      "integrity": "sha512-VilgtJj/ALgGY77fiLam5iD336eSWi96Q15JSAG1zi8NRBysm3LXKdGnHb4m5cuyxvOLQQKWpBZAT6ni4FI2iQ==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/gl-matrix": {
      "version": "3.4.4",
      "resolved": "https://registry.npmjs.org/gl-matrix/-/gl-matrix-3.4.4.tgz",
      "integrity": "sha512-latSnyDNt/8zYUB6VIJ6PCh2jBjJX6gnDsoCZ7LyW7GkqrD51EWwa9qCoGixj8YqBtETQK/xY7OmpTF8xz1DdQ==",
      "license": "MIT"
    },
    "node_modules/glob": {
      "version": "7.2.3",
      "resolved": "https://registry.npmjs.org/glob/-/glob-7.2.3.tgz",
      "integrity": "sha512-nFR0zLpU2YCaRxwoCJvL6UvCH2JFyFVIvwTLsIf21AuHlMskA1hhTdk+LlYJtOlYt9v6dvszD2BGRqBL+iQK9Q==",
      "deprecated": "Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me",
      "license": "ISC",
      "dependencies": {
        "fs.realpath": "^1.0.0",
        "inflight": "^1.0.4",
        "inherits": "2",
        "minimatch": "^3.1.1",
        "once": "^1.3.0",
        "path-is-absolute": "^1.0.0"
      },
      "engines": {
        "node": "*"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/glob/node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "license": "MIT"
    },
    "node_modules/glob/node_modules/brace-expansion": {
      "version": "1.1.21",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.21.tgz",
      "integrity": "sha512-9zeA+KLZNNzglF2TPKRQEDyx6Yby7daAkuy8MiPzpXPsYDWi/DRM8jmwUDxokQjYqBpv5DgPiwD4h4ZZSy1Ujw==",
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/glob/node_modules/minimatch": {
      "version": "3.1.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz",
      "integrity": "sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==",
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "license": "ISC"
    },
    "node_modules/grid-index": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/grid-index/-/grid-index-1.1.0.tgz",
      "integrity": "sha512-HZRwumpOGUrHyxO5bqKZL0B0GlUpwtCAzZ42sgxUPniu33R1LSFH5yrIcBCHjkctCAh3mtWKcKd9J4vDDdeVHA==",
      "license": "ISC"
    },
    "node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/has-property-descriptors": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-property-descriptors/-/has-property-descriptors-1.0.2.tgz",
      "integrity": "sha512-55JNKuIW+vq4Ke1BjOTjM2YctQIvCT7GFzHwmfZPGo5wnrgkid0YQtnAleFSqumZm4az3n2BS+erby5ipJdgrg==",
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.3.tgz",
      "integrity": "sha512-ej4AhfhfL2Q2zpMmLo7U1Uv9+PyhIZpgQLGT1F9miIGmiCJIoCgSmczFdrc97mWT4kVY72KA+WnnhJ5pghSvSg==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/hermes-estree": {
      "version": "0.29.1",
      "resolved": "https://registry.npmjs.org/hermes-estree/-/hermes-estree-0.29.1.tgz",
      "integrity": "sha512-jl+x31n4/w+wEqm0I2r4CMimukLbLQEYpisys5oCre611CI5fc9TxhqkBBCJ1edDG4Kza0f7CgNz8xVMLZQOmQ==",
      "license": "MIT"
    },
    "node_modules/hermes-parser": {
      "version": "0.29.1",
      "resolved": "https://registry.npmjs.org/hermes-parser/-/hermes-parser-0.29.1.tgz",
      "integrity": "sha512-xBHWmUtRC5e/UL0tI7Ivt2riA/YBq9+SiYFU7C1oBa/j2jYGlIF9043oak1F47ihuDIxQ5nbsKueYJDRY02UgA==",
      "license": "MIT",
      "dependencies": {
        "hermes-estree": "0.29.1"
      }
    },
    "node_modules/hosted-git-info": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/hosted-git-info/-/hosted-git-info-7.0.2.tgz",
      "integrity": "sha512-puUZAUKT5m8Zzvs72XWy3HtvVbTWljRE66cP60bxJzAqf2DgICo7lYTY2IHUmLnNpjYvw5bvmoHvPc0QO2a62w==",
      "license": "ISC",
      "dependencies": {
        "lru-cache": "^10.0.1"
      },
      "engines": {
        "node": "^16.14.0 || >=18.0.0"
      }
    },
    "node_modules/hosted-git-info/node_modules/lru-cache": {
      "version": "10.4.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
      "integrity": "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==",
      "license": "ISC"
    },
    "node_modules/html-escaper": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/html-escaper/-/html-escaper-2.0.2.tgz",
      "integrity": "sha512-H2iMtd0I4Mt5eYiapRdIDjp+XzelXQ0tFE4JS7YFwFevXXMmOp9myNrUvCg0D6ws8iqkRPBfKHgbwig1SmlLfg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/http-errors/node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/hyphenate-style-name": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/hyphenate-style-name/-/hyphenate-style-name-1.1.0.tgz",
      "integrity": "sha512-WDC/ui2VVRrz3jOVi+XtjqkDjiVjTtFaAGiW37k6b+ohyQ5wYDOGkvCZa8+H0nx3gyvv0+BST9xuOgIyGQ00gw==",
      "license": "BSD-3-Clause"
    },
    "node_modules/iceberg-js": {
      "version": "0.8.1",
      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",
      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",
      "license": "MIT",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/ieee754": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/ieee754/-/ieee754-1.2.1.tgz",
      "integrity": "sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/image-size": {
      "resolved": "tooling/metro-image-size",
      "link": true
    },
    "node_modules/image-size-modern": {
      "name": "image-size",
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/image-size/-/image-size-2.0.3.tgz",
      "integrity": "sha512-9BJAtVCBth+76NwqnEfWr3PiRnYhbquk6K/USuQ1GQajz5NgLzO7tNsnoNjHfO7LuftgkBf+CCH6j28hjMbIYQ==",
      "license": "MIT",
      "bin": {
        "image-size": "bin/image-size.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",
      "integrity": "sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==",
      "license": "MIT",
      "dependencies": {
        "parent-module": "^1.0.0",
        "resolve-from": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/import-fresh/node_modules/resolve-from": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz",
      "integrity": "sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/inflight": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/inflight/-/inflight-1.0.6.tgz",
      "integrity": "sha512-k92I/b08q4wvFscXCLvqfsHCrjrF7yiXsQuIVvVE7N82W3+aqpzuUdBbfhWcy/FZR3/4IgflMgKLOsvPDrGCJA==",
      "deprecated": "This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.",
      "license": "ISC",
      "dependencies": {
        "once": "^1.3.0",
        "wrappy": "1"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/ini": {
      "version": "1.3.8",
      "resolved": "https://registry.npmjs.org/ini/-/ini-1.3.8.tgz",
      "integrity": "sha512-JV/yugV2uzW5iMRSiZAyDtQd+nxtUnjeLt0acNdw98kKLrvuRVyB80tsREOE7yvGVgalhZ6RNXCmEHkUKBKxew==",
      "license": "ISC"
    },
    "node_modules/inline-style-prefixer": {
      "version": "7.0.1",
      "resolved": "https://registry.npmjs.org/inline-style-prefixer/-/inline-style-prefixer-7.0.1.tgz",
      "integrity": "sha512-lhYo5qNTQp3EvSSp3sRvXMbVQTLrvGV6DycRMJ5dm2BLMiJ30wpXKdDdgX+GmJZ5uQMucwRKHamXSst3Sj/Giw==",
      "license": "MIT",
      "dependencies": {
        "css-in-js-utils": "^3.1.0"
      }
    },
    "node_modules/invariant": {
      "version": "2.2.4",
      "resolved": "https://registry.npmjs.org/invariant/-/invariant-2.2.4.tgz",
      "integrity": "sha512-phJfQVBuaJM5raOpJjSfkiD6BpbCE4Ns//LaXl6wGYtUBY83nWS6Rf9tXm2e8VaK60JEjYldbPif/A2B1C2gNA==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.0.0"
      }
    },
    "node_modules/is-arguments": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/is-arguments/-/is-arguments-1.2.0.tgz",
      "integrity": "sha512-7bVbi0huj/wrIAOzb8U1aszg9kdi3KN/CyU19CTI7tAoZYEZoL9yCDXpbXN+uPsuWnP02cyug1gleqq+TU+YCA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-arrayish": {
      "version": "0.2.1",
      "resolved": "https://registry.npmjs.org/is-arrayish/-/is-arrayish-0.2.1.tgz",
      "integrity": "sha512-zz06S8t0ozoDXMG+ube26zeCTNXcKIPJZJi8hBrF4idCLms4CG9QtK7qBl1boi5ODzFpjswb5JPmHCbMpjaYzg==",
      "license": "MIT"
    },
    "node_modules/is-callable": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/is-callable/-/is-callable-1.2.7.tgz",
      "integrity": "sha512-1BC0BVFhS/p0qtw6enp8e+8OD0UrK0oFLztSjNzhcKA3WDuJxxAPXzPuPtKkjEY9UUoEWlX/8fgKeu2S8i9JTA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.16.2",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.16.2.tgz",
      "integrity": "sha512-evOr8xfXKxE6qSR0hSXL2r3sd7ALj8+7jQEUvPYcm5sgZFdJ+AYzT6yNmJenvIYQBgIGwfwz08sL8zoL7yq2BA==",
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-docker": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/is-docker/-/is-docker-2.2.1.tgz",
      "integrity": "sha512-F+i2BKsFrH66iaUFc0woD8sLy8getkwTwtOBjvs56Cx4CgJDeKQeqfz8wAYiSb8JOprWhHH5p77PbmYCvvUuXQ==",
      "license": "MIT",
      "bin": {
        "is-docker": "cli.js"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/is-fullwidth-code-point": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-generator-function": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/is-generator-function/-/is-generator-function-1.1.2.tgz",
      "integrity": "sha512-upqt1SkGkODW9tsGNG5mtXTXtECizwtS2kA161M+gJPc1xdb/Ax629af6YrTwcOeQHbewrPNlE5Dx7kzvXTizA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.4",
        "generator-function": "^2.0.0",
        "get-proto": "^1.0.1",
        "has-tostringtag": "^1.0.2",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-nan": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/is-nan/-/is-nan-1.3.2.tgz",
      "integrity": "sha512-E+zBKpQ2t6MEo1VsonYmluk9NxGrbzpeeLC2xIViuO2EjU2xsXsBPwTr3Ykv9l08UYEVEdWeRZNouaZqF6RN0w==",
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.0",
        "define-properties": "^1.1.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/is-plain-obj": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-plain-obj/-/is-plain-obj-2.1.0.tgz",
      "integrity": "sha512-YWnfyRwxL/+SsrWYfOpUtz5b3YD+nyfkHvjbcanzk8zgyO4ASD67uVMRt8k5bM4lLMDnXfriRhOpemw+NfT1eA==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-regex": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/is-regex/-/is-regex-1.2.1.tgz",
      "integrity": "sha512-MjYsKHO5O7mCsmRGxWcLWheFqN9DJ/2TmngvjKXihe6efViPqc274+Fx/4fYj/r03+ESvBdTXK0V6tA3rgez1g==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "gopd": "^1.2.0",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-typed-array": {
      "version": "1.1.15",
      "resolved": "https://registry.npmjs.org/is-typed-array/-/is-typed-array-1.1.15.tgz",
      "integrity": "sha512-p3EcsicXjit7SaskXHs1hA91QxgTw46Fv6EFKKGS5DRFLD8yKnohjF3hxoju94b/OcMZoQukzpPpBE9uLVKzgQ==",
      "license": "MIT",
      "dependencies": {
        "which-typed-array": "^1.1.16"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-wsl": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/is-wsl/-/is-wsl-2.2.0.tgz",
      "integrity": "sha512-fKzAra0rGJUUBwGBgNkHZuToZcn+TtXHpeCgmkMJMMYx1sQDYaCSyjJBSCa2nH1DGm7s3n1oBnohoVTBaN7Lww==",
      "license": "MIT",
      "dependencies": {
        "is-docker": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "license": "ISC"
    },
    "node_modules/istanbul-lib-coverage": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/istanbul-lib-coverage/-/istanbul-lib-coverage-3.2.2.tgz",
      "integrity": "sha512-O8dpsF+r0WV/8MNRKfnmrtCWhuKjxrq2w+jpzBL5UZKTi2LeVWnWOmWRxFlesJONmc+wLAGvKQZEOanko0LFTg==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/istanbul-lib-instrument": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/istanbul-lib-instrument/-/istanbul-lib-instrument-5.2.1.tgz",
      "integrity": "sha512-pzqtp31nLv/XFOzXGuvhCb8qhjmTVo5vjVk19XE4CRlSWz0KoeJ3bw9XsA7nOp9YBf4qHjwBxkDzKcME/J29Yg==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@babel/core": "^7.12.3",
        "@babel/parser": "^7.14.7",
        "@istanbuljs/schema": "^0.1.2",
        "istanbul-lib-coverage": "^3.2.0",
        "semver": "^6.3.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/istanbul-lib-report": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/istanbul-lib-report/-/istanbul-lib-report-3.0.1.tgz",
      "integrity": "sha512-GCfE1mtsHGOELCU8e/Z7YWzpmybrx/+dSTfLrvY8qRmaY6zXTKWn6WQIjaAFw069icm6GVMNkgu0NzI4iPZUNw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "istanbul-lib-coverage": "^3.0.0",
        "make-dir": "^4.0.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/istanbul-reports": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/istanbul-reports/-/istanbul-reports-3.2.0.tgz",
      "integrity": "sha512-HGYWWS/ehqTV3xN10i23tkPkpH46MLCIMFNCaaKNavAXTF1RkqxawEPtnjnGZ6XKSInBKkiOA5BKS+aZiY3AvA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "html-escaper": "^2.0.0",
        "istanbul-lib-report": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/jest-environment-node": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/jest-environment-node/-/jest-environment-node-29.7.0.tgz",
      "integrity": "sha512-DOSwCRqXirTOyheM+4d5YZOrWcdu0LNZ87ewUoywbcb2XR4wKgqiG8vNeYwhjFMbEkfju7wx2GYH0P2gevGvFw==",
      "license": "MIT",
      "dependencies": {
        "@jest/environment": "^29.7.0",
        "@jest/fake-timers": "^29.7.0",
        "@jest/types": "^29.6.3",
        "@types/node": "*",
        "jest-mock": "^29.7.0",
        "jest-util": "^29.7.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/jest-get-type": {
      "version": "29.6.3",
      "resolved": "https://registry.npmjs.org/jest-get-type/-/jest-get-type-29.6.3.tgz",
      "integrity": "sha512-zrteXnqYxfQh7l5FHyL38jL39di8H8rHoecLH3JNxH3BwOrBsNeabdap5e0I23lD4HHI8W5VFBZqG4Eaq5LNcw==",
      "license": "MIT",
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/jest-haste-map": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/jest-haste-map/-/jest-haste-map-29.7.0.tgz",
      "integrity": "sha512-fP8u2pyfqx0K1rGn1R9pyE0/KTn+G7PxktWidOBTqFPLYX0b9ksaMFkhK5vrS3DVun09pckLdlx90QthlW7AmA==",
      "license": "MIT",
      "dependencies": {
        "@jest/types": "^29.6.3",
        "@types/graceful-fs": "^4.1.3",
        "@types/node": "*",
        "anymatch": "^3.0.3",
        "fb-watchman": "^2.0.0",
        "graceful-fs": "^4.2.9",
        "jest-regex-util": "^29.6.3",
        "jest-util": "^29.7.0",
        "jest-worker": "^29.7.0",
        "micromatch": "^4.0.4",
        "walker": "^1.0.8"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      },
      "optionalDependencies": {
        "fsevents": "^2.3.2"
      }
    },
    "node_modules/jest-message-util": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/jest-message-util/-/jest-message-util-29.7.0.tgz",
      "integrity": "sha512-GBEV4GRADeP+qtB2+6u61stea8mGcOT4mCtrYISZwfu9/ISHFJ/5zOMXYbpBE9RsS5+Gb63DW4FgmnKJ79Kf6w==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.12.13",
        "@jest/types": "^29.6.3",
        "@types/stack-utils": "^2.0.0",
        "chalk": "^4.0.0",
        "graceful-fs": "^4.2.9",
        "micromatch": "^4.0.4",
        "pretty-format": "^29.7.0",
        "slash": "^3.0.0",
        "stack-utils": "^2.0.3"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/jest-mock": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/jest-mock/-/jest-mock-29.7.0.tgz",
      "integrity": "sha512-ITOMZn+UkYS4ZFh83xYAOzWStloNzJFO2s8DWrE4lhtGD+AorgnbkiKERe4wQVBydIGPx059g6riW5Btp6Llnw==",
      "license": "MIT",
      "dependencies": {
        "@jest/types": "^29.6.3",
        "@types/node": "*",
        "jest-util": "^29.7.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/jest-regex-util": {
      "version": "29.6.3",
      "resolved": "https://registry.npmjs.org/jest-regex-util/-/jest-regex-util-29.6.3.tgz",
      "integrity": "sha512-KJJBsRCyyLNWCNBOvZyRDnAIfUiRJ8v+hOBQYGn8gDyF3UegwiP4gwRR3/SDa42g1YbVycTidUF3rKjyLFDWbg==",
      "license": "MIT",
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/jest-util": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/jest-util/-/jest-util-29.7.0.tgz",
      "integrity": "sha512-z6EbKajIpqGKU56y5KBUgy1dt1ihhQJgWzUlZHArA/+X2ad7Cb5iF+AK1EWVL/Bo7Rz9uurpqw6SiBCefUbCGA==",
      "license": "MIT",
      "dependencies": {
        "@jest/types": "^29.6.3",
        "@types/node": "*",
        "chalk": "^4.0.0",
        "ci-info": "^3.2.0",
        "graceful-fs": "^4.2.9",
        "picomatch": "^2.2.3"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/jest-util/node_modules/ci-info": {
      "version": "3.9.0",
      "resolved": "https://registry.npmjs.org/ci-info/-/ci-info-3.9.0.tgz",
      "integrity": "sha512-NIxF55hv4nSqQswkAeiOi1r83xy8JldOFDTWiug55KBu9Jnblncd2U6ViHmYgHf01TPZS77NJBhBMKdWj9HQMQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/sibiraj-s"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/jest-validate": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/jest-validate/-/jest-validate-29.7.0.tgz",
      "integrity": "sha512-ZB7wHqaRGVw/9hST/OuFUReG7M8vKeq0/J2egIGLdvjHCmYqGARhzXmtgi+gVeZ5uXFF219aOc3Ls2yLg27tkw==",
      "license": "MIT",
      "dependencies": {
        "@jest/types": "^29.6.3",
        "camelcase": "^6.2.0",
        "chalk": "^4.0.0",
        "jest-get-type": "^29.6.3",
        "leven": "^3.1.0",
        "pretty-format": "^29.7.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/jest-worker": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/jest-worker/-/jest-worker-29.7.0.tgz",
      "integrity": "sha512-eIz2msL/EzL9UFTFFx7jBTkeZfku0yUAyZZZmJ93H2TYEiroIx2PQjEXcwYtYl8zXCxb+PAmA2hLIt/6ZEkPHw==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*",
        "jest-util": "^29.7.0",
        "merge-stream": "^2.0.0",
        "supports-color": "^8.0.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/jest-worker/node_modules/supports-color": {
      "version": "8.1.1",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-8.1.1.tgz",
      "integrity": "sha512-MpUEN2OodtUzxvKQl72cUF7RQ5EiHsGvSsVG0ia9c5RbWGL2CI4C7EpPS8UTBIplnlzZiNuV56w+FuNxy3ty2Q==",
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/supports-color?sponsor=1"
      }
    },
    "node_modules/jimp-compact": {
      "version": "0.16.1",
      "resolved": "https://registry.npmjs.org/jimp-compact/-/jimp-compact-0.16.1.tgz",
      "integrity": "sha512-dZ6Ra7u1G8c4Letq/B5EzAxj4tLFHL+cGtdpR+PVm4yzPDj+lCk+AbivWt1eOM+ikzkowtyV7qSqX6qr3t71Ww==",
      "license": "MIT"
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/js-yaml": {
      "version": "3.15.2",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-3.15.2.tgz",
      "integrity": "sha512-6EuL879VkRA+1Cz578mKMiKvjPNEuk6+r1JaFzoSWejZmtf7xWbIyw1e3KkxlkzTIt9Taw6JBhEppG7utc1P+w==",
      "license": "MIT",
      "dependencies": {
        "argparse": "^1.0.7",
        "esprima": "^4.0.0"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/jsc-safe-url": {
      "version": "0.2.4",
      "resolved": "https://registry.npmjs.org/jsc-safe-url/-/jsc-safe-url-0.2.4.tgz",
      "integrity": "sha512-0wM3YBWtYePOjfyXQH5MWQ8H7sdk5EXSwZvmSLKk2RboVQ2Bu239jycHDz5J/8Blf3K0Qnoy2b6xD+z10MFB+Q==",
      "license": "0BSD"
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json-parse-even-better-errors": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/json-parse-even-better-errors/-/json-parse-even-better-errors-2.3.1.tgz",
      "integrity": "sha512-xyFwyhro/JEof6Ghe2iz2NcXoj2sloNsWr/XsERDK/oiPCfaNhl5ONfp+jQdAZRQQ0IJWNzH9zIZF7li91kh2w==",
      "license": "MIT"
    },
    "node_modules/json-schema-traverse": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz",
      "integrity": "sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==",
      "license": "MIT"
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/kdbush": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/kdbush/-/kdbush-4.1.0.tgz",
      "integrity": "sha512-e9vurzrXJQrFX6ckpHP3bvj5l+9CnYzkxDNnNQ1h2QTqdWsUAJgXiKdGNcOa1EY85dU8KbQ+z/FdQdB7P+9yfQ==",
      "license": "ISC"
    },
    "node_modules/kleur": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/kleur/-/kleur-3.0.3.tgz",
      "integrity": "sha512-eTIzlVOSUR+JxdDFepEYcBMtZ9Qqdef+rnzWdRZuMbOywu5tO2w2N7rqjoANZ5k9vywhL6Br1VRjUIgTQx4E8w==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/lan-network": {
      "version": "0.2.1",
      "resolved": "https://registry.npmjs.org/lan-network/-/lan-network-0.2.1.tgz",
      "integrity": "sha512-ONPnazC96VKDntab9j9JKwIWhZ4ZUceB4A9Epu4Ssg0hYFmtHZSeQ+n15nIwTFmcBUKtExOer8WTJ4GF9MO64A==",
      "license": "MIT",
      "bin": {
        "lan-network": "dist/lan-network-cli.js"
      }
    },
    "node_modules/leven": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/leven/-/leven-3.1.0.tgz",
      "integrity": "sha512-qsda+H8jTaUaN/x5vzW2rzc+8Rw4TAQ/4KjB46IwK5VH+IlVeeeje/EoZRpiXvIqjFgK84QffqPztGI3VBLG1A==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/lighthouse-logger": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/lighthouse-logger/-/lighthouse-logger-1.4.2.tgz",
      "integrity": "sha512-gPWxznF6TKmUHrOQjlVo2UbaL2EJ71mb2CCeRs/2qBpi4L/g4LUVc9+3lKQ6DTUZwJswfM7ainGrLO1+fOqa2g==",
      "license": "Apache-2.0",
      "dependencies": {
        "debug": "^2.6.9",
        "marky": "^1.2.2"
      }
    },
    "node_modules/lighthouse-logger/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/lighthouse-logger/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
      "license": "MIT"
    },
    "node_modules/locate-path": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-5.0.0.tgz",
      "integrity": "sha512-t7hw9pI+WvuwNJXwk5zVHpyhIqzg2qTlklJOf0mVxGSbe3Fp2VieZcduNYjaLDoy6p9uGpQEGWG87WpMKlNq8g==",
      "license": "MIT",
      "dependencies": {
        "p-locate": "^4.1.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/lodash.debounce": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/lodash.debounce/-/lodash.debounce-4.0.8.tgz",
      "integrity": "sha512-FT1yDzDYEoYWhnSGnpE/4Kj1fLZkDFyqRb7fNt6FdYOSxlUWAtp42Eh6Wb0rGIv/m9Bgo7x4GhQbm5Ys4SG5ow==",
      "license": "MIT"
    },
    "node_modules/lodash.throttle": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/lodash.throttle/-/lodash.throttle-4.1.1.tgz",
      "integrity": "sha512-wIkUCfVKpVsWo3JSZlc+8MB5it+2AN5W8J7YVMST30UrvcQNZ1Okbj+rbVniijTWE6FGYy4XJq/rHkas8qJMLQ==",
      "license": "MIT"
    },
    "node_modules/log-symbols": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/log-symbols/-/log-symbols-2.2.0.tgz",
      "integrity": "sha512-VeIAFslyIerEJLXHziedo2basKbMKtTw3vfn5IzG0XTjhAVEJyNHnL2p7vc+wBDSdQuUpNw3M2u6xb9QsAY5Eg==",
      "license": "MIT",
      "dependencies": {
        "chalk": "^2.0.1"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/log-symbols/node_modules/ansi-styles": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-3.2.1.tgz",
      "integrity": "sha512-VT0ZI6kZRdTh8YyJw3SMbYm/u+NqfsAxEpWO0Pf9sq8/e94WxxOpPKx9FR1FlyCtOVDNOQ+8ntlqFxiRc+r5qA==",
      "license": "MIT",
      "dependencies": {
        "color-convert": "^1.9.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/log-symbols/node_modules/chalk": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-2.4.2.tgz",
      "integrity": "sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==",
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^3.2.1",
        "escape-string-regexp": "^1.0.5",
        "supports-color": "^5.3.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/log-symbols/node_modules/color-convert": {
      "version": "1.9.3",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-1.9.3.tgz",
      "integrity": "sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==",
      "license": "MIT",
      "dependencies": {
        "color-name": "1.1.3"
      }
    },
    "node_modules/log-symbols/node_modules/color-name": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.3.tgz",
      "integrity": "sha512-72fSenhMw2HZMTVHeCA9KCmpEIbzWiQsjN+BHcBbS9vr1mtt+vJjPdksIBNUmKAW8TFUDPJK5SUU3QhE9NEXDw==",
      "license": "MIT"
    },
    "node_modules/log-symbols/node_modules/escape-string-regexp": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz",
      "integrity": "sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.8.0"
      }
    },
    "node_modules/log-symbols/node_modules/has-flag": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-3.0.0.tgz",
      "integrity": "sha512-sKJf1+ceQBr4SMkvQnBDNDtf4TXpVhVGateu0t918bl30FnbE2m4vNLX+VWe/dpjlb+HugGYzW7uQXH98HPEYw==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/log-symbols/node_modules/supports-color": {
      "version": "5.5.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-5.5.0.tgz",
      "integrity": "sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==",
      "license": "MIT",
      "dependencies": {
        "has-flag": "^3.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lower-case": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/lower-case/-/lower-case-2.0.2.tgz",
      "integrity": "sha512-7fm3l3NAF9WfN6W3JOmf5drwpVqX78JtoGJ3A6W0a6ZnldM41w2fV5D490psKFTpMds8TJse/eHLFFsNHHjHgg==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.0.3"
      }
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/magicast": {
      "version": "0.5.5",
      "resolved": "https://registry.npmjs.org/magicast/-/magicast-0.5.5.tgz",
      "integrity": "sha512-UicdXN8zQ3JHlxVq+28afMXPr1z7WNY6+7EJnzTdQWkTAlMLF5fNCCKxJHBQwGaNGR11581EiQmQzx73+MvszA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7",
        "source-map-js": "^1.2.1"
      }
    },
    "node_modules/make-dir": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/make-dir/-/make-dir-4.0.0.tgz",
      "integrity": "sha512-hXdUTZYIVOt1Ex//jAQi+wTZZpUpwBj/0QsOzqegb3rGMMeJiSEu5xLHnYfBrRV4RH2+OCSOO95Is/7x1WJ4bw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "semver": "^7.5.3"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/make-dir/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/makeerror": {
      "version": "1.0.12",
      "resolved": "https://registry.npmjs.org/makeerror/-/makeerror-1.0.12.tgz",
      "integrity": "sha512-JmqCvUhmt43madlpFzG4BQzG2Z3m6tvQDNKdClZnO3VbIudJYmxsT0FNJMeiB2+JTSlTQTSbU8QdesVmwJcmLg==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "tmpl": "1.0.5"
      }
    },
    "node_modules/mapbox-gl": {
      "version": "2.15.0",
      "resolved": "https://registry.npmjs.org/mapbox-gl/-/mapbox-gl-2.15.0.tgz",
      "integrity": "sha512-fjv+aYrd5TIHiL7wRa+W7KjtUqKWziJMZUkK5hm8TvJ3OLeNPx4NmW/DgfYhd/jHej8wWL+QJBDbdMMAKvNC0A==",
      "license": "SEE LICENSE IN LICENSE.txt",
      "dependencies": {
        "@mapbox/geojson-rewind": "^0.5.2",
        "@mapbox/jsonlint-lines-primitives": "^2.0.2",
        "@mapbox/mapbox-gl-supported": "^2.0.1",
        "@mapbox/point-geometry": "^0.1.0",
        "@mapbox/tiny-sdf": "^2.0.6",
        "@mapbox/unitbezier": "^0.0.1",
        "@mapbox/vector-tile": "^1.3.1",
        "@mapbox/whoots-js": "^3.1.0",
        "csscolorparser": "~1.0.3",
        "earcut": "^2.2.4",
        "geojson-vt": "^3.2.1",
        "gl-matrix": "^3.4.3",
        "grid-index": "^1.1.0",
        "kdbush": "^4.0.1",
        "murmurhash-js": "^1.0.0",
        "pbf": "^3.2.1",
        "potpack": "^2.0.0",
        "quickselect": "^2.0.0",
        "rw": "^1.3.3",
        "supercluster": "^8.0.0",
        "tinyqueue": "^2.0.3",
        "vt-pbf": "^3.1.3"
      }
    },
    "node_modules/marky": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/marky/-/marky-1.3.0.tgz",
      "integrity": "sha512-ocnPZQLNpvbedwTy9kNrQEsknEfgvcLMvOtz3sFeWApDq1MXH1TqkCIx58xlpESsfwQOnuBO9beyQuNGzVvuhQ==",
      "license": "Apache-2.0"
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/mdn-data": {
      "version": "2.0.14",
      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.0.14.tgz",
      "integrity": "sha512-dn6wd0uw5GsdswPFfsgMp5NSB0/aDe6fK94YJV/AJDYXL6HVLWBsxeq7js7Ad+mU2K9LAlwpk6kN2D5mwCPVow==",
      "license": "CC0-1.0"
    },
    "node_modules/memoize-one": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/memoize-one/-/memoize-one-5.2.1.tgz",
      "integrity": "sha512-zYiwtZUcYyXKo/np96AGZAckk+FWWsUdJ3cHGGmld7+AhvcWmQyGCYUh1hc4Q/pkOhb65dQR/pqCyK0cOaHz4Q==",
      "license": "MIT"
    },
    "node_modules/merge-options": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/merge-options/-/merge-options-3.0.4.tgz",
      "integrity": "sha512-2Sug1+knBjkaMsMgf1ctR1Ujx+Ayku4EdJN4Z+C2+JzoeF7A3OZ9KM2GY0CpQS51NR61LTurMJrRKPhSs3ZRTQ==",
      "license": "MIT",
      "dependencies": {
        "is-plain-obj": "^2.1.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/merge-stream": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/merge-stream/-/merge-stream-2.0.0.tgz",
      "integrity": "sha512-abv/qOcuPfk3URPfDzmZU1LKmuw8kT+0nIHvKrKgFrwifol/doWcdA4ZqsWQ8ENrFKkd67Mfpo/LovbIUsbt3w==",
      "license": "MIT"
    },
    "node_modules/metro": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro/-/metro-0.83.3.tgz",
      "integrity": "sha512-+rP+/GieOzkt97hSJ0MrPOuAH/jpaS21ZDvL9DJ35QYRDlQcwzcvUlGUf79AnQxq/2NPiS/AULhhM4TKutIt8Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.24.7",
        "@babel/core": "^7.25.2",
        "@babel/generator": "^7.25.0",
        "@babel/parser": "^7.25.3",
        "@babel/template": "^7.25.0",
        "@babel/traverse": "^7.25.3",
        "@babel/types": "^7.25.2",
        "accepts": "^1.3.7",
        "chalk": "^4.0.0",
        "ci-info": "^2.0.0",
        "connect": "^3.6.5",
        "debug": "^4.4.0",
        "error-stack-parser": "^2.0.6",
        "flow-enums-runtime": "^0.0.6",
        "graceful-fs": "^4.2.4",
        "hermes-parser": "0.32.0",
        "image-size": "^1.0.2",
        "invariant": "^2.2.4",
        "jest-worker": "^29.7.0",
        "jsc-safe-url": "^0.2.2",
        "lodash.throttle": "^4.1.1",
        "metro-babel-transformer": "0.83.3",
        "metro-cache": "0.83.3",
        "metro-cache-key": "0.83.3",
        "metro-config": "0.83.3",
        "metro-core": "0.83.3",
        "metro-file-map": "0.83.3",
        "metro-resolver": "0.83.3",
        "metro-runtime": "0.83.3",
        "metro-source-map": "0.83.3",
        "metro-symbolicate": "0.83.3",
        "metro-transform-plugins": "0.83.3",
        "metro-transform-worker": "0.83.3",
        "mime-types": "^2.1.27",
        "nullthrows": "^1.1.1",
        "serialize-error": "^2.1.0",
        "source-map": "^0.5.6",
        "throat": "^5.0.0",
        "ws": "^7.5.10",
        "yargs": "^17.6.2"
      },
      "bin": {
        "metro": "src/cli.js"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-babel-transformer": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-babel-transformer/-/metro-babel-transformer-0.83.3.tgz",
      "integrity": "sha512-1vxlvj2yY24ES1O5RsSIvg4a4WeL7PFXgKOHvXTXiW0deLvQr28ExXj6LjwCCDZ4YZLhq6HddLpZnX4dEdSq5g==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.25.2",
        "flow-enums-runtime": "^0.0.6",
        "hermes-parser": "0.32.0",
        "nullthrows": "^1.1.1"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-babel-transformer/node_modules/hermes-estree": {
      "version": "0.32.0",
      "resolved": "https://registry.npmjs.org/hermes-estree/-/hermes-estree-0.32.0.tgz",
      "integrity": "sha512-KWn3BqnlDOl97Xe1Yviur6NbgIZ+IP+UVSpshlZWkq+EtoHg6/cwiDj/osP9PCEgFE15KBm1O55JRwbMEm5ejQ==",
      "license": "MIT"
    },
    "node_modules/metro-babel-transformer/node_modules/hermes-parser": {
      "version": "0.32.0",
      "resolved": "https://registry.npmjs.org/hermes-parser/-/hermes-parser-0.32.0.tgz",
      "integrity": "sha512-g4nBOWFpuiTqjR3LZdRxKUkij9iyveWeuks7INEsMX741f3r9xxrOe8TeQfUxtda0eXmiIFiMQzoeSQEno33Hw==",
      "license": "MIT",
      "dependencies": {
        "hermes-estree": "0.32.0"
      }
    },
    "node_modules/metro-cache": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-cache/-/metro-cache-0.83.3.tgz",
      "integrity": "sha512-3jo65X515mQJvKqK3vWRblxDEcgY55Sk3w4xa6LlfEXgQ9g1WgMh9m4qVZVwgcHoLy0a2HENTPCCX4Pk6s8c8Q==",
      "license": "MIT",
      "dependencies": {
        "exponential-backoff": "^3.1.1",
        "flow-enums-runtime": "^0.0.6",
        "https-proxy-agent": "^7.0.5",
        "metro-core": "0.83.3"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-cache-key": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-cache-key/-/metro-cache-key-0.83.3.tgz",
      "integrity": "sha512-59ZO049jKzSmvBmG/B5bZ6/dztP0ilp0o988nc6dpaDsU05Cl1c/lRf+yx8m9WW/JVgbmfO5MziBU559XjI5Zw==",
      "license": "MIT",
      "dependencies": {
        "flow-enums-runtime": "^0.0.6"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-config": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-config/-/metro-config-0.83.3.tgz",
      "integrity": "sha512-mTel7ipT0yNjKILIan04bkJkuCzUUkm2SeEaTads8VfEecCh+ltXchdq6DovXJqzQAXuR2P9cxZB47Lg4klriA==",
      "license": "MIT",
      "dependencies": {
        "connect": "^3.6.5",
        "flow-enums-runtime": "^0.0.6",
        "jest-validate": "^29.7.0",
        "metro": "0.83.3",
        "metro-cache": "0.83.3",
        "metro-core": "0.83.3",
        "metro-runtime": "0.83.3",
        "yaml": "^2.6.1"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-core": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-core/-/metro-core-0.83.3.tgz",
      "integrity": "sha512-M+X59lm7oBmJZamc96usuF1kusd5YimqG/q97g4Ac7slnJ3YiGglW5CsOlicTR5EWf8MQFxxjDoB6ytTqRe8Hw==",
      "license": "MIT",
      "dependencies": {
        "flow-enums-runtime": "^0.0.6",
        "lodash.throttle": "^4.1.1",
        "metro-resolver": "0.83.3"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-file-map": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-file-map/-/metro-file-map-0.83.3.tgz",
      "integrity": "sha512-jg5AcyE0Q9Xbbu/4NAwwZkmQn7doJCKGW0SLeSJmzNB9Z24jBe0AL2PHNMy4eu0JiKtNWHz9IiONGZWq7hjVTA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "fb-watchman": "^2.0.0",
        "flow-enums-runtime": "^0.0.6",
        "graceful-fs": "^4.2.4",
        "invariant": "^2.2.4",
        "jest-worker": "^29.7.0",
        "micromatch": "^4.0.4",
        "nullthrows": "^1.1.1",
        "walker": "^1.0.7"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-minify-terser": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-minify-terser/-/metro-minify-terser-0.83.3.tgz",
      "integrity": "sha512-O2BmfWj6FSfzBLrNCXt/rr2VYZdX5i6444QJU0fFoc7Ljg+Q+iqebwE3K0eTvkI6TRjELsXk1cjU+fXwAR4OjQ==",
      "license": "MIT",
      "dependencies": {
        "flow-enums-runtime": "^0.0.6",
        "terser": "^5.15.0"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-resolver": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-resolver/-/metro-resolver-0.83.3.tgz",
      "integrity": "sha512-0js+zwI5flFxb1ktmR///bxHYg7OLpRpWZlBBruYG8OKYxeMP7SV0xQ/o/hUelrEMdK4LJzqVtHAhBm25LVfAQ==",
      "license": "MIT",
      "dependencies": {
        "flow-enums-runtime": "^0.0.6"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-runtime": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-runtime/-/metro-runtime-0.83.3.tgz",
      "integrity": "sha512-JHCJb9ebr9rfJ+LcssFYA2x1qPYuSD/bbePupIGhpMrsla7RCwC/VL3yJ9cSU+nUhU4c9Ixxy8tBta+JbDeZWw==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.25.0",
        "flow-enums-runtime": "^0.0.6"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-source-map": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-source-map/-/metro-source-map-0.83.3.tgz",
      "integrity": "sha512-xkC3qwUBh2psVZgVavo8+r2C9Igkk3DibiOXSAht1aYRRcztEZNFtAMtfSB7sdO2iFMx2Mlyu++cBxz/fhdzQg==",
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.25.3",
        "@babel/traverse--for-generate-function-map": "npm:@babel/traverse@^7.25.3",
        "@babel/types": "^7.25.2",
        "flow-enums-runtime": "^0.0.6",
        "invariant": "^2.2.4",
        "metro-symbolicate": "0.83.3",
        "nullthrows": "^1.1.1",
        "ob1": "0.83.3",
        "source-map": "^0.5.6",
        "vlq": "^1.0.0"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-symbolicate": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-symbolicate/-/metro-symbolicate-0.83.3.tgz",
      "integrity": "sha512-F/YChgKd6KbFK3eUR5HdUsfBqVsanf5lNTwFd4Ca7uuxnHgBC3kR/Hba/RGkenR3pZaGNp5Bu9ZqqP52Wyhomw==",
      "license": "MIT",
      "dependencies": {
        "flow-enums-runtime": "^0.0.6",
        "invariant": "^2.2.4",
        "metro-source-map": "0.83.3",
        "nullthrows": "^1.1.1",
        "source-map": "^0.5.6",
        "vlq": "^1.0.0"
      },
      "bin": {
        "metro-symbolicate": "src/index.js"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-transform-plugins": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-transform-plugins/-/metro-transform-plugins-0.83.3.tgz",
      "integrity": "sha512-eRGoKJU6jmqOakBMH5kUB7VitEWiNrDzBHpYbkBXW7C5fUGeOd2CyqrosEzbMK5VMiZYyOcNFEphvxk3OXey2A==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.25.2",
        "@babel/generator": "^7.25.0",
        "@babel/template": "^7.25.0",
        "@babel/traverse": "^7.25.3",
        "flow-enums-runtime": "^0.0.6",
        "nullthrows": "^1.1.1"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro-transform-worker": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/metro-transform-worker/-/metro-transform-worker-0.83.3.tgz",
      "integrity": "sha512-Ztekew9t/gOIMZX1tvJOgX7KlSLL5kWykl0Iwu2cL2vKMKVALRl1hysyhUw0vjpAvLFx+Kfq9VLjnHIkW32fPA==",
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.25.2",
        "@babel/generator": "^7.25.0",
        "@babel/parser": "^7.25.3",
        "@babel/types": "^7.25.2",
        "flow-enums-runtime": "^0.0.6",
        "metro": "0.83.3",
        "metro-babel-transformer": "0.83.3",
        "metro-cache": "0.83.3",
        "metro-cache-key": "0.83.3",
        "metro-minify-terser": "0.83.3",
        "metro-source-map": "0.83.3",
        "metro-transform-plugins": "0.83.3",
        "nullthrows": "^1.1.1"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/metro/node_modules/hermes-estree": {
      "version": "0.32.0",
      "resolved": "https://registry.npmjs.org/hermes-estree/-/hermes-estree-0.32.0.tgz",
      "integrity": "sha512-KWn3BqnlDOl97Xe1Yviur6NbgIZ+IP+UVSpshlZWkq+EtoHg6/cwiDj/osP9PCEgFE15KBm1O55JRwbMEm5ejQ==",
      "license": "MIT"
    },
    "node_modules/metro/node_modules/hermes-parser": {
      "version": "0.32.0",
      "resolved": "https://registry.npmjs.org/hermes-parser/-/hermes-parser-0.32.0.tgz",
      "integrity": "sha512-g4nBOWFpuiTqjR3LZdRxKUkij9iyveWeuks7INEsMX741f3r9xxrOe8TeQfUxtda0eXmiIFiMQzoeSQEno33Hw==",
      "license": "MIT",
      "dependencies": {
        "hermes-estree": "0.32.0"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/mime": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/mime/-/mime-1.6.0.tgz",
      "integrity": "sha512-x0Vn8spI+wuJ1O6S7gnbaQg8Pxh4NNHb7KSINmEWKiPE4RKOplvijn+NkmYmmRgP68mc70j2EbeTFRsrswaQeg==",
      "license": "MIT",
      "bin": {
        "mime": "cli.js"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mimic-fn": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/mimic-fn/-/mimic-fn-1.2.0.tgz",
      "integrity": "sha512-jf84uxzwiuiIVKiOLpfYk7N46TSy8ubTonmneY9vrpHNAnp0QBt2BxWV9dO3/j+BoVAb+a5G6YDPW3M5HOdMWQ==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/minimatch": {
      "version": "10.2.6",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz",
      "integrity": "sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "brace-expansion": "^5.0.8"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/minimist": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/minimist/-/minimist-1.2.8.tgz",
      "integrity": "sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.3",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.3.tgz",
      "integrity": "sha512-tEBHqDnIoM/1rXME1zgka9g6Q2lcoCkxHLuc7ODJ5BxbP5d4c2Z5cGgtXAku59200Cx7diuHTOYfSBD8n6mm8A==",
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/minizlib": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/minizlib/-/minizlib-3.1.0.tgz",
      "integrity": "sha512-KZxYo1BUkWD2TVFLr0MQoM8vUUigWD3LlD83a/75BqC+4qE0Hb1Vo5v1FgcfaNXvfXzr+5EhQ6ing/CaBijTlw==",
      "license": "MIT",
      "dependencies": {
        "minipass": "^7.1.2"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/mkdirp": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/mkdirp/-/mkdirp-1.0.4.tgz",
      "integrity": "sha512-vVqVZQyf3WLx2Shd0qJ9xuvqgAyKPLAiqITEtqW0oIUjzo3PePDd6fW9iFz30ef7Ysp/oiWqbhszeGWW2T6Gzw==",
      "license": "MIT",
      "bin": {
        "mkdirp": "bin/cmd.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/murmurhash-js": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/murmurhash-js/-/murmurhash-js-1.0.0.tgz",
      "integrity": "sha512-TvmkNhkv8yct0SVBSy+o8wYzXjE4Zz3PCesbfs8HiCXXdcTuocApFv11UWlNFWKYsP2okqrhb7JNlSm9InBhIw==",
      "license": "MIT"
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.18",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
      "integrity": "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/negotiator": {
      "version": "0.6.3",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.3.tgz",
      "integrity": "sha512-+EUsqGPLsM+j/zdChZjsnX51g4XrHFOIXwfnCVPGlQk/k5giakcKsuxCObBRu6DSm9opw/O6slWbJdghQM4bBg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/nested-error-stacks": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/nested-error-stacks/-/nested-error-stacks-2.0.1.tgz",
      "integrity": "sha512-SrQrok4CATudVzBS7coSz26QRSmlK9TzzoFbeKfcPBUFPjcQM9Rqvr/DlJkOrwI/0KcgvMub1n1g5Jt9EgRn4A==",
      "license": "MIT"
    },
    "node_modules/no-case": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/no-case/-/no-case-3.0.4.tgz",
      "integrity": "sha512-fgAN3jGAh+RoxUGZHTSOLJIqUc2wmoBwGR4tbpNAKmmovFoWq0OdRkb0VkldReO2a2iBT/OEulG9XSUc10r3zg==",
      "license": "MIT",
      "dependencies": {
        "lower-case": "^2.0.2",
        "tslib": "^2.0.3"
      }
    },
    "node_modules/node-fetch": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-2.7.0.tgz",
      "integrity": "sha512-c4FRfUm/dbcWZ7U+1Wq0AwCyFL+3nt2bEw05wfxSz+DWpWsitgmSgYmy2dQdWyKC1694ELPqMs/YzUSNozLt8A==",
      "license": "MIT",
      "dependencies": {
        "whatwg-url": "^5.0.0"
      },
      "engines": {
        "node": "4.x || >=6.0.0"
      },
      "peerDependencies": {
        "encoding": "^0.1.0"
      },
      "peerDependenciesMeta": {
        "encoding": {
          "optional": true
        }
      }
    },
    "node_modules/node-forge": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/node-forge/-/node-forge-1.4.0.tgz",
      "integrity": "sha512-LarFH0+6VfriEhqMMcLX2F7SwSXeWwnEAJEsYm5QKWchiVYVvJyV9v7UDvUv+w5HO23ZpQTXDv/GxdDdMyOuoQ==",
      "license": "(BSD-3-Clause OR GPL-2.0)",
      "engines": {
        "node": ">= 6.13.0"
      }
    },
    "node_modules/node-int64": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/node-int64/-/node-int64-0.4.0.tgz",
      "integrity": "sha512-O5lz91xSOeoXP6DulyHfllpq+Eg00MWitZIbtPfoSEvqIHdl5gfcY6hYzDWnj0qD5tz52PI08u9qUvSVeUBeHw==",
      "license": "MIT"
    },
    "node_modules/node-releases": {
      "version": "2.0.57",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.57.tgz",
      "integrity": "sha512-kQK9LGGFiHtrWiNhZtA7Qbw17AQz+dmsEKODRIVTXA9+e5MS/2gZEBhYJt13GrAz5/IOZKddH/0Z3TP/Zgo+yw==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/npm-package-arg": {
      "version": "11.0.3",
      "resolved": "https://registry.npmjs.org/npm-package-arg/-/npm-package-arg-11.0.3.tgz",
      "integrity": "sha512-sHGJy8sOC1YraBywpzQlIKBE4pBbGbiF95U6Auspzyem956E0+FtDtsx1ZxlOJkQCZ1AFXAY/yuvtFYrOxF+Bw==",
      "license": "ISC",
      "dependencies": {
        "hosted-git-info": "^7.0.0",
        "proc-log": "^4.0.0",
        "semver": "^7.3.5",
        "validate-npm-package-name": "^5.0.0"
      },
      "engines": {
        "node": "^16.14.0 || >=18.0.0"
      }
    },
    "node_modules/npm-package-arg/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/nth-check": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/nth-check/-/nth-check-2.1.1.tgz",
      "integrity": "sha512-lqjrjmaOoAnWfMmBPL+XNnynZh2+swxiX3WUE0s4yEHI6m+AwrK2UZOimIRl3X/4QctVqS8AiZjFqyOGrMXb/w==",
      "license": "BSD-2-Clause",
      "dependencies": {
        "boolbase": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/fb55/nth-check?sponsor=1"
      }
    },
    "node_modules/nullthrows": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/nullthrows/-/nullthrows-1.1.1.tgz",
      "integrity": "sha512-2vPPEi+Z7WqML2jZYddDIfy5Dqb0r2fze2zTxNNknZaFpVHU3mFB3R+DWeJWGVx0ecvttSGlJTI+WG+8Z4cDWw==",
      "license": "MIT"
    },
    "node_modules/ob1": {
      "version": "0.83.3",
      "resolved": "https://registry.npmjs.org/ob1/-/ob1-0.83.3.tgz",
      "integrity": "sha512-egUxXCDwoWG06NGCS5s5AdcpnumHKJlfd3HH06P3m9TEMwwScfcY35wpQxbm9oHof+dM/lVH9Rfyu1elTVelSA==",
      "license": "MIT",
      "dependencies": {
        "flow-enums-runtime": "^0.0.6"
      },
      "engines": {
        "node": ">=20.19.4"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-is": {
      "version": "1.1.6",
      "resolved": "https://registry.npmjs.org/object-is/-/object-is-1.1.6.tgz",
      "integrity": "sha512-F8cZ+KfGlSGi09lJT7/Nd6KJZ9ygtvYC0/UYYLI9nmQKLMnydpB9yvbv9K1uSkEu7FU9vYPmVwLg328tX+ot3Q==",
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/object-keys": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/object-keys/-/object-keys-1.1.1.tgz",
      "integrity": "sha512-NuAESUOUMrlIXOfHKzD6bpPu3tYt3xvjNdRIQ+FeT0lNb4K8WR70CaDxhuNguS2XG+GjkyMwOzsN5ZktImfhLA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/object.assign": {
      "version": "4.1.7",
      "resolved": "https://registry.npmjs.org/object.assign/-/object.assign-4.1.7.tgz",
      "integrity": "sha512-nK28WOo+QIjBkDduTINE4JkF/UJJKyf2EJxvJKfblDpyg0Q+pkOHNTL0Qwy6NP6FhE/EnzV73BxxqcJaXY9anw==",
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0",
        "has-symbols": "^1.1.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/obug": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/obug/-/obug-2.2.1.tgz",
      "integrity": "sha512-XrsrhT5sybtKI6wakr2SPOlGZWWYbUXZ7a0jT8/QOeAPau+1X/bSegNe5YR75oJmEZQbKningirmGOEJCIk61Q==",
      "dev": true,
      "funding": [
        "https://github.com/sponsors/sxzz",
        "https://opencollective.com/debug"
      ],
      "license": "MIT",
      "engines": {
        "node": ">=12.20.0"
      }
    },
    "node_modules/on-finished": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.3.0.tgz",
      "integrity": "sha512-ikqdkGAAyf/X/gPhXGvfgAytDZtDbr+bkNUJ0N9h5MI/dmdgCs3l6hoHrcUv41sRKew3jIwrp4qQDXiK99Utww==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/on-headers": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/on-headers/-/on-headers-1.1.0.tgz",
      "integrity": "sha512-737ZY3yNnXy37FHkQxPzt4UZ2UWPWiCZWLvFZ4fu5cueciegX0zGPnrlY6bwRg4FdQOe9YU8MkmJwGhoMybl8A==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/onetime": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/onetime/-/onetime-2.0.1.tgz",
      "integrity": "sha512-oyyPpiMaKARvvcgip+JV+7zci5L8D1W9RZIz2l1o08AM3pfspitVWnPt3mzHcBPp12oYMTy0pqrFs/C+m3EwsQ==",
      "license": "MIT",
      "dependencies": {
        "mimic-fn": "^1.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/open": {
      "version": "7.4.2",
      "resolved": "https://registry.npmjs.org/open/-/open-7.4.2.tgz",
      "integrity": "sha512-MVHddDVweXZF3awtlAS+6pgKLlm/JgxZ90+/NBurBoQctVOOB/zDdVjcyPzQ+0laDGbsWgrRkflI65sQeOgT9Q==",
      "license": "MIT",
      "dependencies": {
        "is-docker": "^2.0.0",
        "is-wsl": "^2.1.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/ora": {
      "version": "3.4.0",
      "resolved": "https://registry.npmjs.org/ora/-/ora-3.4.0.tgz",
      "integrity": "sha512-eNwHudNbO1folBP3JsZ19v9azXWtQZjICdr3Q0TDPIaeBQ3mXLrh54wM+er0+hSp+dWKf+Z8KM58CYzEyIYxYg==",
      "license": "MIT",
      "dependencies": {
        "chalk": "^2.4.2",
        "cli-cursor": "^2.1.0",
        "cli-spinners": "^2.0.0",
        "log-symbols": "^2.2.0",
        "strip-ansi": "^5.2.0",
        "wcwidth": "^1.0.1"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/ora/node_modules/ansi-regex": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-4.1.1.tgz",
      "integrity": "sha512-ILlv4k/3f6vfQ4OoP2AGvirOktlQ98ZEL1k9FaQjxa3L1abBgbuTDAdPOpvbGncC0BTVQrl+OM8xZGK6tWXt7g==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/ora/node_modules/ansi-styles": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-3.2.1.tgz",
      "integrity": "sha512-VT0ZI6kZRdTh8YyJw3SMbYm/u+NqfsAxEpWO0Pf9sq8/e94WxxOpPKx9FR1FlyCtOVDNOQ+8ntlqFxiRc+r5qA==",
      "license": "MIT",
      "dependencies": {
        "color-convert": "^1.9.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/ora/node_modules/chalk": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-2.4.2.tgz",
      "integrity": "sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==",
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^3.2.1",
        "escape-string-regexp": "^1.0.5",
        "supports-color": "^5.3.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/ora/node_modules/color-convert": {
      "version": "1.9.3",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-1.9.3.tgz",
      "integrity": "sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==",
      "license": "MIT",
      "dependencies": {
        "color-name": "1.1.3"
      }
    },
    "node_modules/ora/node_modules/color-name": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.3.tgz",
      "integrity": "sha512-72fSenhMw2HZMTVHeCA9KCmpEIbzWiQsjN+BHcBbS9vr1mtt+vJjPdksIBNUmKAW8TFUDPJK5SUU3QhE9NEXDw==",
      "license": "MIT"
    },
    "node_modules/ora/node_modules/escape-string-regexp": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz",
      "integrity": "sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.8.0"
      }
    },
    "node_modules/ora/node_modules/has-flag": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-3.0.0.tgz",
      "integrity": "sha512-sKJf1+ceQBr4SMkvQnBDNDtf4TXpVhVGateu0t918bl30FnbE2m4vNLX+VWe/dpjlb+HugGYzW7uQXH98HPEYw==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/ora/node_modules/strip-ansi": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-5.2.0.tgz",
      "integrity": "sha512-DuRs1gKbBqsMKIZlrffwlug8MHkcnpjs5VPmL1PAh+mA30U0DTotfDZ0d2UUsXpPmPmMMJ6W773MaA3J+lbiWA==",
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^4.1.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/ora/node_modules/supports-color": {
      "version": "5.5.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-5.5.0.tgz",
      "integrity": "sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==",
      "license": "MIT",
      "dependencies": {
        "has-flag": "^3.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-locate": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-4.1.0.tgz",
      "integrity": "sha512-R79ZZ/0wAxKGu3oYMlz8jy/kbhsNrS7SKZ7PxEHBgJ5+F2mtFW2fK2cOtBh1cHYkQsbzFV7I+EoRKe6Yt0oK7A==",
      "license": "MIT",
      "dependencies": {
        "p-limit": "^2.2.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/p-locate/node_modules/p-limit": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-2.3.0.tgz",
      "integrity": "sha512-//88mFWSJx8lxCzwdAABTJL2MyWB12+eIY7MDL2SqLmAkeKU9qxRvWuSyTjm3FUmpBEMuFfckAIqEaVGUDxb6w==",
      "license": "MIT",
      "dependencies": {
        "p-try": "^2.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-try": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/p-try/-/p-try-2.2.0.tgz",
      "integrity": "sha512-R4nPAVTAU0B9D35/Gk3uJf/7XYbQcyohSKdvAxIRSNghFl4e71hVoGnBNQz9cWaXxO2I10KTC+3jMdvvoKw6dQ==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/parent-module": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz",
      "integrity": "sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==",
      "license": "MIT",
      "dependencies": {
        "callsites": "^3.0.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/parse-json": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/parse-json/-/parse-json-5.2.0.tgz",
      "integrity": "sha512-ayCKvm/phCGxOkYRSCM82iDwct8/EonSEgCSxWxD7ve6jHggsFl4fZVQBPRNgQoKiuV/odhFrGzQXZwbifC8Rg==",
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.0.0",
        "error-ex": "^1.3.1",
        "json-parse-even-better-errors": "^2.3.0",
        "lines-and-columns": "^1.1.6"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/parse-png": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/parse-png/-/parse-png-2.1.0.tgz",
      "integrity": "sha512-Nt/a5SfCLiTnQAjx3fHlqp8hRgTL3z7kTQZzvIMS9uCAepnCyjpdEc6M/sz69WqMBdaDBw9sF1F1UaHROYzGkQ==",
      "license": "MIT",
      "dependencies": {
        "pngjs": "^3.3.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/parseurl": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/path-dirname": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/path-dirname/-/path-dirname-1.0.2.tgz",
      "integrity": "sha512-ALzNPpyNq9AqXMBjeymIjFDAkAFH06mHJH/cSBHAgU0s4vfpBn6b2nf8tiRLvagKD8RbTpq2FKTBg7cl9l3c7Q==",
      "license": "MIT"
    },
    "node_modules/path-exists": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz",
      "integrity": "sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-is-absolute": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/path-is-absolute/-/path-is-absolute-1.0.1.tgz",
      "integrity": "sha512-AVbw3UJ2e9bq64vSaS9Am0fje1Pa8pbGqTTsmXfaIiMpnr5DlDhfJOuLj9Sf95ZPVDAUerDfEk88MPmPe7UCQg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "license": "MIT"
    },
    "node_modules/path-scurry": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-2.0.2.tgz",
      "integrity": "sha512-3O/iVVsJAPsOnpwWIeD+d6z/7PmqApyQePUtCndjatj/9I5LylHvt5qluFaBT3I5h3r1ejfR056c+FCv+NnNXg==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "lru-cache": "^11.0.0",
        "minipass": "^7.1.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/path-scurry/node_modules/lru-cache": {
      "version": "11.5.2",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/path-type": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-type/-/path-type-4.0.0.tgz",
      "integrity": "sha512-gDKb8aZMDeD/tZWs9P6+q0J9Mwkdl6xMV8TjnGP3qJVJ06bdMgkbBlLU8IdfOsIsFz2BW1rNVT3XuNEl8zPAvw==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/pbf": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/pbf/-/pbf-3.3.0.tgz",
      "integrity": "sha512-XDF38WCH3z5OV/OVa8GKUNtLAyneuzbCisx7QUCF8Q6Nutx0WnJrQe5O+kOtBlLfRNUws98Y58Lblp+NJG5T4Q==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "ieee754": "^1.1.12",
        "resolve-protobuf-schema": "^2.1.0"
      },
      "bin": {
        "pbf": "bin/pbf"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.2.tgz",
      "integrity": "sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==",
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.7.tgz",
      "integrity": "sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/plist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/plist/-/plist-3.1.1.tgz",
      "integrity": "sha512-ZIfcLJC+7E7FBFnDxm9MPmt7D+DidyQ26lewieO75AdhA2ayMtsJSES0iWzqJQbcVRSrTufQoy0DR94xHue0oA==",
      "license": "MIT",
      "dependencies": {
        "@xmldom/xmldom": "^0.9.10",
        "base64-js": "^1.5.1",
        "xmlbuilder": "^15.1.1"
      },
      "engines": {
        "node": ">=10.4.0"
      }
    },
    "node_modules/plist/node_modules/@xmldom/xmldom": {
      "version": "0.9.12",
      "resolved": "https://registry.npmjs.org/@xmldom/xmldom/-/xmldom-0.9.12.tgz",
      "integrity": "sha512-5AXjrcMClTryPe9LgZrygpB1lj7s0S9E0+W+AHaVKAVyHanafK86iPSvG5xHVSp/jC+VH1UXu0TAEmY279xH7A==",
      "license": "MIT",
      "engines": {
        "node": ">=14.6"
      }
    },
    "node_modules/pngjs": {
      "version": "3.4.0",
      "resolved": "https://registry.npmjs.org/pngjs/-/pngjs-3.4.0.tgz",
      "integrity": "sha512-NCrCHhWmnQklfH4MtJMRjZ2a8c80qXeMlQMv2uVp9ISJMTt562SbGd6n2oq0PaPgKm7Z6pL9E2UlLIhC+SHL3w==",
      "license": "MIT",
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/possible-typed-array-names": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/possible-typed-array-names/-/possible-typed-array-names-1.1.0.tgz",
      "integrity": "sha512-/+5VFTchJDoVj3bhoqi6UeymcD00DAwb1nJwamzPvHEszJ4FpF6SNNbUbOS8yI56qHzdV8eK0qEfOSiodkTdxg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.28",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.28.tgz",
      "integrity": "sha512-RRuzqDtt5Y9h3quz5hWhK+TPnsmVs6WwSU6LkJMeY4HstUEDuYTG8UJSdawMRzmzAtV+KEoG8N3Qg2qLy5vM/A==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.18",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
      "license": "MIT"
    },
    "node_modules/potpack": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/potpack/-/potpack-2.1.0.tgz",
      "integrity": "sha512-pcaShQc1Shq0y+E7GqJqvZj8DTthWV1KeHGdi0Z6IAin2Oi3JnLCOfwnCo84qc+HAp52wT9nK9H7FAJp5a44GQ==",
      "license": "ISC"
    },
    "node_modules/pretty-bytes": {
      "version": "5.6.0",
      "resolved": "https://registry.npmjs.org/pretty-bytes/-/pretty-bytes-5.6.0.tgz",
      "integrity": "sha512-FFw039TmrBqFK8ma/7OL3sDz/VytdtJr044/QUJtH0wK9lb9jLq9tJyIxUwtQJHwar2BqtiA4iCWSwo9JLkzFg==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/pretty-format": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/pretty-format/-/pretty-format-29.7.0.tgz",
      "integrity": "sha512-Pdlw/oPxN+aXdmM9R00JVC9WVFoCLTKJvDVLgmJ+qAffBMxsV85l/Lu7sNx4zSzPyoL2euImuEwHhOXdEgNFZQ==",
      "license": "MIT",
      "dependencies": {
        "@jest/schemas": "^29.6.3",
        "ansi-styles": "^5.0.0",
        "react-is": "^18.0.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/pretty-format/node_modules/ansi-styles": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-5.2.0.tgz",
      "integrity": "sha512-Cxwpt2SfTzTtXcfOlzGEee8O+c+MmUgGrNiBcXnuWxuFJHe6a5Hz7qwhwe5OgaSYI0IJvkLqWX1ASG+cJOkEiA==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/proc-log": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/proc-log/-/proc-log-4.2.0.tgz",
      "integrity": "sha512-g8+OnU/L2v+wyiVK+D5fA34J7EH8jZ8DDlvwhRCMxmMj7UCBvxiO1mGeN+36JXIKF4zevU4kRBd8lVgG9vLelA==",
      "license": "ISC",
      "engines": {
        "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
      }
    },
    "node_modules/progress": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/progress/-/progress-2.0.3.tgz",
      "integrity": "sha512-7PiHtLll5LdnKIMw100I+8xJXR5gW2QwWYkT6iJva0bXitZKa/XMrSbdmg3r2Xnaidz9Qumd0VPaMrZlF9V9sA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/promise": {
      "version": "8.3.0",
      "resolved": "https://registry.npmjs.org/promise/-/promise-8.3.0.tgz",
      "integrity": "sha512-rZPNPKTOYVNEEKFaq1HqTgOwZD+4/YHS5ukLzQCypkj+OkYx7iv0mA91lJlpPPZ8vMau3IIGj5Qlwrx+8iiSmg==",
      "license": "MIT",
      "dependencies": {
        "asap": "~2.0.6"
      }
    },
    "node_modules/prompts": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/prompts/-/prompts-2.4.2.tgz",
      "integrity": "sha512-NxNv/kLguCA7p3jE8oL2aEBsrJWgAakBpgmgK6lpPWV+WuOmY6r2/zbAVnP+T8bQlA0nzHXSJSJW0Hq7ylaD2Q==",
      "license": "MIT",
      "dependencies": {
        "kleur": "^3.0.3",
        "sisteransi": "^1.0.5"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/protocol-buffers-schema": {
      "version": "3.6.1",
      "resolved": "https://registry.npmjs.org/protocol-buffers-schema/-/protocol-buffers-schema-3.6.1.tgz",
      "integrity": "sha512-VG2K63Igkiv9p76tk1lilczEK1cT+kCjKtkdhw1dQZV3k3IXJbd3o6Ho8b9zJZaHSnT2hKe4I+ObmX9w6m5SmQ==",
      "license": "MIT"
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/qrcode-terminal": {
      "version": "0.11.0",
      "resolved": "https://registry.npmjs.org/qrcode-terminal/-/qrcode-terminal-0.11.0.tgz",
      "integrity": "sha512-Uu7ii+FQy4Qf82G4xu7ShHhjhGahEpCWc3x8UavY3CTcWV+ufmmCtwkr7ZKsX42jdL0kr1B5FKUeqJvAn51jzQ==",
      "bin": {
        "qrcode-terminal": "bin/qrcode-terminal.js"
      }
    },
    "node_modules/quickselect": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/quickselect/-/quickselect-2.0.0.tgz",
      "integrity": "sha512-RKJ22hX8mHe3Y6wH/N3wCM6BWtjaxIyyUIkpHOvfFnxdI4yD4tBXEBKSbriGujF6jnSVkJrffuo6vxACiSSxIw==",
      "license": "ISC"
    },
    "node_modules/range-parser": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.2.1.tgz",
      "integrity": "sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/rbush": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/rbush/-/rbush-3.0.1.tgz",
      "integrity": "sha512-XRaVO0YecOpEuIvbhbpTrZgoiI6xBlz6hnlr6EHhd+0x9ase6EmeN+hdwwUaJvLcsFFQ8iWVF1GAK1yB0BWi0w==",
      "license": "MIT",
      "dependencies": {
        "quickselect": "^2.0.0"
      }
    },
    "node_modules/rc": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/rc/-/rc-1.2.8.tgz",
      "integrity": "sha512-y3bGgqKj3QBdxLbLkomlohkvsA8gdAiUQlSBJnBhfn+BPxg4bc62d8TcBW15wavDfgexCgccckhcZvywyQYPOw==",
      "license": "(BSD-2-Clause OR MIT OR Apache-2.0)",
      "dependencies": {
        "deep-extend": "^0.6.0",
        "ini": "~1.3.0",
        "minimist": "^1.2.0",
        "strip-json-comments": "~2.0.1"
      },
      "bin": {
        "rc": "cli.js"
      }
    },
    "node_modules/react": {
      "version": "19.1.0",
      "resolved": "https://registry.npmjs.org/react/-/react-19.1.0.tgz",
      "integrity": "sha512-FS+XFBNvn3GTAWq26joslQgWNoFu08F4kl0J4CgdNKADkdSGXQyTCnKteIAJy96Br6YbpEU1LSzV5dYtjMkMDg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-devtools-core": {
      "version": "6.1.5",
      "resolved": "https://registry.npmjs.org/react-devtools-core/-/react-devtools-core-6.1.5.tgz",
      "integrity": "sha512-ePrwPfxAnB+7hgnEr8vpKxL9cmnp7F322t8oqcPshbIQQhDKgFDW4tjhF2wjVbdXF9O/nyuy3sQWd9JGpiLPvA==",
      "license": "MIT",
      "dependencies": {
        "shell-quote": "^1.6.1",
        "ws": "^7"
      }
    },
    "node_modules/react-dom": {
      "version": "19.1.0",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.1.0.tgz",
      "integrity": "sha512-Xs1hdnE+DyKgeHJeJznQmYMIBG3TKIHJJT95Q58nHLSrElKlGQqDTR2HQ9fx5CN/Gk6Vh/kupBTDLU11/nDk/g==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.26.0"
      },
      "peerDependencies": {
        "react": "^19.1.0"
      }
    },
    "node_modules/react-is": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-18.3.1.tgz",
      "integrity": "sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==",
      "license": "MIT"
    },
    "node_modules/react-native": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/react-native/-/react-native-0.81.5.tgz",
      "integrity": "sha512-1w+/oSjEXZjMqsIvmkCRsOc8UBYv163bTWKTI8+1mxztvQPhCRYGTvZ/PL1w16xXHneIj/SLGfxWg2GWN2uexw==",
      "license": "MIT",
      "dependencies": {
        "@jest/create-cache-key-function": "^29.7.0",
        "@react-native/assets-registry": "0.81.5",
        "@react-native/codegen": "0.81.5",
        "@react-native/community-cli-plugin": "0.81.5",
        "@react-native/gradle-plugin": "0.81.5",
        "@react-native/js-polyfills": "0.81.5",
        "@react-native/normalize-colors": "0.81.5",
        "@react-native/virtualized-lists": "0.81.5",
        "abort-controller": "^3.0.0",
        "anser": "^1.4.9",
        "ansi-regex": "^5.0.0",
        "babel-jest": "^29.7.0",
        "babel-plugin-syntax-hermes-parser": "0.29.1",
        "base64-js": "^1.5.1",
        "commander": "^12.0.0",
        "flow-enums-runtime": "^0.0.6",
        "glob": "^7.1.1",
        "invariant": "^2.2.4",
        "jest-environment-node": "^29.7.0",
        "memoize-one": "^5.0.0",
        "metro-runtime": "^0.83.1",
        "metro-source-map": "^0.83.1",
        "nullthrows": "^1.1.1",
        "pretty-format": "^29.7.0",
        "promise": "^8.3.0",
        "react-devtools-core": "^6.1.5",
        "react-refresh": "^0.14.0",
        "regenerator-runtime": "^0.13.2",
        "scheduler": "0.26.0",
        "semver": "^7.1.3",
        "stacktrace-parser": "^0.1.10",
        "whatwg-fetch": "^3.0.0",
        "ws": "^6.2.3",
        "yargs": "^17.6.2"
      },
      "bin": {
        "react-native": "cli.js"
      },
      "engines": {
        "node": ">= 20.19.4"
      },
      "peerDependencies": {
        "@types/react": "^19.1.0",
        "react": "^19.1.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-native-is-edge-to-edge": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/react-native-is-edge-to-edge/-/react-native-is-edge-to-edge-1.3.1.tgz",
      "integrity": "sha512-NIXU/iT5+ORyCc7p0z2nnlkouYKX425vuU1OEm6bMMtWWR9yvb+Xg5AZmImTKoF9abxCPqrKC3rOZsKzUYgYZA==",
      "license": "MIT",
      "peerDependencies": {
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/react-native-safe-area-context": {
      "version": "5.6.0",
      "resolved": "https://registry.npmjs.org/react-native-safe-area-context/-/react-native-safe-area-context-5.6.0.tgz",
      "integrity": "sha512-tJas3YOdsuCg3kepCTGF3LWZp9onMbb9Agju2xfs2kRX8d/5TMUPmupBpjerk/B7Tv/zeJnk+qp5neA96Y0otQ==",
      "license": "MIT",
      "peerDependencies": {
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/react-native-svg": {
      "version": "15.12.1",
      "resolved": "https://registry.npmjs.org/react-native-svg/-/react-native-svg-15.12.1.tgz",
      "integrity": "sha512-vCuZJDf8a5aNC2dlMovEv4Z0jjEUET53lm/iILFnFewa15b4atjVxU6Wirm6O9y6dEsdjDZVD7Q3QM4T1wlI8g==",
      "license": "MIT",
      "dependencies": {
        "css-select": "^5.1.0",
        "css-tree": "^1.1.3",
        "warn-once": "0.1.1"
      },
      "peerDependencies": {
        "react": "*",
        "react-native": "*"
      }
    },
    "node_modules/react-native-svg-transformer": {
      "version": "1.5.3",
      "resolved": "https://registry.npmjs.org/react-native-svg-transformer/-/react-native-svg-transformer-1.5.3.tgz",
      "integrity": "sha512-M4uFg5pUt35OMgjD4rWWbwd6PmxV96W7r/gQTTa+iZA5B+jO6aURhzAZGLHSrg1Kb91cKG0Rildy9q1WJvYstg==",
      "license": "MIT",
      "dependencies": {
        "@svgr/core": "^8.1.0",
        "@svgr/plugin-jsx": "^8.1.0",
        "@svgr/plugin-svgo": "^8.1.0",
        "path-dirname": "^1.0.2"
      },
      "peerDependencies": {
        "react-native": ">=0.59.0",
        "react-native-svg": ">=12.0.0"
      }
    },
    "node_modules/react-native-url-polyfill": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/react-native-url-polyfill/-/react-native-url-polyfill-3.0.0.tgz",
      "integrity": "sha512-aA5CiuUCUb/lbrliVCJ6lZ17/RpNJzvTO/C7gC/YmDQhTUoRD5q5HlJfwLWcxz4VgAhHwXKzhxH+wUN24tAdqg==",
      "license": "MIT",
      "dependencies": {
        "whatwg-url-without-unicode": "8.0.0-3"
      },
      "peerDependencies": {
        "react-native": "*"
      }
    },
    "node_modules/react-native-web": {
      "version": "0.21.2",
      "resolved": "https://registry.npmjs.org/react-native-web/-/react-native-web-0.21.2.tgz",
      "integrity": "sha512-SO2t9/17zM4iEnFvlu2DA9jqNbzNhoUP+AItkoCOyFmDMOhUnBBznBDCYN92fGdfAkfQlWzPoez6+zLxFNsZEg==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.18.6",
        "@react-native/normalize-colors": "^0.74.1",
        "fbjs": "^3.0.4",
        "inline-style-prefixer": "^7.0.1",
        "memoize-one": "^6.0.0",
        "nullthrows": "^1.1.1",
        "postcss-value-parser": "^4.2.0",
        "styleq": "^0.1.3"
      },
      "peerDependencies": {
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/react-native-web/node_modules/@react-native/normalize-colors": {
      "version": "0.74.89",
      "resolved": "https://registry.npmjs.org/@react-native/normalize-colors/-/normalize-colors-0.74.89.tgz",
      "integrity": "sha512-qoMMXddVKVhZ8PA1AbUCk83trpd6N+1nF2A6k1i6LsQObyS92fELuk8kU/lQs6M7BsMHwqyLCpQJ1uFgNvIQXg==",
      "license": "MIT"
    },
    "node_modules/react-native-web/node_modules/memoize-one": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/memoize-one/-/memoize-one-6.0.0.tgz",
      "integrity": "sha512-rkpe71W0N0c0Xz6QD0eJETuWAJGnJ9afsl1srmwPrI+yBCkge5EycXXbYRyvL29zZVUWQCY7InPRCv3GDXuZNw==",
      "license": "MIT"
    },
    "node_modules/react-native/node_modules/@react-native/virtualized-lists": {
      "version": "0.81.5",
      "resolved": "https://registry.npmjs.org/@react-native/virtualized-lists/-/virtualized-lists-0.81.5.tgz",
      "integrity": "sha512-UVXgV/db25OPIvwZySeToXD/9sKKhOdkcWmmf4Jh8iBZuyfML+/5CasaZ1E7Lqg6g3uqVQq75NqIwkYmORJMPw==",
      "license": "MIT",
      "dependencies": {
        "invariant": "^2.2.4",
        "nullthrows": "^1.1.1"
      },
      "engines": {
        "node": ">= 20.19.4"
      },
      "peerDependencies": {
        "@types/react": "^19.1.0",
        "react": "*",
        "react-native": "*"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-native/node_modules/commander": {
      "version": "12.1.0",
      "resolved": "https://registry.npmjs.org/commander/-/commander-12.1.0.tgz",
      "integrity": "sha512-Vw8qHK3bZM9y/P10u3Vib8o/DdkvA2OtPtZvD871QKjy74Wj1WSKFILMPRPSdUSx5RFK1arlJzEtA4PkFgnbuA==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/react-native/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/react-native/node_modules/ws": {
      "version": "6.2.6",
      "resolved": "https://registry.npmjs.org/ws/-/ws-6.2.6.tgz",
      "integrity": "sha512-XTrf1gv7kXoVf1hbC3PAyAiPgR8Wz1blcrYIjEsUmr08BLksT41R8KbjmS9408C2ERx7v1JDLD/BkpLEttjfKA==",
      "license": "MIT",
      "dependencies": {
        "async-limiter": "~1.0.0"
      }
    },
    "node_modules/react-refresh": {
      "version": "0.14.2",
      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.14.2.tgz",
      "integrity": "sha512-jCvmsr+1IUSMUyzOkRcvnVbX3ZYC6g9TDrDbFuFmRDq7PD4yaGbLKNQL6k2jnArV8hjYxh7hVhAZB6s9HDGpZA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/regenerate": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/regenerate/-/regenerate-1.4.2.tgz",
      "integrity": "sha512-zrceR/XhGYU/d/opr2EKO7aRHUeiBI8qjtfHqADTwZd6Szfy16la6kqD0MIUs5z5hx6AaKa+PixpPrR289+I0A==",
      "license": "MIT"
    },
    "node_modules/regenerate-unicode-properties": {
      "version": "10.2.2",
      "resolved": "https://registry.npmjs.org/regenerate-unicode-properties/-/regenerate-unicode-properties-10.2.2.tgz",
      "integrity": "sha512-m03P+zhBeQd1RGnYxrGyDAPpWX/epKirLrp8e3qevZdVkKtnCrjjWczIbYc8+xd6vcTStVlqfycTx1KR4LOr0g==",
      "license": "MIT",
      "dependencies": {
        "regenerate": "^1.4.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/regenerator-runtime": {
      "version": "0.13.11",
      "resolved": "https://registry.npmjs.org/regenerator-runtime/-/regenerator-runtime-0.13.11.tgz",
      "integrity": "sha512-kY1AZVr2Ra+t+piVaJ4gxaFaReZVH40AKNo7UCX6W+dEwBo/2oZJzqfuN1qLq1oL45o56cPaTXELwrTh8Fpggg==",
      "license": "MIT"
    },
    "node_modules/regexpu-core": {
      "version": "6.4.0",
      "resolved": "https://registry.npmjs.org/regexpu-core/-/regexpu-core-6.4.0.tgz",
      "integrity": "sha512-0ghuzq67LI9bLXpOX/ISfve/Mq33a4aFRzoQYhnnok1JOFpmE/A2TBGkNVenOGEeSBCjIiWcc6MVOG5HEQv0sA==",
      "license": "MIT",
      "dependencies": {
        "regenerate": "^1.4.2",
        "regenerate-unicode-properties": "^10.2.2",
        "regjsgen": "^0.8.0",
        "regjsparser": "^0.13.0",
        "unicode-match-property-ecmascript": "^2.0.0",
        "unicode-match-property-value-ecmascript": "^2.2.1"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/regjsgen": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/regjsgen/-/regjsgen-0.8.0.tgz",
      "integrity": "sha512-RvwtGe3d7LvWiDQXeQw8p5asZUmfU1G/l6WbUXeHta7Y2PEIvBTwH6E2EfmYUK8pxcxEdEmaomqyp0vZZ7C+3Q==",
      "license": "MIT"
    },
    "node_modules/regjsparser": {
      "version": "0.13.1",
      "resolved": "https://registry.npmjs.org/regjsparser/-/regjsparser-0.13.1.tgz",
      "integrity": "sha512-dLsljMd9sqwRkby8zhO1gSg3PnJIBFid8f4CQj/sXx+7cKx+E7u0PKhZ+U4wmhx7EfmtvnA318oVaIkAB1lRJw==",
      "license": "BSD-2-Clause",
      "dependencies": {
        "jsesc": "~3.1.0"
      },
      "bin": {
        "regjsparser": "bin/parser"
      }
    },
    "node_modules/require-directory": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/require-directory/-/require-directory-2.1.1.tgz",
      "integrity": "sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/require-from-string": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/requireg": {
      "version": "0.2.2",
      "resolved": "https://registry.npmjs.org/requireg/-/requireg-0.2.2.tgz",
      "integrity": "sha512-nYzyjnFcPNGR3lx9lwPPPnuQxv6JWEZd2Ci0u9opN7N5zUEPIhY/GbL3vMGOr2UXwEg9WwSyV9X9Y/kLFgPsOg==",
      "dependencies": {
        "nested-error-stacks": "~2.0.1",
        "rc": "~1.2.7",
        "resolve": "~1.7.1"
      },
      "engines": {
        "node": ">= 4.0.0"
      }
    },
    "node_modules/requireg/node_modules/resolve": {
      "version": "1.7.1",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.7.1.tgz",
      "integrity": "sha512-c7rwLofp8g1U+h1KNyHL/jicrKg1Ek4q+Lr33AL65uZTinUZHe30D5HlyN5V9NW0JX1D5dXQ4jqW5l7Sy/kGfw==",
      "license": "MIT",
      "dependencies": {
        "path-parse": "^1.0.5"
      }
    },
    "node_modules/resolve": {
      "version": "1.22.12",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.12.tgz",
      "integrity": "sha512-TyeJ1zif53BPfHootBGwPRYT1RUt6oGWsaQr8UyZW/eAm9bKoijtvruSDEmZHm92CwS9nj7/fWttqPCgzep8CA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "is-core-module": "^2.16.1",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/resolve-from": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-5.0.0.tgz",
      "integrity": "sha512-qYg9KP24dD5qka9J47d0aVky0N+b4fTU89LN9iDnjB5waksiC49rvMB0PrUJQGoTmH50XPiqOvAjDfaijGxYZw==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/resolve-protobuf-schema": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/resolve-protobuf-schema/-/resolve-protobuf-schema-2.1.0.tgz",
      "integrity": "sha512-kI5ffTiZWmJaS/huM8wZfEMer1eRd7oJQhDuxeCLe3t7N7mX3z94CN0xPxBQxFYQTSNz9T0i+v6inKqSdK8xrQ==",
      "license": "MIT",
      "dependencies": {
        "protocol-buffers-schema": "^3.3.1"
      }
    },
    "node_modules/resolve-workspace-root": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/resolve-workspace-root/-/resolve-workspace-root-2.0.1.tgz",
      "integrity": "sha512-nR23LHAvaI6aHtMg6RWoaHpdR4D881Nydkzi2CixINyg9T00KgaJdJI6Vwty+Ps8WLxZHuxsS0BseWjxSA4C+w==",
      "license": "MIT"
    },
    "node_modules/resolve.exports": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/resolve.exports/-/resolve.exports-2.0.3.tgz",
      "integrity": "sha512-OcXjMsGdhL4XnbShKpAcSqPMzQoYkYyhbEaeSko47MjRP9NfEQMhZkXL1DoFlt9LWQn4YttrdnV6X2OiyzBi+A==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/restore-cursor": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/restore-cursor/-/restore-cursor-2.0.0.tgz",
      "integrity": "sha512-6IzJLuGi4+R14vwagDHX+JrXmPVtPpn4mffDJ1UdR7/Edm87fl6yi8mMBIVvFtJaNTUvjughmW4hwLhRG7gC1Q==",
      "license": "MIT",
      "dependencies": {
        "onetime": "^2.0.0",
        "signal-exit": "^3.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/rimraf": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/rimraf/-/rimraf-3.0.2.tgz",
      "integrity": "sha512-JZkJMZkAGFFPP2YqXZXPbMlMBgsxzE8ILs4lMIX/2o0L9UBw9O/Y3o6wFw/i9YLapcUJWwqbi3kdxIPdC62TIA==",
      "deprecated": "Rimraf versions prior to v4 are no longer supported",
      "license": "ISC",
      "dependencies": {
        "glob": "^7.1.3"
      },
      "bin": {
        "rimraf": "bin.js"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/rolldown": {
      "version": "1.2.12",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.12.tgz",
      "integrity": "sha512-8wafseiaG80xmXSfqidUNqZcylTlhmPZZt+za2m+js2sFZ8dTNlhIOV2WcbIPx2hgwPBJpEUGFAMZ9bgBBLTSQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.152.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.12",
        "@rolldown/binding-android-arm64": "1.2.12",
        "@rolldown/binding-darwin-arm64": "1.2.12",
        "@rolldown/binding-darwin-x64": "1.2.12",
        "@rolldown/binding-freebsd-x64": "1.2.12",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.12",
        "@rolldown/binding-linux-arm64-gnu": "1.2.12",
        "@rolldown/binding-linux-arm64-musl": "1.2.12",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.12",
        "@rolldown/binding-linux-s390x-gnu": "1.2.12",
        "@rolldown/binding-linux-x64-gnu": "1.2.12",
        "@rolldown/binding-linux-x64-musl": "1.2.12",
        "@rolldown/binding-openharmony-arm64": "1.2.12",
        "@rolldown/binding-win32-arm64-msvc": "1.2.12",
        "@rolldown/binding-win32-x64-msvc": "1.2.12"
      }
    },
    "node_modules/rw": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/rw/-/rw-1.3.3.tgz",
      "integrity": "sha512-PdhdWy89SiZogBLaw42zdeqtRJ//zFd2PgQavcICDUgJT5oW10QCRKbJ6bg4r0/UY2M6BWd5tkxuGFRvCkgfHQ==",
      "license": "BSD-3-Clause"
    },
    "node_modules/safe-buffer": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/safe-regex-test": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/safe-regex-test/-/safe-regex-test-1.1.0.tgz",
      "integrity": "sha512-x/+Cz4YrimQxQccJf5mKEbIa1NzeCRNI5Ecl/ekmlYaampdNLPalVyIcCZNNH3MvmqBugV5TMYZXv0ljslUlaw==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "is-regex": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/sax": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/sax/-/sax-1.6.0.tgz",
      "integrity": "sha512-6R3J5M4AcbtLUdZmRv2SygeVaM7IhrLXu9BmnOGmmACak8fiUtOsYNWUS4uK7upbmHIBbLBeFeI//477BKLBzA==",
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=11.0.0"
      }
    },
    "node_modules/scheduler": {
      "version": "0.26.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.26.0.tgz",
      "integrity": "sha512-NlHwttCI/l5gCPR3D1nNXtWABUmBwvZpEQiD4IXSbIDq8BzLIK/7Ir5gTFSGZDUu37K5cMNp0hFtzO38sC7gWA==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/send": {
      "version": "0.19.2",
      "resolved": "https://registry.npmjs.org/send/-/send-0.19.2.tgz",
      "integrity": "sha512-VMbMxbDeehAxpOtWJXlcUS5E8iXh6QmN+BkRX1GARS3wRaXEEgzCcB10gTQazO42tpNIya8xIyNx8fll1OFPrg==",
      "license": "MIT",
      "dependencies": {
        "debug": "2.6.9",
        "depd": "2.0.0",
        "destroy": "1.2.0",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "etag": "~1.8.1",
        "fresh": "~0.5.2",
        "http-errors": "~2.0.1",
        "mime": "1.6.0",
        "ms": "2.1.3",
        "on-finished": "~2.4.1",
        "range-parser": "~1.2.1",
        "statuses": "~2.0.2"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/send/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/send/node_modules/debug/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/send/node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/send/node_modules/on-finished": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/send/node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/serialize-error": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/serialize-error/-/serialize-error-2.1.0.tgz",
      "integrity": "sha512-ghgmKt5o4Tly5yEG/UJp8qTd0AN7Xalw4XBtDEKP655B699qMEtra1WlXeE6WIvdEG481JvRxULKsInq/iNysw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/serve-static": {
      "version": "1.16.3",
      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-1.16.3.tgz",
      "integrity": "sha512-x0RTqQel6g5SY7Lg6ZreMmsOzncHFU7nhnRWkKgWuMTu5NN0DR5oruckMqRvacAN9d5w6ARnRBXl9xhDCgfMeA==",
      "license": "MIT",
      "dependencies": {
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "parseurl": "~1.3.3",
        "send": "~0.19.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/serve-static/node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/set-function-length": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/set-function-length/-/set-function-length-1.2.2.tgz",
      "integrity": "sha512-pgRc4hJ4/sNjWCSS9AmnS40x3bNMDTknHgL5UaMBTMyJnU90EgWh1Rz+MC9eFu4BuN/UwZjKQuY/1v3rM7HMfg==",
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2",
        "get-intrinsic": "^1.2.4",
        "gopd": "^1.0.1",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/setimmediate": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/setimmediate/-/setimmediate-1.0.5.tgz",
      "integrity": "sha512-MATJdZp8sLqDl/68LfQmbP8zKPLQNV6BIZoIgrscFDQ+RsvK/BxeDQOgyxKKoh0y/8h3BqVFnCqQ/gd+reiIXA==",
      "license": "MIT"
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shell-quote": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/shell-quote/-/shell-quote-1.10.0.tgz",
      "integrity": "sha512-w1aiOKwKuRgtwAReIIj89puqg+I7GvX4IbLrvmhXbzQsj1+Zwi4VO3+fa6ZF91TWSjIxoEkKnMeHcLEODK5ZXA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/siginfo": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/siginfo/-/siginfo-2.0.0.tgz",
      "integrity": "sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/signal-exit": {
      "version": "3.0.7",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-3.0.7.tgz",
      "integrity": "sha512-wnD2ZE+l+SPC/uoS0vXeE9L1+0wuaMqKlfz9AMUo38JsyLSBWSFcHR1Rri62LZc12vLr1gb3jl7iwQhgwpAbGQ==",
      "license": "ISC"
    },
    "node_modules/simple-plist": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/simple-plist/-/simple-plist-1.3.1.tgz",
      "integrity": "sha512-iMSw5i0XseMnrhtIzRb7XpQEXepa9xhWxGUojHBL43SIpQuDQkh3Wpy67ZbDzZVr6EKxvwVChnVpdl8hEVLDiw==",
      "license": "MIT",
      "dependencies": {
        "bplist-creator": "0.1.0",
        "bplist-parser": "0.3.1",
        "plist": "^3.0.5"
      }
    },
    "node_modules/sisteransi": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/sisteransi/-/sisteransi-1.0.5.tgz",
      "integrity": "sha512-bLGGlR1QxBcynn2d5YmDX4MGjlZvy2MRBDRNHLJ8VI6l6+9FUiyTFNJ0IveOSP0bcXgVDPRcfGqA0pjaqUpfVg==",
      "license": "MIT"
    },
    "node_modules/slash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/slash/-/slash-3.0.0.tgz",
      "integrity": "sha512-g9Q1haeby36OSStwb4ntCGGGaKsaVSjQ68fBxoQcutl5fS1vuY18H3wSt3jFyFtrkx+Kz0V1G85A4MyAdDMi2Q==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/slugify": {
      "version": "1.6.9",
      "resolved": "https://registry.npmjs.org/slugify/-/slugify-1.6.9.tgz",
      "integrity": "sha512-vZ7rfeehZui7wQs438JXBckYLkIIdfHOXsaVEUMyS5fHo1483l1bMdo0EDSWYclY0yZKFOipDy4KHuKs6ssvdg==",
      "license": "MIT",
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/snake-case": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/snake-case/-/snake-case-3.0.4.tgz",
      "integrity": "sha512-LAOh4z89bGQvl9pFfNF8V146i7o7/CqFPbqzYgP+yYzDIDeS9HaNFtXABamRW+AQzEVODcvE79ljJ+8a9YSdMg==",
      "license": "MIT",
      "dependencies": {
        "dot-case": "^3.0.4",
        "tslib": "^2.0.3"
      }
    },
    "node_modules/source-map": {
      "version": "0.5.7",
      "resolved": "https://registry.npmjs.org/source-map/-/source-map-0.5.7.tgz",
      "integrity": "sha512-LbrmJOMUSdEVxIKvdcJzQC+nQhe8FUZQTXQy6+I75skNgn3OoQ0DZA8YnFa7gp8tqtL3KPf1kmo0R5DoApeSGQ==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/source-map-support": {
      "version": "0.5.21",
      "resolved": "https://registry.npmjs.org/source-map-support/-/source-map-support-0.5.21.tgz",
      "integrity": "sha512-uBHU3L3czsIyYXKX88fdrGovxdSCoTGDRZ6SYXtSRxLZUzHg5P/66Ht6uoUlHu9EZod+inXhKo3qQgwXUT/y1w==",
      "license": "MIT",
      "dependencies": {
        "buffer-from": "^1.0.0",
        "source-map": "^0.6.0"
      }
    },
    "node_modules/source-map-support/node_modules/source-map": {
      "version": "0.6.1",
      "resolved": "https://registry.npmjs.org/source-map/-/source-map-0.6.1.tgz",
      "integrity": "sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/sprintf-js": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/sprintf-js/-/sprintf-js-1.0.3.tgz",
      "integrity": "sha512-D9cPgkvLlV3t3IzL0D0YLvGA9Ahk4PcvVwUbN0dSGr1aP0Nrt4AEnTUbuGvquEC0mA64Gqt1fzirlRs5ibXx8g==",
      "license": "BSD-3-Clause"
    },
    "node_modules/stack-utils": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/stack-utils/-/stack-utils-2.0.6.tgz",
      "integrity": "sha512-XlkWvfIm6RmsWtNJx+uqtKLS8eqFbxUg0ZzLXqY0caEy9l7hruX8IpiDnjsLavoBgqCCR71TqWO8MaXYheJ3RQ==",
      "license": "MIT",
      "dependencies": {
        "escape-string-regexp": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/stack-utils/node_modules/escape-string-regexp": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-2.0.0.tgz",
      "integrity": "sha512-UpzcLCXolUWcNu5HtVMHYdXJjArjsF9C0aNnquZYY4uW/Vu0miy5YoWvbV345HauVvcAUnpRuhMMcqTcGOY2+w==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/stackback": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/stackback/-/stackback-0.0.2.tgz",
      "integrity": "sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/stackframe": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/stackframe/-/stackframe-1.3.4.tgz",
      "integrity": "sha512-oeVtt7eWQS+Na6F//S4kJ2K2VbRlS9D43mAlMyVpVWovy9o+jfgH8O9agzANzaiLjclA0oYzUXEM4PurhSUChw==",
      "license": "MIT"
    },
    "node_modules/stacktrace-parser": {
      "version": "0.1.11",
      "resolved": "https://registry.npmjs.org/stacktrace-parser/-/stacktrace-parser-0.1.11.tgz",
      "integrity": "sha512-WjlahMgHmCJpqzU8bIBy4qtsZdU9lRlcZE3Lvyej6t4tuOuv1vk57OW3MBrj6hXBFx/nNoC9MPMTcr5YA7NQbg==",
      "license": "MIT",
      "dependencies": {
        "type-fest": "^0.7.1"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/statuses": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-1.5.0.tgz",
      "integrity": "sha512-OpZ3zP+jT1PI7I8nemJX4AKmAX070ZkYPVWV/AaKTJl+tXCTGyVdC1a4SL8RUQYEwk/f34ZX8UTykN68FwrqAA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/std-env": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/std-env/-/std-env-4.3.0.tgz",
      "integrity": "sha512-OtU/EgQ1kIm5KwqQpBC6ZEMXrZRui11w8zgfTWp8cdO9B8OaPsbA8bTHO2P+HNo1VlUTGMVBwPhydu6poeXiag==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/stream-buffers": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/stream-buffers/-/stream-buffers-2.2.0.tgz",
      "integrity": "sha512-uyQK/mx5QjHun80FLJTfaWE7JtwfRMKBLkMne6udYOmvH0CawotVa7TfgYHzAnpphn4+TweIx1QKMnRIbipmUg==",
      "license": "Unlicense",
      "engines": {
        "node": ">= 0.10.0"
      }
    },
    "node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-json-comments": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-2.0.1.tgz",
      "integrity": "sha512-4gB8na07fecVVkOI6Rs4e7T6NOTki5EmL7TUduTs6bu3EdnSycntVJ4re8kgZA+wx9IueI2Y11bfbgwtzuE0KQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/structured-headers": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/structured-headers/-/structured-headers-0.4.1.tgz",
      "integrity": "sha512-0MP/Cxx5SzeeZ10p/bZI0S6MpgD+yxAhi1BOQ34jgnMXsCq3j1t6tQnZu+KdlL7dvJTLT3g9xN8tl10TqgFMcg==",
      "license": "MIT"
    },
    "node_modules/styleq": {
      "version": "0.1.3",
      "resolved": "https://registry.npmjs.org/styleq/-/styleq-0.1.3.tgz",
      "integrity": "sha512-3ZUifmCDCQanjeej1f6kyl/BeP/Vae5EYkQ9iJfUm/QwZvlgnZzyflqAsAWYURdtea8Vkvswu2GrC57h3qffcA==",
      "license": "MIT"
    },
    "node_modules/sucrase": {
      "version": "3.35.1",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.1.tgz",
      "integrity": "sha512-DhuTmvZWux4H1UOnWMB3sk0sbaCVOoQZjv8u1rDoTV0HTdGem9hkAZtl4JZy8P2z4Bg0nT+YMeOFyVr4zcG5Tw==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "tinyglobby": "^0.2.11",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/sucrase/node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/supercluster": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/supercluster/-/supercluster-8.0.1.tgz",
      "integrity": "sha512-IiOea5kJ9iqzD2t7QJq/cREyLHTtSmUT6gQsweojg9WH2sYJqZK9SswTu6jrscO6D1G5v5vYZ9ru/eq85lXeZQ==",
      "license": "ISC",
      "dependencies": {
        "kdbush": "^4.0.2"
      }
    },
    "node_modules/supports-color": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/supports-hyperlinks": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/supports-hyperlinks/-/supports-hyperlinks-2.3.0.tgz",
      "integrity": "sha512-RpsAZlpWcDwOPQA22aCH4J0t7L8JmAvsCxfOSEwm7cQs3LshN36QaTkwd70DnBOXDWGssw2eUoc8CaRWT0XunA==",
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0",
        "supports-color": "^7.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/svg-parser": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/svg-parser/-/svg-parser-2.0.4.tgz",
      "integrity": "sha512-e4hG1hRwoOdRb37cIMSgzNsxyzKfayW6VOflrwvR+/bzrkyxY/31WkbgnQpgtrNp1SdpJvpUAGTa/ZoiPNDuRQ==",
      "license": "MIT"
    },
    "node_modules/svgo": {
      "version": "3.3.5",
      "resolved": "https://registry.npmjs.org/svgo/-/svgo-3.3.5.tgz",
      "integrity": "sha512-8SQMzdrvWaD8deUmrnYB+ASyxBVgWUOilg+A75nE/76WdLpj6LopCwiAVvkzkcqy/9b7t2Mg7faFLjg0ZRcZ3w==",
      "license": "MIT",
      "dependencies": {
        "commander": "^7.2.0",
        "css-select": "^5.1.0",
        "css-tree": "^2.3.1",
        "css-what": "^6.1.0",
        "csso": "^5.0.5",
        "picocolors": "^1.0.0",
        "sax": "^1.5.0"
      },
      "bin": {
        "svgo": "bin/svgo"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/svgo"
      }
    },
    "node_modules/svgo/node_modules/css-tree": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-2.3.1.tgz",
      "integrity": "sha512-6Fv1DV/TYw//QF5IzQdqsNDjx/wc8TrMBZsqjL9eW01tWb7R7k/mq+/VXfJCl7SoD5emsJop9cOByJZfs8hYIw==",
      "license": "MIT",
      "dependencies": {
        "mdn-data": "2.0.30",
        "source-map-js": "^1.0.1"
      },
      "engines": {
        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
      }
    },
    "node_modules/svgo/node_modules/mdn-data": {
      "version": "2.0.30",
      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.0.30.tgz",
      "integrity": "sha512-GaqWWShW4kv/G9IEucWScBx9G1/vsFZZJUO+tD26M8J8z3Kw5RDQjaoZe03YAClgeS/SWPOcb4nkFBTEi5DUEA==",
      "license": "CC0-1.0"
    },
    "node_modules/tar": {
      "version": "7.5.22",
      "resolved": "https://registry.npmjs.org/tar/-/tar-7.5.22.tgz",
      "integrity": "sha512-MFO/QzvtAOmJbkhOaCTvbGcFN9L9b+JunIsDwaKljSOdcLMea3NJ1k9Usz/rjdfSXTq4dfzfeS7W4p4YOAAHeA==",
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "@isaacs/fs-minipass": "^4.0.0",
        "chownr": "^3.0.0",
        "minipass": "^7.1.2",
        "minizlib": "^3.1.0",
        "yallist": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tar/node_modules/yallist": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-5.0.0.tgz",
      "integrity": "sha512-YgvUTfwqyc7UXVMrB+SImsVYSmTS8X/tSrtdNZMImM+n7+QTriRXyXim0mBrTXNeqzVF0KWGgHPeiyViFFrNDw==",
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/terminal-link": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/terminal-link/-/terminal-link-2.1.1.tgz",
      "integrity": "sha512-un0FmiRUQNr5PJqy9kP7c40F5BOfpGlYTrxonDChEZB7pzZxRNp/bt+ymiy9/npwXya9KH99nJ/GXFIiUkYGFQ==",
      "license": "MIT",
      "dependencies": {
        "ansi-escapes": "^4.2.1",
        "supports-hyperlinks": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/terser": {
      "version": "5.48.0",
      "resolved": "https://registry.npmjs.org/terser/-/terser-5.48.0.tgz",
      "integrity": "sha512-J/9An6vs9Us6wKRriSFXBWdRZapREHqFzdNUKk0pmu804EMR6dr6winwo7e5JDxN4xahxQsuysyYFwlwj4XN/Q==",
      "license": "BSD-2-Clause",
      "dependencies": {
        "@jridgewell/source-map": "^0.3.3",
        "acorn": "^8.15.0",
        "commander": "^2.20.0",
        "source-map-support": "~0.5.20"
      },
      "bin": {
        "terser": "bin/terser"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/terser/node_modules/commander": {
      "version": "2.20.3",
      "resolved": "https://registry.npmjs.org/commander/-/commander-2.20.3.tgz",
      "integrity": "sha512-GpVkmM8vF2vQUkj2LvZmD35JxeJOLCwJ9cUkugyk2nuhbv3+mJvpLYYt+0+USMxE+oj+ey/lJEnhZw75x/OMcQ==",
      "license": "MIT"
    },
    "node_modules/test-exclude": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/test-exclude/-/test-exclude-6.0.0.tgz",
      "integrity": "sha512-cAGWPIyOHU6zlmg88jwm7VRyXnMN7iV68OGAbYDk/Mh/xC/pzVPlQtY6ngoIH/5/tciuhGfvESU8GrHrcxD56w==",
      "license": "ISC",
      "dependencies": {
        "@istanbuljs/schema": "^0.1.2",
        "glob": "^7.1.4",
        "minimatch": "^3.0.4"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/test-exclude/node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "license": "MIT"
    },
    "node_modules/test-exclude/node_modules/brace-expansion": {
      "version": "1.1.21",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.21.tgz",
      "integrity": "sha512-9zeA+KLZNNzglF2TPKRQEDyx6Yby7daAkuy8MiPzpXPsYDWi/DRM8jmwUDxokQjYqBpv5DgPiwD4h4ZZSy1Ujw==",
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/test-exclude/node_modules/minimatch": {
      "version": "3.1.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz",
      "integrity": "sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==",
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "license": "MIT",
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/throat": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/throat/-/throat-5.0.0.tgz",
      "integrity": "sha512-fcwX4mndzpLQKBS1DVYhGAcYaYt7vsHNIvQV+WXMvnow5cgjPphq5CaayLaGsjRdSCKZFNGt7/GYAuXaNOiYCA==",
      "license": "MIT"
    },
    "node_modules/tinybench": {
      "version": "2.9.0",
      "resolved": "https://registry.npmjs.org/tinybench/-/tinybench-2.9.0.tgz",
      "integrity": "sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinyexec": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-1.3.1.tgz",
      "integrity": "sha512-GCvB3aoys96IuDFBMcTB46JOR6mdMtAToqwiW8JlWhsoh1mhHi/xn9ss/Dg7N555GiJyEt2qzoG/NHCwM6h1EA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyglobby/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/tinyglobby/node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/tinyqueue": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/tinyqueue/-/tinyqueue-2.0.3.tgz",
      "integrity": "sha512-ppJZNDuKGgxzkHihX8v9v9G5f+18gzaTfrukGrq6ueg0lmH4nqVnA2IPG0AEH3jKEk2GRJCUhDoqpoiw3PHLBA==",
      "license": "ISC"
    },
    "node_modules/tinyrainbow": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-3.2.0.tgz",
      "integrity": "sha512-LgO3D9yZJjApUiuUfl9iFAwrtaX4+lok3wJIqttGoKCHlWUqHqbQpnxCf82L8FjgKsh4iGo78hqJwgL8F6To2A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tmpl": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/tmpl/-/tmpl-1.0.5.tgz",
      "integrity": "sha512-3f0uOEAQwIqGuWW2MVzYg8fV/QNnc/IpuJNG837rLuczAaLVHslWHZQj4IGiEl5Hs3kkbhwL9Ab7Hrsmuj+Smw==",
      "license": "BSD-3-Clause"
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/tr46": {
      "version": "0.0.3",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-0.0.3.tgz",
      "integrity": "sha512-N3WMsuqV66lT30CrXNbEjx4GEwlow3v6rr4mCcv6prnfwhS01rkgyFdjPNBYd9br7LpXV1+Emh01fHnq2Gdgrw==",
      "license": "MIT"
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
      "license": "Apache-2.0"
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/type-detect": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/type-detect/-/type-detect-4.0.8.tgz",
      "integrity": "sha512-0fr/mIH1dlO+x7TlcMy+bIDqKPsw/70tVyeHW787goQjhmqaZe10uwLujubK9q9Lg6Fiho1KUKDYz0Z7k7g5/g==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/type-fest": {
      "version": "0.7.1",
      "resolved": "https://registry.npmjs.org/type-fest/-/type-fest-0.7.1.tgz",
      "integrity": "sha512-Ne2YiiGN8bmrmJJEuTWTLJR32nh/JdL1+PSicowtNb0WFpn59GK8/lfD61bVtzguz7b3PBt74nxpv/Pw5po5Rg==",
      "license": "(MIT OR CC0-1.0)",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "devOptional": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/ua-parser-js": {
      "version": "1.0.41",
      "resolved": "https://registry.npmjs.org/ua-parser-js/-/ua-parser-js-1.0.41.tgz",
      "integrity": "sha512-LbBDqdIC5s8iROCUjMbW1f5dJQTEFB1+KO9ogbvlb3nm9n4YHa5p4KTvFPWvh2Hs8gZMBuiB1/8+pdfe/tDPug==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/ua-parser-js"
        },
        {
          "type": "paypal",
          "url": "https://paypal.me/faisalman"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/faisalman"
        }
      ],
      "license": "MIT",
      "bin": {
        "ua-parser-js": "script/cli.js"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/undici": {
      "version": "6.29.0",
      "resolved": "https://registry.npmjs.org/undici/-/undici-6.29.0.tgz",
      "integrity": "sha512-R+RODBqp6i2pPflGdq+xIOUkl+RNfGgHwoinecKu/JCuf2uO06cOKoDbI2P7Dn6KcswdKwrczbU6IYJ6K8X+wg==",
      "license": "MIT",
      "engines": {
        "node": ">=18.17"
      }
    },
    "node_modules/undici-types": {
      "version": "7.24.6",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.24.6.tgz",
      "integrity": "sha512-WRNW+sJgj5OBN4/0JpHFqtqzhpbnV0GuB+OozA9gCL7a993SmU+1JBZCzLNxYsbMfIeDL+lTsphD5jN5N+n0zg==",
      "license": "MIT"
    },
    "node_modules/unicode-canonical-property-names-ecmascript": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/unicode-canonical-property-names-ecmascript/-/unicode-canonical-property-names-ecmascript-2.0.1.tgz",
      "integrity": "sha512-dA8WbNeb2a6oQzAQ55YlT5vQAWGV9WXOsi3SskE3bcCdM0P4SDd+24zS/OCacdRq5BkdsRj9q3Pg6YyQoxIGqg==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/unicode-match-property-ecmascript": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/unicode-match-property-ecmascript/-/unicode-match-property-ecmascript-2.0.0.tgz",
      "integrity": "sha512-5kaZCrbp5mmbz5ulBkDkbY0SsPOjKqVS35VpL9ulMPfSl0J0Xsm+9Evphv9CoIZFwre7aJoa94AY6seMKGVN5Q==",
      "license": "MIT",
      "dependencies": {
        "unicode-canonical-property-names-ecmascript": "^2.0.0",
        "unicode-property-aliases-ecmascript": "^2.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/unicode-match-property-value-ecmascript": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/unicode-match-property-value-ecmascript/-/unicode-match-property-value-ecmascript-2.2.1.tgz",
      "integrity": "sha512-JQ84qTuMg4nVkx8ga4A16a1epI9H6uTXAknqxkGF/aFfRLw1xC/Bp24HNLaZhHSkWd3+84t8iXnp1J0kYcZHhg==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/unicode-property-aliases-ecmascript": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/unicode-property-aliases-ecmascript/-/unicode-property-aliases-ecmascript-2.2.0.tgz",
      "integrity": "sha512-hpbDzxUY9BFwX+UeBnxv3Sh1q7HFxj48DTmXchNgRa46lO8uj3/1iEn3MiNUYTg1g9ctIqXCCERn8gYZhHC5lQ==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/unimodules-app-loader": {
      "version": "6.0.8",
      "resolved": "https://registry.npmjs.org/unimodules-app-loader/-/unimodules-app-loader-6.0.8.tgz",
      "integrity": "sha512-fqS8QwT/MC/HAmw1NKCHdzsPA6WaLm0dNmoC5Pz6lL+cDGYeYCNdHMO9fy08aL2ZD7cVkNM0pSR/AoNRe+rslA==",
      "license": "MIT"
    },
    "node_modules/unpipe": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.3.3.tgz",
      "integrity": "sha512-pJ2sYawQS0R/WI928Gj5GlPhTGzbMelq0+4INtSYNDV9ErKJcX6xjGWkoG/VnB3dpUm00zALaqkrUD77pO5TDQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/util": {
      "version": "0.12.5",
      "resolved": "https://registry.npmjs.org/util/-/util-0.12.5.tgz",
      "integrity": "sha512-kZf/K6hEIrWHI6XqOFUiiMa+79wE/D8Q+NCNAWclkyg3b4d2k7s0QGepNjiABc+aR3N1PAyHL7p6UcLY6LmrnA==",
      "license": "MIT",
      "dependencies": {
        "inherits": "^2.0.3",
        "is-arguments": "^1.0.4",
        "is-generator-function": "^1.0.7",
        "is-typed-array": "^1.1.3",
        "which-typed-array": "^1.1.2"
      }
    },
    "node_modules/utils-merge": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/utils-merge/-/utils-merge-1.0.1.tgz",
      "integrity": "sha512-pMZTvIkT1d+TFGvDOqodOclx0QWkkgi6Tdoa8gC8ffGAAqz9pzPTZWAybbsHHoED/ztMtkv/VoYTYyShUn81hA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4.0"
      }
    },
    "node_modules/uuid": {
      "version": "11.1.1",
      "resolved": "https://registry.npmjs.org/uuid/-/uuid-11.1.1.tgz",
      "integrity": "sha512-vIYxrBCC/N/K+Js3qSN88go7kIfNPssr/hHCesKCQNAjmgvYS2oqr69kIufEG+O4+PfezOH4EbIeHCfFov8ZgQ==",
      "funding": [
        "https://github.com/sponsors/broofa",
        "https://github.com/sponsors/ctavan"
      ],
      "license": "MIT",
      "bin": {
        "uuid": "dist/esm/bin/uuid"
      }
    },
    "node_modules/validate-npm-package-name": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/validate-npm-package-name/-/validate-npm-package-name-5.0.1.tgz",
      "integrity": "sha512-OljLrQ9SQdOUqTaQxqL5dEfZWrXExyyWsozYlAWFawPVNuD83igl7uJD2RTkNMbniIYgt8l81eCJGIdQF7avLQ==",
      "license": "ISC",
      "engines": {
        "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
      }
    },
    "node_modules/vary": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/vite": {
      "version": "8.3.2",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.3.2.tgz",
      "integrity": "sha512-SQr1x6W5vVSbROg7vsyXIaxK9b0G7zsT68acdWWRmnBUsgDieLCRG+Rep9WdZgcposvv/GSnr4GUUBqB3vXq6w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.7",
        "postcss": "^8.5.28",
        "rolldown": "~1.2.11",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.7.1",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vite/node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/vitest": {
      "version": "4.1.11",
      "resolved": "https://registry.npmjs.org/vitest/-/vitest-4.1.11.tgz",
      "integrity": "sha512-fhACrNXUidIbGSBr5FlbuBkO7VWC1ZyLl0DO4CU2DrQoAPxX84Ysxs+HeGQpii5lZWV1Q4gBZTTu49mF+A6Edw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/expect": "4.1.11",
        "@vitest/mocker": "4.1.11",
        "@vitest/pretty-format": "4.1.11",
        "@vitest/runner": "4.1.11",
        "@vitest/snapshot": "4.1.11",
        "@vitest/spy": "4.1.11",
        "@vitest/utils": "4.1.11",
        "es-module-lexer": "^2.0.0",
        "expect-type": "^1.3.0",
        "magic-string": "^0.30.21",
        "obug": "^2.1.1",
        "pathe": "^2.0.3",
        "picomatch": "^4.0.3",
        "std-env": "^4.0.0-rc.1",
        "tinybench": "^2.9.0",
        "tinyexec": "^1.0.2",
        "tinyglobby": "^0.2.15",
        "tinyrainbow": "^3.1.0",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0",
        "why-is-node-running": "^2.3.0"
      },
      "bin": {
        "vitest": "vitest.mjs"
      },
      "engines": {
        "node": "^20.0.0 || ^22.0.0 || >=24.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "@edge-runtime/vm": "*",
        "@opentelemetry/api": "^1.9.0",
        "@types/node": "^20.0.0 || ^22.0.0 || >=24.0.0",
        "@vitest/browser-playwright": "4.1.11",
        "@vitest/browser-preview": "4.1.11",
        "@vitest/browser-webdriverio": "4.1.11",
        "@vitest/coverage-istanbul": "4.1.11",
        "@vitest/coverage-v8": "4.1.11",
        "@vitest/ui": "4.1.11",
        "happy-dom": "*",
        "jsdom": "*",
        "vite": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "@edge-runtime/vm": {
          "optional": true
        },
        "@opentelemetry/api": {
          "optional": true
        },
        "@types/node": {
          "optional": true
        },
        "@vitest/browser-playwright": {
          "optional": true
        },
        "@vitest/browser-preview": {
          "optional": true
        },
        "@vitest/browser-webdriverio": {
          "optional": true
        },
        "@vitest/coverage-istanbul": {
          "optional": true
        },
        "@vitest/coverage-v8": {
          "optional": true
        },
        "@vitest/ui": {
          "optional": true
        },
        "happy-dom": {
          "optional": true
        },
        "jsdom": {
          "optional": true
        },
        "vite": {
          "optional": false
        }
      }
    },
    "node_modules/vitest/node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/vlq": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/vlq/-/vlq-1.0.1.tgz",
      "integrity": "sha512-gQpnTgkubC6hQgdIcRdYGDSDc+SaujOdyesZQMv6JlfQee/9Mp0Qhnys6WxDWvQnL5WZdT7o2Ul187aSt0Rq+w==",
      "license": "MIT"
    },
    "node_modules/vt-pbf": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/vt-pbf/-/vt-pbf-3.1.3.tgz",
      "integrity": "sha512-2LzDFzt0mZKZ9IpVF2r69G9bXaP2Q2sArJCmcCgvfTdCCZzSyz4aCLoQyUilu37Ll56tCblIZrXFIjNUpGIlmA==",
      "license": "MIT",
      "dependencies": {
        "@mapbox/point-geometry": "0.1.0",
        "@mapbox/vector-tile": "^1.3.1",
        "pbf": "^3.2.1"
      }
    },
    "node_modules/walker": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/walker/-/walker-1.0.8.tgz",
      "integrity": "sha512-ts/8E8l5b7kY0vlWLewOkDXMmPdLcVV4GmOQLyxuSswIJsweeFZtAsMF7k1Nszz+TYBQrlYRmzOnr398y1JemQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "makeerror": "1.0.12"
      }
    },
    "node_modules/warn-once": {
      "version": "0.1.1",
      "resolved": "https://registry.npmjs.org/warn-once/-/warn-once-0.1.1.tgz",
      "integrity": "sha512-VkQZJbO8zVImzYFteBXvBOZEl1qL175WH8VmZcxF2fZAoudNhNDvHi+doCaAEdU2l2vtcIwa2zn0QK5+I1HQ3Q==",
      "license": "MIT"
    },
    "node_modules/wcwidth": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/wcwidth/-/wcwidth-1.0.1.tgz",
      "integrity": "sha512-XHPEwS0q6TaxcvG85+8EYkbiCux2XtWG2mkc47Ng2A77BQu9+DqIOJldST4HgPkuea7dvKSj5VgX3P1d4rW8Tg==",
      "license": "MIT",
      "dependencies": {
        "defaults": "^1.0.3"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-5.0.0.tgz",
      "integrity": "sha512-VlZwKPCkYKxQgeSbH5EyngOmRp7Ww7I9rQLERETtf5ofd9pGeswWiOtogpEO850jziPRarreGxn5QIiTqpb2wA==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/whatwg-fetch": {
      "version": "3.6.20",
      "resolved": "https://registry.npmjs.org/whatwg-fetch/-/whatwg-fetch-3.6.20.tgz",
      "integrity": "sha512-EqhiFU6daOA8kpjOWTL0olhVOF3i7OrFzSYiGsEMB8GcXS+RrzauAERX65xMeNWVqxA6HXH2m69Z9LaKKdisfg==",
      "license": "MIT"
    },
    "node_modules/whatwg-url": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-5.0.0.tgz",
      "integrity": "sha512-saE57nupxk6v3HY35+jzBwYa0rKSy0XR8JSxZPwgLr7ys0IBzhGviA1/TUGJLmSVqs8pb9AnvICXEuOHLprYTw==",
      "license": "MIT",
      "dependencies": {
        "tr46": "~0.0.3",
        "webidl-conversions": "^3.0.0"
      }
    },
    "node_modules/whatwg-url-without-unicode": {
      "version": "8.0.0-3",
      "resolved": "https://registry.npmjs.org/whatwg-url-without-unicode/-/whatwg-url-without-unicode-8.0.0-3.tgz",
      "integrity": "sha512-HoKuzZrUlgpz35YO27XgD28uh/WJH4B0+3ttFqRo//lmq+9T/mIOJ6kqmINI9HpUpz1imRC/nR/lxKpJiv0uig==",
      "license": "MIT",
      "dependencies": {
        "buffer": "^5.4.3",
        "punycode": "^2.1.1",
        "webidl-conversions": "^5.0.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/whatwg-url/node_modules/webidl-conversions": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-3.0.1.tgz",
      "integrity": "sha512-2JAn3z8AR6rjK8Sm8orRC0h/bcl/DqL7tRPdGZ4I1CjdF+EaMLmYxBHyXuKL849eucPFhvBoxMsflfOb8kxaeQ==",
      "license": "BSD-2-Clause"
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/which-typed-array": {
      "version": "1.1.20",
      "resolved": "https://registry.npmjs.org/which-typed-array/-/which-typed-array-1.1.20.tgz",
      "integrity": "sha512-LYfpUkmqwl0h9A2HL09Mms427Q1RZWuOHsukfVcKRq9q95iQxdw0ix1JQrqbcDR9PH1QDwf5Qo8OZb5lksZ8Xg==",
      "license": "MIT",
      "dependencies": {
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "for-each": "^0.3.5",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/why-is-node-running": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/why-is-node-running/-/why-is-node-running-2.3.0.tgz",
      "integrity": "sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "siginfo": "^2.0.0",
        "stackback": "0.0.2"
      },
      "bin": {
        "why-is-node-running": "cli.js"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wonka": {
      "version": "6.3.6",
      "resolved": "https://registry.npmjs.org/wonka/-/wonka-6.3.6.tgz",
      "integrity": "sha512-MXH+6mDHAZ2GuMpgKS055FR6v0xVP3XwquxIMYXgiW+FejHQlMGlvVRZT4qMCxR+bEo/FCtIdKxwej9WV3YQag==",
      "license": "MIT"
    },
    "node_modules/wrap-ansi": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "license": "ISC"
    },
    "node_modules/write-file-atomic": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/write-file-atomic/-/write-file-atomic-4.0.2.tgz",
      "integrity": "sha512-7KxauUdBmSdWnmpaGFg+ppNjKF8uNLry8LyzjauQDOVONfFLNKrKvQOxZ/VuTIcS/gge/YNahf5RIIQWTSarlg==",
      "license": "ISC",
      "dependencies": {
        "imurmurhash": "^0.1.4",
        "signal-exit": "^3.0.7"
      },
      "engines": {
        "node": "^12.13.0 || ^14.15.0 || >=16.0.0"
      }
    },
    "node_modules/ws": {
      "version": "7.5.13",
      "resolved": "https://registry.npmjs.org/ws/-/ws-7.5.13.tgz",
      "integrity": "sha512-rsKI6xDBFVf4r/x8XyChGK04QR/XHroxs/jUcoWvtEZM8TPU/X/uIY9B1CsSzYws9ZJb/6bbBu7dPhFW00CAoA==",
      "license": "MIT",
      "engines": {
        "node": ">=8.3.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": "^5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/xcode": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/xcode/-/xcode-3.0.1.tgz",
      "integrity": "sha512-kCz5k7J7XbJtjABOvkc5lJmkiDh8VhjVCGNiqdKCscmVpdVUpEAyXv1xmCLkQJ5dsHqx3IPO4XW+NTDhU/fatA==",
      "license": "Apache-2.0",
      "dependencies": {
        "simple-plist": "^1.1.0",
        "uuid": "^7.0.3"
      },
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/xml2js": {
      "version": "0.6.0",
      "resolved": "https://registry.npmjs.org/xml2js/-/xml2js-0.6.0.tgz",
      "integrity": "sha512-eLTh0kA8uHceqesPqSE+VvO1CDDJWMwlQfB6LuN6T8w6MaDJ8Txm8P7s5cHD0miF0V+GGTZrDQfxPZQVsur33w==",
      "license": "MIT",
      "dependencies": {
        "sax": ">=0.6.0",
        "xmlbuilder": "~11.0.0"
      },
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/xml2js/node_modules/xmlbuilder": {
      "version": "11.0.1",
      "resolved": "https://registry.npmjs.org/xmlbuilder/-/xmlbuilder-11.0.1.tgz",
      "integrity": "sha512-fDlsI/kFEx7gLvbecc0/ohLG50fugQp8ryHzMTuW9vSa1GJ0XYWKnhsUx7oie3G98+r56aTQIUB4kht42R3JvA==",
      "license": "MIT",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/xmlbuilder": {
      "version": "15.1.1",
      "resolved": "https://registry.npmjs.org/xmlbuilder/-/xmlbuilder-15.1.1.tgz",
      "integrity": "sha512-yMqGBqtXyeN1e3TGYvgNgDVZ3j84W4cwkOXQswghol6APgZWaff9lnbvN7MHYJOiXsvGPXtjTYJEiC9J2wv9Eg==",
      "license": "MIT",
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/y18n": {
      "version": "5.0.8",
      "resolved": "https://registry.npmjs.org/y18n/-/y18n-5.0.8.tgz",
      "integrity": "sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==",
      "license": "ISC",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "license": "ISC"
    },
    "node_modules/yaml": {
      "version": "2.9.0",
      "resolved": "https://registry.npmjs.org/yaml/-/yaml-2.9.0.tgz",
      "integrity": "sha512-2AvhNX3mb8zd6Zy7INTtSpl1F15HW6Wnqj0srWlkKLcpYl/gMIMJiyuGq2KeI2YFxUPjdlB+3Lc10seMLtL4cA==",
      "license": "ISC",
      "bin": {
        "yaml": "bin.mjs"
      },
      "engines": {
        "node": ">= 14.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/eemeli"
      }
    },
    "node_modules/yargs": {
      "version": "17.7.2",
      "resolved": "https://registry.npmjs.org/yargs/-/yargs-17.7.2.tgz",
      "integrity": "sha512-7dSzzRQ++CKnNI/krKnYRV7JKKPUXMEh61soaHKg9mrWEhzFWhFnxPxGl+69cD1Ou63C13NUPCnmIcrvqCuM6w==",
      "license": "MIT",
      "dependencies": {
        "cliui": "^8.0.1",
        "escalade": "^3.1.1",
        "get-caller-file": "^2.0.5",
        "require-directory": "^2.1.1",
        "string-width": "^4.2.3",
        "y18n": "^5.0.5",
        "yargs-parser": "^21.1.1"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/yargs-parser": {
      "version": "21.1.1",
      "resolved": "https://registry.npmjs.org/yargs-parser/-/yargs-parser-21.1.1.tgz",
      "integrity": "sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "tooling/metro-image-size": {
      "name": "@left/metro-image-size",
      "version": "1.0.0",
      "dependencies": {
        "image-size-modern": "npm:image-size@2.0.3"
      }
    }
  }
}

````

## ios/Podfile.lock

````yaml
PODS:
  - EXApplication (7.0.8):
    - ExpoModulesCore
  - EXConstants (18.0.14):
    - ExpoModulesCore
  - EXImageLoader (6.0.0):
    - ExpoModulesCore
    - React-Core
  - EXJSONUtils (0.15.0)
  - EXManifests (1.0.11):
    - ExpoModulesCore
  - EXNotifications (0.32.17):
    - ExpoModulesCore
  - Expo (54.0.37):
    - ExpoModulesCore
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-NativeModulesApple
    - React-RCTAppDelegate
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactAppDependencyProvider
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - expo-dev-client (6.0.21):
    - EXManifests
    - expo-dev-launcher
    - expo-dev-menu
    - expo-dev-menu-interface
    - EXUpdatesInterface
  - expo-dev-launcher (6.0.21):
    - EXManifests
    - expo-dev-launcher/Main (= 6.0.21)
    - expo-dev-menu
    - expo-dev-menu-interface
    - ExpoModulesCore
    - EXUpdatesInterface
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-jsinspector
    - React-NativeModulesApple
    - React-RCTAppDelegate
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactAppDependencyProvider
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - expo-dev-launcher/Main (6.0.21):
    - EXManifests
    - expo-dev-launcher/Unsafe
    - expo-dev-menu
    - expo-dev-menu-interface
    - ExpoModulesCore
    - EXUpdatesInterface
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-jsinspector
    - React-NativeModulesApple
    - React-RCTAppDelegate
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactAppDependencyProvider
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - expo-dev-launcher/Unsafe (6.0.21):
    - EXManifests
    - expo-dev-menu
    - expo-dev-menu-interface
    - ExpoModulesCore
    - EXUpdatesInterface
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-jsinspector
    - React-NativeModulesApple
    - React-RCTAppDelegate
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactAppDependencyProvider
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - expo-dev-menu (7.0.19):
    - expo-dev-menu/Main (= 7.0.19)
    - expo-dev-menu/ReactNativeCompatibles (= 7.0.19)
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - expo-dev-menu-interface (2.0.0)
  - expo-dev-menu/Main (7.0.19):
    - EXManifests
    - expo-dev-menu-interface
    - ExpoModulesCore
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-jsinspector
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - expo-dev-menu/ReactNativeCompatibles (7.0.19):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - ExpoAppleAuthentication (8.0.8):
    - ExpoModulesCore
  - ExpoAsset (12.0.13):
    - ExpoModulesCore
  - ExpoBlur (15.0.8):
    - ExpoModulesCore
  - ExpoCrypto (15.0.9):
    - ExpoModulesCore
  - ExpoFileSystem (19.0.24):
    - ExpoModulesCore
  - ExpoFont (14.0.12):
    - ExpoModulesCore
  - ExpoGlassEffect (0.1.10):
    - ExpoModulesCore
  - ExpoImageManipulator (14.0.8):
    - EXImageLoader
    - ExpoModulesCore
    - SDWebImageWebPCoder
  - ExpoImagePicker (17.0.11):
    - ExpoModulesCore
  - ExpoKeepAwake (15.0.8):
    - ExpoModulesCore
  - ExpoLinearGradient (15.0.8):
    - ExpoModulesCore
  - ExpoLinking (8.0.12):
    - ExpoModulesCore
  - ExpoLocation (19.0.8):
    - ExpoModulesCore
  - ExpoModulesCore (3.0.30):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-jsinspector
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - ExpoWebBrowser (15.0.11):
    - ExpoModulesCore
  - EXTaskManager (14.0.9):
    - ExpoModulesCore
    - UMAppLoader
  - EXUpdatesInterface (2.0.0):
    - ExpoModulesCore
  - FBLazyVector (0.81.5)
  - hermes-engine (0.81.5):
    - hermes-engine/Pre-built (= 0.81.5)
  - hermes-engine/Pre-built (0.81.5)
  - libwebp (1.6.0):
    - libwebp/demux (= 1.6.0)
    - libwebp/mux (= 1.6.0)
    - libwebp/sharpyuv (= 1.6.0)
    - libwebp/webp (= 1.6.0)
  - libwebp/demux (1.6.0):
    - libwebp/webp
  - libwebp/mux (1.6.0):
    - libwebp/demux
  - libwebp/sharpyuv (1.6.0)
  - libwebp/webp (1.6.0):
    - libwebp/sharpyuv
  - MapboxCommon (24.23.1):
    - Turf (= 4.0.0)
  - MapboxCoreMaps (11.23.1):
    - MapboxCommon (= 24.23.1)
  - MapboxMaps (11.23.1):
    - MapboxCommon (= 24.23.1)
    - MapboxCoreMaps (= 11.23.1)
    - Turf (= 4.0.0)
  - RCTDeprecation (0.81.5)
  - RCTRequired (0.81.5)
  - RCTTypeSafety (0.81.5):
    - FBLazyVector (= 0.81.5)
    - RCTRequired (= 0.81.5)
    - React-Core (= 0.81.5)
  - React (0.81.5):
    - React-Core (= 0.81.5)
    - React-Core/DevSupport (= 0.81.5)
    - React-Core/RCTWebSocket (= 0.81.5)
    - React-RCTActionSheet (= 0.81.5)
    - React-RCTAnimation (= 0.81.5)
    - React-RCTBlob (= 0.81.5)
    - React-RCTImage (= 0.81.5)
    - React-RCTLinking (= 0.81.5)
    - React-RCTNetwork (= 0.81.5)
    - React-RCTSettings (= 0.81.5)
    - React-RCTText (= 0.81.5)
    - React-RCTVibration (= 0.81.5)
  - React-callinvoker (0.81.5)
  - React-Core (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default (= 0.81.5)
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core-prebuilt (0.81.5):
    - ReactNativeDependencies
  - React-Core/CoreModulesHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/Default (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/DevSupport (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default (= 0.81.5)
    - React-Core/RCTWebSocket (= 0.81.5)
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTActionSheetHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTAnimationHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTBlobHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTImageHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTLinkingHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTNetworkHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTSettingsHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTTextHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTVibrationHeaders (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-Core/RCTWebSocket (0.81.5):
    - hermes-engine
    - RCTDeprecation
    - React-Core-prebuilt
    - React-Core/Default (= 0.81.5)
    - React-cxxreact
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsitooling
    - React-perflogger
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-CoreModules (0.81.5):
    - RCTTypeSafety (= 0.81.5)
    - React-Core-prebuilt
    - React-Core/CoreModulesHeaders (= 0.81.5)
    - React-jsi (= 0.81.5)
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsinspectortracing
    - React-NativeModulesApple
    - React-RCTBlob
    - React-RCTFBReactNativeSpec
    - React-RCTImage (= 0.81.5)
    - React-runtimeexecutor
    - ReactCommon
    - ReactNativeDependencies
  - React-cxxreact (0.81.5):
    - hermes-engine
    - React-callinvoker (= 0.81.5)
    - React-Core-prebuilt
    - React-debug (= 0.81.5)
    - React-jsi (= 0.81.5)
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsinspectortracing
    - React-logger (= 0.81.5)
    - React-perflogger (= 0.81.5)
    - React-runtimeexecutor
    - React-timing (= 0.81.5)
    - ReactNativeDependencies
  - React-debug (0.81.5)
  - React-defaultsnativemodule (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-domnativemodule
    - React-featureflagsnativemodule
    - React-idlecallbacksnativemodule
    - React-jsi
    - React-jsiexecutor
    - React-microtasksnativemodule
    - React-RCTFBReactNativeSpec
    - ReactNativeDependencies
  - React-domnativemodule (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-Fabric
    - React-Fabric/bridging
    - React-FabricComponents
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-RCTFBReactNativeSpec
    - React-runtimeexecutor
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-Fabric (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric/animations (= 0.81.5)
    - React-Fabric/attributedstring (= 0.81.5)
    - React-Fabric/bridging (= 0.81.5)
    - React-Fabric/componentregistry (= 0.81.5)
    - React-Fabric/componentregistrynative (= 0.81.5)
    - React-Fabric/components (= 0.81.5)
    - React-Fabric/consistency (= 0.81.5)
    - React-Fabric/core (= 0.81.5)
    - React-Fabric/dom (= 0.81.5)
    - React-Fabric/imagemanager (= 0.81.5)
    - React-Fabric/leakchecker (= 0.81.5)
    - React-Fabric/mounting (= 0.81.5)
    - React-Fabric/observers (= 0.81.5)
    - React-Fabric/scheduler (= 0.81.5)
    - React-Fabric/telemetry (= 0.81.5)
    - React-Fabric/templateprocessor (= 0.81.5)
    - React-Fabric/uimanager (= 0.81.5)
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/animations (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/attributedstring (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/bridging (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/componentregistry (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/componentregistrynative (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/components (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric/components/legacyviewmanagerinterop (= 0.81.5)
    - React-Fabric/components/root (= 0.81.5)
    - React-Fabric/components/scrollview (= 0.81.5)
    - React-Fabric/components/view (= 0.81.5)
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/components/legacyviewmanagerinterop (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/components/root (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/components/scrollview (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/components/view (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-renderercss
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-Fabric/consistency (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/core (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/dom (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/imagemanager (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/leakchecker (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/mounting (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/observers (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric/observers/events (= 0.81.5)
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/observers/events (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/scheduler (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric/observers/events
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-performancetimeline
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/telemetry (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/templateprocessor (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/uimanager (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric/uimanager/consistency (= 0.81.5)
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererconsistency
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-Fabric/uimanager/consistency (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-rendererconsistency
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-FabricComponents (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-FabricComponents/components (= 0.81.5)
    - React-FabricComponents/textlayoutmanager (= 0.81.5)
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-FabricComponents/components/inputaccessory (= 0.81.5)
    - React-FabricComponents/components/iostextinput (= 0.81.5)
    - React-FabricComponents/components/modal (= 0.81.5)
    - React-FabricComponents/components/rncore (= 0.81.5)
    - React-FabricComponents/components/safeareaview (= 0.81.5)
    - React-FabricComponents/components/scrollview (= 0.81.5)
    - React-FabricComponents/components/switch (= 0.81.5)
    - React-FabricComponents/components/text (= 0.81.5)
    - React-FabricComponents/components/textinput (= 0.81.5)
    - React-FabricComponents/components/unimplementedview (= 0.81.5)
    - React-FabricComponents/components/virtualview (= 0.81.5)
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/inputaccessory (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/iostextinput (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/modal (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/rncore (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/safeareaview (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/scrollview (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/switch (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/text (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/textinput (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/unimplementedview (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/components/virtualview (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricComponents/textlayoutmanager (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-logger
    - React-RCTFBReactNativeSpec
    - React-rendererdebug
    - React-runtimescheduler
    - React-utils
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-FabricImage (0.81.5):
    - hermes-engine
    - RCTRequired (= 0.81.5)
    - RCTTypeSafety (= 0.81.5)
    - React-Core-prebuilt
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-jsiexecutor (= 0.81.5)
    - React-logger
    - React-rendererdebug
    - React-utils
    - ReactCommon
    - ReactNativeDependencies
    - Yoga
  - React-featureflags (0.81.5):
    - React-Core-prebuilt
    - ReactNativeDependencies
  - React-featureflagsnativemodule (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-featureflags
    - React-jsi
    - React-jsiexecutor
    - React-RCTFBReactNativeSpec
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-graphics (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-jsi
    - React-jsiexecutor
    - React-utils
    - ReactNativeDependencies
  - React-hermes (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-cxxreact (= 0.81.5)
    - React-jsi
    - React-jsiexecutor (= 0.81.5)
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsinspectortracing
    - React-perflogger (= 0.81.5)
    - React-runtimeexecutor
    - ReactNativeDependencies
  - React-idlecallbacksnativemodule (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-jsi
    - React-jsiexecutor
    - React-RCTFBReactNativeSpec
    - React-runtimeexecutor
    - React-runtimescheduler
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-ImageManager (0.81.5):
    - React-Core-prebuilt
    - React-Core/Default
    - React-debug
    - React-Fabric
    - React-graphics
    - React-rendererdebug
    - React-utils
    - ReactNativeDependencies
  - React-jserrorhandler (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-jsi
    - ReactCommon/turbomodule/bridging
    - ReactNativeDependencies
  - React-jsi (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - ReactNativeDependencies
  - React-jsiexecutor (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-cxxreact (= 0.81.5)
    - React-jsi (= 0.81.5)
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsinspectortracing
    - React-perflogger (= 0.81.5)
    - React-runtimeexecutor
    - ReactNativeDependencies
  - React-jsinspector (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-featureflags
    - React-jsi
    - React-jsinspectorcdp
    - React-jsinspectornetwork
    - React-jsinspectortracing
    - React-oscompat
    - React-perflogger (= 0.81.5)
    - React-runtimeexecutor
    - ReactNativeDependencies
  - React-jsinspectorcdp (0.81.5):
    - React-Core-prebuilt
    - ReactNativeDependencies
  - React-jsinspectornetwork (0.81.5):
    - React-Core-prebuilt
    - React-featureflags
    - React-jsinspectorcdp
    - React-performancetimeline
    - React-timing
    - ReactNativeDependencies
  - React-jsinspectortracing (0.81.5):
    - React-Core-prebuilt
    - React-oscompat
    - React-timing
    - ReactNativeDependencies
  - React-jsitooling (0.81.5):
    - React-Core-prebuilt
    - React-cxxreact (= 0.81.5)
    - React-jsi (= 0.81.5)
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsinspectortracing
    - React-runtimeexecutor
    - ReactNativeDependencies
  - React-jsitracing (0.81.5):
    - React-jsi
  - React-logger (0.81.5):
    - React-Core-prebuilt
    - ReactNativeDependencies
  - React-Mapbuffer (0.81.5):
    - React-Core-prebuilt
    - React-debug
    - ReactNativeDependencies
  - React-microtasksnativemodule (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-jsi
    - React-jsiexecutor
    - React-RCTFBReactNativeSpec
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - react-native-safe-area-context (5.6.0):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - react-native-safe-area-context/common (= 5.6.0)
    - react-native-safe-area-context/fabric (= 5.6.0)
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - react-native-safe-area-context/common (5.6.0):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - react-native-safe-area-context/fabric (5.6.0):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - react-native-safe-area-context/common
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - React-NativeModulesApple (0.81.5):
    - hermes-engine
    - React-callinvoker
    - React-Core
    - React-Core-prebuilt
    - React-cxxreact
    - React-featureflags
    - React-jsi
    - React-jsinspector
    - React-jsinspectorcdp
    - React-runtimeexecutor
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - React-oscompat (0.81.5)
  - React-perflogger (0.81.5):
    - React-Core-prebuilt
    - ReactNativeDependencies
  - React-performancetimeline (0.81.5):
    - React-Core-prebuilt
    - React-featureflags
    - React-jsinspectortracing
    - React-perflogger
    - React-timing
    - ReactNativeDependencies
  - React-RCTActionSheet (0.81.5):
    - React-Core/RCTActionSheetHeaders (= 0.81.5)
  - React-RCTAnimation (0.81.5):
    - RCTTypeSafety
    - React-Core-prebuilt
    - React-Core/RCTAnimationHeaders
    - React-featureflags
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFBReactNativeSpec
    - ReactCommon
    - ReactNativeDependencies
  - React-RCTAppDelegate (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-CoreModules
    - React-debug
    - React-defaultsnativemodule
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-hermes
    - React-jsitooling
    - React-NativeModulesApple
    - React-RCTFabric
    - React-RCTFBReactNativeSpec
    - React-RCTImage
    - React-RCTNetwork
    - React-RCTRuntime
    - React-rendererdebug
    - React-RuntimeApple
    - React-RuntimeCore
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactCommon
    - ReactNativeDependencies
  - React-RCTBlob (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-Core/RCTBlobHeaders
    - React-Core/RCTWebSocket
    - React-jsi
    - React-jsinspector
    - React-jsinspectorcdp
    - React-NativeModulesApple
    - React-RCTFBReactNativeSpec
    - React-RCTNetwork
    - ReactCommon
    - ReactNativeDependencies
  - React-RCTFabric (0.81.5):
    - hermes-engine
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-FabricComponents
    - React-FabricImage
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsinspectornetwork
    - React-jsinspectortracing
    - React-performancetimeline
    - React-RCTAnimation
    - React-RCTFBReactNativeSpec
    - React-RCTImage
    - React-RCTText
    - React-rendererconsistency
    - React-renderercss
    - React-rendererdebug
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
    - Yoga
  - React-RCTFBReactNativeSpec (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFBReactNativeSpec/components (= 0.81.5)
    - ReactCommon
    - ReactNativeDependencies
  - React-RCTFBReactNativeSpec/components (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-NativeModulesApple
    - React-rendererdebug
    - React-utils
    - ReactCommon
    - ReactNativeDependencies
    - Yoga
  - React-RCTImage (0.81.5):
    - RCTTypeSafety
    - React-Core-prebuilt
    - React-Core/RCTImageHeaders
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFBReactNativeSpec
    - React-RCTNetwork
    - ReactCommon
    - ReactNativeDependencies
  - React-RCTLinking (0.81.5):
    - React-Core/RCTLinkingHeaders (= 0.81.5)
    - React-jsi (= 0.81.5)
    - React-NativeModulesApple
    - React-RCTFBReactNativeSpec
    - ReactCommon
    - ReactCommon/turbomodule/core (= 0.81.5)
  - React-RCTNetwork (0.81.5):
    - RCTTypeSafety
    - React-Core-prebuilt
    - React-Core/RCTNetworkHeaders
    - React-featureflags
    - React-jsi
    - React-jsinspectorcdp
    - React-jsinspectornetwork
    - React-NativeModulesApple
    - React-RCTFBReactNativeSpec
    - ReactCommon
    - ReactNativeDependencies
  - React-RCTRuntime (0.81.5):
    - hermes-engine
    - React-Core
    - React-Core-prebuilt
    - React-jsi
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsinspectortracing
    - React-jsitooling
    - React-RuntimeApple
    - React-RuntimeCore
    - React-runtimeexecutor
    - React-RuntimeHermes
    - ReactNativeDependencies
  - React-RCTSettings (0.81.5):
    - RCTTypeSafety
    - React-Core-prebuilt
    - React-Core/RCTSettingsHeaders
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFBReactNativeSpec
    - ReactCommon
    - ReactNativeDependencies
  - React-RCTText (0.81.5):
    - React-Core/RCTTextHeaders (= 0.81.5)
    - Yoga
  - React-RCTVibration (0.81.5):
    - React-Core-prebuilt
    - React-Core/RCTVibrationHeaders
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFBReactNativeSpec
    - ReactCommon
    - ReactNativeDependencies
  - React-rendererconsistency (0.81.5)
  - React-renderercss (0.81.5):
    - React-debug
    - React-utils
  - React-rendererdebug (0.81.5):
    - React-Core-prebuilt
    - React-debug
    - ReactNativeDependencies
  - React-RuntimeApple (0.81.5):
    - hermes-engine
    - React-callinvoker
    - React-Core-prebuilt
    - React-Core/Default
    - React-CoreModules
    - React-cxxreact
    - React-featureflags
    - React-jserrorhandler
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsitooling
    - React-Mapbuffer
    - React-NativeModulesApple
    - React-RCTFabric
    - React-RCTFBReactNativeSpec
    - React-RuntimeCore
    - React-runtimeexecutor
    - React-RuntimeHermes
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
  - React-RuntimeCore (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-cxxreact
    - React-Fabric
    - React-featureflags
    - React-jserrorhandler
    - React-jsi
    - React-jsiexecutor
    - React-jsinspector
    - React-jsitooling
    - React-performancetimeline
    - React-runtimeexecutor
    - React-runtimescheduler
    - React-utils
    - ReactNativeDependencies
  - React-runtimeexecutor (0.81.5):
    - React-Core-prebuilt
    - React-debug
    - React-featureflags
    - React-jsi (= 0.81.5)
    - React-utils
    - ReactNativeDependencies
  - React-RuntimeHermes (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-featureflags
    - React-hermes
    - React-jsi
    - React-jsinspector
    - React-jsinspectorcdp
    - React-jsinspectortracing
    - React-jsitooling
    - React-jsitracing
    - React-RuntimeCore
    - React-runtimeexecutor
    - React-utils
    - ReactNativeDependencies
  - React-runtimescheduler (0.81.5):
    - hermes-engine
    - React-callinvoker
    - React-Core-prebuilt
    - React-cxxreact
    - React-debug
    - React-featureflags
    - React-jsi
    - React-jsinspectortracing
    - React-performancetimeline
    - React-rendererconsistency
    - React-rendererdebug
    - React-runtimeexecutor
    - React-timing
    - React-utils
    - ReactNativeDependencies
  - React-timing (0.81.5):
    - React-debug
  - React-utils (0.81.5):
    - hermes-engine
    - React-Core-prebuilt
    - React-debug
    - React-jsi (= 0.81.5)
    - ReactNativeDependencies
  - ReactAppDependencyProvider (0.81.5):
    - ReactCodegen
  - ReactCodegen (0.81.5):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-FabricImage
    - React-featureflags
    - React-graphics
    - React-jsi
    - React-jsiexecutor
    - React-NativeModulesApple
    - React-RCTAppDelegate
    - React-rendererdebug
    - React-utils
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
  - ReactCommon (0.81.5):
    - React-Core-prebuilt
    - ReactCommon/turbomodule (= 0.81.5)
    - ReactNativeDependencies
  - ReactCommon/turbomodule (0.81.5):
    - hermes-engine
    - React-callinvoker (= 0.81.5)
    - React-Core-prebuilt
    - React-cxxreact (= 0.81.5)
    - React-jsi (= 0.81.5)
    - React-logger (= 0.81.5)
    - React-perflogger (= 0.81.5)
    - ReactCommon/turbomodule/bridging (= 0.81.5)
    - ReactCommon/turbomodule/core (= 0.81.5)
    - ReactNativeDependencies
  - ReactCommon/turbomodule/bridging (0.81.5):
    - hermes-engine
    - React-callinvoker (= 0.81.5)
    - React-Core-prebuilt
    - React-cxxreact (= 0.81.5)
    - React-jsi (= 0.81.5)
    - React-logger (= 0.81.5)
    - React-perflogger (= 0.81.5)
    - ReactNativeDependencies
  - ReactCommon/turbomodule/core (0.81.5):
    - hermes-engine
    - React-callinvoker (= 0.81.5)
    - React-Core-prebuilt
    - React-cxxreact (= 0.81.5)
    - React-debug (= 0.81.5)
    - React-featureflags (= 0.81.5)
    - React-jsi (= 0.81.5)
    - React-logger (= 0.81.5)
    - React-perflogger (= 0.81.5)
    - React-utils (= 0.81.5)
    - ReactNativeDependencies
  - ReactNativeDependencies (0.81.5)
  - RNCAsyncStorage (2.2.0):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - rnmapbox-maps (10.3.5):
    - MapboxMaps (~> 11.23.1)
    - React
    - React-Core
    - rnmapbox-maps/DynamicLibrary (= 10.3.5)
    - Turf
  - rnmapbox-maps/DynamicLibrary (10.3.5):
    - hermes-engine
    - MapboxMaps (~> 11.23.1)
    - RCTRequired
    - RCTTypeSafety
    - React
    - React-Core
    - React-Core-prebuilt
    - React-featureflags
    - React-ImageManager
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Turf
    - Yoga
  - RNSVG (15.12.1):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - RNSVG/common (= 15.12.1)
    - Yoga
  - RNSVG/common (15.12.1):
    - hermes-engine
    - RCTRequired
    - RCTTypeSafety
    - React-Core
    - React-Core-prebuilt
    - React-debug
    - React-Fabric
    - React-featureflags
    - React-graphics
    - React-ImageManager
    - React-jsi
    - React-NativeModulesApple
    - React-RCTFabric
    - React-renderercss
    - React-rendererdebug
    - React-utils
    - ReactCodegen
    - ReactCommon/turbomodule/bridging
    - ReactCommon/turbomodule/core
    - ReactNativeDependencies
    - Yoga
  - SDWebImage/Core (5.21.7)
  - SDWebImageWebPCoder (0.15.0):
    - libwebp (~> 1.0)
    - SDWebImage/Core (~> 5.17)
  - Turf (4.0.0)
  - UMAppLoader (6.0.8)
  - Yoga (0.0.0)

DEPENDENCIES:
  - EXApplication (from `../node_modules/expo-application/ios`)
  - EXConstants (from `../node_modules/expo-constants/ios`)
  - EXImageLoader (from `../node_modules/expo-image-loader/ios`)
  - EXJSONUtils (from `../node_modules/expo-json-utils/ios`)
  - EXManifests (from `../node_modules/expo-manifests/ios`)
  - EXNotifications (from `../node_modules/expo-notifications/ios`)
  - Expo (from `../node_modules/expo`)
  - expo-dev-client (from `../node_modules/expo-dev-client/ios`)
  - expo-dev-launcher (from `../node_modules/expo-dev-launcher`)
  - expo-dev-menu (from `../node_modules/expo-dev-menu`)
  - expo-dev-menu-interface (from `../node_modules/expo-dev-menu-interface/ios`)
  - ExpoAppleAuthentication (from `../node_modules/expo-apple-authentication/ios`)
  - ExpoAsset (from `../node_modules/expo-asset/ios`)
  - ExpoBlur (from `../node_modules/expo-blur/ios`)
  - ExpoCrypto (from `../node_modules/expo-crypto/ios`)
  - ExpoFileSystem (from `../node_modules/expo/node_modules/expo-file-system/ios`)
  - ExpoFont (from `../node_modules/expo-font/ios`)
  - ExpoGlassEffect (from `../node_modules/expo-glass-effect/ios`)
  - ExpoImageManipulator (from `../node_modules/expo-image-manipulator/ios`)
  - ExpoImagePicker (from `../node_modules/expo-image-picker/ios`)
  - ExpoKeepAwake (from `../node_modules/expo/node_modules/expo-keep-awake/ios`)
  - ExpoLinearGradient (from `../node_modules/expo-linear-gradient/ios`)
  - ExpoLinking (from `../node_modules/expo-linking/ios`)
  - ExpoLocation (from `../node_modules/expo-location/ios`)
  - ExpoModulesCore (from `../node_modules/expo-modules-core`)
  - ExpoWebBrowser (from `../node_modules/expo-web-browser/ios`)
  - EXTaskManager (from `../node_modules/expo-task-manager/ios`)
  - EXUpdatesInterface (from `../node_modules/expo-updates-interface/ios`)
  - FBLazyVector (from `../node_modules/react-native/Libraries/FBLazyVector`)
  - hermes-engine (from `../node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec`)
  - RCTDeprecation (from `../node_modules/react-native/ReactApple/Libraries/RCTFoundation/RCTDeprecation`)
  - RCTRequired (from `../node_modules/react-native/Libraries/Required`)
  - RCTTypeSafety (from `../node_modules/react-native/Libraries/TypeSafety`)
  - React (from `../node_modules/react-native/`)
  - React-callinvoker (from `../node_modules/react-native/ReactCommon/callinvoker`)
  - React-Core (from `../node_modules/react-native/`)
  - React-Core-prebuilt (from `../node_modules/react-native/React-Core-prebuilt.podspec`)
  - React-Core/RCTWebSocket (from `../node_modules/react-native/`)
  - React-CoreModules (from `../node_modules/react-native/React/CoreModules`)
  - React-cxxreact (from `../node_modules/react-native/ReactCommon/cxxreact`)
  - React-debug (from `../node_modules/react-native/ReactCommon/react/debug`)
  - React-defaultsnativemodule (from `../node_modules/react-native/ReactCommon/react/nativemodule/defaults`)
  - React-domnativemodule (from `../node_modules/react-native/ReactCommon/react/nativemodule/dom`)
  - React-Fabric (from `../node_modules/react-native/ReactCommon`)
  - React-FabricComponents (from `../node_modules/react-native/ReactCommon`)
  - React-FabricImage (from `../node_modules/react-native/ReactCommon`)
  - React-featureflags (from `../node_modules/react-native/ReactCommon/react/featureflags`)
  - React-featureflagsnativemodule (from `../node_modules/react-native/ReactCommon/react/nativemodule/featureflags`)
  - React-graphics (from `../node_modules/react-native/ReactCommon/react/renderer/graphics`)
  - React-hermes (from `../node_modules/react-native/ReactCommon/hermes`)
  - React-idlecallbacksnativemodule (from `../node_modules/react-native/ReactCommon/react/nativemodule/idlecallbacks`)
  - React-ImageManager (from `../node_modules/react-native/ReactCommon/react/renderer/imagemanager/platform/ios`)
  - React-jserrorhandler (from `../node_modules/react-native/ReactCommon/jserrorhandler`)
  - React-jsi (from `../node_modules/react-native/ReactCommon/jsi`)
  - React-jsiexecutor (from `../node_modules/react-native/ReactCommon/jsiexecutor`)
  - React-jsinspector (from `../node_modules/react-native/ReactCommon/jsinspector-modern`)
  - React-jsinspectorcdp (from `../node_modules/react-native/ReactCommon/jsinspector-modern/cdp`)
  - React-jsinspectornetwork (from `../node_modules/react-native/ReactCommon/jsinspector-modern/network`)
  - React-jsinspectortracing (from `../node_modules/react-native/ReactCommon/jsinspector-modern/tracing`)
  - React-jsitooling (from `../node_modules/react-native/ReactCommon/jsitooling`)
  - React-jsitracing (from `../node_modules/react-native/ReactCommon/hermes/executor/`)
  - React-logger (from `../node_modules/react-native/ReactCommon/logger`)
  - React-Mapbuffer (from `../node_modules/react-native/ReactCommon`)
  - React-microtasksnativemodule (from `../node_modules/react-native/ReactCommon/react/nativemodule/microtasks`)
  - react-native-safe-area-context (from `../node_modules/react-native-safe-area-context`)
  - React-NativeModulesApple (from `../node_modules/react-native/ReactCommon/react/nativemodule/core/platform/ios`)
  - React-oscompat (from `../node_modules/react-native/ReactCommon/oscompat`)
  - React-perflogger (from `../node_modules/react-native/ReactCommon/reactperflogger`)
  - React-performancetimeline (from `../node_modules/react-native/ReactCommon/react/performance/timeline`)
  - React-RCTActionSheet (from `../node_modules/react-native/Libraries/ActionSheetIOS`)
  - React-RCTAnimation (from `../node_modules/react-native/Libraries/NativeAnimation`)
  - React-RCTAppDelegate (from `../node_modules/react-native/Libraries/AppDelegate`)
  - React-RCTBlob (from `../node_modules/react-native/Libraries/Blob`)
  - React-RCTFabric (from `../node_modules/react-native/React`)
  - React-RCTFBReactNativeSpec (from `../node_modules/react-native/React`)
  - React-RCTImage (from `../node_modules/react-native/Libraries/Image`)
  - React-RCTLinking (from `../node_modules/react-native/Libraries/LinkingIOS`)
  - React-RCTNetwork (from `../node_modules/react-native/Libraries/Network`)
  - React-RCTRuntime (from `../node_modules/react-native/React/Runtime`)
  - React-RCTSettings (from `../node_modules/react-native/Libraries/Settings`)
  - React-RCTText (from `../node_modules/react-native/Libraries/Text`)
  - React-RCTVibration (from `../node_modules/react-native/Libraries/Vibration`)
  - React-rendererconsistency (from `../node_modules/react-native/ReactCommon/react/renderer/consistency`)
  - React-renderercss (from `../node_modules/react-native/ReactCommon/react/renderer/css`)
  - React-rendererdebug (from `../node_modules/react-native/ReactCommon/react/renderer/debug`)
  - React-RuntimeApple (from `../node_modules/react-native/ReactCommon/react/runtime/platform/ios`)
  - React-RuntimeCore (from `../node_modules/react-native/ReactCommon/react/runtime`)
  - React-runtimeexecutor (from `../node_modules/react-native/ReactCommon/runtimeexecutor`)
  - React-RuntimeHermes (from `../node_modules/react-native/ReactCommon/react/runtime`)
  - React-runtimescheduler (from `../node_modules/react-native/ReactCommon/react/renderer/runtimescheduler`)
  - React-timing (from `../node_modules/react-native/ReactCommon/react/timing`)
  - React-utils (from `../node_modules/react-native/ReactCommon/react/utils`)
  - ReactAppDependencyProvider (from `build/generated/ios`)
  - ReactCodegen (from `build/generated/ios`)
  - ReactCommon/turbomodule/core (from `../node_modules/react-native/ReactCommon`)
  - ReactNativeDependencies (from `../node_modules/react-native/third-party-podspecs/ReactNativeDependencies.podspec`)
  - "RNCAsyncStorage (from `../node_modules/@react-native-async-storage/async-storage`)"
  - "rnmapbox-maps (from `../node_modules/@rnmapbox/maps`)"
  - RNSVG (from `../node_modules/react-native-svg`)
  - UMAppLoader (from `../node_modules/unimodules-app-loader/ios`)
  - Yoga (from `../node_modules/react-native/ReactCommon/yoga`)

SPEC REPOS:
  trunk:
    - libwebp
    - MapboxCommon
    - MapboxCoreMaps
    - MapboxMaps
    - SDWebImage
    - SDWebImageWebPCoder
    - Turf

EXTERNAL SOURCES:
  EXApplication:
    :path: "../node_modules/expo-application/ios"
  EXConstants:
    :path: "../node_modules/expo-constants/ios"
  EXImageLoader:
    :path: "../node_modules/expo-image-loader/ios"
  EXJSONUtils:
    :path: "../node_modules/expo-json-utils/ios"
  EXManifests:
    :path: "../node_modules/expo-manifests/ios"
  EXNotifications:
    :path: "../node_modules/expo-notifications/ios"
  Expo:
    :path: "../node_modules/expo"
  expo-dev-client:
    :path: "../node_modules/expo-dev-client/ios"
  expo-dev-launcher:
    :path: "../node_modules/expo-dev-launcher"
  expo-dev-menu:
    :path: "../node_modules/expo-dev-menu"
  expo-dev-menu-interface:
    :path: "../node_modules/expo-dev-menu-interface/ios"
  ExpoAppleAuthentication:
    :path: "../node_modules/expo-apple-authentication/ios"
  ExpoAsset:
    :path: "../node_modules/expo-asset/ios"
  ExpoBlur:
    :path: "../node_modules/expo-blur/ios"
  ExpoCrypto:
    :path: "../node_modules/expo-crypto/ios"
  ExpoFileSystem:
    :path: "../node_modules/expo/node_modules/expo-file-system/ios"
  ExpoFont:
    :path: "../node_modules/expo-font/ios"
  ExpoGlassEffect:
    :path: "../node_modules/expo-glass-effect/ios"
  ExpoImageManipulator:
    :path: "../node_modules/expo-image-manipulator/ios"
  ExpoImagePicker:
    :path: "../node_modules/expo-image-picker/ios"
  ExpoKeepAwake:
    :path: "../node_modules/expo/node_modules/expo-keep-awake/ios"
  ExpoLinearGradient:
    :path: "../node_modules/expo-linear-gradient/ios"
  ExpoLinking:
    :path: "../node_modules/expo-linking/ios"
  ExpoLocation:
    :path: "../node_modules/expo-location/ios"
  ExpoModulesCore:
    :path: "../node_modules/expo-modules-core"
  ExpoWebBrowser:
    :path: "../node_modules/expo-web-browser/ios"
  EXTaskManager:
    :path: "../node_modules/expo-task-manager/ios"
  EXUpdatesInterface:
    :path: "../node_modules/expo-updates-interface/ios"
  FBLazyVector:
    :path: "../node_modules/react-native/Libraries/FBLazyVector"
  hermes-engine:
    :podspec: "../node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec"
    :tag: hermes-2025-07-07-RNv0.81.0-e0fc67142ec0763c6b6153ca2bf96df815539782
  RCTDeprecation:
    :path: "../node_modules/react-native/ReactApple/Libraries/RCTFoundation/RCTDeprecation"
  RCTRequired:
    :path: "../node_modules/react-native/Libraries/Required"
  RCTTypeSafety:
    :path: "../node_modules/react-native/Libraries/TypeSafety"
  React:
    :path: "../node_modules/react-native/"
  React-callinvoker:
    :path: "../node_modules/react-native/ReactCommon/callinvoker"
  React-Core:
    :path: "../node_modules/react-native/"
  React-Core-prebuilt:
    :podspec: "../node_modules/react-native/React-Core-prebuilt.podspec"
  React-CoreModules:
    :path: "../node_modules/react-native/React/CoreModules"
  React-cxxreact:
    :path: "../node_modules/react-native/ReactCommon/cxxreact"
  React-debug:
    :path: "../node_modules/react-native/ReactCommon/react/debug"
  React-defaultsnativemodule:
    :path: "../node_modules/react-native/ReactCommon/react/nativemodule/defaults"
  React-domnativemodule:
    :path: "../node_modules/react-native/ReactCommon/react/nativemodule/dom"
  React-Fabric:
    :path: "../node_modules/react-native/ReactCommon"
  React-FabricComponents:
    :path: "../node_modules/react-native/ReactCommon"
  React-FabricImage:
    :path: "../node_modules/react-native/ReactCommon"
  React-featureflags:
    :path: "../node_modules/react-native/ReactCommon/react/featureflags"
  React-featureflagsnativemodule:
    :path: "../node_modules/react-native/ReactCommon/react/nativemodule/featureflags"
  React-graphics:
    :path: "../node_modules/react-native/ReactCommon/react/renderer/graphics"
  React-hermes:
    :path: "../node_modules/react-native/ReactCommon/hermes"
  React-idlecallbacksnativemodule:
    :path: "../node_modules/react-native/ReactCommon/react/nativemodule/idlecallbacks"
  React-ImageManager:
    :path: "../node_modules/react-native/ReactCommon/react/renderer/imagemanager/platform/ios"
  React-jserrorhandler:
    :path: "../node_modules/react-native/ReactCommon/jserrorhandler"
  React-jsi:
    :path: "../node_modules/react-native/ReactCommon/jsi"
  React-jsiexecutor:
    :path: "../node_modules/react-native/ReactCommon/jsiexecutor"
  React-jsinspector:
    :path: "../node_modules/react-native/ReactCommon/jsinspector-modern"
  React-jsinspectorcdp:
    :path: "../node_modules/react-native/ReactCommon/jsinspector-modern/cdp"
  React-jsinspectornetwork:
    :path: "../node_modules/react-native/ReactCommon/jsinspector-modern/network"
  React-jsinspectortracing:
    :path: "../node_modules/react-native/ReactCommon/jsinspector-modern/tracing"
  React-jsitooling:
    :path: "../node_modules/react-native/ReactCommon/jsitooling"
  React-jsitracing:
    :path: "../node_modules/react-native/ReactCommon/hermes/executor/"
  React-logger:
    :path: "../node_modules/react-native/ReactCommon/logger"
  React-Mapbuffer:
    :path: "../node_modules/react-native/ReactCommon"
  React-microtasksnativemodule:
    :path: "../node_modules/react-native/ReactCommon/react/nativemodule/microtasks"
  react-native-safe-area-context:
    :path: "../node_modules/react-native-safe-area-context"
  React-NativeModulesApple:
    :path: "../node_modules/react-native/ReactCommon/react/nativemodule/core/platform/ios"
  React-oscompat:
    :path: "../node_modules/react-native/ReactCommon/oscompat"
  React-perflogger:
    :path: "../node_modules/react-native/ReactCommon/reactperflogger"
  React-performancetimeline:
    :path: "../node_modules/react-native/ReactCommon/react/performance/timeline"
  React-RCTActionSheet:
    :path: "../node_modules/react-native/Libraries/ActionSheetIOS"
  React-RCTAnimation:
    :path: "../node_modules/react-native/Libraries/NativeAnimation"
  React-RCTAppDelegate:
    :path: "../node_modules/react-native/Libraries/AppDelegate"
  React-RCTBlob:
    :path: "../node_modules/react-native/Libraries/Blob"
  React-RCTFabric:
    :path: "../node_modules/react-native/React"
  React-RCTFBReactNativeSpec:
    :path: "../node_modules/react-native/React"
  React-RCTImage:
    :path: "../node_modules/react-native/Libraries/Image"
  React-RCTLinking:
    :path: "../node_modules/react-native/Libraries/LinkingIOS"
  React-RCTNetwork:
    :path: "../node_modules/react-native/Libraries/Network"
  React-RCTRuntime:
    :path: "../node_modules/react-native/React/Runtime"
  React-RCTSettings:
    :path: "../node_modules/react-native/Libraries/Settings"
  React-RCTText:
    :path: "../node_modules/react-native/Libraries/Text"
  React-RCTVibration:
    :path: "../node_modules/react-native/Libraries/Vibration"
  React-rendererconsistency:
    :path: "../node_modules/react-native/ReactCommon/react/renderer/consistency"
  React-renderercss:
    :path: "../node_modules/react-native/ReactCommon/react/renderer/css"
  React-rendererdebug:
    :path: "../node_modules/react-native/ReactCommon/react/renderer/debug"
  React-RuntimeApple:
    :path: "../node_modules/react-native/ReactCommon/react/runtime/platform/ios"
  React-RuntimeCore:
    :path: "../node_modules/react-native/ReactCommon/react/runtime"
  React-runtimeexecutor:
    :path: "../node_modules/react-native/ReactCommon/runtimeexecutor"
  React-RuntimeHermes:
    :path: "../node_modules/react-native/ReactCommon/react/runtime"
  React-runtimescheduler:
    :path: "../node_modules/react-native/ReactCommon/react/renderer/runtimescheduler"
  React-timing:
    :path: "../node_modules/react-native/ReactCommon/react/timing"
  React-utils:
    :path: "../node_modules/react-native/ReactCommon/react/utils"
  ReactAppDependencyProvider:
    :path: build/generated/ios
  ReactCodegen:
    :path: build/generated/ios
  ReactCommon:
    :path: "../node_modules/react-native/ReactCommon"
  ReactNativeDependencies:
    :podspec: "../node_modules/react-native/third-party-podspecs/ReactNativeDependencies.podspec"
  RNCAsyncStorage:
    :path: "../node_modules/@react-native-async-storage/async-storage"
  rnmapbox-maps:
    :path: "../node_modules/@rnmapbox/maps"
  RNSVG:
    :path: "../node_modules/react-native-svg"
  UMAppLoader:
    :path: "../node_modules/unimodules-app-loader/ios"
  Yoga:
    :path: "../node_modules/react-native/ReactCommon/yoga"

SPEC CHECKSUMS:
  EXApplication: 1e98d4b1dccdf30627f92917f4b2c5a53c330e5f
  EXConstants: 18ac927605517285307ea8f7ffe6fe7ca538eb5d
  EXImageLoader: 189e3476581efe3ad4d1d3fb4735b7179eb26f05
  EXJSONUtils: 1d3e4590438c3ee593684186007028a14b3686cd
  EXManifests: 378c7742de02a8605093b1c82b5774d8f9875cec
  EXNotifications: c67e92b9fdfe785ff9dbdc5f4c0ff935de357da7
  Expo: 3ccbb4de93972b9a8214b8853ab0c4d4a317e62b
  expo-dev-client: b8adef5e6847b5335a3b95a1fd2edc731d4331ee
  expo-dev-launcher: 62424c01202c528a0421e5736c7cba2aa95312b6
  expo-dev-menu: ffb77acaa6a91d260780ab72a7d236ece882c787
  expo-dev-menu-interface: 600df12ea01efecdd822daaf13cc0ac091775533
  ExpoAppleAuthentication: 9413ae9a5e631a424cc04c1b13b0694dbab7d594
  ExpoAsset: 9e5a7c9c0a9fb83ad5b2bb365141f2bd7f289b66
  ExpoBlur: b90747a3f22a8b6ceffd9cb0dc41a4184efdc656
  ExpoCrypto: e2a2c4c748aac8485e5675f027b7901f511d43ff
  ExpoFileSystem: 8e87545aef1d8d31f244edbfdd0780df4e5bac2e
  ExpoFont: dfb7c572372b610da45b41e3b436321fd6a97215
  ExpoGlassEffect: 2fd78765fb4633fc2575779a521ca6adb3488881
  ExpoImageManipulator: 607a5c8c88085381639458a46cc55fb9d3869148
  ExpoImagePicker: ade85e148f735fc7e6f27dfe3eef28eb3887e90a
  ExpoKeepAwake: 55f75eca6499bb9e4231ebad6f3e9cb8f99c0296
  ExpoLinearGradient: 809102bdb979f590083af49f7fa4805cd931bd58
  ExpoLinking: 2ef632ad5013e3f1568fae9408d56ab9af5efc55
  ExpoLocation: d5b61cb4970fa982e39ca94246a206a0c3b812ca
  ExpoModulesCore: 9e6a5514828e7dd5ded9e99d33557be2d284e660
  ExpoWebBrowser: 970dd4c64c29c955c3af664c8058ba768a4c9187
  EXTaskManager: 6f1a66e4c8cc6df6e24c3d90928704bc3013eae5
  EXUpdatesInterface: 5adf50cb41e079c861da6d9b4b954c3db9a50734
  FBLazyVector: e95a291ad2dadb88e42b06e0c5fb8262de53ec12
  hermes-engine: 9f4dfe93326146a1c99eb535b1cb0b857a3cd172
  libwebp: af5937a13536ef73f3784d69cc342b98961acf33
  MapboxCommon: d006256c4643860a7b3046af45d1671569b6c5ac
  MapboxCoreMaps: de1a4461d0ab5d65d907f06e8d82fdbe06bb3213
  MapboxMaps: 22340ae0e0d47b2e4761019b1d6c569ab04e088d
  RCTDeprecation: 943572d4be82d480a48f4884f670135ae30bf990
  RCTRequired: 8f3cfc90cc25cf6e420ddb3e7caaaabc57df6043
  RCTTypeSafety: 16a4144ca3f959583ab019b57d5633df10b5e97c
  React: 914f8695f9bf38e6418228c2ffb70021e559f92f
  React-callinvoker: 1c0808402aee0c6d4a0d8e7220ce6547af9fba71
  React-Core: c61410ef0ca6055e204a963992e363227e0fd1c5
  React-Core-prebuilt: 02f0ad625ddd47463c009c2d0c5dd35c0d982599
  React-CoreModules: 1f6d1744b5f9f2ec684a4bb5ced25370f87e5382
  React-cxxreact: 3af79478e8187b63ffc22b794cd42d3fc1f1f2da
  React-debug: 6328c2228e268846161f10082e80dc69eac2e90a
  React-defaultsnativemodule: d635ef36d755321e5d6fc065bd166b2c5a0e9833
  React-domnativemodule: dd28f6d96cd21236e020be2eff6fe0b7d4ec3b66
  React-Fabric: 2e32c3fdbb1fbcf5fde54607e3abe453c6652ce2
  React-FabricComponents: 5ed0cdb81f6b91656cb4d3be432feaa28a58071a
  React-FabricImage: 2bc714f818cb24e454f5d3961864373271b2faf8
  React-featureflags: 847642f41fa71ad4eec5e0351badebcad4fe6171
  React-featureflagsnativemodule: c868a544b2c626fa337bcbd364b1befe749f0d3f
  React-graphics: 192ec701def5b3f2a07db2814dfba5a44986cff6
  React-hermes: e875778b496c86d07ab2ccaa36a9505d248a254b
  React-idlecallbacksnativemodule: 4d57965cdf82c14ee3b337189836cd8491632b76
  React-ImageManager: bd0b99e370b13de82c9cd15f0f08144ff3de079e
  React-jserrorhandler: a2fdef4cbcfdcdf3fa9f5d1f7190f7fd4535248d
  React-jsi: 89d43d1e7d4d0663f8ba67e0b39eb4e4672c27de
  React-jsiexecutor: abe4874aaab90dfee5dec480680220b2f8af07e3
  React-jsinspector: a0b3e051aef842b0b2be2353790ae2b2a5a65a8f
  React-jsinspectorcdp: 6346013b2247c6263fbf5199adf4a8751e53bd89
  React-jsinspectornetwork: 26281aa50d49fc1ec93abf981d934698fa95714f
  React-jsinspectortracing: 55eedf6d57540507570259a778663b90060bbd6e
  React-jsitooling: 0e001113fa56d8498aa8ac28437ac0d36348e51a
  React-jsitracing: b713793eb8a5bbc4d86a84e9d9e5023c0f58cbaf
  React-logger: 50fdb9a8236da90c0b1072da5c32ee03aeb5bf28
  React-Mapbuffer: 9050ee10c19f4f7fca8963d0211b2854d624973e
  React-microtasksnativemodule: f775db9e991c6f3b8ccbc02bfcde22770f96e23b
  react-native-safe-area-context: eb2fb5c796f18a08959ee5400bb1c65e4c1b4833
  React-NativeModulesApple: 8969913947d5b576de4ed371a939455a8daf28aa
  React-oscompat: ce47230ed20185e91de62d8c6d139ae61763d09c
  React-perflogger: 02b010e665772c7dcb859d85d44c1bfc5ac7c0e4
  React-performancetimeline: 130db956b5a83aa4fb41ddf5ae68da89f3fb1526
  React-RCTActionSheet: 0b14875b3963e9124a5a29a45bd1b22df8803916
  React-RCTAnimation: a7b90fd2af7bb9c084428867445a1481a8cb112e
  React-RCTAppDelegate: 3262bedd01263f140ec62b7989f4355f57cec016
  React-RCTBlob: c17531368702f1ebed5d0ada75a7cf5915072a53
  React-RCTFabric: 6409edd8cfdc3133b6cc75636d3b858fdb1d11ea
  React-RCTFBReactNativeSpec: c004b27b4fa3bd85878ad2cf53de3bbec85da797
  React-RCTImage: c68078a120d0123f4f07a5ac77bea3bb10242f32
  React-RCTLinking: cf8f9391fe7fe471f96da3a5f0435235eca18c5b
  React-RCTNetwork: ca31f7c879355760c2d9832a06ee35f517938a20
  React-RCTRuntime: a6cf4a1e42754fc87f493e538f2ac6b820e45418
  React-RCTSettings: e0e140b2ff4bf86d34e9637f6316848fc00be035
  React-RCTText: 75915bace6f7877c03a840cc7b6c622fb62bfa6b
  React-RCTVibration: 25f26b85e5e432bb3c256f8b384f9269e9529f25
  React-rendererconsistency: 2dac03f448ff337235fd5820b10f81633328870d
  React-renderercss: 477da167bb96b5ac86d30c5d295412fb853f5453
  React-rendererdebug: 2a1798c6f3ef5f22d466df24c33653edbabb5b89
  React-RuntimeApple: 28cf4d8eb18432f6a21abbed7d801ab7f6b6f0b4
  React-RuntimeCore: 41bf0fd56a00de5660f222415af49879fa49c4f0
  React-runtimeexecutor: 1afb774dde3011348e8334be69d2f57a359ea43e
  React-RuntimeHermes: f3b158ea40e8212b1a723a68b4315e7a495c5fc6
  React-runtimescheduler: 3e1e2bec7300bae512533107d8e54c6e5c63fe0f
  React-timing: 6fa9883de2e41791e5dc4ec404e5e37f3f50e801
  React-utils: 6e2035b53d087927768649a11a26c4e092448e34
  ReactAppDependencyProvider: 1bcd3527ac0390a1c898c114f81ff954be35ed79
  ReactCodegen: 7d4593f7591f002d137fe40cef3f6c11f13c88cc
  ReactCommon: 08810150b1206cc44aecf5f6ae19af32f29151a8
  ReactNativeDependencies: 71ce9c28beb282aa720ea7b46980fff9669f428a
  RNCAsyncStorage: 3a4f5e2777dae1688b781a487923a08569e27fe4
  rnmapbox-maps: 20f4952d4694e1224b578fe4708b9d8047a08cba
  RNSVG: 31d6639663c249b7d5abc9728dde2041eb2a3c34
  SDWebImage: e9fc87c1aab89a8ab1bbd74eba378c6f53be8abf
  SDWebImageWebPCoder: 0e06e365080397465cc73a7a9b472d8a3bd0f377
  Turf: c9eb11a65d96af58cac523460fd40fec5061b081
  UMAppLoader: 145337733539f9af9b3dd97eeaa7f3bd97cacb23
  Yoga: 5934998fbeaef7845dbf698f698518695ab4cd1a

PODFILE CHECKSUM: 94eaf19e631b90584a0aaf5a2f1e4afb21969ef3

COCOAPODS: 1.17.0

````

## src/app/LeftApp.tsx

````tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, BackHandler, Linking, Platform, RefreshControl, ScrollView, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import type { Session } from "@supabase/supabase-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackgroundWaveLayer } from "../components/left/BackgroundWaveLayer";
import { LeftRefreshIndicator } from "../components/left/LeftRefreshIndicator";
import { SessionFooterNav } from "../components/left/navigation";
import { AppDialog } from "../components/left/ui";
import {
  SESSION_NAV_SCREENS,
  defaultApproachPrompt,
  defaultProfilePrompt,
  getFooterDestination,
  type FooterDestination,
  type Screen,
  type UserProfileRow,
} from "./leftConfig";
import { styles } from "./leftTheme";
import { supabase } from "../lib/supabase";
import { EMPTY_NEARBY_FEED, INITIAL_VENUE_SUMMARY } from "./initialState";
import type {
  AppUser,
  ApproachAttempt,
  AvatarStyle,
  NearbyFeedItem,
  ReportCategory,
  SocialInteractionEventType,
  VenueActivityEnvelope,
  VenueExperience,
  VenueType,
  VenueContextSummary,
} from "../types/left-domain";
import { AuthScreen } from "../screens/left/AuthScreen";
import { LegalScreen } from "../screens/left/LegalScreen";
import { LoadingScreen } from "../screens/left/LoadingScreen";
import { PreAuthOnboardingScreen } from "../screens/left/PreAuthOnboardingScreen";
import {
  NameScreen,
  LegalAcknowledgementScreen,
  LocationScreen,
  NotificationScreen,
} from "../screens/left/OnboardingScreens";
import { VenueScreen } from "../screens/left/VenueScreen";
import { HomeScreen } from "../screens/left/HomeScreen";
import { ActivationScreen } from "../screens/left/ActivationScreen";
import { FeedScreen } from "../screens/left/FeedScreen";
import { ProfileScreen } from "../screens/left/ProfileScreen";
import { ApproachScreen } from "../screens/left/ApproachScreen";
import { ApproachFeedbackPrompt } from "../screens/left/ApproachFeedbackPrompt";
import { SafetyScreen } from "../screens/left/SafetyScreen";
import { SettingsScreen } from "../screens/left/SettingsScreen";
import { MeScreen } from "../screens/left/MeScreen";
import { VenueAddScreen, VenueSelectionScreen } from "../screens/left/VenueSelectionScreen";
import { VenueDetailScreen } from "../screens/left/VenueDetailScreen";
import { ExperienceDetailScreen } from "../screens/left/ExperienceDetailScreen";
import { ExperienceCreateScreen } from "../screens/left/ExperienceCreateScreen";
import { SavedPlacesScreen } from "../screens/left/SavedPlacesScreen";
import {
  consumePendingActivationLaunch,
  handleVenuePromptResponse,
  loadLastActivationDefaults,
  primeLocationFix,
  requestNotificationAccess,
  requestLocationAccess,
  saveLastActivationDefaults,
  selectNearbyVenue,
  setVenueHidden as persistVenueHidden,
  setVenueMuted,
  syncLocationRegistrationState,
} from "../features/location/location-service";
import {
  getLocationRuntimeState,
  getVenueApproachPrompts,
  getVenuePreferences,
  saveVenuePreferences,
  type RuntimeCoords,
  type RuntimeVenueCandidate,
  type VenueApproachPrompt,
  type VenuePreference,
} from "../features/location/location-storage";
import {
  getVenueConfidenceCopy,
  getVenueConfidenceLabel,
  resolveVenueConfidence,
} from "../features/location/venue-confidence";
import {
  fetchVenuePreferencesForUser,
  upsertVenuePreferenceForUser,
} from "../features/location/venue-preference-service";
import {
  fetchUserProfile,
  hasAcceptedLegalVersions,
  recordLegalAcceptance,
  submitIdentityRemovalRequest,
  updateUserSettings,
  upsertOnboardingProfile,
} from "../features/account/account-service";
import {
  fetchPublishedExperiences,
  fetchSavedVenues,
  setExperienceAttendance,
  setVenueSaved,
  submitExperienceProposal,
  type ExperienceProposalInput,
  type SavedVenueEntry,
} from "../features/discovery/discovery-service";
import { fetchVenuePracticalDetails } from "../features/venues/venue-details-service";
import {
  blockUserForActor,
  createApproachAttempt,
  hideUserForActor,
  markApproachCancelled,
  markApproachConnected,
  markApproachExpired,
  reportUserForActor,
} from "../features/interactions/interaction-service";
import {
  clearPendingApproachFeedback,
  clearStoredActiveApproach,
  getPendingApproachFeedback,
  getStoredActiveApproach,
  savePendingApproachFeedback,
  saveStoredActiveApproach,
  type PendingApproachFeedback,
} from "../features/interactions/approach-feedback-storage";
import {
  createPresenceSession,
  fetchActivePresenceSession,
  fetchNearbyFeed,
  fetchVenueContextSummary,
  updatePresenceSessionEndState,
} from "../features/presence/presence-service";
import {
  hasSeenPreAuthOnboarding,
  markPreAuthOnboardingSeen,
} from "../features/onboarding/pre-auth-storage";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
  type OnboardingDraftStep,
} from "../features/onboarding/onboarding-storage";
import { validateFirstName } from "../features/onboarding/onboarding-validation";
import { getLocationRecoveryMessage } from "../features/onboarding/onboarding-flow";
import {
  CURRENT_LEGAL_VERSIONS,
  legalContentReady,
  type LegalDocumentId,
} from "../features/legal/legal-content";
import { usePopularTimesForVenues } from "../features/activity/use-popular-times";
import { fetchVenueActivity } from "../features/activity/venue-activity-service";
import {
  deriveSocialMomentum,
  fetchSocialMomentumEvents,
  recordSocialInteractionEvent as persistSocialInteractionEvent,
} from "../features/social-momentum/social-momentum-service";
import { createCommunityVenue } from "../features/venues/venue-submission-service";
import {
  getCurrentSession,
  getFirstNameFromSession,
  getProvider,
  getProviderSubject,
  startAppleAuthSession,
  startGoogleAuthSession,
  UnsupportedAuthProviderError,
} from "../features/auth/auth-service";
import { getRemainingSeconds, hasExpired } from "../features/lifecycle/session-lifecycle";

function logAuthDebug(step: string, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[auth] ${step}`, payload);
    return;
  }
  console.info(`[auth] ${step}`);
}

function normalizeVenueName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function describeSaveError(error: unknown, fallback: string) {
  const record = error && typeof error === "object" ? error as { message?: string; code?: string } : null;
  const detail = record?.message?.toLowerCase() ?? "";
  if (detail.includes("row-level security") || record?.code === "42501") return "You don’t have permission to save this profile. Please sign in again and try once more.";
  if (detail.includes("network") || detail.includes("fetch") || detail.includes("timed out")) return "We couldn’t reach the service. Check your connection, then try again.";
  if (detail.includes("duplicate") || record?.code === "23505") return "This profile already exists. Refresh the app and try again.";
  if (detail.includes("violates") || detail.includes("constraint")) return "One of the profile details is not accepted. Review your name and selected interests, then try again.";
  if (record?.message?.trim()) return `${fallback} Reason: ${record.message.trim()}`;
  return fallback;
}

function normalizeVibes(vibes: string[] | null | undefined, fallback = "Open") {
  const values = Array.isArray(vibes)
    ? [...new Set(vibes.map((value) => value.trim()).filter(Boolean))]
    : [];
  return values.length ? values : [fallback];
}

function pickBestNearbyVenueMatch(
  venues: RuntimeVenueCandidate[],
  submittedName: string,
) {
  const normalizedName = normalizeVenueName(submittedName);
  const exactMatches = venues.filter(
    (venue) => normalizeVenueName(venue.name) === normalizedName,
  );
  if (!exactMatches.length) return null;

  return (
    exactMatches.find((venue) => isUuid(venue.id)) ??
    exactMatches[0]
  );
}

function summarizeVenueCandidates(venues: RuntimeVenueCandidate[]) {
  return venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    venueType: venue.venueType ?? "other",
    source: venue.source,
    distanceMeters: venue.distanceMeters ?? null,
    isUuid: isUuid(venue.id),
  }));
}

type VenuePreferenceAction = "hide" | "mute" | "unhide" | "unmute";
type DialogAction = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost" | "destructive";
};
type VenuePreferenceMessage = {
  venueId: string;
  tone: "success" | "error";
  text: string;
};

const REFRESHABLE_SCREENS: Screen[] = ["home", "venue", "venue-detail", "feed", "saved"];

const PRIVATE_VENUE_SUMMARY: VenueContextSummary = {
  venueId: "private",
  venueName: "Visibility off",
  visibleCount: 0,
  energyLevel: "calm",
  activeVibes: [],
  popularIntents: [],
  pulseCopy: "Your venue stays private until you become visible. Turn on visibility to detect your venue and unlock nearby people.",
};

export function LeftApp() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>("loading");
  const [activationReturnScreen, setActivationReturnScreen] = useState<Screen>("home");
  const [safetyReturnScreen, setSafetyReturnScreen] = useState<Screen>("home");
  const [venueFooterDestination, setVenueFooterDestination] = useState<"nearby" | "session">("session");
  const [user, setUser] = useState<AppUser | null>(null);
  const [feed, setFeed] = useState<NearbyFeedItem[]>(EMPTY_NEARBY_FEED);
  const [selectedProfile, setSelectedProfile] = useState<NearbyFeedItem | null>(null);
  const [profileReturnScreen, setProfileReturnScreen] = useState<Screen>("feed");
  const [venueSummary, setVenueSummary] = useState<VenueContextSummary>(INITIAL_VENUE_SUMMARY);
  const [firstNameDraft, setFirstNameDraft] = useState("");
  const [avatarStyleDraft, setAvatarStyleDraft] = useState<AvatarStyle>("geometric");
  const [onboardingInterests, setOnboardingInterests] = useState<string[]>([]);
  const [onboardingUserId, setOnboardingUserId] = useState<string | null>(null);
  const [legalChecks, setLegalChecks] = useState<Record<LegalDocumentId, boolean>>({
    terms: false,
    privacy: false,
    community: false,
  });
  const [activeLegalDocument, setActiveLegalDocument] = useState<LegalDocumentId>("terms");
  const [legalReturnScreen, setLegalReturnScreen] = useState<Screen>("auth");
  const [bootError, setBootError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [onboardingSaveBusy, setOnboardingSaveBusy] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<AppUser["defaultIntent"]>("networking");
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["AI/startups"]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [hintDraft, setHintDraft] = useState("Grey hoodie, corner seat");
  const [approach, setApproach] = useState<ApproachAttempt | null>(null);
  const [activeApproachPrompt, setActiveApproachPrompt] = useState(defaultApproachPrompt);
  const [venueHidden, setVenueHidden] = useState(false);
  const [sessionVisible, setSessionVisible] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<string | null>(null);
  const [sessionNowMs, setSessionNowMs] = useState(() => Date.now());
  const [activePresenceSessionId, setActivePresenceSessionId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [settingsSaveState, setSettingsSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deletionRequestState, setDeletionRequestState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [venuePreferences, setVenuePreferences] = useState<Record<string, VenuePreference>>({});
  const [venuePreferenceAction, setVenuePreferenceAction] = useState<{
    venueId: string;
    action: VenuePreferenceAction;
  } | null>(null);
  const [venuePreferenceMessage, setVenuePreferenceMessage] = useState<VenuePreferenceMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    title: string;
    message: string;
    actions: DialogAction[];
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainScrollRef = useRef<ScrollView>(null);
  const preAuthSeenRef = useRef(false);
  const preAuthReadyRef = useRef(false);
  const activationAttemptRef = useRef(false);
  const [nearbyVenueOptions, setNearbyVenueOptions] = useState<RuntimeVenueCandidate[]>([]);
  const [lastKnownCoords, setLastKnownCoords] = useState<RuntimeCoords | null>(null);
  const [venueSelectionRequired, setVenueSelectionRequired] = useState(false);
  const [venueDraftName, setVenueDraftName] = useState("");
  const [venueDraftAddress, setVenueDraftAddress] = useState("");
  const [venueDraftNotes, setVenueDraftNotes] = useState("");
  const [venueDraftType, setVenueDraftType] = useState<VenueType>("other");
  const [venueDraftPhotoUri, setVenueDraftPhotoUri] = useState<string | null>(null);
  const [venueDraftShowContributor, setVenueDraftShowContributor] = useState(true);
  const [venueDraftSubmitting, setVenueDraftSubmitting] = useState(false);
  const [selectedVenueDetail, setSelectedVenueDetail] = useState<RuntimeVenueCandidate | null>(null);
  const [venueDetailsLoading, setVenueDetailsLoading] = useState(false);
  const [savedVenues, setSavedVenues] = useState<SavedVenueEntry[]>([]);
  const [savingVenueId, setSavingVenueId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<VenueExperience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<VenueExperience | null>(null);
  const [experienceReturnScreen, setExperienceReturnScreen] = useState<Screen>("home");
  const [attendanceBusy, setAttendanceBusy] = useState(false);
  const [experienceProposalBusy, setExperienceProposalBusy] = useState(false);
  const [experienceProposalError, setExperienceProposalError] = useState<string | null>(null);
  const [venuePresenceById, setVenueActivityById] = useState<Record<string, VenueActivityEnvelope>>({});
  const venueActivityById = usePopularTimesForVenues(
    selectedVenueDetail ? [...nearbyVenueOptions, selectedVenueDetail] : nearbyVenueOptions,
    venuePresenceById, !!user,
  );
  const [discoveryRefreshing, setDiscoveryRefreshing] = useState(false);
  const [refreshPullDistance, setRefreshPullDistance] = useState(0);
  const [venueDetailReturnScreen, setVenueDetailReturnScreen] = useState<Screen>("home");
  const [venueApproachPrompts, setVenueApproachPrompts] = useState<Record<string, VenueApproachPrompt>>({});
  const [reportCategory, setReportCategory] = useState<ReportCategory>("unsafe_behavior");
  const [reportNotes, setReportNotes] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [profileAction, setProfileAction] = useState<"hide" | "block" | null>(null);
  const [visibilityAction, setVisibilityAction] = useState<"pause" | "end" | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    setRefreshPullDistance(0);
    return () => cancelAnimationFrame(frame);
  }, [screen]);
  const [socialMomentumEvents, setSocialMomentumEvents] = useState<SocialInteractionEventType[]>([]);
  const [pendingApproachFeedback, setPendingApproachFeedback] = useState<PendingApproachFeedback | null>(null);
  const [feedbackWentOver, setFeedbackWentOver] = useState<boolean | null>(null);
  const [feedbackUsedIcebreaker, setFeedbackUsedIcebreaker] = useState<boolean | null>(null);

  const visibleFeed = useMemo(() => {
    if (!sessionVisible || venueHidden) return [];
    return feed.map((item) => ({ ...item, venueName: venueSummary.venueName }));
  }, [feed, sessionVisible, venueHidden, venueSummary.venueName]);
  const discoveryVenueIdsKey = useMemo(
    () => nearbyVenueOptions.map((venue) => venue.id).filter(isUuid).sort().join(","),
    [nearbyVenueOptions],
  );

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setSavedVenues([]);
      setExperiences([]);
      return;
    }

    let current = true;
    const venueIds = discoveryVenueIdsKey ? discoveryVenueIdsKey.split(",") : [];
    void Promise.all([
      fetchSavedVenues(userId),
      fetchPublishedExperiences(venueIds),
    ]).then(([nextSavedVenues, nextExperiences]) => {
      if (!current) return;
      setSavedVenues(nextSavedVenues);
      setExperiences(nextExperiences);
    });

    return () => {
      current = false;
    };
  }, [discoveryVenueIdsKey, user?.id]);
  const displayVenueSummary = useMemo(() => {
    if (!sessionVisible) return PRIVATE_VENUE_SUMMARY;
    if (venueHidden) {
      return {
        ...venueSummary,
        visibleCount: 0,
        pulseCopy: "This venue is hidden from discovery for now.",
      };
    }
    return venueSummary;
  }, [sessionVisible, venueHidden, venueSummary]);

  const elapsedSessionSeconds = useMemo(() => {
    if (!sessionVisible || !sessionStartedAt) return 0;
    return Math.max(0, Math.floor((sessionNowMs - new Date(sessionStartedAt).getTime()) / 1000));
  }, [sessionNowMs, sessionStartedAt, sessionVisible]);

  const socialMomentum = useMemo(
    () =>
      deriveSocialMomentum({
        sessionVisible,
        elapsedSessionSeconds,
        eventTypes: socialMomentumEvents,
      }),
    [elapsedSessionSeconds, sessionVisible, socialMomentumEvents],
  );
  const approachRemainingSeconds = useMemo(() => {
    if (!approach || approach.status !== "started") return 0;
    return getRemainingSeconds(approach.expiresAt, sessionNowMs);
  }, [approach, sessionNowMs]);

  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2400);
  }

  function showDialog(title: string, message: string, actions?: DialogAction[]) {
    setDialogState({
      title,
      message,
      actions: actions?.length ? actions : [{ label: "OK", variant: "primary" }],
    });
  }

  function dismissDialog() {
    setDialogState(null);
  }

  function openActivationFrom(origin: Screen) {
    setActivationReturnScreen(origin);
    setScreen("activate");
  }

  function openSafetyFrom(origin: Screen) {
    setSafetyReturnScreen(origin);
    setScreen("safety");
  }

  function openLegalDocument(document: LegalDocumentId, origin: Screen) {
    setActiveLegalDocument(document);
    setLegalReturnScreen(origin);
    setScreen("legal");
  }

  function onboardingScreenForStep(step: OnboardingDraftStep): Screen {
    if (step === "avatar") return "onboarding-name";
    if (step === "legal") return "onboarding-legal";
    if (step === "notifications") return "onboarding-notifications";
    if (step === "location") return "onboarding-location";
    if (step === "complete") return "legal-consent";
    return "onboarding-name";
  }

  function onboardingStepForScreen(value: Screen): OnboardingDraftStep | null {
    if (value === "onboarding-name") return "name";
    if (value === "onboarding-legal") return "legal";
    if (value === "onboarding-notifications") return "notifications";
    if (value === "onboarding-location") return "location";
    if (value === "legal-consent") return "complete";
    return null;
  }

  async function persistOnboardingStep(step: OnboardingDraftStep) {
    if (!onboardingUserId) return;
    await saveOnboardingDraft(onboardingUserId, {
      firstName: firstNameDraft,
      avatarStyle: avatarStyleDraft,
      interests: onboardingInterests,
      step,
    });
  }

  function goBackInOnboarding() {
    setAuthError(null);
    setLocationError(null);
    if (screen === "legal-consent") {
      void persistOnboardingStep("location");
      setScreen("onboarding-location");
      return;
    }
    if (screen === "onboarding-location") {
      void persistOnboardingStep("notifications");
      setScreen("onboarding-notifications");
      return;
    }
    if (screen === "onboarding-notifications") {
      void persistOnboardingStep("legal");
      setScreen("onboarding-legal");
      return;
    }
    if (screen === "onboarding-legal") {
      void persistOnboardingStep("name");
      setScreen("onboarding-name");
      return;
    }
    if (screen === "onboarding-name") {
      void persistOnboardingStep("name");
      setScreen("auth");
    }
  }

  function resolveApproachPromptForVenue(venueId: string | null | undefined) {
    if (venueId && venueApproachPrompts[venueId]?.promptText?.trim()) {
      return venueApproachPrompts[venueId].promptText.trim();
    }
    return user?.approachPrompt?.trim() || defaultApproachPrompt;
  }

  function resolveVenueDetailCandidate(candidate?: RuntimeVenueCandidate | null) {
    if (candidate) return candidate;
    return (
      nearbyVenueOptions.find((item) => item.id === venueSummary.venueId) ??
      nearbyVenueOptions.find((item) => item.name === venueSummary.venueName) ??
      (venueSummary.venueName
        ? {
            id: venueSummary.venueId,
            name: venueSummary.venueName,
            venueType: undefined,
            latitude: lastKnownCoords?.latitude ?? 0,
            longitude: lastKnownCoords?.longitude ?? 0,
            radiusMeters: 60,
            source: "local_catalog" as const,
            distanceMeters: 0,
          }
        : null)
    );
  }

  function openVenueDetail(candidate?: RuntimeVenueCandidate | null, origin: Screen = screen) {
    const resolvedCandidate = resolveVenueDetailCandidate(candidate);
    if (!resolvedCandidate) return;
    if (!sessionVisible) {
      showDialog(
        "Go visible to unlock venue details",
        "Venue details and live signals are shared only while you are visible at a venue.",
        [
          { label: "Not now" },
          { label: "Go visible", variant: "primary", onPress: () => openActivationFrom(origin) },
        ],
      );
      return;
    }
    setSelectedVenueDetail(resolvedCandidate);
    setVenueDetailReturnScreen(origin);
    setScreen("venue-detail");
    if (isUuid(resolvedCandidate.id)) {
      setVenueDetailsLoading(true);
      void fetchVenuePracticalDetails(resolvedCandidate.id)
        .then((details) => {
          if (!details) return;
          setSelectedVenueDetail((current) =>
            current?.id === resolvedCandidate.id ? { ...current, ...details } : current,
          );
        })
        .finally(() => setVenueDetailsLoading(false));
    } else {
      setVenueDetailsLoading(false);
    }
  }

  function openSavedVenue(entry: SavedVenueEntry) {
    const nearbyCandidate = nearbyVenueOptions.find((candidate) => candidate.id === entry.venueId);
    openVenueDetail(
      nearbyCandidate ?? {
        id: entry.venueId,
        name: entry.venueName,
        venueType: entry.venueType,
        latitude: 0,
        longitude: 0,
        radiusMeters: 60,
        source: "local_catalog",
        distanceMeters: null,
        formattedAddress: entry.formattedAddress,
      },
      "saved",
    );
  }

  async function toggleSavedVenue(candidate: RuntimeVenueCandidate) {
    if (!user || savingVenueId) return;
    if (!isUuid(candidate.id)) {
      showDialog("Could not save this place", "Left can save a place after it has been confirmed in the venue directory.");
      return;
    }
    const isSaved = savedVenues.some((entry) => entry.venueId === candidate.id);
    setSavingVenueId(candidate.id);
    try {
      const saved = await setVenueSaved(user.id, candidate.id, !isSaved);
      if (!saved) {
        showDialog("Could not update saved places", "Check your connection and try again.");
        return;
      }
      setSavedVenues(await fetchSavedVenues(user.id));
      showToast(isSaved ? "Removed from saved places" : "Place saved");
    } finally {
      setSavingVenueId(null);
    }
  }

  function openExperience(experience: VenueExperience, origin: Screen = screen) {
    setSelectedExperience(experience);
    setExperienceReturnScreen(origin);
    setScreen("experience-detail");
  }

  function openSelectedExperienceVenue() {
    if (!selectedExperience) return;
    const candidate = nearbyVenueOptions.find((venue) => venue.id === selectedExperience.venueId) ?? {
      id: selectedExperience.venueId,
      name: selectedExperience.venueName,
      venueType: "other" as const,
      latitude: 0,
      longitude: 0,
      radiusMeters: 60,
      source: "local_catalog" as const,
      distanceMeters: null,
    };
    openVenueDetail(candidate, "experience-detail");
  }

  async function toggleSelectedExperienceAttendance() {
    if (!selectedExperience || attendanceBusy) return;
    setAttendanceBusy(true);
    try {
      const nextAttending = await setExperienceAttendance(selectedExperience.id, !selectedExperience.viewerAttending);
      if (nextAttending == null) {
        showDialog("Could not update attendance", "This gathering may be full or unavailable. Try again shortly.");
        return;
      }
      const delta = nextAttending ? 1 : -1;
      const updateExperience = (experience: VenueExperience) => experience.id === selectedExperience.id
        ? {
            ...experience,
            viewerAttending: nextAttending,
            attendeeCount: Math.max(0, experience.attendeeCount + delta),
          }
        : experience;
      setExperiences((current) => current.map(updateExperience));
      setSelectedExperience((current) => current ? updateExperience(current) : null);
      showToast(nextAttending ? "You’re going" : "Plans updated");
    } finally {
      setAttendanceBusy(false);
    }
  }

  useEffect(() => {
    void bootstrapSession();
    void bootstrapDeviceState();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session, false).catch((error) => {
        console.warn("[auth] session synchronization failed", error);
        setBootError("We could not restore your account state. Your session is still secure.");
        setScreen("loading");
      });
    });
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void applyNotificationResponse(response);
    });
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      subscription.unsubscribe();
      notificationSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const step = onboardingStepForScreen(screen);
    if (!step || !onboardingUserId) return;
    const timer = setTimeout(() => {
      void saveOnboardingDraft(onboardingUserId, {
        firstName: firstNameDraft,
        avatarStyle: avatarStyleDraft,
        interests: onboardingInterests,
        step,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [screen, firstNameDraft, avatarStyleDraft, onboardingInterests, onboardingUserId]);

  useEffect(() => {
    const isOnboarding = screen.startsWith("onboarding-");
    if (!isOnboarding && screen !== "legal-consent" && screen !== "legal") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isOnboarding) {
        goBackInOnboarding();
      } else if (screen === "legal") {
        setScreen(legalReturnScreen);
      } else {
        void forceLocalSignOut();
      }
      return true;
    });
    return () => subscription.remove();
  }, [
    screen,
    firstNameDraft,
    avatarStyleDraft,
    onboardingUserId,
    legalReturnScreen,
  ]);

  useEffect(() => {
    const destinations: Partial<Record<Screen, Screen>> = {
      "venue-detail": venueDetailReturnScreen,
      "experience-detail": experienceReturnScreen,
      "experience-create": "home",
      saved: "me",
      settings: "me",
      profile: profileReturnScreen,
      "venue-select": sessionVisible ? "venue" : "home",
      "venue-add": "venue-select",
      activate: activationReturnScreen,
      safety: safetyReturnScreen,
    };
    const destination = destinations[screen];
    if (!destination) return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setScreen(destination);
      return true;
    });
    return () => subscription.remove();
  }, [
    activationReturnScreen,
    experienceReturnScreen,
    profileReturnScreen,
    safetyReturnScreen,
    screen,
    sessionVisible,
    venueDetailReturnScreen,
  ]);

  useEffect(() => {
    const shouldMonitorVenueRuntime =
      SESSION_NAV_SCREENS.includes(screen) ||
      screen === "venue-select" ||
      screen === "venue-add";
    if (!shouldMonitorVenueRuntime) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshVenueFromRuntime();
      }
    });
    const interval = setInterval(() => {
      void refreshVenueFromRuntime();
    }, 3000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [screen, sessionVisible, venueSelectionRequired]);

  useEffect(() => {
    if (!user) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void recoverActivePresenceSession(user);
      }
    });
    return () => subscription.remove();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void maybeLaunchFromNotification();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void syncApproachFollowUp(user);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void syncApproachFollowUp(user);
      }
    });
    return () => subscription.remove();
  }, [user]);

  useEffect(() => {
    if (!user || !sessionVisible || !venueSelectionRequired) return;
    if (screen === "venue" || screen === "activate" || screen === "feed") {
      setScreen("venue-select");
    }
  }, [screen, sessionVisible, user, venueSelectionRequired]);

  useEffect(() => {
    if (!sessionVisible || !sessionStartedAt) return;
    const interval = setInterval(() => {
      setSessionNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartedAt, sessionVisible]);

  useEffect(() => {
    if (!sessionVisible || !hasExpired(sessionExpiresAt, sessionNowMs)) return;
    void endSessionState("session_ended", { toastMessage: "Visibility session expired" });
  }, [sessionExpiresAt, sessionNowMs, sessionVisible]);

  useEffect(() => {
    void refreshVenuePreferences();
  }, [venueSummary.venueId]);

  useEffect(() => {
    if (!user || !sessionVisible || !isUuid(user.id) || !isUuid(venueSummary.venueId)) {
      if (!sessionVisible) setFeed([]);
      return;
    }
    void refreshVenueContext(venueSummary.venueId);
    void refreshNearbyFeed(user.id, venueSummary.venueId);
  }, [user?.id, venueSummary.venueId, activePresenceSessionId, sessionVisible]);

  useEffect(() => {
    if (!user ||
      !sessionVisible ||
      !isUuid(user.id) ||
      !isUuid(venueSummary.venueId)
    ) {
      return;
    }

    let disposed = false;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const channel = supabase
      .channel(`venue:${venueSummary.venueId}`, { config: { private: true } })
      .on("broadcast", { event: "presence-changed" }, () => {
        if (refreshTimer) return;
        // Several people can change state in one transaction window; one secured
        // refresh is enough and avoids a request storm.
        refreshTimer = setTimeout(() => {
          refreshTimer = null;
          if (!disposed) {
            void refreshVenueContext(venueSummary.venueId);
            void refreshNearbyFeed(user.id, venueSummary.venueId);
            void refreshVenueActivityForIds([venueSummary.venueId]);
          }
        }, 350);
      });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (disposed || !data.session) return;
      await supabase.realtime.setAuth(data.session.access_token);
      if (!disposed) channel.subscribe();
    });

    return () => {
      disposed = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [user?.id, venueSummary.venueId, sessionVisible]);

  useEffect(() => {
    if (!user) return;
    const venueIds = nearbyVenueOptions
      .map((venue) => venue.id)
      .filter((venueId): venueId is string => isUuid(venueId));
    if (isUuid(venueSummary.venueId)) {
      venueIds.unshift(venueSummary.venueId);
    }
    if (selectedVenueDetail && isUuid(selectedVenueDetail.id)) {
      venueIds.unshift(selectedVenueDetail.id);
    }
    const uniqueVenueIds = Array.from(new Set(venueIds));
    if (!uniqueVenueIds.length) return;
    void refreshVenueActivityForIds(uniqueVenueIds);
    const refresh = () => {
      if (AppState.currentState === "active") void refreshVenueActivityForIds(uniqueVenueIds);
    };
    const subscription = AppState.addEventListener("change", state => { if (state === "active") refresh(); });
    return () => subscription.remove();
  }, [nearbyVenueOptions, venueSummary.venueId, selectedVenueDetail?.id, user?.id]);

  useEffect(() => {
    if (!approach || approach.status !== "started" || approachRemainingSeconds > 0) return;
    void handleApproachWindowElapsed();
  }, [approach, approachRemainingSeconds]);

  useEffect(() => {
    if (!pendingApproachFeedback) {
      setFeedbackWentOver(null);
      setFeedbackUsedIcebreaker(null);
    }
  }, [pendingApproachFeedback]);

  async function bootstrapSession() {
    setBootError(null);
    setScreen("loading");
    try {
      preAuthSeenRef.current = await hasSeenPreAuthOnboarding();
      preAuthReadyRef.current = true;
      const session = await getCurrentSession();
      logAuthDebug("bootstrap session", {
        hasSession: !!session,
        userId: session?.user.id ?? null,
        provider: session?.user.app_metadata.provider ?? null,
      });
      await syncSession(session, true);
    } catch (error) {
      console.warn("[auth] bootstrap failed", error);
      setBootError("Check your connection, then try again.");
      setScreen("loading");
    }
  }

  async function completePreAuthOnboarding() {
    try {
      await markPreAuthOnboardingSeen();
    } catch (error) {
      console.warn("[onboarding] could not persist intro completion", error);
    }
    preAuthSeenRef.current = true;
    setScreen("auth");
  }

  async function bootstrapDeviceState() {
    try {
      const runtime = await syncLocationRegistrationState();
      setLocationEnabled(runtime.permissionGranted);
      const notificationPermission = await Notifications.getPermissionsAsync();
      setNotificationEnabled(notificationPermission.status === "granted");
      if (runtime.permissionGranted) {
        await primeLocationFix();
      }
      await refreshVenueFromRuntime();
      const defaults = await loadLastActivationDefaults();
      if (defaults) {
        setSelectedIntent(defaults.intent);
        setSelectedVibes(normalizeVibes(defaults.vibes));
        setSelectedDuration(defaults.durationMinutes);
        setHintDraft(defaults.hintText);
      }
      setVenueApproachPrompts(await getVenueApproachPrompts());
      await refreshVenuePreferences();
    } catch (error) {
      console.warn("[location] device bootstrap failed", error);
      setLocationEnabled(false);
    }
  }

  async function refreshVenueFromRuntime() {
    const runtime = await getLocationRuntimeState();
    setNearbyVenueOptions(runtime.nearbyVenues);
    setLastKnownCoords(runtime.lastKnownCoords);
    setVenueSelectionRequired(
      runtime.nearbyVenues.length > 0 &&
      !runtime.selectedVenueId &&
      (!runtime.currentVenueId || runtime.nearbyVenues.length > 1),
    );
    if (!runtime.currentVenueId || !runtime.currentVenueName) return;
    const currentVenueId = runtime.currentVenueId;
    const currentVenueName = runtime.currentVenueName;

    setVenueSummary((current) => {
      if (
        current.venueId === currentVenueId &&
        current.venueName === currentVenueName
      ) {
        return current;
      }

      return {
        ...current,
        venueId: currentVenueId,
        venueName: currentVenueName,
        pulseCopy:
          runtime.nearbyVenues.length > 1 && !runtime.selectedVenueId
            ? "We found multiple nearby venues. Confirm yours before going visible."
            : `You're currently at ${currentVenueName}.`,
      };
    });
  }

  async function refreshVenueActivityForIds(venueIds: string[]) {
    const uniqueVenueIds = Array.from(new Set(venueIds.filter((venueId) => isUuid(venueId))));
    if (!uniqueVenueIds.length) return;

    const results = await fetchVenueActivity(uniqueVenueIds);
    if (!results.length) return;

    setVenueActivityById((current) => {
      const next = { ...current };
      for (const result of results) {
        next[result.venueId] = result;
      }
      return next;
    });
  }

  async function refreshDiscoverySurface() {
    if (discoveryRefreshing) return;
    const refreshStartedAt = Date.now();
    setDiscoveryRefreshing(true);
    try {
      if (locationEnabled) {
        await primeLocationFix();
      }
      await refreshVenueFromRuntime();
      const runtime = await getLocationRuntimeState();
      const venueIds = runtime.nearbyVenues.map((venue) => venue.id).filter(isUuid);
      if (selectedVenueDetail && isUuid(selectedVenueDetail.id)) venueIds.unshift(selectedVenueDetail.id);
      const tasks: Promise<unknown>[] = [refreshVenueActivityForIds(venueIds)];

      if (user) {
        tasks.push(
          Promise.all([
            fetchSavedVenues(user.id),
            fetchPublishedExperiences(venueIds),
          ]).then(([nextSavedVenues, nextExperiences]) => {
            setSavedVenues(nextSavedVenues);
            setExperiences(nextExperiences);
          }),
        );
      }

      if (user && sessionVisible && !venueHidden && isUuid(venueSummary.venueId)) {
        tasks.push(
          refreshVenueContext(venueSummary.venueId),
          refreshNearbyFeed(user.id, venueSummary.venueId),
          refreshSocialMomentumEvents(activePresenceSessionId, user.id),
        );
      }

      if (screen === "venue-detail" && selectedVenueDetail && isUuid(selectedVenueDetail.id)) {
        tasks.push(
          fetchVenuePracticalDetails(selectedVenueDetail.id).then((details) => {
            if (!details) return;
            setSelectedVenueDetail((current) =>
              current?.id === selectedVenueDetail.id ? { ...current, ...details } : current,
            );
          }),
        );
      }

      await Promise.all(tasks);
    } catch (error) {
      console.warn("[discovery] pull to refresh failed", error);
      showToast("Couldn’t refresh right now");
    } finally {
      const remainingLoaderTime = 650 - (Date.now() - refreshStartedAt);
      if (remainingLoaderTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingLoaderTime));
      }
      setDiscoveryRefreshing(false);
    }
  }

  async function recoverActivePresenceSession(appUser: AppUser) {
    const activeSession = await fetchActivePresenceSession(appUser.id);
    if (!activeSession) {
      setActivePresenceSessionId(null);
      setSessionVisible(false);
      setSessionStartedAt(null);
      setSessionExpiresAt(null);
      setSocialMomentumEvents([]);
      return false;
    }

    const preferences = await loadVenuePreferences(appUser.id);
    if (preferences[activeSession.venueId]?.hidden) {
      await updatePresenceSessionEndState(activeSession.id, "session_ended");
      setActivePresenceSessionId(null);
      setSessionVisible(false);
      setSessionStartedAt(null);
      setSessionExpiresAt(null);
      setSocialMomentumEvents([]);
      setFeed([]);
      return false;
    }

    setActivePresenceSessionId(activeSession.id);
    await refreshSocialMomentumEvents(activeSession.id, appUser.id);
    setSessionStartedAt(activeSession.startedAt);
    setSessionExpiresAt(activeSession.expiresAt);
    setSessionNowMs(Date.now());
    setSessionVisible(true);
    setSelectedIntent(activeSession.intent);
    setSelectedVibes(normalizeVibes(activeSession.vibes));
    setSelectedDuration(activeSession.durationMinutes);
    setHintDraft(activeSession.hintText ?? "");
    setVenueSummary((current) => ({
      ...current,
      venueId: activeSession.venueId,
      venueName: activeSession.venueName ?? current.venueName,
    }));

    await Promise.all([
      refreshVenueContext(activeSession.venueId),
      refreshNearbyFeed(appUser.id, activeSession.venueId),
    ]);

    return true;
  }

  async function refreshVenueContext(venueId: string) {
    const context = await fetchVenueContextSummary(venueId);
    if (!context) return;

    setVenueSummary(context);
  }

  async function refreshNearbyFeed(userId: string, venueId: string) {
    setFeed(await fetchNearbyFeed(userId, venueId));
  }

  async function refreshSocialMomentumEvents(visibilitySessionId: string | null, actorUserId = user?.id ?? null) {
    if (!isUuid(actorUserId) || !isUuid(visibilitySessionId)) {
      setSocialMomentumEvents([]);
      return;
    }

    setSocialMomentumEvents(await fetchSocialMomentumEvents(actorUserId, visibilitySessionId));
  }

  async function recordSocialInteractionEvent(
    eventType: SocialInteractionEventType,
    options: {
      targetUserId?: string | null;
      visibilitySessionId?: string | null;
      metadata?: Record<string, unknown>;
    } = {},
  ) {
    if (!user || !isUuid(user.id)) return;
    const targetUserId = isUuid(options.targetUserId) ? options.targetUserId : null;
    const visibilitySessionId = isUuid(options.visibilitySessionId) ? options.visibilitySessionId : activePresenceSessionId;
    const venueId = isUuid(venueSummary.venueId) ? venueSummary.venueId : null;

    setSocialMomentumEvents((current) => [...current, eventType]);

    await persistSocialInteractionEvent({
      eventType,
      targetUserId,
      venueId,
      visibilitySessionId,
      metadata: options.metadata,
    });
  }

  async function refreshVenuePreferences() {
    const preferences = await loadVenuePreferences(user?.id ?? null);
    setVenuePreferences(preferences);
    setVenueHidden(!!preferences[venueSummary.venueId]?.hidden);
  }

  async function loadVenuePreferences(userId: string | null) {
    const localPreferences = await getVenuePreferences();
    const serverPreferences = userId ? await fetchVenuePreferencesForUser(userId) : null;
    const mergedPreferences = mergeVenuePreferences(localPreferences, serverPreferences ?? {});
    if (serverPreferences) {
      await saveVenuePreferences(mergedPreferences);
    }
    return mergedPreferences;
  }

  async function syncVenuePreferencesForUser(userId: string) {
    const localPreferences = await getVenuePreferences();
    const serverPreferences = await fetchVenuePreferencesForUser(userId);
    if (!serverPreferences) return localPreferences;

    const mergedPreferences = mergeVenuePreferences(localPreferences, serverPreferences);
    await saveVenuePreferences(mergedPreferences);

    await Promise.all(
      Object.values(mergedPreferences).map(async (preference) => {
        const serverPreference = serverPreferences[preference.venueId];
        if (serverPreference && new Date(serverPreference.updatedAt).getTime() >= new Date(preference.updatedAt).getTime()) {
          return;
        }

        await upsertVenuePreferenceForUser({
          userId,
          venueId: preference.venueId,
          venueName: preference.venueName,
          hidden: preference.hidden,
          muted: preference.muted,
          cooldownUntil: preference.cooldownUntil,
        });
      }),
    );

    return mergedPreferences;
  }

  function mergeVenuePreferences(
    localPreferences: Record<string, VenuePreference>,
    serverPreferences: Record<string, VenuePreference>,
  ) {
    const merged = { ...localPreferences };
    for (const [venueId, serverPreference] of Object.entries(serverPreferences)) {
      const localPreference = merged[venueId];
      if (!localPreference || new Date(serverPreference.updatedAt).getTime() >= new Date(localPreference.updatedAt).getTime()) {
        merged[venueId] = serverPreference;
      }
    }
    return merged;
  }

  async function syncApproachFollowUp(appUser: AppUser) {
    const pending = await getPendingApproachFeedback(appUser.id);
    if (pending) {
      setPendingApproachFeedback(pending);
      return;
    }

    const storedApproach = await getStoredActiveApproach(appUser.id);
    if (!storedApproach) return;
    if (Date.now() < new Date(storedApproach.expiresAt).getTime()) return;

    if (isUuid(storedApproach.approachId)) {
      await markApproachExpired({
        approachId: storedApproach.approachId,
        expiredAt: storedApproach.expiresAt,
      });
    }

    const nextPending: PendingApproachFeedback = {
      userId: storedApproach.userId,
      approachId: storedApproach.approachId,
      targetUserId: storedApproach.targetUserId,
      targetFirstName: storedApproach.targetFirstName,
      presenceSessionId: storedApproach.presenceSessionId,
      approachPrompt: storedApproach.approachPrompt,
      startedAt: storedApproach.startedAt,
      expiresAt: storedApproach.expiresAt,
      createdAt: new Date().toISOString(),
    };

    await savePendingApproachFeedback(nextPending);
    await clearStoredActiveApproach();
    setPendingApproachFeedback(nextPending);
  }

  async function handleApproachWindowElapsed() {
    if (!approach || approach.status !== "started" || !user) return;

    const storedApproach = await getStoredActiveApproach(user.id);
    const nextPending: PendingApproachFeedback | null = storedApproach
      ? {
          userId: storedApproach.userId,
          approachId: storedApproach.approachId,
          targetUserId: storedApproach.targetUserId,
          targetFirstName: storedApproach.targetFirstName,
          presenceSessionId: storedApproach.presenceSessionId,
          approachPrompt: storedApproach.approachPrompt,
          startedAt: storedApproach.startedAt,
          expiresAt: storedApproach.expiresAt,
          createdAt: new Date().toISOString(),
        }
      : selectedProfile
        ? {
            userId: user.id,
            approachId: approach.id,
            targetUserId: selectedProfile.profileUserId,
            targetFirstName: selectedProfile.firstName,
            presenceSessionId: approach.presenceSessionId,
            approachPrompt: resolveApproachPromptForVenue(venueSummary.venueId),
            startedAt: approach.startedAt,
            expiresAt: approach.expiresAt,
            createdAt: new Date().toISOString(),
          }
        : null;

    if (!nextPending) return;

    if (isUuid(approach.id)) {
      await markApproachExpired({
        approachId: approach.id,
        expiredAt: approach.expiresAt,
      });
    }

    await savePendingApproachFeedback(nextPending);
    await clearStoredActiveApproach();
    setApproach((current) => (current ? { ...current, status: "confirmed_going", updatedAt: new Date().toISOString() } : current));
    if (screen === "approach") {
      setScreen("feed");
    }
  }

  async function submitApproachFeedback() {
    if (!pendingApproachFeedback) return;
    if (feedbackWentOver === null) return;
    if (feedbackWentOver === true && feedbackUsedIcebreaker === null) return;

    await clearPendingApproachFeedback();
    setPendingApproachFeedback(null);
    setApproach(null);
    showDialog(
      "Feedback saved",
      feedbackWentOver
        ? feedbackUsedIcebreaker
          ? "Great — noted that you went over and used the icebreaker."
          : "Got it — noted that you went over without using the icebreaker."
        : "Got it — noted that you didn’t end up going over.",
    );
  }

  async function maybeLaunchFromNotification() {
    const shouldLaunch = await consumePendingActivationLaunch();
    if (shouldLaunch) {
      setScreen("activate");
    }
  }

  async function applyNotificationResponse(response: Notifications.NotificationResponse) {
    const result = await handleVenuePromptResponse(response);
    if (result.action === "activate") {
      setScreen("activate");
      return;
    }
    if (result.action === "cooldown") {
      await refreshVenuePreferences();
    }
  }

  async function confirmVenueSelection(venueId: string) {
    const runtime = await getLocationRuntimeState();
    const chosenVenue = runtime.nearbyVenues.find((venue) => venue.id === venueId) ?? null;
    const selected = await selectNearbyVenue(venueId);
    if (!selected) {
      showDialog("Venue unavailable", "That nearby venue is no longer available. Try again from the refreshed list.");
      await refreshVenueFromRuntime();
      return;
    }
    await refreshVenueFromRuntime();
    if (chosenVenue && !isUuid(chosenVenue.id)) {
      setVenueDraftName(chosenVenue.name);
      setVenueDraftAddress("");
      setVenueDraftNotes("");
      setVenueDraftType("other");
      showDialog(
        "Add this venue first",
        `${chosenVenue.name} was detected nearby, but it is not in Left's venue database yet. Add it once before you can go visible there.`,
        [
          { label: "Cancel", onPress: () => setScreen("venue-select") },
          { label: "Add venue", variant: "primary", onPress: () => setScreen("venue-add") },
        ],
      );
      return;
    }
    setScreen(sessionVisible ? "venue" : "activate");
  }

  async function handleVenueDetailPrimaryAction() {
    if (!selectedVenueDetail) return;
    const isCurrentVenue =
      selectedVenueDetail.id === venueSummary.venueId ||
      selectedVenueDetail.name === venueSummary.venueName;

    if (isCurrentVenue) {
      if (sessionVisible) {
        setScreen("feed");
        return;
      }
      openActivationFrom("venue-detail");
      return;
    }

    await confirmVenueSelection(selectedVenueDetail.id);
  }

  async function submitVenueSuggestion() {
    if (!user || !lastKnownCoords) {
      showDialog("Venue location missing", "Move around the venue once so Left has a recent device location.");
      return;
    }
    if (!venueDraftName.trim() || !venueDraftAddress.trim() || !venueDraftPhotoUri) {
      showDialog("Missing venue details", "Add a venue name, address or landmark, and a clear venue photo.");
      return;
    }

    const submittedName = venueDraftName.trim();
    const duplicateVenue = pickBestNearbyVenueMatch(nearbyVenueOptions, submittedName);
    if (duplicateVenue) {
      setVenueDraftSubmitting(false);
      await confirmVenueSelection(duplicateVenue.id);
      showDialog("Venue already exists", `${duplicateVenue.name} is already pinned nearby, so Left reused it instead of creating a duplicate.`);
      return;
    }

    setVenueDraftSubmitting(true);
    const submittedVenue = await createCommunityVenue({
      submittedBy: user.id,
      name: submittedName,
      type: venueDraftType,
      addressText: venueDraftAddress.trim(),
      notes: venueDraftNotes.trim() || null,
      latitude: lastKnownCoords.latitude,
      longitude: lastKnownCoords.longitude,
      showContributor: venueDraftShowContributor,
      photoUri: venueDraftPhotoUri,
    });

    if (!submittedVenue) {
      setVenueDraftSubmitting(false);
      showDialog("Venue submission failed", "We could not submit that venue yet.");
      return;
    }

    setVenueDraftSubmitting(false);
    setVenueDraftName("");
    setVenueDraftAddress("");
    setVenueDraftNotes("");
    setVenueDraftType("other");
    setVenueDraftPhotoUri(null);
    setVenueDraftShowContributor(true);
    await refreshVenueFromRuntime();
    showDialog(
      submittedVenue.created ? "Venue added" : "Venue already exists",
      submittedVenue.created
        ? `${submittedVenue.name} is now available to people nearby.`
        : `${submittedVenue.name} was already in the community venue list, so Left reused it instead of creating a duplicate.`,
      [
        { label: "Done", variant: "primary", onPress: () => setScreen("home") },
      ],
    );
  }

  async function pickVenueDraftPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showDialog("Photo permission needed", "Allow photo access to attach a venue photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) setVenueDraftPhotoUri(result.assets[0].uri);
  }

  async function syncSession(session: Session | null, isInitialLoad: boolean) {
    setAuthError(null);
    logAuthDebug("sync session", {
      hasSession: !!session,
      isInitialLoad,
      userId: session?.user.id ?? null,
      provider: session?.user.app_metadata.provider ?? null,
    });
    if (!session) {
      setUser(null);
      setOnboardingUserId(null);
      setScreen(preAuthReadyRef.current && !preAuthSeenRef.current ? "preauth" : "auth");
      return;
    }

    const inferredFirstName = getFirstNameFromSession(session);
    setFirstNameDraft(inferredFirstName);

    const { profile, error } = await fetchUserProfile(session.user.id);
    if (error) {
      logAuthDebug("profile lookup failed", { message: error.message, code: error.code });
      setBootError("We could not load your profile. Your session is still secure.");
      setScreen("loading");
      return;
    }

    logAuthDebug("profile lookup complete", {
      hasProfile: !!profile,
      identityRemoved: profile?.identity_removed ?? null,
      onboardingCompleted: profile?.onboarding_completed ?? null,
    });
    if (profile?.identity_removed) {
      logAuthDebug("identity removed account detected", { userId: profile.id });
      await forceLocalSignOut();
      setAuthError("This account has been removed.");
      return;
    }
    if (!profile || !profile.onboarding_completed) {
      setUser(null);
      setOnboardingUserId(session.user.id);
      const draft = await loadOnboardingDraft(session.user.id);
      if (draft) {
        setFirstNameDraft(draft.firstName || inferredFirstName);
        setAvatarStyleDraft(draft.avatarStyle);
        setOnboardingInterests(draft.interests);
        setScreen(onboardingScreenForStep(draft.step));
      } else {
        setFirstNameDraft(inferredFirstName);
        setAvatarStyleDraft("geometric");
        setOnboardingInterests([]);
        setScreen("onboarding-name");
      }
      return;
    }

    const appUser = mapProfileToAppUser(profile);
    if (
      legalContentReady &&
      CURRENT_LEGAL_VERSIONS.terms &&
      CURRENT_LEGAL_VERSIONS.privacy &&
      CURRENT_LEGAL_VERSIONS.community
    ) {
      const currentVersions = {
        terms: CURRENT_LEGAL_VERSIONS.terms,
        privacy: CURRENT_LEGAL_VERSIONS.privacy,
        community: CURRENT_LEGAL_VERSIONS.community,
      };
      const acceptance = await hasAcceptedLegalVersions(session.user.id, currentVersions);
      if (acceptance.error) {
        console.warn("[legal] acceptance lookup failed", acceptance.error);
        setBootError("We could not verify your policy choices. Your session is still secure.");
        setScreen("loading");
        return;
      }
      if (!acceptance.accepted) {
        setUser(appUser);
        setOnboardingUserId(session.user.id);
        setFirstNameDraft(appUser.firstName);
        setAvatarStyleDraft(appUser.avatarStyle);
        setScreen("legal-consent");
        return;
      }
    }
    setUser(appUser);
    setSelectedVibes(appUser.interests.length ? appUser.interests : normalizeVibes(appUser.defaultVibes));
    setOnboardingUserId(null);
    void clearOnboardingDraft(session.user.id);
    setFirstNameDraft(profile.first_name);
    const syncedVenuePreferences = await syncVenuePreferencesForUser(appUser.id);
    setVenuePreferences(syncedVenuePreferences);
    setVenueHidden(!!syncedVenuePreferences[venueSummary.venueId]?.hidden);
    const recoveredActiveSession = await recoverActivePresenceSession(appUser);
    setScreen(recoveredActiveSession ? "venue" : "home");
  }

  async function startGoogleAuth() {
    setAuthError(null);
    setAuthBusy(true);
    try {
      const result = await startGoogleAuthSession(logAuthDebug);
      if (result.status === "failed") setAuthError(result.message);
      if (result.status === "cancelled") {
        setAuthError("Google sign-in was cancelled. Try again when you’re ready.");
      }
    } catch (error) {
      console.warn("[auth] Google sign-in failed", error);
      setAuthError("Google sign-in could not complete. Check your connection and try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function startAppleAuth() {
    setAuthError(null);
    setAuthBusy(true);
    try {
      const result = await startAppleAuthSession();
      if (result.status === "failed") setAuthError(result.message);
      if (result.status === "cancelled") {
        setAuthError("Apple sign-in was cancelled. Try again when you’re ready.");
      }
    } catch (error) {
      console.warn("[auth] Apple sign-in failed", error);
      setAuthError("Apple sign-in could not complete. Check your connection and try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function finishLocationStep() {
    setLocationError(null);
    setLocationBusy(true);
    try {
      const session = await getCurrentSession();
      if (!session) {
        setAuthError("Sign in again to finish onboarding.");
        setScreen("auth");
        return;
      }

      const locationResult = await requestLocationAccess();
      setLocationEnabled(locationResult.granted);
      setNotificationEnabled(locationResult.notificationsGranted);
      if (!locationResult.granted) {
        setLocationError(getLocationRecoveryMessage(locationResult.reason));
        return;
      }
      await primeLocationFix();
      await refreshVenueFromRuntime();
      await persistOnboardingStep("complete");
      setScreen("legal-consent");
    } catch (error) {
      console.warn("[onboarding] location step failed", error);
      setLocationError("Left could not finish the permission check. Try again, or review device settings.");
    } finally {
      setLocationBusy(false);
    }
  }

  async function finishOnboarding() {
    const validation = validateFirstName(firstNameDraft);
    if (!validation.valid) {
      setAuthError(validation.message);
      setScreen("onboarding-name");
      return;
    }
    if (onboardingInterests.length < 3) {
      setAuthError("Choose at least three interests so you have a meaningful set of vibes to share.");
      setScreen("onboarding-name");
      return;
    }
    if (legalContentReady && !Object.values(legalChecks).every(Boolean)) {
      setAuthError("Review and accept all published policies to finish.");
      return;
    }

    setOnboardingSaveBusy(true);
    setAuthError(null);
    try {
      const session = await getCurrentSession();
      if (!session) {
        setAuthError("Sign in again to finish onboarding.");
        setScreen("auth");
        return;
      }

      const now = new Date().toISOString();
      const authProvider = getProvider(session);
      const nextUser: AppUser = {
        id: session.user.id,
        authProvider,
        providerSubject: getProviderSubject(session, authProvider),
        firstName: validation.normalized,
        avatarStyle: avatarStyleDraft,
        defaultIntent: "networking",
        defaultVibes: onboardingInterests,
        interests: onboardingInterests,
        offering: "",
        socialRhythm: "",
        conversationStyle: "",
        profilePrompt: defaultProfilePrompt,
        approachPrompt: defaultApproachPrompt,
        focusModeEnabled: false,
        promptsEnabled: true,
        identityRemoved: false,
        onboardingCompleted: true,
        createdAt: now,
        updatedAt: now,
      };

      const versions =
        legalContentReady &&
        CURRENT_LEGAL_VERSIONS.terms &&
        CURRENT_LEGAL_VERSIONS.privacy &&
        CURRENT_LEGAL_VERSIONS.community
          ? {
              terms: CURRENT_LEGAL_VERSIONS.terms,
              privacy: CURRENT_LEGAL_VERSIONS.privacy,
              community: CURRENT_LEGAL_VERSIONS.community,
            }
          : null;
      if (user?.onboardingCompleted) {
        if (!versions) {
          setScreen("home");
          return;
        }
        const acceptance = await recordLegalAcceptance(versions);
        if (!acceptance.ok) {
          console.warn("[legal] acceptance save failed", acceptance.error);
        setAuthError(describeSaveError(acceptance.error, "Your policy acceptance could not be saved. Please try again."));
          return;
        }
        setAuthError(null);
        setScreen("home");
        return;
      }

      const result = await upsertOnboardingProfile(
        nextUser,
        versions ? { versions } : null,
      );
      if (!result.ok) {
        console.warn("[onboarding] profile save failed", result.error);
        setAuthError(describeSaveError(result.error, "Your profile could not be saved. Please try again."));
        return;
      }

      setUser(nextUser);
      setSelectedVibes(onboardingInterests);
      setOnboardingUserId(null);
      await clearOnboardingDraft(session.user.id);
      setScreen("home");
    } catch (error) {
      console.warn("[onboarding] completion failed", error);
      setAuthError(
        error instanceof UnsupportedAuthProviderError
          ? "This session is not linked to Google or Apple. Sign out, then continue with Google."
          : describeSaveError(error, "We couldn’t finish setting up your profile. Please try again."),
      );
    } finally {
      setOnboardingSaveBusy(false);
    }
  }

  function openDeviceSettings() {
    void Linking.openSettings().catch(() => {
      showDialog("Open device settings", "Open your device settings and allow location access for Left.");
    });
  }

  async function continueNameStep() {
    const validation = validateFirstName(firstNameDraft);
    if (!validation.valid) {
      setAuthError(validation.message);
      return;
    }
    setFirstNameDraft(validation.normalized);
    setAuthError(null);
    await persistOnboardingStep("legal");
    setScreen("onboarding-legal");
  }

  async function continueLegalStep() {
    if (!legalChecks.community) {
      setAuthError("Agree to the community pledge to continue.");
      return;
    }
    setAuthError(null);
    await persistOnboardingStep("notifications");
    setScreen("onboarding-notifications");
  }

  async function finishNotificationStep(requestPermission: boolean) {
    setNotificationBusy(true);
    try {
      const enabled = requestPermission
        ? await requestNotificationAccess()
        : notificationEnabled;
      setNotificationEnabled(enabled);
      await persistOnboardingStep("location");
      setScreen("onboarding-location");
    } finally {
      setNotificationBusy(false);
    }
  }

  function toggleVibe(vibe: string) {
    setSelectedVibes((current) => {
      const exists = current.includes(vibe);
      if (exists) return current.filter((value) => value !== vibe);
      return [...current, vibe];
    });
  }

  async function activatePresence() {
    if (!user) return;
    if (selectedVibes.length === 0 || !hintDraft.trim()) {
      showDialog("Finish your visibility details", "Choose at least one vibe and add a short hint so people can identify you in the venue.");
      return;
    }
    if (activationAttemptRef.current) return;
    activationAttemptRef.current = true;
    setActivationSubmitting(true);

    try {
      await performPresenceActivation();
    } catch {
      showDialog("Could not start visibility", "Left could not complete the location check. Please try again.");
    } finally {
      activationAttemptRef.current = false;
      setActivationSubmitting(false);
    }
  }

  async function performPresenceActivation() {
    if (!user) return;
    let runtime = await getLocationRuntimeState();
    console.info("[activation] starting presence activation", {
      permissionGranted: runtime.permissionGranted,
      hasLocationFix: !!runtime.lastKnownCoords,
      currentVenueId: runtime.currentVenueId,
      currentVenueName: runtime.currentVenueName,
      selectedVenueId: runtime.selectedVenueId,
      selectedVenueName: runtime.selectedVenueName,
      nearbyVenues: summarizeVenueCandidates(runtime.nearbyVenues),
    });
    if (!runtime.permissionGranted) {
      const locationResult = await requestLocationAccess();
      setLocationEnabled(locationResult.granted);
      if (!locationResult.granted) {
        showDialog(
          "Location needed",
          locationResult.reason === "background_denied"
            ? "Allow 'Always' location access so Left can confirm your venue before you go visible."
            : "Left needs location access to confirm your venue before you go visible.",
        );
        return;
      }

      await primeLocationFix();
      await refreshVenueFromRuntime();
      runtime = await getLocationRuntimeState();
    } else {
      await primeLocationFix();
      await refreshVenueFromRuntime();
      runtime = await getLocationRuntimeState();
    }

    console.info("[activation] runtime after location refresh", {
      permissionGranted: runtime.permissionGranted,
      hasLocationFix: !!runtime.lastKnownCoords,
      currentVenueId: runtime.currentVenueId,
      currentVenueName: runtime.currentVenueName,
      selectedVenueId: runtime.selectedVenueId,
      selectedVenueName: runtime.selectedVenueName,
      nearbyVenues: summarizeVenueCandidates(runtime.nearbyVenues),
    });

    const matchedCanonicalVenue =
      runtime.selectedVenueId && isUuid(runtime.selectedVenueId)
        ? runtime.nearbyVenues.find((venue) => venue.id === runtime.selectedVenueId) ?? null
        : runtime.nearbyVenues.find((venue) => isUuid(venue.id)) ?? null;
    const resolvedVenueId = isUuid(venueSummary.venueId)
      ? venueSummary.venueId
      : matchedCanonicalVenue?.id ?? null;
    const resolvedVenueName =
      venueSummary.venueName !== "Visibility off"
        ? venueSummary.venueName
        : matchedCanonicalVenue?.name ?? runtime.currentVenueName ?? runtime.selectedVenueName ?? venueSummary.venueName;

    console.info("[activation] resolved venue candidate", {
      venueSummaryVenueId: venueSummary.venueId,
      venueSummaryVenueName: venueSummary.venueName,
      matchedCanonicalVenueId: matchedCanonicalVenue?.id ?? null,
      matchedCanonicalVenueName: matchedCanonicalVenue?.name ?? null,
      resolvedVenueId,
      resolvedVenueName,
    });

    if (venueSelectionRequired) {
      setScreen("venue-select");
      return;
    }
    if (venueHidden) {
      showDialog("Venue hidden", "Unhide this venue in Settings before becoming visible here again.");
      return;
    }
    if (!resolvedVenueId || !isUuid(resolvedVenueId)) {
      const detectedVenue = runtime.nearbyVenues[0] ?? null;
      console.warn("[activation] venue unresolved after refresh", {
        permissionGranted: runtime.permissionGranted,
        hasLocationFix: !!runtime.lastKnownCoords,
        currentVenueId: runtime.currentVenueId,
        currentVenueName: runtime.currentVenueName,
        selectedVenueId: runtime.selectedVenueId,
        selectedVenueName: runtime.selectedVenueName,
        resolvedVenueId,
        detectedVenue: detectedVenue
          ? {
              id: detectedVenue.id,
              name: detectedVenue.name,
              source: detectedVenue.source,
              isUuid: isUuid(detectedVenue.id),
              distanceMeters: detectedVenue.distanceMeters ?? null,
            }
          : null,
        nearbyVenues: summarizeVenueCandidates(runtime.nearbyVenues),
      });
      if (detectedVenue && !isUuid(detectedVenue.id)) {
        setVenueDraftName(detectedVenue.name);
        setVenueDraftAddress("");
        setVenueDraftNotes("");
        setVenueDraftType("other");
        showDialog(
          "Venue found nearby",
          `${detectedVenue.name} was detected nearby, but it is not a confirmed Left venue yet. Add it first, then you can go visible there.`,
          [
            { label: "Cancel" },
            { label: "Add venue", variant: "primary", onPress: () => setScreen("venue-add") },
          ],
        );
        return;
      }

      if (!runtime.permissionGranted) {
        showDialog("Location needed", "Left does not have location permission yet, so it cannot confirm your venue.");
        return;
      }

      if (!runtime.lastKnownCoords) {
        showDialog("Location not ready", "Left does not have a recent location fix yet. Wait a moment and try again.");
        return;
      }

      showDialog("Venue not ready", "Left could not confirm a nearby venue from your current location yet.");
      return;
    }
    const startedAtDate = new Date();
    const startedAt = startedAtDate.toISOString();
    const expiresAt = new Date(startedAtDate.getTime() + selectedDuration * 60_000).toISOString();
    const intent = selectedIntent ?? "networking";
    const vibes = normalizeVibes(selectedVibes);
    const hintText = hintDraft.trim() || null;
    try {
      void saveLastActivationDefaults({
        intent,
        vibes,
        durationMinutes: selectedDuration,
        hintText: hintDraft,
      });

      if (isUuid(user.id) && isUuid(resolvedVenueId)) {
        const presenceSessionId = await createPresenceSession({
          venueId: resolvedVenueId,
          intent,
          vibes,
          hintText,
          latitude: runtime.lastKnownCoords!.latitude,
          longitude: runtime.lastKnownCoords!.longitude,
          durationMinutes: selectedDuration,
        });

        if (!presenceSessionId) {
          showDialog("Could not start visibility", "Your session was not saved. Try again before becoming visible.");
          return;
        }

        setActivePresenceSessionId(presenceSessionId);
        void recordSocialInteractionEvent("became_visible", { visibilitySessionId: presenceSessionId });
        await refreshVenueContext(resolvedVenueId);
        await refreshNearbyFeed(user.id, resolvedVenueId);
      } else {
        setActivePresenceSessionId(null);
        setSocialMomentumEvents([]);
      }

      setSessionNowMs(Date.now());
      setSessionStartedAt(startedAt);
      setSessionExpiresAt(expiresAt);
      setSessionVisible(true);
      setVenueSummary((current) => ({
        ...current,
        venueId: resolvedVenueId,
        venueName: resolvedVenueName,
        pulseCopy: "You are now visible at this venue.",
      }));
      showToast("You are visible");
      setVenueFooterDestination("session");
      setScreen("venue");
    } catch {
      showDialog("Could not start visibility", "Please try again.");
    }
  }

  function openProfile(item: NearbyFeedItem) {
    setProfileReturnScreen(screen === "profile" ? "feed" : screen);
    setSelectedProfile(item);
    void recordSocialInteractionEvent("profile_viewed", {
      targetUserId: item.profileUserId,
      visibilitySessionId: activePresenceSessionId ?? item.presenceSessionId,
    });
    setScreen("profile");
  }

  async function submitExperienceDraft(draft: Omit<ExperienceProposalInput, "hostUserId">) {
    if (experienceProposalBusy) return;
    if (!user) {
      setExperienceProposalError("Sign in before hosting a gathering.");
      return;
    }
    setExperienceProposalBusy(true);
    setExperienceProposalError(null);
    try {
      const submitted = await submitExperienceProposal(draft);
      if (!submitted) {
        setExperienceProposalError("We couldn’t submit this plan. Check your connection and try again.");
        return;
      }
      showToast("Sent for review. You can track it under Your plans.");
      setScreen("home");
    } catch (error) {
      setExperienceProposalError(error instanceof Error ? error.message : "Couldn’t submit your plan. Please try again.");
    } finally {
      setExperienceProposalBusy(false);
    }
  }

  function handleSocialMomentumPrimary() {
    setScreen("feed");
  }

  function dismissSocialMomentumPrompt() {
    void recordSocialInteractionEvent("prompt_dismissed");
  }

  async function startApproach() {
    if (!selectedProfile || !user) return;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 60_000);
    const nextApproachPrompt = resolveApproachPromptForVenue(venueSummary.venueId);
    let approachId = "approach-1";

    if (isUuid(user.id) && isUuid(selectedProfile.profileUserId) && isUuid(selectedProfile.presenceSessionId)) {
      const persistedApproachId = await createApproachAttempt({
        presenceSessionId: selectedProfile.presenceSessionId,
      });

      if (!persistedApproachId) {
        showDialog("Could not start approach", "Please try again.");
        return;
      }

      approachId = persistedApproachId;
    }

    await saveStoredActiveApproach({
      userId: user.id,
      approachId,
      targetUserId: selectedProfile.profileUserId,
      targetFirstName: selectedProfile.firstName,
      presenceSessionId: selectedProfile.presenceSessionId,
      approachPrompt: nextApproachPrompt,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    void recordSocialInteractionEvent("approach_started", {
      targetUserId: selectedProfile.profileUserId,
      visibilitySessionId: activePresenceSessionId ?? selectedProfile.presenceSessionId,
      metadata: { approachId },
    });
    setApproach({
      id: approachId,
      fromUserId: user.id,
      toUserId: selectedProfile.profileUserId,
      presenceSessionId: selectedProfile.presenceSessionId,
      status: "started",
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      completedAt: null,
      cancelledAt: null,
      createdAt: startedAt.toISOString(),
      updatedAt: startedAt.toISOString(),
    });
    setActiveApproachPrompt(nextApproachPrompt);
    setScreen("approach");
  }

  async function confirmConnected() {
    const completedAt = new Date().toISOString();
    await clearStoredActiveApproach();
    await clearPendingApproachFeedback();
    setPendingApproachFeedback(null);
    if (approach && isUuid(approach.id)) {
      const updated = await markApproachConnected({
        approachId: approach.id,
        completedAt,
      });

      if (!updated) {
        showDialog("Could not confirm connection", "Please try again.");
        return;
      }
    }

    void recordSocialInteractionEvent("approach_connected", {
      targetUserId: approach?.toUserId ?? selectedProfile?.profileUserId ?? null,
      visibilitySessionId: activePresenceSessionId ?? approach?.presenceSessionId ?? null,
      metadata: { approachId: approach?.id ?? null },
    });
    setApproach((current) =>
      current ? { ...current, status: "connected", completedAt } : current,
    );
    setScreen("feed");
  }

  async function cancelApproach() {
    const cancelledAt = new Date().toISOString();
    if (approach && isUuid(approach.id)) {
      const updated = await markApproachCancelled({ approachId: approach.id, cancelledAt });
      if (!updated) {
        showDialog("Could not cancel approach", "Please try again so the cancellation is saved.");
        return;
      }
    }

    await clearStoredActiveApproach();
    await clearPendingApproachFeedback();
    setPendingApproachFeedback(null);
    void recordSocialInteractionEvent("approach_cancelled", {
      targetUserId: approach?.toUserId ?? selectedProfile?.profileUserId ?? null,
      visibilitySessionId: activePresenceSessionId ?? approach?.presenceSessionId ?? null,
      metadata: { approachId: approach?.id ?? null },
    });
    setApproach(null);
    setScreen("feed");
  }

  async function hideUser() {
    if (!selectedProfile) return;
    if (profileAction) return;
    setProfileAction("hide");
    const targetUserId = selectedProfile.profileUserId;
    try {
      if (user && isUuid(user.id) && isUuid(targetUserId)) {
        const hidden = await hideUserForActor({
          actorUserId: user.id,
          targetUserId,
        });

        if (!hidden) {
          showDialog("Could not hide person", "Please try again.");
          return;
        }
      }

      void recordSocialInteractionEvent("user_hidden", {
        targetUserId,
        visibilitySessionId: activePresenceSessionId ?? selectedProfile.presenceSessionId,
      });
      setFeed((current) => current.filter((item) => item.profileUserId !== selectedProfile.profileUserId));
      setSelectedProfile(null);
      setScreen("feed");
      showToast("Person hidden");
    } finally {
      setProfileAction(null);
    }
  }

  async function blockUser() {
    if (!selectedProfile || !user) return;
    if (profileAction) return;
    setProfileAction("block");
    const targetUserId = selectedProfile.profileUserId;

    try {
      if (isUuid(user.id) && isUuid(targetUserId)) {
        const blocked = await blockUserForActor({
          actorUserId: user.id,
          targetUserId,
          reason: "user_blocked_from_profile",
        });

        if (!blocked) {
          showDialog("Could not block person", "Please try again.");
          return;
        }
      }

      void recordSocialInteractionEvent("user_blocked", {
        targetUserId,
        visibilitySessionId: activePresenceSessionId ?? selectedProfile.presenceSessionId,
      });
      setFeed((current) => current.filter((item) => item.profileUserId !== targetUserId));
      setSelectedProfile(null);
      setScreen("feed");
      showToast("Person blocked");
    } finally {
      setProfileAction(null);
    }
  }

  async function reportUser(category: ReportCategory = reportCategory, notes = reportNotes) {
    if (!selectedProfile || !user) return;
    if (reportSubmitting) return;
    const targetUserId = selectedProfile.profileUserId;
    const presenceSessionId = isUuid(selectedProfile.presenceSessionId) ? selectedProfile.presenceSessionId : null;

    setReportSubmitting(true);
    if (isUuid(user.id) && isUuid(targetUserId)) {
      const reported = await reportUserForActor({
        actorUserId: user.id,
        targetUserId,
        presenceSessionId,
        category,
        notes,
      });

      if (!reported) {
        setReportSubmitting(false);
        showDialog("Could not submit report", "Please try again.");
        return;
      }
    }

    void recordSocialInteractionEvent("user_reported", {
      targetUserId,
      visibilitySessionId: activePresenceSessionId ?? presenceSessionId,
      metadata: { category },
    });
    setReportSubmitting(false);
    setReportCategory("unsafe_behavior");
    setReportNotes("");
    setFeed((current) => current.filter((item) => item.profileUserId !== targetUserId));
    setSelectedProfile(null);
    setScreen("feed");
    showToast("Report submitted");
  }

  async function hideVenuePermanently() {
    const venueId = venueSummary.venueId;
    const venueName = venueSummary.venueName;
    setVenuePreferenceAction({ venueId, action: "hide" });
    setVenuePreferenceMessage(null);

    try {
      await persistVenueHidden(venueId, venueName, true);
      let synced = true;
      if (user) {
        const savedPreference = await upsertVenuePreferenceForUser({
          userId: user.id,
          venueId,
          venueName,
          hidden: true,
          muted: !!currentVenuePreference?.muted,
          cooldownUntil: currentVenuePreference?.cooldownUntil ?? null,
        });

        synced = !!savedPreference || !isUuid(user.id) || !isUuid(venueId);
      }

      if (sessionVisible) {
        await endSessionState("session_ended", { toast: false });
      }
      setVenueHidden(true);
      setFeed([]);
      await refreshVenuePreferences();
      setVenuePreferenceMessage({
        venueId,
        tone: synced ? "success" : "error",
        text: synced
          ? `${venueName} is hidden. You will not be visible there until you unhide it.`
          : `${venueName} is hidden on this device, but server sync did not complete.`,
      });
      showToast(synced ? "Venue hidden" : "Venue hidden on this device");
      setScreen("home");
    } catch {
      setVenuePreferenceMessage({
        venueId,
        tone: "error",
        text: `We could not hide ${venueName}. Please try again.`,
      });
    } finally {
      setVenuePreferenceAction(null);
    }
  }

  async function muteVenueNotifications() {
    const venueId = venueSummary.venueId;
    const venueName = venueSummary.venueName;
    setVenuePreferenceAction({ venueId, action: "mute" });
    setVenuePreferenceMessage(null);

    try {
      await setVenueMuted(venueId, venueName, true);
      let synced = true;
      if (user) {
        const savedPreference = await upsertVenuePreferenceForUser({
          userId: user.id,
          venueId,
          venueName,
          hidden: !!currentVenuePreference?.hidden,
          muted: true,
          cooldownUntil: null,
        });

        synced = !!savedPreference || !isUuid(user.id) || !isUuid(venueId);
      }

      await refreshVenuePreferences();
      setVenuePreferenceMessage({
        venueId,
        tone: synced ? "success" : "error",
        text: synced
          ? `Notifications are off at ${venueName}.`
          : `Notifications are off on this device, but server sync did not complete.`,
      });
      showToast(synced ? "Notifications muted" : "Notifications muted on this device");
    } catch {
      setVenuePreferenceMessage({
        venueId,
        tone: "error",
        text: `We could not mute ${venueName}. Please try again.`,
      });
    } finally {
      setVenuePreferenceAction(null);
    }
  }

  async function clearVenueHidden(venueId: string, venueName: string) {
    setVenuePreferenceAction({ venueId, action: "unhide" });
    setVenuePreferenceMessage(null);

    try {
      await persistVenueHidden(venueId, venueName, false);
      let synced = true;
      if (user) {
        const preference = venuePreferences[venueId];
        const savedPreference = await upsertVenuePreferenceForUser({
          userId: user.id,
          venueId,
          venueName,
          hidden: false,
          muted: !!preference?.muted,
          cooldownUntil: preference?.cooldownUntil ?? null,
        });

        synced = !!savedPreference || !isUuid(user.id) || !isUuid(venueId);
      }
      if (venueSummary.venueId === venueId) {
        setVenueHidden(false);
      }
      await refreshVenuePreferences();
      setVenuePreferenceMessage({
        venueId,
        tone: synced ? "success" : "error",
        text: synced
          ? `${venueName} is unhidden. You can become visible there again.`
          : `${venueName} is unhidden on this device, but server sync did not complete.`,
      });
      showToast(synced ? "Venue unhidden" : "Venue unhidden on this device");
    } catch {
      setVenuePreferenceMessage({
        venueId,
        tone: "error",
        text: `We could not unhide ${venueName}. Please try again.`,
      });
    } finally {
      setVenuePreferenceAction(null);
    }
  }

  async function clearVenueMuted(venueId: string, venueName: string) {
    setVenuePreferenceAction({ venueId, action: "unmute" });
    setVenuePreferenceMessage(null);

    try {
      await setVenueMuted(venueId, venueName, false);
      let synced = true;
      if (user) {
        const preference = venuePreferences[venueId];
        const savedPreference = await upsertVenuePreferenceForUser({
          userId: user.id,
          venueId,
          venueName,
          hidden: !!preference?.hidden,
          muted: false,
          cooldownUntil: preference?.cooldownUntil ?? null,
        });

        synced = !!savedPreference || !isUuid(user.id) || !isUuid(venueId);
      }
      await refreshVenuePreferences();
      setVenuePreferenceMessage({
        venueId,
        tone: synced ? "success" : "error",
        text: synced
          ? `Notifications are back on for ${venueName}.`
          : `Notifications are back on locally, but server sync did not complete.`,
      });
      showToast(synced ? "Notifications on" : "Notifications on locally");
    } catch {
      setVenuePreferenceMessage({
        venueId,
        tone: "error",
        text: `We could not update notifications for ${venueName}. Please try again.`,
      });
    } finally {
      setVenuePreferenceAction(null);
    }
  }

  async function saveSettings(input: {
    firstName: string;
    avatarStyle: AvatarStyle;
    defaultIntent: AppUser["defaultIntent"];
    defaultVibes: string[];
    interests: string[];
    offering: string;
    socialRhythm: string;
    conversationStyle: string;
    profilePrompt: string;
  }) {
    if (!user) return;
    setSettingsSaveState("saving");
    const nextUser: AppUser = {
      ...user,
      firstName: input.firstName.trim() || user.firstName,
      avatarStyle: input.avatarStyle,
      defaultIntent: input.defaultIntent,
      defaultVibes: input.defaultVibes,
      interests: input.interests,
      offering: input.offering.trim(),
      socialRhythm: input.socialRhythm.trim(),
      conversationStyle: input.conversationStyle.trim(),
      profilePrompt: input.profilePrompt.trim() || defaultProfilePrompt,
      approachPrompt: user.approachPrompt.trim() || defaultApproachPrompt,
      updatedAt: new Date().toISOString(),
    };
    const saved = await updateUserSettings({
      userId: user.id,
      firstName: nextUser.firstName,
      avatarStyle: nextUser.avatarStyle,
      defaultIntent: nextUser.defaultIntent,
      defaultVibes: normalizeVibes(nextUser.defaultVibes),
      interests: nextUser.interests,
      offering: nextUser.offering,
      socialRhythm: nextUser.socialRhythm,
      conversationStyle: nextUser.conversationStyle,
      profilePrompt: nextUser.profilePrompt,
      approachPrompt: nextUser.approachPrompt,
    });
    if (!saved) {
      setSettingsSaveState("error");
      return;
    }
    setUser(nextUser);
    setFirstNameDraft(nextUser.firstName);
    setAvatarStyleDraft(nextUser.avatarStyle);
    setSelectedIntent(nextUser.defaultIntent);
    setSelectedVibes(nextUser.interests.length ? nextUser.interests : normalizeVibes(nextUser.defaultVibes));
    setSettingsSaveState("saved");
    showToast("Profile saved");
    setTimeout(() => setSettingsSaveState("idle"), 1500);
  }

  async function signOut() {
    await supabase.auth.signOut();
    clearLocalSessionState();
  }

  async function forceLocalSignOut() {
    await supabase.auth.signOut();
    clearLocalSessionState();
  }

  function clearLocalSessionState() {
    setUser(null);
    setSelectedProfile(null);
    setSelectedExperience(null);
    setSavedVenues([]);
    setExperiences([]);
    void endSessionState("session_ended", { toast: false });
    setApproach(null);
    setActiveApproachPrompt(defaultApproachPrompt);
    setAuthError(null);
    setSettingsSaveState("idle");
    setDeletionRequestState("idle");
    setReportSubmitting(false);
    setActivationSubmitting(false);
    activationAttemptRef.current = false;
    setProfileAction(null);
    setVisibilityAction(null);
    setReportCategory("unsafe_behavior");
    setReportNotes("");
    setScreen("auth");
  }

  async function endSessionState(
    status: "paused" | "session_ended" = "session_ended",
    options: { toast?: boolean; toastMessage?: string } = {},
  ) {
    if (visibilityAction) return;
    setVisibilityAction(status === "paused" ? "pause" : "end");
    const sessionId = activePresenceSessionId;
    try {
      setSessionVisible(false);
      setSessionStartedAt(null);
      setSessionExpiresAt(null);
      setActivePresenceSessionId(null);
      setSocialMomentumEvents([]);
      setSessionNowMs(Date.now());
      setSelectedProfile(null);
      setFeed([]);

      if (isUuid(sessionId)) {
        const updated = await updatePresenceSessionEndState(sessionId, status);

        if (!updated) {
          showDialog("Could not update visibility", "Your local session is hidden, but the server did not confirm the change.");
        }
      }
      if (options.toast !== false) {
        showToast(options.toastMessage ?? (status === "paused" ? "Visibility paused" : "Session ended"));
      }
    } finally {
      setVisibilityAction(null);
    }
  }

  async function requestAccountDeletion() {
    if (!user) return;
    showDialog(
      "Remove your identity from Left?",
      "This requests removal of your direct identity details and may sign you out when processing completes. Retained safety and operational records remain under the current policy.",
      [
        { label: "Keep my identity", variant: "ghost" },
        {
          label: "Request removal",
          variant: "destructive",
          onPress: () => {
            void submitAccountDeletionRequest();
          },
        },
      ],
    );
  }

  async function submitAccountDeletionRequest() {
    if (!user) return;
    setDeletionRequestState("submitting");
    const result = await submitIdentityRemovalRequest(user);

    if (result === "duplicate") {
      setDeletionRequestState("submitted");
      showDialog("Identity removal", "You already have an open identity-removal request.");
      return;
    }

    if (result === "failed") {
      setDeletionRequestState("error");
      showDialog("Identity removal failed", "We could not create your identity-removal request.");
      return;
    }

    if (result === "queued") {
      setDeletionRequestState("submitted");
      showDialog(
        "Identity removal queued",
        "We recorded your request, but backend processing did not finish yet. Your request is still on file for follow-up.",
        [
          {
            label: "OK",
            variant: "primary",
            onPress: () => {
              void signOut();
            },
          },
        ],
      );
      return;
    }

    setDeletionRequestState("submitted");
    showDialog(
      "Identity removed",
      "Direct identity fields were removed. Your retained records stay in place under the current policy.",
      [
        {
          label: "OK",
          variant: "primary",
          onPress: () => {
            void signOut();
          },
        },
      ],
    );
  }

  function goToFooterDestination(destination: FooterDestination) {
    if (destination === "home") {
      setSelectedProfile(null);
      setSelectedVenueDetail(null);
      setScreen("home");
      return;
    }
    if (destination === "nearby") {
      setSelectedProfile(null);
      setSelectedVenueDetail(null);
      if (sessionVisible) {
        setScreen("feed");
      } else {
        setVenueFooterDestination("nearby");
        setScreen("venue");
      }
      return;
    }
    if (destination === "session") {
      setSelectedProfile(null);
      setSelectedVenueDetail(null);
      setVenueFooterDestination("session");
      setScreen("venue");
      return;
    }
    setSelectedProfile(null);
    setSelectedVenueDetail(null);
    setScreen("me");
  }

  const footerSummary = {
    venueName: displayVenueSummary.venueName,
    intent: selectedIntent,
    vibe: selectedVibes[0] ?? "Open",
    sessionVisible,
    activeDestination: getFooterDestination(screen, {
      safetyReturnScreen,
      venueDestination: venueFooterDestination,
    }),
  };
  const currentVenuePreference = venuePreferences[venueSummary.venueId];
  const currentVenuePreferenceAction =
    venuePreferenceAction?.venueId === venueSummary.venueId ? venuePreferenceAction.action : null;
  const safetyVenueAction =
    currentVenuePreferenceAction === "hide"
      ? "hiding"
      : currentVenuePreferenceAction === "mute"
        ? "muting"
        : null;
  const currentVenuePreferenceMessage =
    venuePreferenceMessage?.venueId === venueSummary.venueId ? venuePreferenceMessage : null;
  const venueConfidence = resolveVenueConfidence(venueSummary, nearbyVenueOptions);
  const venueConfidenceLabel = getVenueConfidenceLabel(venueConfidence);
  const venueConfidenceCopy = getVenueConfidenceCopy(venueConfidence);
  const profileCompletion = user
    ? Math.round(([user.interests.length >= 3, Boolean(user.offering), Boolean(user.socialRhythm), Boolean(user.conversationStyle)].filter(Boolean).length / 4) * 100)
    : 0;
  const locationStatus = locationEnabled
    ? Platform.OS === "web"
      ? "Foreground location is available while this preview is open."
      : "Background location is active. Venue matching runs on-device and only venue IDs are used for app state."
    : "Background location is not enabled yet.";
  const isOnboardingScreen = screen.startsWith("onboarding-") || screen === "legal-consent";
  const isPreAuthScreen = screen === "preauth";
  const isFullBleedScreen = screen === "auth" || screen === "legal" || screen === "loading" || isPreAuthScreen;
  const isSessionNavScreen = SESSION_NAV_SCREENS.includes(screen);
  const isRefreshableScreen = REFRESHABLE_SCREENS.includes(screen);
  const scrollContentPaddingTop =
    isSessionNavScreen ? 20 : screen === "venue-detail" || isFullBleedScreen ? 0 : Math.max(56, insets.top + 20);
  const scrollContentPaddingBottom = isSessionNavScreen
    ? 98 + insets.bottom
    : isOnboardingScreen || screen === "venue-detail"
    ? 24 + insets.bottom
    : 72 + insets.bottom;

  return (
    <View style={styles.shell}>
      {screen !== "me" && !isOnboardingScreen && !isFullBleedScreen ? <BackgroundWaveLayer /> : null}
      {isRefreshableScreen ? (
        <LeftRefreshIndicator
          pullDistance={refreshPullDistance}
          refreshing={discoveryRefreshing}
          topInset={insets.top}
        />
      ) : null}
      <ScrollView
        ref={mainScrollRef}
        contentInsetAdjustmentBehavior={isFullBleedScreen || isSessionNavScreen || screen === "venue-detail" ? "never" : "automatic"}
        style={isSessionNavScreen
          ? { marginTop: insets.top }
          : screen === "venue-detail" ? { marginTop: insets.top } : undefined}
        bounces={isRefreshableScreen}
        alwaysBounceVertical={isRefreshableScreen}
        refreshControl={isRefreshableScreen ? (
          <RefreshControl
            refreshing={discoveryRefreshing}
            onRefresh={() => void refreshDiscoverySurface()}
            tintColor="transparent"
            colors={["transparent"]}
            progressBackgroundColor="transparent"
          />
        ) : undefined}
        onScroll={isRefreshableScreen ? (event) => {
          const nextDistance = Math.max(0, Math.round(-event.nativeEvent.contentOffset.y));
          setRefreshPullDistance((current) => current === nextDistance ? current : nextDistance);
        } : undefined}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: scrollContentPaddingTop,
            paddingBottom: scrollContentPaddingBottom,
          },
          isFullBleedScreen && styles.fullContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {screen === "loading" && <LoadingScreen error={bootError} onRetry={() => void bootstrapSession()} />}
        {screen === "preauth" && <PreAuthOnboardingScreen onComplete={() => void completePreAuthOnboarding()} />}
        {screen === "auth" && (
          <AuthScreen
            authError={authError}
            busy={authBusy}
            onAuth={startGoogleAuth}
            onAppleAuth={startAppleAuth}
            onBack={() => setScreen("preauth")}
            onOpenLegal={(document) => openLegalDocument(document, "auth")}
          />
        )}
        {screen === "legal" && (
          <LegalScreen documentId={activeLegalDocument} onBack={() => setScreen(legalReturnScreen)} />
        )}
        {screen === "onboarding-name" && (
          <NameScreen
            firstNameDraft={firstNameDraft}
            onChangeFirstName={setFirstNameDraft}
            avatarStyle={avatarStyleDraft}
            onPickAvatar={setAvatarStyleDraft}
            interests={onboardingInterests}
            onToggleInterest={(interest) => setOnboardingInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest])}
            onContinue={() => void continueNameStep()}
            onBack={goBackInOnboarding}
            error={authError}
          />
        )}
        {screen === "onboarding-legal" && (
          <LegalAcknowledgementScreen
            checks={legalChecks}
            onToggle={(document) =>
              setLegalChecks((current) => ({ ...current, [document]: !current[document] }))
            }
            onOpenDocument={(document) => openLegalDocument(document, "onboarding-legal")}
            onBack={goBackInOnboarding}
            onContinue={() => void continueLegalStep()}
            error={authError}
          />
        )}
        {screen === "onboarding-notifications" && (
          <NotificationScreen
            enabled={notificationEnabled}
            busy={notificationBusy}
            onContinue={() => void finishNotificationStep(true)}
            onSkip={() => void finishNotificationStep(false)}
            onBack={goBackInOnboarding}
          />
        )}
        {screen === "onboarding-location" && (
          <LocationScreen
            authError={locationError || authError}
            busy={locationBusy || onboardingSaveBusy}
            onContinue={() => void finishLocationStep()}
            onBack={goBackInOnboarding}
            onOpenSettings={openDeviceSettings}
          />
        )}
        {screen === "legal-consent" && (
          <LegalAcknowledgementScreen
            checks={legalChecks}
            onToggle={(document) =>
              setLegalChecks((current) => ({ ...current, [document]: !current[document] }))
            }
            onOpenDocument={(document) => openLegalDocument(document, "legal-consent")}
            onBack={user?.onboardingCompleted ? () => void forceLocalSignOut() : goBackInOnboarding}
            onContinue={() => void finishOnboarding()}
            busy={onboardingSaveBusy}
            error={authError}
            standalone
          />
        )}
        {screen === "venue-select" && (
          <VenueSelectionScreen
            venues={nearbyVenueOptions}
            currentVenueId={venueSummary.venueId}
            onSelectVenue={(venueId) => void confirmVenueSelection(venueId)}
            onAddVenue={() => setScreen("venue-add")}
            onBack={() => setScreen(sessionVisible ? "venue" : "home")}
          />
        )}
        {screen === "venue-add" && (
          <VenueAddScreen
            name={venueDraftName}
            address={venueDraftAddress}
            notes={venueDraftNotes}
            venueType={venueDraftType}
            photoUri={venueDraftPhotoUri}
            showContributor={venueDraftShowContributor}
            contributorName={user?.firstName ?? "You"}
            submitting={venueDraftSubmitting}
            onChangeName={setVenueDraftName}
            onChangeAddress={setVenueDraftAddress}
            onChangeNotes={setVenueDraftNotes}
            onChangeVenueType={setVenueDraftType}
            onPickPhoto={() => void pickVenueDraftPhoto()}
            onClearPhoto={() => setVenueDraftPhotoUri(null)}
            onToggleShowContributor={() => setVenueDraftShowContributor((visible) => !visible)}
            onSubmit={() => void submitVenueSuggestion()}
            onBack={() => setScreen("venue-select")}
          />
        )}
        {screen === "home" && (
          <HomeScreen
            firstName={user?.firstName ?? "there"}
            venue={venueSummary}
            nearbyVenues={nearbyVenueOptions}
            venueActivityById={venueActivityById}
            experiences={experiences}
            feed={visibleFeed}
            intent={selectedIntent}
            vibes={selectedVibes}
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            activationSubmitting={activationSubmitting}
            onBecomeVisible={() => openActivationFrom("home")}
            onOpenAllVenues={() => {
              setVenueFooterDestination("session");
              setScreen("venue");
            }}
            onOpenVenueDetail={(venueCandidate) => openVenueDetail(venueCandidate, "home")}
            onOpenProfile={openProfile}
            onOpenExperience={(experience) => openExperience(experience, "home")}
            onCreateExperience={() => {
              setExperienceProposalError(null);
              setScreen("experience-create");
            }}
            onOpenSafety={() => openSafetyFrom("home")}
            profileCompletion={profileCompletion}
            onCompleteProfile={() => setScreen("me")}
          />
        )}
        {screen === "venue" && (
          <VenueScreen
            venue={displayVenueSummary}
            feed={visibleFeed}
            socialMomentum={sessionVisible ? socialMomentum : null}
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            allowVenueActions={sessionVisible}
            canChooseVenue={sessionVisible && nearbyVenueOptions.length > 1}
            onActivate={() => openActivationFrom("venue")}
            onOpenFeed={() => setScreen(sessionVisible ? "feed" : "venue")}
            onOpenProfile={openProfile}
            onOpenVenueDetail={(venueCandidate) => openVenueDetail(venueCandidate, "venue")}
            onSocialMomentumPrimary={handleSocialMomentumPrimary}
            onDismissSocialMomentum={dismissSocialMomentumPrompt}
            onChooseVenue={() => setScreen("venue-select")}
            onAddVenue={() => setScreen("venue-add")}
            onOpenSafety={() => openSafetyFrom("venue")}
            nearbyVenues={nearbyVenueOptions}
            venueActivityById={venueActivityById}
            lastKnownCoords={lastKnownCoords}
          />
        )}
        {screen === "venue-detail" && selectedVenueDetail && (
          <VenueDetailScreen
            venue={selectedVenueDetail}
            venueSummary={venueSummary}
            venueActivity={isUuid(selectedVenueDetail.id) ? venueActivityById[selectedVenueDetail.id] ?? null : null}
            sessionVisible={sessionVisible}
            detailsLoading={venueDetailsLoading}
            saved={savedVenues.some((entry) => entry.venueId === selectedVenueDetail.id)}
            saving={savingVenueId === selectedVenueDetail.id}
            onBack={() => setScreen(venueDetailReturnScreen)}
            onPrimaryAction={() => void handleVenueDetailPrimaryAction()}
            onToggleSaved={() => void toggleSavedVenue(selectedVenueDetail)}
          />
        )}
        {screen === "experience-detail" && selectedExperience && (
          <ExperienceDetailScreen
            experience={selectedExperience}
            attendanceBusy={attendanceBusy}
            onBack={() => setScreen(experienceReturnScreen)}
            onToggleAttendance={() => void toggleSelectedExperienceAttendance()}
            onOpenVenue={openSelectedExperienceVenue}
          />
        )}
        {screen === "experience-create" && (
          <ExperienceCreateScreen
            venues={nearbyVenueOptions}
            defaultVenueId={isUuid(venueSummary.venueId) ? venueSummary.venueId : null}
            submitting={experienceProposalBusy}
            submitError={experienceProposalError}
            onBack={() => setScreen("home")}
            onSubmit={(draft) => void submitExperienceDraft(draft)}
          />
        )}
        {screen === "activate" && (
          <ActivationScreen
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            venueName={venueSummary.venueName}
            venueConfidenceLabel={venueConfidenceLabel}
            venueConfidenceCopy={venueConfidenceCopy}
            selectedIntent={selectedIntent}
            selectedVibes={selectedVibes}
            availableVibes={user?.interests.length ? user.interests : selectedVibes}
            selectedDuration={selectedDuration}
            hintDraft={hintDraft}
            elapsedSeconds={elapsedSessionSeconds}
            activationSubmitting={activationSubmitting}
            endingSession={visibilityAction === "end"}
            onBack={() => setScreen(activationReturnScreen)}
            onPickIntent={setSelectedIntent}
            onToggleVibe={toggleVibe}
            onPickDuration={setSelectedDuration}
            onChangeHint={setHintDraft}
            onActivate={activatePresence}
            onOpenFeed={() => setScreen("feed")}
            onEndSession={() => {
              endSessionState();
              setScreen("home");
            }}
          />
        )}
        {screen === "feed" && (
          <FeedScreen
            venue={displayVenueSummary}
            feed={visibleFeed}
            sessionVisible={sessionVisible}
            onOpenProfile={openProfile}
            onOpenVenueDetail={() => openVenueDetail(undefined, "feed")}
            onOpenSafety={() => openSafetyFrom("feed")}
          />
        )}
        {screen === "profile" && selectedProfile && (
          <ProfileScreen
            item={selectedProfile}
            reportCategory={reportCategory}
            reportNotes={reportNotes}
            reportSubmitting={reportSubmitting}
            profileAction={profileAction}
            viewerInterests={user?.interests ?? []}
            onBack={() => setScreen(profileReturnScreen)}
            onApproach={() => void startApproach()}
            onHide={() => void hideUser()}
            onBlock={() => void blockUser()}
            onChangeReportCategory={setReportCategory}
            onChangeReportNotes={setReportNotes}
            onReport={() => void reportUser()}
            onOpenSafety={() => openSafetyFrom("profile")}
            onShowDialog={showDialog}
          />
        )}
        {screen === "approach" && selectedProfile && approach && (
          <ApproachScreen
            item={selectedProfile}
            approachPrompt={activeApproachPrompt}
            remainingSeconds={approachRemainingSeconds}
            onCancel={() => void cancelApproach()}
            onConfirmConnected={() => void confirmConnected()}
            onOpenSafety={() => openSafetyFrom("approach")}
          />
        )}
        {screen === "safety" && (
          <SafetyScreen
            venueName={sessionVisible ? venueSummary.venueName : "current venue"}
            venueHidden={venueHidden || !!currentVenuePreference?.hidden}
            venueMuted={!!currentVenuePreference?.muted}
            venueAction={safetyVenueAction}
            venueMessage={currentVenuePreferenceMessage}
            venuePreferences={Object.values(venuePreferences).filter((preference) => preference.hidden || preference.muted)}
            venuePreferenceAction={venuePreferenceAction}
            venuePreferenceMessage={venuePreferenceMessage}
            locationStatus={locationStatus}
            visibilityAction={visibilityAction}
            sessionVisible={sessionVisible}
            onBack={() => setScreen(safetyReturnScreen)}
            onGoVisible={() => openActivationFrom("safety")}
            onPauseVisibility={() => void endSessionState("paused")}
            onEndSession={() => {
              void endSessionState();
              setScreen("home");
            }}
            onHideVenue={() => void hideVenuePermanently()}
            onMuteVenue={() => void muteVenueNotifications()}
            onClearVenueHidden={(venueId, venueName) => void clearVenueHidden(venueId, venueName)}
            onClearVenueMuted={(venueId, venueName) => void clearVenueMuted(venueId, venueName)}
            onShowDialog={showDialog}
          />
        )}
        {screen === "settings" && user && (
          <SettingsScreen
            user={user}
            deletionState={deletionRequestState}
            onOpenSafety={() => openSafetyFrom("settings")}
            onSignOut={() => void signOut()}
            onRequestDeletion={() => void requestAccountDeletion()}
            onShowDialog={showDialog}
            onBack={() => setScreen("me")}
            onOpenLegal={(document) => openLegalDocument(document, "settings")}
          />
        )}
        {screen === "saved" && (
          <SavedPlacesScreen
            venues={savedVenues}
            onBack={() => setScreen("me")}
            onOpenVenue={openSavedVenue}
            onExplore={() => {
              setVenueFooterDestination("session");
              setScreen("venue");
            }}
          />
        )}
        {screen === "me" && user && (
          <MeScreen
            user={user}
            saveState={settingsSaveState}
            onSave={(input) => void saveSettings(input)}
            onOpenSettings={() => setScreen("settings")}
            sessionVisible={sessionVisible}
            currentVenueName={displayVenueSummary.venueName}
            currentVibes={selectedVibes}
            nearbyVenueCount={nearbyVenueOptions.length}
            approachCount={socialMomentumEvents.filter((eventType) => eventType === "approach_started").length}
            savedVenueCount={savedVenues.length}
            onOpenSaved={() => setScreen("saved")}
            onBecomeVisible={() => openActivationFrom("me")}
          />
        )}
      </ScrollView>
      {SESSION_NAV_SCREENS.includes(screen) && (
        <SessionFooterNav
          venueName={footerSummary.venueName}
          vibe={footerSummary.vibe}
          intent={footerSummary.intent}
          sessionVisible={footerSummary.sessionVisible}
          activeDestination={footerSummary.activeDestination}
          showContextSummary={false}
          bottomInset={insets.bottom}
          onNavigate={goToFooterDestination}
        />
      )}
      {pendingApproachFeedback ? (
        <ApproachFeedbackPrompt
          feedback={pendingApproachFeedback}
          wentOver={feedbackWentOver}
          usedIcebreaker={feedbackUsedIcebreaker}
          onSetWentOver={(value) => {
            setFeedbackWentOver(value);
            if (!value) setFeedbackUsedIcebreaker(null);
          }}
          onSetUsedIcebreaker={setFeedbackUsedIcebreaker}
          onSubmit={() => void submitApproachFeedback()}
          onLater={() => setPendingApproachFeedback(null)}
        />
      ) : null}
      {toastMessage ? (
        <View pointerEvents="none" style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
      <AppDialog
        visible={!!dialogState}
        title={dialogState?.title ?? ""}
        message={dialogState?.message ?? ""}
        actions={(dialogState?.actions ?? [{ label: "OK", variant: "primary" }]).map((action) => ({
          label: action.label,
          variant: action.variant,
          onPress: () => {
            dismissDialog();
            action.onPress?.();
          },
        }))}
      />
    </View>
  );
}

function mapProfileToAppUser(profile: UserProfileRow): AppUser {
  return {
    id: profile.id,
    authProvider: profile.auth_provider,
    providerSubject: profile.provider_subject,
    firstName: profile.first_name,
    avatarStyle: profile.avatar_style,
    defaultIntent: profile.default_intent,
    defaultVibes: profile.default_vibes,
    interests: profile.interests ?? [],
    offering: profile.offering?.trim() ?? "",
    socialRhythm: profile.social_rhythm?.trim() ?? "",
    conversationStyle: profile.conversation_style?.trim() ?? "",
    profilePrompt: profile.profile_prompt,
    approachPrompt: profile.approach_prompt,
    focusModeEnabled: profile.focus_mode_enabled,
    promptsEnabled: profile.prompts_enabled,
    identityRemoved: profile.identity_removed,
    onboardingCompleted: profile.onboarding_completed,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

````

## src/components/glass/LeftGlass.tsx

````tsx
import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable, type GlassViewProps } from "expo-glass-effect";
import { T } from "../../app/leftTheme";
import { canUseLiquidGlass } from "./liquid-glass-support";

export type LeftGlassProps = ViewProps & {
  children: ReactNode;
  variant?: "card" | "navigation";
  glassEffectStyle?: GlassViewProps["glassEffectStyle"];
  tintColor?: string;
  radius?: number;
  isInteractive?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Printed content stays crisp; only its supporting surface becomes glass.
 * Keep opacity at 1 on this component and its ancestors (including Pressable).
 */
export function LeftGlass({
  children,
  variant = "card",
  glassEffectStyle = variant === "navigation" ? "regular" : "clear",
  tintColor = variant === "navigation" ? T.glassDark : T.glassLight,
  radius = 24,
  isInteractive = false,
  contentStyle,
  style,
  ...viewProps
}: LeftGlassProps) {
  // Start opaque until the accessibility preference has been read.
  const [reduceTransparency, setReduceTransparency] = useState(true);
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener("reduceTransparencyChanged", value => {
      changed = true;
      setReduceTransparency(value);
    });
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => {
      if (active && !changed) setReduceTransparency(value);
    }).catch(() => { /* Keep the opaque, readable fallback. */ });
    return () => { active = false; subscription.remove(); };
  }, []);

  const nativeGlass = canUseLiquidGlass(Platform.OS, reduceTransparency, isLiquidGlassAvailable, isGlassEffectAPIAvailable);
  const navigation = variant === "navigation";
  const fallbackColor = navigation ? T.onboardingInk : T.surfaceCard;
  // These theme scrims put a lower bound on contrast, even over poster artwork.
  const scrimColor = navigation ? T.glassDark : T.glassLightMedium;
  const frame = { borderRadius: radius, borderColor: navigation ? T.glassBorderDark : T.borderBlackSoft };
  const content = <View style={contentStyle}>{children}</View>;

  if (!nativeGlass) {
    return <View {...viewProps} style={[s.frame, style, frame, { backgroundColor: fallbackColor }]}>{content}</View>;
  }

  if (navigation) {
    // Keep the lifted indicator outside the glass's contentView so it cannot be clipped.
    return (
      <View {...viewProps} style={[s.frame, style, frame]}>
        <GlassView pointerEvents="none" glassEffectStyle={glassEffectStyle} tintColor={tintColor}
          colorScheme="dark" isInteractive={false} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: scrimColor }]} />
        {content}
      </View>
    );
  }

  return (
    <GlassView {...viewProps} key={isInteractive ? "interactive" : "static"}
      glassEffectStyle={glassEffectStyle} tintColor={tintColor} colorScheme="light"
      isInteractive={isInteractive} style={[s.frame, style, frame]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: scrimColor }]} />
      {content}
    </GlassView>
  );
}

const s = StyleSheet.create({
  frame: { position: "relative", backgroundColor: "transparent", borderWidth: 1 },
});

````

## src/components/glass/liquid-glass-support.ts

````ts
/** Probe lazily: older builds may not contain the native module at all. */
export function canUseLiquidGlass(
  platform: string,
  reduceTransparency: boolean,
  isAvailable: () => boolean,
  isAPIAvailable: () => boolean,
): boolean {
  if (platform !== 'ios' || reduceTransparency) return false;
  try {
    return isAvailable() && isAPIAvailable();
  } catch {
    return false;
  }
}

````

## src/components/glass/liquid-glass-support.test.ts

````ts
import { describe, expect, it, vi } from 'vitest';
import { canUseLiquidGlass } from './liquid-glass-support';

describe('Liquid Glass compatibility', () => {
  it.each(['android', 'web'])('never probes native APIs on %s', platform => {
    const available = vi.fn(() => true);
    expect(canUseLiquidGlass(platform, false, available, available)).toBe(false);
    expect(available).not.toHaveBeenCalled();
  });
  it('uses the opaque fallback when Reduce Transparency is on', () => {
    const available = vi.fn(() => true);
    expect(canUseLiquidGlass('ios', true, available, available)).toBe(false);
    expect(available).not.toHaveBeenCalled();
  });
  it('requires both compiled and runtime availability', () => {
    expect(canUseLiquidGlass('ios', false, () => true, () => true)).toBe(true);
    expect(canUseLiquidGlass('ios', false, () => false, () => true)).toBe(false);
    expect(canUseLiquidGlass('ios', false, () => true, () => false)).toBe(false);
  });
  it('falls back safely when the development build lacks the native module', () => {
    expect(canUseLiquidGlass('ios', false, () => { throw new Error('Missing module'); }, () => true)).toBe(false);
    expect(canUseLiquidGlass('ios', false, () => true, () => { throw new Error('Unavailable API'); })).toBe(false);
  });
});

````

## src/components/left/navigation.tsx

````tsx
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { formatIntent, type FooterDestination } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon, type LeftIconName } from "../icons";
import { GlassSurface, glassRadii } from "../glass";
import { LeftGlass } from "../glass/LeftGlass";

export function BackNavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || "Back"}
      onPress={onPress}
      style={({ pressed }) => [styles.backNavButton, pressed && styles.backNavButtonPressed]}
    >
      <GlassSurface
        variant="soft"
        radius={glassRadii.pill}
        style={styles.backNavIconWrap}
        contentStyle={styles.backNavIconContent}
      >
        <LeftIcon name="arrow-left" size={22} color={T.primary} />
      </GlassSurface>
      {label ? <Text style={styles.backNavLabel}>{label}</Text> : null}
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  variant = "hero",
  trailing,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  variant?: "hero" | "utility";
  trailing?: ReactNode;
}) {
  if (variant === "utility") {
    return (
      <View style={styles.screenHeaderUtility}>
        <View style={styles.screenHeaderUtilityRow}>
          <View style={styles.screenHeaderSideSlot}>
            <BackNavButton label="" onPress={onBack} />
          </View>
          <Text numberOfLines={2} style={styles.screenHeaderUtilityTitle}>{title}</Text>
          <View style={[styles.screenHeaderSideSlot, styles.screenHeaderTrailingSlot]}>
            {trailing ?? null}
          </View>
        </View>
        {subtitle ? <Text style={styles.screenHeaderUtilitySubtitle}>{subtitle}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.screenHeaderHero}>
      <BackNavButton label="" onPress={onBack} />
      <View style={styles.screenHeaderHeroCopy}>
        <Text style={styles.screenHeaderHeroTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenHeaderHeroSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <View style={styles.screenHeaderHeroTrailing}>{trailing}</View> : null}
    </View>
  );
}

export function SessionFooterNav(props: {
  venueName: string;
  vibe: string;
  intent: AppUser["defaultIntent"];
  sessionVisible: boolean;
  activeDestination: FooterDestination;
  showContextSummary?: boolean;
  bottomInset?: number;
  onNavigate: (destination: FooterDestination) => void;
}) {
  const items: Array<{ key: FooterDestination; label: string; icon: LeftIconName }> = [
    { key: "home", label: "Home", icon: "home" },
    { key: "nearby", label: "Map", icon: "map-pin" },
    { key: "session", label: "Venues", icon: "venue" },
    { key: "account", label: "Profile", icon: "user" },
  ];
  const activeIndex = items.findIndex((item) => item.key === props.activeDestination);
  const [trackWidth, setTrackWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(Math.max(activeIndex, 0))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: Math.max(activeIndex, 0),
      useNativeDriver: true,
      tension: 170,
      friction: 18,
    }).start();
  }, [activeIndex, slideAnim]);

  const trackHorizontalInset = 32;
  const trackInnerWidth = trackWidth > 0 ? Math.max(trackWidth - trackHorizontalInset, 0) : 0;
  const slotWidth = trackInnerWidth > 0 ? trackInnerWidth / items.length : 0;
  const bubbleTranslateX = slideAnim.interpolate({
    inputRange: items.map((_, index) => index),
    outputRange: items.map((_, index) => index * slotWidth + trackHorizontalInset / 2),
  });
  const activeItem = items[Math.max(activeIndex, 0)];
  const showPrivateBadge =
    !props.sessionVisible &&
    props.activeDestination !== "home" &&
    props.activeDestination !== "session" &&
    props.activeDestination !== "account";

  return (
    <View style={[styles.footerShell, { paddingBottom: Math.max(props.bottomInset ?? 0, 8) }]}>
      {props.showContextSummary !== false && props.sessionVisible && props.activeDestination !== "home" ? (
        <GlassSurface
          variant="medium"
          radius={glassRadii.compactCard}
          contentStyle={styles.footerSummaryRow}
        >
          <View style={styles.footerVenueBlock}>
            <Text style={styles.footerVenueLabel}>AT</Text>
            <Text style={styles.footerVenueName}>{props.venueName}</Text>
          </View>
          <View style={styles.footerSessionMeta}>
            <View style={[styles.footerPresenceDot, props.sessionVisible && styles.footerPresenceDotActive]} />
            <Text style={styles.footerSessionText}>
              {props.vibe} · {formatIntent(props.intent ?? "networking")}
            </Text>
          </View>
        </GlassSurface>
      ) : showPrivateBadge ? (
        <View style={styles.footerPrivateRow}>
          <GlassSurface
            variant="soft"
            radius={glassRadii.pill}
            contentStyle={styles.footerPrivateBadge}
          >
            <View style={styles.footerPrivateDot} />
            <Text style={styles.footerPrivateText}>Private until you choose to be seen</Text>
          </GlassSurface>
        </View>
      ) : null}
      <View style={styles.footerNavRow}>
        <LeftGlass
          variant="navigation"
          radius={glassRadii.navigation}
          style={styles.footerNavTrack}
          contentStyle={styles.footerNavTrackContent}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        >
          {slotWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.footerNavBubbleTrack,
                {
                  width: slotWidth,
                  transform: [{ translateX: bubbleTranslateX }],
                },
              ]}
            >
              <View style={styles.footerNavIconBubbleActive}>
                <LeftIcon
                  name={activeItem.icon}
                  size={16}
                  color={T.navActiveContent}
                  active={activeItem.icon !== "home"}
                />
              </View>
            </Animated.View>
          )}
          {items.map((item) => {
            const active = props.activeDestination === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => props.onNavigate(item.key)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [styles.footerNavItem, active && styles.footerNavItemActive, pressed && styles.footerNavItemPressed]}
              >
                {!active ? (
                  <>
                    <View style={styles.footerNavIconBubble}>
                      <LeftIcon name={item.icon} size={18} color={T.white} />
                    </View>
                    <Text style={styles.footerNavLabel}>{item.label}</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.footerNavIconPlaceholder} />
                    <Text style={[styles.footerNavLabel, styles.footerNavLabelActive]}>{item.label}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </LeftGlass>
      </View>
    </View>
  );
}

````

## src/components/styles/navigation.ts

````ts
import { T } from "../theme";
import { screenTypography } from "../token";

export function createNavigationStyles(contentRailWidth: "92%", contentRailMax: number) {
  return {
    backNavButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
      paddingRight: 0,
      paddingVertical: 4,
    },
    backNavButtonPressed: {
      opacity: 0.8,
    },
    backNavIconWrap: {
      width: 44,
      height: 44,
    },
    backNavIconContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    backNavLabel: {
      color: T.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    screenHeaderHero: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    screenHeaderHeroCopy: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    screenHeaderHeroTitle: {
      color: T.textPrimary,
      fontSize: screenTypography.heroTitle,
      lineHeight: screenTypography.heroTitleLineHeight,
      fontFamily: T.fontDisplayBold,
      letterSpacing: -0.7,
    },
    screenHeaderHeroSubtitle: {
      color: T.textSecondary,
      fontSize: screenTypography.subtitle,
      lineHeight: screenTypography.subtitleLineHeight,
      fontFamily: T.fontBody,
    },
    screenHeaderHeroTrailing: {
      alignSelf: "center",
    },
    screenHeaderUtility: {
      gap: 6,
    },
    screenHeaderUtilityRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
    },
    screenHeaderSideSlot: {
      width: 64,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    screenHeaderTrailingSlot: {
      alignItems: "flex-end",
    },
    screenHeaderUtilityTitle: {
      flex: 1,
      color: T.textPrimary,
      fontSize: screenTypography.utilityTitle,
      lineHeight: screenTypography.utilityTitleLineHeight,
      fontFamily: T.fontBodyBold,
      textAlign: "center",
    },
    screenHeaderUtilitySubtitle: {
      alignSelf: "center",
      maxWidth: 320,
      color: T.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: T.fontBody,
      textAlign: "center",
    },
    footerShell: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 24,
      paddingTop: 2,
      paddingBottom: 8,
      backgroundColor: "transparent",
      overflow: "visible",
    },
    footerSummaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    footerPrivateRow: {
      marginBottom: 10,
      alignItems: "center",
    },
    footerPrivateBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    footerPrivateDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.visibilityOff,
    },
    footerPrivateText: {
      color: T.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    footerVenueBlock: {
      flex: 1,
      gap: 3,
    },
    footerVenueLabel: {
      color: T.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
    },
    footerVenueName: {
      color: T.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: -0.4,
    },
    footerSessionMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: T.radiusLg,
      backgroundColor: T.borderBlackSoft,
      borderWidth: 1,
      borderColor: T.borderAccent,
      maxWidth: "58%",
    },
    footerPresenceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.textMuted,
    },
    footerPresenceDotActive: {
      backgroundColor: T.visibilityOn,
    },
    footerSessionText: {
      color: T.textPrimary,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    footerNavRow: {
      position: "relative",
      minHeight: 62,
      marginTop: 0,
      paddingHorizontal: 4,
      paddingTop: 2,
      paddingBottom: 1,
      overflow: "visible",
    },
    footerNavTrack: {
      position: "relative",
      alignSelf: "center",
      width: contentRailWidth,
      maxWidth: contentRailMax,
    },
    footerNavTrackContent: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingTop: 3,
      paddingBottom: 3,
    },
    footerNavBubbleTrack: {
      position: "absolute",
      top: -1,
      bottom: 0,
      alignItems: "center",
      justifyContent: "flex-start",
      zIndex: 0,
    },
    footerNavItem: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 2,
      zIndex: 1,
    },
    footerNavItemActive: {
      zIndex: 2,
      paddingTop: 3,
    },
    footerNavItemPressed: {
      opacity: 0.86,
    },
    footerNavIconBubble: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    footerNavIconPlaceholder: {
      width: 26,
      height: 22,
    },
    footerNavIconBubbleActive: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: T.primary,
      borderWidth: 1,
      borderColor: T.navActiveBorder,
      shadowColor: T.textPrimary,
      shadowOpacity: 0.14,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
      marginTop: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    footerNavIcon: {
      color: T.textMuted,
      fontSize: 22,
      lineHeight: 24,
    },
    footerNavIconActive: {
      color: T.onboardingAccent,
    },
    footerNavLabel: {
      color: T.white,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.1,
      width: "100%",
      textAlign: "center",
    },
    footerNavLabelActive: {
      color: T.navActiveContent,
      fontWeight: "800",
    },
  } as const;
}

````

## src/components/styles/features/home.ts

````ts
import { StyleSheet } from "react-native";
import { T } from "../../theme";

export const homeStyles = {
  homeGlassButton: { minHeight: 44 },
  // Native Liquid Glass must not inherit opacity from pressed ancestors.
  homeGlassButtonPressed: { transform: [{ translateY: 1 }] },
  homeGlassContent: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    minHeight: 44,
  },
  homePage: {
    gap: 16,
    paddingTop: 14,
  },
  homeVenueHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 0,
    gap: 8,
  },
  homeBrandLockup: {
    alignItems: "center",
    gap: 1,
    marginTop: 2,
  },
  homeBrandMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.borderBlack,
    shadowColor: T.primary,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  homeBrandLabel: {
    color: T.textMuted,
    fontSize: 7,
    lineHeight: 9,
    fontFamily: T.fontBodyBold,
    letterSpacing: 1.25,
    textTransform: "uppercase",
  },
  homeEditorialIntro: {
    marginTop: 16,
    marginBottom: 4,
    gap: 8,
    paddingLeft: 2,
  },
  homeEditorialEyebrow: {
    color: T.primary,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: T.fontBodyBold,
    letterSpacing: 1.15,
  },
  homeEditorialTitle: {
    flexShrink: 1,
    color: T.textPrimary,
    fontSize: 32,
    lineHeight: 36,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.7,
  },
  homeEditorialSupport: {
    maxWidth: "88%",
    color: T.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: T.fontBodyMedium,
  },
  homeProfileNudge: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceDim,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  homeProfileNudgeProgress: {
    color: T.primary,
    fontSize: 12,
    fontFamily: T.fontBodyBold,
  },
  homeProfileNudgeCopy: {
    flex: 1,
    color: T.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: T.fontBodyMedium,
  },
  homePresenceCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceCard,
    paddingHorizontal: 14,
    paddingTop: 14,
    shadowColor: T.primary,
    shadowOpacity: 0.045,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  homePresenceCardError: {
    borderColor: T.dangerBorder,
  },
  homePresencePrimaryRow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
    paddingBottom: 12,
  },
  homePresenceCopy: {
    minWidth: 0,
    gap: 4,
  },
  homePresenceStateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  homePresenceStateDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.visibilityOn,
  },
  homePresenceStateDotHidden: {
    backgroundColor: T.visibilityOff,
  },
  homePresenceStateDotError: {
    backgroundColor: T.danger,
  },
  homePresenceStateLabel: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
  },
  homePresenceVenue: {
    color: T.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.35,
  },
  homePresenceMessage: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyMedium,
  },
  homePresenceAction: {
    minWidth: 104,
    minHeight: 46,
    borderRadius: 15,
    backgroundColor: T.actionSurface,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: T.actionSurface,
    shadowOpacity: 0.15,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  homePresenceActionError: {
    backgroundColor: T.surfaceDim,
    borderWidth: 1,
    borderColor: T.dangerBorder,
    shadowOpacity: 0,
  },
  homePresenceActionText: {
    color: T.textPrimary,
    fontSize: 12,
    lineHeight: 15,
    fontFamily: T.fontBodyBold,
  },
  homePresenceActionTextError: {
    color: T.danger,
  },
  homePresencePrivacyRow: {
    minHeight: 38,
    borderTopWidth: 1,
    borderTopColor: T.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  homePresencePrivacyText: {
    flex: 1,
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyMedium,
  },
  homeEditorialSection: {
    marginTop: 8,
    gap: 12,
  },
  homeEditorialSectionHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 2,
  },
  homeEditorialSectionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  homeEditorialSectionEyebrow: {
    color: T.primary,
    fontSize: 9,
    lineHeight: 12,
    fontFamily: T.fontBodyBold,
    letterSpacing: 1,
  },
  homeEditorialSectionTitle: {
    color: T.textPrimary,
    fontSize: 23,
    lineHeight: 28,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.45,
  },
  homeEditorialSectionMeta: {
    color: T.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyMedium,
  },
  homeFeaturedPlaceCard: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceCard,
    shadowColor: T.primary,
    shadowOpacity: 0.075,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  homeFeaturedPlaceCardPressed: {
    opacity: 0.94,
    transform: [{ translateY: 2 }],
  },
  homeFeaturedPlaceImageWrap: {
    height: 188,
    backgroundColor: T.surfaceDim,
    overflow: "hidden",
  },
  homeFeaturedPlaceShade: {
    ...StyleSheet.absoluteFillObject,
  },
  homeFeaturedPlaceSignal: {
    position: "absolute",
    left: 14,
    top: 14,
  },
  homeFeaturedPlaceSignalContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  homeFeaturedPlaceSignalDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  homeFeaturedPlaceSignalText: {
    color: T.textPrimary,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: T.fontBodyBold,
  },
  homeFeaturedPlaceBody: {
    minHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  homeFeaturedPlaceCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  homeFeaturedPlaceName: {
    color: T.textPrimary,
    fontSize: 21,
    lineHeight: 25,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.4,
  },
  homeFeaturedPlaceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  homeFeaturedPlaceMeta: {
    color: T.secondary,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: T.fontBodyMedium,
  },
  homeFeaturedPlaceArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.actionSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  homePeopleCount: {
    color: T.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: T.fontBodyBold,
  },
  homePersonCard: {
    minHeight: 116,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.primary,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: T.primary,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  homePersonAvatarShell: {
    borderRadius: 26,
    backgroundColor: T.surfaceCard,
  },
  homePersonCardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  homePersonNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  homePersonName: {
    color: T.textPrimary,
    fontSize: 19,
    lineHeight: 23,
    fontFamily: T.fontDisplayBold,
  },
  homePersonTime: {
    color: T.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
  },
  homePersonIntent: {
    color: T.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
    textTransform: "capitalize",
  },
  homePersonHint: {
    marginTop: 3,
    color: T.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyMedium,
  },
  homePersonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  homePeopleEmptyCard: {
    minHeight: 94,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceCard,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  homePeopleEmptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: T.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  homePeopleEmptyCopy: {
    flex: 1,
    gap: 3,
  },
  homePeopleEmptyTitle: {
    color: T.textPrimary,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: T.fontBodyBold,
  },
  homePeopleEmptyText: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyMedium,
  },
  homePeoplePrivateCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceCard,
    padding: 16,
    gap: 10,
  },
  homePeoplePrivateIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: T.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  homePeoplePrivateCopy: {
    gap: 4,
  },
  homePeoplePrivateTitle: {
    color: T.textPrimary,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: T.fontBodyBold,
  },
  homePeoplePrivateText: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBodyMedium,
  },
  homePeoplePrivateAction: {
    minHeight: 34,
    borderTopWidth: 1,
    borderTopColor: T.border,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  homePeoplePrivateActionText: {
    color: T.primary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyBold,
  },
  homeExperienceCard: {
    minHeight: 126,
    borderRadius: 22,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderColor: T.border,
    borderLeftColor: T.primary,
    backgroundColor: T.surfaceCard,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: T.primary,
    shadowOpacity: 0.045,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  homeExperienceDateBlock: {
    width: 54,
    minHeight: 72,
    borderRightWidth: 1,
    borderRightColor: T.borderBlack,
    justifyContent: "center",
  },
  homeExperienceMonth: {
    color: T.primary,
    fontSize: 9,
    lineHeight: 12,
    fontFamily: T.fontBodyBold,
    letterSpacing: 0.8,
  },
  homeExperienceDay: {
    color: T.textPrimary,
    fontSize: 32,
    lineHeight: 37,
    fontFamily: T.fontDisplayBold,
  },
  homeExperienceCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  homeExperienceTitle: {
    color: T.textPrimary,
    fontSize: 17,
    lineHeight: 21,
    fontFamily: T.fontDisplayBold,
  },
  homeExperienceMeta: {
    color: T.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: T.fontBodyMedium,
  },
  homeExperienceSeats: {
    color: T.primary,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: T.fontBodyBold,
  },
  homeExperienceEmptyCard: {
    minHeight: 108,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.border,
    borderStyle: "dashed",
    backgroundColor: T.surfaceCard,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  homeExperienceEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  homeExperienceHostLink: {
    alignSelf: "flex-start",
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  homeExperienceHostLinkText: {
    color: T.primary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyBold,
  },
  homeHeroHeading: {
    gap: 0,
    marginTop: 8,
    marginBottom: 6,
  },
  homeGreetingInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  homeGreetingInlineName: {
    color: T.textPrimary,
    fontSize: 15,
    lineHeight: 18,
    fontFamily: T.fontDisplayBold,
  },
  homeGreetingActivityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.venueSurface,
  },
  homeHeroTitleAccent: {
    color: T.textPrimary,
    fontSize: 29,
    lineHeight: 34,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.55,
  },
  homeHeroSupportText: {
    marginTop: 7,
    color: T.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyMedium,
    maxWidth: "78%",
  },
  homePresenceIndicatorWrap: {
    position: "absolute",
    right: -5,
    bottom: -5,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  homePresenceIndicatorPulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  homePresenceIndicatorPulseVisible: {
    backgroundColor: T.visibilityOnSoft,
  },
  homePresenceIndicatorPulseHidden: {
    backgroundColor: T.visibilityOffSoft,
  },
  homePresenceIndicatorDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: T.ink,
  },
  homePresenceIndicatorDotVisible: {
    backgroundColor: T.visibilityOn,
  },
  homePresenceIndicatorDotHidden: {
    backgroundColor: T.visibilityOff,
  },
  homeHeroCardV2: {
    borderRadius: 24,
    backgroundColor: T.surfaceCard,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    shadowColor: T.primary,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    gap: 10,
  },
  homeHeroCardV2Unified: {
    minHeight: 286,
    borderRadius: 28,
    backgroundColor: T.surfaceCard,
    borderWidth: 1,
    padding: 10,
    shadowColor: T.primary,
    shadowOpacity: 0.035,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  homeHeroCardV2Visible: {
    borderColor: T.border,
  },
  homeHeroCardV2Hidden: {
    borderColor: T.borderBlack,
  },
  homeHeroCardV2Error: {
    borderColor: T.dangerBorder,
  },
  homeHeroVisibleShell: {
    gap: 9,
  },
  homeHeroVenueArtStacked: {
    width: "100%",
    height: 158,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.borderBlackSoft,
    overflow: "hidden",
  },
  homeVenueIllustrationImage: {
    width: "100%",
    height: "100%",
  },
  homeHeroVenueArtShade: {
    ...StyleSheet.absoluteFillObject,
  },
  homeHeroImageStatusGlass: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  homeHeroImageStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  homeHeroImageStatusPillVisible: {
    backgroundColor: T.visibilityOnSoft,
    borderColor: T.visibilityOnSoft,
  },
  homeHeroImageStatusPillHidden: {
    backgroundColor: T.visibilityOffSoft,
    borderColor: T.visibilityOffSoft,
  },
  homeHeroImageStatusPillError: {
    backgroundColor: T.dangerDim,
    borderColor: T.dangerBorder,
  },
  homeHeroImageStatusText: {
    color: T.textPrimary,
    fontSize: 10,
    lineHeight: 12,
    fontFamily: T.fontBodyBold,
    letterSpacing: 0.35,
  },
  homeHeroPeopleGlass: {
    position: "absolute",
    left: 14,
    bottom: 14,
  },
  homeHeroPeopleOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  homeHeroAvatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  homeHeroAvatarBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(244,242,238,0.92)",
    borderWidth: 1.5,
    borderColor: "rgba(244,242,238,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  homeHeroAvatarBubbleOverlap: {
    marginLeft: -5,
  },
  homeHeroAvatarCountBubble: {
    backgroundColor: "rgba(244,242,238,0.88)",
  },
  homeHeroAvatarLabel: {
    color: T.textPrimary,
    fontSize: 8,
    lineHeight: 9,
    fontFamily: T.fontBodyBold,
  },
  homeHeroAvatarCountText: {
    color: T.textPrimary,
    fontSize: 9,
    lineHeight: 10,
    fontFamily: T.fontBodyBold,
  },
  homeHeroPeopleOverlayText: {
    color: T.textPrimary,
    fontSize: 11,
    lineHeight: 13,
    fontFamily: T.fontBodyMedium,
  },
  homeHeroVisibleInfoStack: {
    gap: 12,
  },
  homeHeroVisibleInfoRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 6,
    paddingTop: 2,
  },
  homeHeroVisibleInfoCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  homeHeroPresenceEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 0,
  },
  homeHeroPresenceEyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.visibilityOn,
  },
  homeHeroPresenceEyebrowDotHidden: {
    backgroundColor: T.visibilityOff,
  },
  homeHeroPresenceEyebrowDotError: {
    backgroundColor: T.danger,
  },
  homeHeroPresenceEyebrow: {
    color: T.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyBold,
    letterSpacing: 0.9,
  },
  homeHeroPresenceEyebrowHidden: {
    color: T.textPrimary,
  },
  homeHeroPresenceEyebrowError: {
    color: T.dangerText,
  },
  homeHeroVenueNameVisible: {
    color: T.textPrimary,
    fontSize: 18,
    lineHeight: 21,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.35,
    maxWidth: "100%",
  },
  homeHeroStatusLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  homeHeroStatusLineText: {
    color: T.textPrimary,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: T.fontBodyMedium,
  },
  homeHeroCardCopyVisible: {
    color: T.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: T.fontBodyMedium,
    maxWidth: "100%",
  },
  homeVisibleHeroButtonInline: {
    width: 132,
    minHeight: 62,
    borderRadius: 16,
    backgroundColor: T.actionSurface,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 0,
  },
  homeVisibleHeroButtonInlineHidden: {
    backgroundColor: T.actionSurface,
  },
  homeVisibleHeroButtonInlineError: {
    backgroundColor: T.surfaceDim,
    borderWidth: 1,
    borderColor: T.dangerBorder,
  },
  homeVisibleHeroButtonMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.actionContentSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  homeVisibleHeroButtonTextInline: {
    color: T.actionContent,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: T.fontBodyBold,
    textAlign: "left",
    flexShrink: 1,
  },
  homeVisibleHeroButtonTextInlineError: {
    color: T.dangerText,
  },
  homeHeroVisibleDivider: {
    height: 1,
    backgroundColor: T.border,
    marginHorizontal: 6,
  },
  homeHeroPrivacyRowVisible: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginHorizontal: 6,
    marginBottom: 2,
    backgroundColor: T.surfaceGlassStrong,
    borderWidth: 1,
    borderColor: T.border,
  },
  homeHeroPrivacyIconWrapVisible: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.surfaceMid,
    alignItems: "center",
    justifyContent: "center",
  },
  homeHeroPrivacyCopyVisible: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  homeHeroPrivacyLabelVisible: {
    color: T.textPrimary,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: T.fontBodyBold,
  },
  homeHeroPrivacyTextVisible: {
    color: T.textSecondary,
    fontSize: 9,
    lineHeight: 12,
    fontFamily: T.fontBodyMedium,
  },
  homeExploreHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 26,
    marginBottom: 10,
  },
  homeExploreHeaderCopy: {
    gap: 4,
  },
  homeExploreTitle: {
    color: T.textPrimary,
    fontSize: 23,
    lineHeight: 28,
    fontFamily: T.fontBodyBold,
    letterSpacing: -0.45,
  },
  homeExploreMeta: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: T.fontBodyMedium,
  },
  homeExploreSideNote: {
    color: T.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyBold,
  },
  homeVenueGrid: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 10,
  },
  homeVenueEmptyState: {
    minHeight: 156,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceGlass,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  homeVenueEmptyTitle: {
    color: T.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: T.fontBodyBold,
  },
  homeVenueEmptyBody: {
    color: T.textMuted,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 280,
    textAlign: "center",
    fontFamily: T.fontBody,
  },
  homeVenueGridSingle: {
    flexDirection: "column",
  },
  homeVenueCard: {
    flex: 1,
    minHeight: 126,
    borderRadius: 22,
    backgroundColor: T.surfaceCard,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: T.primary,
    shadowOpacity: 0.045,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  homeVenueCardSingle: {
    flex: 1,
    minHeight: 126,
  },
  homeVenueCardRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  homeVenueThumb: {
    width: 100,
    height: 100,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  },
  homeVenueThumbFeatured: {
    borderWidth: 1,
    borderColor: T.borderBlack,
  },
  homeVenueCardBody: {
    flex: 1,
    justifyContent: "space-between",
    gap: 6,
  },
  homeVenueCardTopGroup: {
    gap: 4,
  },
  homeVenueCardName: {
    color: T.textPrimary,
    fontSize: 17,
    lineHeight: 21,
    fontFamily: T.fontBodyBold,
    marginBottom: 0,
    flex: 1,
  },
  homeVenueCardNameFeatured: {
    fontSize: 17,
    lineHeight: 21,
  },
  homeVenueStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 0,
  },
  homeVenueStatusText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: T.fontBodyBold,
  },
  homeVenuePeopleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  homeVenueSignalIconWrap: {
    minHeight: 20,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  homeVenueSignalBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    marginLeft: 2,
  },
  homeVenueSignalBar: {
    width: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  homeVenueSignalBarActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  homeVenueSignalBarInactive: {
    backgroundColor: T.surfaceGlassUltra,
  },
  homeVenueDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  homeVenueDistanceText: {
    color: T.secondary,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: T.fontBodyMedium,
  },
  homeVenueChevronBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.surfaceGlassUltra,
    borderWidth: 1,
    borderColor: T.border,
    alignSelf: "center",
  },
  homeSafetyCard: {
    minHeight: 74,
    borderRadius: 22,
    backgroundColor: T.venueSurface,
    borderWidth: 1,
    borderColor: T.borderBlackSoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: T.venueAccent,
    shadowOpacity: 0.035,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  homeSafetyCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  homeSafetyCardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.venueAccentSoft,
  },
  homeSafetyCardCopy: {
    flex: 1,
    gap: 1,
  },
  homeSafetyCardTitle: {
    color: T.primary,
    fontSize: 15,
    lineHeight: 18,
    fontFamily: T.fontBodyBold,
  },
  homeSafetyCardSubtitle: {
    color: T.secondary,
    fontSize: 12,
    lineHeight: 14,
    fontFamily: T.fontBodyMedium,
  },
  homePrivateMapTexture: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.surfaceDim,
  },
} as const;

````

## src/screens/left/HomeScreen.tsx

````tsx
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Image, Linking, Pressable, Text, View } from "react-native";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import {
  getVenueConfidenceLabel,
  resolveVenueConfidence,
} from "../../features/location/venue-confidence";
import { formatIntent, formatRemaining } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";
import { LeftGlass } from "../../components/glass/LeftGlass";
import { LeftAvatar } from "../../components/left/LeftAvatar";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { VenueIdentityBlock } from "../../components/left/ui";
import type { AppUser, NearbyFeedItem, VenueActivityEnvelope, VenueContextSummary, VenueExperience } from "../../types/left-domain";
import { fetchVenuePracticalDetails } from "../../features/venues/venue-details-service";

const VENUE_ILLUSTRATIONS = {
  cafe: require("../../../output/illustrations/venues/cafe.png"),
  restaurant: require("../../../output/illustrations/venues/restaurant.png"),
  bar: require("../../../output/illustrations/venues/bar.png"),
  coworking: require("../../../output/illustrations/venues/coworking.png"),
  market: require("../../../output/illustrations/venues/market.png"),
  park: require("../../../output/illustrations/venues/park.png"),
  library: require("../../../output/illustrations/venues/library.png"),
  generic: require("../../../output/illustrations/venues/generic-place.png"),
} as const;

export function HomeScreen({
  venue,
  nearbyVenues,
  venueActivityById,
  experiences,
  feed,
  sessionVisible,
  venueHidden,
  activationSubmitting = false,
  activationError = false,
  onBecomeVisible,
  onOpenAllVenues,
  onOpenVenueDetail,
  onOpenProfile,
  onOpenExperience,
  onCreateExperience,
  onOpenSafety,
}: {
  firstName: string;
  venue: VenueContextSummary;
  nearbyVenues: RuntimeVenueCandidate[];
  venueActivityById: Record<string, VenueActivityEnvelope>;
  experiences: VenueExperience[];
  feed: NearbyFeedItem[];
  intent: AppUser["defaultIntent"];
  vibes: string[];
  sessionVisible: boolean;
  venueHidden: boolean;
  activationSubmitting?: boolean;
  activationError?: boolean;
  onBecomeVisible: () => void;
  onOpenAllVenues: () => void;
  onOpenVenueDetail: (venue: RuntimeVenueCandidate) => void;
  onOpenProfile: (item: NearbyFeedItem) => void;
  onOpenExperience: (experience: VenueExperience) => void;
  onCreateExperience: () => void;
  onOpenSafety: () => void;
  profileCompletion: number;
  onCompleteProfile: () => void;
}) {
  const venueName = resolveVenueName(venue.venueName, nearbyVenues);
  const currentVenueCandidate =
    nearbyVenues.find((candidate) => candidate.id === venue.venueId) ??
    nearbyVenues.find((candidate) => candidate.name === venueName) ??
    null;
  const isVisible = sessionVisible && !venueHidden;
  const venueConfidence = resolveVenueConfidence(venue, nearbyVenues);
  const nearbyCards = buildNearbyVenueCards(nearbyVenues, venueName, venueActivityById);
  const photoVenueIds = JSON.stringify(nearbyCards.map((card) => card.id));
  const [photos, setPhotos] = useState<Record<string, NonNullable<RuntimeVenueCandidate["photo"]>>>({});
  const [loadedPhotos, setLoadedPhotos] = useState<Record<string, string>>({});
  const [failedPhotos, setFailedPhotos] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    setPhotos({});
    setLoadedPhotos({});
    setFailedPhotos({});
    void Promise.all((JSON.parse(photoVenueIds) as string[]).map(async (id) => {
      try {
        const details = await fetchVenuePracticalDetails(id);
        if (!cancelled && details?.photo) {
          const photo = details.photo;
          setPhotos((current) => ({ ...current, [id]: photo }));
        }
      } catch { /* Keep the illustration when photos are unavailable. */ }
    }));
    return () => { cancelled = true; };
  }, [photoVenueIds]);
  const photoImage = (id: string) => {
    const photo = photos[id];
    return photo && failedPhotos[id] !== photo.uri ? (
      <Image source={{ uri: photo.uri }} resizeMode="cover"
        style={{ position: "absolute", inset: 0 }}
        onLoad={() => setLoadedPhotos((current) => ({ ...current, [id]: photo.uri }))}
        onError={() => {
          setFailedPhotos((current) => ({ ...current, [id]: photo.uri }));
          setLoadedPhotos((current) => ({ ...current, [id]: "" }));
        }} />
    ) : null;
  };
  const photoCredit = (id: string) => {
    const photo = photos[id];
    if (!photo || loadedPhotos[id] !== photo.uri) return null;
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 6 }}>
        <Text numberOfLines={1} style={{ fontSize: 12, color: T.textSecondary }}>Google Maps</Text>
        {photo.attributions.map((author, index) => author.uri ? (
          <Pressable key={index} accessibilityRole="link" accessibilityLabel={`Photo by ${author.displayName}`}
            style={{ minHeight: 44, justifyContent: "center", flexShrink: 1 }}
            onPress={(event) => { event.stopPropagation(); void Linking.openURL(author.uri!).catch(() => {}); }}>
            <Text style={{ fontSize: 12, color: T.textSecondary }}>· {author.displayName}</Text>
          </Pressable>
        ) : <Text key={index} style={{ fontSize: 12, color: T.textSecondary }}>· {author.displayName}</Text>)}
      </View>
    );
  };
  const featuredPlace = nearbyCards[0] ?? null;
  const morePlaces = nearbyCards.slice(1);
  const featuredPerson = isVisible ? feed[0] ?? null : null;
  const confidenceLabel = getVenueConfidenceLabel(venueConfidence);
  const venueDistanceLabel = currentVenueCandidate?.distanceMeters != null
    ? formatDistanceLabel(currentVenueCandidate.distanceMeters)
    : nearbyCards[0]?.distanceLabel ?? "Nearby now";
  const placesContext =
    nearbyCards.length === 0
      ? "No nearby places detected yet"
      : venueConfidence === "confirmed"
      ? nearbyCards[0]?.distanceLabel
        ? `Closest ${nearbyCards[0].distanceLabel}`
        : "Nearby right now"
      : venueConfidence === "nearby_guess"
        ? "Likely places around you"
        : "Venue confirmation may be needed";
  const hiddenCardHasError = activationError || venueConfidence === "needs_confirmation";
  const hiddenMessage = hiddenCardHasError
    ? "We couldn't confirm this place yet. Check your current place before becoming visible."
    : "You're private until you choose to be discovered.";
  const presenceMessage = isVisible ? "You’re sharing this moment here." : hiddenMessage;
  const primaryLabel = isVisible ? "Manage visibility" : activationSubmitting ? "Going visible..." : "Go visible";
  return (
    <View style={styles.homePage}>
      <View style={styles.homeVenueHeader}>
        <VenueIdentityBlock
          icon="map-pin"
          title={venueName}
          metaIcon="radio"
          metaText={`${confidenceLabel} · ${venueDistanceLabel}`}
        />
        <View style={styles.homeBrandLockup}>
          <View style={styles.homeBrandMark}>
            <LeftLogoMark size={24} tone="light" />
            <PresenceIndicator isVisible={isVisible} />
          </View>
          <Text style={styles.homeBrandLabel}>Left</Text>
        </View>
      </View>

      <View
        style={[
          styles.homePresenceCard,
          hiddenCardHasError && styles.homePresenceCardError,
        ]}
      >
        <View style={styles.homePresencePrimaryRow}>
          <View style={styles.homePresenceCopy}>
            <View style={styles.homePresenceStateRow}>
              <View
                style={[
                  styles.homePresenceStateDot,
                  !isVisible && styles.homePresenceStateDotHidden,
                  hiddenCardHasError && styles.homePresenceStateDotError,
                ]}
              />
              <Text style={styles.homePresenceStateLabel}>
                {isVisible ? "Visible here" : "Private here"}
              </Text>
            </View>
            <Text style={styles.homePresenceVenue}>{venueName}</Text>
            <Text style={styles.homePresenceMessage}>{presenceMessage}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            accessibilityHint={hiddenCardHasError ? "Resolve the venue issue before becoming visible." : "Open venue visibility controls."}
            accessibilityState={{ disabled: (!isVisible && hiddenCardHasError) || activationSubmitting, busy: activationSubmitting }}
            disabled={(!isVisible && hiddenCardHasError) || activationSubmitting}
            onPress={onBecomeVisible}
            style={({ pressed }) => [styles.homeGlassButton, pressed && !activationSubmitting && !hiddenCardHasError && styles.homeGlassButtonPressed]}
          >
            <LeftGlass isInteractive radius={15} contentStyle={[styles.homePresenceAction, styles.homeGlassContent, hiddenCardHasError && styles.homePresenceActionError]}>
              {activationSubmitting ? (
                <ActivityIndicator size="small" color={hiddenCardHasError ? T.danger : T.primary} />
              ) : (
                <LeftIcon
                  name={isVisible ? "eye-off" : "eye"}
                  size={18}
                  color={hiddenCardHasError ? T.danger : T.primary}
                />
              )}
              <Text style={[styles.homePresenceActionText, hiddenCardHasError && styles.homePresenceActionTextError]}>
                {isVisible ? "Manage visibility" : "Go visible"}
              </Text>
            </LeftGlass>
          </Pressable>
        </View>
        <Pressable
          onPress={onOpenSafety}
          accessibilityRole="button"
          accessibilityLabel="Open privacy and safety controls"
          style={({ pressed }) => [styles.homePresencePrivacyRow, pressed && styles.iconButtonPressed]}
        >
          <LeftIcon name="shield" size={15} color={T.primary} />
          <Text style={styles.homePresencePrivacyText}>Privacy and safety controls</Text>
          <LeftIcon name="chevron-right" size={16} color={T.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.homeEditorialSection}>
        <View style={styles.homeEditorialSectionHeader}>
          <View style={styles.homeEditorialSectionCopy}>
            <Text style={styles.homeEditorialSectionTitle}>People here</Text>
          </View>
        </View>

        {featuredPerson ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${featuredPerson.firstName}'s profile`}
            onPress={() => onOpenProfile(featuredPerson)}
            style={({ pressed }) => [styles.homeGlassButton, pressed && styles.homeGlassButtonPressed]}
          >
            <LeftGlass isInteractive radius={22} contentStyle={[styles.homePersonCard, styles.homeGlassContent]}>
              <View style={styles.homePersonAvatarShell}>
                <LeftAvatar name={featuredPerson.firstName} avatarStyle={featuredPerson.avatarStyle} />
              </View>
              <View style={styles.homePersonCardCopy}>
                <View style={styles.homePersonNameRow}>
                  <Text style={styles.homePersonName}>{featuredPerson.firstName}</Text>
                  <Text style={styles.homePersonTime}>{formatRemaining(featuredPerson.sessionDurationRemaining)}</Text>
                </View>
                <Text style={styles.homePersonIntent}>{formatIntent(featuredPerson.intent)}</Text>
                <Text numberOfLines={2} style={styles.homePersonHint}>
                  {featuredPerson.hintText ?? `Open to ${featuredPerson.primaryVibe?.toLowerCase() ?? "a meaningful conversation"}.`}
                </Text>
              </View>
              <View style={styles.homePersonArrow}>
                <LeftIcon name="chevron-right" size={18} color={T.textPrimary} />
              </View>
            </LeftGlass>
          </Pressable>
        ) : isVisible ? (
          <View style={styles.homePeopleEmptyCard}>
            <View style={styles.homePeopleEmptyIcon}>
              <LeftIcon name="users" size={20} color={T.primary} />
            </View>
            <View style={styles.homePeopleEmptyCopy}>
              <Text style={styles.homePeopleEmptyTitle}>You’re the first one here</Text>
              <Text style={styles.homePeopleEmptyText}>We’ll show someone only when they choose to be visible too.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.homePeoplePrivateCard}>
            <View style={styles.homePeoplePrivateIcon}>
              <LeftIcon name="lock" size={20} color={T.primary} />
            </View>
            <View style={styles.homePeoplePrivateCopy}>
              <Text style={styles.homePeoplePrivateTitle}>No profiles are shown while you’re private</Text>
              <Text style={styles.homePeoplePrivateText}>Become visible when you want to see people who are open to meeting here.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go visible"
              onPress={onBecomeVisible}
              style={({ pressed }) => [styles.homeGlassButton, pressed && styles.homeGlassButtonPressed]}
            >
              <LeftGlass isInteractive radius={14} contentStyle={[styles.homePeoplePrivateAction, styles.homeGlassContent]}>
                <Text style={styles.homePeoplePrivateActionText}>Go visible</Text>
                <LeftIcon name="arrow-right" size={15} color={T.primary} />
              </LeftGlass>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.homeEditorialSection}>
        <View style={styles.homeEditorialSectionHeader}>
          <View style={styles.homeEditorialSectionCopy}>
            <Text style={styles.homeEditorialSectionTitle}>Around you now</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all nearby venues"
            onPress={onOpenAllVenues}
            hitSlop={10}
            style={({ pressed }) => pressed && styles.iconButtonPressed}
          >
            <Text style={styles.homeExploreSideNote}>See all →</Text>
          </Pressable>
        </View>

        {featuredPlace ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${featuredPlace.name}`}
            onPress={() => onOpenVenueDetail(featuredPlace.venue)}
            style={({ pressed }) => [styles.homeGlassButton, pressed && styles.homeGlassButtonPressed]}
          >
            <LeftGlass isInteractive radius={24} contentStyle={[styles.homeFeaturedPlaceCard, styles.homeGlassContent]}>
              <View style={styles.homeFeaturedPlaceImageWrap}>
                <Image source={featuredPlace.illustration} style={styles.homeVenueIllustrationImage} resizeMode="cover" />
                {photoImage(featuredPlace.id)}
                <LinearGradient
                  colors={["transparent", "rgba(26,24,21,0.28)"]}
                  start={{ x: 0.5, y: 0.45 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.homeFeaturedPlaceShade}
                />
                <GlassSurface
                  variant="soft"
                  radius={glassRadii.pill}
                  style={styles.homeFeaturedPlaceSignal}
                  contentStyle={styles.homeFeaturedPlaceSignalContent}
                >
                  <View style={[styles.homeFeaturedPlaceSignalDot, { backgroundColor: featuredPlace.signalBarColor }]} />
                  <Text style={styles.homeFeaturedPlaceSignalText}>{featuredPlace.energyLabel}</Text>
                </GlassSurface>
              </View>
              {photoCredit(featuredPlace.id)}
              <View style={styles.homeFeaturedPlaceBody}>
                <View style={styles.homeFeaturedPlaceCopy}>
                  <Text style={styles.homeFeaturedPlaceName}>{featuredPlace.name}</Text>
                  <View style={styles.homeFeaturedPlaceMetaRow}>
                    <LeftIcon name="map-pin" size={14} color={T.primary} />
                    <Text style={styles.homeFeaturedPlaceMeta}>{featuredPlace.distanceLabel}</Text>
                  </View>
                </View>
                <View style={styles.homeFeaturedPlaceArrow}>
                  <LeftIcon name="arrow-up-right" size={19} color={T.actionContent} />
                </View>
              </View>
            </LeftGlass>
          </Pressable>
        ) : (
          <View accessibilityRole="text" style={styles.homeVenueEmptyState}>
            <LeftIcon name="map-pin" size={21} color={T.textMuted} />
            <Text style={styles.homeVenueEmptyTitle}>No live venue data yet</Text>
            <Text style={styles.homeVenueEmptyBody}>Keep location access on. Places detected near you will appear here.</Text>
          </View>
        )}
      </View>

      <View style={styles.homeEditorialSection}>
        <View style={styles.homeEditorialSectionHeader}>
          <View style={styles.homeEditorialSectionCopy}>
            <Text style={styles.homeEditorialSectionTitle}>{experiences[0] ? "Something to join" : "Make a simple plan"}</Text>
          </View>
        </View>
        {experiences[0] ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${experiences[0].title}`}
            onPress={() => onOpenExperience(experiences[0])}
            style={({ pressed }) => [styles.homeGlassButton, pressed && styles.homeGlassButtonPressed]}
          >
            <LeftGlass isInteractive radius={22} contentStyle={[styles.homeExperienceCard, styles.homeGlassContent]}>
              <View style={styles.homeExperienceDateBlock}>
                <Text style={styles.homeExperienceMonth}>{formatExperienceMonth(experiences[0].startsAt)}</Text>
                <Text style={styles.homeExperienceDay}>{formatExperienceDay(experiences[0].startsAt)}</Text>
              </View>
              <View style={styles.homeExperienceCopy}>
                <Text style={styles.homeExperienceTitle}>{experiences[0].title}</Text>
                <Text style={styles.homeExperienceMeta}>{`${formatExperienceTime(experiences[0].startsAt)} · ${experiences[0].venueName}`}</Text>
                <Text style={styles.homeExperienceSeats}>{`${experiences[0].attendeeCount}/${experiences[0].capacity} going`}</Text>
              </View>
              <View style={styles.homePersonArrow}>
                <LeftIcon name="arrow-up-right" size={17} color={T.textPrimary} />
              </View>
            </LeftGlass>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Propose a small gathering"
            onPress={onCreateExperience}
            style={({ pressed }) => [styles.homeGlassButton, pressed && styles.homeGlassButtonPressed]}
          >
            <LeftGlass isInteractive radius={22} contentStyle={[styles.homeExperienceEmptyCard, styles.homeGlassContent]}>
              <View style={styles.homeExperienceEmptyIcon}>
                <LeftIcon name="calendar" size={20} color={T.primary} />
              </View>
              <View style={styles.homeExperienceCopy}>
                <Text style={styles.homeExperienceTitle}>Host something small</Text>
                <Text style={styles.homeExperienceMeta}>Suggest a place and plan. Left reviews it before it appears nearby.</Text>
              </View>
              <View style={styles.homePersonArrow}>
                <LeftIcon name="arrow-up-right" size={17} color={T.textPrimary} />
              </View>
            </LeftGlass>
          </Pressable>
        )}
        {experiences[0] ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Propose a gathering"
            onPress={onCreateExperience}
            style={({ pressed }) => [styles.homeExperienceHostLink, pressed && styles.iconButtonPressed]}
          >
            <Text style={styles.homeExperienceHostLinkText}>Have an idea? Propose a gathering</Text>
            <LeftIcon name="arrow-right" size={15} color={T.primary} />
          </Pressable>
        ) : null}
      </View>

      {morePlaces.length > 0 ? (
        <View style={styles.homeEditorialSection}>
          <View style={styles.homeEditorialSectionHeader}>
            <View style={styles.homeEditorialSectionCopy}>
              <Text style={styles.homeEditorialSectionTitle}>More around you</Text>
              <Text style={styles.homeEditorialSectionMeta}>{placesContext}</Text>
            </View>
          </View>
          <View style={styles.homeVenueGrid}>
            {morePlaces.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.name}`}
                accessibilityHint="Shows venue details"
                onPress={() => onOpenVenueDetail(item.venue)}
                style={({ pressed }) => [styles.homeGlassButton, pressed && styles.homeGlassButtonPressed]}
              >
                <LeftGlass isInteractive radius={22} contentStyle={[styles.homeVenueCard, styles.homeGlassContent]}>
                  <View style={styles.homeVenueCardRow}>
                    <View style={styles.homeVenueThumb}>
                      <Image source={item.illustration} style={styles.homeVenueIllustrationImage} resizeMode="cover" />
                      {photoImage(item.id)}
                    </View>
                    <View style={styles.homeVenueCardBody}>
                      <View style={styles.homeVenueCardTopGroup}>
                        <Text style={styles.homeVenueCardName}>{item.name}</Text>
                        <Text style={[styles.homeVenueStatusText, { color: item.signalBarColor }]}>{item.energyLabel}</Text>
                      </View>
                      <View style={styles.homeVenueDistanceRow}>
                        <LeftIcon name="map-pin" size={15} color={T.textMuted} />
                        <Text style={styles.homeVenueDistanceText}>{item.distanceLabel}</Text>
                      </View>
                    </View>
                    <View style={styles.homeVenueChevronBubble}>
                      <LeftIcon name="chevron-right" size={20} color={T.secondary} />
                    </View>
                  </View>
                  {photoCredit(item.id)}
                </LeftGlass>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open privacy and safety controls"
        onPress={onOpenSafety}
        style={({ pressed }) => [styles.homeGlassButton, pressed && styles.homeGlassButtonPressed]}
      >
        <LeftGlass isInteractive radius={22} contentStyle={[styles.homeSafetyCard, styles.homeGlassContent]}>
          <View style={styles.homeSafetyCardLeft}>
            <View style={styles.homeSafetyCardIconWrap}>
              <LeftIcon name="shield" size={20} color={T.primary} />
            </View>
            <View style={styles.homeSafetyCardCopy}>
              <Text style={styles.homeSafetyCardTitle}>You stay in control</Text>
              <Text style={styles.homeSafetyCardSubtitle}>Review visibility, hiding, blocking, and reporting.</Text>
            </View>
          </View>
          <LeftIcon name="chevron-right" size={22} color={T.textSecondary} />
        </LeftGlass>
      </Pressable>
    </View>
  );
}

function PresenceIndicator({ isVisible }: { isVisible: boolean }) {
  return (
    <View style={styles.homePresenceIndicatorWrap}>
      <View
        style={[
          styles.homePresenceIndicatorDot,
          isVisible ? styles.homePresenceIndicatorDotVisible : styles.homePresenceIndicatorDotHidden,
        ]}
      />
    </View>
  );
}

function resolveVenueName(value: string, nearbyVenues: RuntimeVenueCandidate[]) {
  const trimmed = value.trim();
  if (trimmed && trimmed !== "Current venue" && trimmed !== "Visibility off") {
    return trimmed;
  }
  const fallbackVenue = nearbyVenues.find((candidate) => candidate.name.trim());
  return fallbackVenue?.name.trim() || "nearby venue";
}

function buildNearbyVenueCards(
  nearbyVenues: RuntimeVenueCandidate[],
  currentVenueName: string,
  venueActivityById: Record<string, VenueActivityEnvelope>,
) {
  const alternatives = nearbyVenues.filter((venue) => venue.name !== currentVenueName);
  const source = (alternatives.length ? alternatives : nearbyVenues).slice(0, 3);

  return source.map((venue, index) => {
    const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
    const activity = venueActivityById[venue.id] ?? null;
    const signalColor = activity
      ? getActivitySignalColor(activity.activity.displayText, activity.activity.score, T.textMuted)
      : T.textMuted;

    return {
      id: venue.id,
      venue,
      name: venue.name,
      venueType,
      illustration: getVenueIllustrationSource(venue.name, venueType),
      featured: index === 0,
      peopleColor: T.textMuted,
      energyLabel: activity ? activity.activity.displayText : "Live activity unavailable",
      signalBars: activity?.activity.score != null ? getSignalBarsForScore(activity.activity.score) : null,
      signalBarColor: signalColor,
      statusColor: signalColor,
      tags: [],
      distanceLabel: venue.distanceMeters != null ? formatDistanceLabel(venue.distanceMeters) : "Distance unavailable",
    };
  });
}

function getVenueIllustrationSource(
  venueName: string,
  venueType: RuntimeVenueCandidate["venueType"] | undefined,
) {
  const resolvedVenueType = venueType ?? inferVenueTypeFromName(venueName);
  if (resolvedVenueType === "cafe") return VENUE_ILLUSTRATIONS.cafe;
  if (resolvedVenueType === "coworking_space") return VENUE_ILLUSTRATIONS.coworking;
  if (resolvedVenueType === "library") return VENUE_ILLUSTRATIONS.library;
  if (resolvedVenueType === "university") return VENUE_ILLUSTRATIONS.library;
  const normalized = venueName.toLowerCase();
  if (/restaurant|grill|steak|bistro|kitchen|diner|pizza|sushi|brasserie|eatery/.test(normalized)) return VENUE_ILLUSTRATIONS.restaurant;
  if (/bar|pub|tap|cocktail|wine|brew|club|lounge/.test(normalized)) return VENUE_ILLUSTRATIONS.bar;
  if (/market|hall|grocery|bazaar/.test(normalized)) return VENUE_ILLUSTRATIONS.market;
  if (/park|garden|green|square/.test(normalized)) return VENUE_ILLUSTRATIONS.park;
  return VENUE_ILLUSTRATIONS.generic;
}

function inferVenueTypeFromName(venueName: string) {
  const normalized = venueName.toLowerCase();
  if (/cafe|coffee|espresso|roastery/.test(normalized)) return "cafe" as const;
  if (/library|books|reading/.test(normalized)) return "library" as const;
  if (/cowork|co-working|workspace|office|studio|hub/.test(normalized)) return "coworking_space" as const;
  if (/university|campus|college/.test(normalized)) return "university" as const;
  return "other" as const;
}

function getSignalBarsForScore(score: number) {
  const activeCount =
    score <= 20 ? 1 :
    score <= 40 ? 2 :
    score <= 60 ? 3 :
    score <= 80 ? 4 : 5;
  return Array.from({ length: 5 }, (_, index) => index < activeCount);
}

function getActivitySignalColor(label: string, score: number | null | undefined, fallback: string) {
  const normalizedLabel = label.toLowerCase();
  if (/busy|lively|high/.test(normalizedLabel)) return T.visibilityOff;
  if (/active|steady|warm/.test(normalizedLabel)) return T.visibilityOn;
  if (/quiet|calm|low/.test(normalizedLabel)) return T.textMuted;
  if (score == null) return fallback;
  if (score > 70) return T.visibilityOff;
  if (score > 30) return T.visibilityOn;
  return T.textMuted;
}

function formatDistanceLabel(distanceMeters: number) {
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  const minutes = Math.max(1, Math.round(distanceMeters / 80));
  return `${minutes} min walk`;
}

function formatExperienceMonth(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(value)).toUpperCase();
}

function formatExperienceDay(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(new Date(value));
}

function formatExperienceTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

````
