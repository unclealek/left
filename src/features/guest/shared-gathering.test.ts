import { expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({rpc:vi.fn(),create:vi.fn()}));
vi.mock('@supabase/supabase-js',()=>({createClient:(...args:unknown[])=>{mocks.create(...args);return {rpc:mocks.rpc};}}));
import {fetchSharedGathering} from './shared-gathering';
it('uses an isolated non-persistent public client for exactly one read RPC',async()=>{
 mocks.rpc.mockResolvedValue({data:{id:'33333333-3333-4333-8333-333333333333',title:'A plan',venueId:'v',venueName:'Cafe',description:'Description',startsAt:'2099-01-01',endsAt:null,capacity:8,attendeeCount:1,costNotes:'Free',accessibilityNotes:''},error:null});
 const plan=await fetchSharedGathering('33333333-3333-4333-8333-333333333333');
 expect(mocks.create.mock.calls[0][2].auth).toEqual({persistSession:false,autoRefreshToken:false,detectSessionInUrl:false});
 expect(mocks.rpc).toHaveBeenCalledWith('get_shared_gathering',{p_experience_id:'33333333-3333-4333-8333-333333333333'});
 expect(plan?.viewerAttending).toBe(false);expect(plan?.hostUserId).toBe('');
});
it('does not request invalid IDs or expose raw errors',async()=>{
 const previous=mocks.rpc.mock.calls.length;
 await expect(fetchSharedGathering('bad')).rejects.toThrow('Invalid');expect(mocks.rpc.mock.calls.length).toBe(previous);
 mocks.rpc.mockResolvedValue({error:{message:'private backend details'}});
 await expect(fetchSharedGathering('33333333-3333-4333-8333-333333333333')).rejects.toThrow('could not be loaded');
});
it('returns unavailable when a plan is revoked or no longer approved',async()=>{
 mocks.rpc.mockResolvedValue({data:null,error:null});expect(await fetchSharedGathering('33333333-3333-4333-8333-333333333333')).toBeNull();
});
