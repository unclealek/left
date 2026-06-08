# Left Engineering Build Spec

Status:
- engineering-ready build spec aligned to the current app implementation as of June 7, 2026
- includes venue disambiguation, venue submission, Social Momentum, and delayed approach follow-up

Depends on:
- [left-product-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-product-spec.md)
- [left-mvp-wireframes.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-mvp-wireframes.md)
- [identity-removal-policy.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/identity-removal-policy.md)

Primary implementation rules:
- the `Nearby Feed` is the canonical MVP discovery surface
- venue context supports activation decisions
- the bubble layer is optional and reuses the same discovery records
- reality-first rule is enforced
- account deletion is currently implemented as identity removal, not full erasure

## 1. Build Goal

Ship a mobile MVP that lets a user:
1. sign in with Google
2. complete lightweight onboarding
3. confirm the correct nearby venue or add a missing one
4. activate a temporary presence session
5. browse compatible nearby people in the nearby feed
6. inspect a soft-anonymity profile
7. enter the approaching micro-state
8. confirm a real-world connection or answer a delayed follow-up prompt after the approach window
9. access safety controls at active stages
10. manage profile defaults and prompt templates from `You`
11. request identity removal from the signed-in account screen

## 2. Current Stack

- mobile app: `Expo` + `React Native` + `TypeScript`
- app shell: custom screen orchestration in `src/app/LeftApp.tsx`
- state: local React state in the current implementation
- backend: `Supabase`
- auth: Supabase auth with Google OAuth
- database: Postgres
- functions: Supabase Edge Functions + SQL functions
- styling: centralized app theme/tokens in `src/app/leftTheme.ts`

Current implementation notes:
- no `Expo Router`
- no `Zustand`
- no `React Hook Form`
- no `Zod`
- no Apple auth in the implemented flow

## 3. Current App Structure

Current coordinating modules:
- [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx)
- [src/app/leftConfig.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/leftConfig.ts)
- [src/app/leftTheme.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/leftTheme.ts)

Reusable UI/navigation:
- [src/components/left/ui.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/ui.tsx)
- [src/components/left/navigation.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/navigation.tsx)

Screens:
- [src/screens/left/AuthScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/AuthScreen.tsx)
- [src/screens/left/LoadingScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/LoadingScreen.tsx)
- [src/screens/left/OnboardingScreens.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/OnboardingScreens.tsx)
- [src/screens/left/VenueScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/VenueScreen.tsx)
- [src/screens/left/ActivationScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/ActivationScreen.tsx)
- [src/screens/left/FeedScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/FeedScreen.tsx)
- [src/screens/left/ProfileScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/ProfileScreen.tsx)
- [src/screens/left/ApproachScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/ApproachScreen.tsx)
- [src/screens/left/ApproachFeedbackPrompt.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/ApproachFeedbackPrompt.tsx)
- [src/screens/left/SafetyScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/SafetyScreen.tsx)
- [src/screens/left/SettingsScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/SettingsScreen.tsx)
- [src/screens/left/VenueSelectionScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/VenueSelectionScreen.tsx)

## 4. Canonical Screen Set

Implement and maintain in this order:

1. Auth
2. Onboarding
3. Venue home
4. Venue selection / add venue
5. Presence activation
6. Nearby feed
7. Soft-anonymity profile
8. Approaching micro-state
9. Approach follow-up prompt
10. Safety controls
11. Settings / You

## 5. Navigation Model

Top-level screens in the current app:
- `loading`
- `auth`
- `onboarding-name`
- `onboarding-avatar`
- `onboarding-location`
- `venue`
- `venue-select`
- `venue-add`
- `activate`
- `feed`
- `profile`
- `approach`
- `safety`
- `settings`

Footer navigation is persistent across in-session screens and uses four destinations:
- `Home`
- `Nearby`
- `Session`
- `You`

Navigation rules:
- `Home` routes to venue home
- `Nearby` routes to the feed when visible and back to activation when not visible
- `Session` routes to activation before visibility and the live session timer after visibility starts
- `You` routes to settings/account
- safety is reachable from feed, profile, approach, and settings

## 6. Screen Contracts

### 6.0 Auth

Purpose:
- create or resume an application session through Google OAuth

Display fields:
- welcome copy
- `Continue with Google`
- loading state
- auth error state

