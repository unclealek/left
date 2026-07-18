# Venues and Google Places

## Purpose

This document explains:

- how Left currently uses Google Places
- what Google Places is used for in the venue pipeline
- how the app is currently saving API cost
- how venue images should be integrated
- the recommended MVP approach for using Google venue photos without driving cost up

## Current Venue Detection Flow

Left is designed to be database-first and Google-second.

### 1. A location fix comes in

When the app receives a foreground or background location fix, it tries to determine which venue the user is currently at.

### 2. Check our own venues table first

The app first looks for nearby venues in our own `venues` table.

This is the preferred path because:

- it avoids a Google API call
- it uses our own canonical venue IDs
- it allows the same venue to work for many users without repeated Google lookups

### 3. Only call Google if the DB has no nearby match

If no venue is found in our database, the app calls Google Places Nearby Search.

That Google call is currently used to get:

- Google place ID
- venue name
- coordinates
- primary place type
- photo metadata name

### 4. Canonicalize the Google venue into our DB

If Google returns a valid venue candidate, Left upserts it into our own `venues` table.

That means we save:

- internal venue UUID
- venue name
- geofence center/radius
- `google_place_id`
- source as `google_places`
- some source payload such as the primary type and photo metadata name

After this, the venue becomes one of our own known venues.

### 5. Future users should hit the DB-first path

Once a venue is in our database, later users near the same place should be matched from our DB without needing another Google Places lookup.

## What We Currently Use Google Places For

Google Places is currently used for:

- discovering nearby venues when our database does not yet know them
- mapping a real-world place into a canonical venue record
- storing a stable `google_place_id` for that venue

Google Places is not meant to be the primary source of truth after a venue has already been saved in our DB.

## Current API Cost Control

The current venue architecture already saves API cost in these ways:

- DB-first matching before Google fallback
- Google only runs when our venue table has no nearby result
- newly discovered Google venues are stored in our own DB
- future users can reuse the saved venue instead of triggering a new Google lookup
- the nearby search radius is small
- the max Google result count is limited

This is the core MVP cost-saving strategy and should remain in place.

## Current Weak Spot

The current Google nearby search field mask includes photo metadata:

- `places.photos.name`

That means we are already requesting photo-related data during discovery even though we are not yet rendering Google venue photos in the product.

For MVP cost control, this is not ideal.

## Recommended MVP Rule

### Do not fetch Google venue photo info during venue discovery

Instead:

- use Google only to identify and save the venue
- use placeholders by default for venue imagery
- fetch Google photo info only when a user opens a single venue page

This keeps image-related API usage tied to high-intent user actions.

## Recommended Venue Image Strategy

### Default image behavior

Use local illustrations or placeholders by default for venue images.

This is the current low-cost behavior and should remain the baseline.

### Only fetch Google photo info on the venue page

When a user opens a single venue page:

1. check whether that venue has a `google_place_id`
2. if not, keep the placeholder illustration
3. if yes, request Google photo info for that one venue
4. if a photo is available, render it
5. if the request fails or returns nothing, keep the placeholder

### Do not use Google venue photos on low-value surfaces

For MVP, do not fetch Google photo data for:

- nearby venue lists
- feed cards
- venue selection lists
- hidden-state venue browsing lists
- map marker cards
- multi-card browse surfaces

These should continue using placeholders or local illustrations.

## Why This Recommendation Saves Cost

If we fetch Google photo info everywhere, cost increases quickly because:

- many surfaces render multiple venues at once
- lists and cards can re-render often
- users may browse several places without ever opening a detailed venue page

If we fetch photo info only on the venue page:

- only one venue is resolved at a time
- requests happen on deliberate user intent
- most browsing still uses placeholders
- Google venue discovery and Google venue imagery remain separate cost decisions

## Recommended New Flow

### Venue discovery flow

1. receive location
2. check our `venues` table first
3. if DB venue exists, use it
4. if not, call Google Places to identify the venue
5. save the venue into our DB
6. use our internal venue UUID going forward

### Venue image flow

1. user opens a full venue page
2. app checks `google_place_id`
3. if there is no `google_place_id`, show placeholder
4. if there is a `google_place_id`, request Google photo info for that one venue
5. render Google image if available
6. otherwise keep placeholder

## Recommended MVP Implementation Changes

### Remove photo metadata from the nearby search field mask

The nearby search should only request venue discovery fields.

Recommended discovery field mask:

- `places.id`
- `places.displayName`
- `places.location`
- `places.primaryType`

For MVP, remove:

- `places.photos.name`

from the discovery path.

### Add a dedicated venue-image fetch path

Create a separate function for venue images that runs only when the venue page opens.

That function should:

- accept a venue record or `google_place_id`
- request only the minimum image/photo field needed
- return a renderable photo URL if available
- gracefully fall back to the existing placeholder image

### Keep placeholders as the system default

Google photos should enhance selected venue pages, not replace the entire venue-image system at MVP stage.

## What Users See If Google Is Unavailable

If Google is unavailable:

- venues already saved in our DB still work
- placeholders and local illustrations still work
- venue discovery only fails for places that are not already known to our DB

So the fallback behavior should remain:

- DB venue available -> normal experience
- DB venue unavailable + Google unavailable -> venue may not be confirmable

This is another reason to keep the DB-first architecture and not depend on Google photos for all venue surfaces.

## Final Recommendation

For MVP:

- keep the current DB-first venue architecture
- remove photo metadata from the Google nearby discovery field mask
- keep placeholder illustrations as default
- fetch Google venue photo info only when a user opens a single venue page
- do not use Google venue photos on list/grid/map browse surfaces yet

This gives Left the best balance of:

- low API cost
- graceful fallback behavior
- venue identity persistence
- room to improve visual richness later
