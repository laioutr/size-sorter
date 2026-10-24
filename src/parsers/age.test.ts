import { expect, it } from 'vitest';
import type { Reading } from '../types';
import { de, nl } from '../locales';
import { parseLabel } from '../parse';
import { compileVocabulary } from '../vocabulary';

const en = compileVocabulary([]);
const deV = compileVocabulary([de]);
const nlV = compileVocabulary([nl]);

const age = (low: number, high = low): Reading => ({ system: 'age', group: 'age', key: [low, high] });
const numeric = (system: Reading['system'], n: number, variant = 2): Reading => ({ system, group: 'numeric', key: [n, n, variant] });

it.each([
  ['0-3M', en, [age(0, 3)]],
  ['3-6 M', en, [age(3, 6)]],
  ['03M', en, [age(3), numeric('number', 3, 3)]],
  ['12M', en, [age(12), numeric('number', 12, 3)]],
  ['18-24M', en, [age(18, 24)]],
  ['6-12 months', en, [age(6, 12)]],
  ['12 mos', en, [age(12)]],
  ['3-4 Monate', deV, [age(3, 4)]],
  ['6 maanden', nlV, [age(6)]],
  ['4Y', en, [age(48), numeric('kidsShoe', 4)]],
  ['8Y', en, [age(96)]],
  ['2-3Y', en, [age(24, 36)]],
  ['2-3 Jahre', deV, [age(24, 36)]],
  ['9-10J', deV, [age(108, 120)]],
  ['2-3 jaar', nlV, [age(24, 36)]],
  ['4 years', en, [age(48)]],
  ['2T', en, [age(24), numeric('kidsShoe', -12)]],
  ['Newborn', en, [age(0)]],
  ['NB', en, [age(0)]],
  ['Preemie', en, [age(-1)]],
  ['Micro Preemie', en, [age(-2)]],
  ['Frühchen', deV, [age(-1)]],
  ['T1(09-12M)', en, [age(9, 12)]],
] as const)('reads %s as an age', (raw, vocab, expected) => expect(parseLabel(raw, vocab)).toEqual(expected));

it.each(['38M', '2 m', '40-48M', '11T', '9-10J'])('has no age reading for %s', (raw) =>
  expect(parseLabel(raw, en).some((reading) => reading.group === 'age')).toBe(false)
);
