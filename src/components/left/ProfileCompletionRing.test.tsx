import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('react-native',()=>({Text:'Text',View:'View'}));
vi.mock('react-native-svg',()=>({default:'Svg',Circle:'Circle'}));
vi.mock('../../app/leftTheme',()=>({T:{primary:'#5F733F',textPrimary:'#171812'}}));
import {ProfileCompletionRing} from './ProfileCompletionRing';
function nodes(v:unknown):Array<React.ReactElement<any>>{if(Array.isArray(v))return v.flatMap(nodes);if(!React.isValidElement(v))return [];const n=v as React.ReactElement<any>;return [n,...nodes(n.props.children)];}
beforeEach(()=>vi.stubGlobal('React',React));
it('draws a complete track and exact 75 percent arc from the top',()=>{
 const elements=nodes(ProfileCompletionRing({value:75})),circles=elements.filter(n=>n.type==='Circle');
 expect(circles).toHaveLength(2);expect(circles[0].props.strokeDasharray).toBeUndefined();
 expect(circles[1].props.strokeDashoffset).toBeCloseTo(2*Math.PI*27*0.25);
 expect(circles[1].props.rotation).toBe(-90);expect(elements[0].props.accessibilityValue.now).toBe(75);
});
it('clamps completion to a valid ring',()=>{
 expect(nodes(ProfileCompletionRing({value:200}))[0].props.accessibilityValue.now).toBe(100);
 expect(nodes(ProfileCompletionRing({value:NaN}))[0].props.accessibilityValue.now).toBe(0);
});
