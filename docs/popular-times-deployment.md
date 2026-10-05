# Development deployment

Approved deployment completed to `xrracivlxgedlzdcrfwx` on October 5, 2026. Production and the mobile app release were not changed.

- Applied migrations 0033, 0034 and 20261004220526. The obsolete BestTime cache and provider columns are removed.
- Deployed `get-popular-times` and `venue-details`.
- All three SQL regression suites passed on development with rollback-only fixtures.
- Deployed endpoint returns 401 for missing and malformed session tokens (rejected by the Supabase gateway before the handler).
- Rechecked live cache RLS/grants: authenticated SELECT only; service-role writes. Snapshot: `popular-times-rls-after.json`.
- No BestTime secrets remain. **APIFY_TOKEN is still absent**, so new uncached lookups fail closed; a successful paid actor lookup and end-to-end authenticated Realtime flow are not yet verified.
- Independent simultaneous-session contention testing remains outstanding; transactional regression tests passed.

## Wider database advisor results

{'ERROR': 1, 'WARN': 37} across the existing development database. No advisor finding names the new popular-times tables/functions. These results are not a clean security bill for the entire app.

- ERROR: Security Definer View — safety_report_review
- WARN: Function Search Path Mutable — set_updated_at
- WARN: Function Search Path Mutable — compute_shared_alignment
- WARN: Function Search Path Mutable — derive_energy_level
- WARN: Function Search Path Mutable — normalize_venue_name
- WARN: Function Search Path Mutable — venue_distance_meters
- WARN: Public Can Execute SECURITY DEFINER Function — approve_venue_submission
- WARN: Public Can Execute SECURITY DEFINER Function — broadcast_venue_presence_change
- WARN: Public Can Execute SECURITY DEFINER Function — end_active_presence_when_venue_hidden
- WARN: Public Can Execute SECURITY DEFINER Function — get_left_presence_counts
- WARN: Public Can Execute SECURITY DEFINER Function — get_published_experiences
- WARN: Public Can Execute SECURITY DEFINER Function — is_admin_reviewer
- WARN: Public Can Execute SECURITY DEFINER Function — record_current_legal_acceptance
- WARN: Public Can Execute SECURITY DEFINER Function — reject_venue_submission
- WARN: Public Can Execute SECURITY DEFINER Function — rls_auto_enable
- WARN: Public Can Execute SECURITY DEFINER Function — set_experience_attendance
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — approve_venue_submission
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — broadcast_venue_presence_change
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — consume_api_rate_limit
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — end_active_presence_when_venue_hidden
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — end_presence_session
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — finish_approach_attempt
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — get_current_venue_context
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — get_left_presence_counts
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — get_nearby_feed
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — get_published_experiences
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — get_saved_venues
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — is_admin_reviewer
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — record_current_legal_acceptance
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — record_social_interaction_event
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — reject_venue_submission
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — review_experience
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — review_safety_report
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — rls_auto_enable
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — set_experience_attendance
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — start_approach_attempt
- WARN: Signed-In Users Can Execute SECURITY DEFINER Function — start_presence_session
- WARN: Leaked Password Protection Disabled — Auth

These wider-schema findings were not changed by this scoped deployment. In particular, `safety_report_review` is reported as a SECURITY DEFINER view; its exposure and intended permissions need a separate review.

Configure APIFY_TOKEN securely in the development project's Edge Function secrets before end-to-end actor testing. Do not paste the token into chat or client environment files.
