# Left Product Spec

Status:
- draft MVP spec synthesized from the PDF package and current design mockups

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
1. set their intent and vibe
2. become visible for a limited period
3. discover nearby compatible people through ambient presence
4. open a soft-anonymity profile with contextual cues
5. wave or approach with a short encounter window
6. control visibility and safety at all times

## 6. MVP Scope

Included:
- presence activation
- venue or area-based discovery
- nearby feed
- venue pulse / venue context
- optional bubble visualization layer over nearby feed data
- soft-anonymity profile
- shared-intent and shared-vibe matching
- mutual openness indicator
- approach flow with countdown timer
- quick identification hint
- waves-only signaling
- persistent safety controls
- session duration and automatic expiry

Deferred:
- full chat system
- social graph or friend graph
- deep profile editing
- algorithmic recommendations beyond simple contextual ranking
- monetization
- cross-venue history
- rich notifications beyond core session updates

## 7. User Journey

### 7.1 Activate

The user enters a venue or shared environment and decides whether to become discoverable.

The user sets:
- intent
- one or more vibes
- active duration
- an optional identifying hint

Result:
- the user is visible for a limited session

### 7.2 Discover

The user lands in a discovery environment that shows nearby people as bubbles or presence cards.

Discovery emphasizes:
- proximity
- current vibe overlap
- current venue energy
- low-identity contextual cues

Result:
- the user selects someone to inspect further

If venue density is low, the app should show a venue pulse instead of failing silently.

### 7.3 Evaluate

The user opens a soft-anonymity profile.

The profile shows:
- avatar or masked identity representation
- first name, alias, or limited identity token
- intent
- vibe tags
- shared context
- quick identifying hint
- suggested icebreaker

Result:
- the user decides to wave or approach

### 7.4 Approach

If the user commits to approach, Left enters a focused encounter state with a countdown timer and a reminder of who to look for and what to say.

Result:
- the user confirms the connection happened
- or cancels and exits the flow

### 7.5 Stay Safe

At any point, the user can:
- pause or end visibility
- open safety actions
- use safety zones
- block or report another person

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
- one or more vibes
- visible session starts only after confirmation
- duration must auto-expire
- activation should default from the last successful session where possible

### 8.2 Nearby Feed

Purpose:
- primary discovery surface for MVP

Key UI elements:
- first name
- intent tag
- vibe tag
- hint card
- mutual openness indicator
- actions for wave, view profile, hide, report, block

Functional requirements:
- communicate enough to support approach decisions without oversharing
- show a factual shared-alignment signal such as `You both selected AI/startups`
- exclude persistent “save user” behavior from MVP

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

### 8.4 Soft-Anonymity Profile

Purpose:
- help the user decide whether to engage

Required content:
- identity representation
- intent and vibe chips
- shared-context callout
- identifying hint
- icebreaker prompt
- actions for wave and approach

Functional requirements:
- do not reveal unnecessary personal detail
- prioritize mutual context over biography
- first name and hint card should be visible consistently
- intent should be especially prominent when it matches the viewer
- no full chat entry point in MVP

### 8.5 Approaching Micro-State

Purpose:
- coordinate an in-person connection attempt

Required content:
- target name or alias
- countdown timer
- identifying hint
- icebreaker prompt
- explicit `I'm going over` commitment
- success and cancel actions

Functional requirements:
- timer must use server-backed expiry
- expired approach should close automatically or force re-entry
- this state should be designed as the anxiety-reducing bridge from phone to real life

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

### 8.7 Bubble Visualization Layer

Purpose:
- provide an ambient visualization of the same nearby discovery data

Functional requirements:
- reuse the same underlying records as the nearby feed
- allow quick profile access
- support the ambient visual identity without becoming the primary MVP discovery surface
- remain strictly secondary to the nearby feed in the implementation order

## 9. Interaction Model

### Presence

