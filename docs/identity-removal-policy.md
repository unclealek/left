# Identity Removal Policy

`LEFT` supports identity removal rather than full historical erasure.

## Summary

When a user submits a "user account deletion request" in the current product, `LEFT` does **not** fully erase all records tied to that user. The implemented behavior is:

- remove or redact direct identity fields
- clear live auth/session access where supported by the auth schema
- keep selected product records and product preference fields
- keep an audit/request record of the identity-removal action

This is an identity-removal flow, not a full data-erasure flow.

## Deleted Or Redacted

When an identity-removal request is processed successfully, the current implementation removes or redacts direct identity fields as follows:

- `auth.users.email`
  Replaced with a redacted address in the form `identity-removed+<request_id>@left.invalid`.
- `auth.users.phone`
  Set to `null`.
- `auth.users.raw_user_meta_data`
  Replaced with an empty JSON object.
- `auth.users.raw_app_meta_data`
  Replaced with a minimal JSON object containing `identity_removed: true`.
- `public.users.first_name`
  Replaced with `Removed User`.
- `public.users.provider_subject`
  Replaced with a redacted value in the form `identity-removed-<user_id>`.

The backend also attempts to delete live auth/session-related records where the project auth schema supports them, including:

- `auth.identities`
- `auth.sessions`
- `auth.refresh_tokens`
- `auth.one_time_tokens`
- `auth.mfa_factors`
- `auth.mfa_amr_claims`

These cleanup steps are schema-aware and only run when the target table and expected `user_id` column are present.

## Kept

The current product policy intentionally keeps the following product records and data:

- hints
- venue-linked history
- safety zones
- other venue/session-linked product records that are not directly redacted by the identity-removal processor

These retained records remain linked to the existing product-side user UUID under the current implementation.

## Kept In `public.users`

The current implementation does **not** remove or reset these profile/preference fields:

- `public.users.avatar_style`
- `public.users.default_intent`
- `public.users.default_vibes`
- `public.users.focus_mode_enabled`
- `public.users.prompts_enabled`
- `public.users.onboarding_completed`
- `public.users.created_at`
- `public.users.updated_at`

These fields are currently preserved as retained product/profile state.

## Kept In Related Product Tables

The current implementation does **not** delete or anonymize rows from these product tables solely because an identity-removal request succeeded:

- `public.presence_sessions`
- `public.prompt_events`
- `public.waves`
- `public.approach_attempts`
- `public.contact_exchange_intents`
- `public.hidden_users`
- `public.blocks`
- `public.reports`
- `public.safety_zones`

If those rows contain hints, venue history, safety zones, or other product activity, they remain in place under the current retention policy.

## Request Record Retention

The request itself is retained in `public.identity_removal_requests` as an operational and audit record.

After successful processing:

- `status` becomes `completed`
- `processed_at` is populated
- `contact_email` is replaced with the same redacted `@left.invalid` email
- `contact_name` is set to `null`
- `processing_notes` records the outcome

The request row itself is **not** deleted after completion.

## User Session Behavior

The intended in-app flow is:

1. User submits an identity-removal request.
2. Backend processing runs.
3. On successful in-app completion, the user is signed out.

If backend processing is completed manually or outside the normal in-app success path, the device may still hold a cached local session until the user signs out or the session is otherwise cleared.

## What This Means In Practice

After a successful identity-removal request:

- the user should no longer have direct identifying profile/auth fields in their account
- the user’s live auth/session access should be cleared where supported
- the user’s retained product history and retained preference fields still remain in the database
- the identity-removal request itself remains stored as an audit record

This means the current system removes direct identity, but it does **not** fully delete all user-associated data.

## Backend Expectations

The mobile client creates a request record in `public.identity_removal_requests` and then calls a secure backend processor with privileged access.

That processor is responsible for:

1. Verify the request is eligible for processing.
2. Remove direct identity fields from auth and profile records.
3. Preserve allowed retained record classes under the current policy.
4. Mark the request as `completed` or `rejected` with processing notes.
