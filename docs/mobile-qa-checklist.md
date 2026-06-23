# Mobile QA Checklist

Use this checklist before calling the mobile app production-ready. Test on a real device, not only the simulator.

## 1. Migrations And Backend

- [ ] Apply all pending Supabase migrations to staging.
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
- [ ] Sign in with Google.
- [ ] Complete onboarding.
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
- [ ] End visibility.
- [ ] Confirm success toast appears.

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
- [ ] Confirm browser opens or a clear error appears.
- [ ] Log out.
- [ ] Confirm logout asks first.
- [ ] Sign back in.

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
- [ ] Confirm destructive actions are visually different from normal actions.
- [ ] Confirm tap targets feel large enough on a real device.
- [ ] Confirm text is readable on small screens.
- [ ] Confirm bottom nav does not overlap buttons or toast.
- [ ] Confirm screen reader labels make sense for key buttons.

## 9. Launch Blockers

- [ ] No fake action appears tappable unless it works or shows a clear coming-soon toast.
- [ ] No mock-only Home content appears as real live data.
- [ ] No main flow gets stuck in loading state after failure.
- [ ] No destructive action runs without confirmation.
- [ ] No backend migration is pending in staging.
- [ ] No TypeScript errors.
