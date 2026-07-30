# Left Rebuild Blueprint

Status:
- production rebuild blueprint created on July 30, 2026
- grounded in the current repository code, migrations, and product docs
- intended to replace fragmented planning with one end-to-end reconstruction document

Source inputs audited:
- `src/app/LeftApp.tsx`
- `src/screens/left/*`
- `src/features/*`
- `src/components/left/*`
- `supabase/migrations/*`
- `supabase/functions/*`
- `docs/left-product-spec.md`
- `docs/left-engineering-build-spec.md`
- `docs/current-implementation-contract.md`
- `docs/not-production-ready.md`
- `docs/left-app-overview.md`

## 1. Executive Summary

Left is a venue-based social discovery app for lightweight real-world connection. Users intentionally become visible in a real place for a short period, signal social intent and vibe, discover other people who are currently open to interaction, and get enough context to decide whether to approach offline. The product should reduce friction to real-world conversation, not prolong in-app communication.

The current repository already contains:
- an Expo + React Native mobile MVP
- a Vite admin shell
- a Supabase schema with presence, discovery, blocking, reporting, venue submissions, venue preferences, identity removal, Social Momentum, and BestTime cache support
- product and engineering documents that describe the MVP well but do not yet define a full production rebuild

The recommended rebuild keeps the current stack:
- Expo + React Native + TypeScript
- Supabase Auth + Postgres + Edge Functions + Storage + Realtime
- Admin web app for moderation and venue operations

The rebuild should change the application architecture materially:
- replace the monolithic `LeftApp.tsx` orchestration with typed navigation, feature modules, repositories, hooks, and state boundaries
- separate presentation, application logic, domain rules, and data access
- move privacy-sensitive and third-party API logic fully server-side
- add complete wave, notification, moderation, expiry, and observability systems
- remove mock-runtime fallback from production paths

Core product pillars that must remain stable:
1. Social discovery
2. Venue and place discovery
3. Live or recent presence
4. Social intent
5. Venue density
6. Privacy and controlled visibility
7. Safe, low-pressure interaction

Key permanent product rules:
- users are discoverable only when they intentionally activate or explicitly allow auto-presence
- exact coordinates are never shown to other users
- density must use privacy thresholds and descriptive ranges, not precise low counts
- hidden mode must still allow venue browsing without exposing live person counts
- the nearby feed and venue context should drive real-world action, not chat-first behavior
- block and report actions remove exposure immediately for the reporting/blocking user
- a user cannot have more than one active visible presence session at once
- external venue provider keys must never be shipped in client bundles

## 2. Existing-System Audit

### 2.1 Current application inventory

Mobile app:
- Root shell: `src/app/LeftApp.tsx`
- Config/tokens: `src/app/leftConfig.ts`, `src/app/leftTheme.ts`
- Shared UI: `src/components/left/ui.tsx`, `src/components/left/navigation.tsx`, `src/components/left/LeftAvatar.tsx`
- Screens:
  - `AuthScreen`
  - `NameScreen`
  - `AvatarScreen`
  - `LocationScreen`
  - `HomeScreen`
  - `VenueScreen`
  - `VenueSelectionScreen`
  - `VenueAddScreen`
  - `VenueDetailScreen`
  - `ActivationScreen`
  - `FeedScreen`
  - `ProfileScreen`
  - `ApproachScreen`
  - `ApproachFeedbackPrompt`
  - `SafetyScreen`
  - `SettingsScreen`
  - `MeScreen`
- Feature services:
  - `features/auth`
  - `features/account`
  - `features/location`
  - `features/presence`
  - `features/activity`
  - `features/social-momentum`
  - `features/interactions`
  - `features/venues`

Backend:
- Supabase migrations `0001` through `0020`
- Edge Functions:
  - `presence-start`
  - `presence-heartbeat`
  - `presence-end`
  - `nearby-venues`
  - `venue-activity`
  - `refresh-besttime-activity`
  - `initialize-besttime-venue`
  - `process-identity-removal`
- Shared Edge Function helpers for BestTime, Google Places, venue storage, timezone, and presence

Admin:
- `admin/` Vite app
- current focus is reviewer tooling and data access, not a full moderation console

### 2.2 Current routes and navigation

The app currently uses custom local state instead of a routing library. Current screen ids:
- `loading`
- `auth`
- `onboarding-name`
- `onboarding-avatar`
- `onboarding-location`
- `home`
- `venue`
- `venue-select`
- `venue-add`
- `venue-detail`
- `activate`
- `feed`
- `me`
- `profile`
- `approach`
- `safety`
- `settings`

Footer destinations currently map to:
- `Home`
- `Map`
- `Venues`
- `Profile`

### 2.3 Existing feature status

Implemented or mostly implemented:
- Google OAuth sign-in
- lightweight onboarding
- venue detection and venue disambiguation
- user-submitted venue suggestions
- visibility activation with intent, vibes, duration, hint
- nearby feed retrieval through Supabase RPC when UUID-backed
- venue pulse and venue detail
- profile inspection
- approach timer
- local delayed approach follow-up prompt
- hide, block, report actions
- venue hide/mute preferences
- identity removal request flow
- Social Momentum persistence and venue card
- BestTime venue cache scaffolding

Partially implemented:
- live density blending
- active session recovery and session updates
- venue preferences persisted locally and partly server-backed
- moderation review
- notifications
- report UX
- background location lifecycle
- approach analytics and persistence

Missing or intentionally deferred:
- email/password auth flows
- email verification and password reset UX
- Apple sign-in
- true push notifications
- wave-first user flow aligned with data model
- connections list
- messaging
- saved venues product home
- durable moderation actions like suspension/ban
- production-grade observability
- automated test suite
- full accessibility coverage

Deprecated, duplicated, or conflicting elements:
- current docs describe both wave and approach systems, but the app shell is approach-first
- `profile_prompt` still exists in schema/save paths while the UI emphasizes `approach_prompt`
- mock data is still mixed into runtime paths
- energy terminology has migrated from `quiet/warm/high` to `calm/warm/active/busy/focused`; the repo contains transition logic and docs for both
- current product docs reject hidden-state occupancy counts, but some older venue-detail patterns still expose explicit people counts
- auth is Google-only in code, while the rebuild brief asks for complete generic auth coverage

