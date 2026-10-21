# Hospitality Home redesign

Implemented locally on 2026-10-19. No backend deployment, migration, account change,
version bump or TestFlight upload was made for this redesign.

## Implementation and reuse

- `src/screens/left/HomeScreen.tsx`: photographic current-venue hero, one visibility
  action, anonymous People here, virtualized nearby carousel, private hosting and
  existing published gathering access. Local components share photo rendering,
  credits and section headers; visibility, people, venue and host cards have clear
  responsibilities without adding another screen/navigation system.
- `src/components/styles/features/home.ts` and
  `src/components/theme/hospitality.ts`: scoped approved palette and solid card styles.
- `src/components/left/BackgroundWaveLayer.tsx`: reuse the existing background entry
  point with a Home-only hospitality variant. Bundles the supplied 116 KB photo as
  `assets/backgrounds/hospitality.jpeg`, adds an ivory wash, and uses solid ivory
  under Reduce Transparency. Other screens keep their existing background.
- `src/components/buttons/index.tsx`: existing PrimaryButton gains an opt-in
  hospitality tone with white text for contrast. Defaults remain unchanged.
- `src/app/LeftApp.tsx`: existing venue runtime, activation, safety, people discovery,
  gathering and venue navigation callbacks connect to the new presentation.
- `src/features/lifecycle/session-lifecycle.ts`: manual visibility changes clear the
  UI after the existing RPC confirms success. Failure keeps the prior state with
  retry feedback. Already stored session expiry still ends local discoverability
  while offline. No new presence system or backend contract.
- `src/features/venues/venue-details-service.ts`: shared in-flight deduplication and
  bounded, user-scoped memory reuse (5 minutes for details/photo URLs, 30 seconds
  after failure). These short-lived photo URLs are separate from the indefinitely
  saved popular-times cache, which this task does not change.
- `src/screens/left/home-presentation.ts`: honest distance/category/activity labels.
  No walking time is inferred from straight-line distance. Forecasts use “Typically”.
  Stale or unsupported activity indicators are omitted.
- Existing LeftIcon, LeftLogoMark, Google photo/details API, native Liquid Glass
  footer, safety gates, expiry, Supabase enforcement and moderation flow are reused.
  No new dependencies. Map, Venues and Profile screens were not redesigned.

## Privacy and data boundaries

Home renders no personal names, avatars, identity hints, coordinates, or small-group
counts from the people feed. The existing feed is accessed through See all while
visible. Backend-approved aggregate counts by intent are not available, so Home
uses generic anonymous availability rather than inventing intent totals. The host
card opens the existing private draft/review flow without starting presence.

Current-venue confirmation uses the existing runtime ID/confidence logic and requires
a matching venue candidate. No current match shows a discovery state. Open in Maps
uses the public venue name/address/place ID, not user coordinates. Missing photos
show a neutral fallback; photo authors retain attribution links when supplied.

## Validation

- TypeScript: passed.
- Automated checks: 323 tests in 54 files passed, including Home private/visible/
  hidden/loading/error states, anonymous output, venue/host callback forwarding,
  no fabricated walking times, forecast/live labels, photo deduplication/expiry/
  account isolation/backoff, and server-confirmed versus expired presence transitions.
- Admin production build and whitespace/diff checks: passed.
- Lint: unavailable; this repository has no configured lint command.
- iPhone 18 Pro / iOS 27 simulator: native build succeeded; private Home, scrolling,
  carousel, last-card clearance, private hosting and the existing private venue gate
  were observed. Existing four-tab navigation is preserved and covered by tests.
- Staging venue-details logs included HTTP 429 responses; photo fallbacks were
  observed rather than a successful real-photo render. The simulator had no location
  fix, so its cached venue display is not fresh GPS proof.
- Large-text testing exposed native text layout clipping after a live size change.
  Home now remounts its content layout when font scale changes. The simulator then
  became signed out, so a visual recheck of that fix remains pending authentication.
  Simulator text size/transparency settings were restored to their original values.
- Visible Home is covered by mocked component tests; no real user's presence was
  activated for QA. Full backend visibility toggling, small/large iPhone device
  comparison, Android native rendering and physical-device checks remain pending.

