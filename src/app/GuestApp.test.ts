import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
const runtime=vi.hoisted(()=>({values:[] as unknown[],cursor:0,effects:[] as Array<()=>unknown>,read:vi.fn()}));
vi.mock('react',async actual=>({...await actual<typeof import('react')>(),useState:(initial:unknown)=>{
 const index=runtime.cursor++;if(!(index in runtime.values))runtime.values[index]=initial;
 return [runtime.values[index],(value:unknown)=>{runtime.values[index]=typeof value==='function'?(value as Function)(runtime.values[index]):value;}];
},useEffect:(effect:()=>unknown)=>runtime.effects.push(effect)}));
vi.mock('react-native',()=>({ActivityIndicator:'Spinner',ScrollView:'ScrollView',Text:'Text',View:'View',useWindowDimensions:()=>({fontScale:1})}));
vi.mock('expo-status-bar',()=>({StatusBar:'StatusBar'}));
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:59,bottom:34})}));
vi.mock('./leftTheme',()=>({styles:{},T:{}}));
vi.mock('../components/left/ui',()=>({PrimaryButton:'Button',SelectChip:'Chip'}));
vi.mock('../components/left/navigation',()=>({SessionFooterNav:'Footer'}));
vi.mock('../components/left/ProfileHero',()=>({ProfileHero:'ProfileHero'}));
vi.mock('../components/left/BackgroundWaveLayer',()=>({BackgroundWaveLayer:'Background'}));
vi.mock('../screens/left/HomeScreen',()=>({HomeScreen:'Home'}));
vi.mock('../screens/left/VenueScreen',()=>({VenueScreen:'Map'}));
vi.mock('../screens/left/ExperienceDetailScreen',()=>({ExperienceDetailScreen:'ExperienceDetail'}));
vi.mock('../screens/left/VenueDetailScreen',()=>({VenueDetailScreen:'VenueDetail'}));
vi.mock('../features/guest/shared-gathering',()=>({fetchSharedGathering:runtime.read}));
vi.mock('../lib/use-posthog-screen',()=>({usePostHogScreen:vi.fn()}));
import {GuestApp} from './GuestApp';
function nodes(value:unknown):Array<React.ReactElement<any>>{
 if(Array.isArray(value))return value.flatMap(nodes);if(!React.isValidElement(value))return [];
 const node=value as React.ReactElement<any>;return [node,...nodes(node.props.children)];
}
function render(onSignIn=vi.fn(),sharedGatheringId:string|null=null){runtime.cursor=0;return {onSignIn,elements:nodes(GuestApp({sharedGatheringId,onSignIn}))};}
beforeEach(()=>{runtime.values=[];runtime.cursor=0;runtime.effects=[];runtime.read.mockReset();vi.stubGlobal('React',React);});
it('has no browsing destinations or public read without a gathering link',()=>{
 const screen=render();runtime.effects.forEach(effect=>effect());
 expect(runtime.read).not.toHaveBeenCalled();
 expect(screen.elements.some(n=>['Home','Map','Footer','ProfileHero','VenueDetail','ExperienceDetail'].includes(n.type as string))).toBe(false);
 screen.elements.find(n=>n.props.label==='Sign in')!.props.onPress();expect(screen.onSignIn).toHaveBeenCalledOnce();
});
it('shows only the requested gathering and gates attendance, venue and back actions to sign-in',async()=>{
 const id='12345678-1234-4234-8234-123456789abc';
 runtime.read.mockResolvedValue({id,title:'Reviewed plan',venueName:'Published venue'});
 const signIn=vi.fn();render(signIn,id);runtime.effects[0]();
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 const screen=render(signIn,id);const detail=screen.elements.find(n=>n.type==='ExperienceDetail')!;
 expect(runtime.read).toHaveBeenCalledWith(id);expect(detail.props.guest).toBe(true);
 detail.props.onToggleAttendance();detail.props.onOpenVenue();detail.props.onBack();expect(signIn).toHaveBeenCalledTimes(3);
 expect(screen.elements.some(n=>['Home','Map','Footer','ProfileHero','VenueDetail'].includes(n.type as string))).toBe(false);
});
it('does not render a previous event after the incoming link changes',async()=>{
 runtime.read.mockResolvedValue({id:'old',title:'Old plan'});render(vi.fn(),'old');runtime.effects[0]();
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 expect(render(vi.fn(),'new').elements.some(n=>n.type==='ExperienceDetail')).toBe(false);
 expect(render(vi.fn(),null).elements.some(n=>n.type==='ExperienceDetail')).toBe(false);
});
it('keeps unavailable and failed links restricted, with retry for a failed read',async()=>{
 const id='12345678-1234-4234-8234-123456789abc';runtime.read.mockRejectedValue(new Error('Public preview unavailable'));
 render(vi.fn(),id);runtime.effects[0]();await Promise.resolve();await Promise.resolve();await Promise.resolve();
 const screen=render(vi.fn(),id);
 expect(screen.elements.some(n=>n.props.accessibilityRole==='alert')).toBe(true);
 expect(screen.elements.some(n=>n.props.label==='Try again')).toBe(true);
 expect(screen.elements.some(n=>n.type==='ExperienceDetail'||n.type==='Footer')).toBe(false);
});
it('keeps an unavailable event on the restricted message screen',async()=>{
 const id='12345678-1234-4234-8234-123456789abc';runtime.read.mockResolvedValue(null);
 render(vi.fn(),id);runtime.effects[0]();await Promise.resolve();await Promise.resolve();
 const screen=render(vi.fn(),id);
 expect(screen.elements.some(n=>n.props.children==='This gathering is no longer available.')).toBe(true);
 expect(screen.elements.some(n=>n.type==='ExperienceDetail'||n.type==='Footer')).toBe(false);
});
it('ignores an event response after the link has been left',async()=>{
 let resolve!:(value:unknown)=>void;runtime.read.mockReturnValue(new Promise(done=>{resolve=done;}));
 render(vi.fn(),'old');const cleanup=runtime.effects[0]() as ()=>void;cleanup();
 resolve({id:'old',title:'Old plan'});await Promise.resolve();await Promise.resolve();
 expect(render(vi.fn(),'old').elements.some(n=>n.type==='ExperienceDetail')).toBe(false);
});
