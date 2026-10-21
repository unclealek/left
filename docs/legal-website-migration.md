# Legal website integration — next release after 0.1.0

## Supplied website review (2026-10-20)

The user supplied these public routes and requested app integration and content review:

| App document | Verified URL | Publication status |
| --- | --- | --- |
| Terms of Service | https://here-web-azure.vercel.app/terms | Page title is Terms of Use; pre-launch draft |
| Privacy Policy | https://here-web-azure.vercel.app/privacy | Pre-launch draft |
| Community Guidelines | https://here-web-azure.vercel.app/community-guidelines | Pre-launch draft |

All three returned HTTP 200 without authentication and contained the expected document text when fetched directly. Each prominently says **“Pre-launch draft — not final legal terms.”** No document version or effective date is supplied. This is content/HTTP verification, not mobile layout or native browser verification.

The local mobile manifest and `.env.example` now use these routes instead of Google placeholders. Existing HTTPS environment overrides remain supported. Publication metadata stays blank, so `legalContentReady` remains false by default, the agreement checkbox stays disabled, and new-user completion remains blocked. Existing sign-in/onboarding/Settings browser handlers use the shared manifest. No backend records, EAS variables, or hosted pages were changed. Existing environment overrides take precedence and must be checked during release preparation.

### Content findings to resolve before final publication

1. **All documents remain drafts.** Finalise the actual text, publish version identifiers/effective dates and register matching approved versions and content hashes before enabling acceptance. A working URL alone is insufficient.
2. **Operator and contact details are absent.** Terms section 1 calls More Data the intended operator subject to confirmation; Privacy section 1 leaves the controller, address and privacy/support contact unspecified. Supply verified details rather than treating the intended operator as established.
3. **Background location is implemented locally.** Privacy section 3 says “If the app uses background location”. `src/features/location/location-service.ts` requests background permission and starts location updates on native platforms. Replace conditional instructions with accurate collection purposes, permission behavior, controls, recipients and retention after checking the deployed flow. Device permission and public visibility remain separate choices.
4. **Analytics and diagnostics are implemented locally.** Privacy sections 2 and 6 leave these as items to add if used. `src/lib/posthog.ts` configures PostHog when public configuration is present, including lifecycle capture and automatic exception/rejection capture; `src/app/LeftApp.tsx` identifies the user and captures product events. Review actual event properties, configuration, processing locations, retention and any controls. This code review does not establish delivery from an installed build.
5. **Provider and retention disclosures are unfinished.** Privacy sections 5–8 explicitly leave purpose-specific legal bases, provider recipients, international transfers, retention periods and rights-request procedures for completion. Verify current backend/provider settings; no legal bases or retention periods were inferred in this change.
6. **Reporting and deletion need concrete user instructions.** Community section 6 leaves reporting, safety contact and appeals unresolved. Local app code has user report/block handlers and an identity-removal request flow (`src/features/account/account-service.ts`); describe the actual supported routes and limitations, and verify live handling. Do not promise an unimplemented appeals or immediate deletion workflow.
7. **Brand and document naming differ.** Website uses HERE and Terms of Use; mobile still says Left and Terms of Service. Align visible naming with the separately planned rebrand and final operator identity. This link change does not perform a wider rebrand.
8. **Terms contain unresolved clauses.** Content licence, takedown/appeals, liability, consumer rights, dispute resolution and applicable law remain drafting instructions in sections 6–8. These need final owner/legal decisions before users are asked to agree.
9. **Public invitations are described as prospective.** The privacy/gathering warnings about forwarded public links are useful, but the local share origin remains a separate release dependency. Confirm what is actually deployed before presenting sharing as available.

This is a publication-readiness and implementation-consistency review, not legal approval. No hosted text was edited. Prior audit and verification below describe the 2026-10-10 implementation and are retained as historical context; the supplied URLs above supersede its placeholder/domain discovery steps.

## Audit (2026-10-10)

- `src/features/legal/legal-content.ts` contains the original mobile document definitions: empty draft Terms and Community Guidelines, and a draft Privacy Policy dated 28 August 2026. None is approved/published. No approved clauses were changed or invented.
- `src/screens/left/LegalScreen.tsx` previously rendered these full documents from sign-in, onboarding, and Settings. These two legacy files remain intact for reference/rollback, but the app no longer imports the renderer or bundles its draft text through runtime imports.
- Onboarding previously had a community pledge followed by a final all-policy acceptance screen. Its draft-content path permitted completion without legal acceptance. Permissions had separate notification and location steps.
- `supabase/migrations/0024_legal_acceptance.sql` already defines `legal_document_versions`, `legal_acceptances`, RLS, and `record_current_legal_acceptance`. Records contain user ID, document ID/version, and server-generated `accepted_at`. The RPC checks all three active versions and uses `ON CONFLICT DO NOTHING`, preserving historical rows/timestamps.
- A read-only check of **left-staging** (`xrracivlxgedlzdcrfwx`, the checked-in TestFlight target) confirmed the registry table exists and currently has **no document-version rows**. Production was not inspected or modified.
- The repository has the Expo app and a private moderation/admin Vite app, not an identified public marketing/legal website. No unrelated website was created.

## Implemented mobile behavior

