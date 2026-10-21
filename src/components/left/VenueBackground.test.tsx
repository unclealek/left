import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
const m=vi.hoisted(()=>({opaque:false}));
vi.mock('react-native',()=>({View:'View',Text:'Text',StyleSheet:{absoluteFillObject:{position:'absolute',top:0,bottom:0,left:0,right:0}}}));
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({bottom:34})}));
vi.mock('./VenuePhoto',()=>({VenuePhoto:'Photo',PhotoCredits:'Credits'}));
vi.mock('./use-navigation-accessibility',()=>({useReducedTransparency:()=>m.opaque}));
import {VenueBackground} from './VenueBackground';
import type {RuntimeVenueCandidate} from '../../features/location/location-storage';
function nodes(value:unknown):Array<React.ReactElement<any>>{
 if(Array.isArray(value))return value.flatMap(nodes);if(!React.isValidElement(value))return [];
 const n=value as React.ReactElement<any>;return [n,...nodes(n.props.children)];
}
beforeEach(()=>{vi.stubGlobal('React',React);m.opaque=false;});
it('reuses the photo renderer as a fixed blurred full-screen background',()=>{
 const venue={name:'Neighbourhood café',venueType:'cafe',photo:{uri:'https://example.com/photo',attributions:[]}} as unknown as RuntimeVenueCandidate;
 const elements=nodes(VenueBackground({venue}));const photo=elements.find(n=>n.type==='Photo')!;
 expect(photo.props.photo).toBe(venue.photo);expect(photo.props.venue).toBe(venue);expect(photo.props.blurRadius).toBe(14);
 expect(elements[0].props.style[0]).toMatchObject({position:'absolute',top:0,bottom:0});
 expect(elements.some(n=>n.type==='Credits')).toBe(true);
});
it('keeps decorative placeholders free of caption overlays',()=>{
 const elements=nodes(VenueBackground({venue:{name:'Park',venueType:'other'} as RuntimeVenueCandidate}));
 expect(elements.some(n=>n.type==='Text'||n.type==='Credits')).toBe(false);
 expect(elements.find(n=>n.type==='Photo')!.props.showFallbackLabel).toBe(false);
});
it('removes background photography for Reduce Transparency',()=>{
 m.opaque=true;expect(nodes(VenueBackground({})).some(n=>n.type==='Photo'||n.type==='Credits')).toBe(false);
});
