// @ts-nocheck
import { withSupabase } from 'npm:@supabase/server';
import { handleCors, json } from '../_shared/http.ts';
import { PayloadTooLargeError, readBoundedJson } from '../_shared/bounded-json.ts';
import { createPopularTimesProvider, validatePopularTimesInput } from '../_shared/popular-times-provider.ts';
import { completePopularTimesJob } from '../_shared/popular-times-job.ts';

const authenticatedFetch = withSupabase({auth:'user'}, async (req, ctx) => {
    const cors = handleCors(req);
    if (cors) return cors;
    if (req.method !== 'POST') return json({error:'POST required'}, 405);
    try {
      const {data: {user}, error: authError} = await ctx.supabase.auth.getUser(req.headers.get('Authorization')!.slice(7));
      if (authError || !user || user.is_anonymous) return json({error:'A signed-in Supabase session is required'},401);
      let input;
      try { input = validatePopularTimesInput(await readBoundedJson(req, 4096)); }
      catch (error) {
        return error instanceof PayloadTooLargeError
          ? json({error:'Request body too large'}, 413)
          : json({error:'Valid placeId and Google Maps placeUrl are required'}, 400);
      }
      const {data: cached, error: cacheError} = await ctx.supabaseAdmin.from('venue_popular_times').select('*').eq('place_id', input.placeId).maybeSingle();
      if (cacheError) throw cacheError;
      const now = Date.now();
      if (cached && ((cached.status === 'ready' && Date.parse(cached.expires_at) > now) ||
          (cached.status === 'failed' && Date.parse(cached.retry_at) > now) ||
          (cached.status === 'pending' && Date.parse(cached.pending_until) > now))) return json(publicRow(cached));
      // Only known canonical venues may incur a paid lookup.
      const {data: venue, error: venueError} = await ctx.supabaseAdmin.from('venues').select('id').eq('google_place_id', input.placeId).eq('is_active',true).maybeSingle();
      if (venueError) throw venueError;
      if (!venue) return json({error:'Venue not found'},404);
      const provider = createPopularTimesProvider(Deno.env.toObject());
      const {data: claim, error} = await ctx.supabaseAdmin.rpc('claim_popular_times_budgeted', {p_place_id:input.placeId,p_venue_id:venue.id,p_source:provider.source,p_user_id:user.id});
      if (!error && claim?.limited) {
        console.log('popular_times_trigger_limit', {userId:user.id, scope:claim.limit_scope ?? 'global'});
        const response = json({error:claim.limit_scope === 'user' ? 'Limit of 10 new venue lookups per hour reached' : 'Popular times lookup budget reached',retryAfterSeconds:claim.retry_after_seconds ?? 3600},429);
        response.headers.set('Retry-After',String(claim.retry_after_seconds ?? 3600));
        return response;
      }
      if (error || !claim?.row) throw error ?? new Error('Claim failed');
      if (claim.claimed) {
        const job = completePopularTimesJob(ctx.supabaseAdmin,input,claim.row.claim_token,provider);
        EdgeRuntime.waitUntil(job);
      }
      return json(publicRow(claim.row));
    } catch {
      return json({error:'Popular times temporarily unavailable'},503);
    }
  });
export default {
  async fetch(req: Request) {
    const cors = handleCors(req);
    if (cors) return cors;
    if (!/^Bearer \S+$/i.test(req.headers.get('Authorization') ?? '')) return unauthorized();
    const response = await authenticatedFetch(req);
    return response.status === 401 ? unauthorized() : response;
  },
};
function unauthorized() { return json({error:'A signed-in Supabase session is required'},401); }
function publicRow(row) {
  // Keep internal lease/control fields out of HTTP responses.
  return Object.fromEntries([
    'place_id', 'venue_id', 'popular_times', 'current_busyness', 'typical_time_spent',
    'has_data', 'status', 'source', 'fetched_at', 'expires_at', 'pending_until', 'retry_at',
  ].filter(key => row[key] !== undefined).map(key => [key, row[key]]));
}
