import { expect, it, vi } from 'vitest';
import { completePopularTimesJob } from './popular-times-job';
it('saves a successful no-data result for fourteen days and scopes writes to its lease', async () => {
  const eq = vi.fn(); const update = vi.fn(() => ({eq})); eq.mockReturnValue({eq, then: (resolve: (v: unknown) => unknown) => resolve({error:null})});
  const db = {from: vi.fn(() => ({update}))};
  await completePopularTimesJob(db, {placeId:'test',placeUrl:'url'}, 'lease', {source:'google_scrape',fetch:vi.fn().mockResolvedValue({has_data:false,popular_times:null,current_busyness:null,typical_time_spent:null})});
  const patch = update.mock.calls[0][0] as any;
  expect(patch.status).toBe('ready'); expect(patch.has_data).toBe(false);
  expect(Date.parse(patch.expires_at)-Date.parse(patch.fetched_at)).toBe(14*86400000);
  expect(eq).toHaveBeenCalledWith('claim_token','lease');
});
it('backs off failures for a day without exposing provider errors', async () => {
  const eq = vi.fn(); const update = vi.fn(() => ({eq})); eq.mockReturnValue({eq, then: (resolve: (v: unknown) => unknown) => resolve({error:null})});
  await completePopularTimesJob({from:() => ({update})}, {placeId:'test',placeUrl:'url'}, 'lease', {source:'google_scrape',fetch:vi.fn().mockRejectedValue(new Error('secret'))});
  const patch = update.mock.calls[0][0] as any;
  expect(patch.status).toBe('failed'); expect(Date.parse(patch.retry_at)).toBeGreaterThan(Date.now()+86390000);
  expect(JSON.stringify(patch)).not.toContain('secret');
});
it('contains database transport failures during failure handling', async () => {
  const warning=vi.spyOn(console,'warn').mockImplementation(()=>{});
  const eq=vi.fn();eq.mockReturnValue({eq,then:(_resolve:unknown,reject:(reason:unknown)=>unknown)=>reject(new Error('secret database details'))});
  await expect(completePopularTimesJob({from:()=>({update:()=>({eq})})},{placeId:'test',placeUrl:'url'},'lease',{source:'google_scrape',fetch:vi.fn().mockRejectedValue(new Error('private provider error'))})).resolves.toBeUndefined();
  expect(JSON.stringify(warning.mock.calls)).not.toContain('secret');warning.mockRestore();
});
