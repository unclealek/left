# Left Product Spec

Status:
- current MVP spec aligned to the implemented mobile app as of June 7, 2026
- includes venue selection, venue submission, Social Momentum, and post-approach follow-up behavior now present in the client

Source inputs:
- `contextual_social_app_v2_spec.pdf`
- `contextual_social_app_design_review.pdf`
- `left designs/ambient_social/DESIGN.md`
- `left designs ui/contextual_discovery_system/DESIGN.md`
- all current MVP screen mockups in `left designs` and `left designs ui`

Note:
- the PDFs in this workspace were not directly machine-readable with the default CLI tools available here
- this spec is grounded in the PDF metadata, the companion design-system documents, the concrete mockups already present in the repository, and the clarified source docs `left_design.md` and `left_design_ui.md`

## 1. Product Summary

Left is a mobile social discovery app for lightweight real-world connection in shared places. Instead of a traditional feed or full-profile-first model, the product uses contextual presence, soft anonymity, and short-lived interaction windows to help nearby people connect with less pressure and more safety.

The product is optimized for situations like cafes, events, campus spaces, and public venues where people may be open to meeting others but do not want the friction or exposure of conventional social apps.

## 2. Product Vision

Build a reality-first social activation layer on top of real places.

The app should feel:
- low-pressure
- ephemeral
- context-aware
- safety-forward
- visually calm but emotionally alive
- fast to exit in favor of real-world conversation

The product should not feel like:
- a public feed
- a dating swipe clone
- a high-effort networking CRM
- an identity-heavy social profile app

## 3. Problem Statement

People in shared physical spaces often want lightweight connection, but current tools fail in one of three ways:
- they are too public and identity-heavy
- they require too much explicit outreach
- they ignore real-world context such as place, vibe, timing, and personal safety

Left addresses this by letting people signal intent, become discoverable in a controlled way, and move from ambient awareness to in-person contact with minimal friction.

Core principle:
- the product is not the digital interaction
- the product is the real-world conversation
- the app is scaffolding that lowers the activation energy to get there

Reality-first protection rule:
- if a feature keeps two people interacting on their phones instead of looking up, it does not ship in MVP

## 4. Target User

Primary audience:
- urban professionals
- students and creators
- event and cafe regulars
- digital natives comfortable with ephemeral social tools

User traits:
- values serendipity
- wants contextual connection, not random messaging
- prefers low-pressure discovery
- is privacy-conscious
- expects strong safety controls

## 5. Core MVP Promise

In a shared place, a user can:
1. sign in with Google and complete lightweight onboarding
2. confirm or add their venue when nearby detection is ambiguous
3. set their intent, vibes, duration, and hint
4. become visible for a limited period
5. discover nearby compatible people through venue-based presence
6. open a soft-anonymity profile with contextual cues
7. use customizable prompts during evaluation and approach
8. enter a short approach window and later confirm how it went if they leave the timer running
9. control visibility, safety, and account actions at all times

## 6. MVP Scope

Included:
- Google sign-in
- first-name + avatar + location onboarding
- nearby venue disambiguation when multiple venues are detected
- user-submitted venue suggestions for missing venues
- presence activation
- venue-based discovery
- nearby feed
- venue pulse / venue context
- venue home with bubble preview over the same discovery data
- soft-anonymity profile
- Social Momentum nudge card on venue home while visible
- shared-intent and shared-vibe matching
- approach flow with countdown timer
- delayed approach follow-up prompt after the countdown window expires
- quick identification hint
- persistent safety controls
- session duration tracking and active-session recovery
- persistent footer navigation: `Home`, `Nearby`, `Session`, `You`
- signed-in settings screen for profile defaults and prompt customization
- venue preference management for hidden and muted venues
- identity-removal request flow backed by Supabase

Deferred:
- Apple sign-in
- full chat system
- social graph or friend graph
- algorithmic recommendations beyond simple contextual ranking
- monetization
- cross-venue history
- rich notifications beyond core session updates
- admin tooling for monitoring identity-removal requests

Explicitly excluded from MVP:
- in-app chat
- profile browsing outside an active session
- activity feed
- history of who you've seen
- post-session rating or review
- follow or save mechanics
- outbound wave UI until the product and persistence paths are aligned

## 7. User Journey

### 7.0 Register / Sign In

Before entering the core loop, the user must be able to create an account or sign in using:
- Google

MVP requirements:
- support account creation and returning sign-in through Google
- preserve a single user identity across sessions
- collect only the minimum profile data needed for the soft-anonymity model
- derive a usable first name from the provider profile when available

Post-auth minimum profile state:
- authenticated user id
- first name
- avatar style
- profile prompt
- approach prompt
- onboarding flag

