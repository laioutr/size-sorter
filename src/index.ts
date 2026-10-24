import { compareEntries, type Entry, groupRanks } from './compare';
import { toText } from './normalize';
import { parseLabel } from './parse';
import { resolveReadings } from './resolve';
import { compileVocabulary } from './vocabulary';
import type { Reading, SortOptions } from './types';

export type { LetterWord, SizeGroup, SizeLocale, SortOptions } from './types';

/**
 * Sorts items by size and returns a new array. Ambiguous labels are read the way most of the
 * list can be read. Unknown values go last, alphabetically.
 */
export function sortBySize(items: readonly string[], options?: SortOptions<string>): string[];
export function sortBySize<T>(items: readonly T[], options: SortOptions<T> & { by: (item: T) => string }): T[];
export function sortBySize<T>(items: readonly T[], options: SortOptions<T> = {}): T[] {
  const { by, locales = [], groupOrder, descending = false } = options;
  const vocab = compileVocabulary(locales);
  const labels = items.map((item) => toText(by ? by(item) : item));
  const readings = resolveReadings(labels.map((label) => parseLabel(label, vocab)));
  const ranks = groupRanks(groupOrder);
  return labels
    .map((raw, index) => ({ raw, reading: readings[index], index }))
    .sort((a, b) => compareEntries(a, b, ranks, descending) || a.index - b.index)
    .map(({ index }) => items[index] as T);
}

/**
 * Builds a comparator for `Array.prototype.sort`. Ambiguous labels are resolved against `values`
 * once; any other string gets its default reading.
 */
export function createSizeComparator(
  values: readonly string[],
  options: Omit<SortOptions<string>, 'by'> = {}
): (a: string, b: string) => number {
  const { locales = [], groupOrder, descending = false } = options;
  const vocab = compileVocabulary(locales);
  const labels = values.map(toText);
  const readings = resolveReadings(labels.map((label) => parseLabel(label, vocab)));
  const cache = new Map<string, Reading | undefined>();
  labels.forEach((label, index) => cache.set(label, readings[index]));
  const ranks = groupRanks(groupOrder);
  const entry = (value: string): Entry => {
    const raw = toText(value);
    if (!cache.has(raw)) cache.set(raw, parseLabel(raw, vocab)[0]);
    return { raw, reading: cache.get(raw) };
  };
  return (a, b) => compareEntries(entry(a), entry(b), ranks, descending);
}
