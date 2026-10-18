/** Staging-only HTTP/Auth/Realtime smoke test. No secrets are printed or saved.
 * Default: synthetic cache fixtures, no actor calls. Optional paid mode retains
 * the real venue cache and its actual budget usage; never refunds paid work.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { createPopularTimesSubscriptions } from '../src/features/activity/popular-times-subscription.ts';

const REF = 'xrracivlxgedlzdcrfwx';
const url = `https://${REF}.supabase.co`;
const args = process.argv.slice(2);
const paidPlace = args.find(arg => arg.startsWith('--paid-place-id='))?.split('=')[1];
assert(args.every(arg => arg === '--allow-paid' || arg.startsWith('--paid-place-id=')), 'Unknown argument');
assert(!paidPlace || (args.includes('--allow-paid') && /^[A-Za-z0-9_-]{5,255}$/.test(paidPlace)), 'Paid mode requires --allow-paid and a valid --paid-place-id');
assert.equal(readFileSync(new URL('../supabase/.temp/project-ref', import.meta.url), 'utf8').trim(), REF, 'Refusing any project other than left-staging');
function cli(args) {
  try {
    return JSON.parse(execFileSync('supabase', [...args, '--project-ref', REF, '-o', 'json'], {
      encoding: 'utf8', timeout: 60_000, stdio: ['ignore', 'pipe', 'pipe'],
    }));
  } catch { throw new Error('Supabase CLI request failed; check CLI authentication (output withheld to protect credentials)'); }
}
const keys = cli(['projects', 'api-keys']);
const anonKey = keys.find(key => key.name === 'anon')?.api_key;
const serviceKey = keys.find(key => key.name === 'service_role')?.api_key;
assert(anonKey && serviceKey, 'Staging API keys unavailable');
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(20_000) }) } };
const admin = createClient(url, serviceKey, options);
const client = createClient(url, anonKey, options);
const runId = randomUUID();
const fixturePlace = `live_smoke_${runId.replaceAll('-', '')}`;
const body = placeId => ({ placeId, placeUrl: `https://www.google.com/maps/search/?api=1&query=Google%20Maps&query_place_id=${placeId}` });
let userId;
let token;
let stopWatch;
const channels = [];
const checks = [];
function pass(message) { checks.push(message); console.log(`PASS ${message}`); }
function progress(message) { console.log(`${new Date().toISOString()} ${message}`); }
function ok(result, label) { assert(!result.error, `${label}: ${result.error?.code ?? result.error?.status ?? 'request failed'}`); return result.data; }
async function http(payload, authorization = token) {
  const response = await fetch(`${url}/functions/v1/get-popular-times`, {
    method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json', ...(authorization ? { Authorization: `Bearer ${authorization}` } : {}) },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json();
  return { status: response.status, data };
}
function waiter(label, timeout = 30_000) {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  const timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeout);
  // Observe immediately, including failures before the caller starts awaiting.
  promise.catch(() => {});
  return { promise, resolve: value => { clearTimeout(timer); resolve(value); }, cancel: () => { clearTimeout(timer); resolve(null); } };
}
const waits = [];

try {
  const email = `popular-times-${runId}@example.invalid`;
  const password = `${randomUUID()}Aa!9`;
  const created = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), 'Create disposable Auth user');
  userId = created.user.id;
  const signedIn = ok(await client.auth.signInWithPassword({ email, password }), 'Real Auth password sign-in');
  token = signedIn.session.access_token;
  assert.equal(signedIn.user.is_anonymous, false);
  pass('Real Auth session for disposable non-anonymous user');

  assert.equal((await http(body(fixturePlace), null)).status, 401);
  assert.equal((await http(body(fixturePlace), 'invalid-token')).status, 401);
  pass('Deployed HTTP endpoint rejects missing and invalid JWTs');
  assert.equal((await http({ placeId: fixturePlace, placeUrl: 'https://example.invalid/' })).status, 400);
  assert.equal((await http(body(fixturePlace))).status, 404);
  pass('Real signed-in HTTP requests reach input and unknown-venue validation');

  ok(await admin.from('venue_popular_times').insert({ place_id: fixturePlace, status: 'pending', source: 'self_report',
    pending_until: new Date(Date.now() + 180_000).toISOString(), claim_token: randomUUID() }), 'Seed isolated transport fixture');
  const pending = await http(body(fixturePlace));
  assert.equal(pending.status, 200);
  assert.equal(pending.data.status, 'pending');
  assert(!('claim_token' in pending.data));
  pass('Deployed authenticated HTTP returns pending cache without internal claim token');

  const rawEvent = waiter('Raw Realtime update', 60_000);
  waits.push(rawEvent);
  const subscribed = waiter('Realtime subscription');
  waits.push(subscribed);
  const channel = client.channel(`live-smoke:fixture:${runId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'venue_popular_times', filter: `place_id=eq.${fixturePlace}` }, event => rawEvent.resolve(event.new))
    .subscribe(status => { progress(`Fixture channel: ${status}`); if (status === 'SUBSCRIBED') subscribed.resolve(true); });
  channels.push(channel);
  await subscribed.promise;
  const appPending = waiter('App pending state');
  const appReady = waiter('App ready state');
  waits.push(appPending, appReady);
  const subscriptions = createPopularTimesSubscriptions(client);
  stopWatch = subscriptions.watch(fixturePlace, body(fixturePlace).placeUrl, state => {
    if (state.data?.status === 'pending') appPending.resolve(state);
    if (state.data?.status === 'ready') appReady.resolve(state);
  });
  await appPending.promise;
  progress('App received pending fixture; updating row');
  const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
  ok(await admin.from('venue_popular_times').update({ status: 'ready', has_data: false, claim_token: null,
    pending_until: null, fetched_at: new Date().toISOString(), expires_at: expiresAt }).eq('place_id', fixturePlace).select('status').single(), 'Publish synthetic ready row');
  progress('Ready fixture persisted; waiting for raw event and app state');
  const [event, app] = await Promise.all([rawEvent.promise, appReady.promise]);
  assert.equal(event.place_id, fixturePlace);
  assert.equal(event.status, 'ready');
  assert.equal(app.status, 'ready');
  assert.equal(app.hasData, false);
  pass('Real authenticated Realtime UPDATE and production subscription pending → ready (synthetic provider result)');
  const cached = await Promise.all(Array.from({ length: 8 }, () => http(body(fixturePlace))));
  for (const response of cached) { assert.equal(response.status, 200); assert.equal(response.data.status, 'ready'); }
  assert.equal(ok(await admin.from('rate_limits').select('count').eq('user_id', userId).eq('action', 'popular_times_trigger'), 'Read fixture quota').length, 0);
  pass('Eight concurrent HTTP cache reads succeed without consuming trigger quota');
  stopWatch(); stopWatch = undefined;

  if (paidPlace) {
    assert(cli(['secrets', 'list']).some(secret => secret.name === 'APIFY_TOKEN'), 'APIFY_TOKEN missing in staging');
    const venue = ok(await admin.from('venues').select('id').eq('google_place_id', paidPlace).eq('is_active', true).single(), 'Known active paid-test venue');
    const existing = ok(await admin.from('venue_popular_times').select('place_id,status,retry_at').eq('place_id', paidPlace).maybeSingle(), 'Check paid-test cache');
    assert(!existing || (existing.status === 'failed' && Date.parse(existing.retry_at) <= Date.now()),
      'Choose an uncached venue or a failed venue whose retry delay has expired; test will not delete or expire existing cache');
    // Establish the subscription before invoking the endpoint, including fast actors.
    const completion = waiter('Paid worker Realtime completion', 150_000);
    const connected = waiter('Paid Realtime subscription');
    waits.push(completion, connected);
    const paidChannel = client.channel(`live-smoke:paid:${runId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'venue_popular_times', filter: `place_id=eq.${paidPlace}` }, event => {
        if (event.new.status === 'ready' || event.new.status === 'failed') completion.resolve(event.new);
      }).subscribe(status => { if (status === 'SUBSCRIBED') connected.resolve(true); });
    channels.push(paidChannel);
    await connected.promise;
    const response = await http(body(paidPlace));
    assert.equal(response.status, 200, `Paid trigger HTTP ${response.status}`);
    assert.equal(response.data.status, 'pending', 'Must exercise a new worker, not an existing cache hit');
    const terminal = await completion.promise;
    assert.equal(terminal.status, 'ready', 'Live provider worker failed; inspect Edge Function/Apify logs');
    assert.equal(terminal.source, 'google_scrape');
    assert.equal(terminal.venue_id, venue.id);
    assert.equal(terminal.claim_token, null);
    const reread = await http(body(paidPlace));
    assert.equal(reread.status, 200);
    assert.equal(reread.data.status, 'ready');
    const quota = ok(await admin.from('rate_limits').select('count').eq('user_id', userId).eq('action', 'popular_times_trigger').single(), 'Paid trigger quota');
    assert.equal(quota.count, 1);
    pass(`Live HTTP → worker/provider → cache → Realtime → cached HTTP; has_data=${terminal.has_data}; exactly one user trigger`);
  } else console.log('NOT RUN: Apify worker chain (requires staging APIFY_TOKEN and --allow-paid --paid-place-id=<uncached-known-place>)');
} catch (error) {
  console.error('FAIL', error instanceof Error ? error.message : 'Unknown test failure');
  throw error;
} finally {
  stopWatch?.();
  waits.forEach(wait => wait.cancel());
  const cleanupErrors = [];
  for (const channel of channels) await client.removeChannel(channel);
  const deleted = await admin.from('venue_popular_times').delete().eq('place_id', fixturePlace);
  if (deleted.error) cleanupErrors.push('cache fixture');
  if (token) { const signedOut = await client.auth.signOut(); if (signedOut.error) cleanupErrors.push('Auth sign-out'); }
  if (userId) { const removed = await admin.auth.admin.deleteUser(userId); if (removed.error) cleanupErrors.push('Auth user'); }
  await client.removeAllChannels();
  await admin.removeAllChannels();
  assert.equal(cleanupErrors.length, 0, `Cleanup failed for ${cleanupErrors.join(', ')}; fixture=${fixturePlace}; user=${userId}`);
  console.log(`CLEANUP completed; ${checks.length} checks passed. Real paid cache/budget, if used, retained.`);
}
