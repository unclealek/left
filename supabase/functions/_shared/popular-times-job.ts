import type { PopularTimesProvider } from './popular-times-provider.ts';

export async function completePopularTimesJob(
  db: any, input: {placeId: string; placeUrl: string}, token: string, provider: PopularTimesProvider,
) {
  const save = (patch: Record<string, unknown>) => db.from('venue_popular_times').update(patch)
    .eq('place_id', input.placeId).eq('claim_token', token).eq('status', 'pending');
  try {
    const result = await provider.fetch(input);
    const now = Date.now();
    const {error} = await save({...result, source:provider.source, status:'ready', fetched_at:new Date(now).toISOString(),
      expires_at:new Date(now+14*86400000).toISOString(), claim_token:null, pending_until:null, retry_at:null});
    if (error) throw new Error('Cache update failed');
  } catch {
    try {
      const {error} = await save({status:'failed', retry_at:new Date(Date.now()+86400000).toISOString(), claim_token:null, pending_until:null});
      if (error) throw new Error('Failure update failed');
    } catch {
      // Never let an SDK/transport error become an unhandled background rejection.
      console.warn('[popular-times] Could not persist failure; lease recovery will apply');
    }
  }
}
