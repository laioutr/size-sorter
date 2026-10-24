import { expect, it } from 'vitest';
import { parseLetter } from './letter';
import { de, nl } from '../locales';
import { normalizeLabel } from '../normalize';
import { parseLabel } from '../parse';
import { compileVocabulary } from '../vocabulary';

const en = compileVocabulary([]);
const deV = compileVocabulary([de]);
const nlV = compileVocabulary([nl]);

it.each([
  ['M', en, 0],
  ['S', en, -1],
  ['XS', en, -2],
  ['XXS', en, -3],
  ['2XS', en, -3],
  ['3XS', en, -4],
  ['L', en, 1],
  ['XL', en, 2],
  ['XXL', en, 3],
  ['2XL', en, 3],
  ['XXXL', en, 4],
  ['10XL', en, 11],
  ['10XS', en, -11],
  ['1X', en, 2.25],
  ['2X', en, 3.25],
  ['S|M', en, -0.5],
  ['XS/S', en, -1.5],
  ['L-XL', en, 1.5],
  ['L–XL', en, 1.5],
  ['XL/1X', en, 2.125],
  ['xl', en, 2],
  ['Small', en, -1],
  ['X-Large', en, 2],
  ['XX-Large', en, 3],
  ['2X-Large', en, 3],
  ['XSmall', en, -2],
  ['Extra Small', en, -2],
  ['Extra Extra Large', en, 3],
  ['Klein', deV, -1],
  ['extra groß', deV, 2],
  ['Groot', nlV, 1],
])('reads %s as letter rank %d', (raw, vocab, rank) =>
  expect(parseLabel(raw, vocab)).toEqual([{ system: 'letter', group: 'letter', key: [rank, 2] }])
);

it.each(['XS 146-152', 'XLL', '11XL', 'X', 'XS/S/M', 'Klein'])('has no letter reading for %s', (raw) =>
  expect(parseLetter(normalizeLabel(raw), en)).toEqual([])
);

it('gives up on long runs of X without overflowing the stack', () =>
  expect(parseLetter(normalizeLabel('X'.repeat(10_000)), en)).toEqual([]));
