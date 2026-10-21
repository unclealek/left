import { expect, it } from 'vitest';
import { isUuid } from './validation';

it.each([1, 2, 3, 4, 5])('accepts the existing UUID version %s contract', version => {
  expect(isUuid(`12345678-1234-${version}234-8234-123456789abc`)).toBe(true);
});
it('accepts uppercase UUIDs', () => {
  expect(isUuid('ABCDEF12-1234-4234-B234-123456789ABC')).toBe(true);
});
it.each([null, undefined, '', 'not-a-uuid', ' 12345678-1234-4234-8234-123456789abc',
  '12345678-1234-7234-8234-123456789abc', '12345678-1234-4234-1234-123456789abc', 42, {}])('rejects invalid identifiers without coercion: %s', value => {
  expect(isUuid(value)).toBe(false);
});