- Existing `LegalAcknowledgementScreen` now presents short acceptance copy, three website links, one initially unchecked checkbox, and **Agree & Continue**. Privacy is a notice acknowledgement, not blanket processing consent. No state claims the documents were read.
- New users agree at the existing legal step, then continue through the existing independent notification/location permission steps. Completion reuses that in-memory agreement rather than showing a second agreement screen. A restarted draft does not persist or preselect the checkbox and must explicitly agree again before completing.
- Returning users with current version records are not prompted. The lookup now matches all historical document/version pairs rather than allowing an older row to shadow a newer acceptance. Missing current versions trigger renewal; renewal saves acceptance without validating or rewriting unrelated profile/onboarding fields.
- New-profile saves create the referenced profile with onboarding incomplete, call the existing acceptance RPC, and only then mark onboarding complete. Failure leaves setup incomplete and retryable. These calls are not a single transaction; acceptance rows may exist if the final completion update fails, and the idempotent RPC makes retry safe.
- Sign-in, onboarding, and Settings use the existing Expo `openBrowserAsync` integration. Opening/closing a link never writes acceptance and does not change the app screen. Browser-open errors show a retry message. Native browser page/network errors are displayed by the browser; its return value is not evidence the page loaded or was read.
- Settings has a Legal section. Account deletion, sign-out, privacy controls, and permission/background-location implementation are unchanged by this legal refactor.
- Unpublished or placeholder documents cannot enable agreement or acceptance saves. Existing completed accounts retain access while no approved release is configured. **New onboarding is intentionally blocked with placeholder legal configuration; do not ship this as ready for new users.**

## Website routes and configuration

The user requested `https://google.com` as the temporary target. All three links currently fall back there; it is explicitly rejected as a published legal document even if version metadata is supplied.

| Document | Proposed website route (not implemented/confirmed) | Mobile URL variable |
| --- | --- | --- |
| Privacy Policy | `/privacy` | `EXPO_PUBLIC_LEGAL_PRIVACY_URL` |
| Terms of Service | `/terms` | `EXPO_PUBLIC_LEGAL_TERMS_URL` |
| Community Guidelines | `/community-guidelines` | `EXPO_PUBLIC_LEGAL_COMMUNITY_URL` |

Each URL has matching `EXPO_PUBLIC_LEGAL_<TERMS/PRIVACY/COMMUNITY>_VERSION` and `_EFFECTIVE_DATE` variables. All nine are shown in `.env.example`; approved metadata is deliberately blank. No real domain or approved version was assumed. These public Expo values are embedded at build time. Set them in the appropriate EAS environment for the next build only after confirming the website pages and registry agree.

The mobile manifest (`legal-config.ts`) contains links and publication metadata only. The separate website must become the single source of approved full text. Preserve the original draft file as historical reference, not a second maintained published document source.

## Database and acknowledgement semantics

No new table or migration is required or was created/applied. Reuse the existing RPC and historical rows. For the new UI, a `privacy` row records notice acknowledgement made by the explicit agreement/continue flow; Terms and Community rows record agreement. The legacy table name and `accepted_at` timestamp stay unchanged. Do not reinterpret old rows as proof of reading or as broader consent. Optional permissions/consents are independent.

When approved content is ready, the release owner must register its actual version, effective timestamp, content hash, and active state in the existing registry, preserving older versions. This is separate pending backend work requiring approval, not performed by this refactor. Material version changes require updated mobile metadata/a new build; the existing server check rejects stale-version writes. Dynamic remote policy rollout is not introduced here.

## Verification

- New regression tests first reproduced the acceptance-history lookup problem and incorrect profile/acceptance save order; both now pass.
- UI component tests verify one unchecked checkbox, disabled/enabled Continue behavior, and all three clickable links before agreement. These inspect React element output, not native device rendering.
- Unit/service tests cover invalid/missing URLs, Google placeholder rejection, browser dismissal/failure, missing publication metadata, current/history matching, renewed versions, RPC errors, profile-before-acceptance ordering, and failure leaving onboarding incomplete.
- TypeScript and the full local suite pass (final counts in the next-release log).
- No live acceptance was written. No iOS/Android device browser-return test, real website route/layout test, real-account acceptance persistence test, or production deployment has been performed.
- Existing auth/account/location tests remain in the full regression suite. This is not fresh device-level verification of those features.

## Remaining website/release actions

1. Identify the separate official website repository/domain and obtain approved full text, versions, and effective dates. Current mobile drafts are not approved copy.
2. Implement public responsive pages using that site's existing branding, with titles, version/effective date, and working direct HTTPS links without authentication. Do not silently modify legal clauses.
3. Verify pages on mobile and desktop; confirm no login gate, correct content, and direct-route refresh behavior.
4. After explicit approval, register approved versions/hashes in Supabase. Configure the nine Expo values and remove placeholder targets for the release build.
5. Test new onboarding, persisted acknowledgement rows/timestamps, same-version restart, material-version renewal, offline/browser failures, and browser return from sign-in/onboarding/Settings on iOS and Android. Recheck deletion/auth and separate location/visibility controls.
6. Finish remaining next-release fixes, review, then obtain explicit approval before production deployment.

## Files

Modified: `.env.example`, `src/app/LeftApp.tsx`, `src/screens/left/OnboardingScreens.tsx`, `src/screens/left/SettingsScreen.tsx`, `src/features/account/account-service.ts`, `src/features/onboarding/onboarding-flow.ts`, `src/features/onboarding/onboarding-flow.test.ts`, `docs/next-release-fixes.md`.

New: `src/features/legal/legal-config.ts`, `src/features/legal/legal-links.ts`, `src/features/legal/legal-links.test.ts`, `src/features/account/legal-acceptance.test.ts`, `src/screens/left/legal-acceptance-ui.test.ts`, and this document.

References: [Expo SDK 54 WebBrowser](https://docs.expo.dev/versions/v54.0.0/sdk/webbrowser/). The existing dependency supports ordinary webpage browsing; no new dependency was added.
