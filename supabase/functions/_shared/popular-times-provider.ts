export class PopularTimesHttpError extends Error {
  constructor(readonly status: number, readonly reason = 'unknown') { super('Popular times provider failed'); this.name = 'PopularTimesHttpError'; }
}
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
  if (Array.isArray(payload) && payload.some(item => item && Object.hasOwn(item, 'popularTimesHistogram'))) {
    const matches = payload.filter(item => item?.placeId === placeId);
    if (matches.length !== 1) throw new Error('Invalid popular times identity');
    const item = matches[0];
    const raw = item.popularTimesHistogram;
    const aliases = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Object.keys(raw).some(day => !aliases.includes(day))) throw new Error('Invalid histogram');
    const week: Histogram = {};
    DAYS.forEach((day, index) => {
      const entries = raw[aliases[index]] === undefined ? [] : raw[aliases[index]];
      if (!Array.isArray(entries)) throw new Error('Invalid histogram day');
      week[day] = entries.map(entry => ({ hour: entry?.hour, busyness: entry?.occupancyPercent }));
    });
    // Reuse the common range/duplicate checks even for a completed empty result.
    const result = normalizePopularTimes([{placeId, popularTimesHasData:true, popularTimes:week,
      currentBusyness:item.popularTimesLivePercent ?? null}], placeId);
    const hasData = Object.values(week).some(hours => hours.length > 0);
    return {...result, has_data:hasData, popular_times:hasData ? result.popular_times : null};
  }
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
  const token = env.APIFY_TOKEN?.trim();
  if ((env.POPULAR_TIMES_PROVIDER ?? 'google_scrape') !== 'google_scrape' || !token || token === 'REPLACE_WITH_APIFY_TOKEN') throw new Error('Popular times provider is not configured');
  const actor = env.APIFY_POPULAR_TIMES_ACTOR ?? 'compass/crawler-google-places';
  if (!['compass/crawler-google-places', 'crawlerbros/google-maps-popular-times'].includes(actor)) throw new Error('Unsupported popular times actor');
  return {
    source: 'google_scrape',
    async fetch(input) {
      const actorInput = actor === 'compass/crawler-google-places'
        ? {searchStringsArray:[`place_id:${input.placeId}`], maxCrawledPlacesPerSearch:1, language:'en',
          scrapePlaceDetailPage:true, maxReviews:0, maxImages:0, scrapeReviewsPersonalData:false,
          scrapeContacts:false, scrapeDirectories:false, includeWebResults:false, maximumLeadsEnrichmentRecords:0}
        : {placeUrls:[input.placeUrl]};
      const response = await fetcher(`https://api.apify.com/v2/acts/${actor.replace('/', '~')}/run-sync-get-dataset-items?timeout=90`, {
        method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(actorInput), signal: AbortSignal.timeout(100_000),
      });
      if (!response.ok) {
        let reason = 'unknown';
        try {
          const body = await readBoundedJson(response, 8192) as {error?: {type?: unknown}};
          const type = body?.error?.type;
          const allowed = ['insufficient-permissions', 'actor-is-not-rented', 'apify-plan-required-to-use-paid-actor',
            'missing-actor-rights', 'actor-disabled', 'public-actor-disabled', 'user-or-token-not-found',
            'not-enough-usage-to-run-paid-actor', 'monthly-usage-limit-too-low', 'user-email-not-verified',
            'user-has-no-subscription', 'store-terms-not-accepted', 'platform-feature-disabled', 'actor-not-public'];
          if (typeof type === 'string' && allowed.includes(type)) reason = type;
        } catch { /* Keep only status if the response is malformed or too large. */ }
        throw new PopularTimesHttpError(response.status, reason);
      }
      return normalizePopularTimes(await readBoundedJson(response, 128 * 1024), input.placeId);
    },
  };
}
