# Social Momentum

Social Momentum is a lightweight nudge system for users who are visible at a venue. It should help users notice whether they are mostly observing, warming up, engaging, or connected without judging their behavior.

## Current States

- `Observing`: user is visible but has not viewed profiles or taken direct interaction actions.
- `Warming up`: user has viewed at least one profile.
- `Engaging`: user has started an approach.
- `Connected`: user has confirmed an approach connection.

## User Experience

The first version shows a small dismissible card on the home venue screen while the user is visible. It reuses existing flows:

- `View people` opens the nearby feed.
- `Stay low-key` records a dismissal for the current visibility session.

The copy should stay supportive. Avoid phrases like "low-level interaction" or "less stimulating interaction" because they sound judgmental.

## Data Model

Events are stored in `public.social_interaction_events`:

- `became_visible`
- `profile_viewed`
- `approach_started`
- `approach_connected`
- `prompt_dismissed`
- `user_hidden`
- `user_blocked`
- `user_reported`

Each event belongs to the acting user and can optionally include a target user, venue, visibility session, and metadata.

The database change is in:

```text
supabase/migrations/0015_social_momentum_events.sql
```

Apply this migration to staging before testing preview builds. The app will continue to render without it, but event logging and session recovery for Social Momentum will warn/fail until the table exists.

## Implementation

Social Momentum logic is split across:

- `src/features/social-momentum/social-momentum-service.ts`: state derivation and event persistence.
- `src/features/presence/presence-service.ts`: active session and nearby feed persistence used to scope events.
- `src/screens/left/VenueScreen.tsx`: dismissible card UI.
- `src/app/LeftApp.tsx`: UI orchestration and navigation decisions.

## Safety Rules

Social Momentum must never override safety controls.

- Do not prompt after a user blocks or reports someone in the current visibility session.
- Do not suggest hidden, blocked, or reported users.
- Always allow dismissal.
- Keep prompts supportive and optional.
- Use event data to audit whether nudges correlate with reports or blocks before making the nudges stronger.

## Staging Test Pass

- Become visible and confirm a `became_visible` event is inserted.
- Open a profile and confirm `profile_viewed`.
- Start an approach and confirm `approach_started`.
- Confirm a connection and confirm `approach_connected`.
- Dismiss the card and confirm `prompt_dismissed` suppresses the card for that visibility session.
- Block or report a user and confirm nudges stop for that visibility session.