### 2.4 Invisible or incomplete interface/backend mismatches

Code-backed but not fully surfaced:
- `waves` schema exists but is not the dominant user flow
- `contact_exchange_intents` exists but is not implemented in the app
- report review SQL/view exists but admin enforcement is incomplete
- Social Momentum event storage exists, but broader analytics does not

Visible in UI but incompletely backed:
- report submission UX is compact and missing double-submit protection
- pause visibility exists without a mature resume model
- approach follow-up is local-only
- venue save/share affordances are intentionally absent because persistence model is incomplete

### 2.5 Known production gaps

From audited code and docs:
- `LeftApp.tsx` is too large and mixes orchestration with domain logic
- session expiry is incomplete and not enforced by scheduled cleanup
- feed refresh is not realtime
- loading, error, offline, disabled, and permission-denied states are inconsistent
- crash reporting and structured logging are missing
- production-safe handling of third-party venue APIs is incomplete
- no automated tests are visible
- Supabase migrations were not fully validated in a clean local/staging environment

### 2.6 Security and privacy risks

- exact occupancy language in some surfaces can violate privacy intent
- third-party venue and density provider access should be moved behind server-side functions only
- local mock fallback in production builds risks logic divergence
- incomplete enforcement after reports limits safety response
- account deletion is currently identity removal, not full erasure
- limited observability makes abuse detection weak

### 2.7 Database migration requirements

Required migration work for the rebuild:
- normalize current MVP tables into clearer profile/settings/privacy/notification structures
- extend venue schema for external ids, images, categories, density, and forecast history
- add notifications, device tokens, connections, moderation actions, audit logs, feature flags
- add retention metadata and cleanup jobs
- preserve compatibility migrations for current `users`, `presence_sessions`, `reports`, `venue_submissions`, `social_interaction_events`, `venue_preferences`, and `venue_activity_cache`

## 3. Product Requirements

### 3.1 What Left is

Left is a privacy-forward, place-aware social discovery product for people who are physically present in the same venue and open to lightweight real-world connection.

### 3.2 Main problem solved

It solves the gap between being near interesting people and having no safe, low-pressure way to know who is open to interaction.

### 3.3 Target users

Primary users:
- students
- urban professionals
- creators
- founders
- event attendees
- cafe regulars
- coworking members

Secondary users:
- venue operators using venue analytics or partnerships later
- moderators/admin reviewers
- support and trust-and-safety operators

### 3.4 Core user journey

1. User signs up or signs in.
2. User completes onboarding and permissions.
3. App resolves current venue or asks for manual area/venue selection.
4. User chooses visibility, intent, vibes, duration, and optional hint.
5. User becomes discoverable in a venue.
6. User sees venue density and nearby people with soft identity.
7. User opens a profile, sends a wave or starts an approach.
8. Interaction resolves into offline conversation, connection, ignore, hide, block, or report.
9. Presence expires or ends.

### 3.5 Value proposition

Left makes nearby people socially legible without requiring public profiles, endless feeds, or high-pressure outreach.

### 3.6 Concept definitions

Social discovery:
- discovering people open to interaction in the current context

Venue discovery:
- discovering relevant places, venue energy, and social potential

Presence:
- a short-lived representation that the user is at or associated with a venue now or very recently

Intent:
- the reason the user is open to interaction right now

Venue density:
- a privacy-safe summary of venue busyness derived from third-party patterns plus Left signals

### 3.7 Privacy and safety principles

- reveal only what is needed for confidence, never more
- prefer thresholds, ranges, and labels over exact low counts
- require intentional visibility
- allow hidden browsing
- make blocking and reporting immediate
- retain moderation evidence with controlled access
- minimize location retention
- never expose exact coordinates or movement history to other users

## 4. User Roles

End user:
- discovers venues and people
- manages profile, visibility, privacy, and settings

Moderator:
- reviews reports
- applies moderation decisions
- reviews venue submissions

Support operator:
- handles account issues, data export/deletion, escalations

Admin:
- manages feature flags, venue catalog overrides, reviewer roles, audit queries

Service role:
- runs scheduled jobs, sends notifications, refreshes density, processes deletion/export

## 5. User Journeys

### 5.1 New user

1. Open app.
2. Read welcome value proposition.
3. Choose `Continue with Google`, `Continue with Apple`, or `Continue with Email`.
4. Verify email if email auth is used.
5. Complete onboarding steps.
6. Land on hidden home state.
7. Grant location permission or choose manual area.
8. Browse venues or activate presence.

### 5.2 Returning user

1. Resume authenticated session.
2. Recover active presence if still valid.
3. Surface expiring presence notice if under threshold.
4. Show home with current venue or manual area.

### 5.3 Venue activation journey

1. User opens activation from home, venue card, or venue detail.
2. App checks permission, coordinates, venue resolution, hidden venues, and active session conflict.
3. User chooses intent, up to two vibes, optional visual hint, duration.
4. System creates or updates one active session.
5. Nearby feed and venue surfaces refresh.

### 5.4 Person discovery journey

1. User opens nearby feed or venue detail people section.
2. App applies privacy threshold, block/hide filters, and session validity.
3. User opens soft profile.
4. User waves, approaches, hides, blocks, or reports.

### 5.5 Safety journey

1. User opens safety center from any active surface.
2. User can pause visibility, end session, hide venue, block/report user, or open emergency guidance.
3. Report creates moderation record and immediate mutual hide.

### 5.6 Account management journey

1. User edits profile/settings.
2. User exports data or requests deletion.
3. Backend processes export or deletion with audit trail.

## 6. Information Architecture

Public:
- Welcome
- Sign up
- Login
- Verify email
- Forgot password
- Reset password
- Terms
- Privacy policy

Authenticated but incomplete:
- Onboarding intro
- Name
- Username optional
- Age confirmation
- Avatar/identity style
- Intent defaults
- Vibe defaults
- Location permission
- Notification permission
- Privacy explanation
- Safety rules
- Terms acceptance

Authenticated core:
- Home
- Map/Radar
- Venues
- Inbox
- Profile

