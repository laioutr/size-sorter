import { expect, it } from 'vitest';
import type { Reading } from '../types';
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
  ['700c', 700, 'c'],
  ['2-persoons', 2, '-persoons'],
])('falls back to the leading number of %s', (raw, n, text) => expectNumber(raw, en, [n, n, 1000], text));

it.each(['XL', '2XL', '1X', 'Kids', ''])('has no numeric reading for %j', (raw) =>
  expect(parseLabel(raw, en).some((reading) => reading.group === 'numeric')).toBe(false)
);

const ofSystem = (system: Reading['system'], key: number[], text?: string): Reading => ({
  system,
  group: 'numeric',
  key,
  ...(text === undefined ? {} : { text }),
});

it.each([
  ['42S', en, [ofSystem('number', [42, 42, 1])]],
  ['42R', en, [ofSystem('number', [42, 42, 3])]],
  ['42L', en, [ofSystem('number', [42, 42, 4]), ofSystem('bra', [42, 42, 28])]],
  ['38M', en, [ofSystem('number', [38, 38, 3]), ofSystem('bra', [38, 38, 29])]],
  ['12P', en, [ofSystem('number', [12, 12, 1])]],
  ['00P', en, [ofSystem('number', [-1, -1, 1])]],
  ['000P', en, [ofSystem('number', [-2, -2, 1])]],
  ['0P', en, [ofSystem('number', [0, 0, 1])]],
  ['14W', en, [ofSystem('number', [14, 14, 4])]],
  ['7 W', en, [ofSystem('number', [7, 7, 4])]],
  ['10 2E', en, [ofSystem('number', [10, 10, 5])]],
  ['10 4E', en, [ofSystem('number', [10, 10, 6])]],
  ['32 Long', en, [ofSystem('number', [32, 32, 4])]],
  ['32 Tall', en, [ofSystem('number', [32, 32, 4])]],
  ['32 Short', en, [ofSystem('number', [32, 32, 1])]],
  ['32 Reg', en, [ofSystem('number', [32, 32, 3])]],
  ['40 lang', deV, [ofSystem('number', [40, 40, 4])]],
  ['20T', en, [ofSystem('number', [20, 20, 4])]],
  ['70B', en, [ofSystem('bra', [70, 70, 12])]],
  ['75 C', en, [ofSystem('bra', [75, 75, 13])]],
  ['34DD', en, [ofSystem('bra', [34, 34, 15])]],
  ['85AA', en, [ofSystem('bra', [85, 85, 10])]],
  ['10C', en, [ofSystem('kidsShoe', [-4, -4, 2])]],
  ['13.5C', en, [ofSystem('kidsShoe', [-0.5, -0.5, 2])]],
  ['13K', en, [ofSystem('kidsShoe', [-1, -1, 2])]],
  ['11T', en, [ofSystem('kidsShoe', [-3, -3, 2])]],
  ['1Y', en, [ofSystem('kidsShoe', [1, 1, 2])]],
  ['40t', en, [ofSystem('number', [40, 40, 1000], 't')]],
  ['157MW', en, [ofSystem('number', [157, 157, 1000], 'MW')]],
  ['50B', en, [ofSystem('number', [50, 50, 1000], 'B')]],
] as const)('reads %s with its variant, cup or shoe series', (raw, vocab, expected) =>
  // Age readings (Task 12) and volume readings (Task 13) are tested with their own parsers.
  expect(parseLabel(raw, vocab).filter((reading) => reading.group === 'numeric')).toEqual(expected)
);
