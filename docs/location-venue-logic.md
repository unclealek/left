# Location + Venue Logic

This document explains how location and venue detection currently work in the app, which files own each part of the flow, what data stays on-device, and what is still incomplete.

## Goal

The app uses background location to detect when a user has been at a social venue long enough to justify a low-pressure prompt. The intended product rule is:

- device location is used only to determine whether the user is at a venue
- raw latitude and longitude are not sent to the backend for venue detection
- only venue-level state should drive the social experience

## Current Architecture

The current implementation is device-first.

- Device code requests foreground and background location permission during onboarding.
- A background location task is registered through Expo.
- Each location fix is processed on-device.
- The app attempts to match the coordinates to a venue.
- If the user remains at the same venue for 5 minutes, a local push notification is triggered.
- Venue-level safety preferences are stored locally and applied before prompting.
- Last-used activation defaults are stored locally so notification-driven activation can reopen with prefilled values.

## Files

### App Entry

- [App.tsx](/Users/kelvinaliche/Desktop/Projects/left%20app/App.tsx:1)

This imports the background task module so Expo registers the task when the app starts.

### App Shell Integration

- [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/left%20app/src/app/LeftApp.tsx:1)

This file connects the location system to the UI:

- bootstraps permission and registration state on app load
- loads saved activation defaults
- listens for notification responses
- requests required location permission during onboarding
- persists last activation settings when a user becomes visible
- exposes venue mute/hide controls to Safety and Settings

### Background Task

- [src/features/location/location-task.ts](/Users/kelvinaliche/Desktop/Projects/left%20app/src/features/location/location-task.ts:1)

This defines the Expo Task Manager background task:

- receives location updates
- takes the newest location fix
- forwards the coordinates into the processing pipeline

### Location Service

- [src/features/location/location-service.ts](/Users/kelvinaliche/Desktop/Projects/left%20app/src/features/location/location-service.ts:1)

This is the main orchestration layer. It handles:

- permission requests
- background location registration
- notification category setup
- dwell timing
- cooldown timing
- notification response handling
- activation prefill persistence
- venue hidden/muted preference updates

Core logic in this file:

1. Request foreground location permission.
2. Request background location permission.
3. Register background location updates if not already running.
4. For each location fix, detect whether the user is at a venue.
5. If not at a venue, clear current dwell state.
6. If at a venue, update dwell state.
7. If the venue is muted or cooling down, do nothing.
8. If the user has been there at least 5 minutes, schedule a local notification.
9. If the user taps `Yes`, reopen into activation.
10. If the user taps `No` or ignores the prompt long enough, start a 2-hour cooldown for that venue.

### Venue Detection

- [src/features/location/venue-detection.ts](/Users/kelvinaliche/Desktop/Projects/left%20app/src/features/location/venue-detection.ts:1)

This file maps coordinates to a venue.

It currently uses two paths:

- Google Places API lookup if `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` is configured
- local fallback catalog if no Google Places key is present or no result is found

The local catalog currently includes a sample venue:

- `Café Regatta`

This fallback exists so the app can still be exercised during development without a live Places key.

### Local Persistence

- [src/features/location/location-storage.ts](/Users/kelvinaliche/Desktop/Projects/left%20app/src/features/location/location-storage.ts:1)

This file stores device-side state in `AsyncStorage`.

It persists:

- location runtime state
- current dwell context
- pending notification response state
- venue preferences
- last activation defaults

## Permission Flow

The permission flow is triggered from onboarding.

- [src/screens/left/OnboardingScreens.tsx](/Users/kelvinaliche/Desktop/Projects/left%20app/src/screens/left/OnboardingScreens.tsx:63)
- [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/left%20app/src/app/LeftApp.tsx:291)

Current behavior:

- the onboarding screen explains that background location is required
- tapping `Finish setup` requests the actual OS permissions
- if background location is denied, onboarding does not complete
- if granted, the app registers background tracking and proceeds