Primary actions:
- `sign_in_with_google`

Success result:
- authenticated session created
- app profile loaded if present
- user routed to onboarding or venue home

Failure states:
- provider cancellation
- provider auth failure
- callback parsing failure
- profile bootstrap failure

Implementation notes:
- current auth callback target is `left://auth/callback`
- Expo Go callback URLs are not the intended production/dev-build path

### 6.1 Onboarding

Purpose:
- create the minimum viable app profile after first sign-in

Steps:
1. first name
2. avatar style
3. location permission

Primary actions:
- `set_first_name`
- `pick_avatar_style`
- `toggle_location_permission_state`
- `finish_onboarding`

Persisted fields:
- `first_name`
- `avatar_style`
- `default_intent`
- `default_vibes`
- `profile_prompt`
- `approach_prompt`
- `focus_mode_enabled`
- `prompts_enabled`
- `onboarding_completed`

### 6.2 Venue Home

Purpose:
- signed-in landing state
- show venue pulse, bubble preview, Social Momentum, and activation entry point

Display fields:
- `venue_name`
- `energy_level`
- `visible_count`
- `active_vibes[]`
- `pulse_copy`
- footer summary state

Primary actions:
- `open_activation`
- `open_nearby_feed`
- `choose_detected_venue`
- `add_missing_venue`
- footer navigation

### 6.3 Presence Activation

Purpose:
- create or resume a temporary presence session

Inputs:
- `intent`
- `vibes[]`
- `duration_minutes`
- `hint_text`

Display fields:
- intent options
- vibe options
- duration options
- hint card input
- submit CTA

Validation:
- exactly one `intent`
- up to two `vibes`
- duration required
- hint optional, max 80 chars

Primary actions:
- `submit_presence_activation`
- `cancel_activation`

Current implementation notes:
- activation inserts a `public.presence_sessions` row when the signed-in user and current venue are UUID-backed
- one existing active session is ended before a new visible session is created
- the app restores active visible sessions from Supabase on auth bootstrap and app resume
- activation is blocked until venue selection is resolved when multiple nearby venues are detected
- local mock IDs still use local state so seeded development screens keep working

### 6.4 Nearby Feed

Purpose:
- primary MVP discovery surface

Display fields per feed item:
- `profile_user_id`
- `presence_session_id`
- `first_name`
- `intent`
- `primary_vibe`
- `hint_text`
- `session_duration_remaining`
- `distance_bucket`
- `venue_name`
- `energy_level`
- `session_expires_at`

Primary actions:
- `open_profile(profile_user_id)`
- `open_safety_controls()`

Rules:
- exact location never shown
- no `save user` action
- no chat entry point
- feed is tier-1 data only
- shared alignment remains partly hardcoded in the current profile UI
- UUID-backed sessions load feed records from `public.get_nearby_feed(...)`
- mock/local sessions fall back to seeded feed data

### 6.5 Soft-Anonymity Profile

Purpose:
- increase confidence before approach

Display fields:
- `first_name`
- `illustrated_avatar_style`
- `intent`
- `vibes[]`
- `hint_text`
- `shared_alignment_label`
- `profile_prompt`

Primary actions:
- `start_approach(profile_id)`
- `hide_user(profile_id)`
- `block_user(profile_id)`
- `report_user(profile_id, category, notes)`
- `open_safety_controls()`

Rules:
- first name and hint remain consistently visible
- mutual context is above generic profile content
- no photo render path in MVP
- prompt is owned by the signed-in viewer and saved in user settings

### 6.6 Approaching Micro-State

Purpose:
- bridge digital confidence to physical action

Display fields:
- `target_profile_id`
- `target_first_name`
- `hint_text`
- `approach_prompt`
- `approach_expires_at`
- `seconds_remaining`

Primary actions:
- `confirm_connected`
- `cancel_approach`
- `open_safety_controls()`

Rules:
- approach attempts are persisted to `public.approach_attempts` when UUID-backed records are available
- expired approach currently transitions to a pending local follow-up prompt backed by AsyncStorage
- prompt is owned by the signed-in viewer and saved in user settings

### 6.6.1 Approach Follow-Up Prompt

Purpose:
- capture what happened after an approach countdown elapses without forcing the user to answer in the moment

Display fields:
- `target_first_name`
- `approach_prompt`
- `went_over`
- `used_icebreaker`

