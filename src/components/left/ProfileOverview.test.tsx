import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('react-native',()=>({View:'View',Text:'Text',Pressable:'Pressable',StyleSheet:{create:(s:unknown)=>s},useWindowDimensions:()=>({fontScale:1})}));
vi.mock('../../app/leftTheme',()=>({T:{primary:'#5F733F',textPrimary:'#171812',textSecondary:'#666'}}));
vi.mock('../icons',()=>({LeftIcon:'Icon'}));
vi.mock('./ProfileHero',()=>({ProfileHero:'Hero'}));
vi.mock('./ProfileCompletionRing',()=>({ProfileCompletionRing:'Ring'}));
vi.mock('./use-navigation-accessibility',()=>({useReducedTransparency:()=>false}));
import {ProfileOverview} from './ProfileOverview';
import type {AppUser} from '../../types/left-domain';
function nodes(v:unknown):Array<React.ReactElement<any>>{if(Array.isArray(v))return v.flatMap(nodes);if(!React.isValidElement(v))return [];const n=v as React.ReactElement<any>;return [n,...nodes(n.props.children)];}
const user={firstName:'Member',createdAt:'2026-01-01',interests:['Arts & culture','Food & coffee','Learning'],offering:'',socialRhythm:'Weekday afternoons',conversationStyle:'Easygoing'} as AppUser;
const props=()=>({user,sessionVisible:false,currentVenueName:'',nearbyVenueCount:4,approachCount:2,savedVenueCount:3,onEdit:vi.fn(),onOpenSettings:vi.fn(),onOpenSafety:vi.fn(),onOpenSaved:vi.fn(),onBecomeVisible:vi.fn()});
beforeEach(()=>vi.stubGlobal('React',React));
it('matches the reference order with one visibility section and a real completion ring',()=>{
 const p=props(),elements=nodes(ProfileOverview(p));
 const sections=elements.filter(n=>n.props.testID?.startsWith('profile-section-')).map(n=>n.props.testID);
 expect(sections).toEqual(['profile-section-identity','profile-section-interests','profile-section-visibility','profile-section-compass','profile-section-completion','profile-section-saved','profile-section-moments']);
 expect(elements.find(n=>n.type==='Ring')!.props.value).toBe(75);
 expect(elements.filter(n=>n.props.children==='Currently private')).toHaveLength(1);
 expect(elements.find(n=>n.props.testID==='profile-compass-columns')!.props.style).toMatchObject({flexDirection:'row'});
});
it('preserves settings, safety, visibility, editing and saved-place actions',()=>{
 const p=props(),elements=nodes(ProfileOverview(p));
 elements.find(n=>n.type==='Hero')!.props.onSettings();
 for(const label of ['Privacy and safety controls','Go visible','Edit social compass','Open 3 saved places','Complete your profile, 75% complete'])elements.find(n=>n.props.accessibilityLabel===label)!.props.onPress();
 expect(p.onOpenSettings).toHaveBeenCalledOnce();expect(p.onOpenSafety).toHaveBeenCalledOnce();expect(p.onBecomeVisible).toHaveBeenCalledOnce();expect(p.onOpenSaved).toHaveBeenCalledOnce();expect(p.onEdit).toHaveBeenCalledTimes(2);
});
it('uses real counts and visible state without adding a second presence card',()=>{
 const p=props();p.sessionVisible=true;p.currentVenueName='Actual venue';const elements=nodes(ProfileOverview(p));
 expect(elements.some(n=>n.props.children==='Visible at Actual venue')).toBe(true);
 expect(elements.filter(n=>n.props.testID==='profile-section-visibility')).toHaveLength(1);
 expect(elements.some(n=>n.props.children==='3')).toBe(true);
});