Supporting authenticated:
- Search venues
- Venue detail
- Activation
- Nearby people
- Person profile
- Wave sheet
- Connection confirmation
- Safety center
- Settings stacks
- Blocked users
- Hidden venues
- Notification center
- Account deletion

Admin:
- Report queue
- Venue submission queue
- User moderation detail
- Venue catalog editor
- Density diagnostics
- Feature flags
- Audit log viewer

## 7. Navigation Map

Recommended navigation:
- Root stack
  - Splash
  - Public stack
  - Onboarding stack
  - Main tab navigator
  - Modal stack
  - Full-screen system overlays
  - Admin stack for admin-authenticated users only

Main tabs:
- `Home`
- `Map`
- `Venues`
- `Inbox`
- `Profile`

Public routes:
- `Welcome`
- `Login`
- `SignUp`
- `VerifyEmail`
- `ForgotPassword`
- `ResetPassword`
- `AuthExpired`

Onboarding routes:
- `OnboardingIntro`
- `OnboardingName`
- `OnboardingUsername`
- `OnboardingAgeGate`
- `OnboardingIdentityStyle`
- `OnboardingIntentDefaults`
- `OnboardingVibes`
- `OnboardingLocationPermission`
- `OnboardingNotificationPermission`
- `OnboardingPrivacy`
- `OnboardingSafety`
- `OnboardingLegal`
- `OnboardingComplete`

Main routes:
- `Home`
- `MapRadar`
- `VenueList`
- `VenueDetail`
- `NearbyPeople`
- `PersonProfile`
- `Activation`
- `Inbox`
- `Connections`
- `MyProfile`

Modal routes:
- `VenueSelectorSheet`
- `AreaSelectorSheet`
- `WaveComposerSheet`
- `ReportUserSheet`
- `ReportVenueSheet`
- `HideVenueConfirm`
- `EndPresenceConfirm`
- `DeleteAccountConfirm`
- `ConnectionResultSheet`

Full-screen overlays:
- `SafetyCenter`
- `EmergencyGuidance`
- `MaintenanceMode`
- `OfflineFallback`

Protected routes:
- all main/authenticated routes

Permission-gated routes:
- location-dependent discovery routes
- push notification settings that open OS settings

Deep links:
- `left://auth/callback`
- `left://reset-password`
- `left://venues/:venueId`
- `left://people/:userId`
- `left://notifications/:notificationId`
- `left://connections/:connectionId`
- `left://admin/reports/:reportId`

Back-button rules:
- auth routes pop within public stack
- onboarding cannot skip required prior steps
- activation cancel returns to origin route
- safety center returns to origin route
- venue detail returns to source list, map, or notification destination
- destructive confirmation modals never auto-commit on back

Gesture rules:
- modal sheets dismiss by swipe only when action is not submitting
- profile swipe back allowed
- report flow disables gesture dismiss during evidence upload/submission

## 8. Screen Specifications

### 8.1 `Splash`

Purpose:
- restore session, hydrate config, fetch feature flags, determine first route

Visible elements:
- brand mark
- loading indicator
- short privacy-first loading copy

States:
- loading
- session restored
- session invalid
- maintenance mode
- offline cached boot

Dependencies:
- auth session storage
- feature flags
- remote config
- local app version check

Analytics:
- `app_boot_started`
- `app_boot_completed`
- `app_boot_failed`

Acceptance:
- route decision occurs in under 2 seconds on warm launch without blocking network calls

### 8.2 `Welcome`

Purpose:
- explain value proposition and entry paths

Elements:
- brand mark
- headline
- product explanation
- `Continue with Google`
- `Continue with Apple`
- `Continue with Email`
- `Log in`
- terms and privacy links

Validation:
- auth buttons disabled while provider launch in progress

### 8.3 `SignUp`

Fields:
- email
- password
- confirm password
- first name

Validation:
- email RFC-valid
- password minimum 10 chars, 1 uppercase, 1 lowercase, 1 number
- passwords match
- first name 1 to 40 chars, trimmed
- duplicate email handled gracefully
- rate limit notice after too many attempts

States:
- default
- submitting
- validation error
- email verification pending
- provider collision

### 8.4 `Login`

Fields:
- email
- password

Actions:
- submit login
- forgot password
- switch to sign up

Validation:
- non-empty email/password
- generic auth failure copy to prevent account enumeration

### 8.5 `VerifyEmail`

Elements:
- explanation
- resend verification
- change email
- open mail app shortcut

Rules:
- resend rate-limited
- expired link routes to `AuthExpired` with recovery actions

### 8.6 `ForgotPassword`

Fields:
- email

Rules:
- always show success copy even if email does not exist
- rate-limit resend

### 8.7 `ResetPassword`

Fields:
- new password
- confirm password

Rules:
- token validated server-side
- expired/invalid token handled with replacement request CTA

### 8.8 `OnboardingIntro`

Elements:
- product overview
- principles: presence, privacy, safety
- `Start`

Rules:
- progress saved after every step

### 8.9 `OnboardingName`

Fields:
- first name
- optional username if enabled

Validation:
- first name required
- username optional but unique if used

### 8.10 `OnboardingAgeGate`

Fields:
- birthdate or age confirmation

Rules:
- minimum age 18 by default unless policy changes
- underage users blocked from account activation

### 8.11 `OnboardingIdentityStyle`

Elements:
- avatar/identity card selector
- preview across feed/profile chips

Rules:
- no personal photo required

### 8.12 `OnboardingIntentDefaults`

Fields:
- default intent
- default vibe preferences

Rules:
- exactly one default intent
- up to three vibe defaults in rebuild

### 8.13 `OnboardingLocationPermission`

Elements:
- permission explanation
- `Enable precise location`
- `Not now`
- manual area explanation

Rules:
- denial leads to manual area mode, not dead end

### 8.14 `OnboardingNotificationPermission`

Elements:
- explanation
- `Enable notifications`
- `Skip`

### 8.15 `OnboardingPrivacy`

Elements:
- hidden browsing explanation
- presence duration explanation
- exact location protection explanation

### 8.16 `OnboardingSafety`

Elements:
- block/report summary
- community standards
- emergency guidance link

### 8.17 `OnboardingLegal`

Elements:
- terms checkbox
- privacy checkbox
- community guidelines checkbox
- `Finish`

Validation:
- all required legal acknowledgements must be checked