Primary actions:
- `save_feedback`
- `defer_feedback`

Rules:
- pending feedback is stored locally in AsyncStorage
- if the user confirms the connection during the live countdown, pending feedback is cleared
- this flow is currently local-only and does not yet persist feedback to Supabase

### 6.7 Safety Controls

Purpose:
- immediate safety actions

Display fields:
- current visibility status
- current session status
- safety zones summary

Primary actions:
- `pause_visibility`
- `end_session`
- `block_user`
- `report_user`
- `add_safety_zone`
- `remove_safety_zone`
- `hide_venue`

Rules:
- safety zones suppress prompts only at the product-policy level
- block is immediate and bilateral
- report applies immediate mutual hide for the remainder of the session
- pause and end update the active `public.presence_sessions` row when available
- reports are reviewable through `public.safety_report_review`

### 6.8 Settings / You

Purpose:
- signed-in account and customization destination

Display fields:
- `first_name`
- `avatar_style`
- `default_intent`
- `default_vibes`
- `profile_prompt`
- `approach_prompt`
- venue preference summary
- account status copy

Primary actions:
- `save_profile_defaults`
- `open_safety_controls`
- `sign_out`
- `request_identity_removal`

Persisted fields on save:
- `first_name`
- `avatar_style`
- `default_intent`
- `default_vibes`
- `profile_prompt`
- `approach_prompt`

Identity-removal rules:
- request writes to `public.identity_removal_requests`
- app then calls the backend processor
- retained/removed behavior is defined in [identity-removal-policy.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/identity-removal-policy.md)

### 6.9 Bubble Visualization Layer

Purpose:
- optional ambient layer over nearby feed data

Rules:
- reads from same discovery dataset as nearby feed
- no additional business logic
- tapping a bubble opens the same profile flow

## 7. Current State Model

App-level screens:
- `loading`
- `auth`
- `onboarding-name`
- `onboarding-avatar`
- `onboarding-location`
- `venue`
- `venue-select`
- `venue-add`
- `activate`
- `feed`
- `profile`
- `approach`
- `safety`
- `settings`

Presence/session-related local state:
- `sessionVisible`
- `selectedIntent`
- `selectedVibes`
- `selectedDuration`
- `hintDraft`
- `approach`
- `pendingApproachFeedback`
- `venueHidden`

Suggested future backend-backed presence states:
- `activating`
- `visible`
- `discoverable`
- `paused`
- `session_ended`

## 8. Identity Reveal Rules

Always visible in feed:
- `first_name`
- `intent`
- one `vibe`
- `hint_text`
- session timing context

Visible after profile open:
- illustrated avatar or initials avatar
- second vibe if present
- shared alignment line if applicable
- viewer-owned icebreaker prompt

Never visible:
- surname
- photo
- exact coordinates
- email
- phone
- linked social account
- device id
- deep profile content

## 9. Data Model

### 9.1 users

Fields:
- `id uuid pk`
- `auth_provider auth_provider not null`
- `provider_subject text not null`
- `first_name text not null`
- `avatar_style avatar_style not null`
- `default_intent intent_type null`
- `default_vibes text[] not null default '{}'`
- `profile_prompt text not null`
- `approach_prompt text not null`
- `focus_mode_enabled boolean not null default false`
- `prompts_enabled boolean not null default true`
- `onboarding_completed boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:
- unique `provider_subject`
- `default_vibes` length <= 2

### 9.2 venues

Fields:
- `id uuid pk`
- `name text not null`
- `type venue_type not null`
- `city text null`
- `geofence_json jsonb not null`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### 9.3 presence_sessions

Fields:
- `id uuid pk`
- `user_id uuid not null`
- `venue_id uuid not null`
- `intent intent_type not null`
- `vibes text[] not null`
- `hint_text text null`
- `status presence_status not null`
- `prompt_state prompt_state not null`
- `started_at timestamptz not null`
- `expires_at timestamptz not null`
- `paused_at timestamptz null`
- `ended_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:
- one active presence session per user
- `expires_at > started_at`

### 9.4 prompt_events

Fields:
- `id uuid pk`
- `user_id uuid not null`
- `venue_id uuid not null`
- `triggered_at timestamptz not null`
- `reason text not null`
- `accepted boolean null`
- `created_at timestamptz not null default now()`

### 9.5 waves

