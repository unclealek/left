import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
const runtime=vi.hoisted(()=>({values:[] as unknown[],cursor:0,effects:[] as Array<()=>unknown>,read:vi.fn()}));
vi.mock('react',async importActual=>({...await importActual<typeof import('react')>(),useState:(initial:unknown)=>{
 const index=runtime.cursor++;if(!(index in runtime.values))runtime.values[index]=initial;
 return [runtime.values[index],(value:unknown)=>{runtime.values[index]=typeof value==='function'?(value as Function)(runtime.values[index]):value;}];
},useEffect:(effect:()=>unknown)=>runtime.effects.push(effect)}));
vi.mock('react-native',()=>({ActivityIndicator:'Spinner',ScrollView:'ScrollView',Text:'Text',View:'View'}));
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0})}));
vi.mock('./leftTheme',()=>({styles:{},T:{}}));
vi.mock('../components/left/ui',()=>({PrimaryButton:'Button',SelectChip:'Chip'}));
vi.mock('../screens/left/ExperienceDetailScreen',()=>({ExperienceDetailScreen:'ExperienceDetail'}));
vi.mock('../screens/left/VenueDetailScreen',()=>({VenueDetailScreen:'VenueDetail'}));
vi.mock('../features/guest/shared-gathering',()=>({fetchSharedGathering:runtime.read}));
import {GuestApp} from './GuestApp';
function nodes(value:unknown):Array<React.ReactElement<any>>{
 if(Array.isArray(value))return value.flatMap(nodes);if(!React.isValidElement(value))return [];
 const node=value as React.ReactElement<any>;return [node,...nodes(node.props.children)];
}
function render(onSignIn=vi.fn()){runtime.cursor=0;return {onSignIn,elements:nodes(GuestApp({sharedGatheringId:null,onSignIn}))};}
beforeEach(()=>{runtime.values=[];runtime.cursor=0;runtime.effects=[];runtime.read.mockReset();vi.stubGlobal('React',React);});
it('prompts sign-in for hosting and never starts a shared lookup without a link',()=>{
 const screen=render();screen.elements.find(n=>n.props.label==='Host something small')!.props.onPress();
 expect(screen.onSignIn).toHaveBeenCalledOnce();runtime.effects.forEach(effect=>effect());expect(runtime.read).not.toHaveBeenCalled();
});
it('guest venue save and primary action can only open sign-in',()=>{
 runtime.values=['Venues',null,false,null,0,'venue'];const screen=render();
 const venue=screen.elements.find(n=>n.type==='VenueDetail')!;
 venue.props.onToggleSaved();venue.props.onPrimaryAction();expect(screen.onSignIn).toHaveBeenCalledTimes(2);
 expect(venue.props.venue.placeId).toBeUndefined();expect(venue.props.sessionVisible).toBe(false);
});
it('guest attendance routes to sign-in without an attendance handler',()=>{
 runtime.values=['Gatherings',{id:'reviewed',title:'A plan'},false,null,0,'gathering'];const screen=render();
 const detail=screen.elements.find(n=>n.type==='ExperienceDetail')!;
 expect(detail.props.guest).toBe(true);detail.props.onToggleAttendance();expect(screen.onSignIn).toHaveBeenCalledOnce();
});
