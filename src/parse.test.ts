import { expect, it } from 'vitest';
import { de, nl } from './locales';
import { normalizeLabel } from './normalize';
import { parseLabel, stripPrefixes } from './parse';
import { compileVocabulary } from './vocabulary';

const en = compileVocabulary([]);
const deV = compileVocabulary([de]);
const nlV = compileVocabulary([nl]);
const oneSize = [{ system: 'oneSize', group: 'oneSize', key: [] }];

it.each(['One Size', 'ONESIZE', 'OS', 'O/S', 'OSFA', 'One Size Fits All', 'ADJ'])('reads %s as one size', (raw) =>
  expect(parseLabel(raw, en)).toEqual(oneSize)
);

it('reads locale one-size words', () => {
  expect(parseLabel('Einheitsgröße', deV)).toEqual(oneSize);
  expect(parseLabel('Uni', deV)).toEqual(oneSize);
  expect(parseLabel('Unisex', deV)).toEqual([]);
  expect(parseLabel('één maat', nlV)).toEqual(oneSize);
  expect(parseLabel('Uni', en)).toEqual([]);
});

it.each([
  ['Gr. 42', deV, '42'],
  ['Größe: XL', deV, 'XL'],
  ['KW38', deV, '38'],
  ['Maat 140', nlV, '140'],
  ['EU 42', en, '42'],
  ['Gr. EU 42', deV, '42'],
  ['Size M', en, 'M'],
  ['Size', en, 'Size'],
  ['Grande', deV, 'Grande'],
  ['Small', en, 'Small'],
  ['Deluxe', en, 'Deluxe'],
])('strips prefixes from %s', (raw, vocab, text) => expect(stripPrefixes(normalizeLabel(raw), vocab).text).toBe(text));

it('returns [] for unknown and empty labels', () => {
  expect(parseLabel('Kids', en)).toEqual([]);
  expect(parseLabel('   ', en)).toEqual([]);
});

const letter = (rank: number) => [{ system: 'letter', group: 'letter', key: [rank, 2] }];

it.each([
  ['XS (6-8)', en, letter(-2)],
  ['XXS-XL (71")', en, letter(-0.5)],
  [`Small - 42cm - ( Riders 5'6" - 5'10" )`, en, letter(-1)],
  ['M - Size 8', en, letter(0)],
  ['S (W5-7)', en, letter(-1)],
  ['Newborn / 0-3 months', en, [{ system: 'age', group: 'age', key: [0, 0] }]],
  ["Men's XL", en, letter(2)],
  ['Women’s XL', en, letter(2)],
] as const)('sorts %s by its first size', (raw, vocab, [expected]) => expect(parseLabel(raw, vocab)[0]).toEqual(expected));

it.each([
  ['Full/Queen', [0, 6.5]],
  ['King/Cal King', [0, 9]],
  ['Twin/Twin XL', [0, 2.5]],
])('puts the combined size %s between its halves', (raw, key) =>
  expect(parseLabel(raw, en)[0]).toEqual({ system: 'bed', group: 'bed', key })
);