Onboarding flow is fixed to three screens:
1. Sign in with Google. Pull first name automatically and allow edit, but first name only.
2. Choose avatar style from four illustrated options: `geometric`, `abstract`, `minimal`, `soft`.
3. Request location permission with explicit explanation that location is used to detect social venues and is never shared.

Onboarding exclusions:
- no bio
- no handle
- no photo upload
- no camera access
- no tutorial
- no vibe selection in onboarding

### 7.1 Activate

The user enters a venue or shared environment and decides whether to become discoverable.

If the device detects more than one nearby venue, the user must first choose the correct one. If the correct venue is missing, the user can submit a venue suggestion with type, address/landmark, and optional notes.

The user sets:
- intent
- one or more vibes
- active duration
- an optional identifying hint

Result:
- the user is visible for a limited session

### 7.2 Discover

The user lands in a discovery environment that shows nearby people through presence cards in the nearby feed.

Discovery emphasizes:
- proximity
- current vibe overlap
- current venue energy
- low-identity contextual cues

Result:
- the user selects someone to inspect further

If venue density is low, the app should show a venue pulse instead of failing silently.

The bubble visualization is secondary and optional. The nearby feed remains the canonical MVP discovery surface.

### 7.3 Evaluate

The user opens a soft-anonymity profile.

The profile shows:
- avatar or masked identity representation
- first name or limited identity token
- intent
- vibe tags
- shared context
- quick identifying hint
- suggested icebreaker from the viewer's saved prompt template

Result:
- the user decides whether to approach, hide, block, or report

### 7.4 Approach

If the user commits to approach, Left enters a focused encounter state with a countdown timer and a reminder of who to look for and what to say.

The approach state uses a second customizable prompt template owned by the viewer.

Result:
- the user confirms the connection happened
- or exits the flow and later gets a follow-up prompt asking whether they actually went over and used the icebreaker

### 7.5 Stay Safe

At any point, the user can:
- pause or end visibility
- open safety actions
- use safety zones
- block or report another person

### 7.6 Settings And Account

The signed-in user has a dedicated `You` destination in the footer navigation.

That screen currently supports:
- editing first name
- changing avatar style
- setting default intent
- setting default vibes
- customizing the nearby-profile prompt
- customizing the approach prompt
- opening safety controls
- clearing hidden or muted venue preferences
- signing out
- requesting identity removal

## 8. Core Screens

### 8.1 Presence Activation

Purpose:
- collect short-lived social context before entering discovery

Fields:
- intent
- vibe selection
- duration
- identifying hint

Functional requirements:
- exactly one intent
- up to two vibes in the current implementation
- visible session starts only after confirmation
- duration must auto-expire
- activation should default from the last successful session where possible
- active sessions should restore on app restart or resume when the backend session is still valid
- the live session view shows elapsed visible time after activation

### 8.2 Nearby Feed

Purpose:
- primary discovery surface for MVP

Key UI elements:
- first name
- intent tag
- one vibe tag
- hint card
- actions for view profile and safety entry

Functional requirements:
- communicate enough to support approach decisions without oversharing
- exclude persistent “save user” behavior from MVP
- feed is locked to tier-1 identity only
- feed records should come from venue-scoped active presence sessions when backend IDs are available
- hidden and blocked users should disappear from discovery

### 8.3 Venue Context / Venue Pulse

Purpose:
- represent the current local social environment and explain density conditions

Key UI elements:
- venue header
- venue energy state
- visible people count
- active vibe chips
- popular intentions
- venue pulse when no users are currently visible
- persistent safety entry

Functional requirements:
- answer `is it worth activating here?` in one glance
- if density is low, explain that state without silent failure
- avoid exact positions and exact GPS exposure
- bubble taps open the same profile cards as nearby feed items

### 8.4 Soft-Anonymity Profile

Purpose:
- help the user decide whether to engage

Required content:
- identity representation
- intent and vibe chips
- shared-context callout
- identifying hint
- icebreaker prompt from saved user settings
- approach and safety actions

Functional requirements:
- do not reveal unnecessary personal detail
- prioritize mutual context over biography
- first name and hint card should be visible consistently
- second vibe becomes visible here if present
- shared alignment signal appears here if applicable
- no full chat entry point in MVP
- avatar must be illustrated or initials-based, never a photo
- prompt copy is customizable by the signed-in user from settings

### 8.5 Approaching Micro-State

Purpose:
- coordinate an in-person connection attempt

Required content:
- target name or alias
- countdown timer
- identifying hint
- icebreaker prompt from saved user settings
- success and cancel actions

