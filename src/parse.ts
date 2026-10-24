import { fold, type Label, normalizeLabel, toText } from './normalize';
import { parseAge } from './parsers/age';
import { parseBed } from './parsers/bed';
import { parseLetter } from './parsers/letter';
import { parseFallback, parseNumeric } from './parsers/numeric';
import { parseOneSize } from './parsers/oneSize';
import { parseQuantity } from './parsers/quantity';
import { parseSequence } from './parsers/sequence';
import { REGION_CODES, type Vocabulary } from './vocabulary';
import type { Reading } from './types';

export type Parser = (label: Label, vocab: Vocabulary) => Reading[];

const PARSERS: readonly Parser[] = [parseBed, parseAge, parseNumeric, parseLetter, parseSequence, parseQuantity];

/** What may follow a prefix: `.` or `:` plus optional whitespace, whitespace, or a digit. */
const AFTER_PREFIX = /^(?:[.:]\s*|\s+|(?=\d))/;

/** Number of characters of `text` whose folded form is `length` characters long. */
function textLength(text: string, length: number): number {
  let folded = 0;
  let index = 0;
  while (folded < length && index < text.length) folded += fold(text[index++] ?? '').length;
  return index;
}

/** Removes leading size prefixes and region codes (`Gr.`, `Size`, `EU`), as long as something follows. */
export function stripPrefixes(label: Label, vocab: Vocabulary): Label {
  let { text, folded } = label;
  for (let stripped = true; stripped;) {
    stripped = false;
    for (const prefix of vocab.prefixes) {
      if (!folded.startsWith(prefix)) continue;
      const separator = AFTER_PREFIX.exec(folded.slice(prefix.length))?.[0];
      if (separator === undefined || folded.length === prefix.length + separator.length) continue;
      text = text.slice(textLength(text, prefix.length) + separator.length);
      folded = folded.slice(prefix.length + separator.length);
      stripped = true;
      break;
    }
  }
  return { raw: label.raw, text, folded };
}

/** The part before the first ` (`, ` - `, ` – ` or ` / `: `XS (6-8)`, `Small - 42cm`, `Newborn / 0-3 months`. */
const ANNOTATED = /^(.+?) (?:\(|[-–/] )/;

/**
 * A label with two sizes in it (spec 7.1, 7.2):
 * - sorts by the part before a spaced separator or a bracket, when that part can be read
 * - sorts by the part before a single `/` when the part after it starts with a region code or
 *   is read in a different system: `US6/UK8`, `56/XXL`
 * - otherwise sorts between the two halves: `Full/Queen`
 */
function parseFirstPart(text: string, vocab: Vocabulary): readonly Reading[] {
  const annotated = ANNOTATED.exec(text)?.[1];
  const head = annotated === undefined ? [] : parseLabel(annotated, vocab);
  if (head.length > 0) return head;
  const parts = text.split('/');
  if (parts.length !== 2) return [];
  const [before = '', after = ''] = parts;
  const first = parseLabel(before, vocab);
  const [a] = first;
  const [b] = parseLabel(after, vocab);
  if (!a) return [];
  if (REGION_CODES.some((code) => normalizeLabel(after).folded.startsWith(code)) || b?.system !== a.system) return first;
  // Both halves in one system, like `Full/Queen`: the combined size sorts between them (spec 7.2).
  return a.key.length === b.key.length ? [{ ...a, key: a.key.map((value, index) => (value + (b.key[index] ?? value)) / 2) }] : [];
}

function readLabel(text: string, vocab: Vocabulary): readonly Reading[] {
  const label = normalizeLabel(text);
  if (!label.folded) return [];
  const oneSize = parseOneSize(label, vocab);
  if (oneSize.length > 0) return oneSize;
  const stripped = stripPrefixes(label, vocab);
  const readings = PARSERS.flatMap((parse) => parse(stripped, vocab));
  if (readings.length > 0) return readings;
  const parts = parseFirstPart(stripped.text, vocab);
  if (parts.length > 0) return parts;
  const fallback = parseFallback(stripped);
  return fallback ? [fallback] : [];
}

/** Labels cached per vocabulary before the cache starts over, so it can't grow without limit. */
const CACHE_LIMIT = 5000;

/**
 * Every reading of one label, in default order. Empty when the label is unknown.
 * Cached per vocabulary, because shops sort the same labels for every product.
 */
export function parseLabel(raw: unknown, vocab: Vocabulary): readonly Reading[] {
  const text = toText(raw);
  const { labels } = vocab;
  let readings = labels.get(text);
  if (!readings) {
    if (labels.size >= CACHE_LIMIT) labels.clear();
    readings = readLabel(text, vocab);
    labels.set(text, readings);
  }
  return readings;
}