### 8.18 `Home`

Purpose:
- emotional landing screen and visibility entry

Layout:
- location header with current area
- visibility status control
- current venue or manual area summary
- `Venue Rhythm` / density card
- search field
- nearby venues carousel/list
- trending venues
- recently viewed venues
- saved venues section
- CTA to activate if hidden

States:
- precise location available
- approximate location
- denied permission
- GPS unavailable
- offline
- no nearby venues
- stale venue cache

Buttons/interactions:
- open location selector
- open visibility controls
- search venues
- open venue detail
- activate from venue
- refresh

Rules:
- hidden state shows venue flavor only
- no exact live person counts in hidden state

### 8.19 `MapRadar`

Purpose:
- map/radar view for venues and nearby people

Elements:
- map
- center marker
- venue markers
- density legend
- list/map toggle
- search this area
- filters
- locate me

Filters:
- category
- distance
- density
- open now
- intent
- saved

States:
- permission denied fallback with manual area
- approximate location warning
- provider outage
- empty search area

### 8.20 `VenueList`

Purpose:
- searchable venue index for current area

Elements:
- search input
- filter chips
- sort selector
- venue cards with density, category, distance, save, hidden state badge

Sort options:
- nearest
- most active
- best match
- trending

### 8.21 `VenueDetail`

Purpose:
- venue profile, density, context, and activation entry

Elements top to bottom:
- image carousel
- back button
- save/share/report controls
- venue name and category
- address and distance
- open status and hours
- density card with confidence and freshness
- forecast chart or fallback copy
- Left live pulse summary
- social intent breakdown
- vibe tags
- people summary with privacy threshold
- related venues
- actions: directions, save, share, report, hide venue, activate/become visible, leave venue if active

Rules:
- if live Left count below privacy threshold, show density label only, not people count
- if forecast missing, show honest missing-data copy
- share/save disabled if backend unavailable

### 8.22 `Activation`

Fields:
- intent selector
- vibe multi-select
- duration selector
- visual hint text input
- optional visual hint presets
- visibility scope explanation

Validation:
- one intent required
- max two live vibes
- duration required
- hint max 80 chars
- cannot activate without venue or manual area decision
- hidden venue cannot be activated unless user unhides it first

Success:
- active presence created
- home, venue, feed, and notifications update

### 8.23 `NearbyPeople`

Purpose:
- primary discovery feed

Card elements:
- identity token
- first name or approved pseudonymous label
- current intent
- primary vibe
- optional secondary vibe
- approximate timing
- venue name
- distance bucket
- wave/approach CTA

States:
- loading
- skeleton
- empty because nobody visible
- empty because privacy threshold not met
- hidden because user not visible
- offline
- block/report-updated

### 8.24 `PersonProfile`

Elements:
- identity token
- first name
- intent
- vibes
- visual hint
- optional profile prompt
- shared context section
- wave button
- approach button if allowed
- hide user
- block user
- report user

Rules:
- additional identity details become visible only after reciprocal interaction if product chooses to allow it
- profile cannot expose durable history

### 8.25 `WaveComposerSheet`

Elements:
- short message templates if enabled
- send wave button
- cancel

Rules:
- repeated waves rate-limited
- disabled if target blocked, hidden, expired, or already has pending wave

### 8.26 `Inbox`

Sections:
- received waves
- sent waves
- returned waves
- connections
- system notifications

Rules:
- expired waves auto-move to archived state
- blocked users removed from visible inbox items except policy-required moderation records

### 8.27 `Connections`

Purpose:
- lightweight record of reciprocal interactions

Elements:
- person row
- connection created time
- venue context
- remove connection

Rules:
- no chat in MVP unless explicitly added later

### 8.28 `SafetyCenter`

Elements:
- current visibility status
- pause visibility
- resume visibility if paused
- end session
- block/report shortcuts
- hidden venues
- blocked users
- emergency guidance
- contact support

### 8.29 `Settings`

Sections:
- account
- privacy
- notifications
- location
- appearance
- safety and support
- about

### 8.30 `BlockedUsers`

Elements:
- blocked user rows
- unblock button
- explanation of effect

Rules:
- unblock requires confirmation

### 8.31 `HiddenVenues`

Elements:
- hidden venue rows
- unhide button
- mute toggle

### 8.32 `DeleteAccount`

Elements:
- export data CTA
- deletion consequences
- password re-auth or OAuth re-auth
- confirmation text input
- final delete button

Rules:
- full deletion and identity-removal-only flows should be separate choices

### 8.33 `AdminReportQueue`

Elements:
- status filters
- priority filter
- report cards
- evidence preview
- linked user and session info
- moderation actions

### 8.34 `AdminVenueSubmissionQueue`

Elements:
- pending submissions
- approve
- reject
- merge into existing venue

## 9. Component System

Core reusable components:
- `PrimaryButton`
- `SecondaryButton`
- `DestructiveButton`
- `IconButton`
- `TextField`
- `SearchField`
- `PasswordField`
- `Chip`
- `SelectChip`
- `IntentChip`
- `VibeChip`
- `ToggleRow`
- `SettingRow`
- `Card`
- `VenueCard`
- `PresenceCard`
- `ProfileSummaryCard`
- `EnergyPill`
- `DensityIndicator`
- `AvatarToken`
- `ImageCarousel`
- `BottomSheet`
- `ConfirmationDialog`
- `Toast`
- `InlineError`
- `EmptyState`
- `SkeletonBlock`
- `PermissionPrompt`
- `ScreenHeader`
- `TabBar`
- `MapMarker`
- `NotificationRow`

Component rules:
- every button supports default, pressed, focused, disabled, loading
- every input supports label, helper, validation, error, success, accessibility label
- cards never own business logic; they receive formatted props
- density and energy must use centralized formatting utilities

## 10. Design System

Visual direction:
- premium
- warm
- quiet
- low-noise
- socially alive
- trustworthy

Foundation:
- typography: editorial sans for headers, clean sans for UI labels
- radii: 12, 18, 24, 32
- spacing scale: 4, 8, 12, 16, 20, 24, 32, 40
- icon sizes: 16, 20, 24, 32

