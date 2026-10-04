import { pickForecastScore } from "./activity-normalizer.ts";
import { nextVenueHour } from "./timezone.ts";

type VenueInput = {
  besttimeVenueId?: string | null;
  venueName: string;
  venueAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
};
type Failure = { status: "failed" | "unconfigured"; reason: string; retryAfterSeconds: number };
type Unavailable = { status: "unavailable"; reason: string; expiresAt: string };
export type ForecastResult = Failure | Unavailable | {
  status: "available"; besttimeVenueId: string; timezone: string;
  rawForecast: Record<string, unknown>; forecastScore: number | null;
  fetchedAt: string; expiresAt: string;
};
export type LiveResult = Failure | {
  status: "available"; rawLive: Record<string, unknown>; liveScore: number | null;
  liveAvailable: boolean; fetchedAt: string; expiresAt: string;
};

const DAY = 86_400_000;
const failure = (reason: string, retryAfterSeconds = 900): Failure => ({ status: "failed", reason, retryAfterSeconds });
const unavailable = (reason: string): Unavailable => ({ status: "unavailable", reason, expiresAt: new Date(Date.now() + 7 * DAY).toISOString() });
const numeric = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

// Never log a provider URL, payload, or exception: these can contain the private key.
export function createBestTimeClient(env: Record<string, string | undefined>, fetcher: typeof fetch = fetch) {
  const key = env.BESTTIME_PRIVATE_API_KEY;
  async function request(path: string, params: Record<string, string>) {
    if (!key || (env.BESTTIME_PROVIDER_MODE && env.BESTTIME_PROVIDER_MODE !== "live")) {
      return { error: { status: "unconfigured", reason: "BestTime credentials are missing or provider is disabled.", retryAfterSeconds: 900 } as Failure };
    }
    try {
      const response = await fetcher(`https://besttime.app/api/v1/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ api_key_private: key, ...params }),
        signal: AbortSignal.timeout(20_000),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) return { error: failure(`BestTime request failed (HTTP ${response.status}).`) };
      if (!body || typeof body !== "object") return { error: failure("BestTime returned an invalid response.") };
      return { body };
    } catch {
      return { error: failure("BestTime request timed out or could not connect.") };
    }
  }
  return {
    async initializeVenue(input: VenueInput): Promise<ForecastResult> {
      if (!input.besttimeVenueId && !input.venueAddress?.trim()) return unavailable("Venue needs a full address before BestTime can match it.");
      const result = await request("forecasts", input.besttimeVenueId
        ? { venue_id: input.besttimeVenueId }
        : { venue_name: input.venueName, venue_address: input.venueAddress! });
      if (result.error) return result.error;
      const body = result.body;
      if (body.venue_forecasted === false) return unavailable("BestTime has no forecast for this venue.");
      if (body.status !== "OK") return failure("BestTime could not generate a forecast.");
      if (!Array.isArray(body.analysis) || !body.analysis.length) return unavailable("BestTime has no forecast for this venue.");
      const info = body.venue_info;
      if (typeof info?.venue_id !== "string" || !body.analysis.every((day: any) =>
        Number.isInteger(day?.day_info?.day_int) && day.day_info.day_int >= 0 && day.day_info.day_int <= 6 &&
        Array.isArray(day.day_raw) && day.day_raw.length === 24 && day.day_raw.every((v: unknown) => numeric(v) && v >= 0 && v <= 100))) {
        return failure("BestTime returned an invalid weekly forecast.");
      }
      // Reject a geocoder match far from the canonical venue.
      const lon = info.venue_lon ?? info.venue_lng;
      if (numeric(input.latitude) && numeric(input.longitude) && numeric(info.venue_lat) && numeric(lon)) {
        const radians = Math.PI / 180;
        const a = Math.sin((info.venue_lat - input.latitude) * radians / 2) ** 2 +
          Math.cos(input.latitude * radians) * Math.cos(info.venue_lat * radians) * Math.sin((lon - input.longitude) * radians / 2) ** 2;
        if (2 * 6_371_000 * Math.asin(Math.sqrt(Math.min(1, a))) > 500) return unavailable("BestTime matched a different location.");
      }
      const timezone = info.venue_timezone ?? input.timezone;
      try { new Intl.DateTimeFormat("en", { timeZone: timezone }).format(); } catch { return failure("BestTime returned an invalid timezone."); }
      if (!timezone) return failure("BestTime did not return a venue timezone.");
      const fetchedAt = new Date().toISOString();
      // Store only fields needed for rendering; never persist provider auth/error fields.
      const rawForecast = { analysis: body.analysis, venue_info: { venue_id: info.venue_id, venue_timezone: timezone }, epoch_analysis: body.epoch_analysis };
      return { status: "available", besttimeVenueId: info.venue_id, timezone, rawForecast,
        forecastScore: pickForecastScore(rawForecast, timezone), fetchedAt, expiresAt: new Date(Date.now() + 21 * DAY).toISOString() };
    },
    async refreshLive(venueId: string, timezone?: string | null): Promise<LiveResult> {
      const result = await request("forecasts/live", { venue_id: venueId });
      if (result.error) return result.error;
      const body = result.body;
      // BestTime returns status Error for the normal no-live-data case as well.
      const noLiveData = body.status === "Error" && body.analysis?.venue_live_busyness_available === false &&
        typeof body.analysis?.venue_forecast_busyness_available === "boolean" && body.venue_info?.venue_id === venueId;
      if ((!noLiveData && body.status !== "OK") || typeof body.analysis?.venue_live_busyness_available !== "boolean") return failure("BestTime could not retrieve live activity.");
      const available = body.analysis.venue_live_busyness_available;
      const value = body.analysis.venue_live_busyness;
      if (available && (!numeric(value) || value < 0)) return failure("BestTime returned an invalid live score.");
      return { status: "available", rawLive: { analysis: body.analysis, venue_info: { venue_open: body.venue_info?.venue_open } },
        liveScore: available ? Math.min(100, Math.round(value)) : null, liveAvailable: available,
        fetchedAt: new Date().toISOString(), expiresAt: nextVenueHour(timezone).toISOString() };
    },
  };
}
