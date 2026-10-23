# TestFlight 0.1.0 (9) — 2026-10-23

- Candidate: latest working tree on `codex/ios-scene-lifecycle`.
- Profile: `testflight`; EAS development environment, existing staging backend.
- Apple app: `6820218499`; bundle ID: `com.left.mobile`.
- Version/build/runtime: 0.1.0 / 9 / 1.0.1. Expo and native build numbers synchronized; runtime unchanged.
- Includes HERE branding/catchphrases, Here tab, updated icons, offline Settings Help Center with English/Finnish/Swedish copy, and venue photo caption cleanup.

## Validation

- TypeScript passed; 417 tests across 72 files passed.
- Production iOS, Android and web exports passed using local environment.
- Expo dependency alignment passed using bundled offline dependency map; online check pending.
- Cloud signing/build/upload pending.

## Limitations

- Existing staging configuration; no database, backend function, admin or website deployment.
- Legal pages remain drafts; new-user legal completion remains blocked by publication metadata.
- Physical-device checks pending: upgrade/session preservation, HERE branding, tabs/icons, Help Center and locale copy, location/venue confirmation, photo fallback and credits, legacy links, export/share/cancel.
- Apple processing and tester availability require separate verification after upload.
