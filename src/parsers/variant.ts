import type { Vocabulary } from '../vocabulary';
import { fold } from '../normalize';
import { SEQUENCE, VARIANT } from '../types';

/** Upper-case fit, length and width codes → variant rank (spec 6.2). */
export const MARKERS: Readonly<Record<string, number>> = {
  S: VARIANT.short,
  P: VARIANT.short,
  N: VARIANT.short,
  R: VARIANT.regular,
  M: VARIANT.regular,
  L: VARIANT.long,
  T: VARIANT.long,
  W: VARIANT.long,
  '+': VARIANT.long,
  B: VARIANT.long,
  '2E': VARIANT.extraWide,
  XW: VARIANT.extraWide,
  '4E': VARIANT.extraExtraWide,
};

/** Rank of a marker code (case-sensitive) or a locale variant word. */
export function variantRank(marker: string, vocab: Vocabulary): number | undefined {
  if (Object.hasOwn(MARKERS, marker)) return MARKERS[marker];
  const word = vocab.variantWords.get(fold(marker));
  return word && VARIANT[word];
}

/** Position of a bra cup in the merged sequence: 0–20 for `AA` … `N`. */
export function cupPosition(letters: string): number | undefined {
  const position = SEQUENCE.indexOf(letters);
  return position >= 0 && position <= 20 ? position : undefined;
}
