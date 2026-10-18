import {expect,it,vi} from 'vitest';
import {sharedGatheringResponse} from './shared-gathering-handler';
import {gatheringCode} from '../../../src/features/guest/gathering-links';
const id='33333333-3333-4333-8333-333333333333',url=`https://left.example/g/${gatheringCode(id)}`;
it('does not process mutations or malformed links',async()=>{
 const read=vi.fn();
 expect((await sharedGatheringResponse(new Request(url,{method:'POST'}),read)).status).toBe(405);
 expect((await sharedGatheringResponse(new Request('https://left.example/g/bad'),read)).status).toBe(404);
 expect((await sharedGatheringResponse(new Request(url+'?anything=1'),read)).status).toBe(404);
 expect(read).not.toHaveBeenCalled();
});
it('returns revoked previews as unavailable and hides backend failures',async()=>{
 expect((await sharedGatheringResponse(new Request(url),async()=>null)).status).toBe(404);
 const result=await sharedGatheringResponse(new Request(url),async()=>{throw new Error('private secret');});
 expect(result.status).toBe(503);expect(await result.text()).not.toContain('secret');
});
it('reads exactly one approved plan and avoids caching or framing previews',async()=>{
 const read=vi.fn().mockResolvedValue({title:'Coffee',description:'A plan',venueName:'Cafe',startsAt:'2099-01-01',capacity:8,costNotes:'Free',accessibilityNotes:''});
 const response=await sharedGatheringResponse(new Request(url),read);
 expect(response.status).toBe(200);expect(read).toHaveBeenCalledOnce();expect(read).toHaveBeenCalledWith(id);
 expect(response.headers.get('Cache-Control')).toBe('no-store');expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
});
