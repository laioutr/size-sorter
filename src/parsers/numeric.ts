import { cupPosition, MARKERS, variantRank } from './variant';
import type { Parser } from '../parse';
import type { Vocabulary } from '../vocabulary';
import { type Label, NUMBER_SOURCE, parseNumber } from '../normalize';
import { type Reading, type SizeSystem, VARIANT } from '../types';

/** Length unit → factor to cm. */
export const LENGTH_UNITS: Readonly<Record<string, number>> = { mm: 0.1, cm: 1, m: 100, in: 2.54, '"': 2.54 };

/** A number with an optional fraction: `42`, `37 1/3`, `42 2|3`. */
const VALUE = String.raw`${NUMBER_SOURCE}(?: \d[/|][2-48])?`;
const SPAN = String.raw`(${VALUE})(?:\s*[-–]\s*(${VALUE}))?`;
/** Lower-case `m` only: a capital `M` means months or medium. */
const UNIT = String.raw`([Mm][Mm]|[Cc][Mm]|m|[Ii][Nn]|")`;
/** A word before a height, with at most a 1–2 digit count: `YS`, `2JS`, `S–M:`. */
const HEAD = String.raw`\d{0,2}(?=[^\s\d]*\p{L})[^\s\d]+`;

const ZEROS = /^0{2,}$/;
const ONE_VALUE = new RegExp(String.raw`^(${NUMBER_SOURCE})(?: (\d)[/|]([2-48]))?$`);
const TWO_VALUES = [
  new RegExp(String.raw`^(${VALUE})\s*[-–]\s*(${VALUE})$`),
  new RegExp(String.raw`^(${VALUE})\s*/\s*(${VALUE})$`),
  new RegExp(String.raw`^W\s*(${NUMBER_SOURCE})\s*L\s*(${NUMBER_SOURCE})$`, 'i'),
];
const WITH_UNIT = new RegExp(String.raw`^${SPAN}\s*${UNIT}(?!\p{L})`, 'u');
const WITH_HEAD = new RegExp(String.raw`^${HEAD}(?:\s+${HEAD})?\s+${SPAN}(?:\s*${UNIT})?$`, 'u');
/** A number followed by a code (`42L`, `10 2E`, `70B`, `13.5C`) or, after a space, a word (`32 Long`). */
const SUFFIX = new RegExp(String.raw`^(${VALUE})(\s?)(\S+)$`);
const LEADING_NUMBER = new RegExp(String.raw`^(${NUMBER_SOURCE})\s*(.+)$`);

function readValue(value: string | undefined): number | undefined {
  const match = ONE_VALUE.exec(value ?? '');
  if (!match) return undefined;
  const [, number = '', numerator, denominator] = match;
  const n = parseNumber(number);
  if (n === undefined || numerator === undefined) return n;
  const fraction = Number(numerator) / Number(denominator);
  return fraction > 0 && fraction < 1 ? n + fraction : undefined;
}

const numeric = (system: SizeSystem, low: number, high = low, variant: number = VARIANT.none): Reading => ({
  system,
  group: 'numeric',
  key: [low, high, variant],
});

function reading(low: number | undefined, high: number | undefined = low, factor = 1): Reading[] {
  return low === undefined || high === undefined ? [] : [numeric('number', low * factor, high * factor)];
}

const isBand = (n: number) => Number.isInteger(n) && ((n >= 28 && n <= 48) || (n >= 60 && n <= 130));

/** Largest size of each kids' shoe series. `C`, `K` and toddler `T` count down from 14, youth `Y` counts up from 0. */
const SHOE_SERIES: Readonly<Record<string, number>> = { C: 13.5, K: 13.5, T: 13, Y: 7 };

function kidsShoe(n: number, series: string): number | undefined {
  const limit = SHOE_SERIES[series];
  if (limit === undefined || !(n <= limit)) return undefined;
  return series === 'Y' ? n : n - 14;
}

/** Readings of a number with a suffix: a variant, a bra cup or a kids' shoe series (spec 6.2, 7.1). */
function readSuffix(n: number, space: string, suffix: string, vocab: Vocabulary): Reading[] {
  const readings: Reading[] = [];
  // `B` after a number is always a cup, and `T` below 14 is a toddler or kids' shoe size.
  const variant = (space || Object.hasOwn(MARKERS, suffix)) && suffix !== 'B' && (suffix !== 'T' || n >= 14) && variantRank(suffix, vocab);
  if (variant) readings.push(numeric('number', n, n, variant));
  const cup = cupPosition(suffix);
  if (cup !== undefined && isBand(n)) readings.push(numeric('bra', n, n, VARIANT.cup + cup));
  const shoe = kidsShoe(n, suffix);
  if (shoe !== undefined) readings.push(numeric('kidsShoe', shoe));
  return readings;
}

function readSpan(match: RegExpExecArray): Reading[] {
  const [, low, high, unit] = match;
  return reading(readValue(low), high === undefined ? readValue(low) : readValue(high), unit ? LENGTH_UNITS[unit.toLowerCase()] : 1);
}

/** Numbers, fractions, ranges, pairs, `00`, lengths and heights after a size code (spec 7.1). */
export const parseNumeric: Parser = ({ text, folded }, vocab) => {
  // Girls' 6X is 6½ in a list of numbers (spec 5); the letter parser adds its plus-size reading.
  if (folded === '6X') return [numeric('number', 6.5)];
  if (ZEROS.test(text)) return reading(1 - text.length);
  const single = readValue(text);
  if (single !== undefined) return reading(single);
  for (const pattern of TWO_VALUES) {
    const match = pattern.exec(text);
    if (match) return reading(readValue(match[1]), readValue(match[2]));
  }
  const match = WITH_UNIT.exec(text) ?? WITH_HEAD.exec(text);
  if (match) return readSpan(match);
  const [, value = '', space = '', suffix = ''] = SUFFIX.exec(text) ?? [];
  // `00P` and `000P` keep the zero-size order.
  const n = ZEROS.test(value) ? 1 - value.length : readValue(value);
  return n === undefined ? [] : readSuffix(n, space, suffix, vocab);
};

/** A leading number followed by any other text: sorts by the number, then by the text. */
export function parseFallback(label: Label): Reading | undefined {
  const match = LEADING_NUMBER.exec(label.text);
  const n = parseNumber(match?.[1] ?? '');
  const text = match?.[2]?.trim();
  return n === undefined || !text ? undefined : { ...numeric('number', n, n, VARIANT.unknown), text };
}
