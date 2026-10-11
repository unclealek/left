import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { findNearbyVenueRows, upsertVenueFromGooglePlace } from './venue-store';

function catalogClient(rows: any[]) {
  const requests: URL[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    requests.push(url);
    let result = rows.filter(row => row.is_active);
    if (url.searchParams.get('order') === 'id.asc') {
      result = [...result].sort((a, b) => a.id.localeCompare(b.id));
    }
    const cursor = url.searchParams.get('id');
    if (cursor?.startsWith('gt.')) result = result.filter(row => row.id > cursor.slice(3));
    result = result.slice(0, Number(url.searchParams.get('limit') ?? 1000));
    return Response.json(result);
  });
  return {
    client: createClient('https://fixtures.supabase.co', 'test-key', {
      auth: { persistSession: false }, global: { fetch },
    }),
    requests,
  };
}

describe('nearby catalog lookup', () => {
  it('finds nearby venues beyond the first 200 catalog rows', async () => {
    const rows = Array.from({ length: 200 }, (_, index) => ({
      id: String(index).padStart(5, '0'), is_active: true, latitude: 0, longitude: 0,
    }));
    rows.push({ id: '00200', is_active: true, latitude: 60.17, longitude: 24.94 });
    const { client, requests } = catalogClient(rows);
    const result = await findNearbyVenueRows(client, { latitude: 60.17, longitude: 24.94, radiusMetres: 500 });
    expect(result.map((row: any) => row.id)).toEqual(['00200']);
    expect(requests.length).toBe(2);
  });

  it('preserves legacy geofence coordinates, antimeridian distances, and nearest-first order', async () => {
    const { client } = catalogClient([
      { id: '1', is_active: true, latitude: null, longitude: null, geofence_json: { center: { latitude: 0, longitude: -179.999 }, radius_meters: 90 } },
      { id: '2', is_active: true, latitude: 0, longitude: 179.9995 },
      { id: '3', is_active: false, latitude: 0, longitude: 179.999 },
      { id: '4', is_active: true },
      { id: '5', is_active: true, latitude: 0, longitude: 179 },
    ]);
    const result = await findNearbyVenueRows(client, { latitude: 0, longitude: 179.999, radiusMetres: 500 });
    expect(result.map((row: any) => row.id)).toEqual(['2', '1']);
    expect(result[1].radius_meters).toBe(90);
    expect(result[1].distance_metres).toBeLessThan(230);
  });

  it('surfaces database failures instead of returning a false empty catalog', async () => {
    const client = createClient('https://fixtures.supabase.co', 'test-key', {
      auth: { persistSession: false },
      global: { fetch: async () => Response.json({ message: 'query failed' }, { status: 400 }) },
    });
    await expect(findNearbyVenueRows(client, { latitude: 0, longitude: 0, radiusMetres: 100 })).rejects.toMatchObject({ message: 'query failed' });
  });
});

describe('Google venue refresh', () => {
  it.each([false, true])('preserves an existing venue active status of %s', async (isActive) => {
    let stored = { id: 'venue', is_active: isActive, name: 'Old name' };
    const client = createClient('https://fixtures.supabase.co', 'test-key', {
      auth: { persistSession: false },
      global: { fetch: async (_input, init) => {
        const patch = JSON.parse(String(init?.body));
        stored = { ...stored, ...patch };
        return Response.json(stored);
      } },
    });
    await upsertVenueFromGooglePlace(client, {
      id: 'google-place', displayName: { text: 'Refreshed name' }, location: { latitude: 60, longitude: 24 },
    });
    expect(stored.name).toBe('Refreshed name');
    expect(stored.is_active).toBe(isActive);
  });

  it('skips incomplete provider places without a database write', async () => {
    const client = { from: vi.fn() };
    expect(await upsertVenueFromGooglePlace(client, { id: 'missing-location' })).toBeNull();
    expect(client.from).not.toHaveBeenCalled();
  });
});
