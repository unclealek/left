import { describe, expect, it, vi } from "vitest";
import { createPopularTimesProvider, normalizePopularTimes, validatePopularTimesInput } from "./popular-times-provider";
const week = Object.fromEntries(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => [day, [{hour: 12, busyness: 40}]]));
describe('popular times provider', () => {
  it('normalizes all seven days and optional fields', () => {
    expect(normalizePopularTimes([{popularTimesHasData:true, popularTimes:week, currentBusyness:68, typicalTimeSpent:'30 min'}], 'ChIJtest')).toMatchObject({has_data:true, popular_times:week, current_busyness:68, typical_time_spent:'30 min'});
  });
  it('caches honest no-data without fabricated values', () => {
    expect(normalizePopularTimes([{popularTimesHasData:false}], 'ChIJtest')).toMatchObject({has_data:false, popular_times:null, current_busyness:null});
  });
  it.each([[], [{}], [{popularTimesHasData:true}], [{popularTimesHasData:true,popularTimes:{monday:[{hour:24,busyness:50}]}}], [{popularTimesHasData:false,placeId:'different'}]])('rejects bad payloads %j', value => {
    expect(() => normalizePopularTimes(value, 'ChIJtest')).toThrow();
  });
  it('rejects untrusted URLs and mismatched identity', () => {
    for (const placeUrl of ['https://evil.com/maps','https://www.google.com.evil.com/maps','http://www.google.com/maps','https://www.google.com/maps/search/?api=1&query_place_id=other']) {
      expect(() => validatePopularTimesInput({placeId:'ChIJtest',placeUrl})).toThrow();
    }
  });
  it('builds an identity-bound Maps URL', () => {
    expect(validatePopularTimesInput({placeId:'ChIJtest', placeUrl:'https://www.google.com/maps/place/Test'}).placeUrl).toContain('query_place_id=ChIJtest');
  });
  it('uses bearer token and expected actor input', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify([{popularTimesHasData:false}])));
    const provider = createPopularTimesProvider({APIFY_TOKEN:'private'}, fetcher);
    await provider.fetch({placeId:'ChIJtest',placeUrl:'https://www.google.com/maps/place/Test'});
    expect(fetcher.mock.calls[0][0]).not.toContain('private');
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe('Bearer private');
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toHaveProperty('placeUrls');
  });
  it('fails safely for missing credentials, disabled source, and HTTP failures', async () => {
    expect(() => createPopularTimesProvider({})).toThrow();
    expect(() => createPopularTimesProvider({POPULAR_TIMES_PROVIDER:'disabled', APIFY_TOKEN:'private'})).toThrow();
    const provider = createPopularTimesProvider({APIFY_TOKEN:'private'}, vi.fn().mockResolvedValue(new Response('secret', {status:500})));
    await expect(provider.fetch({placeId:'ChIJtest',placeUrl:'https://www.google.com/maps/place/Test'})).rejects.toThrow('Popular times provider failed');
  });
});
