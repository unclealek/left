import { expect, it } from 'vitest';
import { gatheringCode, gatheringId, parseGatheringLink, approvedGatheringUrl } from './gathering-links';
const id='faaed339-99d0-4038-a9db-caa43fc553ca';
it('round trips compact stable IDs',()=> { const code=gatheringCode(id);expect(code).toHaveLength(22);expect(gatheringId(code)).toBe(id); });
it('recognizes app links and only configured web links',()=> {
 const code=gatheringCode(id);
 expect(parseGatheringLink(`left://g/${code}`)).toBe(id);
 expect(parseGatheringLink(`https://left.example/g/${code}`,'https://left.example')).toBe(id);
 expect(parseGatheringLink(`https://evil.example/g/${code}`,'https://left.example')).toBeNull();
 expect(parseGatheringLink(`left://g/${code}?next=https://evil.example`)).toBeNull();
});
it('fails closed for unapproved, expired or unconfigured shares',()=> {
 const plan={id,status:'published',starts_at:'2099-01-01T00:00:00Z'};
 expect(approvedGatheringUrl(plan,'https://left.example')).toContain('/g/');
 expect(approvedGatheringUrl({...plan,status:'pending_review'},'https://left.example')).toBeNull();
 expect(approvedGatheringUrl({...plan,starts_at:'2000-01-01'},'https://left.example')).toBeNull();
 expect(approvedGatheringUrl(plan,undefined)).toBeNull();
 expect(approvedGatheringUrl(plan,'http://left.example')).toBeNull();
});
it('rejects malformed IDs and noncanonical codes',()=> {
 expect(()=>gatheringCode('bad')).toThrow();
 for(const code of ['', 'a'.repeat(22), '../foo', 'A'.repeat(23)]) expect(gatheringId(code)).toBeNull();
});
