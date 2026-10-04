import { afterEach, describe, expect, it, vi } from "vitest";
import { createBestTimeClient } from "./besttime";
import { normalizeActivityEnvelope, pickForecastScore } from "./activity-normalizer";
import { getVenueLocalSlot, nextVenueHour } from "./timezone";

const forecast = {
  status: "OK", api_key_private: "test-private-key", venue_info: { venue_id: "ven_test", venue_timezone: "Europe/Helsinki", venue_lat: 60.17, venue_lon: 24.94 },
  analysis: Array.from({ length: 7 }, (_, day) => ({ day_info: { day_int: day }, day_raw: Array.from({ length: 24 }, (_, hour) => day * 10 + hour) })),
};
const env = { BESTTIME_PRIVATE_API_KEY: "test-private-key" };
const venue = { venueName: "Test Cafe", venueAddress: "Helsinki, Finland", latitude: 60.17, longitude: 24.94 };
const respond = (body: unknown, status = 200) => vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));
afterEach(() => vi.useRealTimers());

describe("BestTime provider", () => {
  it("posts credentials in the body and parses the real weekly API shape", async () => {
    const fetcher = respond(forecast);
    const result = await createBestTimeClient(env, fetcher).initializeVenue(venue);
    expect(result).toMatchObject({ status: "available", besttimeVenueId: "ven_test", timezone: "Europe/Helsinki" });
    expect(fetcher.mock.calls[0][0]).toBe("https://besttime.app/api/v1/forecasts");
    const body = fetcher.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("api_key_private")).toBe(env.BESTTIME_PRIVATE_API_KEY);
    expect(body.get("venue_address")).toBe(venue.venueAddress);
    expect(JSON.stringify(result)).not.toContain(env.BESTTIME_PRIVATE_API_KEY);
  });
  it("reuses a linked venue ID", async () => {
    const fetcher = respond(forecast);
    await createBestTimeClient(env, fetcher).initializeVenue({ ...venue, besttimeVenueId: "ven_test" });
    const body = fetcher.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("venue_id")).toBe("ven_test");
    expect(body.has("venue_address")).toBe(false);
  });
  it("does not invent data for missing credentials or addresses", async () => {
    const fetcher = respond(forecast);
    expect(await createBestTimeClient({}, fetcher).initializeVenue(venue)).toMatchObject({ status: "unconfigured" });
    expect(await createBestTimeClient(env, fetcher).initializeVenue({ venueName: "Unknown" })).toMatchObject({ status: "unavailable" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects a distant geocoder match", async () => {
    expect(await createBestTimeClient(env, respond(forecast)).initializeVenue({ ...venue, latitude: 40 })).toMatchObject({ status: "unavailable" });
  });
  it("distinguishes unsupported venues from authentication and transient failures", async () => {
    expect(await createBestTimeClient(env, respond({ status: "Error", venue_forecasted: false })).initializeVenue(venue)).toMatchObject({ status: "unavailable" });
    for (const status of [401, 429, 500]) {
      const result = await createBestTimeClient(env, respond({ error: env.BESTTIME_PRIVATE_API_KEY }, status)).initializeVenue(venue);
      expect(result).toMatchObject({ status: "failed", retryAfterSeconds: 900 });
      expect(JSON.stringify(result)).not.toContain(env.BESTTIME_PRIVATE_API_KEY);
    }
  });
  it("rejects malformed forecast scores", async () => {
    expect(await createBestTimeClient(env, respond({ ...forecast, analysis: [{ day_info: { day_int: 0 }, day_raw: [null] }] })).initializeVenue(venue)).toMatchObject({ status: "failed" });
  });
  it("treats BestTime's real no-live-data error response as an hourly fallback", async () => {
    const result = await createBestTimeClient(env, respond({ status: "Error", message: "No live data available.",
      analysis: { venue_live_busyness_available: false, venue_forecast_busyness_available: true }, venue_info: { venue_id: "ven_test" } })).refreshLive("ven_test");
    expect(result).toMatchObject({ status: "available", liveAvailable: false, liveScore: null, expiresAt: expect.any(String) });
  });
  it("handles live zero, above-peak busyness, and unavailable live data", async () => {
    for (const [value, available, expected] of [[0, true, 0], [150, true, 100], [0, false, null]] as const) {
      const result = await createBestTimeClient(env, respond({ status: "OK", analysis: { venue_live_busyness_available: available, venue_live_busyness: value } })).refreshLive("ven_test", "Europe/Helsinki");
      expect(result).toMatchObject({ status: "available", liveAvailable: available, liveScore: expected });
    }
  });
});

describe("venue-local activity", () => {
  it("maps Monday-based provider days and the 06:00–05:00 window", () => {
    expect(pickForecastScore(forecast, "Europe/Helsinki", new Date("2026-09-07T03:00:00Z"))).toBe(0); // Monday 06:00
    expect(pickForecastScore(forecast, "Europe/Helsinki", new Date("2026-09-07T02:00:00Z"))).toBe(83); // Sunday window, Monday 05:00
    expect(getVenueLocalSlot("invalid", new Date("2026-09-07T02:00:00Z"))).toMatchObject({ dayOfWeek: 0, hour: 26 });
  });
  it("expires on the next local hour, including fractional offsets and DST", () => {
    expect(nextVenueHour("Asia/Kathmandu", new Date("2026-09-07T10:00:00Z")).toISOString()).toBe("2026-09-07T10:15:00.000Z");
    expect(nextVenueHour("Europe/Helsinki", new Date("2026-10-25T00:59:30Z")).toISOString()).toBe("2026-10-25T01:00:00.000Z");
  });
  it("compares above-peak live activity using its uncapped value", () => {
    const input = { venueId: "test", besttimeStatus: "available", timezone: "UTC",
      cache: { raw_forecast: { forecast: Array.from({ length: 7 }, (_, dayOfWeek) => Array.from({ length: 24 }, (_, i) => ({ dayOfWeek, hour: i + 6, score: 100 }))).flat() },
        live_available: true, live_score: 100, live_expires_at: new Date(Date.now() + 3600000).toISOString(), raw_live: { analysis: { venue_live_busyness: 150 } } },
      leftPresence: { total: 0, visible: 0, openToMeet: 0 } };
    expect(normalizeActivityEnvelope(input).activity).toMatchObject({ score: 100, comparison: "busier_than_usual" });
  });
  it("recalculates the forecast hour and falls back when live expires", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-07T09:00:00Z"));
    const cache = { raw_forecast: forecast, forecast_score: 99, forecast_expires_at: "2026-09-20T00:00:00Z", live_available: true, live_score: 80, live_expires_at: "2026-09-07T09:00:00Z" };
    const input = { venueId: "test", timezone: "Europe/Helsinki", besttimeStatus: "available", cache, leftPresence: { total: 2, visible: 1, openToMeet: 0 } };
    expect(normalizeActivityEnvelope(input)).toMatchObject({ activity: { score: 6, forecastScore: 6, liveAvailable: false, comparison: "unknown" }, leftPresence: input.leftPresence });
    vi.setSystemTime(new Date("2026-09-07T10:00:00Z"));
    expect(normalizeActivityEnvelope(input).activity.forecastScore).toBe(7);
  });
});
