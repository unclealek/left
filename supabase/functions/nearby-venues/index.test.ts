import {beforeEach,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({find:vi.fn(),search:vi.fn(),upsert:vi.fn(),rate:vi.fn()}));
vi.mock('npm:@supabase/server',()=>({withSupabase:(_:unknown,handler:any)=>(req:Request)=>handler(req,{supabase:{},supabaseAdmin:{}})}));
vi.mock('../_shared/venue-store.ts',()=>({findNearbyVenueRows:m.find,upsertVenueFromGooglePlace:m.upsert}));
vi.mock('../_shared/google-places.ts',()=>({searchNearbyPlaces:m.search}));
vi.mock('../_shared/rate-limit.ts',()=>({enforceRateLimit:m.rate}));
import endpoint from './index';
const request=()=>new Request('https://local/nearby',{method:'POST',body:JSON.stringify({latitude:60.17,longitude:24.94,radiusMetres:500})});
beforeEach(()=>{vi.clearAllMocks();vi.stubGlobal('Deno',{env:{get:()=> 'test'}});m.rate.mockResolvedValue(null);m.search.mockResolvedValue([]);m.find.mockResolvedValue([]);});
it('refreshes Google results even when some venues are already cached',async()=>{
 m.find.mockResolvedValue([{id:'v',name:'Cached venue'}]);m.search.mockResolvedValue([{id:'place'}]);
 expect((await endpoint.fetch(request())).status).toBe(200);
 expect(m.search).toHaveBeenCalledWith(expect.objectContaining({maxResultCount:20}));expect(m.upsert).toHaveBeenCalled();
});
it('reports discovery failure instead of a false empty result',async()=>{
 m.search.mockRejectedValue(new Error('provider failed'));
 expect((await endpoint.fetch(request())).status).toBe(503);
});
it('preserves usable cached venues during a provider outage',async()=>{
 m.find.mockResolvedValue([{id:'v',name:'Cached venue'}]);m.search.mockRejectedValue(new Error('provider failed'));
 expect((await endpoint.fetch(request())).status).toBe(200);
});