Fields:
- `id uuid pk`
- `from_user_id uuid not null`
- `to_user_id uuid not null`
- `presence_session_id uuid not null`
- `status wave_status not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:
- one wave per sender, target, and presence session

### 9.6 approach_attempts

Fields:
- `id uuid pk`
- `from_user_id uuid not null`
- `to_user_id uuid not null`
- `presence_session_id uuid not null`
- `status approach_status not null`
- `started_at timestamptz not null`
- `expires_at timestamptz not null`
- `completed_at timestamptz null`
- `cancelled_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### 9.7 contact_exchange_intents

Fields:
- `id uuid pk`
- `approach_attempt_id uuid not null`
- `user_id uuid not null`
- `decision contact_exchange_decision not null`
- `created_at timestamptz not null default now()`

### 9.8 hidden_users

Fields:
- `id uuid pk`
- `actor_user_id uuid not null`
- `target_user_id uuid not null`
- `created_at timestamptz not null default now()`

### 9.9 blocks

Fields:
- `id uuid pk`
- `actor_user_id uuid not null`
- `target_user_id uuid not null`
- `reason text null`
- `created_at timestamptz not null default now()`

### 9.10 reports

Fields:
- `id uuid pk`
- `actor_user_id uuid not null`
- `target_user_id uuid not null`
- `presence_session_id uuid null`
- `category report_category not null`
- `notes text null`
- `status safety_report_status not null default 'pending'`
- `reviewed_by uuid null`
- `reviewed_at timestamptz null`
- `moderation_notes text null`
- `created_at timestamptz not null default now()`

Operational objects:
- `public.safety_report_review` exposes joined report, reporter, target, session, venue, and related-count context for Supabase review.
- `public.review_safety_report(report_id, next_status, notes)` marks a report as `reviewing`, `resolved`, or `dismissed`.

### 9.11 safety_zones