Recommended palette:
- primary ink: deep charcoal
- primary warm accent: terracotta
- secondary warm accent: muted coral
- calm accent: sage
- active accent: amber
- busy accent: rust
- focused accent: slate blue
- backgrounds: bone, warm white, soft sand
- danger: brick red
- success: forest green
- warning: ochre

Density colors:
- quiet/calm: sage-grey
- warm: apricot
- active: amber
- busy: burnt orange
- focused: muted blue

Motion:
- short spring on primary actions
- subtle stagger on feed cards
- reduced-motion mode disables ambient pulse and map marker breathing

Haptics:
- light impact on select
- medium impact on successful activation
- warning impact before destructive confirmation

## 11. Database Schema

### 11.1 Existing audited tables

Current schema already includes:
- `users`
- `venues`
- `presence_sessions`
- `prompt_events`
- `waves`
- `approach_attempts`
- `contact_exchange_intents`
- `hidden_users`
- `blocks`
- `reports`
- `safety_zones`
- `account_deletion_requests`
- `identity_removal_requests`
- `venue_submissions`
- `admin_reviewers`
- `social_interaction_events`
- `venue_preferences`
- `venue_activity_cache`

### 11.2 Recommended target tables

User and auth domain:
- `profiles`
- `user_settings`
- `user_privacy_settings`
- `user_notification_settings`
- `user_permission_status`
- `device_tokens`
- `account_export_requests`
- `account_deletion_requests`
- `identity_removal_requests`

Venue domain:
- `venues`
- `venue_categories`
- `venue_images`
- `venue_external_identifiers`
- `venue_submissions`
- `venue_submission_reviews`
- `saved_venues`
- `hidden_venues`
- `venue_preferences`
- `venue_density_snapshots`
- `venue_density_history`
- `venue_forecasts`

Presence and discovery:
- `presence_sessions`
- `presence_state_events`
- `presence_intent_history`
- `user_vibe_assignments`
- `social_interaction_events`

Interaction:
- `waves`
- `wave_events`
- `approach_attempts`
- `connections`
- `connection_events`

Safety:
- `blocks`
- `hidden_users`
- `reports`
- `report_evidence`
- `moderation_actions`
- `suspensions`
- `banned_devices`

Operations:
- `notifications`
- `notification_deliveries`
- `feature_flags`
- `audit_logs`
- `job_runs`

### 11.3 Target table contracts

`profiles`
- purpose: user identity and presentation
- columns: `id`, `auth_user_id`, `first_name`, `username`, `avatar_style`, `bio`, `identity_symbol`, `joined_at`, `is_identity_removed`, `created_at`, `updated_at`
- constraints: unique `auth_user_id`, unique nullable `username`
- retention: retained until deletion/anonymization
- RLS: user can read/write own; restricted service/admin access

`user_settings`
- purpose: editable product defaults
- columns: `user_id`, `default_intent`, `default_vibes`, `approach_prompt`, `profile_prompt`, `reduced_motion`, `theme`, `created_at`, `updated_at`

`user_privacy_settings`
- columns: `user_id`, `allow_hidden_browsing`, `show_intent`, `show_vibes`, `share_profile_after_reciprocal`, `presence_history_enabled`, `location_precision_mode`, `created_at`, `updated_at`

`user_notification_settings`
- columns: `user_id`, `waves_push`, `waves_email`, `connections_push`, `presence_expiry_push`, `venue_activity_push`, `safety_push`, `product_updates_email`, `created_at`, `updated_at`

`user_permission_status`
- columns: `user_id`, `location_foreground`, `location_precise`, `location_background`, `notifications`, `last_checked_at`

`venues`
- current table should be expanded with:
  - `slug`
  - `category_id`
  - `address_line_1`
  - `city`
  - `country_code`
  - `latitude`
  - `longitude`
  - `timezone`
  - `google_place_id`
  - `besttime_venue_id`
  - `price_level`
  - `website_url`
  - `opening_hours_json`
  - `is_hidden_globally`
  - `is_active`

`venue_external_identifiers`
- purpose: normalized provider mappings
- columns: `id`, `venue_id`, `provider`, `external_id`, `metadata_json`, `created_at`
- unique: `provider + external_id`

`venue_images`
- columns: `id`, `venue_id`, `storage_path`, `provider`, `sort_order`, `width`, `height`, `created_at`

`venue_density_snapshots`
- purpose: latest resolved density
- columns: `venue_id`, `density_label`, `density_score`, `left_visible_count_bucket`, `forecast_source`, `forecast_score`, `live_confidence`, `privacy_threshold_met`, `stale_after`, `computed_at`, `payload_json`

`venue_density_history`
- purpose: historical audit of density computations
- columns: `id`, `venue_id`, `source_type`, `density_label`, `score`, `computed_at`, `payload_json`

`venue_forecasts`
- purpose: cached provider forecast data by hour
- columns: `id`, `venue_id`, `day_of_week`, `hour_local`, `forecast_score`, `forecast_label`, `source`, `valid_from`, `valid_to`

`presence_sessions`
- keep core table but extend with:
  - `source` (`manual`, `auto_detected`, `manual_area`)
  - `visibility_mode` (`visible`, `paused`, `hidden_preview`)
  - `last_heartbeat_at`
  - `ended_reason`
  - `approx_area_id`
  - `is_privacy_threshold_eligible`

`waves`
- columns: `id`, `from_user_id`, `to_user_id`, `presence_session_id`, `status`, `message_template_key`, `expires_at`, `created_at`, `updated_at`
- unique: one active pending wave per direction per session

`connections`
- columns: `id`, `user_a_id`, `user_b_id`, `source_wave_id`, `source_approach_id`, `connected_at`, `ended_at`, `created_at`
- unique normalized pair index

`reports`
- expand with:
  - `target_type`
  - `target_venue_id`
  - `target_content_id`
  - `status`
  - `severity`
  - `reviewed_by`
  - `reviewed_at`
  - `moderation_notes`
  - `auto_hidden_until`

`moderation_actions`
- columns: `id`, `report_id`, `action_type`, `target_user_id`, `target_venue_id`, `duration_minutes`, `reason`, `created_by`, `created_at`

`notifications`
- columns: `id`, `user_id`, `type`, `title`, `body`, `deeplink`, `status`, `dedupe_key`, `scheduled_for`, `sent_at`, `read_at`, `payload_json`, `created_at`

