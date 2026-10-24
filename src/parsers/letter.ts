import { MARKERS, variantRank } from './variant';
import type { Label } from '../normalize';
import type { Parser } from '../parse';
import type { Vocabulary } from '../vocabulary';
import { type Reading, VARIANT } from '../types';

const MAX_RANK = 11;
const LETTER = /^(?:(\d{1,2})X|(X*))([SL]?)$/;
const COUNT = /^(\d{1,2})(?=X)/;
/** Combined sizes split on `|` or `/` first, so `Large/X-Large` keeps its hyphen; otherwise on a dash. */
const SEPARATORS = [/\s*[|/]\s*/, /\s*[-–]\s*/];

const inRange = (rank: number): number | undefined => (Math.abs(rank) <= MAX_RANK ? rank : undefined);

/**
 * Rank of one letter size: `M` = 0, `S` = −1, `XS` = −2, `L` = 1, `XL` = 2, … up to ±11.
 * A bare `nX` is a plus size just after `nXL`.
 */
export function letterRank(folded: string): number | undefined {
  if (folded === 'M') return 0;
  const [, count, xs = '', base] = LETTER.exec(folded) ?? [];
  const n = count === undefined ? xs.length : Number(count);
  if (base === undefined || (count !== undefined && n < 1)) return undefined;
  // A bare `nX` (n 1–10) is a plus size.
  if (!base) return count === undefined || n > 10 ? undefined : n + 1.25;
  return inRange((base === 'S' ? -1 : 1) * (n + 1));
}

/** `Extra Extra Large`, `X-Large`, `XSmall`, `2X-Large`, `Klein`: "extra" words, then a base word. */
function wordRank(folded: string, vocab: Vocabulary, xs = 0, count?: number): number | undefined {
  if (xs > MAX_RANK) return undefined;
  const rest = folded.replace(/^[\s-]+/, '');
  const base = vocab.letterWords.get(rest);
  if (base && base !== 'X') {
    if (count !== undefined && xs !== 1) return undefined;
    const n = count ?? xs;
    if (base === 'M') return n === 0 ? 0 : undefined;
    return inRange((base === 'S' ? -1 : 1) * (n + 1));
  }
  for (const [word, letter] of vocab.letterWords) {
    if (letter !== 'X' || rest.length <= word.length || !rest.startsWith(word)) continue;
    const rank = wordRank(rest.slice(word.length), vocab, xs + 1, count);
    if (rank !== undefined) return rank;
  }
  return undefined;
}

/** One letter size or letter word. */
function singleRank(folded: string, vocab: Vocabulary): number | undefined {
  const rank = letterRank(folded);
  if (rank !== undefined) return rank;
  const count = COUNT.exec(folded)?.[1];
  return count ? wordRank(folded.slice(count.length), vocab, 0, Number(count)) : wordRank(folded, vocab);
}

/** One size, or the midpoint of a combined size: `S|M`, `XS/S`, `L-XL`, `Small/Medium`. */
function rankOf(folded: string, vocab: Vocabulary): number | undefined {
  const single = singleRank(folded, vocab);
  if (single !== undefined) return single;
  const [separator = SEPARATORS[1]] = SEPARATORS.filter((pattern) => pattern.test(folded));
  const parts = folded.split(separator as RegExp);
  if (parts.length !== 2) return undefined;
  const low = singleRank(parts[0] ?? '', vocab);
  const high = singleRank(parts[1] ?? '', vocab);
  return low === undefined || high === undefined ? undefined : (low + high) / 2;
}

const letter = (rank: number, variant: number): Reading => ({ system: 'letter', group: 'letter', key: [rank, variant] });

/** `XLT` = XL + tall, `MS` = M + short, `L Tall`: the longest letter size at the start, then a variant. */
function withVariant({ text, folded }: Label, vocab: Vocabulary): Reading[] {
  for (let end = folded.length - 1; end > 0; end--) {
    const rank = letterRank(folded.slice(0, end));
    if (rank === undefined) continue;
    const variant = variantRank(text.slice(end).trim(), vocab);
    // A plus size before a marker is its letter size: `2XB` is 2XL big.
    return variant === undefined ? [] : [letter(Math.floor(rank), variant)];
  }
  return [];
}

/** Bare `S`, `L`, `R`, `T`, `P` or a locale variant word: short −1, regular 0, long +1. */
function lengthRank(folded: string, vocab: Vocabulary): number | undefined {
  const word = vocab.variantWords.get(folded);
  const variant = folded.length === 1 && 'SLRTP'.includes(folded) ? MARKERS[folded] : word && VARIANT[word];
  return variant === undefined ? undefined : Math.sign(variant - VARIANT.regular);
}

/** Letter sizes `XS`…`10XL` with optional variants, plus sizes `nX`, combined sizes `S|M`, letter words and length words. */
export const parseLetter: Parser = (label, vocab) => {
  const rank = rankOf(label.folded, vocab);
  const readings = rank === undefined ? withVariant(label, vocab) : [letter(rank, VARIANT.none)];
  const length = lengthRank(label.folded, vocab);
  if (length !== undefined) readings.push({ system: 'lengthWord', group: 'letter', key: [length, VARIANT.none] });
  return readings;
};
