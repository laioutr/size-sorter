import { expect, it } from 'vitest';
import { parseLetter } from './letter';
import type { Reading } from '../types';
import { de, nl } from '../locales';
import { normalizeLabel } from '../normalize';
import { parseLabel } from '../parse';
import { compileVocabulary } from '../vocabulary';

const en = compileVocabulary([]);
const deV = compileVocabulary([de]);
const nlV = compileVocabulary([nl]);

it.each([
  ['XS', en, -2],
  ['XXS', en, -3],
  ['2XS', en, -3],
  ['3XS', en, -4],
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
  ['Small/Medium', en, -0.5],
  ['Large/X-Large', en, 1.5],
  ['Xsmall/small', en, -1.5],
  ['Extra Sm', en, -2],
  ['Lg', en, 1],
  ['Med', en, 0],
  ['Klein', deV, -1],
  ['extra groß', deV, 2],
  ['Groot', nlV, 1],
])('reads %s as a letter size', (raw, vocab, rank) =>
  expect(parseLabel(raw, vocab)).toEqual([{ system: 'letter', group: 'letter', key: [rank, 2] }])
);

it.each(['XS 146-152', '11XL', 'X', 'XS/S/M', 'Klein'])('has no letter reading for %s', (raw) =>
  expect(parseLetter(normalizeLabel(raw), en)).toEqual([])
);

it('gives up on long runs of X without overflowing the stack', () =>
  expect(parseLetter(normalizeLabel('X'.repeat(10_000)), en)).toEqual([]));

const letter = (rank: number, variant = 2): Reading => ({ system: 'letter', group: 'letter', key: [rank, variant] });
const lengthWord = (rank: number): Reading => ({ system: 'lengthWord', group: 'letter', key: [rank, 2] });
const sequence = (position: number): Reading => ({ system: 'sequence', group: 'sequence', key: [position] });
const number = (n: number): Reading => ({ system: 'number', group: 'numeric', key: [n, n, 2] });

it.each([
  ['XLT', en, [letter(2, 4)]],
  ['XLL', en, [letter(2, 4)]],
  ['LT', en, [letter(1, 4)]],
  ['ST', en, [letter(-1, 4)]],
  ['MS', en, [letter(0, 1)]],
  ['MT', en, [letter(0, 4)]],
  ['2XB', en, [letter(3, 4)]],
  ['S+', en, [letter(-1, 4)]],
  ['L Tall', en, [letter(1, 4)]],
  ['M Petite', en, [letter(0, 1)]],
  ['L lang', deV, [letter(1, 4)]],
  ['S', en, [letter(-1), lengthWord(-1), sequence(25)]],
  ['M', en, [letter(0), sequence(19)]],
  ['L', en, [letter(1), lengthWord(1), sequence(18)]],
  ['R', en, [lengthWord(0), sequence(24)]],
  ['T', en, [lengthWord(1), sequence(26)]],
  ['P', en, [lengthWord(-1), sequence(22)]],
  ['Regular', en, [lengthWord(0)]],
  ['Reg', en, [lengthWord(0)]],
  ['Kurz', deV, [lengthWord(-1)]],
  ['6X', en, [number(6.5), letter(7.25)]],
  ['US6/UK8', en, [number(6)]],
  ['56/XXL', en, [number(56)]],
  ['EU 39 / UK 6', en, [number(39)]],
] as const)('reads %s with variants, length words and sequences', (raw, vocab, expected) =>
  expect(parseLabel(raw, vocab)).toEqual(expected)
);
