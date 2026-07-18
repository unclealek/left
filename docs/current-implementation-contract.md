# Current Implementation Contract

Status:
- source-of-truth companion for the mobile client as of July 18, 2026
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
- [src/components/left/navigation.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/navigation.tsx)
- [src/components/left/LeftDoorwayMark.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/LeftDoorwayMark.tsx)
- [src/app/leftTheme.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/leftTheme.ts)

Rules:

- do not create a second footer system
- do not create a second logo or brand-mark system
- do not create separate energy-label patterns when `EnergyPill` already owns venue energy
- do not create duplicate venue summary cards on the same screen unless the screen purpose truly changes
- prefer extending shared components over cloning them into screen-local variants

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

## Rebuild Rules For An LLM Or New Engineer

If rebuilding or extending the app:

1. Start from [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx) to understand screen orchestration.
2. Reuse [src/components/left/ui.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/ui.tsx) and [src/components/left/navigation.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/components/left/navigation.tsx) before adding new UI patterns.
3. Follow [left-engineering-build-spec.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-engineering-build-spec.md) for screen behavior.
4. Follow [location-venue-logic.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/location-venue-logic.md) and [venues-google.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/venues-google.md) for venue matching.
5. Treat [left-mvp-wireframes.md](/Users/kelvinaliche/Desktop/Projects/leftApp/docs/left-mvp-wireframes.md) as inspiration only, not implementation truth.