## Dwell + Prompt Logic

The current dwell logic is:

- detect a venue from a location fix
- if the venue changes, start a new dwell timer
- if the user remains at the same venue for 5 minutes, they become eligible for a prompt
- the prompt is a local notification:
  `You've been at [Venue Name] a while. Open to chat?`

User actions:

- `Yes`: mark the prompt handled and launch activation flow
- `No`: start a 2-hour cooldown for that venue
- ignore: after the ignore timeout, treat it like `No` and apply the cooldown

## Venue Safety Preferences

The app currently supports two persisted venue-level controls:

- `Hide me at [venue]`
- `Never notify me here`

These are exposed in:

- [src/screens/left/SafetyScreen.tsx](/Users/kelvinaliche/Desktop/Projects/left%20app/src/screens/left/SafetyScreen.tsx:6)
- [src/screens/left/SettingsScreen.tsx](/Users/kelvinaliche/Desktop/Projects/left%20app/src/screens/left/SettingsScreen.tsx:9)

Behavior:

- hidden venue: user is suppressed in the app’s venue/feed surface for that venue
- muted venue: dwell notifications are permanently suppressed for that venue until undone

Settings includes a `Manage venues` section so these preferences can be reversed later.

## Activation Prefill

When a user activates a session, the app stores the latest:

- intent
- vibes
- duration
- hint text

This is done in:

- [src/app/LeftApp.tsx](/Users/kelvinaliche/Desktop/Projects/left%20app/src/app/LeftApp.tsx:358)

Those defaults are reloaded on startup so notification-driven activation can reopen the app with the previous settings already selected.

## What Stays On-Device

The current implementation keeps the following on-device:

- raw GPS coordinates
- dwell timing state
- prompt/cooldown state
- venue hidden/muted preferences
- last activation defaults

This matches the intended privacy direction: venue detection should happen locally, and raw coordinates should not be required by the backend.

## What Reaches the Backend Today

The new location system does not currently sync venue detection state to Supabase.

The existing backend still handles:

- user profiles
- presence sessions
- nearby feed model
- safety-related records already in schema

Relevant schema file:

- [supabase/migrations/0001_left_mvp.sql](/Users/kelvinaliche/Desktop/Projects/left%20app/supabase/migrations/0001_left_mvp.sql:95)

Today, the location stack and the Supabase social model are not fully connected yet.

## Configuration

### Required Native Configuration

- [app.json](/Users/kelvinaliche/Desktop/Projects/left%20app/app.json:1)

Current config includes:

- iOS usage descriptions for foreground and background location
- iOS background location mode
- Android location permissions
- Expo plugins for `expo-location` and `expo-notifications`

### Optional Environment Variable

- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`

If this is missing, venue detection falls back to the local venue catalog.

## Current Limitations

This is a first implementation pass. Important gaps remain:

- venue preferences are stored locally only, not synced per user in Supabase
- venue detection only has one local fallback venue right now
- the nearby feed is still driven by mock/sample venue state in parts of the UI
- location-driven venue detection is not yet connected to backend presence session creation
- Expo Go is not a reliable environment for testing this flow; it should be tested in a dev build or native run

## Recommended Next Steps

1. Add a backend table for per-user venue preferences so hide/mute rules persist across reinstalls and devices.
2. Connect successful venue detection to actual presence-session creation and nearby feed loading.
3. Replace the local fallback catalog with a real venue ingestion strategy for development and production.
4. Add explicit handling for the `Pause visibility` state so it affects server-visible presence, not just local UI.
5. Add analytics/logging around permission denial, venue detection, prompt firing, and prompt response outcomes.

## Summary

The app now has a real device-side location foundation:

- onboarding requests real background location permission
- background tracking is registered
- venue detection runs on-device
- dwell timing and notifications work locally
- venue safety preferences are persisted locally
- activation can be reopened from a location prompt

What is still missing is the full bridge from device-side venue detection into the backend social graph and live nearby feed.
