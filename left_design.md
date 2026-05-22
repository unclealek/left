Contextual Social App
Senior Product Design Review
Based on V2 Product Specification — Design Critique, Flaw Analysis & Recommended Fixes
Prepared from collaborative design session · May 2026

Core Concept

Social activation layer for physical spaces — lowering the activation
energy of real-world conversation through mutual consent, contextual
identity, and hint-based recognition.

Flaw Buckets

Structural (blocks core loop) · Detail gaps (confuse build) ·
Philosophy tensions (inconsistent decisions)

Design Principle

Reality-first: every decision is tested against — does this get people
off their phones faster, or keep them on longer?

SECTION 1

Understanding the Core Concept
This is not a messaging app, a dating app, or a social media feed. It is a social activation layer
for physical spaces — scaffolding that lowers the cost of starting a real-world conversation
between strangers who are already in the same room.
The Problem

In any given café, airport, or coworking space, 3–5 people would enjoy talking to each other — b

The Insight

The app solves mutual consent (both people signal openness before any approach), recognition

The Product

The actual product is the conversation that happens in real life. The app is just the scaffolding. It

3-Layer Matching Model
Users become mutually visible only when all three layers align:
Layer 1 — Physical
Proximity

Users are in the same venue at the same time.

Layer 2 — Shared Intent

Both users have selected compatible intentions: networking,
open to conversation, group discussion, casual chat.

Layer 3 — Social Vibe

Contextual interest overlap: AI/startups, philosophy, travel,
productivity, creativity, language exchange.

SECTION 2

What Works Well in V2
✓

Presence State Machine
Invisible → Prompt Eligible → Prompted → Visible → Discoverable → Interaction Active →
Expiring → Invisible. Every feature maps to a state. Developers can build from this. Safety
team can reason about what's possible at each stage. This is production-quality thinking.

✓

Hint Card System
The most original idea in the product. Bridges digital discovery to physical recognition
without GPS exposure. 'Blue headphones' or 'Reading Dune' solves the recognition
problem elegantly. Should be positioned higher in the spec — it's a key differentiator.

✓

Notification Rules Engine
Dwell-time requirement (3–5 min), one prompt per venue per day, focus mode
suppression, no passive activation. Together these form a coherent anti-fatigue system.
Most apps skip this thinking entirely.

✓

Session Expiry UX
The 5-minute warning, extension prompt, and 'You are now invisible nearby' end state are
well-designed. Clean, satisfying, no ambiguity. Directly addresses the v1 gap.

✓

Safety Embedded in Flow
Report and block on every profile card, hide user in feed, instant invisibility toggle. Safety is
not an afterthought — it's integrated at every layer. Correct approach for a strangers-facing
product.

✓

Improved AI Prompts
The v2 prompts are specific enough to produce useful output. The backend prompt alone
— TTL expiration, mutual visibility constraints, dwell-time logic — will generate a schema a
developer can actually work with.

✓

Beta Success Metrics
Presence activation rate, repeat activation rate, real-world interaction rate, session
extension rate. These are behavioral metrics, not vanity metrics. They validate whether the
core loop actually works.

SECTION 3

Identified Flaws & Recommended Fixes
Structural Problems
These block the core loop if unresolved. Fix before wireframing.
Critical

Mutual openness indicator is undefined
Problem: The spec mentions 'mutual openness indicators' in step 9 but never
defines what they look like. This is load-bearing — it's the signal that tells someone
the other person is open to being approached.
Fix: When both users share at least one intent or vibe, highlight a single shared tag in
amber on the profile card. 'You both selected AI/startups.' Simple, factual,
low-pressure. No score, no percentage.

Critical

Low-density silent failure
Problem: The notification rules engine requires 'meaningful social density' as a
condition. If a user is alone at a venue, the app silently does nothing. They have no
idea why. This is the biggest retention killer in the product.
Fix: Add a passive 'venue pulse' visible even when not activated: '3 people have
been active here this week' or 'This spot is quiet — be the first to open up.' Reframes
empty state as invitation, not failure.

Critical

The offline-to-reality transition is one line
Problem: Step 10 says 'users interact in real life' but this is the hardest moment in
the entire experience. The spec doesn't design for the 30 seconds before someone
walks over — where all the anxiety lives.
Fix: Add an 'approaching' micro-state. When you tap a profile and decide to
approach, show one screen: their hint card large, the icebreaker suggestion, and a
single 'I'm going over' button that dims the UI and starts a soft 60-second timer. A
graceful push from digital to physical.

Detail Gaps
These create confusion during build. Resolve during wireframing.

Medium

'Save user' contradicts ephemeral philosophy
Problem: The nearby feed includes a 'save user' action, but the platform's core
philosophy is temporary, ephemeral presence. Saving creates a persistent social
record that directly contradicts the product's identity.
Fix: Remove from MVP entirely. Replace with a single post-session prompt: 'Did you
connect with someone today?' If yes, offer optional mutual contact exchange outside
the app. The app doesn't hold the relationship.

