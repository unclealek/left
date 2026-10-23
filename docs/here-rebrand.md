# HERE rebrand

## First local pass — 2026-10-21

The public-facing app name is **HERE**. Updated Expo/iOS display name, onboarding and sign-in wordmarks, loading and accessibility copy, Settings/Profile, venue/location messages, the local background-location notification title, in-app legal drafts, the English/Finnish/Swedish catalog, and the admin title/copy.

Keep the existing icon/mark and splash artwork for now; these assets still need a HERE design pass. Finnish/Swedish inflections were adjusted, with native-speaker review pending.

## Compatibility retained

- Bundle/package ID `com.left.mobile`, Expo slug `left-mobile`, EAS project and update URL.
- `left://` and development-client schemes, existing share encoding, local storage keys, analytics event identifiers, backend resources and account data.
- Native target, scene configuration and project filenames, internal component names and imports.
- Version 0.1.0, iOS build 8 and runtime 1.0.1; next release numbering is deferred to release preparation.
- Existing legal publication state and acceptance versions. Renaming draft copy does not publish legal documents.

## Remaining rollout

- HERE icon, splash and mark direction, then visual/device review.
- Hosted legal/support and invitation pages, provider sign-in consent labels and email templates, push-provider copy, App Store Connect/Play metadata and screenshots.
- Choose/verify public domains and any new HERE link scheme before configuring them; continue supporting legacy invitation links.
- Verify upgrade from the installed TestFlight app: retained sign-in, preferences, account data, legacy links, permissions and background notifications.
- Physical-device, TestFlight and Android checks. External publishing, remote configuration and a new release are separate steps.

No remote configuration, database, deployment, push, upload or release change is included in this local pass.

## Local validation

TypeScript, 418 tests across 72 files, admin production build, plist and whitespace checks pass. Native build/launch passed on iPhone 18 Pro / iOS 27; existing session restored and Home loaded. Profile “On HERE since”, Settings “About HERE” and About dialog copy verified through the simulator UI. Onboarding, permission prompts and background notification appearance were not exercised. Simulator location was None and a background location error was logged; no live location verification is claimed.

## Voice

Use HERE wordplay at a few meaningful moments: “Start HERE” for the introduction, “wHERE are you?” before venue confirmation, “You are HERE” at a confirmed venue, and “There you are.” on Profile. Keep functional actions and sensitive explanations literal. Translate the meaning naturally when the English wordplay does not carry over.

## Remaining text cleanup — 2026-10-21

Shared gathering HTML now uses HERE throughout its title, heading, actions and installation guidance. The admin email placeholder is `you@example.com`. Legacy `left://g/` links remain intact. Gathering page/handler tests and admin build pass. Changes are local; deployed pages were not updated or verified.
