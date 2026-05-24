# Identity Removal Policy

`LEFT` supports identity removal rather than full historical erasure.

## What Is Removed Or Redacted

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

The backend also attempts to remove live auth/session-related records where the project auth schema supports them, including:

- `auth.identities`
- `auth.sessions`
- `auth.refresh_tokens`
- `auth.one_time_tokens`
- `auth.mfa_factors`
- `auth.mfa_amr_claims`

These cleanup steps are schema-aware and only run when the target table and expected `user_id` column are present.

## What Stays

The current product policy intentionally retains selected product records and links them to the existing product-side user UUID:

- hints
- venue-linked history
- safety zones
- other venue/session-linked product records that are not directly redacted by the identity-removal processor

This means `LEFT` is implementing identity removal, not full deletion or full anonymized archival. Direct identity fields are removed, but product records remain in place under the current retention policy.

## Request Record Retention

The request itself is retained in `public.identity_removal_requests` as an operational and audit record.

After successful processing:

- `status` becomes `completed`
- `processed_at` is populated
- `contact_email` is replaced with the same redacted `@left.invalid` email
- `contact_name` is set to `null`
- `processing_notes` records the outcome

## User Session Behavior

The intended in-app flow is:

1. User submits an identity-removal request.
2. Backend processing runs.
3. On successful in-app completion, the user is signed out.

If backend processing is completed manually or outside the normal in-app success path, the device may still hold a cached local session until the user signs out or the session is otherwise cleared.

## Backend Expectations

The mobile client creates a request record in `public.identity_removal_requests` and then calls a secure backend processor with privileged access.

That processor is responsible for:

1. Verify the request is eligible for processing.
2. Remove direct identity fields from auth and profile records.
3. Preserve allowed retained record classes under the current policy.
4. Mark the request as `completed` or `rejected` with processing notes.
