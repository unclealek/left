type GooglePhoto = {
  name?: string;
  authorAttributions?: Array<{ displayName?: string; uri?: string }>;
};

export type VenuePhoto = {
  uri: string;
  attributions: Array<{ displayName: string; uri: string | null }>;
};

function httpsUrl(value: unknown, googleImagesOnly = false): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.startsWith("//") ? `https:${value}` : value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (googleImagesOnly && url.hostname !== "googleusercontent.com" && !url.hostname.endsWith(".googleusercontent.com")) return null;
    if (url.searchParams.has("key")) return null;
    return url.toString();
  } catch { return null; }
}

// Fetch current photo metadata instead of reusing persisted Google photo names,
// which can expire. API credentials are sent only in server request headers.
export async function fetchGooglePlaceWithPhoto(
  input: { apiKey: string; placeId: string; fields: string },
  fetcher: typeof fetch = fetch,
): Promise<{ place: Record<string, any>; photo: VenuePhoto | null }> {
  const fields = [...new Set([...input.fields.split(","), "photos"])].join(",");
  const response = await fetcher(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(input.placeId)}`,
    { headers: { "X-Goog-Api-Key": input.apiKey, "X-Goog-FieldMask": fields }, signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) throw new Error(`Google Place Details failed (${response.status})`);
  const place = await response.json();
  const candidate: GooglePhoto | undefined = place.photos?.[0];
  if (!candidate?.name || !/^places\/[^/]+\/photos\/[^/]+$/.test(candidate.name)) return { place, photo: null };
  const photoPath = candidate.name.split("/").map(encodeURIComponent).join("/");
  const mediaUrl = new URL(`https://places.googleapis.com/v1/${photoPath}/media`);
  mediaUrl.search = new URLSearchParams({ maxWidthPx: "1200", maxHeightPx: "900", skipHttpRedirect: "true" }).toString();
  try {
    const media = await fetcher(mediaUrl, {
      headers: { "X-Goog-Api-Key": input.apiKey }, signal: AbortSignal.timeout(8000),
    });
    if (!media.ok) return { place, photo: null };
    const uri = httpsUrl((await media.json()).photoUri, true);
    if (!uri || uri.includes(input.apiKey)) return { place, photo: null };
    return {
      place,
      photo: {
        uri,
        attributions: (candidate.authorAttributions ?? [])
          .filter(author => typeof author.displayName === "string" && author.displayName.trim())
          .map(author => ({ displayName: author.displayName!.trim(), uri: httpsUrl(author.uri) })),
      },
    };
  } catch {
    // A photo failure must not discard the venue's practical details.
    return { place, photo: null };
  }
}
