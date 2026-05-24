# Location + Venue Logic

This document explains how location and venue detection currently work in the app, which files own each part of the flow, what data stays on-device, what now reaches the backend, and what is still incomplete.

## Goal

The app uses background location to determine whether a user is at a social venue and, after enough dwell time, whether a low-pressure prompt should appear.

Product rules:

- device location is used first to determine whether the user is near a venue
- raw latitude and longitude are not sent to the backend for automatic venue detection
- venue-level state, not coordinate-level state, should drive the social experience
- when GPS is ambiguous, the user should confirm the exact venue instead of the app guessing silently

## Current Architecture

The current implementation is device-first with explicit venue confirmation when needed.

- Device code requests foreground and background location permission during onboarding.
- A background location task is registered through Expo.
- Each location fix is processed on-device.
- The app builds a nearby venue candidate list from the current coordinates.
- If more than one plausible venue is nearby, the user confirms which venue they are actually in.
- If the correct venue is missing, the user can add it from the app.
- If the user remains at the confirmed venue for 5 minutes, a local push notification is triggered.
- Venue-level safety preferences are stored locally and applied before prompting.
- Last-used activation defaults are stored locally so notification-driven activation can reopen with prefilled values.

## Files

### App Entry

- [App.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/App.tsx:1)

This imports the background task module so Expo registers the task when the app starts.

### App Shell Integration

- [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx:1)

This file connects the location system to the UI:

- bootstraps permission and registration state on app load
- loads saved activation defaults
- listens for notification responses
- refreshes nearby venue candidates from local runtime state
- routes ambiguous cases into a venue selection screen
- submits user-added venues to Supabase
- persists last activation settings when a user becomes visible
- exposes venue mute/hide controls to Safety and Settings

### Background Task

- [src/features/location/location-task.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/features/location/location-task.ts:1)

This defines the Expo Task Manager background task:

- receives location updates
- takes the newest location fix
- forwards the coordinates into the processing pipeline

### Location Service

- [src/features/location/location-service.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/features/location/location-service.ts:1)

This is the orchestration layer. It handles:

- permission requests
- background location registration
- notification category setup
- nearby venue candidate persistence
- selected venue persistence
- dwell timing
- cooldown timing
- notification response handling
- activation prefill persistence
- venue hidden/muted preference updates

Core logic:

1. Request foreground location permission.
2. Request background location permission.
3. Register background location updates if not already running.
4. For each location fix, build the nearby venue candidate list.
5. If no venue candidates exist, clear current dwell state.
6. If multiple venue candidates exist and the user has not confirmed one, mark venue selection as required.
7. If the user already selected one of the current candidates, prefer that venue over the top-ranked Google result.
8. Update dwell state for the current venue.
9. If the venue is muted or cooling down, do nothing.
10. If the user has been there at least 5 minutes, schedule a local notification.
11. If the user taps `Yes`, reopen into activation.
12. If the user taps `No` or ignores the prompt long enough, start a 2-hour cooldown for that venue.

### Venue Detection

- [src/features/location/venue-detection.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/features/location/venue-detection.ts:1)

This file maps coordinates to one or more venue candidates.

It currently uses three paths:

- Supabase `public.venues` lookup for app-created venues
- Google Places API lookup if `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` is configured
- local fallback catalog if no Google Places key is present or no result is found

Current matching behavior:

- fetch nearby Supabase venue candidates using saved geofence centers and radii
- fetch up to 5 nearby Google Places candidates
- search within a 100 meter radius
- discard candidates farther than 120 meters from the current device fix
- merge and dedupe backend venues with Google Places candidates
- sort candidates by straight-line distance
- fall back to the local venue catalog only when backend and Google candidate lists are empty
- return a candidate list instead of only a single guessed venue

The local fallback catalog still includes a sample venue:

- `Café Regatta`

### Local Persistence

- [src/features/location/location-storage.ts](/Users/kelvinaliche/Desktop/Projects/leftApp/src/features/location/location-storage.ts:1)

This file stores device-side state in `AsyncStorage`.

It persists:

- location runtime state
- nearby venue candidates
- user-selected venue
- last known coordinates
- current dwell context
- pending notification response state
- venue preferences
- last activation defaults

### Venue Selection UI

- [src/screens/left/VenueSelectionScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/VenueSelectionScreen.tsx:1)

This file contains:

- the nearby venue chooser
- the `Add +` venue form

## Permission Flow

The permission flow is triggered from onboarding.

- [src/screens/left/OnboardingScreens.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/OnboardingScreens.tsx:63)
- [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/app/LeftApp.tsx:1)

Current behavior:

- the onboarding screen explains that background location is required
- tapping `Finish setup` requests the actual OS permissions
- if background location is denied, onboarding does not complete
- if granted, the app registers background tracking and proceeds

## Dwell + Prompt Logic

The current dwell logic is:

- detect nearby venue candidates from a location fix
- require explicit confirmation when several venues are nearby
- once a venue is selected, use that venue for dwell timing
- if the venue changes, start a new dwell timer
- if the user remains at the same venue for 5 minutes, they become eligible for a prompt
- the prompt is a local notification:
  `You've been at [Venue Name] a while. Open to chat?`

