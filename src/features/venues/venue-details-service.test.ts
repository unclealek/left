import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ invoke: vi.fn(), owner: 'one' }));
vi.mock('../../lib/supabase', () => ({ supabase: {
  auth: { getSession: async () => ({ data: { session: { user: { id: mocks.owner } } } }) }, functions: { invoke: mocks.invoke },
} }));
const id = '12345678-1234-4234-8234-123456789abc';
beforeEach(() => { vi.resetModules(); vi.useRealTimers(); mocks.owner = 'one'; mocks.invoke.mockReset(); });
it('deduplicates simultaneous hero/detail requests and reuses a successful response in memory', async () => {
  mocks.invoke.mockResolvedValue({ data: { photo: { uri: 'https://photo.example/one', attributions: [] } }, error: null });
  const { fetchVenuePracticalDetails: read } = await import('./venue-details-service');
  const results = await Promise.all([read(id), read(id), read(id)]);
  expect(results[0]).toEqual(results[1]);
  await read(id);
  expect(mocks.invoke).toHaveBeenCalledOnce();
});
it('refreshes short-lived photo URLs and isolates different signed-in users', async () => {
  vi.useFakeTimers();
  mocks.invoke.mockResolvedValue({ data: { placeId: 'place' }, error: null });
  const { fetchVenuePracticalDetails: read } = await import('./venue-details-service');
  await read(id); mocks.owner = 'two'; await read(id);
  expect(mocks.invoke).toHaveBeenCalledTimes(2);
  vi.advanceTimersByTime(5 * 60 * 1000 + 1); await read(id);
  expect(mocks.invoke).toHaveBeenCalledTimes(3);
});
it('backs off failed responses and permits a later retry without caching a fake photo', async () => {
  vi.useFakeTimers();
  mocks.invoke.mockResolvedValue({ data: null, error: { message: 'Rate limited' } });
  const { fetchVenuePracticalDetails: read } = await import('./venue-details-service');
  expect(await read(id)).toBeNull(); expect(await read(id)).toBeNull();
  expect(mocks.invoke).toHaveBeenCalledOnce();
  vi.advanceTimersByTime(30_001); await read(id);
  expect(mocks.invoke).toHaveBeenCalledTimes(2);
});
