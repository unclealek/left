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
- Cloud signing/build and Apple submission: pending.

## Known limitations and device checks

- Data download requires migration `20261020100750_account_settings_tools.sql`, which this release does not apply.
- Legal pages are drafts; unset publication metadata intentionally prevents new-user completion. Verify using existing accounts or guest browsing until legal publication/registry setup is approved.
- Public gathering sharing and universal-link activation remain dependent on the documented backend/domain prerequisites.
- Live popular-times Realtime delivery remains unverified.
- On a physical iPhone, verify install/upgrade and session restoration, sign-in/out, all four tabs, glass/accessibility/large text, venue detection after movement/resume, settings persistence, locale/units, analytics consent, legal browser return, share/cancel flows and file export after its backend is deployed.
- Cloud upload or Apple processing does not prove physical-device behavior or tester availability.

## Execution

Pending build and submission identifiers.
