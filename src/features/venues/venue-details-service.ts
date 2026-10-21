import { isUuid } from "../../lib/validation";
import { supabase } from "../../lib/supabase";
import type { RuntimeVenueCandidate } from "../location/location-storage";

type VenueDetailsResponse = Pick<
  RuntimeVenueCandidate,
  | "placeId"
  | "timezone"
  | "photo"
  | "photoUrl"
  | "formattedAddress"
  | "websiteUri"
  | "phoneNumber"
  | "rating"
  | "userRatingCount"
  | "priceLevel"
  | "businessStatus"
  | "openingHours"
  | "accessibilityOptions"
> & { venueId?: string };


// Photo URLs expire. Reuse only briefly in memory, scoped to the signed-in user.
// This is independent of the indefinitely saved popular-times database cache.
const responses = new Map<string, { value: VenueDetailsResponse | null; expiresAt: number }>();
const pending = new Map<string, Promise<VenueDetailsResponse | null>>();

export async function fetchVenuePracticalDetails(venueId: string): Promise<VenueDetailsResponse | null> {
  if (!isUuid(venueId)) return null;
  const { data: auth, error: authError } = await supabase.auth.getSession();
  if (authError) return null;
  const key = `${auth.session?.user.id ?? "anonymous"}:${venueId}`;
  const cached = responses.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;
  const request = (async () => {
    let result: VenueDetailsResponse | null = null;
    try {
      const { data, error } = await supabase.functions.invoke<VenueDetailsResponse>("venue-details", {
        body: { venueId },
      });
      if (error) console.warn("[venues] venue details unavailable", error.message);
      else result = data ?? null;
    } catch { console.warn("[venues] venue details request failed"); }
    if (responses.size >= 64) responses.delete(responses.keys().next().value!);
    responses.set(key, { value: result, expiresAt: Date.now() + (result ? 5 * 60_000 : 30_000) });
    return result;
  })();
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}
