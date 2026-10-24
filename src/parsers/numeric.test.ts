import { expect, it } from 'vitest';
import { de, nl } from '../locales';
import { parseLabel } from '../parse';
import { compileVocabulary, type Vocabulary } from '../vocabulary';

const en = compileVocabulary([]);
const deV = compileVocabulary([de]);
const nlV = compileVocabulary([nl]);

function expectNumber(raw: string, vocab: Vocabulary, key: readonly number[], text?: string) {
  const readings = parseLabel(raw, vocab);
  expect(readings).toHaveLength(1);
  const [reading] = readings;
  expect(reading).toMatchObject({ system: 'number', group: 'numeric' });
  expect(reading?.key).toHaveLength(key.length);
  key.forEach((value, index) => expect(reading?.key[index]).toBeCloseTo(value, 2));
  expect(reading?.text).toBe(text);
}

it.each([
  ['42', en, [42, 42, 2]],
  ['36,5', en, [36.5, 36.5, 2]],
  ['46.5', en, [46.5, 46.5, 2]],
  ['37 1/3', en, [37.333, 37.333, 2]],
  ['42 2|3', en, [42.667, 42.667, 2]],
  ['42⅔', en, [42.667, 42.667, 2]],
  ['38½', en, [38.5, 38.5, 2]],
  ['7 1/8', en, [7.125, 7.125, 2]],
  ['6 7/8', en, [6.875, 6.875, 2]],
  ['39-42', en, [39, 42, 2]],
  ['39 - 42', en, [39, 42, 2]],
  ['39–42', en, [39, 42, 2]],
  ['110/116', en, [110, 116, 2]],
  ['32/34', en, [32, 34, 2]],
  ['W32 L34', en, [32, 34, 2]],
  ['000', en, [-2, -2, 2]],
  ['00', en, [-1, -1, 2]],
  ['0', en, [0, 0, 2]],
  ['1.000', en, [1000, 1000, 2]],
  ['0,5', en, [0.5, 0.5, 2]],
  ['300 cm', en, [300, 300, 2]],
  ['2 m', en, [200, 200, 2]],
  ['25 mm', en, [2.5, 2.5, 2]],
  ['29"', en, [73.66, 73.66, 2]],
  ['29 in', en, [73.66, 73.66, 2]],
  ['40–65 cm', en, [40, 65, 2]],
  ['YS 110-116', en, [110, 116, 2]],
  ['2JS 98-104', en, [98, 104, 2]],
  ['3XS 122-128', en, [122, 128, 2]],
  ['XS 146-152', en, [146, 152, 2]],
  ['S–M: 40–65 cm', en, [40, 65, 2]],
  ['Größe S–M: 40–65 cm', deV, [40, 65, 2]],
  ['55cm (S)', en, [55, 55, 2]],
  ['Gr. 42', deV, [42, 42, 2]],
  ['EU 42', en, [42, 42, 2]],
  ['Maat 140', nlV, [140, 140, 2]],
] as const)('reads %s as a number', (raw, vocab, key) => expectNumber(raw, vocab, key));

it.each([
  ['152 XS|S', 152, 'XS|S'],
  ['30 Kapseln', 30, 'Kapseln'],
  ['10oz', 10, 'oz'],
  ['700c', 700, 'c'],
  ['2-persoons', 2, '-persoons'],
])('falls back to the leading number of %s', (raw, n, text) => expectNumber(raw, en, [n, n, 1000], text));

it.each(['XL', '2XL', '1X', 'Kids', ''])('has no numeric reading for %j', (raw) =>
  expect(parseLabel(raw, en).some((reading) => reading.group === 'numeric')).toBe(false)
);
