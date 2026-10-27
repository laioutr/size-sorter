import { compareEntries, type Entry, groupRanks, placement } from './compare';
import { toText } from './normalize';
import { parseLabel } from './parse';
import { resolveReadings } from './resolve';
import { compileVocabulary } from './vocabulary';
import type { SortOptions } from './types';

export type { LetterWord, SizeGroup, SizeLocale, SortOptions, UnknownPlacement } from './types';

/**
 * Sorts items by size and returns a new array. Ambiguous labels are read the way most of the
 * list can be read. Unknown values go last, alphabetically, unless `unknown` says otherwise.
 */
export function sortBySize<T extends string>(items: readonly T[], options?: SortOptions<T>): T[];
export function sortBySize<T>(items: readonly T[], options: SortOptions<T> & { by: (item: T) => string }): T[];
export function sortBySize<T>(items: readonly T[], options?: SortOptions<T> | null): T[] {
  // `?? ` rather than defaults, because JavaScript callers may pass null.
  const { by, locales, groupOrder, descending, unknown } = options ?? {};
  const vocab = compileVocabulary(locales ?? []);
  // Array.from visits the holes of sparse arrays, which map skips.
  const labels = Array.from(items, (item) => toText(by ? by(item) : item));
  const readings = resolveReadings(labels.map((label) => parseLabel(label, vocab)));
  const ranks = groupRanks(groupOrder ?? []);
  const place = placement(descending, unknown);
  return labels
    .map((raw, index) => ({ raw, reading: readings[index], order: index }))
    .sort((a, b) => compareEntries(a, b, ranks, place) || a.order - b.order)
    .map(({ order }) => items[order] as T);
}

/**
 * Builds a comparator for `Array.prototype.sort`. Ambiguous labels are resolved against `values`
 * once; any other string gets its default reading.
 */
export function createSizeComparator(
  values: readonly string[],
  options?: Omit<SortOptions<string>, 'by'> | null
): (a: string, b: string) => number {
  const { locales, groupOrder, descending, unknown } = options ?? {};
  const vocab = compileVocabulary(locales ?? []);
  const labels = Array.from(values, toText);
  const readings = resolveReadings(labels.map((label) => parseLabel(label, vocab)));
  // The first place of a label wins. Strings outside `values` share the last order, so they fall back to the collator.
  const cache = new Map<string, Entry>();
  labels.forEach((raw, order) => cache.has(raw) || cache.set(raw, { raw, reading: readings[order], order }));
  const ranks = groupRanks(groupOrder ?? []);
  const place = placement(descending, unknown);
  const entry = (value: string): Entry => {
    const raw = toText(value);
    let found = cache.get(raw);
    if (!found) cache.set(raw, (found = { raw, reading: parseLabel(raw, vocab)[0], order: labels.length }));
    return found;
  };
  return (a, b) => compareEntries(entry(a), entry(b), ranks, place);
}
