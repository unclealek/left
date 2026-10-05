import type { VenueActivity } from './activity-types';
export type PopularTimesRow = {
  place_id: string;
  venue_id: string | null;
  popular_times: Record<string, Array<{hour: number; busyness: number}>> | null;
  current_busyness: number | null;
  typical_time_spent: string | null;
  has_data: boolean;
  status: 'pending' | 'ready' | 'failed';
  source: 'google_scrape' | 'self_report' | 'own_telemetry';
  fetched_at: string | null;
  expires_at: string | null;
  pending_until?: string | null;
  retry_at?: string | null;
};
export function googleMapsPlaceUrl(placeId: string) {
  return `https://www.google.com/maps/search/?api=1&query=Google%20Maps&query_place_id=${encodeURIComponent(placeId)}`;
}
export function popularTimesActivity(row: PopularTimesRow | null, timezone?: string | null, now = new Date()): VenueActivity {
  const pending = !row || row.status === 'pending';
  const fresh = row?.status === 'ready' && !!row.expires_at && Date.parse(row.expires_at) > now.getTime();
  let score: number | null = null;
  if (fresh && row.has_data && timezone) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {timeZone:timezone, weekday:'long',hour:'numeric',hourCycle:'h23'}).formatToParts(now);
      const day = parts.find(part => part.type === 'weekday')?.value.toLowerCase() ?? '';
      const hour = Number(parts.find(part => part.type === 'hour')?.value);
      score = row.popular_times?.[day]?.find(value => value.hour === hour)?.busyness ?? null;
    } catch { /* No trustworthy local hour; retain the weekly data without guessing. */ }
  }
  const label = score == null ? 'unknown' : score >= 85 ? 'packed' : score >= 65 ? 'busy' : score >= 40 ? 'active' : score >= 20 ? 'light' : 'quiet';
  return {
    label, score, forecastScore:score, liveAvailable:false, comparison:'unknown', comparisonText:'',
    displayText:pending ? 'Loading popular times…' : score != null ? `Typically ${label}` : fresh && row?.has_data ? 'Popular times available' : 'Popular times unavailable',
    updatedAt:row?.fetched_at ?? null, isStale:!fresh, refreshing:pending, source:row?.source ?? 'google_scrape',
  };
}
