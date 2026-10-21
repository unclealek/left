# TestFlight 0.1.0 (8) — 2026-10-21

## Candidate

- Branch: `codex/ios-scene-lifecycle`; bundle ID `com.left.mobile`.
- EAS build/submit profile: `testflight`; Apple app `6820218499`.
- Backend: existing staging project `xrracivlxgedlzdcrfwx`; EAS development environment.
- Marketing version 0.1.0, build 8, iOS update runtime 1.0.1.
- Includes current Home/Profile/venue design, native glass navigation, settings/locale/units, opt-in analytics, legal-link and location fixes, shared-component cleanup and accompanying tests/docs/assets.

## Validation

- TypeScript: passed.
- Unit/component suites: 418 tests, 72 files passed.
- Expo dependency alignment: passed.
- Production bundle export: iOS, Android and web passed locally (local environment only).
- Staged diff secret scan: gitleaks passed with redaction.
- Whitespace check: passed.
- EAS signed iOS cloud build: FINISHED at 2026-10-21 03:39:50 UTC.
- EAS Submit: successful upload to App Store Connect.

## Known limitations and device checks

- Data-download migration `20261020100750_account_settings_tools.sql` was applied to `left-staging` on 2026-10-21 after user approval; remote migration history records `20261021034732_account_settings_tools`. Physical-device file saving/sharing remains unverified.
- Legal pages are drafts; unset publication metadata intentionally prevents new-user completion. Verify using existing accounts or guest browsing until legal publication/registry setup is approved.
- Public gathering sharing and universal-link activation remain dependent on the documented backend/domain prerequisites.
- Live popular-times Realtime delivery remains unverified.
- On a physical iPhone, verify install/upgrade and session restoration, sign-in/out, all four tabs, glass/accessibility/large text, venue detection after movement/resume, settings persistence, locale/units, analytics consent, legal browser return, share/cancel flows and file export after its backend is deployed.
- Cloud upload or Apple processing does not prove physical-device behavior or tester availability.

## Execution

- App commit: `fdd603ca10ca2b25f83c3418e6cadd9899b110d6`, pushed to `origin/codex/ios-scene-lifecycle`.
- [EAS build](https://expo.dev/accounts/alekille/projects/left-mobile/builds/e181da1d-5319-4128-b58f-fee7f3bd504b): `e181da1d-5319-4128-b58f-fee7f3bd504b`.
- [EAS submission](https://expo.dev/accounts/alekille/projects/left-mobile/submissions/20672e34-7853-4a69-82b5-d9454f283633): `20672e34-7853-4a69-82b5-d9454f283633`.
- Remote signing credentials and active Apple provisioning profile resolved successfully.
- Automatic submission with CLI changelog was rejected by Expo's Enterprise-only changelog restriction. Rescheduled this same build successfully without the optional changelog; no duplicate build created.
- Final cloud build: FINISHED; version/build/runtime and app commit verified against EAS.
- Apple upload: EAS Submit confirmed successful upload. Apple processing/tester availability remains pending; the immediate App Store Connect status query still listed build 7 as the newest visible build.
- No physical-device installation or regression pass was performed for build 8.

## 2026-10-21 — Data-export migration applied

- Applied the exact reviewed `account_settings_tools` migration to `left-staging` (`xrracivlxgedlzdcrfwx`), remote version `20261021034732`. No other pending migrations applied.
- Local SQL suite passed ownership, pagination, category/offset validation and anonymous/removed-account denial checks.
- Deployed database transaction passed all 17 categories against the actual schema, caller-only profile isolation, invalid category/offset rejection and anonymous/removed-account denial. Two synthetic account/profile fixtures were rolled back; no user data was exported or printed.
- Function grants verified: anonymous execution denied for both functions, authenticated execution allowed; public wrapper is invoker, privileged implementation is in `security_private`, both use empty search paths.
- Security advisors unchanged: zero errors, 15 existing warnings and three informational findings; no new export-function finding.
- Backend SQL proof only: authenticated HTTP export, large populated exports and native file/share/cancel checks remain pending. No new mobile binary is required for this RPC deployment.
