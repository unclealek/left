import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ctx:{} as any, rate:vi.fn(),auth:vi.fn(),job:vi.fn().mockResolvedValue(undefined)}));
vi.mock('npm:@supabase/server', () => ({withSupabase:(_options:unknown, handler:any) => (req:Request) => handler(req,{...mocks.ctx,supabase:{auth:{getUser:mocks.auth}}})}));
vi.mock('../_shared/rate-limit.ts', () => ({enforceRateLimit:mocks.rate}));
vi.mock('../_shared/popular-times-job.ts', () => ({completePopularTimesJob:mocks.job}));
import endpoint from './index';
function database(cached:any = null) {
  const chain:any = {select:vi.fn(() => chain),eq:vi.fn(() => chain),maybeSingle:vi.fn()};
  chain.maybeSingle.mockResolvedValueOnce({data:cached,error:null}).mockResolvedValue({data:{id:'venue-id'},error:null});
  const rpc=vi.fn().mockResolvedValue({data:{claimed:true,row:{place_id:'ChIJtest',status:'pending',claim_token:'lease'}},error:null});
  return {from:vi.fn(() => chain),rpc,chain};
}
const request = (body:any = {placeId:'ChIJtest',placeUrl:'https://www.google.com/maps/place/Test'}) => new Request('https://local/get-popular-times',{method:'POST',headers:{Authorization:'Bearer session'},body:JSON.stringify(body)});
beforeEach(() => {mocks.rate.mockClear();mocks.auth.mockClear();mocks.auth.mockResolvedValue({data:{user:{id:'user-id',is_anonymous:false}},error:null});mocks.job.mockClear();vi.stubGlobal('Deno',{env:{toObject:() => ({APIFY_TOKEN:'test'})}});vi.stubGlobal('EdgeRuntime',{waitUntil:vi.fn()});});
afterEach(() => vi.unstubAllGlobals());
describe('get-popular-times endpoint', () => {
  it.each([
    {status:'ready',has_data:false,expires_at:'2099-01-01'},
    {status:'pending',pending_until:'2099-01-01'},
    {status:'failed',retry_at:'2099-01-01'},
  ])('returns cached $status without claiming or starting work', async cached => {
    const db=database(cached);mocks.ctx={supabaseAdmin:db};
    const response=await endpoint.fetch(request());expect(response.status).toBe(200);expect(await response.json()).toEqual(cached);
    expect(db.rpc).not.toHaveBeenCalled();expect(mocks.job).not.toHaveBeenCalled();
  });
  it('claims a miss and starts a background job without returning its token', async () => {
    const db=database();mocks.ctx={supabaseAdmin:db};
    const response=await endpoint.fetch(request());expect(await response.json()).toEqual({place_id:'ChIJtest',status:'pending'});
    expect(mocks.job).toHaveBeenCalledTimes(1);expect(db.rpc).toHaveBeenCalledWith('claim_popular_times_budgeted',{p_place_id:'ChIJtest',p_venue_id:'venue-id',p_source:'google_scrape',p_user_id:'user-id'});
  });
  it('does not start a job when another request won the claim', async () => {
    const db=database();db.rpc.mockResolvedValue({data:{claimed:false,row:{status:'pending'}},error:null});mocks.ctx={supabaseAdmin:db};
    await endpoint.fetch(request());expect(mocks.job).not.toHaveBeenCalled();
  });
  it('rejects invalid URLs before database access', async () => {
    const db=database();mocks.ctx={supabaseAdmin:db};
    expect((await endpoint.fetch(request({placeId:'ChIJtest',placeUrl:'https://evil.com/maps'}))).status).toBe(400);expect(db.from).not.toHaveBeenCalled();
  });
  it('rejects unknown venues', async () => {
    const db=database();mocks.ctx={supabaseAdmin:db};
    db.chain.maybeSingle.mockReset().mockResolvedValue({data:null,error:null});expect((await endpoint.fetch(request())).status).toBe(404);expect(db.rpc).not.toHaveBeenCalled();
  });
  it('fails closed on database errors', async () => {
    const db=database();mocks.ctx={supabaseAdmin:db};db.chain.maybeSingle.mockReset().mockResolvedValue({data:null,error:{message:'private'}});
    const response=await endpoint.fetch(request());expect(response.status).toBe(503);expect(await response.text()).not.toContain('private');
  });
});
it('rejects oversized authenticated request bodies',async()=>{
 const db=database();mocks.ctx={supabaseAdmin:db};
 const response=await endpoint.fetch(request({placeId:'ChIJtest',placeUrl:'https://www.google.com/maps',padding:'x'.repeat(5000)}));
 expect(response.status).toBe(413);expect(db.from).not.toHaveBeenCalled();
});
it('returns a bounded unavailable response when the shared budget is exhausted',async()=>{
 const db=database();db.rpc.mockResolvedValue({data:{claimed:false,limited:true,row:{place_id:'ChIJtest',status:'failed',retry_at:'2099-01-01'}},error:null});mocks.ctx={supabaseAdmin:db};
 const response=await endpoint.fetch(request());expect(response.status).toBe(429);expect(mocks.job).not.toHaveBeenCalled();
});

it.each([null,{id:'user-id',is_anonymous:true}])('rejects missing or anonymous users',async user=>{
 const db=database();mocks.ctx={supabaseAdmin:db};mocks.auth.mockResolvedValue({data:{user},error:null});
 expect((await endpoint.fetch(request())).status).toBe(401);expect(db.from).not.toHaveBeenCalled();
});
it('rejects invalid sessions',async()=>{
 mocks.auth.mockResolvedValue({data:{user:null},error:{message:'invalid'}});
 expect((await endpoint.fetch(request())).status).toBe(401);
});
it('does not invoke the request-wide limiter on cached reads',async()=>{
 mocks.ctx={supabaseAdmin:database({status:'ready',expires_at:'2099-01-01'})};
 expect((await endpoint.fetch(request())).status).toBe(200);expect(mocks.rate).not.toHaveBeenCalled();
});
it('returns 429 without work when the user quota is exhausted',async()=>{
 const db=database();mocks.ctx={supabaseAdmin:db};
 db.rpc.mockResolvedValue({data:{claimed:false,limited:true,limit_scope:'user',retry_after_seconds:3600},error:null});
 const log=vi.spyOn(console,'log').mockImplementation(()=>{});
 const response=await endpoint.fetch(request());expect(response.status).toBe(429);
 expect(await response.json()).toMatchObject({retryAfterSeconds:3600});expect(mocks.job).not.toHaveBeenCalled();expect(log).toHaveBeenCalled();log.mockRestore();
});
it('rejects missing bearer token with a clear error',async()=>{
 const response=await endpoint.fetch(new Request('https://local/get-popular-times',{method:'POST'}));
 expect(response.status).toBe(401);expect(await response.json()).toEqual({error:'A signed-in Supabase session is required'});expect(mocks.auth).not.toHaveBeenCalled();
});
it('allows CORS preflight without authentication',async()=>{
 expect((await endpoint.fetch(new Request('https://local/get-popular-times',{method:'OPTIONS'}))).status).toBe(200);
});
