import type { Parser } from '../parse';
import type { Vocabulary } from '../vocabulary';
import { VARIANT } from '../types';

const MAX_RANK = 11;
const LETTER = /^(?:(\d{1,2})X|(X*))([SL])$/;
const PLUS = /^(\d{1,2})X$/;
const COUNT = /^(\d{1,2})(?=X)/;
const SEPARATOR = /\s*[|/\-–]\s*/;

const inRange = (rank: number): number | undefined => (Math.abs(rank) <= MAX_RANK ? rank : undefined);

/**
 * Rank of one letter size: `M` = 0, `S` = −1, `XS` = −2, `L` = 1, `XL` = 2, … up to ±11.
 * A bare `nX` is a plus size just after `nXL`.
 */
export function letterRank(folded: string): number | undefined {
  if (folded === 'M') return 0;
  const letter = LETTER.exec(folded);
  if (letter) {
    const [, count, xs = '', base] = letter;
    const n = count === undefined ? xs.length : Number(count);
    if (count !== undefined && n < 1) return undefined;
    return inRange((base === 'S' ? -1 : 1) * (n + 1));
  }
  const plus = PLUS.exec(folded);
  const n = Number(plus?.[1]);
  return n >= 1 && n <= 10 ? n + 1.25 : undefined;
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

function rankOf(folded: string, vocab: Vocabulary): number | undefined {
  const single = letterRank(folded);
  if (single !== undefined) return single;
  const count = COUNT.exec(folded)?.[1];
  const word = count ? wordRank(folded.slice(count.length), vocab, 0, Number(count)) : wordRank(folded, vocab);
  if (word !== undefined) return word;
  const parts = folded.split(SEPARATOR);
  if (parts.length !== 2) return undefined;
  const low = letterRank(parts[0] ?? '');
  const high = letterRank(parts[1] ?? '');
  return low === undefined || high === undefined ? undefined : (low + high) / 2;
}

/** Letter sizes `XS`…`10XL`, plus sizes `nX`, combined sizes `S|M` and letter words. */
export const parseLetter: Parser = (label, vocab) => {
  const rank = rankOf(label.folded, vocab);
  return rank === undefined ? [] : [{ system: 'letter', group: 'letter', key: [rank, VARIANT.none] }];
};
