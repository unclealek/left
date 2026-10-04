import { afterEach, describe, expect, it, vi } from "vitest";
import { activityRefreshDue, ensureBestTimeForecastForVenue } from "./ensure-besttime-forecast";

// Small in-memory DB double exercises ownership and persistence across concurrent requests.
function database(venue: any, initial: any = null) {
  let cache = initial;
  const db = {
    rpc: vi.fn(async () => {
      if (cache.refresh_status === "refreshing") return { data: false };
      cache = { ...cache, refresh_status: "refreshing", refresh_started_at: new Date().toISOString() };
      return { data: true };
    }),
    from(table: string) {
      let patch: any;
      let upsert = false;
      const filters: [string, unknown][] = [];
      const query: any = {
        upsert(value: any) { patch = value; upsert = true; return query; },
        update(value: any) { patch = value; return query; },
        select() { return query; },
        eq(key: string, value: unknown) { filters.push([key, value]); return query; },
        single() { return query; }, maybeSingle() { return query; },
        then(resolve: any) {
          if (table === "venues") { if (patch) venue = { ...venue, ...patch }; return Promise.resolve({ data: { ...venue } }).then(resolve); }
          if (upsert && !cache) cache = { ...patch, consecutive_failures: 0, refresh_status: "idle" };
          else if (patch && !upsert && filters.every(([key, value]) => cache?.[key] === value)) cache = { ...cache, ...patch };
          return Promise.resolve({ data: cache ? { ...cache } : null }).then(resolve);
        },
      };
      return query;
    },
    getCache: () => cache,
  };
  return db;
}
const venue = { id: "test", name: "Cafe", formatted_address: "Helsinki", besttime_status: "not_initialized", timezone: "Europe/Helsinki" };
const weekly = { status: "OK", venue_info: { venue_id: "ven_test", venue_timezone: "Europe/Helsinki" }, analysis: [{ day_info: { day_int: 0 }, day_raw: Array(24).fill(50) }] };
const env = { BESTTIME_PRIVATE_API_KEY: "test" };
afterEach(() => vi.unstubAllGlobals());

describe("activity refresh cache", () => {
  it("permits one provider owner across 100 simultaneous cold requests", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(weekly)));
    vi.stubGlobal("fetch", fetcher);
    const db = database(venue);
    await Promise.all(Array.from({ length: 100 }, () => ensureBestTimeForecastForVenue(db, venue, null, env)));
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(db.getCache()).toMatchObject({ refresh_status: "idle", raw_forecast: expect.objectContaining({ analysis: weekly.analysis }) });
  });
  it("uses the cache after rechecking a stale request snapshot", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const db = database({ ...venue, besttime_status: "available" }, { venue_id: venue.id, forecast_expires_at: new Date(Date.now() + 86400000).toISOString(), refresh_status: "idle" });
    await ensureBestTimeForecastForVenue(db, venue, null, env);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("retains stale data and applies backoff after provider failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 429 })));
    const cache = { venue_id: venue.id, raw_forecast: weekly, forecast_expires_at: "2020-01-01", refresh_status: "idle", consecutive_failures: 0 };
    const db = database(venue, cache);
    const result = await ensureBestTimeForecastForVenue(db, venue, cache, env);
    expect(result.providerStatus).toBe("failed");
    expect(db.getCache()).toMatchObject({ raw_forecast: weekly, forecast_expires_at: "2020-01-01", refresh_status: "failed", consecutive_failures: 1 });
    expect(activityRefreshDue(venue, db.getCache()).any).toBe(false);
  });
  it("retries unsupported venues after the negative cache expires", () => {
    expect(activityRefreshDue({ ...venue, besttime_status: "unavailable" }, { forecast_expires_at: "2020-01-01" }).forecast).toBe(true);
    expect(activityRefreshDue(venue, { forecast_expires_at: new Date(Date.now() + 86400000).toISOString() }).forecast).toBe(false);
  });
  it("refreshes live data once and returns forecast fallback when live is unavailable", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ status: "OK", analysis: { venue_live_busyness_available: false } })));
    vi.stubGlobal("fetch", fetcher);
    const linked = { ...venue, besttime_status: "available", besttime_venue_id: "ven_test" };
    const cache = { venue_id: venue.id, raw_forecast: weekly, forecast_expires_at: new Date(Date.now() + 86400000).toISOString(), refresh_status: "idle" };
    const db = database(linked, cache);
    const result = await ensureBestTimeForecastForVenue(db, linked, cache, env, true);
    await ensureBestTimeForecastForVenue(db, linked, result.cache, env, true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(db.getCache()).toMatchObject({ raw_forecast: weekly, live_available: false, live_score: null, refresh_status: "idle" });
  });
});