`device_tokens`
- columns: `id`, `user_id`, `platform`, `expo_push_token`, `apns_token`, `fcm_token`, `last_seen_at`, `revoked_at`

`feature_flags`
- columns: `key`, `environment`, `enabled`, `rollout_percentage`, `payload_json`, `updated_at`

`audit_logs`
- columns: `id`, `actor_type`, `actor_id`, `action`, `target_type`, `target_id`, `metadata_json`, `created_at`

### 11.4 RLS policy model

Rules:
- user-owned tables: `auth.uid() = user_id`
- bilateral tables like `waves`, `connections`, `blocks`: participants only
- public venue reads allowed to authenticated users
- admin-only reads/writes gated by `is_admin_reviewer()` or expanded admin role function
- service-role-only writes for notifications, exports, scheduled jobs, density refresh
- audit logs writable by service/admin only

### 11.5 Triggers, functions, jobs

Required server functions/jobs:
- `set_updated_at()`
- `enforce_one_active_presence_session()`
- `expire_presence_sessions()`
- `refresh_venue_density(venue_id)`
- `claim_density_refresh_job()`
- `get_nearby_people(viewer_user_id, venue_id)`
- `create_wave(...)`
- `respond_to_wave(...)`
- `create_connection_from_wave(...)`
- `apply_block(...)`
- `submit_report(...)`
- `process_account_export_request(...)`
- `process_account_deletion_request(...)`
- `process_identity_removal_request(...)`
- scheduled cleanup for expired sessions, expired waves, stale notifications, stale forecast cache

## 12. Backend And API Architecture

Recommended backend layers:
- mobile client calls repository layer
- repositories call Supabase RPC/Edge Functions
- Edge Functions handle privileged logic, provider calls, rate limits, and audit logs
- Postgres handles RLS, core joins, views, and transactional updates

### 12.1 API inventory

`POST /auth/signup`
- create email/password account

`POST /auth/login`
- create session

`POST /auth/logout`
- revoke session

`POST /auth/resend-verification`
- resend verification email

`POST /auth/forgot-password`
- issue reset link

`POST /auth/reset-password`
- reset password using token

`POST /profile/upsert`
- create/update user profile

`GET /venues/search`
- input: query, area, filters
- output: venue cards

`GET /venues/nearby`
- input: coordinates or area id
- output: nearby venues with density summaries

`GET /venues/:venueId`
- output: detail payload including density, forecast, intent summary, related venues

`POST /venues/submissions`
- submit missing venue

`POST /venues/:venueId/density/refresh`
- privileged or throttled user-triggered refresh

`POST /presence/start`
- create visible presence

`POST /presence/heartbeat`
- extend/confirm current presence if policy allows

`POST /presence/pause`
- pause current presence

`POST /presence/resume`
- resume paused presence if duration and venue rules allow

`POST /presence/end`
- end presence

`GET /presence/nearby`
- fetch nearby people for active venue

`POST /waves`
- create wave

`POST /waves/:waveId/respond`
- accept, return, ignore, expire, cancel

`GET /connections`
- list connections

`POST /blocks`
- create block

`DELETE /blocks/:targetUserId`
- unblock

`POST /reports`
- create report

`GET /notifications`
- list notifications

`POST /notifications/register-device`
- register push token

`POST /account/export`
- start export

`POST /account/delete`
- start deletion

`POST /account/identity-remove`
- start identity removal

Admin endpoints:
- `GET /admin/reports`
- `POST /admin/reports/:id/review`
- `POST /admin/users/:id/suspend`
- `POST /admin/users/:id/ban`
- `GET /admin/venue-submissions`
- `POST /admin/venue-submissions/:id/approve`
- `POST /admin/venue-submissions/:id/reject`

### 12.2 Validation, rate limits, idempotency

Validation:
- all mutating endpoints validate payload with Zod or equivalent at the edge layer

Rate limits:
- auth: strict IP + user + email limits
- waves: per target, per hour, per day
- reports: per actor with abuse threshold
- venue submissions: per user/day
- density refresh: per venue time window

Idempotency:
- support idempotency keys on presence start/end, wave create, report create, deletion/export requests

Errors:
- standardized `code`, `message`, `fieldErrors`, `retryable`

Logging:
- structured JSON logs with request id, user id, endpoint, latency, result
- never log precise coordinates or raw hint text unless required and protected

## 13. External Integrations

Supabase:
- auth
- database
- storage
- realtime
- edge functions

Maps:
- Mapbox or Google Maps SDK for map rendering only

Venue provider:
- Google Places or equivalent for venue search/canonicalization

Density provider:
- BestTime or equivalent

Push:
- Expo Notifications initially, then direct APNs/FCM if needed

Analytics:
- PostHog, Segment, or similar privacy-safe analytics

Crash/perf:
- Sentry or Bugsnag

Email:
- transactional provider for verification, reset, account alerts

Integration rules:
- provider keys stored server-side only
- third-party raw venue/density responses cached and normalized server-side

## 14. Privacy And Security

Authentication:
- support Google, Apple, and email/password
- secure session rotation
- re-auth for sensitive account actions

Authorization:
- all user data behind RLS
- admin permissions explicit and auditable

Data minimization:
- store coarse area when exact coordinates are unnecessary
- expire transient presence data aggressively
- avoid long-term personal location history by default

Retention:
- presence session detail retained short-term for operations, aggregated long-term only if policy approved
- reports retained per trust-and-safety policy
- audit logs retained longer than app analytics

Deletion/export:
- separate identity removal and full deletion flows
- export job packages user-facing data only

Secrets:
- `.env` not committed
- mobile app only uses public Supabase keys
- Google Places/BestTime calls through server-side functions

Abuse prevention:
- device fingerprint safeguards where legally acceptable
- IP heuristics on auth and reports
- wave spam thresholds

## 15. Safety And Moderation

End-user actions:
- hide user
- block user
- unblock user
- report user
- report venue
- hide venue
- emergency guidance

Report categories:
- harassment
- impersonation
- unsafe behavior
- spam
- inappropriate content
- wrong venue data
- other

Report flow:
1. choose target
2. choose category
3. optional free text
4. optional evidence upload
5. submit
6. confirmation