This Home-only JavaScript/asset change does not itself require a native dependency
rebuild. Delivering the earlier native Liquid Glass navigation changes to an older
installed binary still requires the already-pending native build. No new EAS build
was submitted. Backend photo recovery and privacy-reviewed intent aggregates remain
separate integration/acceptance work; no fake data enters production flows.

## Reference-image correction — 2026-10-19

The supplied anonymous-venue UI image is now the composition reference. Removed
Home's extra brand heading and inset hero. The venue hero extends behind the status
bar and across the screen; the visibility card overlaps its lower edge. The card
uses a right-side eye symbol, state dot, white Go private action and divided safety
row. Private mode retains the single green Go visible action. Existing shared
GhostButton/PrimaryButton components handle both actions.

Visible People here now uses a horizontal row of pastel intent circles with icons,
without made-up counts or per-intent availability claims. Uses the supported casual
chat intent instead of inventing a Study backend category. Nearby cards are 128pt
wide with 70pt images, and typography/spacing/background wash follow the denser
reference. Hero Maps/address fields stack for large text. Hero photo credits stay
inside the padded image area so the overlapping card cannot cover them.

Verified the visible and private layouts using a temporary local-only simulator
preview, at full iPhone 18 Pro width and a 320pt content width. Large-text testing
confirmed the hero location no longer collapses beside Maps. Preview data made no
backend presence writes; the original App.tsx was restored byte-for-byte, and text
size restored. This is layout proof, not backend/session/device acceptance. Real
venue-photo availability still depends on the existing provider and rate limits.
No new dependencies, native changes or backend deployments in this correction.

## Real photographic fallback — 2026-10-19

Home's hero now reuses the existing café-interior photograph from
`assets/onboarding/private-by-default.jpg` whenever no real venue photo is available,
including missing location, private browsing and remote image failure. The source
and license record remain in `assets/onboarding/README.md`; no new asset/download or
image dependency is introduced. Existing real venue photos remain preferred while
private. The shared venue-image renderer accepts an optional photographic fallback;
nearby card behavior remains unchanged.

The hero labels the fallback “Illustrative café photo”, keeping venue confirmation
and visibility tied to real runtime/session state. Real-photo attribution replaces
that label only after the remote image successfully loads, and disappears again on
image failure. Regression tests cover an unknown location, private real-photo
loading and the transition back to the bundled image after an error.

## Shared photography across pages — 2026-10-19

Extracted `src/components/left/VenuePhoto.tsx` as the single photographic renderer
and failure handler, with shared `PhotoCredits`. Home no longer owns separate image
or attribution implementations, and venue details' duplicate renderer/credits were
removed. Both remote Google photos and direct community photo URLs use the same
real-photo-first / bundled-café-fallback path. Credits appear after successful real
photo loading; fallback imagery stays explicitly illustrative.

Reused on Home's nearby cards, venue details (including guest previews), the private
Venues page, Profile's decorative header and the saved-places empty state. Profile
honors Reduce Transparency with a solid header. The map remains a geographic map;
photo selection and account/session behavior are unchanged. The new presentation
makes no additional API requests and adds no dependency or asset copy. Removed
superseded Home/detail photo styles. TypeScript, 328 tests and diff checks pass;
these cross-page changes have automated coverage, not new physical-device proof.

## Focused Home refinement — 2026-10-19

- Kept the existing custom navigation/callback architecture. Verified installed
  `expo-glass-effect` native Swift creates Apple `UIGlassEffect` in a
  `UIVisualEffectView` on supported iOS, and the existing GlassMaterial chooses it
  only when runtime/API probes succeed. This is a native glass material, not a
  migration to Expo Router NativeTabs or UIKit UITabBar. Accessibility/older-platform
  fallbacks remain. Existing measured footer-height, font-scale and safe-area bottom
  padding was retained and visually checked at the end of the scroll.
- Reused the approved `assets/backgrounds/hospitality.jpeg` as a Home-only warm,
  softly blurred fallback through the shared VenuePhoto component. Other pages keep
  their approved café fallback. Real venue `photo` or community `photoUrl` stays
  preferred. The fallback is labelled “Illustrative interior photo”.
- Without a confirmed venue, visibility now says “Private right now” and “Confirm
  your venue to become visible and discover people nearby.” The duplicate title and
  extra confirmation message were removed. Existing disabled/confirmation checks,
  loading, error and safety actions remain.
