# Development database security hardening

> Latest: [follow-up fixes and verification](security-follow-up.md) records the applied RPC fixes, concurrency tests and dependency updates. Current advisor result: 0 errors / 15 warnings.

Applied migration `20261005060333_harden_database_advisor_findings.sql` to development (`xrracivlxgedlzdcrfwx`). Production was not changed.

## Changes

- Set explicit `public, pg_temp` search paths on five existing helper functions.
- Changed `is_admin_reviewer` to SECURITY INVOKER. Its existing own-row RLS policy permits checking current reviewer membership without disclosing other users' reviewer status.
- Removed PUBLIC/anon access to privileged client RPCs; retained authenticated access and their existing user/reviewer guards.
- Removed client EXECUTE on three internal trigger functions and the server-only presence-count function. Edge Functions retain service-role access to the aggregate.
- Moved the original cross-user moderation projection into `moderation_private`, revoked direct client SELECT, and preserved `public.safety_report_review` as a SECURITY INVOKER view. It calls a narrowly scoped private SECURITY DEFINER function with an explicit current-user reviewer check. Non-reviewers receive zero rows. This preserves moderation names/counts without widening the underlying profile/session table policies.

The private helper intentionally remains privileged: moderation requires cross-user data. No new private schema was added to API configuration. Even direct SQL invocation requires the explicit reviewer check. Do not add `moderation_private` to exposed API schemas.

## Validation

- Previewed migration plus authorization fixtures in one rolled-back development transaction before applying it.
- Reran authorization fixtures after migration: reviewer read/update succeeds; ordinary users cannot read/update the projection or inspect another user's reviewer membership; reviewer access does not broaden direct profile reads.
- Verified internal RPC denial and retained service-role aggregate access; verified helper output and search paths.
- Existing raw-presence privacy regression passed.
- All 118 Vitest tests and application TypeScript checks passed.
- Advisor changed from **1 error / 37 warnings** to **0 errors / 17 warnings**.

## Remaining findings

Sixteen warnings are intentional authenticated SECURITY DEFINER entrypoints. Their existing guards were reviewed: per-user writes derive identity from `auth.uid()`, nearby/context reads constrain caller identity or membership, and review mutations require `is_admin_reviewer(auth.uid())`. Removing authenticated execution would break supported app flows; no warning suppression or blanket privilege expansion was used. This review is not a comprehensive penetration test.

- `approve_venue_submission`
- `consume_api_rate_limit`
- `end_presence_session`
- `finish_approach_attempt`
- `get_current_venue_context`
- `get_nearby_feed`
- `get_published_experiences`
- `get_saved_venues`
- `record_current_legal_acceptance`
- `record_social_interaction_event`
- `reject_venue_submission`
- `review_experience`
- `review_safety_report`
- `set_experience_attendance`
- `start_approach_attempt`
- `start_presence_session`

The seventeenth warning is leaked-password protection. It remains **disabled**. The dashboard browser required sign-in, and the scoped credential lookup waited on Keychain access and was interrupted. No Auth configuration was changed. Enable the setting in development Auth password/security settings if supported by the plan; do not change billing without explicit approval.

## Popular-times calls

Rechecked Edge Function secret names: **APIFY_TOKEN is still absent**. No paid actor call was made. Add the token directly to development Edge Function secrets, then perform the one-venue lookup/repeat-cache smoke test. Keep it out of Expo env files, source control and chat. The deployed per-user and global trigger caps remain intact.
