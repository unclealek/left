import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
const m=vi.hoisted(()=>({opaque:false}));
vi.mock('react-native',()=>({View:'View',Text:'Text',Pressable:'Pressable'}));
vi.mock('../../app/leftTheme',()=>({styles:{},T:{}}));
vi.mock('../icons',()=>({LeftIcon:'Icon'}));
vi.mock('./LeftLogoMark',()=>({LeftLogoMark:'Logo'}));
vi.mock('./VenuePhoto',()=>({VenuePhoto:'Photo'}));
vi.mock('./use-navigation-accessibility',()=>({useReducedTransparency:()=>m.opaque}));
import {ProfileHero} from './ProfileHero';
function nodes(value:unknown):Array<React.ReactElement<any>>{
 if(Array.isArray(value))return value.flatMap(nodes);if(!React.isValidElement(value))return [];
 const node=value as React.ReactElement<any>;return [node,...nodes(node.props.children)];
}
beforeEach(()=>{vi.stubGlobal('React',React);m.opaque=false;});
it('preserves the member edit action in the shared header',()=>{
 const onEdit=vi.fn();const elements=nodes(ProfileHero({name:'Member',onEdit}));
 elements.find(n=>n.props.accessibilityLabel==='Edit profile')!.props.onPress();
 expect(onEdit).toHaveBeenCalledOnce();expect(elements.some(n=>n.props.children==='Member')).toBe(true);
});
it('does not offer an editable profile for a guest header',()=>{
 const elements=nodes(ProfileHero({name:'Your profile starts here'}));
 expect(elements.some(n=>n.props.accessibilityLabel==='Edit profile')).toBe(false);
});
it('keeps Reduce Transparency solid in both modes',()=>{
 m.opaque=true;const elements=nodes(ProfileHero({name:'Your profile starts here'}));
 expect(elements.some(n=>n.type==='Photo')).toBe(false);
 expect(elements.some(n=>n.props.children==='Illustrative interior photo')).toBe(false);
});

it('keeps the identity header transparent without an embedded photo card',()=>{
 const elements=nodes(ProfileHero({name:'Member'}));
 expect(elements.some(n=>n.type==='Photo')).toBe(false);
 expect(elements.some(n=>n.props.children==='Illustrative interior photo')).toBe(false);
});