Immediate effects:
- target hidden from reporter
- optional reciprocal session hide pending review for severe categories

Moderator actions:
- mark reviewing
- dismiss
- warn
- suspend
- ban
- venue correction
- merge duplicate venues

Blocked-user removal rules:
- removed from nearby feed
- removed from venue people lists
- cannot wave each other
- cannot appear in notifications except already-sent system artifacts with hidden identity
- cannot create connections

## 16. Notifications

Notification types:
- wave received
- wave returned
- connection created
- presence expiring soon
- presence ended
- venue activity
- safety alert
- account alert
- email verification
- password reset
- product update

Per-notification contract:

`wave_received`
- trigger: wave created
- destination: `Inbox`
- dedupe: active wave id

`wave_returned`
- trigger: receiver reciprocates
- destination: `Inbox` or `ConnectionResult`

`connection_created`
- trigger: reciprocal action completes
- destination: `Connections`

`presence_expiring`
- trigger: 5 minutes remaining, then 1 minute remaining
- destination: `Activation` or `SafetyCenter`

`presence_ended`
- trigger: session expiry/end success
- destination: `Home`

`venue_activity`
- trigger: saved venue crosses configured density threshold
- destination: `VenueDetail`

`safety_alert`
- trigger: moderation or policy notice
- destination: `SafetyCenter`

`account_alert`
- trigger: password changed, login anomaly, deletion/export progress
- destination: `Settings` or `AccountSecurity`

General rules:
- all pushes require push permission and user preference enabled
- all email notifications require email preference enabled, except mandatory account security
- dedupe by user + type + target + window

## 17. Analytics And Monitoring

Core analytics events:
- `onboarding_started`
- `onboarding_completed`
- `permission_location_accepted`
- `permission_location_denied`
- `permission_notifications_accepted`
- `venue_viewed`
- `venue_saved`
- `visibility_activated`
- `visibility_paused`
- `visibility_resumed`
- `visibility_ended`
- `intent_selected`
- `vibe_selected`
- `wave_sent`
- `wave_returned`
- `connection_created`
- `report_submitted`
- `block_created`
- `notification_opened`
- `settings_changed`
- `account_deleted`

Observability:
- crash reporting
- performance traces for app boot, feed load, venue detail load, activation
- DB query latency monitoring
- Edge Function failure alerts
- external provider health checks
- notification send failure dashboards

Privacy-safe logging:
- no raw precise coordinates
- no full hint text in analytics
- hash or bucket sensitive identifiers where possible

## 18. Testing Strategy

Unit tests:
- formatters
- validators
- density calculators
- permission helpers

Component tests:
- buttons, cards, fields, dialogs, settings rows, density indicators

Hook tests:
- auth bootstrap
- presence lifecycle
- venue search
- notification preferences

Service tests:
- repository methods
- Supabase client adapters
- edge client wrappers

Database tests:
- migrations apply cleanly
- functions behave deterministically
- RLS policies block cross-user access

API/Edge tests:
- auth workflows
- venue search
- density refresh
- presence start/end/pause/resume
- waves
- reports
- deletion/export

Integration tests:
- mobile app with staging backend
- admin moderation workflows

E2E flows:
1. sign up and verify email
2. login returning user
3. onboarding completion
4. deny then later grant location
5. venue discovery with nearby detection
6. manual area selection
7. presence activation
8. nearby people discovery
9. send wave
10. return wave
11. block user
12. report user
13. end presence
14. change privacy settings
15. delete account

Additional test areas:
- offline
- approximate location
- notification deep links
- dynamic type
- screen reader navigation
- build validation for App Store and Play Store

## 19. File And Folder Structure

Recommended project structure:

```text
src/
  app/
    providers/
    navigation/
    boot/
  screens/
    public/
    onboarding/
    home/
    venues/
    people/
    inbox/
    settings/
    safety/
    admin/
  components/
    primitives/
    composite/
    navigation/
    feedback/
  features/
    auth/
    onboarding/
    profile/
    venues/
    density/
    presence/
    people/
    waves/
    connections/
    safety/
    notifications/
    settings/
    admin/
  hooks/
  repositories/
  services/
    supabase/
    maps/
    analytics/
    crash/
  state/
  types/
  constants/
  utilities/
  validation/
  permissions/
  notifications/
  location/
  analytics/
  assets/
  tests/
supabase/
  migrations/
  functions/
  seeds/
scripts/
docs/
admin/
```

Responsibilities:
- `app`: providers, bootstrap, root navigation
- `screens`: route-level UI only
- `components`: reusable UI
- `features`: domain modules and application logic
- `repositories`: persistence/query abstractions
- `services`: external systems and SDK wrappers
- `state`: app-wide client state stores
- `validation`: schemas
- `permissions`: OS permission abstractions
- `location`: geolocation and geofencing helpers
- `notifications`: push registration and handling
- `tests`: test helpers and suites

## 20. Implementation Phases

### Phase 1: Discovery and audit

Goals:
- inventory current behavior and settle product rules

Outputs:
- final product rulebook
- doc conflict log
- migration gap list

Files:
- create `docs/decision-log.md`
- update `docs/current-implementation-contract.md`

Tests:
- none beyond documentation review

Risks:
- unresolved wave vs approach model

Definition of done:
- one approved ruleset for identity, density, presence, and interaction

### Phase 2: Foundation

Goals:
- establish project structure, navigation, state, environments, design tokens, logging, testing

Files:
- create typed navigation
- create provider layer
- create analytics/crash wrappers

DB:
- feature flags
- audit logs
- notification baseline tables

Tests:
- boot, navigation, auth guard, environment validation

### Phase 3: Core profile and onboarding

Goals:
- build generic auth and robust onboarding

Files:
- public auth screens
- onboarding feature module
- profile repository

DB:
- profiles
- user_settings
- privacy/notification/permission tables

Tests:
- auth, onboarding, account creation, verification

### Phase 4: Venues

Goals:
- venue search, list, detail, imagery, saved/hidden venues, map/radar

DB:
- venue images, categories, saved venues, external ids

Tests:
- nearby venues, manual area mode, venue detail, provider fallback

### Phase 5: Density

