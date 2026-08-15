# Mobile QA Checklist

Use this checklist before calling the mobile app production-ready. Test on a real device, not only the simulator.

## 1. Migrations And Backend

- [x] Apply migrations through `0023` to staging and confirm local/remote history matches. Verified August 10, 2026.
- [x] Run linked schema lint at error level. `No schema errors found` on August 10, 2026.
- [ ] Configure the staging Edge Function secret `GOOGLE_PLACES_API_KEY`.
- [ ] Confirm `venue_preferences` exists.
- [ ] Confirm `get_nearby_feed` returns `avatar_style`.
- [ ] Confirm hiding a venue ends active visibility for that venue.
- [ ] Confirm hidden venues block future visibility until unhidden.
- [ ] Confirm muted venues stay muted after app restart.

## 2. Automated Checks

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint` if available.
- [ ] Run `npm test` if available.
- [ ] Run `npx expo install --check`.
- [ ] Run a production export smoke check:

```bash
NODE_ENV=production npx expo export --platform all --output-dir dist-mobile-check
rm -rf dist-mobile-check
```

## 3. Real Device Core Flow

- [ ] Start the app from a fresh install.
- [ ] Confirm the welcome screen shows `People. Places. Presence.` and the exact-location privacy reassurance.
- [ ] Confirm `Continue with Google` shows a busy state and cannot be double-tapped while OAuth opens.
- [ ] Confirm `Continue with email` is visibly labeled `Coming soon` and opens an explanation without starting authentication.
- [ ] Confirm welcome content clears the status bar and home indicator on supported phone sizes.
- [ ] Sign in with Google.
- [ ] Complete onboarding.
- [ ] Confirm name Continue is disabled when the trimmed name is empty.
- [ ] Confirm each social shape has a distinct selected state and presentation label.
- [ ] Confirm `Surprise me` changes to another valid social shape.
- [ ] Confirm the nearby-profile preview matches the selected shape and first name.
- [ ] Confirm onboarding loading state prevents repeated permission requests.
- [ ] Confirm denied location access keeps the user on Venue detection with recovery copy.
- [ ] Confirm the completion reveal appears only after permission and profile persistence succeed.
- [ ] Confirm `See what’s nearby` routes to Home.
- [ ] Land on Home.
- [ ] Tap `Start visibility`.
- [ ] Confirm venue.
- [ ] Tap `Go visible`.
- [ ] Confirm loading state prevents double taps.
- [ ] Confirm success toast appears.
- [ ] Open Nearby feed.
- [ ] Open a nearby profile.
- [ ] Start an approach.
- [ ] Cancel or complete the approach.
- [ ] Confirm Back from an active approach persists `cancelled` and clears local recovery state.
- [ ] Let an approach timer expire and confirm the backend row becomes `expired`.
- [ ] End visibility.
- [ ] Confirm success toast appears.
- [ ] Start a short test visibility session and confirm it automatically ends at its expiry time.
- [ ] Background and reopen the app after expiry; confirm the expired session is not restored.

## 4. Profile And Settings

- [ ] Open Profile tab.
- [ ] Tap `Edit`.
- [ ] Change first name.
- [ ] Change avatar style.
- [ ] Save profile.
- [ ] Confirm loading state and success toast.
- [ ] Confirm back arrow returns to normal profile view.
- [ ] Open Settings.
- [ ] Tap `Notifications`.
- [ ] Confirm phone settings opens or a clear error appears.
- [ ] Tap `About Left`.
- [ ] Confirm the About Left information alert appears.
- [ ] Confirm Logout is neutral and visually separate from Identity removal.
- [ ] Log out.
- [ ] Confirm logout asks first.
- [ ] Sign back in.
- [ ] Open Settings and inspect the Identity removal danger card.
- [ ] Confirm retained-record behavior is explained before submission.
- [ ] Confirm identity-removal submission shows a spinner and prevents double taps.
- [ ] Confirm failure copy says nothing was removed and provides a retry.
- [ ] Confirm a submitted request becomes a non-interactive recorded status.

## 5. Privacy And Safety

- [ ] Open Privacy and Safety from Settings.
- [ ] Pause visibility.
- [ ] Confirm loading state and success toast.
- [ ] Start visibility again.
- [ ] Hide current venue.
- [ ] Confirm hide asks first.
- [ ] Confirm hidden venue appears in `Hidden and muted venues`.
- [ ] Unhide venue.
- [ ] Confirm loading state and success toast.
- [ ] Turn alerts off for current venue.
- [ ] Confirm muted venue appears in `Hidden and muted venues`.
- [ ] Turn alerts back on.
- [ ] Confirm loading state and success toast.

## 6. People Safety

- [ ] Open a nearby profile.
- [ ] Hide person.
- [ ] Confirm hide asks first.
- [ ] Confirm loading state and success toast.
- [ ] Confirm person leaves feed.
- [ ] Open another nearby profile.
- [ ] Block person.
- [ ] Confirm block asks first.
- [ ] Confirm loading state and success toast.
- [ ] Confirm person leaves feed.
- [ ] Submit a report.
- [ ] Confirm report submit button disables while sending.
- [ ] Confirm success toast appears.

## 7. Empty And Error States

- [ ] Test Nearby feed when nobody is visible.
- [ ] Test Radar when visible but no people are nearby.
- [ ] Test Hidden and muted venues when empty.
- [ ] Deny location permission and confirm clear recovery copy.
- [ ] Turn off internet and retry profile save.
- [ ] Turn off internet and retry venue hide/unhide.
- [ ] Try starting visibility at a hidden venue.
- [ ] Confirm errors are understandable and not stuck in loading state.

## 8. Visual And Accessibility Pass

- [ ] Confirm button colors are consistent across Home, Radar, Profile, Safety, and Settings.
- [ ] Confirm button corners and padding are consistent across pages.
- [ ] Confirm task screens use the shared 28px hero heading, utility screens use the shared 20px centered heading, and every navigable header uses the same 44px glass back control.
- [ ] Confirm destructive actions are visually different from normal actions.
- [ ] Confirm Ghost buttons provide visible pressed feedback.
- [ ] Confirm buttons expose clear disabled, loading, selected, and icon states.
- [ ] Confirm Go Visible cannot be triggered by a tap, a partial slide springs back, and a completed slide starts visibility exactly once.
- [ ] Confirm VoiceOver can activate Go Visible through its accessibility action without performing a drag gesture.
- [ ] Confirm Presence Live countdown text and circular progress both reflect the selected duration and elapsed session time.
- [ ] Confirm Presence Live shows venue, intent, vibe, optional hint, nearby-feed action, end action, and privacy note without overlapping the floating navigation.
- [ ] Confirm selected venue choices are visually distinct and announced as selected.
- [ ] Confirm tap targets feel large enough on a real device.
- [ ] Confirm text is readable on small screens.
- [ ] Confirm bottom nav does not overlap buttons or toast.
- [ ] Confirm the bottom navigation, Radar overlays, Home image pills, and welcome card show warm blur over changing content without losing contrast.
- [ ] Confirm information-heavy cards, forms, metrics, and Settings remain solid or near-solid rather than transparent.
- [ ] Enable Reduce Transparency and confirm every glass surface switches to a readable warm opaque fallback.
- [ ] Enable Reduce Motion and confirm the welcome logo becomes static.
- [ ] Confirm Android glass controls remain responsive and do not introduce scroll or map-frame drops.
- [ ] Confirm screen reader labels make sense for key buttons.

## 9. Launch Blockers

- [ ] No fake action appears tappable unless it works or shows a clear coming-soon toast.
- [ ] No mock-only Home content appears as real live data.
- [ ] No main flow gets stuck in loading state after failure.
- [ ] No destructive action runs without confirmation.
- [x] No repository backend migration through `0023` is pending in staging. Verified August 10, 2026.
- [ ] No TypeScript errors.
