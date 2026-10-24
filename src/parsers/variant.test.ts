import { expect, it } from 'vitest';
import { cupPosition, variantRank } from './variant';
import { de } from '../locales';
import { compileVocabulary } from '../vocabulary';

const en = compileVocabulary([]);
const deV = compileVocabulary([de]);

it.each([
  ['S', 1],
  ['P', 1],
  ['N', 1],
  ['R', 3],
  ['M', 3],
  ['L', 4],
  ['T', 4],
  ['W', 4],
  ['+', 4],
  ['B', 4],
  ['2E', 5],
  ['XW', 5],
  ['4E', 6],
  ['Long', 4],
  ['Petite', 1],
  ['Regular', 3],
])('ranks the marker %s as %d', (marker, rank) => expect(variantRank(marker, en)).toBe(rank));

it('reads locale variant words', () => expect(variantRank('lang', deV)).toBe(4));

it.each(['t', 'l', 'C', 'MW', 'constructor', ''])('has no variant rank for %j', (marker) =>
  expect(variantRank(marker, en)).toBeUndefined()
);

it.each([
  ['AA', 0],
  ['A', 1],
  ['DD', 5],
  ['L', 18],
  ['N', 20],
])('puts cup %s at position %d', (cup, position) => expect(cupPosition(cup)).toBe(position));

it.each(['O', 'X', 'Z', 'AAA', ''])('has no cup position for %j', (cup) => expect(cupPosition(cup)).toBeUndefined());