Goals:
- provider integration, caching, Left aggregation, privacy thresholds

DB:
- venue density snapshots/history/forecasts

Tests:
- density calculations, threshold suppression, stale cache fallback

### Phase 6: Presence

Goals:
- create/pause/resume/end/expire sessions, heartbeats, background rules

DB:
- presence events, session extension fields

Tests:
- duplicate-session prevention, expiry, venue switching, hidden venue enforcement

### Phase 7: Social interaction

Goals:
- nearby people, waves, reciprocal response, connections, inbox, notifications

DB:
- wave events, connections, notification delivery tables

Tests:
- wave limits, blocked-user suppression, connection creation, notification deep links

### Phase 8: Safety and moderation

Goals:
- reporting, evidence, moderation actions, admin tools

DB:
- moderation actions, suspensions, evidence tables

Tests:
- report creation, block effects, moderation enforcement, RLS

### Phase 9: Quality and release

Goals:
- accessibility, performance, security review, store release, production deployment

Tests:
- full regression, app builds, policy review

Definition of done:
- staging soak complete
- store builds approved
- production monitoring live

## 21. Acceptance Criteria

- A user cannot hold two active visible presence sessions simultaneously.
- Presence expires automatically at the configured end time even if the client is closed.
- A blocked user is removed from all discovery results, waves, and notifications within one refresh cycle.
- Hidden-state venue browsing never shows exact visible-person counts below privacy threshold.
- Venue density is suppressed when confidence is too low or privacy threshold is not met.
- External venue and density provider secrets do not appear in the mobile bundle.
- Denied location permission routes users to manual area discovery, not a dead end.
- Re-authentication is required before account deletion.
- Report submission prevents duplicate submits while a request is in flight.
- Expired waves cannot be accepted or returned.
- Notification deep links open the correct destination when the user is authenticated.
- RLS prevents users from reading another user's private settings, reports, or device tokens.

## 22. Deployment Plan

Environments:
- local
- staging
- production

Requirements:
- separate Supabase projects
- separate provider credentials
- environment-scoped feature flags
- staged migration rollout with rollback notes

Release flow:
1. merge to main
2. run CI: lint, typecheck, tests, migration validation
3. deploy staging mobile build and Edge Functions
4. run smoke + E2E
5. deploy production DB migrations
6. deploy production Edge Functions
7. submit store builds or OTA update where allowed
8. monitor crash/error/notification dashboards

## 23. Remaining Risks And Unresolved Decisions

Conflict 1:
- current repo is approach-first, schema also supports waves
- options:
  - keep approach as primary interaction
  - move to wave-first interaction with approach as secondary
- recommendation:
  - adopt wave-first in production rebuild because it is easier to rate-limit, notify, and moderate
- final assumption:
  - waves become the primary explicit interaction; approach becomes the post-reciprocal in-person assist

Conflict 2:
- current repo supports hidden venue browsing but some older patterns expose exact counts
- recommendation:
  - enforce density labels only in hidden state
- final assumption:
  - no exact low counts anywhere hidden state appears

Conflict 3:
- current auth is Google-only, rebuild brief asks for complete auth experience
- recommendation:
  - ship Google + Apple + email/password with verification/reset
- final assumption:
  - provider auth remains the preferred path, email/password is supported for resilience

Conflict 4:
- current `users` table mixes profile and settings
- recommendation:
  - normalize into profile/settings/privacy/notification tables while preserving migration compatibility
- final assumption:
  - legacy fields remain during migration; new code reads normalized tables

Conflict 5:
- current density vocabulary is mid-transition
- recommendation:
  - standardize UI vocabulary to `Calm`, `Warm`, `Active`, `Busy`, `Focused`
- final assumption:
  - backend legacy values are normalized at repository boundary until migrations complete

## Appendix A: Master Route List

- `Splash`
- `Welcome`
- `SignUp`
- `Login`
- `VerifyEmail`
- `ForgotPassword`
- `ResetPassword`
- `AuthExpired`
- `OnboardingIntro`
- `OnboardingName`
- `OnboardingUsername`
- `OnboardingAgeGate`
- `OnboardingIdentityStyle`
- `OnboardingIntentDefaults`
- `OnboardingVibes`
- `OnboardingLocationPermission`
- `OnboardingNotificationPermission`
- `OnboardingPrivacy`
- `OnboardingSafety`
- `OnboardingLegal`
- `OnboardingComplete`
- `Home`
- `MapRadar`
- `VenueList`
- `VenueDetail`
- `NearbyPeople`
- `PersonProfile`
- `Activation`
- `Inbox`
- `Connections`
- `MyProfile`
- `Settings`
- `BlockedUsers`
- `HiddenVenues`
- `NotificationSettings`
- `PrivacySettings`
- `LocationSettings`
- `AppearanceSettings`
- `SafetyCenter`
- `EmergencyGuidance`
- `DeleteAccount`
- `VenueSelectorSheet`
- `AreaSelectorSheet`
- `WaveComposerSheet`
- `ReportUserSheet`
- `ReportVenueSheet`
- `HideVenueConfirm`
- `EndPresenceConfirm`
- `DeleteAccountConfirm`
- `AdminReportQueue`
- `AdminReportDetail`
- `AdminVenueSubmissionQueue`
- `AdminVenueSubmissionDetail`
- `AdminFeatureFlags`
- `AdminAuditLogs`

## Appendix B: Master Interaction Inventory

Interactive elements that must be specified in implementation tickets:
- auth provider buttons
- email/password submit buttons
- verification resend links
- onboarding next/back buttons
- permission request buttons
- tab bar items
- search bars
- filter chips
- sort selectors
- venue cards
- venue save buttons
- venue share buttons
- venue hide buttons
- activate button
- pause/resume/end presence buttons
- people feed cards
- wave button
- approach button
- connection confirmation buttons
- hide user button
- block user button
- report user button
- report venue button
- settings toggles
- OS settings deep links
- account export button
- account delete button
- notification rows
- push permission CTA
- map markers
- list/map toggle
- deep-linked notification actions
- admin approve/reject/suspend/ban controls

Every interactive element must define:
- screen
- label
- icon
- action
- backend request
- loading state
- disabled condition
- success response
- error response
- confirmation requirement
- analytics event
