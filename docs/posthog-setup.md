# PostHog setup

The mobile app initializes one `posthog-react-native` client from
`EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` and `EXPO_PUBLIC_POSTHOG_HOST`.
Both variables are required. Local `.env` and `.env.production` are ignored by
Git; never paste their values into release notes or logs.

## Captured data

- App lifecycle events, existing product events, JavaScript uncaught exceptions
  and unhandled rejections, and three selected operational log messages.
- Member screen transitions use the names from `Screen`; the linked gathering
  guest view uses `shared-gathering`. Screen events include only the screen name
  and `access_mode`, without profile, venue, or incoming-link content.
- Existing session handling identifies signed-in users and resets identity on
  sign-out or account switches. Identification currently includes email, first
  name, and auth provider.
- Explicit AsyncStorage persistence retains queued events across app restarts.
- Provider autocapture is disabled because navigation is driven by app state.
  Screen events are emitted explicitly by `usePostHogScreen`.

Session replay, native crash capture, and source-map uploads are not configured.
They are separate additions; this setup provides product analytics and JavaScript
error events, without claiming symbolicated native crash reporting.

## Build environments and verification (2026-10-19)

- Local development and production variable presence verified.
- With explicit user approval, configured both PostHog variables in EAS
  development, preview, and production; readback verified their presence in all
  three environments. The token has sensitive visibility. The TestFlight build
  profile uses development.
- Sent one labelled `posthog_setup_verified` event to the configured EU endpoint.
  PostHog returned HTTP 200 and `{"status":"Ok"}`. Verification ID:
  `71b240da-6028-4992-b46b-c8f9959b2980`. This confirms ingestion acceptance,
  not dashboard visibility or delivery from a running app.
- Verify a real app session: open Home, open a venue, sign in, sign out; confirm
  `$screen` events and identity boundaries in PostHog. The currently installed
  TestFlight app is unchanged by this configuration update. Cloud variables apply
  when a subsequent build or update bundles the app.

The PostHog SDK supports AsyncStorage as a persistence option:
[React Native SDK documentation](https://github.com/PostHog/posthog.com/blob/master/contents/docs/libraries/react-native/index.mdx).
