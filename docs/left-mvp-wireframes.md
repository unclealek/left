# Left MVP Wireframes

Source inputs:
- `contextual_social_app_v2_spec.pdf`
- `contextual_social_app_design_review.pdf`
- `left designs ui/left_social_discovery_flow_refined/code.html`
- `left designs ui/home_discovery_map/code.html`
- `left designs ui/activation_set_vibe/code.html`
- `left designs/soft_anonymity_profile/code.html`
- `left designs ui/approaching_timer/code.html`
- `left designs/safety_controls/code.html`
- `left designs/spatial_presence_feed/code.html`
- `left designs/connection_moment/code.html`

Purpose:
- translate the existing visual mockups into low-fidelity product wireframes
- preserve the MVP flow without locking implementation to current styling
- make screen structure, hierarchy, and actions explicit for engineering
- align the wireframes with the V2 product spec and senior design review in `left_design_ui.md` and `left_design.md`

## Core Flow

```mermaid
flowchart TD
  A["Background dwell-time detected"] --> B["Visibility prompt"]
  B --> C["Set intent + vibe + duration + hint"]
  C --> D["Become visible"]
  D --> E["Nearby feed / venue context"]
  E --> F["Open soft-anonymity profile"]
  F --> G["Wave or I'm going over"]
  G --> H["Approaching micro-state"]
  H --> I["Real-world conversation"]
  E --> J["Safety controls"]
  F --> J
  H --> J
```

## Canonical MVP Discovery Surface

The canonical MVP discovery surface is the `Nearby Feed`.

Interpretation:
- the nearby feed is the primary interactive surface for discovery and decision-making
- venue context supports the decision to activate or browse
- the bubble/spatial layer is a secondary visualization of the same data, not a separate MVP flow

Engineering implication:
- build one discovery data model and one primary click path
- do not split the MVP into competing map-first and feed-first experiences

## MVP Screen Priority

The V2 design review makes the screen priority explicit. Wireframe these first:

1. Presence Activation Sheet
2. Nearby Feed Card
3. Approaching Micro-State

The venue context, bubble visualization, and safety surfaces support this core loop.

## Screen 1: Presence Activation Sheet

Goal:
- convert a prompted user into an intentionally visible participant with minimal friction
- preserve opt-in presence and temporary visibility

Primary actions:
- choose intent
- choose vibe(s)
- choose active duration
- add a visual identification hint
- become visible

Low-fi wireframe:

```text
+--------------------------------------------------+
| Prompt / entry                                   |
| Open to interaction nearby?                      |
+--------------------------------------------------+
|                bottom sheet                      |
|  Intent                                          |
|  [Networking] [Open to chat] [Group discussion]  |
|                                                  |
|  Setting vibe                                    |
|  [AI/startups] [Design] [Travel] [Other]         |
|                                                  |
|  Duration                                        |
|  [30m] [1h active] [2h]                          |
|                                                  |
|  Hint card                                       |
|  "Grey hoodie, corner seat"                      |
|                                                  |
|  [ Become visible ]                              |
+--------------------------------------------------+
```

Rules:
- one primary intent at a time
- one or more vibes allowed
- duration must expire automatically
- hint is optional but strongly encouraged
- defaults should preload from the last successful session

## Screen 2: Nearby Feed Card

Goal:
- show enough contextual information to decide whether to approach without oversharing
- support a fast decision in the core loop

Primary actions:
- open a nearby profile
- wave
- hide or dismiss a user
- open safety controls

Low-fi wireframe:

```text
+--------------------------------------------------+
| Venue name                     Energy badge      |
| N visible now                                     |
+--------------------------------------------------+
| Kelvin                                           |
| [Networking] [AI/startups]                       |
| Hint: Blue headphones                            |
| You both selected AI/startups                    |
|                                                  |
| [ Wave ] [ View profile ] [ Hide ]               |
+--------------------------------------------------+
| Safety FAB                                       |
+--------------------------------------------------+
```

Rules:
- first name, vibe, intent, and hint are enough for feed-level decisioning
- shared alignment signal should be factual, low-pressure, and singular
- exact coordinates are not shown
- no persistent “save user” action in MVP

## Screen 3: Soft-Anonymity Profile

Goal:
- provide enough signal to decide whether to engage
- preserve privacy until mutual intent is stronger

Primary actions:
- wave
- commit to approach
- open safety controls

Low-fi wireframe:

```text
+--------------------------------------------------+
| Ambient header / blurred discovery context       |
+--------------------------------------------------+
| Avatar   Display name / alias                    |
|          [Intent] [Shared vibe]                  |
|                                                  |
| Hint                                             |
| Look for: Blue headphones                        |
|                                                  |
| Shared context                                   |
| You both selected AI/startups                    |
|                                                  |
| Icebreaker                                       |
| "What's the most exciting project..."            |
|                                                  |
| [ Wave ]     [ I'm going over ]                  |
+--------------------------------------------------+
| Safety FAB                                       |
+--------------------------------------------------+
```

