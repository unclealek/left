import { beforeEach, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ctx:{supabase:{},supabaseAdmin:{}} as any, rate:vi.fn(),venues:vi.fn(),counts:vi.fn()}));
vi.mock('npm:@supabase/server', () => ({withSupabase:(_options:unknown,handler:any) => (req:Request) => handler(req,mock.ctx)}));
vi.mock('../_shared/rate-limit.ts', () => ({enforceRateLimit:mock.rate}));
vi.mock('../_shared/venue-store.ts', () => ({loadVenueRowsByIds:mock.venues}));
vi.mock('../_shared/presence.ts', () => ({getLeftPresenceCounts:mock.counts}));
import endpoint from './index';
const id='11111111-1111-4111-8111-111111111111';
const request=(venueIds:unknown=[id])=>new Request('https://local/venue-activity',{method:'POST',body:JSON.stringify({venueIds})});
beforeEach(()=>{vi.clearAllMocks();mock.rate.mockResolvedValue(null);mock.venues.mockResolvedValue([{id,name:'Venue',google_place_id:'ChIJtest'}]);mock.counts.mockResolvedValue(new Map([[id,{total:2,visible:2,openToMeet:1}]]));});
it('returns presence independently of external activity providers',async()=>{
 const result=await endpoint.fetch(request());expect(result.status).toBe(200);
 expect(await result.json()).toMatchObject({venues:[{venueId:id,activity:{source:'left',score:null,forecastScore:null,refreshing:false},leftPresence:{total:2,visible:2,openToMeet:1}}]});
});
it('deduplicates venue IDs before loading counts',async()=>{await endpoint.fetch(request([id,id]));expect(mock.counts).toHaveBeenCalledWith(mock.ctx.supabaseAdmin,[id]);});
it('fails closed with a generic response on database errors',async()=>{mock.venues.mockRejectedValue(new Error('private DB error'));const result=await endpoint.fetch(request());expect(result.status).toBe(503);expect(await result.text()).not.toContain('private');});
