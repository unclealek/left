import { expect, it } from 'vitest';
import { gatheringPage } from './gathering-page';
it('escapes public content and exposes no attendance action',()=>{
 const html=gatheringPage({title:'<script>alert(1)</script>',description:'A <b>plan</b>',venueName:'Cafe',startsAt:'2099-01-01T12:00:00Z',costNotes:'Free',accessibilityNotes:'',capacity:8},'abc',undefined);
 expect(html).not.toContain('<script>');expect(html).toContain('&lt;script&gt;');
 expect(html).not.toContain('set_experience_attendance');expect(html).toContain('left://g/abc');
 expect(html).toContain('Download access is coming soon');
});
it('only uses official app download destinations',()=>{
 const plan={title:'Coffee',description:'A small plan',venueName:'Cafe',startsAt:'2099-01-01',costNotes:'Free',accessibilityNotes:'',capacity:8};
 expect(gatheringPage(plan,'abc','https://testflight.apple.com/join/test')).toContain('Get HERE');
 expect(gatheringPage(plan,'abc','https://evil.test/download')).not.toContain('evil.test');
});
