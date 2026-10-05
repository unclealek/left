import { expect, it } from 'vitest';
import { popularTimesActivity, type PopularTimesRow } from './popular-times-model';
const row = {place_id:'test',venue_id:null,typical_time_spent:null,status:'ready',source:'google_scrape',has_data:true,popular_times:{monday:[{hour:12,busyness:60}]}, current_busyness:99,fetched_at:'2026-09-28T09:00:00Z',expires_at:'2026-10-12T09:00:00Z'} as PopularTimesRow;
it('uses venue-local typical hours, never the cached live snapshot', () => {
  expect(popularTimesActivity(row,'Europe/Helsinki',new Date('2026-09-28T09:00:00Z')).score).toBe(60);
  expect(popularTimesActivity(row,'Europe/Helsinki',new Date('2026-09-28T09:00:00Z')).liveAvailable).toBe(false);
});
it('handles pending, no data, missing timezone, expired and failed without invented scores', () => {
  expect(popularTimesActivity(null,null).refreshing).toBe(true);
  for (const value of [{...row,has_data:false},{...row,status:'failed'},{...row,expires_at:'2020-01-01'}]) {
    expect(popularTimesActivity(value as PopularTimesRow,'UTC').score).toBeNull();
  }
  expect(popularTimesActivity(row,null).score).toBeNull();
  expect(popularTimesActivity(row,'invalid').score).toBeNull();
});
it('builds a stable Google Maps URL from the cache identity', async () => {
  const {googleMapsPlaceUrl} = await import('./popular-times-model');
  expect(new URL(googleMapsPlaceUrl('ChIJ_test')).searchParams.get('query_place_id')).toBe('ChIJ_test');
});
