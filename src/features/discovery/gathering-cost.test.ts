import { describe, expect, it } from 'vitest';
import { costNotesFor, changeAmount, parseEuroAmount } from './gathering-cost';
describe('gathering cost choices', () => {
 it('keeps free, own spend and potluck distinct', () => {
  expect(costNotesFor('free',1000,'','')).toBe('Free');
  expect(costNotesFor('own',1000,'','')).toBe('Buy your own food or drink');
  expect(costNotesFor('potluck',1000,'Bring a dish','Vegetarian welcome')).toBe('Potluck — Bring a dish. Vegetarian welcome');
 });
 it('preserves typed details and expected per-person cost', () => {
  expect(costNotesFor('paid',1250,'','Includes supplies')).toBe('€12.50 per person. Includes supplies');
  expect(costNotesFor('custom',0,'','Pay at the venue')).toBe('Pay at the venue');
 });
 it('bounds amount steps and handles decimal comma without rounding away cents', () => {
  expect(changeAmount(0,-1)).toBe(0); expect(changeAmount(100000,1)).toBe(100000);
  expect(changeAmount(1250,1)).toBe(1350);
  expect(parseEuroAmount('12,50')).toBe(1250); expect(parseEuroAmount('1.234')).toBeNull();
  expect(parseEuroAmount('-1')).toBeNull(); expect(parseEuroAmount('1001')).toBeNull();
 });
});
