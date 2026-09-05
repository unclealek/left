# Google venue photos

Venue details asks the authenticated `venue-details` Edge Function for a photo.
The function resolves the venue's stored Google place ID to fresh photo metadata
and then uses Place Photos (New) with `skipHttpRedirect=true`. The response
contains a Google-hosted image URI and author attributions, never the API key.
Photo names and image URLs are not written to the database by this flow. The
photo response uses `Cache-Control: private, no-store`; transient photo fields
are excluded from persisted mobile location state.

The venue detail hero starts with the existing illustration, displays the Google
photo when it loads, and returns to the illustration on failure. Google Maps
and photographer attribution appear only when the Google image is displayed.
A missing photo or a failed media request does not discard practical details.
Refresh or reopen the screen to retrieve a fresh photo URL.

## Deployment

Set `GOOGLE_PLACES_API_KEY` as a Supabase function secret in the project used by
the app's `.env`. This is a server credential: do not use an `EXPO_PUBLIC_`
prefix or include it in image URLs. Use Places API restrictions and appropriate
quotas in Google Cloud. Deploy the `venue-details` function; the shared helper
is bundled with it. No database migration is needed for this photo flow.

```bash
supabase functions deploy venue-details --project-ref <project-ref>
```

Keep the existing authenticated-user protection enabled. Test with a signed-in
app user. An unauthenticated call must be rejected. Existing saved venues with
Google place IDs can load photos; user-created venues without a Google ID keep
the illustration.

## Validation

- Unit tests cover a photo with attribution, absent photos, denied/expired/
  rate-limited media requests, timeouts, unsafe URLs, and key containment.
- A live lookup of Albina Restaurant & Wine Bar returned a photo and attribution
  using the existing local Google key, with no secret in the returned data.
- Deployed to the app’s staging project on 2026-09-05. An unauthenticated
  request returned HTTP 401. The signed-in simulator loaded KOKORO Sushi
  Vallila photo attribution and Google Maps credit (shown only after image load).
- Production deployment is separate; this verification targets the local app’s
  staging configuration.

References:
- https://developers.google.com/maps/documentation/places/web-service/place-photos
- https://developers.google.com/maps/documentation/places/web-service/policies
