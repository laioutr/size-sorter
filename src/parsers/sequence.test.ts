import { expect, it } from 'vitest';
import { parseSequence } from './sequence';
import { normalizeLabel } from '../normalize';
import { parseLabel } from '../parse';
import { compileVocabulary } from '../vocabulary';

const en = compileVocabulary([]);

it.each([
  ['J', 15],
  ['H ½', 12.5],
  ['DD', 5],
  ['AA', 0],
  ['X', 30],
  ['Z', 32],
])('reads %s as sequence position %d', (raw, position) =>
  expect(parseLabel(raw, en)).toEqual([{ system: 'sequence', group: 'sequence', key: [position] }])
);

it.each(['XL', 'AAA', 'D 1/3', 'J K', ''])('has no sequence reading for %j', (raw) =>
  expect(parseSequence(normalizeLabel(raw), en)).toEqual([])
);