- Shortened the private People here description while keeping fonts/line heights.
  At normal full-width text this removes one 18pt line from an approximately 82pt
  card (about 22%); narrow/large-text layouts expand naturally without clipping.
- Nearby carousel/empty states, hosting order, provider integration, confirmation,
  privacy and presence behavior remain intact. No dependency, native-code or backend
  contract changes.

### Captured application-state evidence

Images are under `output/reviews/home-refinement/`:

1. `no-confirmed-venue.png`: existing signed-in Home with no location/venue match,
   disabled visibility, compact People here and Around you empty state.
2. `confirmed-venue.png`: actual existing app pipeline, with simulator Custom
   Coordinates set to the public staging Oodi venue location (60.1736833,
   24.9379191). Read-only staging query verified canonical venue ID
   `bc83403c-0a3b-4c43-92ff-a241312afe51`. Runtime confirmed Helsinki Central Library
   Oodi and rendered its Library category, 0m test distance, address, real Google
   photo/attribution and real nearby carousel.
3. `host-action-clearance.png`: scrolled application with the full Host something
   small card above the native-glass footer.

These are Device Hub window captures on iPhone 18 Pro / iOS 27, not fabricated API
responses or mock-confirmed props. GPS was simulated at the public venue; this is
not physical-device location proof. No presence was activated, no backend data was
seeded or rewritten, and simulator Location was restored to None. Normal app source
was not replaced by a preview. TypeScript, 330 tests and diff checks passed.

## Category-aware illustrative photos — 2026-10-19

The shared VenuePhoto renderer now accepts venue category/name context. One pure
resolver chooses café, bar, restaurant, library/study, coworking, park, gym or airport
samples. Explicit supported venue types take priority; clear category words in
otherwise unclassified venue names provide a conservative presentation hint.
Ambiguous/missing venue context uses the warm general interior. This resolver cannot
confirm a location, choose a venue, modify GPS, change presence or bypass eligibility.

Home's hero and carousel, venue details and the private Venues panel pass existing
venue context. Profile and saved-place empty states lack location context and use
the neutral fallback. Labels consistently name the illustrative category. Actual
venue images still take precedence, including while private and after URL refresh.

Seven reviewed Pexels stock samples are bundled at 1200px width (about 1.3 MB total),
with sources/credits in `assets/venue-placeholders/README.md`. Existing café and user
background assets are reused. No network stock-photo requests, new dependency,
backend deployment or simulated-location input is introduced. Removed the unused
illustration-selection function and static artwork requires from the shared asset
registry; original artwork files are retained. Automated checks cover typed selection,
name hints, unknown context, and category-correct fallback after remote image failure.

## Full-screen context refinement — 2026-10-19

VenueBackground now supplies fixed edge-to-edge photography behind main screen content,
including Profile and the private venue screen. BackgroundWaveLayer delegates its
hospitality variant to this same component. ProfileHero has no embedded image/card fill;
private VenueScreen no longer repeats an image panel. Existing native tab navigation and
bottom content clearance are preserved. Cards are translucent over a blurred image with
an ivory readability wash; Reduce Transparency uses a solid ivory background.

selectVenueBackground considers only candidates within 250m with finite nonnegative
distances, and requires enabled location plus coordinates. The current matched candidate
wins; otherwise the nearest candidate supplies a real photo or category-specific fallback.
This decorative selection does not establish confirmation, visibility or presence.

Native simulator build passed. Home, Profile and private Venues were visually checked
on iPhone 18 Pro / iOS 27.0 with Location None; generic fallback is expected. Screenshots:
`output/reviews/contextual-background/profile.png` and `venues-private.png`.
No simulated GPS or visibility activation used. Live nearby-category switching and
physical-device acceptance remain separate from automated selection tests.

## Profile reference layout correction — 2026-10-19

Background-only refinement did not address the supplied Profile layout. ProfileOverview
now replaces the old non-editing JSX, rather than adding another layout alongside it.
The overview has one visibility card with privacy controls, three compass columns,
a proper SVG progress ring, saved places immediately afterwards and recent moments last.
The transparent identity header includes real membership year, avatar edit and settings.
The existing profile editor and save validation are retained. Lower sections scroll
fully clear of the existing measured native footer. Normal-size and scrolled captures
are in output/reviews/profile-reference. Tests verify section order, counts, signalled
state, actions and ring geometry. No physical-device/TestFlight verification claimed.