User actions:

- `Yes`: mark the prompt handled and launch activation flow
- `No`: start a 2-hour cooldown for that venue
- ignore: after the ignore timeout, treat it like `No` and apply the cooldown

## Venue Selection Flow

When the device appears to be near multiple venues:

- the app stores the nearby venue list locally
- the venue home flow redirects to `Pick your venue`
- the user taps the exact venue they are in
- that choice is persisted locally and reused while the user remains near the same candidate set

This reduces false venue assignment in dense areas where GPS can place the user near several storefronts, entrances, or floors.

## Add + Venue Flow

If the correct venue is not listed, the user can tap `Can't find your venue? Add +`.

The app currently:

- captures the venue name
- captures venue type
- captures address or landmark text
- captures optional notes
- uses the current device coordinates as the geofence center
- checks the current nearby candidate list for an obvious duplicate by normalized venue name
- inserts a pending row into `public.venue_submissions`
- stores the submitted venue locally as the user’s current selected venue

Database write enablement:

- [supabase/migrations/0001_left_mvp.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0001_left_mvp.sql:95)
- [supabase/migrations/0009_user_venue_inserts.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0009_user_venue_inserts.sql:1)
- [supabase/migrations/0010_venue_submissions.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0010_venue_submissions.sql:1)

Important caveat:

- user-added venues are now stored as pending submissions in the backend
- automatic nearby lookup now merges backend venues with Google Places candidates
- pending submissions do not automatically become reusable for other users until they are promoted into `public.venues`

## Venue Safety Preferences

The app currently supports two persisted venue-level controls:

- `Hide me at [venue]`
- `Never notify me here`

These are exposed in:

- [src/screens/left/SafetyScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/SafetyScreen.tsx:6)
- [src/screens/left/SettingsScreen.tsx](/Users/kelvinaliche/Desktop/Projects/leftApp/src/screens/left/SettingsScreen.tsx:9)

Behavior:

- hidden venue: user is suppressed in the app’s venue/feed surface for that venue
- muted venue: dwell notifications are permanently suppressed for that venue until undone

## Activation Prefill

When a user activates a session, the app stores the latest:

- intent
- vibes
- duration
- hint text

Those defaults are reloaded on startup so notification-driven activation can reopen the app with the previous settings already selected.

## What Stays On-Device

The current implementation keeps the following on-device:

- raw GPS coordinates used for automatic venue matching
- nearby venue candidate list
- selected nearby venue choice
- dwell timing state
- prompt/cooldown state
- venue hidden/muted preferences
- last activation defaults

This still matches the intended privacy direction for automatic venue matching: venue detection happens locally first and does not require backend-side coordinate processing.

## What Reaches the Backend Today

The backend currently handles:

- user profiles
- presence sessions
- nearby feed model
- safety-related records already in schema
- user-added venue submissions created through `Add +`

Relevant schema file:

- [supabase/migrations/0001_left_mvp.sql](/Users/kelvinaliche/Desktop/Projects/leftApp/supabase/migrations/0001_left_mvp.sql:95)

The location stack and the Supabase social model are still not fully connected. Venue selection is local-first and not yet used to drive real backend presence activation.

## Configuration

### Required Native Configuration

- [app.json](/Users/kelvinaliche/Desktop/Projects/leftApp/app.json:1)

Current config includes:

- iOS usage descriptions for foreground and background location
- iOS background location mode
- Android location permissions
- Expo plugins for `expo-location` and `expo-notifications`

### Optional Environment Variable

- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`

If this is missing, venue detection falls back to the local venue catalog.

## Current Limitations

Important gaps remain:

- venue preferences are stored locally only, not synced per user in Supabase
- pending venue submissions still need an approval or promotion workflow into canonical `public.venues`
- the local fallback catalog is still tiny
- venue density, pulse copy, and nearby feed are still partly mock-driven
- location-driven venue detection is not yet connected to backend presence session creation
- Expo Go is not a reliable environment for testing this flow; it should be tested in a dev build or native run

## Recommended Next Steps

1. Add a backend table for per-user venue preferences so hide/mute rules persist across reinstalls and devices.
2. Add an approval workflow that promotes accepted `venue_submissions` rows into canonical `public.venues`.
3. Strengthen deduplication beyond exact-name matching.
4. Connect successful venue detection to actual presence-session creation and nearby feed loading.
5. Replace the local fallback catalog with a real venue ingestion strategy for development and production.
6. Add explicit handling for the `Pause visibility` state so it affects server-visible presence, not just local UI.
7. Add analytics/logging around permission denial, venue detection, venue selection, prompt firing, and prompt response outcomes.

## Summary

The app now has a real device-side venue foundation:

- onboarding requests real background location permission
- background tracking is registered
- venue detection runs on-device first
- ambiguous nearby venues require explicit user confirmation
- users can add missing venues from the app
- venue dwell prompting exists
- venue safety preferences are persisted locally
- activation defaults are persisted locally

What is still missing is the full bridge from venue detection into real backend presence creation and the live nearby feed.
