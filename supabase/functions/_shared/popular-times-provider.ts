import { readBoundedJson } from "./bounded-json.ts";

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type Histogram = Record<string, Array<{ hour: number; busyness: number }>>;
export type PopularTimesResult = {
  popular_times: Histogram | null;
  current_busyness: number | null;
  typical_time_spent: string | null;
  has_data: boolean;
};
export interface PopularTimesProvider {
  source: 'google_scrape' | 'self_report' | 'own_telemetry';
  fetch(input: { placeId: string; placeUrl: string }): Promise<PopularTimesResult>;
}

export function validatePopularTimesInput(body: unknown) {
  const input = body as Record<string, unknown> | null;
  if (!input || typeof input.placeId !== 'string' || !/^[A-Za-z0-9_-]{5,255}$/.test(input.placeId) || typeof input.placeUrl !== 'string' || input.placeUrl.length > 2048) {
    throw new Error('Valid placeId and placeUrl are required');
  }
  const url = new URL(input.placeUrl);
  if (url.protocol !== 'https:' || !['www.google.com', 'google.com', 'maps.google.com'].includes(url.hostname) || url.username || url.password || url.port || !(url.hostname === 'maps.google.com' || url.pathname === '/maps' || url.pathname.startsWith('/maps/'))) {
    throw new Error('A Google Maps URL is required');
  }
  const urlId = url.searchParams.get('query_place_id');
  if (urlId && urlId !== input.placeId) throw new Error('Place identity mismatch');
  // Bind the requested scrape to the cache key rather than trusting a caller's arbitrary place path.
  return { placeId: input.placeId, placeUrl: `https://www.google.com/maps/search/?api=1&query=Google%20Maps&query_place_id=${encodeURIComponent(input.placeId)}` };
}

export function normalizePopularTimes(payload: unknown, placeId: string): PopularTimesResult {
  if (!Array.isArray(payload) || payload.length !== 1) throw new Error('Invalid popular times response');
  const item = payload[0];
  if (!item || typeof item.popularTimesHasData !== 'boolean' || (item.placeId && item.placeId !== placeId)) throw new Error('Invalid popular times identity or data');
  let histogram: Histogram | null = null;
  if (item.popularTimesHasData) {
    if (!item.popularTimes || typeof item.popularTimes !== 'object') throw new Error('Missing histogram');
    histogram = {};
    for (const day of DAYS) {
      const hours = item.popularTimes[day];
      if (!Array.isArray(hours) || hours.length > 24) throw new Error('Invalid histogram day');
      const seen = new Set<number>();
      histogram[day] = hours.map((entry: { hour: number; busyness: number }) => {
        if (!entry || !Number.isInteger(entry.hour) || entry.hour < 0 || entry.hour > 23 || seen.has(entry.hour) || !Number.isInteger(entry.busyness) || entry.busyness < 0 || entry.busyness > 100) throw new Error('Invalid histogram hour');
        seen.add(entry.hour);
        return { hour: entry.hour, busyness: entry.busyness };
      });
    }
  }
  if (item.currentBusyness != null && (!Number.isInteger(item.currentBusyness) || item.currentBusyness < 0 || item.currentBusyness > 100)) throw new Error('Invalid busyness');
  if (item.typicalTimeSpent != null && (typeof item.typicalTimeSpent !== 'string' || item.typicalTimeSpent.length > 500)) throw new Error('Invalid duration');
  return { popular_times: histogram, has_data: item.popularTimesHasData, current_busyness: item.currentBusyness ?? null, typical_time_spent: item.typicalTimeSpent ?? null };
}

export function createPopularTimesProvider(env: Record<string, string | undefined>, fetcher: typeof fetch = fetch): PopularTimesProvider {
  // Add future first-party adapters here; consumers and cache remain provider-independent.
  if ((env.POPULAR_TIMES_PROVIDER ?? 'google_scrape') !== 'google_scrape' || !env.APIFY_TOKEN) throw new Error('Popular times provider is not configured');
  return {
    source: 'google_scrape',
    async fetch(input) {
      const response = await fetcher('https://api.apify.com/v2/acts/crawlerbros~google-maps-popular-times/run-sync-get-dataset-items?timeout=90', {
        method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${env.APIFY_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeUrls: [input.placeUrl] }), signal: AbortSignal.timeout(100_000),
      });
      if (!response.ok) throw new Error('Popular times provider failed');
      return normalizePopularTimes(await readBoundedJson(response, 128 * 1024), input.placeId);
    },
  };
}
