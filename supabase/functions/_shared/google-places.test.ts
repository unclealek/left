import { afterEach, expect, it, vi } from 'vitest';
import { searchNearbyPlaces } from './google-places';

const input = { apiKey: 'test-key', latitude: 60.17, longitude: 24.94, radiusMetres: 500, maxResultCount: 20 };
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it('aborts a hung provider request so the endpoint can use cached venues', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener('abort', () => reject(options.signal.reason), { once: true });
  })));
  const pending = searchNearbyPlaces(input);
  const rejection = expect(pending).rejects.toBeDefined();
  await vi.advanceTimersByTimeAsync(10_000);
  await rejection;
});

it('returns provider places and clears its timeout after success', async () => {
  vi.useFakeTimers();
  const fetch = vi.fn().mockResolvedValue(Response.json({ places: [{ id: 'place' }] }));
  vi.stubGlobal('fetch', fetch);
  expect(await searchNearbyPlaces(input)).toEqual([{ id: 'place' }]);
  expect(JSON.parse(fetch.mock.calls[0][1].body).maxResultCount).toBe(20);
  expect(vi.getTimerCount()).toBe(0);
});

it('surfaces a failed provider response and clears its timeout', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 })));
  await expect(searchNearbyPlaces(input)).rejects.toThrow('Google Places request failed (503)');
  expect(vi.getTimerCount()).toBe(0);
});
