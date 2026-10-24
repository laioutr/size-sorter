import { expect, it } from 'vitest';
import type { Reading } from '../types';
import { nl } from '../locales';
import { parseLabel } from '../parse';
import { compileVocabulary } from '../vocabulary';

const en = compileVocabulary([]);
const nlV = compileVocabulary([nl]);

const bed = (locale: number, position: number): Reading => ({ system: 'bed', group: 'bed', key: [locale, position] });
const pillow = (position: number): Reading => ({ system: 'pillow', group: 'bed', key: [position] });

it.each([
  ['Twin XL', en, [bed(0, 3)]],
  ['Queen Size', en, [bed(0, 7), pillow(1)]],
  ['King', en, [bed(0, 8), pillow(2)]],
  ['Standard', en, [pillow(0), { system: 'lengthWord', group: 'letter', key: [0, 2] }]],
  ['California King', en, [bed(0, 10)]],
  ['Cal King', en, [bed(0, 10)]],
  ['Split King', en, [bed(0, 11)]],
  ['Split Cal King (2 Units)', en, [bed(0, 12)]],
  ['Tweepersoons', nlV, [bed(0, 1)]],
  ['King', nlV, [bed(1, 8), pillow(2)]],
] as const)('reads %s as a bed or pillow size', (raw, vocab, expected) => expect(parseLabel(raw, vocab)).toEqual(expected));

it.each(['Kingdom', 'Twins', 'Standards'])('needs a whole word: %s', (raw) =>
  expect(parseLabel(raw, en).some((reading) => reading.group === 'bed')).toBe(false)
);
