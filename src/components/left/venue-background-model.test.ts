import { expect, it } from 'vitest';
import { selectVenueBackground } from './venue-background-model';
import type { RuntimeVenueCandidate } from '../../features/location/location-storage';
const venue=(id:string,distanceMeters:number|null)=>({id,name:id,distanceMeters} as RuntimeVenueCandidate);
it('prefers a current nearby venue over a nearer candidate',()=>{
 const places=[venue('cafe',20),venue('bar',40)];expect(selectVenueBackground(places,'bar',true)?.id).toBe('bar');
});
it('uses the nearest category regardless of list order without mutating candidates',()=>{
 const places=[venue('bar',100),venue('cafe',20)];expect(selectVenueBackground(places,'',true)?.id).toBe('cafe');expect(places[0].id).toBe('bar');
});
it('does not infer location from stale, distant or invalid candidates',()=>{
 expect(selectVenueBackground([venue('cafe',20)],'cafe',false)).toBeNull();
 expect(selectVenueBackground([venue('far',251),venue('unknown',null),venue('bad',NaN),venue('negative',-1)],'far',true)).toBeNull();
});
