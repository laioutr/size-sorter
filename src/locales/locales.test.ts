import { expect, it } from 'vitest';
import type { Reading, SizeLocale } from '../types';
import { parseLabel } from '../parse';
import { compileVocabulary } from '../vocabulary';
import { fr, it as italian, pl } from './index';

const age = (low: number, high = low): Reading => ({ system: 'age', group: 'age', key: [low, high] });
const oneSize: Reading = { system: 'oneSize', group: 'oneSize', key: [] };
const letter = (rank: number): Reading => ({ system: 'letter', group: 'letter', key: [rank, 2] });

it.each([
  ['3A', fr, [age(36)]],
  ['2/3 ans', fr, [age(24, 36)]],
  ['6 mois', fr, [age(6)]],
  ['T38', fr, [{ system: 'number', group: 'numeric', key: [38, 38, 2] }]],
  ['TU', fr, [oneSize]],
  ['Taille unique', fr, [oneSize]],
  [
    'T',
    fr,
    [
      { system: 'lengthWord', group: 'letter', key: [1, 2] },
      { system: 'sequence', group: 'sequence', key: [26] },
    ],
  ],
  ['très grand', fr, [letter(2)]],
  ['3-4 anni', italian, [age(36, 48)]],
  ['Taglia unica', italian, [oneSize]],
  ['5 lat', pl, [age(60)]],
  ['Jeden Rozmiar', pl, [oneSize]],
  ['duży', pl, [letter(1)]],
] as [string, SizeLocale, Reading[]][])('reads %s with its locale', (raw, locale, expected) =>
  expect(parseLabel(raw, compileVocabulary([locale]))).toEqual(expected)
);
