import type { Parser } from '../parse';
import { type Label, NUMBER_SOURCE, parseNumber } from '../normalize';
import { type Reading, VARIANT } from '../types';

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

function reading(low: number | undefined, high: number | undefined = low, factor = 1): Reading[] {
  if (low === undefined || high === undefined) return [];
  return [{ system: 'number', group: 'numeric', key: [low * factor, high * factor, VARIANT.none] }];
}

function readSpan(match: RegExpExecArray): Reading[] {
  const [, low, high, unit] = match;
  return reading(readValue(low), high === undefined ? readValue(low) : readValue(high), unit ? LENGTH_UNITS[unit.toLowerCase()] : 1);
}

/** Numbers, fractions, ranges, pairs, `00`, lengths and heights after a size code (spec 7.1). */
export const parseNumeric: Parser = ({ text }) => {
  if (ZEROS.test(text)) return reading(1 - text.length);
  const single = readValue(text);
  if (single !== undefined) return reading(single);
  for (const pattern of TWO_VALUES) {
    const match = pattern.exec(text);
    if (match) return reading(readValue(match[1]), readValue(match[2]));
  }
  const match = WITH_UNIT.exec(text) ?? WITH_HEAD.exec(text);
  return match ? readSpan(match) : [];
};

/** A leading number followed by any other text: sorts by the number, then by the text. */
export function parseFallback(label: Label): Reading | undefined {
  const match = LEADING_NUMBER.exec(label.text);
  const n = parseNumber(match?.[1] ?? '');
  const text = match?.[2]?.trim();
  return n === undefined || !text ? undefined : { system: 'number', group: 'numeric', key: [n, n, VARIANT.unknown], text };
}
