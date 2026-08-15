# Current Implementation Contract

Status:
- source-of-truth companion for the mobile client as of August 10, 2026
- written so a new engineer or an LLM can rebuild the current app structure without inventing parallel systems

## Purpose

Use this document to understand what is implemented now, which docs are authoritative, and where duplication must be avoided.

## Authoritative Docs

Use these as the current truth, in this order:

1. [left-engineering-build-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-engineering-build-spec.md)
2. [location-venue-logic.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/location-venue-logic.md)
3. [venues-google.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/venues-google.md)
4. [identity-removal-policy.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/identity-removal-policy.md)
5. [social-momentum.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/social-momentum.md)

Context docs:

- [left-product-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-product-spec.md)
- [left-app-overview.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-app-overview.md)

Historical only:

- [left-mvp-wireframes.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-mvp-wireframes.md)

## Current App Shell

Top-level user-facing structure:

- `Home`: venue-aware landing screen and visibility entry
- `Map`: nearby people when visible, nearby venue browsing when hidden
- `Venues`: venue radar, confirmed venue, social momentum, venue CTA
- `Profile`: signed-in self screen and editable defaults

Implementation owner:

- [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx)

## Current Shared UI System

Shared building blocks should be reused before adding new one-off variants:

- [src/components/left/ui.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/ui.tsx)
- [src/components/buttons/index.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/buttons/index.tsx)
- [src/components/left/navigation.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/navigation.tsx)
- [src/app/leftTheme.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/leftTheme.ts)

Rules:

- do not create a second footer system
- do not create a second logo or brand-mark system
- do not create separate energy-label patterns when `EnergyPill` already owns venue energy
- do not create duplicate venue summary cards on the same screen unless the screen purpose truly changes
- prefer extending shared components over cloning them into screen-local variants

Shared action rules:

- `BrandPrimaryButton` is reserved for the strongest screen-level commitment, such as starting visibility
- `PrimaryButton` owns ordinary continue, save, and confirm actions
- primary action surfaces use deep brown `#170A04` with Yellow Green `#C6E385` labels, icons, and loading indicators; the green is never placed directly on white
- starting a new visible presence uses `SlideToConfirmButton`: the Yellow Green thumb carries the black Left mark, supporting copy stays compact and low contrast, tapping does not activate it, an incomplete drag springs back, and confirmation fires only after the handle crosses the completion threshold
- Presence configuration uses a compact venue confirmation strip, restrained section typography, soft low-contrast option borders, and inline amber selection checks rather than detached high-contrast badges
- assistive technologies receive an explicit accessibility confirm action so the drag gesture is not the only available input
- `GhostButton` owns back, cancel, later, neutral session, and secondary actions
- destructive actions use the destructive `GhostButton` variant and remain visually distinct from reversible session actions
- shared buttons support pressed, disabled, loading/busy, leading/trailing icon, compact, and accessibility states
- loading actions disable repeat taps while keeping a visible label and spinner
- form actions must reflect validity; for example, onboarding name and approach feedback cannot continue while incomplete

Shared header rules:

- task and content screens use the 28px left-aligned hero-title token with a 14px supporting subtitle
- Settings, Safety, and editing screens use the 20px centered utility-title token
- navigable headers use `ScreenHeader` and the shared 44px soft-glass `BackNavButton` with the custom Left arrow
- Home and onboarding remain intentional expressive exceptions rather than redefining the shared in-session hierarchy

Current signed-out presentation:

- the welcome/auth screen uses Creole Brown `#1F0E06` as its primary ink and Yellow Green `#C6E385` as its accent, matching onboarding
- general app text and active navigation use black `#000000`; Yellow Green remains an onboarding/auth brand accent and is not placed directly on white
- semantic green is reserved for confirmed, visible, live, positive, and success states; muted amber is reserved for hidden, temporary, selected, caution, and unconfirmed states
- the floating bottom navigation uses blurred Creole Brown `#1F0E06` glass with a soft translucent highlight border, a black active control, and Yellow Green navigation labels/icons at restrained opacity
- the welcome logo badge uses a gentle breathing pulse and becomes static when reduced motion is enabled
- decorative full-screen pulse rings are not part of the shared canvas; motion is reserved for meaningful controls and branded moments
- the shared app canvas uses warm porcelain `#FBF7F5`, while information-heavy cards remain white or near-white for separation
- controllable confirmations, errors, and informational prompts use the shared branded dialog; its Creole Brown `#1F0E06` surface carries Yellow Green `#C6E385` accents and never places the green accent directly on white
- Apple-owned authentication and permission prompts retain system styling and are not replaceable by the branded dialog
- the primary message is `People. Places. Presence.` with a short connection-focused explanation
- `Continue with Google` is the only working sign-in method and exposes loading, disabled, pressed, and error states
- `Continue with email` is labeled `Coming soon`; selecting it explains that Google is the working method rather than starting a false authentication flow
- the screen states that exact location is not shown to other people and that the user controls when their presence becomes visible
- the app icon uses the black Left mark on a flat Yellow Green `#C6E385` background across Expo, native iOS, and Android adaptive-icon configuration

Shared glass presentation:

- `GlassSurface` is the only reusable blur primitive and exposes `soft`, `medium`, and `solid` variants
- soft glass is used for the bottom navigation, status pills, compact chips, and small floating image/map controls
- medium glass is used for map/location overlays, confirmation strips, the welcome card, and compact modal-like surfaces
- solid or near-solid surfaces are retained for venue content, settings, forms, profile information, metrics, and long text
- glass uses warm translucent white, a one-pixel light border, standardized radii, and restrained shadows
- iOS and Android blur are supplied by `expo-blur`; reduced-transparency accessibility settings replace blur with an opaque warm fallback
- blur is not nested or repeated in scrolling content lists

Current onboarding presentation:

- onboarding uses Creole Brown `#1F0E06` as its primary ink and Yellow Green `#C6E385` as its accent
- the three persisted setup steps are Name, Social shape, and Venue detection
- stored avatar values remain `geometric`, `abstract`, `minimal`, and `soft`; playful labels are presentation-only
- Social shape includes tactile selection, a deterministic-safe “Surprise me” alternative, and a nearby-profile preview
- Venue detection explains the enter-place → detect-venue → nearby-people sequence before requesting permission
- successful persistence routes to `onboarding-complete`; `See what’s nearby` then routes to Home
- the completion screen must never appear before the profile row is saved successfully

## Current Runtime And Lifecycle Rules

- signed-in runtime initialization does not use seeded users, people, or venues
- venue detection returns an honest unconfirmed/empty state when neither the Edge Function nor canonical venue table finds a match
- visible sessions end in the client when `expires_at` is reached
- migration `0021_expire_stale_lifecycle_records.sql` performs server-side presence and approach cleanup every minute when `pg_cron` is available
- leaving an active approach through Back persists `cancelled`; elapsed approach timers persist `expired`
- migrations through `0021` were confirmed synchronized with staging on August 10, 2026
- migration `0022_fix_staging_function_lint.sql` was applied and fixed the identity-removal lint error
- migration `0023_fix_safety_review_parameter_binding.sql` was applied to staging
- linked staging schema lint completed with no errors on August 10, 2026
- lifecycle cleanup behavior still requires staging verification before the backend guarantee is considered released

## Current Settings And Account-Action Flow

`Profile` and `Settings` are separate responsibilities:

- `Profile` displays and edits first name, avatar style, default intent, and default vibes
- `Settings` links to Privacy and Safety, opens OS notification settings, presents About Left, and owns session/account actions
- `Log out` is a neutral action under `Session`; it asks for confirmation and then signs out
- `Identity removal` is isolated in a danger card and must not look equivalent to logout
- identity removal explains retained safety/operational records before confirmation
- submitting identity removal shows a busy state and prevents duplicate requests
- a recorded request becomes a non-interactive success status rather than a disabled destructive button
- failure copy confirms that nothing was removed and offers a retry

## Current Venue Model

Venue matching is DB-first:

- check `public.venues` first
- only call Google Places when the DB has no nearby venue
- canonicalize Google matches into `public.venues`
- reuse saved venues for later users

User-added venues:

- go into `public.venue_submissions`
- become reusable only after approval promotes them into `public.venues`

## Current Hidden-State Information Policy

When the user is hidden:

- nearby venue browsing is allowed
- exact live occupancy counts are not shown
- venue flavor signals are allowed
- placeholder social cues are allowed
- the user can still navigate venue context without being forced visible

Allowed hidden-state venue signals:

- venue name
- distance
- energy pill
- top intent or placeholder social cues
- vibe-style tags

Not allowed while hidden:

- `N people visible` style occupancy copy
- exact per-venue audience counts

## Current Profile Model

The signed-in `Profile` screen is not a deep historical dashboard.

It currently shows:

- first name
- current or default intent
- default vibes
- avatar style
- current visibility state
- current venue or hidden state
- nearby venue count
- wave count derived from `approach_started` events

It does not currently claim:

- lifetime venue history
- durable check-in counts
- long-term analytics-backed reputation metrics

## Current Venue Imagery Policy

Default behavior:

- use local illustrations and placeholders

Recommended Google photo behavior:

- fetch Google photo info only when a user opens a single venue page
- do not fetch Google photos for lists, cards, hidden-state venue browsing, or discovery surfaces

## Current Venue Detail Controls

Current implemented behavior:

- the venue detail screen uses the shared `BackNavButton`
- the header `share` action is not implemented and should not be shown
- the header overflow / `three-dot` action is not implemented and should not be shown
- the venue `save` action is not implemented and should not be shown

Future upgrades:

- add a real venue share action once the app has a clear share target and payload format
- add a real venue save / bookmark action once saved venues have a product home and persistence model

## Rebuild Rules For An LLM Or New Engineer

If rebuilding or extending the app:

1. Start from [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx) to understand screen orchestration.
2. Reuse [src/components/left/ui.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/ui.tsx) and [src/components/left/navigation.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/navigation.tsx) before adding new UI patterns.
3. Follow [left-engineering-build-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-engineering-build-spec.md) for screen behavior.
4. Follow [location-venue-logic.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/location-venue-logic.md) and [venues-google.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/venues-google.md) for venue matching.
5. Treat [left-mvp-wireframes.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-mvp-wireframes.md) as inspiration only, not implementation truth.
