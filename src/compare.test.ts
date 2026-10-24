import { expect, it } from 'vitest';
import { compareKeys, groupRanks } from './compare';
import { DEFAULT_GROUP_ORDER, type SizeGroup } from './types';

it('ranks groups in the default order', () =>
  expect([...groupRanks().entries()]).toEqual(DEFAULT_GROUP_ORDER.map((group, index) => [group, index])));

it('puts the listed groups first', () => {
  const ranks = groupRanks(['oneSize', 'letter']);
  expect(ranks.get('oneSize')).toBe(0);
  expect(ranks.get('letter')).toBe(1);
  expect(ranks.get('age')).toBe(2);
});

it('ignores duplicate and unknown group names', () => {
  const ranks = groupRanks(['letter', 'letter', 'bogus' as SizeGroup]);
  expect(ranks.get('letter')).toBe(0);
  expect(ranks.get('age')).toBe(1);
  expect(ranks.get('numeric')).toBe(2);
  expect(ranks.has('bogus' as SizeGroup)).toBe(false);
});

it('compares keys element by element, a missing element first', () => {
  expect(compareKeys([1, 2], [1, 3])).toBeLessThan(0);
  expect(compareKeys([1], [1, 0])).toBeLessThan(0);
  expect(compareKeys([1, 2], [1, 2])).toBe(0);
});