Presence in Left is intentional and temporary. A user is only visible when they explicitly activate a session.

Each session includes:
- intent
- vibe
- duration
- venue or area context
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

Soft anonymity may include:
- alias or first name
- stylized avatar or masked photo treatment
- interest and intent tags
- identifying hint

It should avoid:
- full profile dump
- exact location sharing
- persistent public identity by default

Progressive reveal guidance from the current design review:
- first name and hint card are always visible
- avatar and vibe become more prominent after profile open
- intent should be emphasized when it matches the viewer

### Approach Window

The approach window is a short-lived state used when one user decides to act in person.

Design intent:
- reduce indecision
- encourage quick action
- prevent stale outbound contact states

### Waves

For MVP, waves are a lightweight interest signal.

Rules:
- waves are allowed
- full chat is out of scope
- if mutual wave logic is used, it should support real-world approach rather than open a digital conversation thread

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

Open product decisions:
- whether certain zones suppress discovery entirely
- whether visibility should auto-disable at night or in specific contexts
- whether mutual opt-in is required before approach state

## 12. Data Model

### User

- `id`
- `display_name`
- `first_name`
- `alias`
- `avatar_url`
- `default_vibes`
- `safety_preferences`
- `created_at`

### PresenceSession

- `id`
- `user_id`
- `venue_id` or `area_id`
- `intent`
- `status`
- `prompt_state`
- `started_at`
- `expires_at`
- `visibility_mode`

### SessionVibe

- `session_id`
- `vibe`

### DiscoveryHint

- `session_id`
- `hint_text`

### Venue

- `id`
- `name`
- `geofence`
- `energy_state`

### ConnectionAttempt

- `id`
- `from_user_id`
- `to_user_id`
- `session_id`
- `state`
- `wave_state`
- `started_at`
- `expires_at`

### SafetyEvent

- `id`
- `actor_user_id`
- `target_user_id`
- `type`
- `session_id`
- `created_at`

### SafetyZone

- `id`
- `user_id`
- `name`
- `geofence`
- `behavior`

## 13. State Model

Primary app states:
- inactive
- activating
- prompt_eligible
- prompted
- visible
- browsing
- profile_open
- wave_sent
- approaching
- connected
- session_paused
- session_ended

Critical transitions:
- inactive -> prompt_eligible
- prompt_eligible -> prompted
- prompted -> activating
- activating -> visible
- visible -> profile_open
- profile_open -> approaching
- approaching -> connected
- any active state -> session_ended
- any active state -> safety_action

## 14. Success Metrics

MVP metrics should focus on activation and real-world usefulness, not vanity engagement.

Track:
- session activation rate
- percent of activated users who open at least one profile
- wave rate
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
- state: Zustand
- backend: Supabase
- auth: phone or magic link
- realtime: Supabase realtime or equivalent presence channel
- location: device geolocation with coarse proximity buckets

Why:
- this product depends on mobile-native context, location, timers, and quick iteration
- the interaction model is closer to a native ambient utility than a conventional responsive website

## 17. Immediate Next Build Steps

1. Freeze the MVP screen list from this spec.
2. Confirm copy and fields for activation, profile, approach, and safety.
3. Decide identity policy: first name, alias, and exact progressive reveal rules.
4. Define venue model, density thresholds, and venue pulse behavior.
5. Remove chat and save-user assumptions from the MVP build plan.
6. Implement the app shell around the nearby feed as the canonical discovery surface.
7. Add presence lifecycle and expiry logic before deeper UI polish.
8. Add the bubble visualization only as a second-pass UI layer over the same data.

## 18. Open Questions

- Is discovery always attached to a venue, or can it work outdoors between arbitrary nearby users?
- Does `Wave` require reciprocal acceptance before `I'm going over` becomes available?
- What exact identity is visible before mutual contact?
- What happens after `We connected!` is tapped?
- Are safety zones hard blocks, soft warnings, or visibility modifiers?
