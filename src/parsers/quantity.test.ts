import { expect, it } from 'vitest';
import type { SizeSystem } from '../types';
import { parseLabel } from '../parse';
import { compileVocabulary } from '../vocabulary';

const en = compileVocabulary([]);

type Expected = readonly (readonly [SizeSystem, readonly number[]])[];

function expectReadings(raw: string, expected: Expected) {
  const readings = parseLabel(raw, en);
  expect(readings.map((reading) => reading.system)).toEqual(expected.map(([system]) => system));
  readings.forEach((reading, index) => {
    const key = expected[index]?.[1] ?? [];
    expect(reading.key).toHaveLength(key.length);
    key.forEach((value, element) => expect(reading.key[element]).toBeCloseTo(value, 2));
  });
}

it.each([
  ['450 ml', [['volume', [450]]]],
  ['1,5 l', [['volume', [1500]]]],
  ['33 cl', [['volume', [330]]]],
  ['1 dl', [['volume', [100]]]],
  ['12 fl oz', [['volume', [354.882]]]],
  ['5.5 FL OZ', [['volume', [162.654]]]],
  ['1.000 ml', [['volume', [1000]]]],
  ['1l', [['volume', [1000]]]],
  [
    '1L',
    [
      ['number', [1, 1, 4]],
      ['volume', [1000]],
    ],
  ],
  ['500 g', [['weight', [500]]]],
  ['2,5 kg', [['weight', [2500]]]],
  ['5 lb', [['weight', [2267.96]]]],
  [
    '10 oz',
    [
      ['weight', [283.495]],
      ['volume', [295.735]],
    ],
  ],
  [
    '10oz',
    [
      ['weight', [283.495]],
      ['volume', [295.735]],
    ],
  ],
  ['2 x 12 kg', [['weight', [24000]]]],
  ['3 x 100 ml', [['volume', [300]]]],
  ['250g Dose', [['weight', [250]]]],
  ['Refill (240ml)', [['volume', [240]]]],
  [
    '1.7 oz (50mL)',
    [
      ['weight', [48.194]],
      ['volume', [50.275]],
    ],
  ],
  ['40x38x19 cm', [['dimensions', [40, 38, 19]]]],
  ['90 × 200', [['dimensions', [90, 200]]]],
  ['90x200cm', [['dimensions', [90, 200]]]],
  ['1.200 x 600 mm', [['dimensions', [120, 60]]]],
] as const)('reads %s as a quantity', (raw, expected) => expectReadings(raw, expected));

it.each(['XL', '2 m', '12 mos', '10 Large', '2 lit'])('has no quantity reading for %s', (raw) =>
  expect(parseLabel(raw, en).some((reading) => ['volume', 'weight', 'dimensions'].includes(reading.group))).toBe(false)
);

it('does not read the L of a jeans length as litres', () =>
  expect(parseLabel('W32 L34', en).map((reading) => reading.system)).toEqual(['number']));

it('does not read the denominator of a fraction as a quantity', () =>
  expect(parseLabel('Pillow Fill — 1/2 LB', en).some((reading) => reading.group === 'weight')).toBe(false));