Functional requirements:
- approach attempts should persist to the backend when backed by real user/session IDs
- timer uses a persisted expiry timestamp and transitions to a follow-up prompt when the countdown elapses
- this state should be designed as the anxiety-reducing bridge from phone to real life

`We connected!` does exactly three things:
1. ends the approaching state and returns the user to discovery
2. logs a successful real-world interaction event for beta metrics
3. clears any pending follow-up prompt for that approach

### 8.6 Safety Controls

Purpose:
- make safety intervention immediate and always available

Required actions:
- pause visibility
- end session
- block
- report
- manage safety zones

Functional requirements:
- available from all active social states
- minimize taps for emergency or discomfort scenarios
- block is immediate and bilateral
- report auto-hides the other user for the remainder of the current session
- report captures a category and optional notes
- pause and end update the current presence session when backend-backed

### 8.7 Bubble Visualization Layer

Purpose:
- provide an ambient visualization of the same nearby discovery data

Functional requirements:
- reuse the same underlying records as the nearby feed
- allow quick profile access
- support the ambient visual identity without becoming the primary MVP discovery surface
- remain strictly secondary to the nearby feed in the implementation order

### 8.8 Settings / You

Purpose:
- provide a signed-in destination for account defaults, prompt customization, sign-out, and identity-removal request handling

Required content:
- first name
- avatar style
- default intent
- default vibes
- nearby prompt template
- approach prompt template
- stored hidden/muted venue preferences
- sign-out action
- identity-removal request action

Functional requirements:
- profile defaults persist to `public.users`
- prompt templates persist to `public.users`
- account actions live under `You`, not under safety
- identity removal follows the retained-record policy defined in `identity-removal-policy.md`

## 9. Interaction Model

### Presence

Presence in Left is intentional and temporary. A user is only visible when they explicitly activate a session.

Each session includes:
- intent
- one or two vibes
- duration
- venue context
- optional hint

Presence state machine:
- invisible
- prompt eligible
- prompted
- visible
- discoverable
- interaction active
- expiring
- invisible

### Discovery Surface

The canonical MVP discovery surface is the `Nearby Feed`.

Rules:
- users should be able to decide whether to engage from the nearby feed alone
- venue context exists to answer whether activation is worthwhile
- the bubble visualization layer, if included, must sit on top of the same discovery data and open the same profile flow
- engineering should not treat feed discovery and bubble discovery as separate product systems

### Soft Anonymity

Left should reveal only enough information to facilitate an in-person moment.

Progressive reveal rules are locked:

Tier 1, visible in feed:
- first name only
- one vibe tag
- one intent tag
- hint card text
- session duration remaining

Tier 2, visible only after profile open:
- illustrated avatar or initials-based avatar
- second vibe tag if present
- shared alignment signal if applicable
- viewer-owned icebreaker suggestion

Tier 3, never visible:
- surname
- photo
- exact GPS
- email
- phone
- linked social account
- device id
- any onboarding data beyond first name and avatar style

### Approach Window

The approach window is a short-lived state used when one user decides to act in person.

Design intent:
- reduce indecision
- encourage quick action
- prevent stale outbound contact states

### Waves

Waves remain part of the intended product model, but the current app shell is approach-first.

Rules:
- full chat is out of scope
- `I'm going over` is always available once a profile is opened
- wave behavior and UI should not be treated as current shipped functionality until the implementation paths are restored and documented together

## 10. Matching and Ranking

For MVP, ranking should be simple and legible.

Suggested ranking inputs:
- same venue or active area
- proximity bucket
- shared vibe overlap
- intent compatibility
- recency of session activity

Not required for MVP:
- machine-learned personalization
- deep affinity scoring

## 11. Safety Model

Safety is a first-class product system.

MVP safety principles:
- persistent access to safety controls
- no precise user-to-user map pin exposure
- easy session shutdown
- easy block/report
- support for user-defined safety zones
- session expiry by default

Locked safety decisions:
- safety zones suppress prompts only
- they do not suppress manual visibility
- block is immediate and bilateral
- report does not terminate the other user's session automatically
- report applies immediate mutual hide for the current session
- after block or report, `hide me at this venue` becomes available as a permanent venue suppression choice
- reports remain reviewable by operators through Supabase using the safety report review view
- a dedicated safety admin UI is optional until volume or staffing requires it

## 11.1 Identity Removal Model

`LEFT` currently implements identity removal, not full deletion.

When a user requests account deletion in the current product:
- direct identity fields are redacted
- live auth/session access is cleared where supported by the auth schema
- selected product records are retained
- the request is logged in `public.identity_removal_requests`

The exact retained vs removed behavior is documented in [identity-removal-policy.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/identity-removal-policy.md).

## 12. Data Model

### User

