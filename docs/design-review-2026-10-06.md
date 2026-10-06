# LEFT design reevaluation — 6 October 2026

Reviewed using the frontend-design skill. Evidence: current Home, Activation, Feed, Approach, Venue Detail, navigation and theme source; the saved onboarding screenshot `screenshots/onboarding-launch-ready.jpg`; existing product design documents. The screenshot is a saved artifact, not a fresh runtime capture. Authenticated screens have been assessed from source, not verified on a running device. No application code was changed.

## Direction

Keep LEFT's warm neutral surfaces, dark brown actions, green accent, Manrope typography and recognizable mark. The saved onboarding screen already expresses a calm, human product. Focus the next pass on making the real-world meeting flow clearer rather than introducing a new visual identity.

The hierarchy should answer: Where am I? Am I visible? Who is open to meeting? How do I recognize them?

## Prioritized findings

### 1. Correct the visibility promise before visual polish

ActivationScreen.tsx:336–337 says location and details remain private and that people only see vibes and a hint. FeedScreen shows first names, intent and remaining time; the venue context is also visible. VenueDetailScreen.tsx:287 describes a different set of shared fields. These conflicting promises undermine informed consent.

Use one accurate disclosure across activation and venue details, explicitly distinguishing precise location from venue presence. Candidate wording, subject to checking every exposed field: “While visible, people here can see your first name, venue, intent, vibes and recognition hint. Your precise location stays private.” Include session expiry information where relevant.

### 2. Put the meeting loop ahead of editorial home content

HomeScreen renders the venue header, editorial headline, optional profile-completion nudge, presence controls and featured venue before the people section. The repeated uppercase section introductions add another hierarchy layer.

Proposed order: compact venue header; visible/private state with primary action; people here or a useful private/empty state; nearby places. Move profile completion into Profile unless a missing field actually blocks activation. Keep one expressive headline rather than repeated editorial labels. Check the resulting first viewport on small phones before finalizing spacing.

### 3. Reduce friction in activation

The hint editor starts expanded with autoFocus (ActivationScreen.tsx:312), so opening activation can immediately summon the keyboard before users review venue, vibe and duration. The required hint sits inside a collapsible control.

Remove automatic focus. Keep the required hint visibly available, label it “How can people recognize you?”, and show an example. Keep venue, selected vibe, duration and the sharing disclosure easy to scan before confirmation. Do not silently change required-hint behavior to match older product documents.

The slider already has an accessibility activation action in components/buttons/index.tsx; do not report it as gesture-only. Test its screen-reader and keyboard behavior before deciding whether to replace it with a conventional confirmation button.

### 4. Make recognition more prominent than the countdown

ApproachScreen.tsx places a large seconds timer above the recognition hint and icebreaker. That hierarchy risks making a social interaction feel like a deadline.

Make the person's name and “Look for” hint the main content; put the countdown in a secondary status line that explains its purpose. Preserve expiry behavior and easy cancellation/safety access. This is a hierarchy recommendation, not a request to change the underlying approach state machine.

### 5. Make popular times useful at a glance

VenueDetailScreen.tsx:245 renders seven rows of 24 bars, with each hour individually accessible. The only time labels are the overall 00:00–23:00 caption. That is dense for a phone and potentially lengthy to traverse with a screen reader.

Default to today's histogram, offer a day selector, and label a few meaningful hours. Provide a concise spoken summary with optional hourly details. Preserve the distinction between typical venue activity and people currently visible on LEFT. Keep no-data and pending states visually quiet and explicit; missing data must never read as zero activity. Retain the existing typical-activity caption and verify freshness wording before making stronger “live” claims.

### 6. Strengthen small functional text and quiet repeated motion

Home styles use 9px presence-state labels and 11px presence explanations/profile prompts. Important consent and status information deserves more readable sizing; start with 13–14px supporting text and validate large text scaling rather than simply increasing every label. The 7px brand caption is decorative and lower priority.

Home also loops a heartbeat animation while visible. It already respects reduced motion, which should be preserved. Prefer a steady visible state and a brief transition on activation; the status does not need continuous animation to remain understandable.

## Recommended first implementation batch

1. Align visibility disclosures with actual displayed fields.
2. Reorder Home around presence and people, retaining the existing palette and components.
3. Remove activation autofocus and improve required-hint labeling.
4. Rebalance Approach around recognition.
5. Improve the popular-times chart in a separate focused pass.

## Verification still required

These findings are a source-backed initial review, not a completed device accessibility audit. Before approving a redesign, capture current and revised screens on small and large phones; check large text, keyboard-open activation, VoiceOver/TalkBack, long venue names, private/visible states, empty people lists, venue confirmation errors and popular-times pending/no-data/error states. Measure composited text contrast, particularly over translucent surfaces. No contrast compliance or runtime layout result is claimed here.

## Implemented design pass

The follow-up implementation keeps the actual source palette: porcelain #F4F2EE, ink #1A1815, moss/action green #5F733F, white #FFFFFF and soft moss #E8EEDF. Manrope remains the single type family. The earlier reference to brown actions described the saved onboarding artifact; current screen tokens use green actions. Layout is left-aligned, with venue context → presence controls → people → places. Recognition is the strongest element on Approach. No new ornamental palette or component kit was introduced.

Changes:
- Shared visibility disclosure now includes the public profile's first name, avatar, venue, intent, vibes, recognition hint, remaining time, interests, offering and conversation style. Precise-location wording is explicit.
- Home prioritizes presence and people, removes the editorial intro/profile nudge and repeated uppercase section introductions, and uses steady status indicators. Profile already retains its completion action. Presence text is larger, the primary action uses a full-width layout, and venue names can wrap.
- Activation keeps its required hint editor open without autofocus, supplies an accessibility label, and gives the disclosure room to wrap.
- Approach emphasizes the person's name and recognition hint; the secondary countdown explains the return to nearby people. Existing expiry, cancellation and confirmation behavior is retained.
- Popular times shows today's venue-local day when the timezone is known, otherwise Monday without a “Today” claim. Day selection, hour labels, a concise summary, missing-data markers and optional hourly text replace seven dense mini charts. The existing readiness/freshness gating remains unchanged.

Validation:
- TypeScript check passes.
- Full suite: 131 tests pass across 24 files.
- Five new chart tests cover venue-local date boundaries, absent/invalid timezone, missing versus zero activity, no-data days and complete zero-activity days. Chart helper coverage is 100% for lines, statements, branches and functions.
- Expo web and iOS production exports pass.
- Rendered actual screen components with synthetic fixtures in a local web preview at 392px and 320px content widths. Inspected Home private/visible states, activation, Approach and the chart. Exercised day changes, expanded hourly details, no-data days and required-hint entry. No live presence mutation or paid data call was used.
- The preview caught disclosure padding/wrapping and avatar contrast issues, which were corrected. React review checked hook ordering, stable list keys, selected/expanded accessibility state and preservation of the slider's existing accessibility action.

Remaining limits: this is not a native VoiceOver/TalkBack, native keyboard or large-system-text certification. The web fixture does not verify authenticated API flows, native blur, or native device layout. Nothing was deployed.