Fields:
- `id uuid pk`
- `user_id uuid not null`
- `name text not null`
- `geofence_json jsonb not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### 9.12 identity_removal_requests

Fields:
- `id uuid pk`
- `user_id uuid null`
- `profile_user_id uuid null`
- `contact_email text not null`
- `contact_name text null`
- `auth_provider auth_provider null`
- `request_kind text not null`
- `identity_fields_to_remove text[] not null`
- `retained_record_classes text[] not null`
- `payload jsonb not null`
- `status text not null`
- `requested_at timestamptz not null default now()`
- `processed_at timestamptz null`
- `failure_reason text null`
- `processing_notes text null`

## 10. Derived Read Models

### 10.1 nearby_feed_items

Purpose:
- single query/view for the canonical discovery surface

Fields:
- `profile_user_id`
- `presence_session_id`
- `first_name`
- `intent`
- `primary_vibe`
- `hint_text`
- `session_duration_remaining`
- `distance_bucket`
- `venue_name`
- `energy_level`
- `session_expires_at`

Business logic:
- exclude blocked users
- exclude hidden users
- exclude expired sessions
- exclude self
- rank by venue, intent compatibility, shared vibe overlap, recency
- return feed-tier data only

### 10.2 venue_context_summary

Fields:
- `venue_id`
- `venue_name`
- `visible_count`
- `energy_level`
- `active_vibes`
- `popular_intents`
- `pulse_copy`

## 11. Backend Actions

These can be implemented as client writes, Supabase RPC, edge functions, or server handlers depending on sensitivity.

### 11.1 bootstrap_session

Purpose:
- restore the local app state from the Supabase session and `public.users`

Current path:
- `supabase.auth.getSession()`
- `supabase.from("users").select("*").eq("id", session.user.id).maybeSingle()`

### 11.2 sign_in_with_google

Purpose:
- start Google OAuth

Current path:
- `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } })`
- callback completion via `supabase.auth.setSession(...)` or `exchangeCodeForSession(...)`

### 11.3 finish_onboarding

Purpose:
- upsert the user profile row after auth

Current path:
- `supabase.from("users").upsert(...)`

### 11.4 save_settings

Purpose:
- update signed-in user defaults

Current path:
- `supabase.from("users").update(...)`

Updated fields:
- `first_name`
- `avatar_style`
- `default_intent`
- `default_vibes`
- `profile_prompt`
- `approach_prompt`

### 11.5 request_identity_removal

Purpose:
- create an audit request and invoke backend identity removal

Current path:
- insert into `identity_removal_requests`
- invoke Edge Function `process-identity-removal`
- backend SQL processor `public.process_identity_removal_request(...)`

Key files:
- [supabase/functions/process-identity-removal/index.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/functions/process-identity-removal/index.ts)
- [supabase/migrations/0004_process_identity_removal.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0004_process_identity_removal.sql)
- [supabase/migrations/0006_fix_identity_removal_auth_casts.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0006_fix_identity_removal_auth_casts.sql)
- [supabase/migrations/0007_harden_identity_removal_auth_schema.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0007_harden_identity_removal_auth_schema.sql)

### 11.6 sign_out

Current path:
- `supabase.auth.signOut()`

## 12. Client Events

Track at minimum:

- `google_auth_started`
- `google_auth_completed`
- `onboarding_completed`
- `presence_activated`
- `nearby_feed_loaded`
- `profile_opened`
- `approach_started`
- `approach_cancelled`
- `approach_connected`
- `approach_follow_up_saved`
- `safety_opened`
- `user_hidden`
- `identity_removal_requested`
- `identity_removal_completed`
- `identity_removal_failed`
- `settings_saved`
- `venue_pulse_seen`

## 13. Ranking Logic

MVP ranking order:

1. same venue only
2. active sessions only
3. compatible intent first
4. highest vibe overlap first
5. most recent active sessions first
6. shorter distance bucket first

Distance buckets:
- `same_area`
- `nearby`
- `within_venue`

Do not expose exact meters in MVP.

## 14. Prompt Eligibility Rules

Product-policy goal:
- users may become prompt-eligible based on venue, dwell time, prompt settings, and focus mode

Current implementation reality:
- dwell-time prompting is not yet implemented end to end in the local app shell
- `prompt_events` and `prompts_enabled` exist in the model
- `focus_mode_enabled` exists in the model
- the current app uses direct activation from venue home rather than a live dwell-time prompt

Configurable targets for later implementation:
- dwell time minutes, default `4`
- max prompts per venue per day
- minimum density threshold, default `1 other active user`

Venue scope for MVP:
- whitelist only: `cafe`, `library`, `coworking_space`, `airport`, `gym`, `university`
- exclude parks, streets, and open proximity discovery

## 15. Error and Edge Cases

### No density
- show venue pulse
- do not show blank feed without explanation

### Session expiry while browsing
- show expiring banner
- remove user from feed when session ends

### Target session expires before approach
- approaching state closes
- show `This person is no longer visible nearby`

### Duplicate active session
- backend should close or reject prior active session before creating a new one

### Block or report during active approach
- immediately end local interaction state
- remove target from feed

### Identity removal request fails
- keep the request row
- surface queued/failure state to the user
- allow follow-up or operator intervention

## 16. Implementation Phases

### Phase 1
- Google auth
- authenticated user bootstrap
- first-name-only onboarding
- avatar-style onboarding
- location permission gating
- venue home
- presence activation UI
- seeded nearby feed fallback for non-UUID development data
- profile screen
- approaching UI
- safety screen
- settings screen

### Phase 2
- Supabase schema alignment
- persisted settings save
- prompt template persistence
- identity-removal request + processor
- feed ranking query
- hide/block/report
- venue pulse
- persisted presence activation, pause, and end
- active session recovery on bootstrap/resume
- Supabase-backed nearby feed and venue context refresh
- safety report review view and reviewer function

### Phase 3
- dwell-time prompt logic
- realtime presence sessions
- expiring session banners
- safety zones full behavior
- bubble visualization layer
- optional admin UI for safety report moderation if Supabase table/view review becomes insufficient

## 17. Definition Of Done

The current MVP build is done when:
- a signed-in user can authenticate with Google
- a new user can finish onboarding
- a signed-in user lands on venue home
- footer navigation works across in-session screens
- presence activation flow is usable
- nearby feed, profile, and approach flows work end to end in the app shell
- active sessions persist and recover when backed by real Supabase UUID records
- hide, block, report, and approach writes persist when backed by real Supabase UUID records
- prompt templates can be customized and are reflected in profile/approach UI
- venue selection and missing-venue submission are usable
- safety controls are reachable from active social states
- sign-out works
- identity-removal request flow works against deployed Supabase backend
- no chat or save-user paths remain in the shipped MVP
- no photo paths exist anywhere in the shipped MVP