Medium

Messaging ambiguity
Problem: V2 says the app doesn't prioritise digital messaging, but the click paths still
include a chat page. V1 had 'waves and lightweight messaging' as a feature. V2 is
ambiguous about whether that survived.
Fix: Make a firm decision: waves only for MVP, no full chat. A wave signals interest
without requiring words. If both people wave back, show the icebreaker — that's the
handoff to real life. Chat can come in v3 if beta data supports it.

Medium

Venue page has no content hierarchy
Problem: The venue page is defined in section 10 with 6 data points: visible users,
vibes, intentions, clusters, energy level, density. No hierarchy — designers can't
prioritise without it.
Fix: Top to bottom: social energy indicator (warm/cool), number of visible people
now, active vibes as tags, then the list. No map, no exact positions. Answers 'is it
worth activating here?' in one glance.

Medium

User flow text still reflects v1 trigger model
Problem: The written steps 1–9 still say 'user enters venue' as step 1, but the
diagram correctly shows background detection as the trigger. These two are out of
sync.
Fix: Update the written steps to match the diagram. Step 1 should be 'Background
system detects dwell time at social venue.' A dev team handed this doc will build the
wrong trigger.

Philosophy Tensions
These cause inconsistent decisions downstream if unresolved in writing.
Tension

'Offline-first' vs entirely digital flow
Problem: The spec claims 'offline-first' but the entire user flow lives on a screen until
step 10. The framing is aspirational, not descriptive.
Fix: Reframe internally as 'reality-first.' Every design decision gets tested against:
does this get people off their phones faster, or keep them on longer? This becomes a
shared team principle for consistent downstream decisions.

Tension

Semi-anonymous identity rules are incomplete
Problem: The spec lists what's 'initially visible' but doesn't define what gets revealed,
when, and based on what trigger. Designers will interpret this differently.
Fix: Define a clear progressive reveal rule: first name and hint card always visible.
Avatar and vibe visible only after tapping a profile. Intent visible only when it matches
yours. Encode this as a rule, not a guideline.

SECTION 4

Recommended Week 1 Action Plan
Research First

Before any wireframes are drawn, do one afternoon of guerrilla research. Sit in a busy
Helsinki café and observe how people signal openness or closed-ness through body
language. Map those signals to the app's presence states. The hint card idea likely came
from an insight like this. There are 2–3 more sitting in that café.

Three Screens to Wireframe First
These three screens are the entire product in terms of the moment that matters. Get these
right before designing settings, onboarding, or admin.

Presence Activation Sheet

1

The core conversion moment. Must feel fast — defaults pre-filled from last session.
Intent, vibe, duration, hint card, then one large 'Become Visible' button. Every second of
friction here loses users.

Nearby Feed Card

2

The discovery surface. Show first name, vibe tag, intent tag, hint card, and the shared
alignment signal if applicable. No full profile until tap. Must communicate enough to
decide whether to approach without oversharing.

Approaching Micro-State

3

The moment before the walk-over. Hint card large. Icebreaker suggestion. 'I'm going
over' button that dims the UI and starts a soft timer. This screen doesn't exist in the
spec yet — it needs to be designed.

Decisions to Make Before Wireframing
— Waves only vs waves + lightweight messaging — commit to one for MVP
— Exact progressive reveal rules for identity (first name / avatar / intent / vibe)
— Minimum density threshold to run Helsinki beta meaningfully
— Beta launch date and what 'success' looks like in week 1 of beta
— Internal design principle: reality-first as a shared team rule

SECTION 5

Flaw Summary
Flaw

Category

Severity

Fix

Mutual openness indicator undefined

Structural

Critical

Shared tag highlighted on profile
card

Low-density silent failure

Structural

Critical

Venue pulse + 'be first to open up'
empty state

Offline-to-reality transition missing

Structural

Critical

Approaching micro-state screen

'Save user' contradicts philosophy

Detail

Medium

Remove; replace with
post-session connection prompt

Messaging ambiguity

Detail

Medium

Waves only for MVP; no full chat

Venue page no content hierarchy

Detail

Medium

Define top-to-bottom hierarchy in
spec

User flow text vs diagram mismatch

Detail

Medium

Update written steps to match
diagram

'Offline-first' framing is inaccurate

Philosophy

Tension

Reframe as 'reality-first' design
principle

Progressive reveal rules incomplete

Philosophy

Tension

Define explicit reveal rule per
profile field

This review is based on a collaborative design session analyzing the V1 and V2 product specifications.
The core concept is sound and the V2 spec represents a significant maturation. The identified gaps are
addressable — none are structural to the business idea itself.

