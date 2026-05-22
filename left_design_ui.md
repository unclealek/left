Contextual Social App — V2 Product
Specification
A contextual social networking platform that helps nearby users discover socially compatible people in the same
physical environment through intentional temporary presence.

The platform is designed to reduce the activation energy of real-world conversations while preserving safety, consent,
and social comfort.

1. Product Philosophy
The platform is NOT:
• a dating app
• a messaging platform
• a passive location tracking app
• a social media feed

The platform IS:
• a real-world social activation layer
• an offline-first interaction system
• a contextual social discovery engine
• a confidence layer for spontaneous interaction

Core principle:
The app facilitates real-world interaction rather than replacing it digitally.

2. Core MVP Concept
Users who are physically nearby and open to interaction become temporarily visible to each other.

Matching occurs through 3 layers:

Layer 1 — Physical Proximity
Users are nearby.

Layer 2 — Shared Intent
Examples:
• Networking
• Open to conversation
• Group discussions
• Casual conversations

Layer 3 — Flexible Social Context
Examples:
• AI/startups
• Philosophy
• Travel stories
• Productivity
• Creativity
• Language exchange

3. Background Detection Model (V2)
The app no longer relies on manual venue check-ins.

Instead, the app uses lightweight background geofencing and dwell-time detection.

Flow:
1. User enters meaningful area.
2. System detects dwell time.
3. If conditions are satisfied, user becomes eligible for social activation prompt.
4. User consciously decides whether to become visible.

The app NEVER makes users visible automatically.

4. Notification Rules Engine

The app uses controlled notification logic to prevent fatigue.

Prompt Conditions:
• User has remained in area for 3–5 minutes
• User has not already been prompted in same venue today
• Venue has meaningful social density
• User is not in focus mode
• User has not disabled prompts

Rules:
• Maximum 1 visibility prompt per venue per day
• No spam prompts
• No passive activation
• Presence is always opt-in

5. Presence Activation UX
Presence activation is the core interaction.

Activation Flow:

Step 1
Push notification appears:

"Open to interaction nearby?"

Step 2
User taps notification.

Step 3
Presence setup sheet opens.

Step 4
User selects:
• Intent
• Social vibe/context

• Duration
• Optional hint card

Step 5
User taps:
"Become Visible"

Only after explicit confirmation does visibility begin.

6. Hint Card System
Hint cards bridge digital discovery to physical-world recognition.

Examples:
• Yellow hoodie
• Blue headphones
• Reading Dune
• Black backpack
• Near the window

Purpose:
• Reduce uncertainty
• Avoid exact GPS exposure
• Preserve privacy
• Make approaching easier
• Create playful recognition

7. Semi-Anonymous Identity System
Initially visible:
• First name
• Soft profile image/avatar
• Intent
• Social vibe

• Hint card

The system balances:
• trust
• safety
• approachability
• low social pressure

The platform intentionally avoids full public identity exposure during initial discovery.

8. Final User Flow (V2)
Step 1
User enters meaningful area.

Examples:
• café
• coworking space
• airport
• gym
• university
• park

Step 2
Background system detects dwell time.

Step 3
User receives visibility prompt.

Step 4
User opens activation sheet.

Step 5
User selects:
• intent
• vibe

• duration
• optional hint card

Step 6
User taps:
"Become Visible"

Step 7
Nearby compatible users become visible.

Example:

Kelvin
Networking
AI/startups
"Blue headphones"

Step 8
User taps another profile.

Step 9
App provides:
• contextual information
• subtle icebreaker prompts
• mutual openness indicators

Step 10
Users interact in real life.

9. User Click Paths
Home:
• Activate visibility
• Browse nearby users
• Change vibe
• End session

• Update profile

Presence Setup:
• Select intent
• Select vibe
• Set timer
• Add hint card
• Enable visibility

Nearby Feed:
• View users
• Filter by vibe
• Hide user
• Save user
• Report user
• Block user

Profile Card:
• View name
• View vibe
• View intent
• View hint card
• View suggested icebreakers

Settings:
• Privacy controls
• Notification settings
• Focus mode
• Blocked users
• Visibility preferences

10. Venue Page Definition
The venue page represents the current local social environment.

Displays:

• Number of visible nearby users
• Active social vibes
• Popular intentions
• Nearby social clusters
• Social energy level
• Current activity density

Examples:
• "4 people networking nearby"
• "2 users discussing startups"
• "Creative energy high"

11. Icebreaker System
The app does not prioritize digital messaging.

Instead, it provides contextual social confidence.

Examples:
• "You both selected networking."
• "Ask about startup ideas."
• "Mention the book they’re reading."
• "You both selected AI/startups."

Purpose:
• reduce anxiety
• reduce awkwardness
• encourage real-world interaction

12. Session Expiry UX
Presence sessions automatically expire.

Expiry UX:

• 5-minute warning before expiration
• Extension prompt appears
• User may extend visibility
• If ignored, visibility ends automatically

Example:
"Your social presence is ending soon. Extend?"

After expiration:
"You are now invisible nearby."

13. Safety Systems Embedded Into Flow
Safety is integrated into every interaction layer.

Safety surfaces:
• Report button on every profile
• Block button on every profile
• Hide user option in nearby feed
• Focus mode disables prompts
• Instant invisibility toggle

Core safety principles:
• visibility is temporary
• visibility is consensual
• no public exact GPS
• no passive tracking
• no persistent public map

14. Presence State Machine
Invisible
→ Prompt Eligible
→ Prompted

→ Visible
→ Discoverable
→ Interaction Active
→ Expiring
→ Invisible

This state machine powers:
• notifications
• visibility
• analytics
• timers
• safety systems

15. Main App Pages
• Welcome
• Login/signup
• Onboarding
• Home
• Presence activation sheet
• Nearby feed
• Venue page
• User profile card
• Notifications
• Settings/privacy
• Admin moderation dashboard

16. Technical Stack
Frontend:
• React Native
• Expo
• TypeScript

Backend:
• Supabase
• PostgreSQL
• Realtime subscriptions

Services:
• Google Places API
• Firebase Notifications
• PostHog analytics

17. Beta Success Metrics
The Helsinki beta requires measurable behavioral success metrics.

Core Metrics:
• Presence activation rate
• Repeat activation rate
• Nearby profile click-through rate
• Real-world interaction rate
• Session extension rate
• Daily active users
• Return visits per week
• Average session duration

The beta goal is validating:
• spontaneous interaction demand
• repeated behavior
• social comfort
• density viability

18. Long-Term Vision
The long-term vision is a contextual social operating layer for real-world human interaction.

The platform helps people:
• interact more naturally
• reduce loneliness
• discover compatible nearby people
• build local communities
• socially navigate physical environments more confidently

19. Improved AI Prompts
Frontend Architecture Prompt:
"Design a React Native Expo architecture for a contextual social discovery app with temporary visibility sessions,
background dwell-time detection, hint cards, semi-anonymous discovery, and offline-first interaction design."

Backend Prompt:
"Generate a Supabase/PostgreSQL schema for temporary social presence sessions with TTL expiration, mutual
visibility constraints, dwell-time activation logic, background geofencing eligibility, and contextual vibe matching."

Notification Engine Prompt:
"Design a notification rules engine for a contextual social app with dwell-time activation, prompt cooldowns, visibility
expiration warnings, focus mode suppression, and anti-fatigue logic."

UX Prompt:
"Design low-pressure offline-first social interaction UX for nearby strangers using contextual identity cards, hint cards,
mutual openness indicators, and subtle icebreaker suggestions without persistent messaging."