- `id`
- `auth_provider`
- `provider_subject`
- `first_name`
- `avatar_style`
- `default_intent`
- `default_vibes`
- `profile_prompt`
- `approach_prompt`
- `focus_mode_enabled`
- `prompts_enabled`
- `onboarding_completed`
- `created_at`
- `updated_at`

### PresenceSession

- `id`
- `user_id`
- `venue_id`
- `intent`
- `vibes`
- `hint_text`
- `status`
- `prompt_state`
- `started_at`
- `expires_at`
- `ended_at`

### PromptEvent

- `id`
- `user_id`
- `venue_id`
- `triggered_at`
- `reason`
- `accepted`
- `created_at`

### Venue

- `id`
- `name`
- `type`
- `city`
- `geofence_json`
- `is_active`
- `created_at`
- `updated_at`

### Wave

- `id`
- `from_user_id`
- `to_user_id`
- `presence_session_id`
- `status`
- `created_at`
- `updated_at`

### ApproachAttempt

- `id`
- `from_user_id`
- `to_user_id`
- `presence_session_id`
- `status`
- `started_at`
- `expires_at`
- `completed_at`
- `cancelled_at`
- `created_at`
- `updated_at`

### ContactExchangeIntent

- `id`
- `approach_attempt_id`
- `user_id`
- `decision`
- `created_at`

### HiddenUser

- `id`
- `actor_user_id`
- `target_user_id`
- `created_at`

### Block

- `id`
- `actor_user_id`
- `target_user_id`
- `reason`
- `created_at`

### Report

- `id`
- `actor_user_id`
- `target_user_id`
- `presence_session_id`
- `category`
- `notes`
- `created_at`

### SafetyZone

- `id`
- `user_id`
- `name`
- `geofence_json`
- `created_at`
- `updated_at`

### IdentityRemovalRequest

- `id`
- `user_id`
- `profile_user_id`
- `contact_email`
- `contact_name`
- `auth_provider`
- `request_kind`
- `identity_fields_to_remove`
- `retained_record_classes`
- `payload`
- `status`
- `requested_at`
- `processed_at`
- `failure_reason`
- `processing_notes`

## 13. State Model

Primary app states:
- loading
- auth
- onboarding_name
- onboarding_avatar
- onboarding_location
- venue
- activate
- feed
- profile
- approach
- safety
- settings

Critical transitions:
- auth -> onboarding_name
- onboarding_location -> venue
- venue -> activate
- activate -> feed
- feed -> profile
- profile -> approach
- approach -> feed
- feed -> safety
- profile -> safety
- approach -> safety
- any signed-in state -> settings

## 14. Success Metrics

MVP metrics should focus on activation and real-world usefulness, not vanity engagement.

Track:
- session activation rate
- percent of activated users who open at least one profile
- approach-start rate
- approach-complete rate
- session cancel rate
- safety action rate
- repeat weekly activation rate
- low-density venue activation rate

## 15. Non-Goals

The MVP should not try to solve:
- long-form messaging
- content creation
- social feed engagement
- broad citywide discovery
- public influencer-style identity

## 16. Build Recommendation

Recommended product stack for MVP:
- mobile app: Expo + React Native + TypeScript
- state: local React state in current implementation
- backend: Supabase
- auth: Supabase auth with Google provider currently implemented
- realtime: Supabase realtime or equivalent presence channel
- location: device geolocation with coarse proximity buckets

Why:
- this product depends on mobile-native context, location, timers, and quick iteration
- the interaction model is closer to a native ambient utility than a conventional responsive website

## 17. Immediate Next Build Steps

1. Freeze the MVP screen list from this spec.
2. Confirm copy and fields for activation, profile, approach, settings, and safety.
3. Decide whether retained profile preference fields should also be reset during identity removal.
4. Implement the locked progressive reveal rules.
5. Implement the locked venue model, density thresholds, and venue pulse behavior.
6. Remove chat and save-user assumptions from the MVP build plan.
7. Keep the nearby feed as the canonical discovery surface.
8. Add presence lifecycle and expiry logic before deeper UI polish.
9. Add the bubble visualization only as a second-pass UI layer over the same data.

## 18. Locked Product Rules

- Discovery is strictly venue-based in MVP.
- Venue whitelist is: `cafe`, `library`, `coworking_space`, `airport`, `gym`, `university`.
- Parks and streets are excluded from MVP.
- Dwell time before prompt eligibility is 4 minutes.
- Meaningful density is at least 1 other active user at the venue.
- Venue pulse appears only when live density is zero and the venue has had at least 1 active session in the last 7 days.
- If a venue has never had activity, no venue pulse is shown.
- Safety zones suppress prompts only. They do not force invisibility.
- After block or report, a user may hide themselves from that venue permanently.
