# Security follow-up: code and database fixes

> Latest local update: [placeholder, parser fix, and configuration blockers](security-placeholder-update.md). The image-size advisory is now resolved locally; 22 dependency entries remain.

Development only (`xrracivlxgedlzdcrfwx`). Migration `20261005061541_close_rpc_validation_gaps.sql` is applied. Production and mobile distribution were not changed. The user deferred provider-secret and dashboard configuration while this work proceeded.

## Database fixes

- Reproduced and fixed a presence-location bypass: SQL NULL comparisons allowed a missing caller coordinate (or a venue without a usable center) to skip the distance rejection. Required coordinates, intent, duration and end/approach statuses are now checked explicitly. Invalid ranges/non-finite coordinates and unusable venue coordinates fail closed. This validates supplied coordinates; it does not prove a device's physical location.
- Fixed an existing `start_approach_attempt` runtime error: its `expires_at` output parameter conflicted with the unqualified presence-table column. The column is now explicitly qualified.
- Restored client denial for the retired `approve_venue_submission` and `reject_venue_submission` RPCs. Migration 0031 intended to retire them; the preceding advisor cleanup had inadvertently restored authenticated grants. Existing public grants had also previously undermined 0031's revoke. Both PUBLIC/anon and authenticated execution are now denied.

## Authorization verification

Tests use synthetic identities and transaction rollback, before and after the migration:

- Missing, invalid and remote coordinates rejected; valid location and owner session termination succeed.
- Users cannot end another user's session, complete another user's approach, spoof a feed viewer, read venue context without presence, read another user's saved venues, or attribute events to another user's visibility session.
- Quota/event attribution remains attached to the calling user.
- Non-reviewers cannot moderate experiences or safety reports; reviewer access and report updates continue to work.
- Same-venue approach creation/completion and ordinary attendance work; blocked users cannot appear in the feed or published-experience RPC or receive approaches/attendance from the blocked caller.
- Invalid legal-document versions are rejected.

Regression files: `supabase/tests/presence-location-validation.sql`, `rpc-authorization.sql`, and `database-advisor-hardening.sql`.

## Concurrent popular-times claims

`scripts/test-popular-times-concurrency.py` ran against independent development database sessions, without an Edge Function invocation or paid actor request:

- Eight requests from two users for one venue: exactly one claim.
- Twelve simultaneous requests for distinct venues by one user: exactly ten claims, two user-quota denials, count remains ten, no denied pending rows.
- Synthetic users, venues and cache rows were removed and only their synthetic budget reservations were refunded. The configured budget was not changed.

This closes the earlier independent-session database concurrency check. It does not replace a real authenticated HTTP/Realtime/Apify integration smoke test.

## Dependency fixes

- Vitest and its coverage provider: 3.2.7 → pinned 4.1.11, resolving the reported test-server file-read advisory.
- PostCSS: pinned override to 8.5.28, including Expo's previously vulnerable copy.
- Xcode parser's UUID dependency: scoped override to 11.1.1. Verified existing Xcode project parsing and UUID generation.
- Lockfile updated. Expo/React Native SDK versions unchanged.

Audit counts changed from **40 affected entries (24 high, 16 moderate)** to **23 high, zero moderate/critical**. These are affected dependency-tree entries, not 23 distinct runtime exploits.

Remaining roots:

| Package | Remaining issue | Reason not forced |
| --- | --- | --- |
| braces 3.0.3 | Nested-pattern stack exhaustion | Registry's current version remains affected; needs an upstream fix or a supported dependency-chain replacement. |
| node-forge 1.4.0 | RSA signature verification advisory | Registry's current version remains affected; no safe patched drop-in version found. |
| image-size 1.2.1 through Metro | Malformed-image parser hangs | Tested 2.0.3, but Metro also passes file paths to the legacy API. The full export caught that incompatibility, so the override was reverted. Needs a compatible Metro/Expo upgrade or a maintained backport. |

No forced SDK upgrade, ad hoc vendor patch or audit suppression was added. Dependency risk is reduced, not eliminated.

## Final checks and remaining configuration

- 118 Vitest tests pass; TypeScript passes.
- Scoped coverage: 100% lines, 92.27% statements, 86.49% branches, 90% functions. Vitest 4 uses different coverage accounting from the prior version.
- Web and iOS JavaScript/Hermes exports pass; this is not a native Xcode compile or device acceptance test.
- The generated web bundle contains no copy of the locally configured server Google Places API key. Google Cloud API/application restrictions were not changed or verified; the key remains in ignored local env files.
- Database advisor: **0 errors / 15 warnings**. Fourteen warnings are the remaining guarded authenticated privileged RPCs; one is disabled leaked-password protection.
- `APIFY_TOKEN` provisioning, leaked-password protection, Google Cloud key restrictions and the paid lookup/Realtime smoke test remain deferred pending account/configuration access. No paid actor calls were made.