Rules:
- profile is contextual, not identity-heavy
- first name and hint card are always visible
- avatar and vibe become more prominent after opening the profile
- intent should be surfaced when it matches the viewer's context
- mutual context should be surfaced above generic bio content
- no chat entry point in MVP

## Screen 4: Approaching Micro-State

Goal:
- support an in-person connection attempt with clear temporal pressure
- reduce ambiguity during approach

Primary actions:
- confirm connection happened
- cancel approach
- escalate to safety if needed

Low-fi wireframe:

```text
+--------------------------------------------------+
| I'm going over                                   |
+--------------------------------------------------+
| Kelvin                                           |
+--------------------------------------------------+
|                                                  |
|                circular countdown                |
|                      60 sec                      |
|                                                  |
|  Look for                                        |
|  Blue headphones                                 |
|                                                  |
|  Icebreaker prompt                               |
|  "What's the most exciting project..."           |
|                                                  |
|  [ I'm going over ]                              |
|  [ We connected! ]                               |
|  [ Cancel ]                                      |
+--------------------------------------------------+
```

Rules:
- countdown colors shift from normal to warning to urgent
- timer should expire automatically
- post-expiry state must close the encounter or require explicit reset
- this is the explicit handoff from digital confidence to physical action

## Screen 5: Venue Pulse / Empty State

Goal:
- prevent low-density venues from feeling broken or abandoned
- explain why no one is visible yet

Primary actions:
- understand venue activity
- decide whether to activate

Low-fi wireframe:

```text
+--------------------------------------------------+
| Venue pulse                                      |
+--------------------------------------------------+
| This spot is quiet right now                     |
|                                                  |
| 3 people have been active here this week         |
| or                                               |
| Be the first to open up here                     |
|                                                  |
| Active vibes recently                            |
| [AI/startups] [Creativity]                       |
|                                                  |
| [ Become visible ]                               |
+--------------------------------------------------+
```

Rules:
- empty state must explain low-density conditions
- venue pulse should invite action rather than imply failure

## Screen 6: Safety Controls

Goal:
- give the user a visible escape hatch at all stages
- make safety features proactive, not buried in settings

Primary actions:
- pause visibility
- end current session
- block/report
- manage safety zones

Low-fi wireframe:

```text
+--------------------------------------------------+
| Safety Settings                                  |
+--------------------------------------------------+
| Visibility status                                |
| [ Pause visibility ] [ End current session ]     |
|                                                  |
| Session actions                                  |
| [ Block person ] [ Report interaction ]          |
|                                                  |
| Safety zones                                     |
| [ Home ] [ Work ] [ Add new safety zone ]        |
|                                                  |
| Safety scan / system state                       |
| "Safety scan complete"                           |
+--------------------------------------------------+
```

Rules:
- safety entry point remains persistent across discovery and encounter flows
- hiding or ending a session should be fast and reversible where safe
- blocking/reporting should require minimal effort

## Screen 7: Bubble Visualization Layer

Goal:
- reinforce the ambient visual identity of the product
- provide an optional alternate view over the same nearby feed data

Primary actions:
- glance at nearby activity
- tap into the same underlying profile records
- access safety

Low-fi wireframe:

```text
+--------------------------------------------------+
| Venue / context header                           |
+--------------------------------------------------+
|                                                  |
|      o         O highlighted match               |
|   o      O user bubble                           |
|         o      o                                 |
|                                                  |
|  Tap bubble -> opens same profile as feed        |
+--------------------------------------------------+
| Safety FAB                                       |
+--------------------------------------------------+
```

Rules:
- this view must reuse the same source records as the nearby feed
- no discovery-only fields should exist here
- if engineering bandwidth is limited, this layer can ship after the nearby feed

## Screen 7: Connection Moment

Goal:
- represent the strongest mutual-interest state before or during in-person contact

Primary actions:
- confirm presence
- continue interaction
- access safety

Low-fi wireframe:

```text
+--------------------------------------------------+
| Connection moment                                |
+--------------------------------------------------+
| two overlapping orbs / mirrored presence         |
| anonymous but warm visual treatment              |
|                                                  |
| shared moment copy                               |
| contextual prompt                                |
|                                                  |
| [ Continue ]                                     |
+--------------------------------------------------+
| Safety FAB                                       |
+--------------------------------------------------+
```

## MVP Navigation Model

- default entry: dwell-time prompt or current venue context
- primary conversion action: activation sheet
- nearby feed is the primary discovery surface
- profile opens as modal sheet from feed
- bubble visualization, if present, opens the same profile objects as the feed
- approaching micro-state is a focused full-screen mode
- safety is always reachable from a persistent FAB or top-level action

## Open Gaps Before Build

- whether display names are first names only or aliases plus first names
- the exact progressive reveal rule for name, avatar, intent, and vibe
- whether discovery is strictly venue-based or broader area-based
- whether wave requires reciprocal acceptance before approach
- what happens when approach timer expires without confirmation
- how safety zones affect visibility and matching
