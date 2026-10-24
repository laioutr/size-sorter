import { fold, type Label, normalizeLabel } from './normalize';
import { parseLetter } from './parsers/letter';
import { parseFallback, parseNumeric } from './parsers/numeric';
import { parseOneSize } from './parsers/oneSize';
import type { Reading } from './types';
import type { Vocabulary } from './vocabulary';

export type Parser = (label: Label, vocab: Vocabulary) => Reading[];

const PARSERS: readonly Parser[] = [parseNumeric, parseLetter];

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

/** Every reading of one label, in default order. Empty when the label is unknown. */
export function parseLabel(raw: unknown, vocab: Vocabulary): Reading[] {
  const label = normalizeLabel(raw);
  if (!label.folded) return [];
  const oneSize = parseOneSize(label, vocab);
  if (oneSize.length > 0) return oneSize;
  const stripped = stripPrefixes(label, vocab);
  const readings = PARSERS.flatMap((parse) => parse(stripped, vocab));
  if (readings.length > 0) return readings;
  const fallback = parseFallback(stripped);
  return fallback ? [fallback] : [];
}
