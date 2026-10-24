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
