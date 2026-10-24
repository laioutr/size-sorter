import type { Parser } from '../parse';
import type { Reading } from '../types';
import type { Vocabulary } from '../vocabulary';
import { fold, parseNumber } from '../normalize';

const NUMBER = String.raw`\d+(?:[.,]\d+)?`;
/** A number or range, then a unit with or without a space: `0-3M`, `2-3 Jahre`, `2/3 ans`, `3A`. */
const AGE = new RegExp(String.raw`^(${NUMBER})(?:\s*[-–/]\s*(${NUMBER}))?\s?([^\d\s].*)$`);
/** A month range in brackets anywhere in the label: `T1(09-12M)`. */
const BRACKET = /\((\d+)\s*[-–]\s*(\d+)\s*M\)/;

const age = (low: number, high: number): Reading[] => [{ system: 'age', group: 'age', key: [low, high] }];

/** Months per unit after an age, or 0 when the unit isn't an age unit. */
function monthsPer(unit: string, to: number, vocab: Vocabulary): number {
  const word = fold(unit);
  // A capital `M` is only months for a typical age; `38M` is a size with a medium leg.
  if (unit === 'M') return to <= 36 ? 1 : 0;
  if (word === 'T') return to <= 6 ? 12 : 0;
  if (word === 'Y' || vocab.yearWords.includes(word)) return 12;
  return vocab.monthWords.includes(word) ? 1 : 0;
}

/** Months, years, toddler `nT` and baby words, keyed in months (spec 7.4). */
export const parseAge: Parser = ({ text, folded }, vocab) => {
  const baby = vocab.babyWords.get(folded);
  if (baby !== undefined) return age(baby, baby);
  const bracket = BRACKET.exec(text);
  if (bracket) return age(Number(bracket[1]), Number(bracket[2]));
  const [, low = '', high = low, unit = ''] = AGE.exec(text) ?? [];
  const from = parseNumber(low);
  const to = parseNumber(high);
  if (from === undefined || to === undefined) return [];
  const factor = monthsPer(unit, to, vocab);
  return factor ? age(from * factor, to * factor) : [];
};
